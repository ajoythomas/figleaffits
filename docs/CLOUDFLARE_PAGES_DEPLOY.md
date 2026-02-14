# Cloudflare Pages Deploy (Next.js with API routes)

Use this config in Cloudflare Pages project settings:

- Framework preset: `Next.js`
- Build command: `npm run pages:build`
- Build output directory: `.vercel/output/static`

Required environment variables:
- `GOOGLE_SHEETS_WEBHOOK_URL`

Why this works:
- `next build` outputs `.next` only.
- Cloudflare Pages expects `.vercel/output/static` when using Next.js SSR/API routes.
- `@cloudflare/next-on-pages` generates `.vercel/output/*` for Pages.
