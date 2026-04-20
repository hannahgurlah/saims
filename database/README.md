# Database

This folder contains the SQLite database setup for the school inventory system.

Files:
- `schema.sql`: Creates the `teachers` and `inventory_items` tables plus the `inventory_listing` view.
- `seed.sql`: Inserts sample teachers and inventory records.
- `landahan.db`: Generated SQLite database file.

The app now uses this database through the local Node server in `/server.js`.

Useful commands:

```bash
sqlite3 database/landahan.db < database/schema.sql
sqlite3 database/landahan.db < database/seed.sql
sqlite3 database/landahan.db "SELECT * FROM inventory_listing;"
npm start
```
