const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { Pool } = require("pg");

const ROOT_DIR = path.join(__dirname, "..");
const SQLITE_DB_PATH = path.join(ROOT_DIR, "database", "saims.db");
const POSTGRES_SCHEMA_PATH = path.join(ROOT_DIR, "database", "postgres-schema.sql");

function getConnectionString() {
  return process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
}

function buildPool() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error("Missing POSTGRES_URL. Set it before running the migration script.");
  }

  const options = { connectionString };

  if (!/localhost|127\.0\.0\.1/.test(connectionString) && !/sslmode=disable/i.test(connectionString)) {
    options.ssl = { rejectUnauthorized: false };
  }

  return new Pool(options);
}

function coerceTimestamp(value) {
  return value || new Date().toISOString();
}

async function main() {
  const sqlite = new DatabaseSync(SQLITE_DB_PATH, { readOnly: true });
  const pool = buildPool();
  const client = await pool.connect();

  try {
    const schemaSql = fs.readFileSync(POSTGRES_SCHEMA_PATH, "utf8");
    await client.query(schemaSql);
    await client.query("BEGIN");

    await client.query("TRUNCATE TABLE stock_movements, inventory_items, teachers RESTART IDENTITY CASCADE");

    const teachers = sqlite.prepare("SELECT * FROM teachers ORDER BY last_name, first_name").all();
    for (const teacher of teachers) {
      await client.query(
        `
          INSERT INTO teachers (
            id,
            last_name,
            first_name,
            middle_name,
            suffix_name,
            department,
            current_position,
            email,
            date_of_birth,
            date_hired_toledo,
            date_hired_government,
            gsis_number,
            philhealth_number,
            tin_number,
            pagibig_number,
            sss_number,
            civil_status,
            gender,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
          )
        `,
        [
          teacher.id,
          teacher.last_name,
          teacher.first_name,
          teacher.middle_name || "",
          teacher.suffix_name || "",
          teacher.department,
          teacher.current_position,
          teacher.email || "",
          teacher.date_of_birth || null,
          teacher.date_hired_toledo || null,
          teacher.date_hired_government || null,
          teacher.gsis_number || "",
          teacher.philhealth_number || "",
          teacher.tin_number || "",
          teacher.pagibig_number || "",
          teacher.sss_number || "",
          teacher.civil_status,
          teacher.gender,
          coerceTimestamp(teacher.created_at),
          coerceTimestamp(teacher.updated_at),
        ],
      );
    }

    const inventoryItems = sqlite.prepare("SELECT * FROM inventory_items ORDER BY created_at, name").all();
    for (const item of inventoryItems) {
      await client.query(
        `
          INSERT INTO inventory_items (
            id,
            name,
            category,
            description,
            asset_tag,
            quantity,
            quantity_per_property_card,
            quantity_per_physical_count,
            usable_count,
            non_usable_count,
            unit_of_measurement,
            amount,
            uacs_code,
            fund_cluster_code,
            ics_number_source,
            ics_number_distribute,
            reference_number,
            asset_type,
            acquired_type,
            acquired_details,
            location,
            status,
            assigned_teacher_id,
            assigned_date,
            notes,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27
          )
        `,
        [
          item.id,
          item.name,
          item.category,
          item.description || "",
          item.asset_tag,
          item.quantity,
          item.quantity_per_property_card || 0,
          item.quantity_per_physical_count || 0,
          item.usable_count || 0,
          item.non_usable_count || 0,
          item.unit_of_measurement || "piece",
          item.amount,
          item.uacs_code,
          item.fund_cluster_code,
          item.ics_number_source || "",
          item.ics_number_distribute || "",
          item.reference_number || "",
          item.asset_type,
          item.acquired_type || "Not Applicable",
          item.acquired_details || "",
          item.location,
          item.status,
          item.assigned_teacher_id || null,
          item.assigned_date || null,
          item.notes || "",
          coerceTimestamp(item.created_at),
          coerceTimestamp(item.updated_at),
        ],
      );
    }

    const stockMovements = sqlite.prepare("SELECT * FROM stock_movements ORDER BY created_at").all();
    for (const movement of stockMovements) {
      await client.query(
        `
          INSERT INTO stock_movements (
            id,
            inventory_item_id,
            movement_type,
            quantity,
            movement_date,
            personnel_name,
            remarks,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          movement.id,
          movement.inventory_item_id,
          movement.movement_type,
          movement.quantity,
          movement.movement_date,
          movement.personnel_name || "",
          movement.remarks || "",
          coerceTimestamp(movement.created_at),
        ],
      );
    }

    await client.query("COMMIT");
    console.log(`Migrated ${teachers.length} teachers, ${inventoryItems.length} inventory items, and ${stockMovements.length} stock movements.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
