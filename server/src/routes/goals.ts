import { Router, Request, Response } from 'express';
import { db } from '../db';
import { ResultSet } from '@libsql/client';

const router = Router();

// GET /api/goals
router.get('/', async (_req: Request, res: Response) => {
    try {
        const result: ResultSet = await db.execute('SELECT * FROM goals ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/goals
router.post('/', async (req: Request, res: Response) => {
    const { name, target_amount } = req.body;
    if (!name || !target_amount) {
        res.status(400).json({ error: 'Name and target amount required' });
        return;
    }

    try {
        const result = await db.execute({
            sql: 'INSERT INTO goals (name, target_amount) VALUES (?, ?)',
            args: [String(name), Number(target_amount)]
        });
        res.status(201).json({ id: result.lastInsertRowid?.toString(), name, target_amount });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/goals/:id
router.put('/:id', async (req: Request, res: Response) => {
    const { name, target_amount } = req.body;
    try {
        const result = await db.execute({
            sql: 'UPDATE goals SET name = COALESCE(?, name), target_amount = COALESCE(?, target_amount) WHERE id = ?',
            args: [
                name !== undefined ? String(name) : null,
                target_amount !== undefined ? Number(target_amount) : null,
                String(req.params.id)
            ]
        });
        if (result.rowsAffected === 0) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        const goal = await db.execute({
            sql: 'SELECT * FROM goals WHERE id = ?',
            args: [String(req.params.id)]
        });
        res.json(goal.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const result = await db.execute({
            sql: 'DELETE FROM goals WHERE id = ?',
            args: [String(req.params.id)]
        });
        if (result.rowsAffected === 0) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
