# Database

This folder now contains both the legacy SQLite files and the new PostgreSQL schema used for Vercel deployment.

Files:
- `schema.sql`: Legacy SQLite schema
- `seed.sql`: Legacy SQLite seed data
- `landahan.db`: Local SQLite snapshot and migration source
- `postgres-schema.sql`: PostgreSQL schema used by the Vercel-ready API

Useful commands:

```bash
sqlite3 database/landahan.db "SELECT * FROM inventory_listing;"
npm run migrate:postgres
```

The deployed app uses PostgreSQL through the shared backend modules in `lib/` and the serverless entry point in `api/router.js`.
