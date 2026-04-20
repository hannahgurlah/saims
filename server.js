const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

const ROOT_DIR = __dirname;
const DB_PATH = path.join(ROOT_DIR, "database", "landahan.db");
const SCHEMA_PATH = path.join(ROOT_DIR, "database", "schema.sql");
const SEED_PATH = path.join(ROOT_DIR, "database", "seed.sql");
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");
ensureDatabase();

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    serveStaticFile(response, url.pathname);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`School inventory app running at http://localhost:${PORT}`);
});

function ensureDatabase() {
  db.exec(fs.readFileSync(SCHEMA_PATH, "utf8"));
  ensureColumn("inventory_items", "description", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("inventory_items", "quantity_per_property_card", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("inventory_items", "quantity_per_physical_count", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("inventory_items", "usable_count", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("inventory_items", "non_usable_count", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("inventory_items", "unit_of_measurement", "TEXT NOT NULL DEFAULT 'piece'");
  ensureColumn("inventory_items", "acquired_type", "TEXT NOT NULL DEFAULT 'Not Applicable'");
  ensureColumn("inventory_items", "acquired_details", "TEXT DEFAULT ''");
  ensureColumn("inventory_items", "ics_number_source", "TEXT DEFAULT ''");
  ensureColumn("inventory_items", "ics_number_distribute", "TEXT DEFAULT ''");
  ensureColumn("inventory_items", "reference_number", "TEXT DEFAULT ''");
  const teacherCount = db.prepare("SELECT COUNT(*) AS count FROM teachers").get().count;

  if (teacherCount === 0) {
    db.exec(fs.readFileSync(SEED_PATH, "utf8"));
  }
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && /^\/api\/inventory\/[^/]+\/movements$/.test(url.pathname)) {
    const itemId = decodeURIComponent(url.pathname.split("/")[3]);
    const item = db.prepare("SELECT id FROM inventory_items WHERE id = ?").get(itemId);

    if (!item) {
      sendJson(response, 404, { error: "Inventory item not found" });
      return;
    }

    const movements = db
      .prepare(`
        SELECT
          id,
          inventory_item_id,
          movement_type,
          quantity,
          movement_date,
          personnel_name,
          remarks,
          created_at
        FROM stock_movements
        WHERE inventory_item_id = ?
        ORDER BY movement_date DESC, created_at DESC
      `)
      .all(itemId)
      .map(mapStockMovementRow);

    sendJson(response, 200, movements);
    return;
  }

  if (request.method === "POST" && /^\/api\/inventory\/[^/]+\/movements$/.test(url.pathname)) {
    const itemId = decodeURIComponent(url.pathname.split("/")[3]);
    const body = await readJsonBody(request);
    const item = db.prepare("SELECT * FROM inventory_items WHERE id = ?").get(itemId);

    if (!item) {
      sendJson(response, 404, { error: "Inventory item not found" });
      return;
    }

    const movementType = body.movementType;
    const quantity = Math.max(1, Number(body.quantity) || 0);
    const movementDate = body.movementDate || new Date().toISOString().slice(0, 10);
    const personnelName = body.personnelName || "";
    const remarks = body.remarks || "";

    if (!["in", "out"].includes(movementType)) {
      sendJson(response, 400, { error: "Invalid movement type" });
      return;
    }

    if (movementType === "out" && quantity > (Number(item.usable_count) || 0)) {
      sendJson(response, 400, { error: "Stock out quantity cannot be greater than usable quantity" });
      return;
    }

    if (movementType === "out" && quantity >= (Number(item.quantity) || 0)) {
      sendJson(response, 400, { error: "Stock out quantity must leave at least 1 item in stock" });
      return;
    }

    const updatedItem = buildStockMovementUpdate(item, quantity, movementType, movementDate, remarks, personnelName);
    const movementId = randomUUID();

    db.exec("BEGIN");
    try {
      db.prepare(`
        UPDATE inventory_items
        SET
          quantity = ?,
          quantity_per_property_card = ?,
          quantity_per_physical_count = ?,
          usable_count = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        updatedItem.quantity,
        updatedItem.quantityPerPropertyCard,
        updatedItem.quantityPerPhysicalCount,
        updatedItem.usableCount,
        updatedItem.notes,
        itemId,
      );

      db.prepare(`
        INSERT INTO stock_movements (
          id,
          inventory_item_id,
          movement_type,
          quantity,
          movement_date,
          personnel_name,
          remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        movementId,
        itemId,
        movementType,
        quantity,
        movementDate,
        personnelName,
        remarks,
      );

      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }

    sendJson(response, 201, { id: movementId });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/teachers") {
    const teachers = db
      .prepare(`
        SELECT
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
          gender
        FROM teachers
        ORDER BY last_name, first_name
      `)
      .all()
      .map(mapTeacherRow);

    sendJson(response, 200, teachers);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/teachers") {
    const body = await readJsonBody(request);
    const id = randomUUID();

    db.prepare(`
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
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      id,
      body.lastName,
      body.firstName,
      body.middleName || "",
      body.suffixName || "",
      body.department,
      body.currentPosition,
      body.email || "",
      nullable(body.dateOfBirth),
      nullable(body.dateHiredToledo),
      nullable(body.dateHiredGovernment),
      body.gsisNumber || "",
      body.philhealthNumber || "",
      body.tinNumber || "",
      body.pagibigNumber || "",
      body.sssNumber || "",
      body.civilStatus,
      body.gender,
    );

    sendJson(response, 201, { id });
    return;
  }

  if (request.method === "DELETE" && url.pathname.startsWith("/api/teachers/")) {
    const teacherId = decodeURIComponent(url.pathname.split("/").pop());

    db.prepare(`
      UPDATE inventory_items
      SET
        assigned_teacher_id = NULL,
        assigned_date = NULL,
        status = CASE WHEN status = 'Assigned' THEN 'Available' ELSE status END,
        updated_at = CURRENT_TIMESTAMP
      WHERE assigned_teacher_id = ?
    `).run(teacherId);

    db.prepare("DELETE FROM teachers WHERE id = ?").run(teacherId);
    sendJson(response, 204, null);
    return;
  }

  if (request.method === "PUT" && url.pathname.startsWith("/api/teachers/")) {
    const teacherId = decodeURIComponent(url.pathname.split("/").pop());
    const body = await readJsonBody(request);

    db.prepare(`
      UPDATE teachers
      SET
        last_name = ?,
        first_name = ?,
        middle_name = ?,
        suffix_name = ?,
        department = ?,
        current_position = ?,
        email = ?,
        date_of_birth = ?,
        date_hired_toledo = ?,
        date_hired_government = ?,
        gsis_number = ?,
        philhealth_number = ?,
        tin_number = ?,
        pagibig_number = ?,
        sss_number = ?,
        civil_status = ?,
        gender = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      body.lastName,
      body.firstName,
      body.middleName || "",
      body.suffixName || "",
      body.department,
      body.currentPosition,
      body.email || "",
      nullable(body.dateOfBirth),
      nullable(body.dateHiredToledo),
      nullable(body.dateHiredGovernment),
      body.gsisNumber || "",
      body.philhealthNumber || "",
      body.tinNumber || "",
      body.pagibigNumber || "",
      body.sssNumber || "",
      body.civilStatus,
      body.gender,
      teacherId,
    );

    sendJson(response, 200, { id: teacherId });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/inventory") {
    const inventory = db
      .prepare(`
        SELECT
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
          notes
        FROM inventory_items
        ORDER BY updated_at DESC, name ASC
      `)
      .all()
      .map(mapInventoryRow);

    sendJson(response, 200, inventory);
    return;
  }

  if (request.method === "GET" && /^\/api\/inventory\/[^/]+$/.test(url.pathname)) {
    const itemId = decodeURIComponent(url.pathname.split("/").pop());
    const item = db
      .prepare(`
        SELECT
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
          notes
        FROM inventory_items
        WHERE id = ?
      `)
      .get(itemId);

    if (!item) {
      sendJson(response, 404, { error: "Inventory item not found" });
      return;
    }

    sendJson(response, 200, mapInventoryRow(item));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/inventory") {
    const body = await readJsonBody(request);
    const id = randomUUID();

    db.prepare(`
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
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      id,
      body.name,
      body.category,
      body.description || "",
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
    );

    sendJson(response, 201, { id });
    return;
  }

  if (request.method === "PUT" && url.pathname.startsWith("/api/inventory/")) {
    const itemId = decodeURIComponent(url.pathname.split("/").pop());
    const body = await readJsonBody(request);

    db.prepare(`
      UPDATE inventory_items
      SET
        name = ?,
        category = ?,
        description = ?,
        asset_tag = ?,
        quantity = ?,
        quantity_per_property_card = ?,
        quantity_per_physical_count = ?,
        usable_count = ?,
        non_usable_count = ?,
        unit_of_measurement = ?,
        amount = ?,
        uacs_code = ?,
        fund_cluster_code = ?,
        ics_number_source = ?,
        ics_number_distribute = ?,
        reference_number = ?,
        asset_type = ?,
        acquired_type = ?,
        acquired_details = ?,
        location = ?,
        status = ?,
        assigned_teacher_id = ?,
        assigned_date = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      body.name,
      body.category,
      body.description || "",
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
      itemId,
    );

    sendJson(response, 200, { id: itemId });
    return;
  }

  if (request.method === "DELETE" && url.pathname.startsWith("/api/inventory/")) {
    const itemId = decodeURIComponent(url.pathname.split("/").pop());
    db.prepare("DELETE FROM inventory_items WHERE id = ?").run(itemId);
    sendJson(response, 204, null);
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

function serveStaticFile(response, requestPath) {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.resolve(ROOT_DIR, `.${normalizedPath}`);

  if (!filePath.startsWith(ROOT_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(response, 404, "Not found");
    return;
  }

  const extension = path.extname(filePath);
  response.writeHead(200, {
    "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
  });
  response.end(fs.readFileSync(filePath));
}

function mapTeacherRow(row) {
  return {
    id: row.id,
    lastName: row.last_name,
    firstName: row.first_name,
    middleName: row.middle_name,
    suffixName: row.suffix_name,
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
    assetTag: row.asset_tag,
    quantity: row.quantity,
    quantityPerPropertyCard: row.quantity_per_property_card,
    quantityPerPhysicalCount: row.quantity_per_physical_count,
    usableCount: row.usable_count,
    nonUsableCount: row.non_usable_count,
    unitOfMeasurement: row.unit_of_measurement,
    amount: row.amount,
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
    quantity: row.quantity,
    movementDate: row.movement_date,
    personnelName: row.personnel_name || "",
    remarks: row.remarks || "",
    createdAt: row.created_at,
  };
}

function buildStockMovementUpdate(item, movementQuantity, movementType, movementDate, remarks, personnelName = "") {
  const quantityDelta = movementType === "in" ? movementQuantity : -movementQuantity;
  const nextQuantity = Math.max(0, (Number(item.quantity) || 0) + quantityDelta);
  const nextUsableCount = Math.max(0, (Number(item.usable_count) || 0) + quantityDelta);
  const nextPropertyCard = Math.max(0, (Number(item.quantity_per_property_card) || 0) + quantityDelta);
  const nextPhysicalCount = Math.max(0, (Number(item.quantity_per_physical_count) || 0) + quantityDelta);
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

function nullable(value) {
  return value ? value : null;
}

function ensureColumn(tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(response, statusCode, data) {
  if (statusCode === 204) {
    response.writeHead(statusCode);
    response.end();
    return;
  }

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(data));
}

function sendText(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(body);
}
