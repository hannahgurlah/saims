# Landahan Inventory

This project is now structured for Vercel deployment:

- Next.js serves the app and API routes
- the existing frontend screens are served as static assets
- `/api/*` requests go through a Next.js route handler
- local development uses SQLite
- production uses Supabase

## Environment variables

### Local development

Local development uses the SQLite database at `database/saims.db` by default:

```bash
APP_DATABASE=local
npm run dev
```

### Production

Set these in Vercel:

- `APP_DATABASE=supabase`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`

To email newly created users, also set:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (a verified sender, for example `SAIMS <notifications@your-domain.com>`)
- `APP_URL=https://saims.depedregion7.com/login.html`

The notification includes the user's username and login link. Temporary passwords are not included in email.

## Deploy on Vercel

1. Create or link the Supabase project.
2. Add the Supabase environment variables to the Vercel project.
3. Redeploy the project.

## Import the current SQLite data

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```
