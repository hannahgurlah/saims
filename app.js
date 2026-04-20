const state = {
  teachers: [],
  inventory: [],
};

const teacherForm = document.querySelector("#teacherForm");
const teacherList = document.querySelector("#teacherList");
const teacherTemplate = document.querySelector("#teacherCardTemplate");
const addTeacherModal = document.querySelector("#addTeacherModal");
const openTeacherModalBtn = document.querySelector("#openTeacherModalBtn");
const closeAddTeacherModalBtn = document.querySelector("#closeAddTeacherModalBtn");
const editTeacherModal = document.querySelector("#editTeacherModal");
const editTeacherForm = document.querySelector("#editTeacherForm");
const closeTeacherModalBtn = document.querySelector("#closeTeacherModalBtn");

const inventoryForm = document.querySelector("#inventoryForm");
const itemTeacher = document.querySelector("#itemTeacher");
const itemQuantityInput = document.querySelector("#itemQuantity");
const itemQuantityPerPropertyCardInput = document.querySelector("#itemQuantityPerPropertyCard");
const itemQuantityPerPhysicalCountInput = document.querySelector("#itemQuantityPerPhysicalCount");
const itemUsableCountInput = document.querySelector("#itemUsableCount");
const itemNonUsableCountInput = document.querySelector("#itemNonUsableCount");
const itemAmountInput = document.querySelector("#itemAmount");
const itemTotalAmountInput = document.querySelector("#itemTotalAmount");
const itemAcquiredType = document.querySelector("#itemAcquiredType");
const itemAcquiredDetailsWrap = document.querySelector("#itemAcquiredDetailsWrap");
const itemAcquiredDetailsLabel = document.querySelector("#itemAcquiredDetailsLabel");
const itemAcquiredDetailsInput = document.querySelector("#itemAcquiredDetails");

const filterTeacher = document.querySelector("#filterTeacher");
const filterStatus = document.querySelector("#filterStatus");
const filterItemType = document.querySelector("#filterItemType");
const searchInput = document.querySelector("#searchInput");
const inventoryTableWrap = document.querySelector("#inventoryTableWrap");
const downloadCsvBtn = document.querySelector("#downloadCsvBtn");
const downloadTeachersCsvBtn = document.querySelector("#downloadTeachersCsvBtn");
const downloadStockCardCsvBtn = document.querySelector("#downloadStockCardCsvBtn");
const downloadPpeReportBtn = document.querySelector("#downloadPpeReportBtn");
const downloadSemiExpendableReportBtn = document.querySelector("#downloadSemiExpendableReportBtn");
const stockCardItemTitle = document.querySelector("#stockCardItemTitle");
const stockCardItemSummary = document.querySelector("#stockCardItemSummary");
const stockMovementTableWrap = document.querySelector("#stockMovementTableWrap");

const heroStats = document.querySelector("#heroStats");
const isStockCardPage = window.location.pathname.endsWith("/stock-card.html") || window.location.pathname.endsWith("stock-card.html");
const isInventoryItemPage = window.location.pathname.endsWith("/inventory-item.html") || window.location.pathname.endsWith("inventory-item.html");
const isInventoryListPage = window.location.pathname.endsWith("/inventory-list.html") || window.location.pathname.endsWith("inventory-list.html");
const isStockCardItemPage = window.location.pathname.endsWith("/stock-card-item.html") || window.location.pathname.endsWith("stock-card-item.html");
const stockInModal = document.querySelector("#stockInModal");
const stockOutModal = document.querySelector("#stockOutModal");
const stockInForm = document.querySelector("#stockInForm");
const stockOutForm = document.querySelector("#stockOutForm");
const stockOutTeacher = document.querySelector("#stockOutTeacher");
const closeStockInModalBtn = document.querySelector("#closeStockInModalBtn");
const closeStockOutModalBtn = document.querySelector("#closeStockOutModalBtn");
const INVENTORY_PAGE_SIZE = 20;

const editModal = document.querySelector("#editModal");
const editInventoryForm = document.querySelector("#editInventoryForm");
const editItemTeacher = document.querySelector("#editItemTeacher");
const closeModalBtn = document.querySelector("#closeModalBtn");
const editItemQuantityInput = document.querySelector("#editItemQuantity");
const editItemQuantityPerPropertyCardInput = document.querySelector("#editItemQuantityPerPropertyCard");
const editItemQuantityPerPhysicalCountInput = document.querySelector("#editItemQuantityPerPhysicalCount");
const editItemUsableCountInput = document.querySelector("#editItemUsableCount");
const editItemNonUsableCountInput = document.querySelector("#editItemNonUsableCount");
const editItemAmountInput = document.querySelector("#editItemAmount");
const editItemTotalAmountInput = document.querySelector("#editItemTotalAmount");
const editItemAcquiredType = document.querySelector("#editItemAcquiredType");
const editItemAcquiredDetailsWrap = document.querySelector("#editItemAcquiredDetailsWrap");
const editItemAcquiredDetailsLabel = document.querySelector("#editItemAcquiredDetailsLabel");
const editItemAcquiredDetailsInput = document.querySelector("#editItemAcquiredDetails");

let editingItemId = "";
let editingTeacherId = "";
let stockMovementItemId = "";
let stockCardMovements = [];
let currentInventoryPage = 1;

if (teacherForm) {
  teacherForm.addEventListener("submit", handleTeacherSubmit);
}

if (openTeacherModalBtn) {
  openTeacherModalBtn.addEventListener("click", openAddTeacherModal);
}

if (closeAddTeacherModalBtn) {
  closeAddTeacherModalBtn.addEventListener("click", closeAddTeacherModal);
}

if (addTeacherModal) {
  addTeacherModal.addEventListener("click", handleAddTeacherModalBackdropClick);
}

if (teacherList) {
  teacherList.addEventListener("click", handleTeacherListClick);
}

if (editTeacherForm) {
  editTeacherForm.addEventListener("submit", handleEditTeacherSubmit);
}

if (closeTeacherModalBtn) {
  closeTeacherModalBtn.addEventListener("click", closeTeacherModal);
}

if (editTeacherModal) {
  editTeacherModal.addEventListener("click", handleTeacherModalBackdropClick);
}

if (inventoryForm) {
  inventoryForm.addEventListener("submit", handleInventorySubmit);
}

if (itemQuantityInput) {
  itemQuantityInput.addEventListener("input", updateCreateTotalAmount);
}

if (itemQuantityPerPropertyCardInput) {
  itemQuantityPerPropertyCardInput.addEventListener("input", () => {});
}

if (itemQuantityPerPhysicalCountInput) {
  itemQuantityPerPhysicalCountInput.addEventListener("input", () => {});
}

if (itemUsableCountInput) {
  itemUsableCountInput.addEventListener("input", validateCreateUsabilityBreakdown);
}

if (itemNonUsableCountInput) {
  itemNonUsableCountInput.addEventListener("input", validateCreateUsabilityBreakdown);
}

if (itemAmountInput) {
  itemAmountInput.addEventListener("input", updateCreateTotalAmount);
}

if (itemAcquiredType) {
  itemAcquiredType.addEventListener("change", () => updateAcquiredDetailsUI(""));
}

