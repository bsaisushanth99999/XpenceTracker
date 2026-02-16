import app from '../server/src/index';
import { initDB } from '../server/src/db';

let initialized = false;

// Vercel Serverless Function handler
export default async (req: any, res: any) => {
    try {
        // Vercel rewrites preserve the original path in req.url
        // The rewrite sends /api/(.*) to this function, so req.url should be /api/transactions/...
        const originalUrl = req.url || req.path || '';
        
        console.log(`[Vercel Handler] ${req.method} ${originalUrl}`);
        console.log(`[Vercel Handler] Original req.url:`, req.url);
        console.log(`[Vercel Handler] Original req.path:`, req.path);
        
        // Ensure path starts with /api for Express routing
        // With the rewrite rule, req.url should already include /api, but ensure it does
        if (!originalUrl.startsWith('/api')) {
            req.url = `/api${originalUrl.startsWith('/') ? originalUrl : '/' + originalUrl}`;
            console.log(`[Vercel Handler] Adjusted URL to: ${req.url}`);
        }
        
        // Initialize database on cold start
        if (!initialized) {
            console.log('[Vercel Handler] Cold start: Initializing database...');
            try {
                await initDB();
                initialized = true;
                console.log('[Vercel Handler] Database initialized successfully');
            } catch (err) {
                console.error('[Vercel Handler] Failed to initialize database:', err);
                if (!res.headersSent) {
                    res.status(500).json({ 
                        error: 'Database initialization failed', 
                        details: err instanceof Error ? err.message : String(err) 
                    });
                }
                return;
            }
        }
        
        // Handle the request with Express app
        // Vercel's req/res are compatible with Express
        app(req, res);
    } catch (error) {
        console.error('[Vercel Handler] Unhandled error:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : String(error)
            });
        }
    }
};
