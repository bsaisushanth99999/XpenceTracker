# Fixing @libsql/linux-x64-gnu Module Not Found Error in Vercel

## Problem
Vercel serverless functions crash with: `Cannot find module '@libsql/linux-x64-gnu'`

## Root Cause
`@libsql/client` requires platform-specific native binaries. In Vercel's Linux x64 environment, it needs `@libsql/linux-x64-gnu`, but this optional dependency isn't being bundled correctly in monorepo setups.

## Fixes Applied

1. **Removed explicit dependency** (it was causing build failures):
   - Removed `"@libsql/linux-x64-gnu": "^0.17.0"` from both `server/package.json` and root `package.json`
   - The version `0.17.0` doesn't exist for this package (latest is `0.5.22`)
   - `@libsql/client` automatically installs the correct platform-specific package as an optional dependency

2. **Updated Vercel install command**:
   - Changed to `npm install --include=optional`
   - Ensures optional dependencies (like platform-specific binaries) are installed during build
   - The `@libsql/client` package will automatically pull in `@libsql/linux-x64-gnu` for Vercel's Linux x64 environment

## Next Steps

1. **Push changes and redeploy**:
   ```bash
   git add .
   git commit -m "Fix LibSQL platform-specific dependency for Vercel"
   git push
   ```

2. **Verify in Vercel**:
   - Check that the deployment succeeds
   - Test `/api/health` endpoint
   - Check Function Logs to ensure no module errors

## If Still Failing

If the error persists, try:

1. **Check Vercel Build Logs**: Ensure `@libsql/linux-x64-gnu` is being installed
2. **Verify Environment Variables**: Ensure `LIBSQL_URL` and `LIBSQL_AUTH_TOKEN` are set
3. **Check Node Version**: Vercel should use Node 18+ (LibSQL requires it)

## Alternative Solution (if above doesn't work)

If the monorepo structure continues to cause issues, consider:
- Moving the API function to the root level (outside workspaces)
- Using Vercel's "Include files outside root directory" setting
- Or restructuring to ensure dependencies are hoisted correctly
