# Cloudflare Worker Deploy (OpenNext)

Use this when deploying from the "Create a Worker" flow where both Build and Deploy commands are required.

## Commands for Cloudflare UI
- Build command: `npm run cf:build`
- Deploy command: `npm run cf:deploy`

## Required files already added
- `wrangler.jsonc`
- `package.json` scripts `cf:build` and `cf:deploy`

## Environment variables in Cloudflare
Set in Worker/Project settings:
- `GOOGLE_SHEETS_WEBHOOK_URL`

## Notes
- This flow builds a Worker entrypoint at `.open-next/worker.js`.
- Wrangler deploy then uploads the Worker + static assets from `.open-next/assets`.
