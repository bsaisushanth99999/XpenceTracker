import app from '../server/src/index';
import { initDB } from '../server/src/db';

let initialized = false;

// Vercel Serverless Function handler
export default async (req: any, res: any) => {
    try {
        // Vercel rewrites preserve the original path in req.url
        const originalUrl = req.url || req.path || '';
        
        console.log(`[Vercel Handler] ${req.method} ${originalUrl}`);
        
        // Ensure path starts with /api for Express routing
        if (!originalUrl.startsWith('/api')) {
            req.url = `/api${originalUrl.startsWith('/') ? originalUrl : '/' + originalUrl}`;
        }
        
        // Initialize database on cold start
        if (!initialized) {
            console.log('[Vercel Handler] Cold start: Initializing database...');
            try {
                await initDB();
                initialized = true;
                console.log('[Vercel Handler] Database initialized successfully');
            } catch (err) {
                console.error('[Vercel Handler] Database init error:', err);
                const errorMessage = err instanceof Error ? err.message : String(err);
                const errorStack = err instanceof Error ? err.stack : 'No stack';
                console.error('[Vercel Handler] Full error:', {
                    message: errorMessage,
                    stack: errorStack,
                    env: {
                        hasLibsqlUrl: !!process.env.LIBSQL_URL,
                        hasLibsqlToken: !!process.env.LIBSQL_AUTH_TOKEN,
                        vercel: !!process.env.VERCEL
                    }
                });
                
                if (!res.headersSent) {
                    res.status(500).json({ 
                        error: 'Database initialization failed', 
                        details: errorMessage,
                        hint: process.env.VERCEL && !process.env.LIBSQL_URL 
                            ? 'LIBSQL_URL environment variable is required' 
                            : 'Check Vercel logs for details'
                    });
                }
                return;
            }
        }
        
        // Handle the request with Express app
        // Vercel's req/res objects are compatible with Express
        app(req, res);
    } catch (error) {
        console.error('[Vercel Handler] Unhandled error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : 'No stack';
        console.error('[Vercel Handler] Error stack:', errorStack);
        
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Internal server error',
                details: errorMessage
            });
        }
    }
};
