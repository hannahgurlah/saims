const { randomUUID } = require("node:crypto");
const { getSupabaseClient } = require("./supabase");

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
    dateReceived: row.date_received || "",
    brandName: row.brand_name || "",
    bookTitle: row.book_title || "",
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

function assertSupabase(result, fallbackMessage) {
  if (result.error) {
    throw new HttpError(500, result.error.message || fallbackMessage);
  }

  return result.data;
}

async function listTeachers() {
  const supabase = getSupabaseClient();
  const result = await supabase
    .from("teachers")
    .select(`
      id,
      last_name,
      first_name,
      middle_name,
      suffix_name,
      school_name,
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
    `)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  return assertSupabase(result, "Unable to load teachers").map(mapTeacherRow);
}

async function createTeacher(body) {
  const supabase = getSupabaseClient();
  const id = randomUUID();
  const result = await supabase.from("teachers").insert({
    id,
    last_name: body.lastName,
    first_name: body.firstName,
    middle_name: body.middleName || "",
    suffix_name: body.suffixName || "",
    school_name: body.schoolName || "Landahan Elementary School",
    department: body.department,
    current_position: body.currentPosition,
    email: body.email || "",
    date_of_birth: nullable(body.dateOfBirth),
    date_hired_toledo: nullable(body.dateHiredToledo),
    date_hired_government: nullable(body.dateHiredGovernment),
    gsis_number: body.gsisNumber || "",
    philhealth_number: body.philhealthNumber || "",
    tin_number: body.tinNumber || "",
    pagibig_number: body.pagibigNumber || "",
    sss_number: body.sssNumber || "",
    civil_status: body.civilStatus,
    gender: body.gender,
  });

  assertSupabase(result, "Unable to create teacher");
  return { id };
}

async function updateTeacher(teacherId, body) {
  const supabase = getSupabaseClient();
  const result = await supabase
    .from("teachers")
    .update({
      last_name: body.lastName,
      first_name: body.firstName,
      middle_name: body.middleName || "",
      suffix_name: body.suffixName || "",
      school_name: body.schoolName || "Landahan Elementary School",
      department: body.department,
      current_position: body.currentPosition,
      email: body.email || "",
      date_of_birth: nullable(body.dateOfBirth),
      date_hired_toledo: nullable(body.dateHiredToledo),
      date_hired_government: nullable(body.dateHiredGovernment),
      gsis_number: body.gsisNumber || "",
      philhealth_number: body.philhealthNumber || "",
      tin_number: body.tinNumber || "",
      pagibig_number: body.pagibigNumber || "",
      sss_number: body.sssNumber || "",
      civil_status: body.civilStatus,
      gender: body.gender,
      updated_at: new Date().toISOString(),
    })
    .eq("id", teacherId);

  assertSupabase(result, "Unable to update teacher");
  return { id: teacherId };
}

async function deleteTeacher(teacherId) {
  const supabase = getSupabaseClient();

  const inventoryResult = await supabase
    .from("inventory_items")
    .update({
      assigned_teacher_id: null,
      assigned_date: null,
      updated_at: new Date().toISOString(),
    })
    .eq("assigned_teacher_id", teacherId);

  assertSupabase(inventoryResult, "Unable to unassign inventory items");

  const assignedStatusResult = await supabase
    .from("inventory_items")
    .update({
      status: "Available",
      updated_at: new Date().toISOString(),
    })
    .eq("assigned_teacher_id", teacherId)
    .eq("status", "Assigned");

  if (assignedStatusResult.error) {
    throw new HttpError(500, assignedStatusResult.error.message || "Unable to update assigned inventory status");
  }

  const deleteResult = await supabase.from("teachers").delete().eq("id", teacherId);
  assertSupabase(deleteResult, "Unable to delete teacher");
}

async function listInventory() {
  const supabase = getSupabaseClient();
  const result = await supabase
    .from("inventory_items")
    .select(`
      id,
      name,
      category,
      description,
      date_received,
      brand_name,
      book_title,
      book_publisher,
      school_name,
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
    `)
    .order("updated_at", { ascending: false })
    .order("name", { ascending: true });

  return assertSupabase(result, "Unable to load inventory").map(mapInventoryRow);
}

async function getInventoryItem(itemId) {
  const supabase = getSupabaseClient();
  const result = await supabase
    .from("inventory_items")
    .select(`
      id,
      name,
      category,
      description,
      date_received,
      brand_name,
      book_title,
      book_publisher,
      school_name,
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
    `)
    .eq("id", itemId)
    .maybeSingle();

  if (result.error) {
    throw new HttpError(500, result.error.message || "Unable to load inventory item");
  }

  return result.data ? mapInventoryRow(result.data) : null;
}

