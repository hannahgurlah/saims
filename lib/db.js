const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const ROOT_DIR = path.join(__dirname, "..");
const POSTGRES_SCHEMA_PATH = path.join(ROOT_DIR, "database", "postgres-schema.sql");

function getConnectionString() {
  return process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
}

function isLocalConnection(connectionString) {
  try {
    const parsed = new URL(connectionString);
    return ["localhost", "127.0.0.1"].includes(parsed.hostname);
  } catch (error) {
    return false;
  }
}

function buildPool() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error("Missing POSTGRES_URL. Set POSTGRES_URL or POSTGRES_URL_NON_POOLING before starting the app.");
  }

  const options = {
    connectionString,
    max: 5,
  };

  if (!isLocalConnection(connectionString) && !/sslmode=disable/i.test(connectionString)) {
    options.ssl = { rejectUnauthorized: false };
  }

  return new Pool(options);
}

function getPool() {
  if (!globalThis.__landahanPool) {
    globalThis.__landahanPool = buildPool();
  }

  return globalThis.__landahanPool;
}

async function ensureDatabase() {
  if (!globalThis.__landahanSchemaPromise) {
    globalThis.__landahanSchemaPromise = (async () => {
      const schemaSql = fs.readFileSync(POSTGRES_SCHEMA_PATH, "utf8");
      await getPool().query(schemaSql);
    })();
  }

  return globalThis.__landahanSchemaPromise;
}

async function withTransaction(callback) {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  ROOT_DIR,
  ensureDatabase,
  getPool,
  withTransaction,
};