if (inventoryTableWrap) {
  inventoryTableWrap.addEventListener("click", handleInventoryTableClick);
}

if (editInventoryForm) {
  editInventoryForm.addEventListener("submit", handleEditInventorySubmit);
}

if (editItemQuantityInput) {
  editItemQuantityInput.addEventListener("input", updateEditTotalAmount);
}

if (editItemQuantityPerPropertyCardInput) {
  editItemQuantityPerPropertyCardInput.addEventListener("input", () => {});
}

if (editItemQuantityPerPhysicalCountInput) {
  editItemQuantityPerPhysicalCountInput.addEventListener("input", () => {});
}

if (editItemUsableCountInput) {
  editItemUsableCountInput.addEventListener("input", validateEditUsabilityBreakdown);
}

if (editItemNonUsableCountInput) {
  editItemNonUsableCountInput.addEventListener("input", validateEditUsabilityBreakdown);
}

if (editItemAmountInput) {
  editItemAmountInput.addEventListener("input", updateEditTotalAmount);
}

if (editItemAcquiredType) {
  editItemAcquiredType.addEventListener("change", () => updateAcquiredDetailsUI("edit"));
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeEditModal);
}

if (editModal) {
  editModal.addEventListener("click", handleModalBackdropClick);
}

if (stockInForm) {
  stockInForm.addEventListener("submit", handleStockInSubmit);
}

if (stockOutForm) {
  stockOutForm.addEventListener("submit", handleStockOutSubmit);
}

if (closeStockInModalBtn) {
  closeStockInModalBtn.addEventListener("click", closeStockInModal);
}

if (closeStockOutModalBtn) {
  closeStockOutModalBtn.addEventListener("click", closeStockOutModal);
}

if (stockInModal) {
  stockInModal.addEventListener("click", handleStockInModalBackdropClick);
}

if (stockOutModal) {
  stockOutModal.addEventListener("click", handleStockOutModalBackdropClick);
}

if (filterTeacher) {
  filterTeacher.addEventListener("change", handleInventoryFilterChange);
}

if (filterStatus) {
  filterStatus.addEventListener("change", handleInventoryFilterChange);
}

if (filterItemType) {
  filterItemType.addEventListener("change", handleInventoryFilterChange);
}

if (searchInput) {
  searchInput.addEventListener("input", handleInventoryFilterChange);
}

if (downloadCsvBtn) {
  downloadCsvBtn.addEventListener("click", downloadInventoryCsv);
}

if (downloadTeachersCsvBtn) {
  downloadTeachersCsvBtn.addEventListener("click", downloadTeachersCsv);
}

if (downloadStockCardCsvBtn) {
  downloadStockCardCsvBtn.addEventListener("click", downloadStockCardCsv);
}

if (downloadPpeReportBtn) {
  downloadPpeReportBtn.addEventListener("click", downloadPpeReportCsv);
}

if (downloadSemiExpendableReportBtn) {
  downloadSemiExpendableReportBtn.addEventListener("click", downloadSemiExpendableReportCsv);
}

initializeApp();

async function initializeApp() {
  try {
    await refreshData();
  } catch (error) {
    console.error(error);
    renderErrorState("Unable to load data from the database.");
  }
}

async function refreshData() {
  const [teachers, inventory] = await Promise.all([
    apiFetch("/api/teachers"),
    apiFetch("/api/inventory"),
  ]);

  state.teachers = teachers;
  state.inventory = inventory;

  if (isStockCardItemPage) {
    await refreshStockCardItemHistory();
  }

  render();
}

async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function render() {
  renderStats();
  renderTeacherSelects();
  renderTeachers();
  renderInventory();
  renderStockCardItemPage();
  updateCreateTotalAmount();
  updateAcquiredDetailsUI("");
}

function renderStats() {
  if (!heroStats) {
    return;
  }

  const ppeCount = state.inventory.filter((item) => item.assetType === "PPE").length;
  const nonConsumableCount = state.inventory.filter((item) => item.assetType === "Not Expandable").length;
  const semiExpendableCount = state.inventory.filter((item) => item.assetType === "Semi-Expandable").length;

  heroStats.innerHTML = [
    statMarkup(state.teachers.length, "Personnel"),
    statMarkup(state.inventory.length, "Items"),
    statMarkup(ppeCount, "PPE"),
    statMarkup(nonConsumableCount, "Non Consumables"),
    statMarkup(semiExpendableCount, "Semi-Expendable"),
  ].join("");
}

function renderTeacherSelects() {
  const teacherOptions = state.teachers
    .map((teacher) => `<option value="${teacher.id}">${escapeHtml(getTeacherDisplayName(teacher))}</option>`)
    .join("");

  if (itemTeacher) {
    const selectedTeacher = itemTeacher.value;
    itemTeacher.innerHTML = `<option value="">Unassigned</option>${teacherOptions}`;

    if (selectedTeacher && state.teachers.some((teacher) => teacher.id === selectedTeacher)) {
      itemTeacher.value = selectedTeacher;
    }
  }

  if (editItemTeacher) {
    const selectedEditTeacher = editItemTeacher.value;
    editItemTeacher.innerHTML = `<option value="">Unassigned</option>${teacherOptions}`;

    if (selectedEditTeacher === "" || state.teachers.some((teacher) => teacher.id === selectedEditTeacher)) {
      editItemTeacher.value = selectedEditTeacher;
    }
  }

  if (filterTeacher) {
    const selectedFilter = filterTeacher.value;
    filterTeacher.innerHTML = `<option value="All">All Personnel</option>${teacherOptions}`;

    if (selectedFilter === "All" || state.teachers.some((teacher) => teacher.id === selectedFilter)) {
      filterTeacher.value = selectedFilter;
    }
  }

  if (stockOutTeacher) {
    const selectedStockOutTeacher = stockOutTeacher.value;
    stockOutTeacher.innerHTML = `<option value="">Select personnel</option>${teacherOptions}`;

    if (selectedStockOutTeacher && state.teachers.some((teacher) => teacher.id === selectedStockOutTeacher)) {
      stockOutTeacher.value = selectedStockOutTeacher;
    }
  }
}

async function handleTeacherSubmit(event) {
  event.preventDefault();

  const teacher = collectTeacherFormData("");

  try {
    await apiFetch("/api/teachers", {
      method: "POST",
      body: JSON.stringify(teacher),
    });

    teacherForm.reset();
    document.querySelector("#teacherCurrentPosition").value = "Principal I";
    document.querySelector("#teacherCivilStatus").value = "Single";
    document.querySelector("#teacherGender").value = "Female";
    closeAddTeacherModal();
    await refreshData();
  } catch (error) {
    console.error(error);
    window.alert("Unable to save teacher.");
  }
}

