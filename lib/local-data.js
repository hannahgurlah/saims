const { execFile } = require("node:child_process");
const path = require("node:path");
const { promisify } = require("node:util");
const { randomUUID } = require("node:crypto");

const execFileAsync = promisify(execFile);
const SQLITE_DB_PATH = process.env.LOCAL_DATABASE_PATH || path.join(process.cwd(), "database", "saims.db");

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

function nullable(value) {
  return value ? value : null;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sqlValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  return `'${String(value).replaceAll("'", "''")}'`;
}

async function runSql(sql, json = false) {
  const args = json ? ["-json", SQLITE_DB_PATH, sql] : [SQLITE_DB_PATH, sql];

  try {
    const { stdout } = await execFileAsync("sqlite3", args, { maxBuffer: 1024 * 1024 * 10 });
    return json ? JSON.parse(stdout || "[]") : null;
  } catch (error) {
    throw new HttpError(500, error.stderr || error.message || "Unable to load local database");
  }
}

async function select(sql) {
  return runSql(sql, true);
}

async function exec(sql) {
  await runSql(sql, false);
}

function mapTeacherRow(row) {
  return {
    id: row.id,
    lastName: row.last_name,
    firstName: row.first_name,
    middleName: row.middle_name,
    suffixName: row.suffix_name,
    schoolName: row.school_name || "Landahan Elementary School",
    department: row.department,
    currentPosition: row.current_position,
    email: row.email,
    dateOfBirth: row.date_of_birth || "",
    dateHiredToledo: row.date_hired_toledo || "",
    dateHiredGovernment: row.date_hired_government || "",
    gsisNumber: row.gsis_number,
    philhealthNumber: row.philhealth_number,
    tinNumber: row.tin_number,
    pagibigNumber: row.pagibig_number,
    sssNumber: row.sss_number,
    civilStatus: row.civil_status,
    gender: row.gender,
  };
}

function mapInventoryRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description || "",
    schoolName: row.school_name || "Landahan Elementary School",
    assetTag: row.asset_tag,
    quantity: toNumber(row.quantity),
    quantityPerPropertyCard: toNumber(row.quantity_per_property_card),
    quantityPerPhysicalCount: toNumber(row.quantity_per_physical_count),
    usableCount: toNumber(row.usable_count),
    nonUsableCount: toNumber(row.non_usable_count),
    unitOfMeasurement: row.unit_of_measurement,
    amount: toNumber(row.amount),
    uacsCode: row.uacs_code,
    fundClusterCode: row.fund_cluster_code,
    icsNumberSource: row.ics_number_source || "",
    icsNumberDistribute: row.ics_number_distribute || "",
    referenceNumber: row.reference_number || "",
    assetType: row.asset_type,
    acquiredType: row.acquired_type || "Not Applicable",
    acquiredDetails: row.acquired_details || "",
    location: row.location,
    status: row.status,
    teacherId: row.assigned_teacher_id || "",
    assignedDate: row.assigned_date || "",
    notes: row.notes || "",
  };
}

function mapStockMovementRow(row) {
  return {
    id: row.id,
    inventoryItemId: row.inventory_item_id,
    movementType: row.movement_type,
    quantity: toNumber(row.quantity),
    movementDate: row.movement_date,
    personnelName: row.personnel_name || "",
    remarks: row.remarks || "",
    createdAt: row.created_at,
  };
}

