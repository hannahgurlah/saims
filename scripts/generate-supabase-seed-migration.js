const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const ROOT_DIR = path.join(__dirname, "..");
const SQLITE_DB_PATH = path.join(ROOT_DIR, "database", "landahan.db");
const MIGRATIONS_DIR = path.join(ROOT_DIR, "supabase", "migrations");
const OUTPUT_PATH = path.join(MIGRATIONS_DIR, "20260420221000_seed_landahan_data.sql");

function escapeSqlString(value) {
  return String(value).replace(/'/g, "''");
}

function toSql(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  if (typeof value === "string") {
    return `'${escapeSqlString(value)}'`;
  }

  return `'${escapeSqlString(JSON.stringify(value))}'`;
}

function buildInsert(tableName, columns, rows, conflictColumns = []) {
  if (!rows.length) {
    return `-- No rows for ${tableName}\n`;
  }

  const values = rows
    .map((row) => `  (${columns.map((column) => toSql(row[column])).join(", ")})`)
    .join(",\n");

  const conflictClause = conflictColumns.length
    ? `\nON CONFLICT (${conflictColumns.join(", ")}) DO NOTHING`
    : "";

  return `INSERT INTO ${tableName} (\n  ${columns.join(",\n  ")}\n) VALUES\n${values}${conflictClause};\n`;
}

function main() {
  const db = new DatabaseSync(SQLITE_DB_PATH, { readOnly: true });

  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });

  const teachers = db.prepare("SELECT * FROM teachers ORDER BY last_name, first_name").all();
  const inventoryItems = db.prepare("SELECT * FROM inventory_items ORDER BY created_at, name").all();
  const stockMovements = db.prepare("SELECT * FROM stock_movements ORDER BY created_at").all();

  const teacherColumns = [
    "id",
    "last_name",
    "first_name",
    "middle_name",
    "suffix_name",
    "department",
    "current_position",
    "email",
    "date_of_birth",
    "date_hired_toledo",
    "date_hired_government",
    "gsis_number",
    "philhealth_number",
    "tin_number",
    "pagibig_number",
    "sss_number",
    "civil_status",
    "gender",
    "created_at",
    "updated_at",
  ];

  const inventoryColumns = [
    "id",
    "name",
    "category",
    "description",
    "asset_tag",
    "quantity",
    "quantity_per_property_card",
    "quantity_per_physical_count",
    "usable_count",
    "non_usable_count",
    "unit_of_measurement",
    "amount",
    "uacs_code",
    "fund_cluster_code",
    "ics_number_source",
    "ics_number_distribute",
    "reference_number",
    "asset_type",
    "acquired_type",
    "acquired_details",
    "location",
    "status",
    "assigned_teacher_id",
    "assigned_date",
    "notes",
    "created_at",
    "updated_at",
  ];

  const movementColumns = [
    "id",
    "inventory_item_id",
    "movement_type",
    "quantity",
    "movement_date",
    "personnel_name",
    "remarks",
    "created_at",
  ];

  const sql = [
    "-- Generated from database/landahan.db",
    "BEGIN;",
    buildInsert("teachers", teacherColumns, teachers, ["id"]),
    buildInsert("inventory_items", inventoryColumns, inventoryItems, ["id"]),
    buildInsert("stock_movements", movementColumns, stockMovements, ["id"]),
    "COMMIT;",
    "",
  ].join("\n");

  fs.writeFileSync(OUTPUT_PATH, sql, "utf8");
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main();
