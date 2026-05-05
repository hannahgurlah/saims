# Landahan Inventory

This project is now structured for Vercel deployment:

- static frontend pages are served directly
- `/api/*` requests go through a Vercel serverless function
- PostgreSQL is the deployment database

## Environment variables

Set one of these:

- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `DATABASE_URL`

If your provider gives both pooled and direct connection strings, use `POSTGRES_URL_NON_POOLING` for the app.

## Deploy on Vercel

1. Add a hosted PostgreSQL database to the Vercel project.
2. Add the database connection string to the Vercel environment variables.
3. Redeploy the project.

The API will create the needed tables automatically from `database/postgres-schema.sql`.

## Import the current SQLite data

1. Install dependencies:

```bash
npm install
```

2. Set your Postgres connection string:

```bash
export POSTGRES_URL="your-postgres-connection-string"
```

3. Run the migration:

```bash
npm run migrate:postgres
```

That imports personnel, inventory items, and stock movement history from `database/landahan.db`.

## Local development

This app can still run locally with the new backend:

```bash
npm start
```

Make sure your Postgres connection string is available in the shell first.