function buildStockMovementUpdate(item, movementQuantity, movementType, movementDate, remarks, personnelName = "") {
  const quantityDelta = movementType === "in" ? movementQuantity : -movementQuantity;
  const nextQuantity = Math.max(0, toNumber(item.quantity) + quantityDelta);
  const nextUsableCount = Math.max(0, toNumber(item.usable_count) + quantityDelta);
  const nextPropertyCard = Math.max(0, toNumber(item.quantity_per_property_card) + quantityDelta);
  const nextPhysicalCount = Math.max(0, toNumber(item.quantity_per_physical_count) + quantityDelta);
  const movementLabel = movementType === "in" ? "Stock In" : "Stock Out";
  const personnelText = personnelName && movementType === "out" ? `. Personnel: ${personnelName}` : "";
  const movementNote = `[${movementLabel} ${movementDate}] ${movementType === "in" ? "Added" : "Deducted"} ${movementQuantity}${personnelText}${remarks ? `. Remarks: ${remarks}` : ""}`;

  return {
    quantity: nextQuantity,
    quantityPerPropertyCard: nextPropertyCard,
    quantityPerPhysicalCount: nextPhysicalCount,
    usableCount: nextUsableCount,
    notes: [movementNote, item.notes].filter(Boolean).join("\n"),
  };
}

async function listTeachers() {
  const rows = await select(`
    SELECT id, last_name, first_name, middle_name, suffix_name, school_name, department, current_position, email,
      date_of_birth, date_hired_toledo, date_hired_government, gsis_number, philhealth_number,
      tin_number, pagibig_number, sss_number, civil_status, gender
    FROM teachers
    ORDER BY last_name ASC, first_name ASC
  `);

  return rows.map(mapTeacherRow);
}

async function createTeacher(body) {
  const id = randomUUID();

  await exec(`
    INSERT INTO teachers (
      id, last_name, first_name, middle_name, suffix_name, school_name, department, current_position, email,
      date_of_birth, date_hired_toledo, date_hired_government, gsis_number, philhealth_number,
      tin_number, pagibig_number, sss_number, civil_status, gender
    ) VALUES (
      ${sqlValue(id)}, ${sqlValue(body.lastName)}, ${sqlValue(body.firstName)}, ${sqlValue(body.middleName || "")},
      ${sqlValue(body.suffixName || "")}, ${sqlValue(body.schoolName || "Landahan Elementary School")},
      ${sqlValue(body.department)}, ${sqlValue(body.currentPosition)},
      ${sqlValue(body.email || "")}, ${sqlValue(nullable(body.dateOfBirth))}, ${sqlValue(nullable(body.dateHiredToledo))},
      ${sqlValue(nullable(body.dateHiredGovernment))}, ${sqlValue(body.gsisNumber || "")},
      ${sqlValue(body.philhealthNumber || "")}, ${sqlValue(body.tinNumber || "")},
      ${sqlValue(body.pagibigNumber || "")}, ${sqlValue(body.sssNumber || "")}, ${sqlValue(body.civilStatus)},
      ${sqlValue(body.gender)}
    )
  `);

  return { id };
}

async function updateTeacher(teacherId, body) {
  await exec(`
    UPDATE teachers
    SET last_name = ${sqlValue(body.lastName)},
      first_name = ${sqlValue(body.firstName)},
      middle_name = ${sqlValue(body.middleName || "")},
      suffix_name = ${sqlValue(body.suffixName || "")},
      school_name = ${sqlValue(body.schoolName || "Landahan Elementary School")},
      department = ${sqlValue(body.department)},
      current_position = ${sqlValue(body.currentPosition)},
      email = ${sqlValue(body.email || "")},
      date_of_birth = ${sqlValue(nullable(body.dateOfBirth))},
      date_hired_toledo = ${sqlValue(nullable(body.dateHiredToledo))},
      date_hired_government = ${sqlValue(nullable(body.dateHiredGovernment))},
      gsis_number = ${sqlValue(body.gsisNumber || "")},
      philhealth_number = ${sqlValue(body.philhealthNumber || "")},
      tin_number = ${sqlValue(body.tinNumber || "")},
      pagibig_number = ${sqlValue(body.pagibigNumber || "")},
      sss_number = ${sqlValue(body.sssNumber || "")},
      civil_status = ${sqlValue(body.civilStatus)},
      gender = ${sqlValue(body.gender)},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${sqlValue(teacherId)}
  `);

  return { id: teacherId };
}