async function createInventoryItem(body) {
  const supabase = getSupabaseClient();
  const id = randomUUID();
  const result = await supabase.from("inventory_items").insert({
    id,
    name: body.name,
    category: body.category,
    description: body.description || "",
    date_received: nullable(body.dateReceived),
    brand_name: body.brandName || "",
    book_title: body.bookTitle || "",
    book_publisher: body.bookPublisher || "",
    school_name: body.schoolName || "Landahan Elementary School",
    asset_tag: body.assetTag,
    quantity: body.quantity,
    quantity_per_property_card: body.quantityPerPropertyCard,
    quantity_per_physical_count: body.quantityPerPhysicalCount,
    usable_count: body.usableCount,
    non_usable_count: body.nonUsableCount,
    unit_of_measurement: body.unitOfMeasurement,
    amount: body.amount,
    uacs_code: body.uacsCode,
    fund_cluster_code: body.fundClusterCode,
    ics_number_source: body.icsNumberSource || "",
    ics_number_distribute: body.icsNumberDistribute || "",
    reference_number: body.referenceNumber || "",
    asset_type: body.assetType,
    acquired_type: body.acquiredType,
    acquired_details: body.acquiredDetails || "",
    location: body.location,
    status: body.status,
    assigned_teacher_id: nullable(body.teacherId),
    assigned_date: nullable(body.assignedDate),
    notes: body.notes || "",
  });

  assertSupabase(result, "Unable to create inventory item");
  return { id };
}

async function updateInventoryItem(itemId, body) {
  const supabase = getSupabaseClient();
  const result = await supabase
    .from("inventory_items")
    .update({
      name: body.name,
      category: body.category,
      description: body.description || "",
      date_received: nullable(body.dateReceived),
      brand_name: body.brandName || "",
      book_title: body.bookTitle || "",
      book_publisher: body.bookPublisher || "",
      school_name: body.schoolName || "Landahan Elementary School",
      asset_tag: body.assetTag,
      quantity: body.quantity,
      quantity_per_property_card: body.quantityPerPropertyCard,
      quantity_per_physical_count: body.quantityPerPhysicalCount,
      usable_count: body.usableCount,
      non_usable_count: body.nonUsableCount,
      unit_of_measurement: body.unitOfMeasurement,
      amount: body.amount,
      uacs_code: body.uacsCode,
      fund_cluster_code: body.fundClusterCode,
      ics_number_source: body.icsNumberSource || "",
      ics_number_distribute: body.icsNumberDistribute || "",
      reference_number: body.referenceNumber || "",
      asset_type: body.assetType,
      acquired_type: body.acquiredType,
      acquired_details: body.acquiredDetails || "",
      location: body.location,
      status: body.status,
      assigned_teacher_id: nullable(body.teacherId),
      assigned_date: nullable(body.assignedDate),
      notes: body.notes || "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  assertSupabase(result, "Unable to update inventory item");
  return { id: itemId };
}

async function deleteInventoryItem(itemId) {
  const supabase = getSupabaseClient();
  const result = await supabase.from("inventory_items").delete().eq("id", itemId);
  assertSupabase(result, "Unable to delete inventory item");
}

async function listStockMovements(itemId) {
  const supabase = getSupabaseClient();
  const itemResult = await supabase.from("inventory_items").select("id").eq("id", itemId).maybeSingle();

  if (itemResult.error) {
    throw new HttpError(500, itemResult.error.message || "Unable to load inventory item");
  }

  if (!itemResult.data) {
    throw new HttpError(404, "Inventory item not found");
  }

  const result = await supabase
    .from("stock_movements")
    .select(`
      id,
      inventory_item_id,
      movement_type,
      quantity,
      movement_date,
      personnel_name,
      remarks,
      created_at
    `)
    .eq("inventory_item_id", itemId)
    .order("movement_date", { ascending: false })
    .order("created_at", { ascending: false });

  return assertSupabase(result, "Unable to load stock movements").map(mapStockMovementRow);
}

async function createStockMovement(itemId, body) {
  const supabase = getSupabaseClient();
  const movementType = body.movementType;
  const quantity = Math.max(1, Number(body.quantity) || 0);
  const movementDate = body.movementDate || new Date().toISOString().slice(0, 10);
  const personnelName = body.personnelName || "";
  const remarks = body.remarks || "";

  if (!["in", "out"].includes(movementType)) {
    throw new HttpError(400, "Invalid movement type");
  }

  const itemResult = await supabase.from("inventory_items").select("*").eq("id", itemId).maybeSingle();

  if (itemResult.error) {
    throw new HttpError(500, itemResult.error.message || "Unable to load inventory item");
  }

  const item = itemResult.data;

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
  const updateResult = await supabase
    .from("inventory_items")
    .update({
      quantity: updatedItem.quantity,
      quantity_per_property_card: updatedItem.quantityPerPropertyCard,
      quantity_per_physical_count: updatedItem.quantityPerPhysicalCount,
      usable_count: updatedItem.usableCount,
      notes: updatedItem.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  assertSupabase(updateResult, "Unable to update inventory quantities");

  const movementId = randomUUID();
  const movementResult = await supabase.from("stock_movements").insert({
    id: movementId,
    inventory_item_id: itemId,
    movement_type: movementType,
    quantity,
    movement_date: movementDate,
    personnel_name: personnelName,
    remarks,
  });

  assertSupabase(movementResult, "Unable to save stock movement");
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
