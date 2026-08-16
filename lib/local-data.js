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

function normalizeLegacyAcquisitionType(value) {
  return value === "Donated" ? "Donation" : value === "Purchase" ? "Purchase" : "Provision/Issuance";
}

function getLegacyPropertyCondition(status) {
  return status === "Maintenance" ? "For Maintenance/Repair" : status === "Retired" ? "Not Usable" : "Working/Available";
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

let inventoryBookTypeReady = false;

async function ensureInventoryBookTypeColumn() {
  if (inventoryBookTypeReady) return;

  const columns = await select("PRAGMA table_info(inventory_items)");
  if (!columns.some((column) => column.name === "book_type")) {
    await exec("ALTER TABLE inventory_items ADD COLUMN book_type TEXT NOT NULL DEFAULT ''");
  }
  if (!columns.some((column) => column.name === "grade_level")) {
    await exec("ALTER TABLE inventory_items ADD COLUMN grade_level TEXT NOT NULL DEFAULT ''");
  }
  if (!columns.some((column) => column.name === "subject_area")) {
    await exec("ALTER TABLE inventory_items ADD COLUMN subject_area TEXT NOT NULL DEFAULT ''");
  }
  if (!columns.some((column) => column.name === "year_acquired")) await exec("ALTER TABLE inventory_items ADD COLUMN year_acquired INTEGER");
  if (!columns.some((column) => column.name === "office_type")) await exec("ALTER TABLE inventory_items ADD COLUMN office_type TEXT NOT NULL DEFAULT ''");
  if (!columns.some((column) => column.name === "location_code")) await exec("ALTER TABLE inventory_items ADD COLUMN location_code TEXT NOT NULL DEFAULT ''");
  if (!columns.some((column) => column.name === "school_code")) await exec("ALTER TABLE inventory_items ADD COLUMN school_code TEXT NOT NULL DEFAULT ''");
  await exec("UPDATE inventory_items SET book_type = 'Standard Textbook' WHERE book_type = 'Standard Textbooks'");
  await exec(`UPDATE inventory_items SET office_type = CASE
    WHEN school_name LIKE '%Elementary School%' OR school_name LIKE '%Central School%' THEN 'ES'
    WHEN school_name LIKE '%High School%' OR school_name = 'Toledo National Vocational School' THEN 'HS'
    ELSE office_type END WHERE office_type = ''`);
  await exec(`UPDATE inventory_items SET school_code = CASE school_name
    WHEN 'Awihao Elementary School' THEN '02' WHEN 'Bato Elementary School' THEN '04'
    WHEN 'Fudencio Dolino Elementary School' THEN '18' WHEN 'Fulgencio Dolino Elementary School' THEN '18'
    WHEN 'Ibo Elementary School' THEN '21' WHEN 'Landahan Elementary School' THEN '23'
    WHEN 'Lower Tubod Elementary School' THEN '26' ELSE school_code END
    WHERE office_type = 'ES'`);
  inventoryBookTypeReady = true;
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
    itemForm: row.item_form || "Single",
    bundleItems: row.bundle_items || "",
    category: row.category,
    subcategory: row.subcategory || "",
    categoryCode: row.category_code || "",
    subcategoryCode: row.subcategory_code || "",
    description: row.description || "",
    dateReceived: row.date_received || "",
    yearAcquired: row.year_acquired || "",
    officeType: row.office_type || "",
    locationCode: row.location_code || "",
    schoolCode: row.school_code || "",
    brandName: row.brand_name || "",
    modelNumber: row.model_number || "",
    serialNumber: row.serial_number || "",
    bookTitle: row.book_title || "",
    bookType: row.book_type || "",
    gradeLevel: row.grade_level || "",
    subjectArea: row.subject_area || "",
    bookAuthor: row.book_author || "",
    bookPublisher: row.book_publisher || "",
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
    acquisitionType: row.acquisition_type || normalizeLegacyAcquisitionType(row.acquired_type),
    acquiredDetails: row.acquired_details || "",
    propertyCondition: row.property_condition || getLegacyPropertyCondition(row.status),
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

async function listBookCatalog() {
  return select(`
    SELECT title, grade_levels AS gradeLevels, type, authors, subjects, publisher,
      volume, copyrightyear AS copyrightYear, pages, isbn
    FROM book_catalog
    ORDER BY title ASC, type ASC
  `);
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
  await ensureInventoryBookTypeColumn();
  const rows = await select(`
    SELECT id, name, item_form, bundle_items, category, subcategory, category_code, subcategory_code, description, date_received, year_acquired, office_type, location_code, school_code, brand_name, model_number, serial_number, book_title, book_type, grade_level, subject_area, book_author, book_publisher, asset_tag, quantity, quantity_per_property_card,
      quantity_per_physical_count, usable_count, non_usable_count, unit_of_measurement, amount,
      uacs_code, fund_cluster_code, ics_number_source, ics_number_distribute, reference_number,
      asset_type, acquired_type, acquisition_type, acquired_details, property_condition, school_name, location, status, assigned_teacher_id,
      assigned_date, notes
    FROM inventory_items
    ORDER BY updated_at DESC, name ASC
  `);

  return rows.map(mapInventoryRow);
}

async function getInventoryItem(itemId) {
  await ensureInventoryBookTypeColumn();
  const rows = await select(`
    SELECT id, name, item_form, bundle_items, category, subcategory, category_code, subcategory_code, description, date_received, year_acquired, office_type, location_code, school_code, brand_name, model_number, serial_number, book_title, book_type, grade_level, subject_area, book_author, book_publisher, asset_tag, quantity, quantity_per_property_card,
      quantity_per_physical_count, usable_count, non_usable_count, unit_of_measurement, amount,
      uacs_code, fund_cluster_code, ics_number_source, ics_number_distribute, reference_number,
      asset_type, acquired_type, acquisition_type, acquired_details, property_condition, school_name, location, status, assigned_teacher_id,
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
    body.itemForm === "Bundle/Package" ? "Bundle/Package" : "Single",
    body.itemForm === "Bundle/Package" ? body.bundleItems || "" : "",
    body.category,
    body.subcategory || "",
    body.categoryCode || "",
    body.subcategoryCode || "",
    body.description || "",
    nullable(body.dateReceived),
    body.yearAcquired || null,
    body.officeType || "",
    body.locationCode || "",
    body.schoolCode || "",
    body.brandName || "",
    body.modelNumber || "",
    body.serialNumber || "",
    body.bookTitle || "",
    body.bookType || "",
    body.gradeLevel || "",
    body.subjectArea || "",
    body.bookAuthor || "",
    body.bookPublisher || "",
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
    body.acquisitionType || "Purchase",
    body.acquiredDetails || "",
    body.propertyCondition || "Working/Available",
    body.location,
    body.status,
    nullable(body.teacherId),
    nullable(body.assignedDate),
    body.notes || "",
  ].map(sqlValue).join(", ");
}

async function createInventoryItem(body) {
  await ensureInventoryBookTypeColumn();
  const id = randomUUID();

  await exec(`
    INSERT INTO inventory_items (
      id, name, item_form, bundle_items, category, subcategory, category_code, subcategory_code, description, date_received, year_acquired, office_type, location_code, school_code, brand_name, model_number, serial_number, book_title, book_type, grade_level, subject_area, book_author, book_publisher, school_name, asset_tag, quantity, quantity_per_property_card,
      quantity_per_physical_count, usable_count, non_usable_count, unit_of_measurement, amount,
      uacs_code, fund_cluster_code, ics_number_source, ics_number_distribute, reference_number,
      asset_type, acquired_type, acquisition_type, acquired_details, property_condition, location, status, assigned_teacher_id, assigned_date, notes
    ) VALUES (${inventoryInsertValues(id, body)})
  `);

  return { id };
}

async function updateInventoryItem(itemId, body) {
  await ensureInventoryBookTypeColumn();
  await exec(`
    UPDATE inventory_items
    SET name = ${sqlValue(body.name)},
      item_form = ${sqlValue(body.itemForm === "Bundle/Package" ? "Bundle/Package" : "Single")},
      bundle_items = ${sqlValue(body.itemForm === "Bundle/Package" ? body.bundleItems || "" : "")},
      category = ${sqlValue(body.category)},
      subcategory = ${sqlValue(body.subcategory || "")},
      category_code = ${sqlValue(body.categoryCode || "")},
      subcategory_code = ${sqlValue(body.subcategoryCode || "")},
      description = ${sqlValue(body.description || "")},
      date_received = ${sqlValue(nullable(body.dateReceived))},
      year_acquired = ${sqlValue(body.yearAcquired || null)},
      office_type = ${sqlValue(body.officeType || "")},
      location_code = ${sqlValue(body.locationCode || "")},
      school_code = ${sqlValue(body.schoolCode || "")},
      brand_name = ${sqlValue(body.brandName || "")},
      model_number = ${sqlValue(body.modelNumber || "")},
      serial_number = ${sqlValue(body.serialNumber || "")},
      book_title = ${sqlValue(body.bookTitle || "")},
      book_type = ${sqlValue(body.bookType || "")},
      grade_level = ${sqlValue(body.gradeLevel || "")},
      subject_area = ${sqlValue(body.subjectArea || "")},
      book_author = ${sqlValue(body.bookAuthor || "")},
      book_publisher = ${sqlValue(body.bookPublisher || "")},
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
      acquisition_type = ${sqlValue(body.acquisitionType || "Purchase")},
      acquired_details = ${sqlValue(body.acquiredDetails || "")},
      property_condition = ${sqlValue(body.propertyCondition || "Working/Available")},
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
  listBookCatalog,
  listStockMovements,
  listTeachers,
  updateInventoryItem,
  updateTeacher,
};
