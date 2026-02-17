import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/income/total - Get sum of all budgeted incomes
router.get('/total', async (_req: Request, res: Response) => {
    try {
        const result = await db.execute('SELECT SUM(amount) as total FROM monthly_income');
        res.json({ total: result.rows[0]?.total || 0 });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/income/:month - Get budgeted income for a specific month
// Falls back to the most recent previous month's income if not set
router.get('/:month', async (req: Request, res: Response) => {
    try {
        const result = await db.execute({
            sql: 'SELECT * FROM monthly_income WHERE month = ?',
            args: [String(req.params.month)]
        });
        if (result.rows[0]) {
            res.json(result.rows[0]);
        } else {
            // Auto-carry-forward: find the most recent PREVIOUS month's income
            const fallback = await db.execute({
                sql: 'SELECT * FROM monthly_income WHERE month < ? ORDER BY month DESC LIMIT 1',
                args: [String(req.params.month)]
            });
            res.json(fallback.rows[0] || null);
        }
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/income - Get current month's budgeted income
router.get('/', async (_req: Request, res: Response) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    try {
        const result = await db.execute({
            sql: 'SELECT * FROM monthly_income WHERE month = ?',
            args: [currentMonth]
        });
        res.json(result.rows[0] || null);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/income - Set/Update budgeted income
router.post('/', async (req: Request, res: Response) => {
    const { month, amount } = req.body;
    if (!month || amount === undefined) {
        res.status(400).json({ error: 'Month and amount are required' });
        return;
    }

    try {
        await db.execute({
            sql: `INSERT INTO monthly_income (month, amount) VALUES (?, ?)
            ON CONFLICT(month) DO UPDATE SET amount = excluded.amount, created_at = datetime('now')`,
            args: [String(month), Number(amount)]
        });
        res.json({ success: true, month, amount });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
