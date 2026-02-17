import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../db';
import { parseCSV } from '../utils/csv-parser';
import { generateFingerprint } from '../utils/fingerprint';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Build WHERE clause from filter params
function buildFilterQuery(query: Record<string, any>): {
    where: string;
    params: (string | number)[];
} {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (query.dateFrom) {
        conditions.push('date >= ?');
        params.push(String(query.dateFrom));
    }
    if (query.dateTo) {
        conditions.push('date <= ?');
        params.push(String(query.dateTo));
    }
    if (query.categories) {
        const catStr = String(query.categories);
        const cats = catStr.split(',').map((c) => c.trim());
        // In LibSQL/SQLite, IN (?, ?) works
        conditions.push(`category IN (${cats.map(() => '?').join(',')})`);
        params.push(...cats);
    }
    if (query.type && query.type !== 'all') {
        conditions.push('type = ?');
        params.push(String(query.type));
    }
    if (query.minAmount) {
        conditions.push('amount >= ?');
        params.push(parseFloat(String(query.minAmount)));
    }
    if (query.maxAmount) {
        conditions.push('amount <= ?');
        params.push(parseFloat(String(query.maxAmount)));
    }
    if (query.search) {
        conditions.push('(description LIKE ? OR notes LIKE ?)');
        const term = `%${String(query.search)}%`;
        params.push(term, term);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { where, params };
}

// GET /api/transactions — list filtered transactions
router.get('/', async (req: Request, res: Response) => {
    try {
        const { where, params } = buildFilterQuery(req.query);
        const result = await db.execute({
            sql: `SELECT * FROM transactions ${where} ORDER BY date DESC, id DESC`,
            args: params
        });
        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/transactions/summary — filtered totals
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const { where, params } = buildFilterQuery(req.query);
        const incomeRes = await db.execute({
            sql: `SELECT COALESCE(SUM(amount), 0) as total FROM transactions ${where} ${where ? 'AND' : 'WHERE'} type = 'income'`,
            args: params
        });
        const expenseRes = await db.execute({
            sql: `SELECT COALESCE(SUM(amount), 0) as total FROM transactions ${where} ${where ? 'AND' : 'WHERE'} type = 'expense'`,
            args: params
        });

        const totalIncome = incomeRes.rows[0]?.total as number || 0;
        const totalExpenses = expenseRes.rows[0]?.total as number || 0;

        res.json({
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/transactions/by-category
router.get('/by-category', async (req: Request, res: Response) => {
    try {
        const { where, params } = buildFilterQuery(req.query);
        const result = await db.execute({
            sql: `SELECT category, SUM(amount) as total, type FROM transactions ${where} GROUP BY category, type ORDER BY total DESC`,
            args: params
        });
        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/transactions/over-time
router.get('/over-time', async (req: Request, res: Response) => {
    try {
        const { where, params } = buildFilterQuery(req.query);
        const result = await db.execute({
            sql: `SELECT date,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
                FROM transactions ${where}
                GROUP BY date
                ORDER BY date ASC`,
            args: params
        });
        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/transactions/months — list distinct months for filtering
router.get('/months', async (_req: Request, res: Response) => {
    try {
        const result = await db.execute("SELECT DISTINCT substr(date, 1, 7) as month FROM transactions ORDER BY month DESC");
        res.json(result.rows.map((r: any) => r.month));
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/transactions/categories
router.get('/categories', async (_req: Request, res: Response) => {
    try {
        const result = await db.execute('SELECT DISTINCT category FROM transactions ORDER BY category ASC');
        // result.rows is array of objects { category: 'Food' }
        res.json(result.rows.map((r: any) => r.category));
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/transactions/upload
router.post(
    '/upload',
    upload.single('file'),
    async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No file uploaded. Field name must be "file".' });
                return;
            }

            const rows = parseCSV(req.file.buffer);
            let rowsInserted = 0;
            let duplicatesSkipped = 0;

            // Use a transaction for bulk insert
            // LibSQL supports batch/transaction
            const transaction = await db.transaction('write');
            try {
                for (const row of rows) {
                    const fp = generateFingerprint(row.date, row.amount, row.description, row.type);

                    // LibSQL doesn't return changes count directly from execute efficiently in loop? 
                    // Actually it does in ResultSet: rowsAffected.
                    const result = await transaction.execute({
                        sql: `INSERT OR IGNORE INTO transactions (date, amount, category, description, notes, type, fingerprint)
                              VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        args: [
                            String(row.date),
                            Number(row.amount),
                            String(row.category),
                            String(row.description),
                            String(row.notes || ''),
                            String(row.type),
                            String(fp)
                        ]
                    });

                    if (result.rowsAffected > 0) {
                        rowsInserted++;
                    } else {
                        // Check if it was a duplicate?
                        // If INSERT OR IGNORE ignored it, rowsAffected is 0.
                        // But verifying if it was skipped due to constraint vs other error?
                        // We assume skipped.
                        // To be precise we could count properly.
                        duplicatesSkipped++;
                    }
                }
                await transaction.commit();
            } catch (err) {
                await transaction.rollback();
                throw err;
            }

            res.json({
                rowsProcessed: rows.length,
                rowsInserted,
                duplicatesSkipped,
            });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
);

// DELETE /api/transactions/:id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const result = await db.execute({
            sql: 'DELETE FROM transactions WHERE id = ?',
            args: [String(req.params.id)]
        });
        if (result.rowsAffected === 0) {
            res.status(404).json({ error: 'Transaction not found' });
            return;
        }
        res.json({ success: true });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/transactions (CLEAR ALL)
router.delete('/', async (req: Request, res: Response) => {
    try {
        await db.execute('DELETE FROM transactions');
        // await db.execute('DELETE FROM monthly_income'); 
        res.json({ success: true, message: 'All transactions cleared' });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
