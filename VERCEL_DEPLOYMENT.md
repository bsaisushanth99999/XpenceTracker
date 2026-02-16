# Deploying XpenceTracker to Vercel

## Critical: Root Directory

**The backend will not run if the wrong root is used.**

1. In the [Vercel dashboard](https://vercel.com), open your project → **Settings** → **General**.
2. Under **Root Directory**, leave it **empty** or set to **`.`** (repository root).
3. Do **not** set Root Directory to `client`. If it is set to `client`, only the frontend is deployed and all `/api/*` requests will 404.

## Build and output

- **Build Command:** `npm run build` (builds the client and copies output to `dist`)
- **Output Directory:** `dist`
- **Install:** From repo root so `client` and `server` workspaces (and the `api` folder) are all available.

## Environment variables

Set these in **Project → Settings → Environment Variables**:

- `LIBSQL_URL` – Turso database URL (e.g. `libsql://your-db.turso.io`)
- `LIBSQL_AUTH_TOKEN` – Turso auth token (if your DB uses it)

## Check that the backend is deployed

After deploying:

1. **Functions:** Project → **Deployments** → latest deployment → **Functions**. You should see `api/index.ts` listed.
2. **Health check:** Open `https://your-app.vercel.app/api/health`. You should get JSON: `{"status":"ok","timestamp":"..."}`.

If **Functions** is empty or `/api/health` returns 404, the backend is not deployed; fix **Root Directory** as above and redeploy.
