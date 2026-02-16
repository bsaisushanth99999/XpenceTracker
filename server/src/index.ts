import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDB } from './db';
import transactionsRouter from './routes/transactions';
import goalsRouter from './routes/goals';
import incomeRouter from './routes/income';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/income', incomeRouter);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend files (ONLY if not on Vercel)
if (!process.env.VERCEL) {
    const clientDistPath = path.join(__dirname, '../../client/dist');
    app.use(express.static(clientDistPath));

    // Catch-all route to serve index.html for client-side routing
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            res.status(404).json({ error: 'API endpoint not found' });
            return;
        }
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
}

// Initialize DB (Safe for both local and Turso)
initDB().catch(err => {
    console.error('Failed to initialize database:', err);
});

// Start server if not in Vercel (Serverless) mode
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