async function deleteTeacher(teacherId) {
  await exec(`
    BEGIN;
    UPDATE inventory_items
    SET status = CASE WHEN status = 'Assigned' THEN 'Available' ELSE status END,
      assigned_teacher_id = NULL,
      assigned_date = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE assigned_teacher_id = ${sqlValue(teacherId)};
    DELETE FROM teachers WHERE id = ${sqlValue(teacherId)};
    COMMIT;
  `);
}

async function listInventory() {
  const rows = await select(`
    SELECT id, name, category, description, asset_tag, quantity, quantity_per_property_card,
      quantity_per_physical_count, usable_count, non_usable_count, unit_of_measurement, amount,
      uacs_code, fund_cluster_code, ics_number_source, ics_number_distribute, reference_number,
      asset_type, acquired_type, acquired_details, school_name, location, status, assigned_teacher_id,
      assigned_date, notes
    FROM inventory_items
    ORDER BY updated_at DESC, name ASC
  `);

  return rows.map(mapInventoryRow);
}

async function getInventoryItem(itemId) {
  const rows = await select(`
    SELECT id, name, category, description, asset_tag, quantity, quantity_per_property_card,
      quantity_per_physical_count, usable_count, non_usable_count, unit_of_measurement, amount,
      uacs_code, fund_cluster_code, ics_number_source, ics_number_distribute, reference_number,
      asset_type, acquired_type, acquired_details, school_name, location, status, assigned_teacher_id,
      assigned_date, notes
    FROM inventory_items
    WHERE id = ${sqlValue(itemId)}
    LIMIT 1
  `);

  return rows[0] ? mapInventoryRow(rows[0]) : null;
}

function inventoryInsertValues(id, body) {
  return [
    id,
    body.name,
    body.category,
    body.description || "",
    body.schoolName || "Landahan Elementary School",
    body.assetTag,
    body.quantity,
    body.quantityPerPropertyCard,
    body.quantityPerPhysicalCount,
    body.usableCount,
    body.nonUsableCount,
    body.unitOfMeasurement,
    body.amount,
    body.uacsCode,
    body.fundClusterCode,
    body.icsNumberSource || "",
    body.icsNumberDistribute || "",
    body.referenceNumber || "",
    body.assetType,
    body.acquiredType,
    body.acquiredDetails || "",
    body.location,
    body.status,
    nullable(body.teacherId),
    nullable(body.assignedDate),
    body.notes || "",
  ].map(sqlValue).join(", ");
}

async function createInventoryItem(body) {
  const id = randomUUID();

  await exec(`
    INSERT INTO inventory_items (
      id, name, category, description, school_name, asset_tag, quantity, quantity_per_property_card,
      quantity_per_physical_count, usable_count, non_usable_count, unit_of_measurement, amount,
      uacs_code, fund_cluster_code, ics_number_source, ics_number_distribute, reference_number,
      asset_type, acquired_type, acquired_details, location, status, assigned_teacher_id, assigned_date, notes
    ) VALUES (${inventoryInsertValues(id, body)})
  `);

  return { id };
}

async function updateInventoryItem(itemId, body) {
  await exec(`
    UPDATE inventory_items
    SET name = ${sqlValue(body.name)},
      category = ${sqlValue(body.category)},
      description = ${sqlValue(body.description || "")},
      school_name = ${sqlValue(body.schoolName || "Landahan Elementary School")},
      asset_tag = ${sqlValue(body.assetTag)},
      quantity = ${sqlValue(body.quantity)},
      quantity_per_property_card = ${sqlValue(body.quantityPerPropertyCard)},
      quantity_per_physical_count = ${sqlValue(body.quantityPerPhysicalCount)},
      usable_count = ${sqlValue(body.usableCount)},
      non_usable_count = ${sqlValue(body.nonUsableCount)},
      unit_of_measurement = ${sqlValue(body.unitOfMeasurement)},
      amount = ${sqlValue(body.amount)},
      uacs_code = ${sqlValue(body.uacsCode)},
      fund_cluster_code = ${sqlValue(body.fundClusterCode)},
      ics_number_source = ${sqlValue(body.icsNumberSource || "")},
      ics_number_distribute = ${sqlValue(body.icsNumberDistribute || "")},
      reference_number = ${sqlValue(body.referenceNumber || "")},
      asset_type = ${sqlValue(body.assetType)},
      acquired_type = ${sqlValue(body.acquiredType)},
      acquired_details = ${sqlValue(body.acquiredDetails || "")},
      location = ${sqlValue(body.location)},
      status = ${sqlValue(body.status)},
      assigned_teacher_id = ${sqlValue(nullable(body.teacherId))},
      assigned_date = ${sqlValue(nullable(body.assignedDate))},
      notes = ${sqlValue(body.notes || "")},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${sqlValue(itemId)}
  `);

  return { id: itemId };
}

