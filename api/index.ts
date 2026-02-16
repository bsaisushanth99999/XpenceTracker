import app from '../server/src/index';
import { initDB } from '../server/src/db';

let initialized = false;

// Vercel Serverless Function handler with explicit initialization
export default async (req: any, res: any) => {
    if (!initialized) {
        console.log('Serverless cold start: Initializing database...');
        try {
            await initDB();
            initialized = true;
            console.log('Database initialized successfully');
        } catch (err) {
            console.error('Failed to initialize database during cold start:', err);
            // We don't return here so that app might still try to handle it (or return 500)
        }
    }
    return app(req, res);
};