function renderTeachers() {
  if (!teacherList || !teacherTemplate) {
    return;
  }

  teacherList.innerHTML = "";

  if (!state.teachers.length) {
    teacherList.innerHTML = `<div class="empty-state">No personnel yet. Add one to start tagging inventory items.</div>`;
    return;
  }

  state.teachers.forEach((teacher) => {
    const card = teacherTemplate.content.cloneNode(true);
    const assignedCount = state.inventory.filter((item) => item.teacherId === teacher.id).length;

    card.querySelector("h3").textContent = getTeacherDisplayName(teacher);
    card.querySelector(".teacher-meta").textContent = [
      teacher.department,
      teacher.currentPosition || "",
      teacher.gender || "",
      teacher.civilStatus || "",
      teacher.email || "No email provided",
    ]
      .filter(Boolean)
      .join(" • ");
    card.querySelector(".pill").textContent = `${assignedCount} assigned`;
    card.querySelector("[data-action='edit-teacher']").dataset.teacherId = teacher.id;
    card.querySelector("[data-action='delete-teacher']").dataset.teacherId = teacher.id;

    teacherList.append(card);
  });
}

async function handleTeacherListClick(event) {
  const editButton = event.target.closest("[data-action='edit-teacher']");
  const deleteButton = event.target.closest("[data-action='delete-teacher']");

  if (editButton) {
    openTeacherModal(editButton.dataset.teacherId);
    return;
  }

  if (!deleteButton) {
    return;
  }

  try {
    await apiFetch(`/api/teachers/${deleteButton.dataset.teacherId}`, { method: "DELETE" });
    await refreshData();
  } catch (error) {
    console.error(error);
    window.alert("Unable to delete teacher.");
  }
}

async function handleEditTeacherSubmit(event) {
  event.preventDefault();

  if (!editingTeacherId) {
    closeTeacherModal();
    return;
  }

  try {
    await apiFetch(`/api/teachers/${editingTeacherId}`, {
      method: "PUT",
      body: JSON.stringify(collectTeacherFormData("edit")),
    });

    closeTeacherModal();
    await refreshData();
  } catch (error) {
    console.error(error);
    window.alert("Unable to update teacher.");
  }
}

async function handleInventorySubmit(event) {
  event.preventDefault();

  const teacherId = itemTeacher ? itemTeacher.value : "";
  const selectedStatus = document.querySelector("#itemStatus").value;

  const item = {
    name: document.querySelector("#itemName").value.trim(),
    category: document.querySelector("#itemCategory").value.trim(),
    description: document.querySelector("#itemDescription").value.trim(),
    assetTag: document.querySelector("#itemTag").value.trim(),
    quantity: Number(document.querySelector("#itemQuantity").value),
    quantityPerPropertyCard: Number(document.querySelector("#itemQuantityPerPropertyCard").value),
    quantityPerPhysicalCount: Number(document.querySelector("#itemQuantityPerPhysicalCount").value),
    usableCount: Number(document.querySelector("#itemUsableCount").value),
    nonUsableCount: Number(document.querySelector("#itemNonUsableCount").value),
    unitOfMeasurement: document.querySelector("#itemUnit").value.trim(),
    amount: Number(document.querySelector("#itemAmount").value),
    uacsCode: document.querySelector("#itemUacsCode").value.trim(),
    fundClusterCode: document.querySelector("#itemFundClusterCode").value.trim(),
    icsNumberSource: document.querySelector("#itemIcsNumberSource").value.trim(),
    icsNumberDistribute: document.querySelector("#itemIcsNumberDistribute").value.trim(),
    referenceNumber: document.querySelector("#itemReferenceNumber").value.trim(),
    assetType: document.querySelector("#itemAssetType").value,
    acquiredType: document.querySelector("#itemAcquiredType").value,
    acquiredDetails: getAcquiredDetailsValue(""),
    location: document.querySelector("#itemLocation").value.trim(),
    status: getStatusForAssignment(selectedStatus, teacherId),
    teacherId,
    assignedDate: normalizeAssignedDate(document.querySelector("#itemAssignedDate").value, teacherId),
    notes: document.querySelector("#itemNotes").value.trim(),
  };

  try {
    if (!validateUsabilityBreakdown("", true)) {
      return;
    }

    await apiFetch("/api/inventory", {
      method: "POST",
      body: JSON.stringify(item),
    });

    inventoryForm.reset();
    document.querySelector("#itemQuantity").value = 1;
    document.querySelector("#itemQuantityPerPropertyCard").value = 0;
    document.querySelector("#itemQuantityPerPhysicalCount").value = 0;
    document.querySelector("#itemUsableCount").value = 0;
    document.querySelector("#itemNonUsableCount").value = 0;
    document.querySelector("#itemUnit").value = "";
    document.querySelector("#itemAssetType").value = "PPE";
    document.querySelector("#itemAcquiredType").value = "Purchase";
    document.querySelector("#itemStatus").value = "Available";
    updateCreateTotalAmount();
  validateCreateUsabilityBreakdown();
    updateAcquiredDetailsUI("");
    await refreshData();
  } catch (error) {
    console.error(error);
    window.alert("Unable to save inventory item.");
  }
}