async function deleteInventoryItem(itemId) {
  await exec(`DELETE FROM inventory_items WHERE id = ${sqlValue(itemId)}`);
}

async function listStockMovements(itemId) {
  const item = await getInventoryItem(itemId);

  if (!item) {
    throw new HttpError(404, "Inventory item not found");
  }

  const rows = await select(`
    SELECT id, inventory_item_id, movement_type, quantity, movement_date, personnel_name, remarks, created_at
    FROM stock_movements
    WHERE inventory_item_id = ${sqlValue(itemId)}
    ORDER BY movement_date DESC, created_at DESC
  `);

  return rows.map(mapStockMovementRow);
}

async function createStockMovement(itemId, body) {
  const movementType = body.movementType;
  const quantity = Math.max(1, Number(body.quantity) || 0);
  const movementDate = body.movementDate || new Date().toISOString().slice(0, 10);
  const personnelName = body.personnelName || "";
  const remarks = body.remarks || "";

  if (!["in", "out"].includes(movementType)) {
    throw new HttpError(400, "Invalid movement type");
  }

  const rows = await select(`SELECT * FROM inventory_items WHERE id = ${sqlValue(itemId)} LIMIT 1`);
  const item = rows[0];

  if (!item) {
    throw new HttpError(404, "Inventory item not found");
  }

  if (movementType === "out" && quantity > toNumber(item.usable_count)) {
    throw new HttpError(400, "Stock out quantity cannot be greater than usable quantity");
  }

  if (movementType === "out" && quantity >= toNumber(item.quantity)) {
    throw new HttpError(400, "Stock out quantity must leave at least 1 item in stock");
  }

  const updatedItem = buildStockMovementUpdate(item, quantity, movementType, movementDate, remarks, personnelName);
  const movementId = randomUUID();

  await exec(`
    BEGIN;
    UPDATE inventory_items
    SET quantity = ${sqlValue(updatedItem.quantity)},
      quantity_per_property_card = ${sqlValue(updatedItem.quantityPerPropertyCard)},
      quantity_per_physical_count = ${sqlValue(updatedItem.quantityPerPhysicalCount)},
      usable_count = ${sqlValue(updatedItem.usableCount)},
      notes = ${sqlValue(updatedItem.notes)},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${sqlValue(itemId)};
    INSERT INTO stock_movements (
      id, inventory_item_id, movement_type, quantity, movement_date, personnel_name, remarks
    ) VALUES (
      ${sqlValue(movementId)}, ${sqlValue(itemId)}, ${sqlValue(movementType)}, ${sqlValue(quantity)},
      ${sqlValue(movementDate)}, ${sqlValue(personnelName)}, ${sqlValue(remarks)}
    );
    COMMIT;
  `);

  return { id: movementId };
}

module.exports = {
  HttpError,
  createInventoryItem,
  createStockMovement,
  createTeacher,
  deleteInventoryItem,
  deleteTeacher,
  getInventoryItem,
  listInventory,
  listStockMovements,
  listTeachers,
  updateInventoryItem,
  updateTeacher,
};