function renderInventory() {
  if (!inventoryTableWrap) {
    return;
  }

  const filteredItems = getFilteredInventoryItems();
  const totalPages = isInventoryListPage ? Math.max(1, Math.ceil(filteredItems.length / INVENTORY_PAGE_SIZE)) : 1;

  if (isInventoryListPage) {
    currentInventoryPage = Math.min(currentInventoryPage, totalPages);
  } else {
    currentInventoryPage = 1;
  }

  if (!filteredItems.length) {
    inventoryTableWrap.innerHTML = `<div class="empty-state">${
      isStockCardPage
        ? "No consumable items match the current filters."
        : isInventoryItemPage
          ? "No PPE or semi-expendable items match the current filters."
          : "No inventory items match the current filters."
    }</div>`;
    return;
  }

  const paginatedItems = isInventoryListPage
    ? filteredItems.slice((currentInventoryPage - 1) * INVENTORY_PAGE_SIZE, currentInventoryPage * INVENTORY_PAGE_SIZE)
    : filteredItems;

  inventoryTableWrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Asset</th>
          <th>Property Number</th>
          <th>Category</th>
          ${isStockCardPage ? "<th>Description</th>" : ""}
          ${isStockCardPage ? "<th>Unit of Measurement</th>" : ""}
          ${isStockCardPage ? "<th>Remaining Quantity</th>" : ""}
          <th>Price per Item</th>
          ${isStockCardPage ? "<th>Status</th>" : ""}
          ${isStockCardPage ? "" : "<th>Assigned Personnel</th>"}
          ${isStockCardPage ? "" : "<th>Quantity per Physical Count</th>"}
          <th>Location</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${paginatedItems
          .map((item) => {
            const teacher = state.teachers.find((entry) => entry.id === item.teacherId);

            return `
              <tr>
                <td>
                  ${isStockCardPage ? `<a class="item-link" href="stock-card-item.html?id=${encodeURIComponent(item.id)}"><strong>${escapeHtml(item.name)}</strong></a>` : `<strong>${escapeHtml(item.name)}</strong>`}<br>
                  ${isStockCardPage ? `<span class="notes">${escapeHtml(item.category)}</span><br>` : ""}
                  <span class="notes">${escapeHtml(item.description || "No description")}</span>
                </td>
                <td>${escapeHtml(item.assetTag)}</td>
                <td>${escapeHtml(item.category)}${!isStockCardPage ? `<br><span class="notes">UACS: ${escapeHtml(item.uacsCode || "-")}</span>` : ""}</td>
                ${isStockCardPage ? `<td>${escapeHtml(item.description || "No description")}</td>` : ""}
                ${isStockCardPage ? `<td>${escapeHtml(item.unitOfMeasurement || "unit")}</td>` : ""}
                ${isStockCardPage ? `<td><strong>${item.quantity}</strong></td>` : ""}
                <td>
                  ${
                    isStockCardPage
                      ? `<span class="notes">${formatCurrency(item.amount)}</span>`
                      : `<span class="notes">Type of Item: ${escapeHtml(formatItemTypeLabel(item.assetType || "-"))}</span><br>
                  <span class="notes">Acquired: ${escapeHtml(item.acquiredType || "-")}</span><br>
                  <span class="notes">Acquired Details: ${escapeHtml(item.acquiredDetails || "-")}</span><br>
                  <span class="notes">${formatCurrency(item.amount)}</span><br>
                  <span class="notes">Total amount: ${formatCurrency(getInventoryTotalAmount(item))}</span><br>
                  <span class="notes">Fund Cluster: ${escapeHtml(item.fundClusterCode || "-")}</span><br>
                  <span class="notes">ICS Number (Source): ${escapeHtml(item.icsNumberSource || "-")}</span><br>
                  <span class="notes">ICS Number (Distribute): ${escapeHtml(item.icsNumberDistribute || "-")}</span><br>
                  <span class="notes">Reference Number: ${escapeHtml(item.referenceNumber || "-")}</span>`
                  }
                </td>
                ${isStockCardPage ? `<td><span class="status-badge status-${item.status}">${escapeHtml(formatStatusLabel(item.status))}</span></td>` : ""}
                ${isStockCardPage ? "" : `<td>${teacher ? `${escapeHtml(getTeacherDisplayName(teacher))}<br><span class="notes">${escapeHtml(teacher.currentPosition || teacher.department || "")}</span>` : "Unassigned"}</td>`}
                ${isStockCardPage ? "" : `<td>${item.quantityPerPhysicalCount ?? 0}</td>`}
                <td>${escapeHtml(item.location)}</td>
                <td>
                  <div class="table-actions">
                    ${
                      isStockCardPage
                        ? `<button class="primary-btn table-action-btn" type="button" data-action="stock-in-item" data-item-id="${item.id}">Stock In</button>
                    <button class="primary-btn table-action-btn" type="button" data-action="stock-out-item" data-item-id="${item.id}">Stock Out</button>`
                        : ""
                    }
                    <button class="primary-btn table-action-btn" type="button" data-action="edit-item" data-item-id="${item.id}">Edit</button>
                    <button class="ghost-btn table-delete-btn" type="button" data-action="delete-item" data-item-id="${item.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
    ${
      isInventoryListPage
        ? `<div class="pagination-bar">
      <button class="ghost-btn pagination-btn" type="button" data-action="inventory-page-prev" ${currentInventoryPage === 1 ? "disabled" : ""}>Previous</button>
      <span class="notes">Page ${currentInventoryPage} of ${totalPages}</span>
      <button class="ghost-btn pagination-btn" type="button" data-action="inventory-page-next" ${currentInventoryPage === totalPages ? "disabled" : ""}>Next</button>
    </div>`
        : ""
    }
  `;
}

function getFilteredInventoryItems() {
  const teacherFilterValue = filterTeacher ? filterTeacher.value : "All";
  const statusFilterValue = filterStatus ? filterStatus.value : "All";
  const itemTypeFilterValue = filterItemType ? filterItemType.value : "All";
  const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";

  return state.inventory.filter((item) => {
    const stockCardMatch = !isStockCardPage || item.assetType === "Not Expandable";
    const inventoryItemMatch = !isInventoryItemPage || item.assetType !== "Not Expandable";
    const teacherMatch = teacherFilterValue === "All" || item.teacherId === teacherFilterValue;
    const statusMatch = statusFilterValue === "All" || item.status === statusFilterValue;
    const itemTypeMatch = itemTypeFilterValue === "All" || item.assetType === itemTypeFilterValue;
    const searchMatch =
      !searchValue ||
      [
        item.name,
        item.category,
        item.description,
        item.assetTag,
        item.location,
        item.notes,
        item.unitOfMeasurement,
        item.uacsCode,
        item.fundClusterCode,
        item.assetType,
        item.acquiredType,
        item.acquiredDetails,
        item.amount,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);

    return stockCardMatch && inventoryItemMatch && teacherMatch && statusMatch && itemTypeMatch && searchMatch;
  });
}

function downloadInventoryCsv() {
  if (!isInventoryListPage) {
    return;
  }

  const filteredItems = getFilteredInventoryItems();

  if (!filteredItems.length) {
    window.alert("There are no inventory items to export.");
    return;
  }

  const rows = [
    [
      "Item Name",
      "Category",
      "Description",
      "Property Number",
      "Quantity",
      "Quantity per Property Card",
      "Quantity per Physical Count",
      "No. of Usable",
      "No. of Non-usable",
      "Unit of Measurement",
      "Price per Item",
      "Total Amount",
      "UACS Code",
      "Fund Cluster Code",
      "ICS Number (Source)",
      "ICS Number (Distribute)",
      "Reference Number",
      "Type of Item",
      "Acquired",
      "Acquired Details",
      "Status",
      "Assigned Personnel",
      "Date Assigned",
      "Location",
      "Notes",
    ],
    ...filteredItems.map((item) => {
      const teacher = state.teachers.find((entry) => entry.id === item.teacherId);

      return [
        item.name,
        item.category,
        item.description || "",
        item.assetTag,
        item.quantity,
        item.quantityPerPropertyCard ?? 0,
        item.quantityPerPhysicalCount ?? 0,
        item.usableCount ?? 0,
        item.nonUsableCount ?? 0,
        item.unitOfMeasurement || "",
        Number(item.amount) || 0,
        getInventoryTotalAmount(item),
        item.uacsCode || "",
        item.fundClusterCode || "",
        item.icsNumberSource || "",
        item.icsNumberDistribute || "",
        item.referenceNumber || "",
        formatItemTypeLabel(item.assetType || ""),
        item.acquiredType || "",
        item.acquiredDetails || "",
        formatStatusLabel(item.status),
        teacher ? getTeacherDisplayName(teacher) : "",
        item.assignedDate || "",
        item.location || "",
        item.notes || "",
      ];
    }),
  ];

  const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `inventory-listing-${todayISO()}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadTeachersCsv() {
  if (!state.teachers.length) {
    window.alert("There are no personnel records to export.");
    return;
  }

  const rows = [
    [
      "Last Name",
      "First Name",
      "Middle Name",
      "Suffix Name",
      "Department",
      "Current Position",
      "Email",
      "Date of Birth",
      "Date Hired in Toledo City Division",
      "Date Hired in Government",
      "GSIS Number",
      "PhilHealth Number",
      "TIN Number",
      "Pag-IBIG Number",
      "SSS Number",
      "Civil Status",
      "Gender",
    ],
    ...state.teachers.map((teacher) => [
      teacher.lastName || "",
      teacher.firstName || "",
      teacher.middleName || "",
      teacher.suffixName || "",
      teacher.department || "",
      teacher.currentPosition || "",
      teacher.email || "",
      teacher.dateOfBirth || "",
      teacher.dateHiredToledo || "",
      teacher.dateHiredGovernment || "",
      teacher.gsisNumber || "",
      teacher.philhealthNumber || "",
      teacher.tinNumber || "",
      teacher.pagibigNumber || "",
      teacher.sssNumber || "",
      teacher.civilStatus || "",
      teacher.gender || "",
    ]),
  ];

  downloadCsvFile(rows, `personnel-list-${todayISO()}.csv`);
}

function downloadStockCardCsv() {
  if (!isStockCardPage) {
    return;
  }

  const filteredItems = getFilteredInventoryItems();

  if (!filteredItems.length) {
    window.alert("There are no consumable items to export.");
    return;
  }

  const rows = [
    [
      "Item Name",
      "Category",
      "Description",
      "Property Number",
      "Unit of Measurement",
      "Remaining Quantity",
      "Price per Item",
      "Status",
      "Location",
    ],
    ...filteredItems.map((item) => [
      item.name,
      item.category,
      item.description || "",
      item.assetTag,
      item.unitOfMeasurement || "",
      item.quantity,
      Number(item.amount) || 0,
      formatStatusLabel(item.status),
      item.location || "",
    ]),
  ];

  downloadCsvFile(rows, `stock-card-${todayISO()}.csv`);
}

function downloadPpeReportCsv() {
  const ppeItems = state.inventory.filter((item) => item.assetType === "PPE");

  if (!ppeItems.length) {
    window.alert("There are no PPE items to export.");
    return;
  }

  const rows = [
    [
      "Item Name",
      "Category",
      "Description",
      "Property Number",
      "Quantity",
      "Quantity per Property Card",
      "Quantity per Physical Count",
      "No. of Usable",
      "No. of Non-usable",
      "Unit of Measurement",
      "Price per Item",
      "Total Amount",
      "UACS Code",
      "Fund Cluster Code",
      "ICS Number (Source)",
      "ICS Number (Distribute)",
      "Reference Number",
      "Acquired",
      "Acquired Details",
      "Status",
      "Assigned Personnel",
      "Current Position",
      "Location",
      "Notes",
    ],
    ...ppeItems.map((item) => {
      const teacher = state.teachers.find((entry) => entry.id === item.teacherId);

      return [
        item.name,
        item.category,
        item.description || "",
        item.assetTag,
        item.quantity,
        item.quantityPerPropertyCard ?? 0,
        item.quantityPerPhysicalCount ?? 0,
        item.usableCount ?? 0,
        item.nonUsableCount ?? 0,
        item.unitOfMeasurement || "",
        Number(item.amount) || 0,
        getInventoryTotalAmount(item),
        item.uacsCode || "",
        item.fundClusterCode || "",
        item.icsNumberSource || "",
        item.icsNumberDistribute || "",
        item.referenceNumber || "",
        item.acquiredType || "",
        item.acquiredDetails || "",
        formatStatusLabel(item.status),
        teacher ? getTeacherDisplayName(teacher) : "",
        teacher ? teacher.currentPosition || "" : "",
        item.location || "",
        item.notes || "",
      ];
    }),
  ];

  downloadCsvFile(rows, `ppe-physical-count-report-${todayISO()}.csv`);
}

function downloadSemiExpendableReportCsv() {
  const semiExpendableItems = state.inventory.filter((item) => item.assetType === "Semi-Expandable");

  if (!semiExpendableItems.length) {
    window.alert("There are no Semi-Expendable items to export.");
    return;
  }

  const rows = [
    [
      "Item Name",
      "Category",
      "Description",
      "Property Number",
      "Quantity",
      "Quantity per Property Card",
      "Quantity per Physical Count",
      "No. of Usable",
      "No. of Non-usable",
      "Unit of Measurement",
      "Price per Item",
      "Total Amount",
      "UACS Code",
      "Fund Cluster Code",
      "ICS Number (Source)",
      "ICS Number (Distribute)",
      "Reference Number",
      "Acquired",
      "Acquired Details",
      "Status",
      "Assigned Personnel",
      "Current Position",
      "Location",
      "Notes",
    ],
    ...semiExpendableItems.map((item) => {
      const teacher = state.teachers.find((entry) => entry.id === item.teacherId);

      return [
        item.name,
        item.category,
        item.description || "",
        item.assetTag,
        item.quantity,
        item.quantityPerPropertyCard ?? 0,
        item.quantityPerPhysicalCount ?? 0,
        item.usableCount ?? 0,
        item.nonUsableCount ?? 0,
        item.unitOfMeasurement || "",
        Number(item.amount) || 0,
        getInventoryTotalAmount(item),
        item.uacsCode || "",
        item.fundClusterCode || "",
        item.icsNumberSource || "",
        item.icsNumberDistribute || "",
        item.referenceNumber || "",
        item.acquiredType || "",
        item.acquiredDetails || "",
        formatStatusLabel(item.status),
        teacher ? getTeacherDisplayName(teacher) : "",
        teacher ? teacher.currentPosition || "" : "",
        item.location || "",
        item.notes || "",
      ];
    }),
  ];

  downloadCsvFile(rows, `rpcsp-report-${todayISO()}.csv`);
}

function downloadCsvFile(rows, filename) {
  const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function handleInventoryFilterChange() {
  currentInventoryPage = 1;
  renderInventory();
}

async function handleInventoryTableClick(event) {
  const prevPageButton = event.target.closest("[data-action='inventory-page-prev']");
  const nextPageButton = event.target.closest("[data-action='inventory-page-next']");
  const stockInButton = event.target.closest("[data-action='stock-in-item']");
  const stockOutButton = event.target.closest("[data-action='stock-out-item']");
  const editButton = event.target.closest("[data-action='edit-item']");
  const deleteButton = event.target.closest("[data-action='delete-item']");

  if (prevPageButton) {
    currentInventoryPage = Math.max(1, currentInventoryPage - 1);
    renderInventory();
    return;
  }

  if (nextPageButton) {
    const totalPages = Math.max(1, Math.ceil(getFilteredInventoryItems().length / INVENTORY_PAGE_SIZE));
    currentInventoryPage = Math.min(totalPages, currentInventoryPage + 1);
    renderInventory();
    return;
  }

  if (stockInButton) {
    openStockInModal(stockInButton.dataset.itemId);
    return;
  }

  if (stockOutButton) {
    openStockOutModal(stockOutButton.dataset.itemId);
    return;
  }

  if (editButton) {
    openEditModal(editButton.dataset.itemId);
    return;
  }

  if (!deleteButton) {
    return;
  }

  const itemId = deleteButton.dataset.itemId;
  const item = state.inventory.find((entry) => entry.id === itemId);

  if (!item) {
    return;
  }

  if (!window.confirm(`Delete "${item.name}" from the inventory list?`)) {
    return;
  }

  try {
    await apiFetch(`/api/inventory/${itemId}`, { method: "DELETE" });
    await refreshData();
  } catch (error) {
    console.error(error);
    window.alert("Unable to delete inventory item.");
  }
}

function openEditModal(itemId) {
  if (!editModal || !editInventoryForm || !editItemTeacher) {
    return;
  }

  const item = state.inventory.find((entry) => entry.id === itemId);

  if (!item) {
    return;
  }

  editingItemId = item.id;
  document.querySelector("#editItemName").value = item.name;
  document.querySelector("#editItemCategory").value = item.category;
  document.querySelector("#editItemDescription").value = item.description || "";
  document.querySelector("#editItemTag").value = item.assetTag;
  document.querySelector("#editItemQuantity").value = item.quantity;
  document.querySelector("#editItemQuantityPerPropertyCard").value = item.quantityPerPropertyCard ?? 0;
  document.querySelector("#editItemQuantityPerPhysicalCount").value = item.quantityPerPhysicalCount ?? 0;
  document.querySelector("#editItemUsableCount").value = item.usableCount ?? 0;
  document.querySelector("#editItemNonUsableCount").value = item.nonUsableCount ?? 0;
  document.querySelector("#editItemUnit").value = item.unitOfMeasurement || "";
  document.querySelector("#editItemAmount").value = item.amount ?? "";
  updateEditTotalAmount();
  validateEditUsabilityBreakdown();
  document.querySelector("#editItemUacsCode").value = item.uacsCode || "";
  document.querySelector("#editItemFundClusterCode").value = item.fundClusterCode || "";
  document.querySelector("#editItemIcsNumberSource").value = item.icsNumberSource || "";
  document.querySelector("#editItemIcsNumberDistribute").value = item.icsNumberDistribute || "";
  document.querySelector("#editItemReferenceNumber").value = item.referenceNumber || "";
  document.querySelector("#editItemAssetType").value = item.assetType || "PPE";
  document.querySelector("#editItemAcquiredType").value = item.acquiredType || "Not Applicable";
  document.querySelector("#editItemAcquiredDetails").value = item.acquiredDetails || "";
  updateAcquiredDetailsUI("edit");
  document.querySelector("#editItemLocation").value = item.location;
  document.querySelector("#editItemStatus").value = item.status;
  editItemTeacher.value = item.teacherId || "";
  document.querySelector("#editItemAssignedDate").value = item.assignedDate || "";
  document.querySelector("#editItemNotes").value = item.notes || "";
  editModal.classList.remove("hidden");
}

async function handleEditInventorySubmit(event) {
  event.preventDefault();

  const item = state.inventory.find((entry) => entry.id === editingItemId);

  if (!item) {
    closeEditModal();
    return;
  }

  const teacherId = editItemTeacher.value;
  const updatedItem = {
    name: document.querySelector("#editItemName").value.trim(),
    category: document.querySelector("#editItemCategory").value.trim(),
    description: document.querySelector("#editItemDescription").value.trim(),
    assetTag: document.querySelector("#editItemTag").value.trim(),
    quantity: Math.max(1, Number(document.querySelector("#editItemQuantity").value) || 1),
    quantityPerPropertyCard: Math.max(0, Number(document.querySelector("#editItemQuantityPerPropertyCard").value) || 0),
    quantityPerPhysicalCount: Math.max(0, Number(document.querySelector("#editItemQuantityPerPhysicalCount").value) || 0),
    usableCount: Math.max(0, Number(document.querySelector("#editItemUsableCount").value) || 0),
    nonUsableCount: Math.max(0, Number(document.querySelector("#editItemNonUsableCount").value) || 0),
    unitOfMeasurement: document.querySelector("#editItemUnit").value.trim(),
    amount: Math.max(0, Number(document.querySelector("#editItemAmount").value) || 0),
    uacsCode: document.querySelector("#editItemUacsCode").value.trim(),
    fundClusterCode: document.querySelector("#editItemFundClusterCode").value.trim(),
    icsNumberSource: document.querySelector("#editItemIcsNumberSource").value.trim(),
    icsNumberDistribute: document.querySelector("#editItemIcsNumberDistribute").value.trim(),
    referenceNumber: document.querySelector("#editItemReferenceNumber").value.trim(),
    assetType: document.querySelector("#editItemAssetType").value,
    acquiredType: document.querySelector("#editItemAcquiredType").value,
    acquiredDetails: getAcquiredDetailsValue("edit"),
    location: document.querySelector("#editItemLocation").value.trim(),
    status: getStatusForAssignment(document.querySelector("#editItemStatus").value, teacherId),
    teacherId,
    assignedDate: normalizeAssignedDate(document.querySelector("#editItemAssignedDate").value, teacherId),
    notes: document.querySelector("#editItemNotes").value.trim(),
  };

  try {
    if (!validateUsabilityBreakdown("edit", true)) {
      return;
    }

    await apiFetch(`/api/inventory/${editingItemId}`, {
      method: "PUT",
      body: JSON.stringify(updatedItem),
    });

    closeEditModal();
    await refreshData();
  } catch (error) {
    console.error(error);
    window.alert("Unable to update inventory item.");
  }
}

function closeEditModal() {
  if (!editModal || !editInventoryForm) {
    return;
  }

  editingItemId = "";
  editInventoryForm.reset();
  updateEditTotalAmount();
  validateEditUsabilityBreakdown();
  updateAcquiredDetailsUI("edit");
  editModal.classList.add("hidden");
}

function handleModalBackdropClick(event) {
  if (event.target === editModal) {
    closeEditModal();
  }
}

function openStockInModal(itemId) {
  if (!stockInModal || !stockInForm) {
    return;
  }

  const item = state.inventory.find((entry) => entry.id === itemId);

  if (!item) {
    return;
  }

  stockMovementItemId = item.id;
  document.querySelector("#stockInItemName").textContent = `${item.name} (${item.assetTag})`;
  document.querySelector("#stockInQuantity").value = 1;
  document.querySelector("#stockInDate").value = todayISO();
  document.querySelector("#stockInRemarks").value = "";
  stockInModal.classList.remove("hidden");
}

function closeStockInModal() {
  if (!stockInModal || !stockInForm) {
    return;
  }

  stockMovementItemId = "";
  stockInForm.reset();
  stockInModal.classList.add("hidden");
}

function openStockOutModal(itemId) {
  if (!stockOutModal || !stockOutForm) {
    return;
  }

  const item = state.inventory.find((entry) => entry.id === itemId);

  if (!item) {
    return;
  }

  stockMovementItemId = item.id;
  document.querySelector("#stockOutItemName").textContent = `${item.name} (${item.assetTag})`;
  document.querySelector("#stockOutQuantity").value = 1;
  document.querySelector("#stockOutQuantity").max = Math.max(0, Number(item.usableCount) || 0);
  if (stockOutTeacher) {
    stockOutTeacher.value = "";
  }
  document.querySelector("#stockOutDate").value = todayISO();
  document.querySelector("#stockOutRemarks").value = "";
  stockOutModal.classList.remove("hidden");
}

function closeStockOutModal() {
  if (!stockOutModal || !stockOutForm) {
    return;
  }

  stockMovementItemId = "";
  stockOutForm.reset();
  stockOutModal.classList.add("hidden");
}

async function handleStockInSubmit(event) {
  event.preventDefault();

  const item = state.inventory.find((entry) => entry.id === stockMovementItemId);

  if (!item) {
    closeStockInModal();
    return;
  }

  const quantityToAdd = Math.max(1, Number(document.querySelector("#stockInQuantity").value) || 0);
  const movementDate = document.querySelector("#stockInDate").value || todayISO();
  const remarks = document.querySelector("#stockInRemarks").value.trim();

  try {
    await apiFetch(`/api/inventory/${item.id}/movements`, {
      method: "POST",
      body: JSON.stringify({
        movementType: "in",
        quantity: quantityToAdd,
        movementDate,
        remarks,
      }),
    });

    closeStockInModal();
    await refreshData();
  } catch (error) {
    console.error(error);
    window.alert("Unable to save stock in.");
  }
}

async function handleStockOutSubmit(event) {
  event.preventDefault();

  const item = state.inventory.find((entry) => entry.id === stockMovementItemId);

  if (!item) {
    closeStockOutModal();
    return;
  }

  const quantityToDeduct = Math.max(1, Number(document.querySelector("#stockOutQuantity").value) || 0);

  if (quantityToDeduct > (Number(item.usableCount) || 0)) {
    window.alert("Stock out quantity cannot be greater than the current usable quantity.");
    return;
  }

  if (quantityToDeduct >= (Number(item.quantity) || 0)) {
    window.alert("Stock out quantity must leave at least 1 item in stock.");
    return;
  }

  const movementDate = document.querySelector("#stockOutDate").value || todayISO();
  const remarks = document.querySelector("#stockOutRemarks").value.trim();
  const personnelId = stockOutTeacher?.value || "";
  const personnel = state.teachers.find((entry) => entry.id === personnelId);

  if (!personnel) {
    window.alert("Please select the personnel for this stock out.");
    return;
  }

  try {
    await apiFetch(`/api/inventory/${item.id}/movements`, {
      method: "POST",
      body: JSON.stringify({
        movementType: "out",
        quantity: quantityToDeduct,
        movementDate,
        remarks,
        personnelName: getTeacherDisplayName(personnel),
      }),
    });

    closeStockOutModal();
    await refreshData();
  } catch (error) {
    console.error(error);
    window.alert("Unable to save stock out.");
  }
}

function handleTeacherModalBackdropClick(event) {
  if (event.target === editTeacherModal) {
    closeTeacherModal();
  }
}

function renderErrorState(message) {
  if (heroStats) {
    heroStats.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
  }

  if (teacherList) {
    teacherList.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
  }

  if (inventoryTableWrap) {
    inventoryTableWrap.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
  }
}

function collectTeacherFormData(prefix) {
  const get = (id) => document.querySelector(`#${prefix ? `${prefix}Teacher` : "teacher"}${id}`);

  return {
    lastName: get("LastName").value.trim(),
    firstName: get("FirstName").value.trim(),
    middleName: get("MiddleName").value.trim(),
    suffixName: get("SuffixName").value.trim(),
    department: get("Department").value.trim(),
    currentPosition: get("CurrentPosition").value,
    email: get("Email").value.trim(),
    dateOfBirth: get("DateOfBirth").value,
    dateHiredToledo: get("DateHiredToledo").value,
    dateHiredGovernment: get("DateHiredGovernment").value,
    gsisNumber: get("GsisNumber").value.trim(),
    philhealthNumber: get("PhilhealthNumber").value.trim(),
    tinNumber: get("TinNumber").value.trim(),
    pagibigNumber: get("PagibigNumber").value.trim(),
    sssNumber: get("SssNumber").value.trim(),
    civilStatus: get("CivilStatus").value,
    gender: get("Gender").value,
  };
}

function statMarkup(value, label) {
  return `<div class="stat-block"><strong>${value}</strong><span>${label}</span></div>`;
}

function getStatusForAssignment(currentStatus, teacherId) {
  if (teacherId) {
    return currentStatus === "Available" ? "Assigned" : currentStatus;
  }

  return currentStatus === "Assigned" ? "Available" : currentStatus;
}

function normalizeAssignedDate(currentAssignedDate, teacherId) {
  if (teacherId) {
    return currentAssignedDate || todayISO();
  }

  return "";
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatAssignedDate(assignedDate) {
  if (!assignedDate) {
    return "Not assigned yet";
  }

  return new Date(`${assignedDate}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(amount) || 0);
}

function getInventoryTotalAmount(item) {
  return (Number(item.quantity) || 0) * (Number(item.amount) || 0);
}

function calculateTotalAmount(quantity, amount) {
  return (Number(quantity) || 0) * (Number(amount) || 0);
}

function updateCreateTotalAmount() {
  if (!itemTotalAmountInput) {
    return;
  }

  itemTotalAmountInput.value = calculateTotalAmount(itemQuantityInput?.value, itemAmountInput?.value).toFixed(2);
}

function updateEditTotalAmount() {
  if (!editItemTotalAmountInput) {
    return;
  }

  editItemTotalAmountInput.value = calculateTotalAmount(editItemQuantityInput?.value, editItemAmountInput?.value).toFixed(2);
}

function validateCreateUsabilityBreakdown() {
  return validateUsabilityBreakdown("");
}

function validateEditUsabilityBreakdown() {
  return validateUsabilityBreakdown("edit");
}

function validateUsabilityBreakdown(prefix, showAlert = false) {
  const quantityInput = prefix === "edit" ? editItemQuantityInput : itemQuantityInput;
  const usableInput = prefix === "edit" ? editItemUsableCountInput : itemUsableCountInput;
  const nonUsableInput = prefix === "edit" ? editItemNonUsableCountInput : itemNonUsableCountInput;

  if (!quantityInput || !usableInput || !nonUsableInput) {
    return true;
  }

  const quantity = Number(quantityInput.value) || 0;
  const usable = Number(usableInput.value) || 0;
  const nonUsable = Number(nonUsableInput.value) || 0;
  const isValid = usable + nonUsable === quantity;
  const message = "No. of Usable plus No. of Non-usable must equal Quantity.";

  usableInput.setCustomValidity(isValid ? "" : message);
  nonUsableInput.setCustomValidity(isValid ? "" : message);

  if (!isValid && showAlert) {
    window.alert(message);
  }

  return isValid;
}

function updateAcquiredDetailsUI(prefix) {
  const typeSelect = prefix === "edit" ? editItemAcquiredType : itemAcquiredType;
  const wrap = prefix === "edit" ? editItemAcquiredDetailsWrap : itemAcquiredDetailsWrap;
  const label = prefix === "edit" ? editItemAcquiredDetailsLabel : itemAcquiredDetailsLabel;
  const input = prefix === "edit" ? editItemAcquiredDetailsInput : itemAcquiredDetailsInput;

  if (!typeSelect || !wrap || !label || !input) {
    return;
  }

  const selected = typeSelect.value;

  if (selected === "Purchase") {
    wrap.hidden = false;
    label.textContent = "Store/Establishment Purchased";
    input.placeholder = "Enter store or establishment";
    input.required = true;
    return;
  }

  if (selected === "Donated") {
    wrap.hidden = false;
    label.textContent = "Donated By";
    input.placeholder = "Enter donor name";
    input.required = true;
    return;
  }

  wrap.hidden = true;
  input.value = "";
  input.required = false;
}

function getAcquiredDetailsValue(prefix) {
  const type = prefix === "edit" ? editItemAcquiredType?.value : itemAcquiredType?.value;
  const input = prefix === "edit" ? editItemAcquiredDetailsInput : itemAcquiredDetailsInput;

  if (!input || type === "Not Applicable") {
    return "";
  }

  return input.value.trim();
}

function getAcquiredDetailsText(type, details) {
  if (type === "Purchase") {
    return `Purchased from: ${details}`;
  }

  if (type === "Donated") {
    return `Donated by: ${details}`;
  }

  return details;
}

function getTeacherDisplayName(teacher) {
  if (teacher.name) {
    return teacher.name;
  }

  const suffix = teacher.suffixName ? ` ${teacher.suffixName}` : "";
  const middle = teacher.middleName ? ` ${teacher.middleName}` : "";

  return `${teacher.lastName || ""}, ${teacher.firstName || ""}${middle}${suffix}`.replace(/^,\s*/, "").trim();
}

function formatItemTypeLabel(type) {
  if (type === "PPE") {
    return "Property, Plant, and Equipment (PPE)";
  }

  if (type === "Semi-Expandable") {
    return "Semi-Expendable Property";
  }

  if (type === "Not Expandable") {
    return "Consumables/Non Property Items";
  }

  return type;
}

function formatStatusLabel(status) {
  if (status === "Retired") {
    return "For Repair / Not Working";
  }

  return status;
}

function openTeacherModal(teacherId) {
  if (!editTeacherModal || !editTeacherForm) {
    return;
  }

  const teacher = state.teachers.find((entry) => entry.id === teacherId);

  if (!teacher) {
    return;
  }

  editingTeacherId = teacher.id;
  document.querySelector("#editTeacherLastName").value = teacher.lastName || "";
  document.querySelector("#editTeacherFirstName").value = teacher.firstName || "";
  document.querySelector("#editTeacherMiddleName").value = teacher.middleName || "";
  document.querySelector("#editTeacherSuffixName").value = teacher.suffixName || "";
  document.querySelector("#editTeacherDepartment").value = teacher.department || "";
  document.querySelector("#editTeacherCurrentPosition").value = teacher.currentPosition || "Principal I";
  document.querySelector("#editTeacherEmail").value = teacher.email || "";
  document.querySelector("#editTeacherDateOfBirth").value = teacher.dateOfBirth || "";
  document.querySelector("#editTeacherDateHiredToledo").value = teacher.dateHiredToledo || "";
  document.querySelector("#editTeacherDateHiredGovernment").value = teacher.dateHiredGovernment || "";
  document.querySelector("#editTeacherGsisNumber").value = teacher.gsisNumber || "";
  document.querySelector("#editTeacherPhilhealthNumber").value = teacher.philhealthNumber || "";
  document.querySelector("#editTeacherTinNumber").value = teacher.tinNumber || "";
  document.querySelector("#editTeacherPagibigNumber").value = teacher.pagibigNumber || "";
  document.querySelector("#editTeacherSssNumber").value = teacher.sssNumber || "";
  document.querySelector("#editTeacherCivilStatus").value = teacher.civilStatus || "Single";
  document.querySelector("#editTeacherGender").value = teacher.gender || "Female";
  editTeacherModal.classList.remove("hidden");
}

function openAddTeacherModal() {
  if (!addTeacherModal || !teacherForm) {
    return;
  }

  teacherForm.reset();
  document.querySelector("#teacherCurrentPosition").value = "Principal I";
  document.querySelector("#teacherCivilStatus").value = "Single";
  document.querySelector("#teacherGender").value = "Female";
  addTeacherModal.classList.remove("hidden");
}

function closeAddTeacherModal() {
  if (!addTeacherModal || !teacherForm) {
    return;
  }

  teacherForm.reset();
  document.querySelector("#teacherCurrentPosition").value = "Principal I";
  document.querySelector("#teacherCivilStatus").value = "Single";
  document.querySelector("#teacherGender").value = "Female";
  addTeacherModal.classList.add("hidden");
}

function closeTeacherModal() {
  if (!editTeacherModal || !editTeacherForm) {
    return;
  }

  editingTeacherId = "";
  editTeacherForm.reset();
  editTeacherModal.classList.add("hidden");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function handleAddTeacherModalBackdropClick(event) {
  if (event.target === addTeacherModal) {
    closeAddTeacherModal();
  }
}

async function refreshStockCardItemHistory() {
  const itemId = getSelectedStockCardItemId();

  if (!itemId) {
    stockCardMovements = [];
    return;
  }

  try {
    stockCardMovements = await apiFetch(`/api/inventory/${itemId}/movements`);
  } catch (error) {
    console.error(error);
    stockCardMovements = [];
  }
}

function renderStockCardItemPage() {
  if (!isStockCardItemPage || !stockCardItemTitle || !stockCardItemSummary || !stockMovementTableWrap) {
    return;
  }

  const itemId = getSelectedStockCardItemId();
  const item = state.inventory.find((entry) => entry.id === itemId && entry.assetType === "Not Expandable");

  if (!item) {
    stockCardItemTitle.textContent = "Consumable item not found";
    stockCardItemSummary.innerHTML = `<div class="empty-state">The requested consumable item could not be found.</div>`;
    stockMovementTableWrap.innerHTML = `<div class="empty-state">No stock movement history available.</div>`;
    return;
  }

  stockCardItemTitle.textContent = item.name;
  stockCardItemSummary.innerHTML = `
    <article class="teacher-card">
      <div>
        <h3>${escapeHtml(item.name)}</h3>
        <p class="teacher-meta">
          ${escapeHtml(item.category)} • ${escapeHtml(item.description || "No description")}<br>
          Property Number: ${escapeHtml(item.assetTag)} • Remaining Quantity: ${item.quantity} ${escapeHtml(item.unitOfMeasurement || "unit")}<br>
          Price per Item: ${formatCurrency(item.amount)} • Location: ${escapeHtml(item.location || "-")}
        </p>
      </div>
      <div class="teacher-side">
        <span class="pill">${item.quantity} ${escapeHtml(item.unitOfMeasurement || "unit")} left</span>
      </div>
    </article>
  `;

  if (!stockCardMovements.length) {
    stockMovementTableWrap.innerHTML = `<div class="empty-state">No stock in or stock out history yet.</div>`;
    return;
  }

  stockMovementTableWrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Movement</th>
          <th>Quantity</th>
          <th>Personnel</th>
          <th>Remarks</th>
        </tr>
      </thead>
      <tbody>
        ${stockCardMovements
          .map((movement) => `
            <tr>
              <td>${escapeHtml(formatAssignedDate(movement.movementDate))}</td>
              <td>${escapeHtml(movement.movementType === "in" ? "Stock In" : "Stock Out")}</td>
              <td>${movement.quantity}</td>
              <td>${escapeHtml(movement.personnelName || "-")}</td>
              <td>${escapeHtml(movement.remarks || "-")}</td>
            </tr>
          `)
          .join("")}
      </tbody>
    </table>
  `;
}

function getSelectedStockCardItemId() {
  return new URLSearchParams(window.location.search).get("id") || "";
}

function handleStockInModalBackdropClick(event) {
  if (event.target === stockInModal) {
    closeStockInModal();
  }
}

function handleStockOutModalBackdropClick(event) {
  if (event.target === stockOutModal) {
    closeStockOutModal();
  }
}
