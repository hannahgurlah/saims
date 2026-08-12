const state = {
  auth: {
    authenticated: false,
    username: "",
    role: "",
    schoolName: "",
  },
  teachers: [],
  inventory: [],
  bookCatalog: [],
};

const PROPERTY_CLASSIFICATIONS = {
  "10": {
    name: "Land Assets",
    subcategories: [
      { code: "10", name: "School Site / Titled Lots", uacsCode: "10601010" },
      { code: "20", name: "Donated Land (Pending Title Transfer)", uacsCode: "10601010" },
    ],
  },
  "11": {
    name: "Land Improvements",
    subcategories: [
      { code: "10", name: "School Fences / Perimeter Walls", uacsCode: "10602000" },
      { code: "20", name: "Drainage Systems / Concrete Pathways", uacsCode: "10602000" },
      { code: "30", name: "School Gardens / Greenhouse", uacsCode: "10602000" },
    ],
  },
  "40": {
    name: "Buildings",
    subcategories: [
      { code: "10", name: "Standard School Buildings", uacsCode: "10604020" },
      { code: "20", name: "Laboratories / Tech-Voc Workshops (Computer Labs, Home Economics Buildings)", uacsCode: "10604010" },
      { code: "30", name: "Administrative Offices (Principal's Office, Faculty Rooms)", uacsCode: "10604010" },
      { code: "99", name: "Other Structures (Covered Courts, Gymnasiums, Guardhouses)", uacsCode: "10604990" },
    ],
  },
  "45": {
    name: "General Machinery",
    subcategories: [
      { code: "10", name: "Grass Cutters / Lawn Mowers", uacsCode: "10605010" },
      { code: "20", name: "Generator Sets (Power Backup)", uacsCode: "10605010" },
      { code: "30", name: "Water Pumps / Tank Systems", uacsCode: "10605010" },
    ],
  },
  "51": {
    name: "Office Equipment",
    subcategories: [
      { code: "10", name: "Air Conditioning Units", uacsCode: "10605020" },
      { code: "20", name: "Paper Shredders / Laminating Machines", uacsCode: "10605020" },
      { code: "30", name: "Photocopiers / Mimeographing Equipment", uacsCode: "10605020" },
      { code: "40", name: "Office Electric Fans", uacsCode: "10605020" },
      { code: "50", name: "Other Office Equipment", uacsCode: "10605020" },
    ],
  },
  "50": {
    name: "Information and Communication Technology Equipment",
    subcategories: [
      { code: "10", name: "Desktop Computer Complete Package", uacsCode: "10605030" },
      { code: "20", name: "Computer Printers / Scanners / 3D Printers", uacsCode: "10605030" },
      { code: "30", name: "Laptop / Notebook Computer", uacsCode: "10605030" },
      { code: "40", name: "Tablet Computer", uacsCode: "10605030" },
      { code: "50", name: "Computer Monitor / Smart Display Panels", uacsCode: "10605030" },
      { code: "60", name: "Servers / Network Switches / Routers", uacsCode: "10605030" },
      { code: "70", name: "Uninterruptible Power Supply (UPS)", uacsCode: "10605030" },
      { code: "80", name: "Multimedia Projectors", uacsCode: "10605030" },
    ],
  },
  "46": {
    name: "Agricultural and Forestry Equipment",
    subcategories: [
      { code: "10", name: "Hand Tractors / Power Tillers", uacsCode: "10605040" },
      { code: "20", name: "Garden Tool Sets (Spades, Shovels, Wheelbarrows)", uacsCode: "10605040" },
      { code: "30", name: "Hydroponics / Irrigation Tools [1]", uacsCode: "10605040" },
    ],
  },
  "47": {
    name: "Marine and Fishery Equipment",
    subcategories: [
      { code: "10", name: "Fishing Net Assemblies", uacsCode: "10605050" },
      { code: "20", name: "Outboard Motors (for School Boats)", uacsCode: "10605050" },
      { code: "30", name: "Fish Culture Tanks / Aquaponics Units", uacsCode: "10605050" },
    ],
  },
  "48": {
    name: "Airport Equipment",
    subcategories: [
      { code: "10", name: "Aviation Ground Training Tools", uacsCode: "10605060" },
      { code: "99", name: "Other Airport/Aviation Support Tools", uacsCode: "10605060" },
    ],
  },
  "53": {
    name: "Communication Equipment",
    subcategories: [
      { code: "10", name: "Public Address Systems / Gym Sound Systems", uacsCode: "10605070" },
      { code: "20", name: "Two-Way Handheld Radios (Security Walkie-Talkies)", uacsCode: "10605070" },
      { code: "30", name: "Television Monitors (for Instructional/Classroom Use)", uacsCode: "10605070" },
      { code: "40", name: "Megaphones / Audio Amplifiers", uacsCode: "10605070" },
    ],
  },
  "49": {
    name: "Construction and Heavy Equipment",
    subcategories: [
      { code: "10", name: "Concrete Mixers (Portable)", uacsCode: "10605080" },
      { code: "20", name: "Welding Machines / Heavy Lathes", uacsCode: "10605080" },
    ],
  },
  "57": {
    name: "Disaster Response and Rescue Equipment",
    subcategories: [
      { code: "10", name: "Fire Extinguishers (Heavy-duty/Wall-mounted)", uacsCode: "10605090" },
      { code: "20", name: "Emergency Rescue Kits / Spine Boards / Stretcher Units", uacsCode: "10605090" },
      { code: "30", name: "Emergency Megaphones / Siren Systems", uacsCode: "10605090" },
    ],
  },
  "58": {
    name: "Military, Police and Security Equipment",
    subcategories: [
      { code: "10", name: "CCTV Camera Systems / Digital Video Recorders (DVR)", uacsCode: "10605100" },
      { code: "20", name: "Metal Detectors (Handheld/Walk-through)", uacsCode: "10605100" },
      { code: "30", name: "Training Rifles / Dummy Replicas (for CAT)", uacsCode: "10605100" },
    ],
  },
  "54": {
    name: "Medical and Dental Equipment",
    subcategories: [
      { code: "10", name: "Weighing Scales / Height Chart Scales", uacsCode: "10605110" },
      { code: "20", name: "First Aid Storage Cabinets / Medical Tool Kits", uacsCode: "10605110" },
      { code: "30", name: "Medical Emergency Beds / Wheelchairs (School Clinic)", uacsCode: "10605110" },
      { code: "40", name: "Dental Chairs / Dental Inspection Kits", uacsCode: "10605110" },
    ],
  },
  "59": {
    name: "Printing Equipment",
    subcategories: [
      { code: "10", name: "Heavy-Duty Risograph / Digital Duplicators", uacsCode: "10605120" },
      { code: "20", name: "Paper Cutters (Heavy Industrial)", uacsCode: "10605120" },
      { code: "30", name: "Bookbinding Machines", uacsCode: "10605120" },
    ],
  },
  "60": {
    name: "Sports Equipment",
    subcategories: [
      { code: "10", name: "Basketball Goal Posts / Ring Assemblies", uacsCode: "10605130" },
      { code: "20", name: "Volleyball Net Posts / Referee Chairs", uacsCode: "10605130" },
      { code: "30", name: "Gymnastics Mats / Athletic Training Gear", uacsCode: "10605130" },
      { code: "99", name: "Other Reusable Sports Assets", uacsCode: "10605130" },
    ],
  },
  "61": {
    name: "Technical and Scientific Equipment",
    subcategories: [
      { code: "10", name: "Science Lab Kit Sets (Microscopes, Hotplates)", uacsCode: "10605140" },
      { code: "20", name: "Meteorological Tools (Weather Station Kits for Science High Schools)", uacsCode: "10605140" },
      { code: "30", name: "Engineering/Drafting Tools", uacsCode: "10605140" },
      { code: "40", name: "Musical Instruments (Drum & Lyre Kits, Pianos)", uacsCode: "10605140" },
    ],
  },
  "69": {
    name: "Other Machinery and Equipment",
    subcategories: [
      { code: "99", name: "Miscellaneous Unclassified School Machinery", uacsCode: "10605990" },
      { categoryCode: "70", code: "20", name: "Culinary / Cookery Tools (Heavy Gas Ranges, Ovens for Senior High TVL)", uacsCode: "10605990" },
    ],
  },
  "52": {
    name: "Furniture and Fixtures",
    subcategories: [
      { code: "10", name: "Student Armchairs (Plastic Monobloc / Wood)", uacsCode: "10607010" },
      { code: "20", name: "Teacher Desks / Office Tables / Conference Tables", uacsCode: "10607010" },
      { code: "30", name: "Filing Cabinets (Steel / Lateral)", uacsCode: "10607010" },
      { code: "40", name: "Whiteboards / Blackboards", uacsCode: "10607010" },
      { code: "50", name: "Bookshelves / Library Storage Racks", uacsCode: "10607010" },
      { code: "60", name: "Office Executive Chairs / Clerical Chairs", uacsCode: "10607010" },
    ],
  },
  "55": {
    name: "Books and Instructional Materials",
    subcategories: [
      { code: "10", name: "Standard Textbooks (Per Subject Area)", uacsCode: "10607020" },
      { code: "20", name: "Reference Manuals / Dictionaries / Encyclopedias", uacsCode: "10607020" },
      { code: "30", name: "Multimedia Learning Kits (Educational Flash Drives/DVD modules)", uacsCode: "10607020" },
    ],
  },
};

const navLinks = document.querySelector(".nav-links");

if (navLinks) {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  navLinks.querySelectorAll("a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === currentPage);
  });
}
const loginForm = document.querySelector("#loginForm");
const loginError = document.querySelector("#loginError");

const teacherForm = document.querySelector("#teacherForm");
const teacherSchoolNameInput = document.querySelector("#teacherSchoolName");
const teacherList = document.querySelector("#teacherList");
const teacherTemplate = document.querySelector("#teacherCardTemplate");
const addTeacherModal = document.querySelector("#addTeacherModal");
const openTeacherModalBtn = document.querySelector("#openTeacherModalBtn");
const closeAddTeacherModalBtn = document.querySelector("#closeAddTeacherModalBtn");
const editTeacherModal = document.querySelector("#editTeacherModal");
const editTeacherForm = document.querySelector("#editTeacherForm");
const editTeacherSchoolNameInput = document.querySelector("#editTeacherSchoolName");
const closeTeacherModalBtn = document.querySelector("#closeTeacherModalBtn");

const inventoryForm = document.querySelector("#inventoryForm");
const itemTeacher = document.querySelector("#itemTeacher");
const itemSchoolNameInput = document.querySelector("#itemSchoolName");
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
const itemCategoryInput = document.querySelector("#itemCategory");
const itemSubcategoryInput = document.querySelector("#itemSubcategory");
const itemBookTitleInput = document.querySelector("#itemBookTitle");
const itemBrandNameInput = document.querySelector("#itemBrandName");
const itemBookAuthorInput = document.querySelector("#itemBookAuthor");
const itemBookPublisherInput = document.querySelector("#itemBookPublisher");
const itemModelNumberInput = document.querySelector("#itemModelNumber");
const itemSerialNumberInput = document.querySelector("#itemSerialNumber");
const itemFormInput = document.querySelector("#itemForm");
const itemBundleItemsWrap = document.querySelector("#itemBundleItemsWrap");
const itemBundleItemLines = document.querySelector("#itemBundleItemLines");
const addBundleItemLineBtn = document.querySelector("#addBundleItemLineBtn");

const filterTeacher = document.querySelector("#filterTeacher");
const filterStatus = document.querySelector("#filterStatus");
const filterItemType = document.querySelector("#filterItemType");
const filterSchool = document.querySelector("#filterSchool");
const searchInput = document.querySelector("#searchInput");
const teacherSearchInput = document.querySelector("#teacherSearchInput");
const inventoryTableWrap = document.querySelector("#inventoryTableWrap");
const downloadCsvBtn = document.querySelector("#downloadCsvBtn");
const downloadTeachersCsvBtn = document.querySelector("#downloadTeachersCsvBtn");
const downloadStockCardCsvBtn = document.querySelector("#downloadStockCardCsvBtn");
const downloadIirupReportBtn = document.querySelector("#downloadIirupReportBtn");
const downloadPpeReportBtn = document.querySelector("#downloadPpeReportBtn");
const downloadInventoryReportBtn = document.querySelector("#downloadInventoryReportBtn");
const downloadSemiExpendableReportBtn = document.querySelector("#downloadSemiExpendableReportBtn");
const stockCardItemTitle = document.querySelector("#stockCardItemTitle");
const stockCardItemSummary = document.querySelector("#stockCardItemSummary");
const stockMovementTableWrap = document.querySelector("#stockMovementTableWrap");

const heroStats = document.querySelector("#heroStats");
const isHomePage = window.location.pathname.endsWith("/index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("index.html");
const isDashboardPage = window.location.pathname.endsWith("/dashboard.html") || window.location.pathname.endsWith("dashboard.html");
const isLoginPage = window.location.pathname.endsWith("/login.html") || window.location.pathname.endsWith("login.html");
const isStockCardPage = window.location.pathname.endsWith("/stock-card.html") || window.location.pathname.endsWith("stock-card.html");
const isInventoryItemPage = window.location.pathname.endsWith("/inventory-item.html") || window.location.pathname.endsWith("inventory-item.html");
const isInventoryListPage = window.location.pathname.endsWith("/inventory-list.html") || window.location.pathname.endsWith("inventory-list.html");
const isStockCardItemPage = window.location.pathname.endsWith("/stock-card-item.html") || window.location.pathname.endsWith("stock-card-item.html");
setActiveNavigationLink();
const stockInModal = document.querySelector("#stockInModal");
const stockOutModal = document.querySelector("#stockOutModal");
const stockInForm = document.querySelector("#stockInForm");
const stockOutForm = document.querySelector("#stockOutForm");
const stockOutTeacher = document.querySelector("#stockOutTeacher");
const closeStockInModalBtn = document.querySelector("#closeStockInModalBtn");
const closeStockOutModalBtn = document.querySelector("#closeStockOutModalBtn");
const LISTING_PAGE_SIZE = 15;

const editModal = document.querySelector("#editModal");
const editInventoryForm = document.querySelector("#editInventoryForm");
const editItemTeacher = document.querySelector("#editItemTeacher");
const editItemSchoolNameInput = document.querySelector("#editItemSchoolName");
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
const editItemCategoryInput = document.querySelector("#editItemCategory");
const editItemSubcategoryInput = document.querySelector("#editItemSubcategory");
const editItemBookTitleInput = document.querySelector("#editItemBookTitle");
const editItemBrandNameInput = document.querySelector("#editItemBrandName");
const editItemBookAuthorInput = document.querySelector("#editItemBookAuthor");
const editItemBookPublisherInput = document.querySelector("#editItemBookPublisher");
const editItemModelNumberInput = document.querySelector("#editItemModelNumber");
const editItemSerialNumberInput = document.querySelector("#editItemSerialNumber");
const editItemFormInput = document.querySelector("#editItemForm");
const editItemBundleItemsWrap = document.querySelector("#editItemBundleItemsWrap");
const editItemBundleItemLines = document.querySelector("#editItemBundleItemLines");
const editAddBundleItemLineBtn = document.querySelector("#editAddBundleItemLineBtn");
let editingItemId = "";
let editingTeacherId = "";
let stockMovementItemId = "";
let stockCardMovements = [];
let currentInventoryPage = 1;
let currentTeacherPage = 1;

function setActiveNavigationLink() {
  if (!navLinks) {
    return;
  }

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const stockCardPages = new Set(["stock-card.html", "stock-card-item.html"]);

  navLinks.querySelectorAll("a").forEach((link) => {
    const linkedPage = link.getAttribute("href") || "";
    const isActive = linkedPage === currentPage || (stockCardPages.has(currentPage) && linkedPage === "stock-card.html");
    link.classList.toggle("active", isActive);
    link.setAttribute("aria-label", link.textContent.trim());
    link.setAttribute("title", link.textContent.trim());
  });
}

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

if (itemSchoolNameInput) {
  itemSchoolNameInput.addEventListener("input", renderTeacherSelects);
  itemSchoolNameInput.addEventListener("change", renderTeacherSelects);
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

if (itemFormInput) {
  itemFormInput.addEventListener("change", () => updateBundleItemsUI(""));
}

if (addBundleItemLineBtn) {
  addBundleItemLineBtn.addEventListener("click", () => addBundleItemLine(""));
}

if (editAddBundleItemLineBtn) {
  editAddBundleItemLineBtn.addEventListener("click", () => addBundleItemLine("edit"));
}

if (itemBundleItemLines) {
  itemBundleItemLines.addEventListener("click", (event) => handleBundleItemLineClick(event, ""));
}

if (editItemBundleItemLines) {
  editItemBundleItemLines.addEventListener("click", (event) => handleBundleItemLineClick(event, "edit"));
}

if (itemCategoryInput) {
  itemCategoryInput.addEventListener("change", () => {
    updateBookFieldsUI("");
    updateSubcategoryUI("");
    updateEquipmentFieldsUI("");
  });
}

if (itemBookTitleInput) {
  itemBookTitleInput.addEventListener("change", () => applyBookCatalogMatch(""));
}

if (editItemBookTitleInput) {
  editItemBookTitleInput.addEventListener("change", () => applyBookCatalogMatch("edit"));
}

if (itemSubcategoryInput) {
  itemSubcategoryInput.addEventListener("change", () => {
    applyPropertyClassification("");
    updateBookFieldsUI("");
    updateEquipmentFieldsUI("");
  });
}

if (inventoryTableWrap) {
  inventoryTableWrap.addEventListener("click", handleInventoryTableClick);
}

if (editInventoryForm) {
  editInventoryForm.addEventListener("submit", handleEditInventorySubmit);
}

if (editItemSchoolNameInput) {
  editItemSchoolNameInput.addEventListener("input", renderTeacherSelects);
  editItemSchoolNameInput.addEventListener("change", renderTeacherSelects);
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

if (editItemFormInput) {
  editItemFormInput.addEventListener("change", () => updateBundleItemsUI("edit"));
}

if (editItemCategoryInput) {
  editItemCategoryInput.addEventListener("change", () => {
    updateBookFieldsUI("edit");
    updateSubcategoryUI("edit");
    updateEquipmentFieldsUI("edit");
  });
}

if (editItemSubcategoryInput) {
  editItemSubcategoryInput.addEventListener("change", () => {
    applyPropertyClassification("edit");
    updateBookFieldsUI("edit");
    updateEquipmentFieldsUI("edit");
  });
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

if (filterSchool) {
  filterSchool.addEventListener("change", handleSchoolFilterChange);
}

if (searchInput) {
  searchInput.addEventListener("input", handleInventoryFilterChange);
}

if (teacherSearchInput) {
  teacherSearchInput.addEventListener("input", handleTeacherFilterChange);
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

if (downloadIirupReportBtn) {
  downloadIirupReportBtn.addEventListener("click", downloadIirupReportCsv);
}

if (downloadInventoryReportBtn) {
  downloadInventoryReportBtn.addEventListener("click", downloadInventoryReportCsv);
}

if (downloadSemiExpendableReportBtn) {
  downloadSemiExpendableReportBtn.addEventListener("click", downloadSemiExpendableReportCsv);
}

if (loginForm) {
  loginForm.addEventListener("submit", handleLoginSubmit);
}

renderCategoryOptions();
reorderAddInventoryFields();
initializeApp();

async function initializeApp() {
  try {
    await refreshSession();

    if (isLoginPage) {
      if (state.auth.authenticated) {
        window.location.replace(getPostLoginDestination());
      }
      return;
    }

    if (isHomePage) {
      if (state.auth.authenticated) {
        window.location.replace("dashboard.html");
      }
      return;
    }

    if (!state.auth.authenticated) {
      redirectToLogin();
      return;
    }

    renderAuthNav();
    await refreshData();
  } catch (error) {
    console.error(error);
    renderErrorState("Unable to load data from the database.");
  }
}

async function refreshSession() {
  const session = await apiFetch("/api/auth/session");
  state.auth = {
    authenticated: Boolean(session && session.authenticated),
    username: session && session.username ? session.username : "",
    role: session && session.role ? session.role : "",
    schoolName: session && session.schoolName ? session.schoolName : "",
  };
}

async function refreshData() {
  const [teachers, inventory, bookCatalog] = await Promise.all([
    apiFetch("/api/teachers"),
    apiFetch("/api/inventory"),
    apiFetch("/api/books"),
  ]);

  state.teachers = teachers;
  state.inventory = inventory;
  state.bookCatalog = bookCatalog;

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
    if (response.status === 401) {
      throw new Error("Authentication required");
    }

    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function render() {
  renderAuthNav();
  renderAccessMode();
  renderStats();
  renderSchoolAutocomplete();
  renderTeacherSelects();
  renderSchoolFilter();
  renderTeachers();
  renderInventory();
  renderStockCardItemPage();
  updateCreateTotalAmount();
  updateAcquiredDetailsUI("");
  updateSchoolFieldVisibility();
  renderBookAutocomplete();
}

function renderAccessMode() {
  toggleReadOnlyNotice(
    teacherList ? teacherList.parentElement : null,
    !state.auth.authenticated,
    "Viewing only. Log in to add, edit, or remove personnel records.",
  );
  toggleReadOnlyNotice(
    inventoryForm ? inventoryForm.parentElement : null,
    !state.auth.authenticated,
    "Viewing only. Log in to add or update inventory records.",
  );
  toggleReadOnlyNotice(
    inventoryTableWrap ? inventoryTableWrap.parentElement : null,
    !state.auth.authenticated,
    isStockCardPage
      ? "Viewing only. Log in to edit items or record stock in and stock out."
      : "Viewing only. Log in to edit or delete inventory records.",
  );

  if (openTeacherModalBtn) {
    openTeacherModalBtn.hidden = !state.auth.authenticated;
  }

  setFormInteractive(inventoryForm, state.auth.authenticated);
}

function toggleReadOnlyNotice(container, shouldShow, message) {
  if (!container) {
    return;
  }

  let notice = container.querySelector("[data-auth-readonly-note]");

  if (!shouldShow) {
    if (notice) {
      notice.remove();
    }
    return;
  }

  if (!notice) {
    notice = document.createElement("div");
    notice.className = "auth-readonly-note";
    notice.dataset.authReadonlyNote = "true";
    container.insertBefore(notice, container.firstChild);
  }

  notice.textContent = message;
}

function setFormInteractive(form, isInteractive) {
  if (!form) {
    return;
  }

  form.classList.toggle("form-readonly", !isInteractive);

  form.querySelectorAll("input, select, textarea, button").forEach((field) => {
    field.disabled = !isInteractive;
  });
}

function renderAuthNav() {
  if (!navLinks) {
    return;
  }

  const topNav = document.querySelector(".top-nav");
  const existingSlot = document.querySelector(".nav-auth-slot");

  if (existingSlot) {
    existingSlot.remove();
  }

  if (!topNav || !topNav.parentElement) {
    return;
  }

  if (isLoginPage && !state.auth.authenticated) {
    return;
  }

  const slot = document.createElement("div");
  slot.className = "nav-auth-slot";

  if (state.auth.authenticated) {
    const userLabel = document.createElement("span");
    userLabel.className = "nav-user-label";
    userLabel.textContent = state.auth.schoolName
      ? `${state.auth.username} (${state.auth.schoolName})`
      : state.auth.username;

    const logoutButton = document.createElement("button");
    logoutButton.className = "ghost-btn nav-logout-btn";
    logoutButton.type = "button";
    logoutButton.textContent = "Logout";
    logoutButton.addEventListener("click", handleLogoutClick);

    slot.append(userLabel, logoutButton);
  } else {
    const loginLink = document.createElement("a");
    loginLink.href = "login.html";
    loginLink.textContent = "Login";

    if (isLoginPage) {
      loginLink.className = "active";
    }

    slot.append(loginLink);
  }

  topNav.append(slot);
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const username = document.querySelector("#loginUsername").value.trim();
  const password = document.querySelector("#loginPassword").value;

  try {
    hideLoginError();
    await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    await refreshSession();
    window.location.replace(getPostLoginDestination());
  } catch (error) {
    console.error(error);
    showLoginError("Invalid username or password.");
  }
}

async function handleLogoutClick() {
  try {
    await apiFetch("/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error(error);
  }

  state.auth = {
    authenticated: false,
    username: "",
    role: "",
    schoolName: "",
  };
  window.location.replace("index.html");
}

function redirectToLogin() {
  const next = `${window.location.pathname}${window.location.search || ""}`;
  window.location.replace(`login.html?next=${encodeURIComponent(next)}`);
}

function getPostLoginDestination() {
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || next === "/" || next.endsWith("/index.html") || next === "index.html" || next.includes("login.html")) {
    return "dashboard.html";
  }
  return next;
}

function showLoginError(message) {
  if (!loginError) {
    return;
  }

  loginError.textContent = message;
  loginError.classList.remove("hidden");
}

function hideLoginError() {
  if (!loginError) {
    return;
  }

  loginError.textContent = "";
  loginError.classList.add("hidden");
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
  const allTeacherOptions = state.teachers
    .map((teacher) => `<option value="${teacher.id}">${escapeHtml(getTeacherDisplayName(teacher))}</option>`)
    .join("");

  if (itemTeacher) {
    const selectedTeacher = itemTeacher.value;
    const schoolName = itemSchoolNameInput ? itemSchoolNameInput.value.trim() : "";
    const teacherOptions = buildTeacherOptionsForSchool(schoolName);
    itemTeacher.innerHTML = `<option value="">Unassigned</option>${teacherOptions}`;

    if (selectedTeacher && state.teachers.some((teacher) => teacher.id === selectedTeacher && (!schoolName || teacher.schoolName === schoolName))) {
      itemTeacher.value = selectedTeacher;
    }
  }

  if (editItemTeacher) {
    const selectedEditTeacher = editItemTeacher.value;
    const schoolName = editItemSchoolNameInput ? editItemSchoolNameInput.value.trim() : "";
    const teacherOptions = buildTeacherOptionsForSchool(schoolName);
    editItemTeacher.innerHTML = `<option value="">Unassigned</option>${teacherOptions}`;

    if (selectedEditTeacher === "" || state.teachers.some((teacher) => teacher.id === selectedEditTeacher && (!schoolName || teacher.schoolName === schoolName))) {
      editItemTeacher.value = selectedEditTeacher;
    }
  }

  if (filterTeacher) {
    const selectedFilter = filterTeacher.value;
    filterTeacher.innerHTML = `<option value="All">All Personnel</option>${allTeacherOptions}`;

    if (selectedFilter === "All" || state.teachers.some((teacher) => teacher.id === selectedFilter)) {
      filterTeacher.value = selectedFilter;
    }
  }

  if (stockOutTeacher) {
    const selectedStockOutTeacher = stockOutTeacher.value;
    stockOutTeacher.innerHTML = `<option value="">Select personnel</option>${allTeacherOptions}`;

    if (selectedStockOutTeacher && state.teachers.some((teacher) => teacher.id === selectedStockOutTeacher)) {
      stockOutTeacher.value = selectedStockOutTeacher;
    }
  }
}

function buildTeacherOptionsForSchool(schoolName) {
  return state.teachers
    .filter((teacher) => !schoolName || teacher.schoolName === schoolName)
    .map((teacher) => `<option value="${teacher.id}">${escapeHtml(getTeacherDisplayName(teacher))}</option>`)
    .join("");
}

function getSchoolNames() {
  if (state.auth.role === "manager" && state.auth.schoolName) {
    return [state.auth.schoolName];
  }

  return [...new Set([
    "Landahan Elementary School",
    ...state.teachers.map((teacher) => teacher.schoolName),
    ...state.inventory.map((item) => item.schoolName),
  ].filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function renderSchoolAutocomplete() {
  const schoolInputs = [
    teacherSchoolNameInput,
    editTeacherSchoolNameInput,
    itemSchoolNameInput,
    editItemSchoolNameInput,
  ].filter(Boolean);

  if (!schoolInputs.length) {
    return;
  }

  const schoolNames = getSchoolNames();
  let dataList = document.querySelector("#schoolNameOptions");

  if (!dataList) {
    dataList = document.createElement("datalist");
    dataList.id = "schoolNameOptions";
    document.body.append(dataList);
  }

  dataList.innerHTML = schoolNames
    .map((schoolName) => `<option value="${escapeHtml(schoolName)}"></option>`)
    .join("");

  schoolInputs.forEach((input) => {
    const selectedSchool = state.auth.role === "manager" && state.auth.schoolName
      ? state.auth.schoolName
      : input.value || "Landahan Elementary School";

    if (input.tagName === "SELECT") {
      input.innerHTML = [
        '<option value="">Select school</option>',
        ...schoolNames.map((schoolName) => `<option value="${escapeHtml(schoolName)}">${escapeHtml(schoolName)}</option>`),
      ].join("");
      input.value = schoolNames.includes(selectedSchool) ? selectedSchool : "";
      input.disabled = state.auth.role === "manager" && Boolean(state.auth.schoolName);
      return;
    }

    input.setAttribute("list", "schoolNameOptions");
    input.value = selectedSchool;
    input.readOnly = state.auth.role === "manager" && Boolean(state.auth.schoolName);
  });
}

function renderSchoolFilter() {
  if (!filterSchool) {
    return;
  }

  const selectedSchool = filterSchool.value;
  const schoolNames = getSchoolNames();
  const schoolOptions = schoolNames
    .map((schoolName) => `<option value="${escapeHtml(schoolName)}">${escapeHtml(schoolName)}</option>`)
    .join("");

  filterSchool.innerHTML = `<option value="All">All Schools</option>${schoolOptions}`;

  if (state.auth.role === "manager" && state.auth.schoolName) {
    filterSchool.value = state.auth.schoolName;
    filterSchool.disabled = true;
    return;
  }

  filterSchool.disabled = false;

  if (selectedSchool === "All" || schoolNames.includes(selectedSchool)) {
    filterSchool.value = selectedSchool;
  }
}

async function handleTeacherSubmit(event) {
  event.preventDefault();

  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
    return;
  }

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

  const filteredTeachers = getFilteredTeachers();
  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / LISTING_PAGE_SIZE));
  currentTeacherPage = Math.min(currentTeacherPage, totalPages);

  if (!filteredTeachers.length) {
    teacherList.innerHTML = `<div class="empty-state">No personnel yet. Add one to start tagging inventory items.</div>`;
    return;
  }

  const paginatedTeachers = filteredTeachers.slice((currentTeacherPage - 1) * LISTING_PAGE_SIZE, currentTeacherPage * LISTING_PAGE_SIZE);

  paginatedTeachers.forEach((teacher) => {
    const card = teacherTemplate.content.cloneNode(true);
    const assignedCount = state.inventory.filter((item) => item.teacherId === teacher.id).length;
    const actions = card.querySelector(".teacher-actions");

    card.querySelector("h3").textContent = getTeacherDisplayName(teacher);
    card.querySelector(".teacher-meta").textContent = [
      teacher.department,
      teacher.currentPosition || "",
      teacher.schoolName || "",
      teacher.gender || "",
      teacher.civilStatus || "",
      teacher.email || "No email provided",
    ]
      .filter(Boolean)
      .join(" • ");
    card.querySelector(".pill").textContent = `${assignedCount} assigned`;
    card.querySelector("[data-action='edit-teacher']").dataset.teacherId = teacher.id;
    card.querySelector("[data-action='delete-teacher']").dataset.teacherId = teacher.id;

    if (!state.auth.authenticated && actions) {
      actions.innerHTML = `<span class="notes">Login required to make changes.</span>`;
    }

    teacherList.append(card);
  });

  teacherList.insertAdjacentHTML(
    "beforeend",
    `<div class="pagination-bar">
      <button class="ghost-btn pagination-btn" type="button" data-action="teacher-page-prev" ${currentTeacherPage === 1 ? "disabled" : ""}>Previous</button>
      <span class="notes">Page ${currentTeacherPage} of ${totalPages}</span>
      <button class="ghost-btn pagination-btn" type="button" data-action="teacher-page-next" ${currentTeacherPage === totalPages ? "disabled" : ""}>Next</button>
    </div>`,
  );
}

async function handleTeacherListClick(event) {
  const prevPageButton = event.target.closest("[data-action='teacher-page-prev']");
  const nextPageButton = event.target.closest("[data-action='teacher-page-next']");
  const editButton = event.target.closest("[data-action='edit-teacher']");
  const deleteButton = event.target.closest("[data-action='delete-teacher']");

  if (prevPageButton) {
    currentTeacherPage = Math.max(1, currentTeacherPage - 1);
    renderTeachers();
    return;
  }

  if (nextPageButton) {
    const totalPages = Math.max(1, Math.ceil(getFilteredTeachers().length / LISTING_PAGE_SIZE));
    currentTeacherPage = Math.min(totalPages, currentTeacherPage + 1);
    renderTeachers();
    return;
  }

  if (editButton) {
    if (!state.auth.authenticated) {
      showAuthRequiredMessage();
      return;
    }
    openTeacherModal(editButton.dataset.teacherId);
    return;
  }

  if (!deleteButton) {
    return;
  }

  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
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

  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
    return;
  }

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

  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
    return;
  }

  const teacherId = itemTeacher ? itemTeacher.value : "";
  const selectedStatus = document.querySelector("#itemStatus").value;

  const item = {
    name: document.querySelector("#itemName").value.trim(),
    itemForm: itemFormInput.value,
    bundleItems: getBundleItemsValue(""),
    category: getSelectedCategoryName(""),
    subcategory: itemSubcategoryInput.value,
    categoryCode: document.querySelector("#itemCategoryCode").value,
    subcategoryCode: document.querySelector("#itemSubcategoryCode").value,
    description: document.querySelector("#itemDescription").value.trim(),
    dateReceived: document.querySelector("#itemDateReceived").value,
    brandName: document.querySelector("#itemBrandName").value.trim(),
    modelNumber: itemModelNumberInput.value.trim(),
    serialNumber: itemSerialNumberInput.value.trim(),
    bookTitle: document.querySelector("#itemBookTitle").value.trim(),
    bookAuthor: itemBookAuthorInput.value.trim(),
    bookPublisher: document.querySelector("#itemBookPublisher").value.trim(),
    schoolName: document.querySelector("#itemSchoolName").value.trim(),
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
    acquisitionType: document.querySelector("#itemAcquiredType").value,
    acquiredType: toLegacyAcquiredType(document.querySelector("#itemAcquiredType").value),
    acquiredDetails: getAcquiredDetailsValue(""),
    location: document.querySelector("#itemLocation").value.trim(),
    propertyCondition: selectedStatus,
    status: getStatusForAssignment(mapPropertyConditionToStatus(selectedStatus), teacherId),
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
    document.querySelector("#itemSchoolName").value = "Landahan Elementary School";
    document.querySelector("#itemAssetType").value = "PPE";
    itemFormInput.value = "Single";
    updateBundleItemsUI("");
    updateBookFieldsUI("");
    updateEquipmentFieldsUI("");
    updateSubcategoryUI("");
    document.querySelector("#itemAcquiredType").value = "Purchase";
    document.querySelector("#itemStatus").value = "Working/Available";
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
  const shouldPaginateInventory = isInventoryListPage || isStockCardPage;
  const totalPages = shouldPaginateInventory ? Math.max(1, Math.ceil(filteredItems.length / LISTING_PAGE_SIZE)) : 1;

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

  const paginatedItems = shouldPaginateInventory
    ? filteredItems.slice((currentInventoryPage - 1) * LISTING_PAGE_SIZE, currentInventoryPage * LISTING_PAGE_SIZE)
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
                <td>${escapeHtml(item.category)}${item.subcategory ? `<br><span class="notes">${escapeHtml(item.subcategory)}</span>` : ""}${!isStockCardPage ? `<br><span class="notes">Codes: ${escapeHtml(item.categoryCode || "-")}-${escapeHtml(item.subcategoryCode || "-")}</span><br><span class="notes">UACS: ${escapeHtml(item.uacsCode || "-")}</span>` : ""}</td>
                ${isStockCardPage ? `<td>${escapeHtml(item.description || "No description")}</td>` : ""}
                ${isStockCardPage ? `<td>${escapeHtml(item.unitOfMeasurement || "unit")}</td>` : ""}
                ${isStockCardPage ? `<td><strong>${item.quantity}</strong></td>` : ""}
                <td>
                  ${
                    isStockCardPage
                      ? `<span class="notes">${formatCurrency(item.amount)}</span>`
                      : `<span class="notes">School: ${escapeHtml(item.schoolName || "-")}</span><br>
                  <span class="notes">Date Received: ${escapeHtml(item.dateReceived || "-")}</span><br>
                  <span class="notes">Brand Name: ${escapeHtml(item.brandName || "-")}</span><br>
                  <span class="notes">Model: ${escapeHtml(item.modelNumber || "-")}</span><br>
                  <span class="notes">Serial Number: ${escapeHtml(item.serialNumber || "-")}</span><br>
                  <span class="notes">Book Title: ${escapeHtml(item.bookTitle || "-")}</span><br>
                  <span class="notes">Book Author: ${escapeHtml(item.bookAuthor || "-")}</span><br>
                  <span class="notes">Book Publisher: ${escapeHtml(item.bookPublisher || "-")}</span><br>
                  <span class="notes">Item Type: ${escapeHtml(item.itemForm || "Single")}</span><br>
                  ${item.itemForm === "Bundle/Package" ? `<span class="notes">Bundle Items:</span><ul class="notes">${getBundleItems(item.bundleItems).map((bundleItem) => `<li>${bundleItem.quantity} × ${escapeHtml(bundleItem.name)}</li>`).join("")}</ul>` : ""}
                  <span class="notes">Property Classification: ${escapeHtml(formatItemTypeLabel(item.assetType || "-"))}</span><br>
                  <span class="notes">Acquisition Type: ${escapeHtml(item.acquisitionType || normalizeAcquisitionType(item.acquiredType))}</span><br>
                  <span class="notes">Property Status: ${escapeHtml(item.propertyCondition || getPropertyConditionFromStatus(item.status))}</span><br>
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
                      state.auth.authenticated
                        ? `
                          ${
                            isStockCardPage
                              ? `<button class="primary-btn table-action-btn" type="button" data-action="stock-in-item" data-item-id="${item.id}">Stock In</button>
                    <button class="primary-btn table-action-btn" type="button" data-action="stock-out-item" data-item-id="${item.id}">Stock Out</button>`
                              : ""
                          }
                          <button class="primary-btn table-action-btn" type="button" data-action="edit-item" data-item-id="${item.id}">Edit</button>
                          <button class="ghost-btn table-delete-btn" type="button" data-action="delete-item" data-item-id="${item.id}">Delete</button>
                        `
                        : `<span class="notes">Login required to make changes.</span>`
                    }
                  </div>
                </td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
    ${
      shouldPaginateInventory
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
  const schoolFilterValue = filterSchool ? filterSchool.value : "All";
  const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";

  return state.inventory.filter((item) => {
    const stockCardMatch = !isStockCardPage || item.assetType === "Not Expandable";
    const inventoryItemMatch = !isInventoryItemPage || item.assetType !== "Not Expandable";
    const teacherMatch = teacherFilterValue === "All" || item.teacherId === teacherFilterValue;
    const statusMatch = statusFilterValue === "All" || item.status === statusFilterValue;
    const itemTypeMatch = itemTypeFilterValue === "All" || item.assetType === itemTypeFilterValue;
    const schoolMatch = schoolFilterValue === "All" || item.schoolName === schoolFilterValue;
    const searchMatch =
      !searchValue ||
      [
        item.name,
        item.itemForm,
        item.bundleItems,
        item.category,
        item.subcategory,
        item.categoryCode,
        item.subcategoryCode,
        item.description,
        item.dateReceived,
        item.brandName,
        item.modelNumber,
        item.serialNumber,
        item.bookTitle,
        item.bookAuthor,
        item.bookPublisher,
        item.assetTag,
        item.location,
        item.schoolName,
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

    return stockCardMatch && inventoryItemMatch && teacherMatch && statusMatch && itemTypeMatch && schoolMatch && searchMatch;
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
      "Item Type",
      "Items Included in Bundle/Package",
      "Category",
      "Sub-Category",
      "Category Code",
      "Sub-Category Code",
      "Description",
      "Date Received",
      "Brand Name",
      "Model",
      "Serial Number",
      "Book Title",
      "Book Author",
      "Book Publisher",
      "School Name",
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
        item.itemForm || "Single",
        item.bundleItems || "",
      item.category,
      item.subcategory || "",
      item.categoryCode || "",
      item.subcategoryCode || "",
      item.description || "",
        item.dateReceived || "",
      item.brandName || "",
      item.modelNumber || "",
      item.serialNumber || "",
      item.bookTitle || "",
      item.bookAuthor || "",
      item.bookPublisher || "",
        item.schoolName || "",
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
      "School Name",
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
      teacher.schoolName || "",
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
      "Sub-Category",
      "Category Code",
      "Sub-Category Code",
      "Description",
      "Date Received",
      "Brand Name",
      "Model",
      "Serial Number",
      "Book Title",
      "Book Author",
      "Book Publisher",
      "School Name",
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
      item.subcategory || "",
      item.categoryCode || "",
      item.subcategoryCode || "",
      item.description || "",
      item.dateReceived || "",
      item.brandName || "",
      item.modelNumber || "",
      item.serialNumber || "",
      item.bookTitle || "",
      item.bookAuthor || "",
      item.bookPublisher || "",
      item.schoolName || "",
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
      "Sub-Category",
      "Category Code",
      "Sub-Category Code",
      "Description",
      "Date Received",
      "Brand Name",
      "Model",
      "Serial Number",
      "Book Title",
      "Book Author",
      "Book Publisher",
      "School Name",
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
      item.subcategory || "",
      item.categoryCode || "",
      item.subcategoryCode || "",
      item.description || "",
        item.dateReceived || "",
      item.brandName || "",
      item.modelNumber || "",
      item.serialNumber || "",
      item.bookTitle || "",
      item.bookAuthor || "",
      item.bookPublisher || "",
        item.schoolName || "",
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

function downloadIirupReportCsv() {
  const unserviceableItems = state.inventory.filter((item) => Number(item.nonUsableCount) > 0);

  if (!unserviceableItems.length) {
    window.alert("There are no unserviceable property items to export.");
    return;
  }

  const rows = [
    [
      "Item Name",
      "Category",
      "Sub-Category",
      "Category Code",
      "Sub-Category Code",
      "Description",
      "Date Received",
      "School Name",
      "Property Number",
      "Asset Type",
      "No. of Non-usable",
      "Unit of Measurement",
      "Price per Item",
      "Total Value of Unserviceable Property",
      "UACS Code",
      "Fund Cluster Code",
      "Status",
      "Assigned Personnel",
      "Location",
      "Notes",
    ],
    ...unserviceableItems.map((item) => {
      const teacher = state.teachers.find((entry) => entry.id === item.teacherId);
      const nonUsableCount = Number(item.nonUsableCount) || 0;

      return [
        item.name,
      item.category,
      item.subcategory || "",
      item.categoryCode || "",
      item.subcategoryCode || "",
      item.description || "",
        item.dateReceived || "",
        item.schoolName || "",
        item.assetTag,
        formatItemTypeLabel(item.assetType),
        nonUsableCount,
        item.unitOfMeasurement || "",
        Number(item.amount) || 0,
        nonUsableCount * (Number(item.amount) || 0),
        item.uacsCode || "",
        item.fundClusterCode || "",
        formatStatusLabel(item.status),
        teacher ? getTeacherDisplayName(teacher) : "",
        item.location || "",
        item.notes || "",
      ];
    }),
  ];

  downloadCsvFile(rows, `iirup-report-${todayISO()}.csv`);
}

function downloadInventoryReportCsv() {
  const inventoryItems = state.inventory.filter((item) => item.assetType === "Not Expandable");

  if (!inventoryItems.length) {
    window.alert("There are no inventory items to export.");
    return;
  }

  const rows = [
    [
      "Item Name",
      "Category",
      "Sub-Category",
      "Category Code",
      "Sub-Category Code",
      "Description",
      "Date Received",
      "Brand Name",
      "Model",
      "Serial Number",
      "Book Title",
      "Book Author",
      "Book Publisher",
      "School Name",
      "Property Number",
      "Quantity",
      "Quantity per Physical Count",
      "No. of Usable",
      "No. of Non-usable",
      "Unit of Measurement",
      "Price per Item",
      "Total Amount",
      "UACS Code",
      "Fund Cluster Code",
      "Reference Number",
      "Status",
      "Assigned Personnel",
      "Current Position",
      "Location",
      "Notes",
    ],
    ...inventoryItems.map((item) => {
      const teacher = state.teachers.find((entry) => entry.id === item.teacherId);

      return [
        item.name,
      item.category,
      item.subcategory || "",
      item.categoryCode || "",
      item.subcategoryCode || "",
      item.description || "",
        item.dateReceived || "",
      item.brandName || "",
      item.modelNumber || "",
      item.serialNumber || "",
      item.bookTitle || "",
      item.bookAuthor || "",
      item.bookPublisher || "",
        item.schoolName || "",
        item.assetTag,
        item.quantity,
        item.quantityPerPhysicalCount ?? 0,
        item.usableCount ?? 0,
        item.nonUsableCount ?? 0,
        item.unitOfMeasurement || "",
        Number(item.amount) || 0,
        getInventoryTotalAmount(item),
        item.uacsCode || "",
        item.fundClusterCode || "",
        item.referenceNumber || "",
        formatStatusLabel(item.status),
        teacher ? getTeacherDisplayName(teacher) : "",
        teacher ? teacher.currentPosition || "" : "",
        item.location || "",
        item.notes || "",
      ];
    }),
  ];

  downloadCsvFile(rows, `rpci-report-${todayISO()}.csv`);
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
      "Date Received",
      "Brand Name",
      "Model",
      "Serial Number",
      "Book Title",
      "Book Author",
      "Book Publisher",
      "School Name",
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
        item.dateReceived || "",
      item.brandName || "",
      item.modelNumber || "",
      item.serialNumber || "",
      item.bookTitle || "",
      item.bookAuthor || "",
      item.bookPublisher || "",
        item.schoolName || "",
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

function handleTeacherFilterChange() {
  currentTeacherPage = 1;
  renderTeachers();
}

function handleSchoolFilterChange() {
  currentInventoryPage = 1;
  currentTeacherPage = 1;
  renderTeachers();
  renderInventory();
}

function getFilteredTeachers() {
  const schoolFilterValue = filterSchool ? filterSchool.value : "All";
  const searchValue = teacherSearchInput ? teacherSearchInput.value.trim().toLowerCase() : "";

  return state.teachers.filter((teacher) => {
    const schoolMatch = schoolFilterValue === "All" || teacher.schoolName === schoolFilterValue;
    const searchMatch =
      !searchValue ||
      [
        teacher.lastName,
        teacher.firstName,
        teacher.middleName,
        teacher.suffixName,
        teacher.schoolName,
        teacher.department,
        teacher.currentPosition,
        teacher.email,
        teacher.gender,
        teacher.civilStatus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);

    return schoolMatch && searchMatch;
  });
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
    const totalPages = Math.max(1, Math.ceil(getFilteredInventoryItems().length / LISTING_PAGE_SIZE));
    currentInventoryPage = Math.min(totalPages, currentInventoryPage + 1);
    renderInventory();
    return;
  }

  if (stockInButton) {
    if (!state.auth.authenticated) {
      showAuthRequiredMessage();
      return;
    }
    openStockInModal(stockInButton.dataset.itemId);
    return;
  }

  if (stockOutButton) {
    if (!state.auth.authenticated) {
      showAuthRequiredMessage();
      return;
    }
    openStockOutModal(stockOutButton.dataset.itemId);
    return;
  }

  if (editButton) {
    if (!state.auth.authenticated) {
      showAuthRequiredMessage();
      return;
    }
    openEditModal(editButton.dataset.itemId);
    return;
  }

  if (!deleteButton) {
    return;
  }

  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
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
  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
    return;
  }

  if (!editModal || !editInventoryForm || !editItemTeacher) {
    return;
  }

  const item = state.inventory.find((entry) => entry.id === itemId);

  if (!item) {
    return;
  }

  editingItemId = item.id;
  document.querySelector("#editItemName").value = item.name;
  editItemFormInput.value = item.itemForm || "Single";
  renderBundleItemLines("edit", getBundleItems(item.bundleItems));
  updateBundleItemsUI("edit");
  document.querySelector("#editItemCategory").value = getCategoryCodeForItem(item);
  updateSubcategoryUI("edit", item.subcategory || "");
  document.querySelector("#editItemCategoryCode").value = item.categoryCode || "";
  document.querySelector("#editItemSubcategoryCode").value = item.subcategoryCode || "";
  document.querySelector("#editItemDescription").value = item.description || "";
  document.querySelector("#editItemDateReceived").value = item.dateReceived || "";
  document.querySelector("#editItemBrandName").value = item.brandName || "";
  editItemModelNumberInput.value = item.modelNumber || "";
  editItemSerialNumberInput.value = item.serialNumber || "";
  document.querySelector("#editItemBookTitle").value = item.bookTitle || "";
  editItemBookAuthorInput.value = item.bookAuthor || "";
  document.querySelector("#editItemBookPublisher").value = item.bookPublisher || "";
  updateBookFieldsUI("edit");
  updateEquipmentFieldsUI("edit");
  document.querySelector("#editItemSchoolName").value = item.schoolName || "Landahan Elementary School";
  renderTeacherSelects();
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
  document.querySelector("#editItemAcquiredType").value = item.acquisitionType || normalizeAcquisitionType(item.acquiredType);
  document.querySelector("#editItemAcquiredDetails").value = item.acquiredDetails || "";
  updateAcquiredDetailsUI("edit");
  document.querySelector("#editItemLocation").value = item.location;
  document.querySelector("#editItemStatus").value = item.propertyCondition || getPropertyConditionFromStatus(item.status);
  editItemTeacher.value = item.teacherId || "";
  document.querySelector("#editItemAssignedDate").value = item.assignedDate || "";
  document.querySelector("#editItemNotes").value = item.notes || "";
  editModal.classList.remove("hidden");
}

async function handleEditInventorySubmit(event) {
  event.preventDefault();

  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
    return;
  }

  const item = state.inventory.find((entry) => entry.id === editingItemId);

  if (!item) {
    closeEditModal();
    return;
  }

  const teacherId = editItemTeacher.value;
  const updatedItem = {
    name: document.querySelector("#editItemName").value.trim(),
    itemForm: editItemFormInput.value,
    bundleItems: getBundleItemsValue("edit"),
    category: getSelectedCategoryName("edit"),
    subcategory: editItemSubcategoryInput.value,
    categoryCode: document.querySelector("#editItemCategoryCode").value,
    subcategoryCode: document.querySelector("#editItemSubcategoryCode").value,
    description: document.querySelector("#editItemDescription").value.trim(),
    dateReceived: document.querySelector("#editItemDateReceived").value,
    brandName: document.querySelector("#editItemBrandName").value.trim(),
    modelNumber: editItemModelNumberInput.value.trim(),
    serialNumber: editItemSerialNumberInput.value.trim(),
    bookTitle: document.querySelector("#editItemBookTitle").value.trim(),
    bookAuthor: editItemBookAuthorInput.value.trim(),
    bookPublisher: document.querySelector("#editItemBookPublisher").value.trim(),
    schoolName: document.querySelector("#editItemSchoolName").value.trim(),
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
    acquisitionType: document.querySelector("#editItemAcquiredType").value,
    acquiredType: toLegacyAcquiredType(document.querySelector("#editItemAcquiredType").value),
    acquiredDetails: getAcquiredDetailsValue("edit"),
    location: document.querySelector("#editItemLocation").value.trim(),
    propertyCondition: document.querySelector("#editItemStatus").value,
    status: getStatusForAssignment(mapPropertyConditionToStatus(document.querySelector("#editItemStatus").value), teacherId),
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
  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
    return;
  }

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
  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
    return;
  }

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

  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
    return;
  }

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

  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
    return;
  }

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
    schoolName: get("SchoolName").value.trim(),
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

function getBundleItems(value) {
  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value || "[]");
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => ({ name: String(item.name || "").trim(), quantity: Math.max(1, Number(item.quantity) || 1) }))
        .filter((item) => item.name);
    }
  } catch {
    // Older bundle records used one item per line.
  }

  return String(value || "")
    .split("\n")
    .map((name) => ({ name: name.trim(), quantity: 1 }))
    .filter((item) => item.name);
}

function getBundleItemsValue(prefix) {
  const typeSelect = prefix === "edit" ? editItemFormInput : itemFormInput;
  const lines = prefix === "edit" ? editItemBundleItemLines : itemBundleItemLines;

  if (typeSelect?.value !== "Bundle/Package" || !lines) {
    return "";
  }

  const items = [...lines.querySelectorAll(".bundle-item-line")].map((line) => ({
    name: line.querySelector('[data-bundle-field="name"]').value.trim(),
    quantity: Math.max(1, Number(line.querySelector('[data-bundle-field="quantity"]').value) || 1),
  }));

  return JSON.stringify(items);
}

function updateBundleItemsUI(prefix) {
  const typeSelect = prefix === "edit" ? editItemFormInput : itemFormInput;
  const wrap = prefix === "edit" ? editItemBundleItemsWrap : itemBundleItemsWrap;
  const lines = prefix === "edit" ? editItemBundleItemLines : itemBundleItemLines;

  if (!typeSelect || !wrap || !lines) {
    return;
  }

  const isBundle = typeSelect.value === "Bundle/Package";
  wrap.classList.toggle("hidden", !isBundle);

  if (!isBundle) {
    lines.innerHTML = "";
    return;
  }

  if (!lines.children.length) {
    addBundleItemLine(prefix);
  }
}

function addBundleItemLine(prefix, item = { name: "", quantity: 1 }) {
  const lines = prefix === "edit" ? editItemBundleItemLines : itemBundleItemLines;
  if (!lines) {
    return;
  }

  const line = document.createElement("div");
  line.className = "bundle-item-line";
  line.innerHTML = `
    <label>
      <span>Item Name</span>
      <input type="text" data-bundle-field="name" value="${escapeHtmlAttribute(item.name || "")}" required>
    </label>
    <label>
      <span>Quantity</span>
      <input type="number" data-bundle-field="quantity" min="1" value="${Math.max(1, Number(item.quantity) || 1)}" required>
    </label>
    <button class="ghost-btn" type="button" data-action="remove-bundle-item">Remove</button>
  `;
  lines.append(line);
}

function renderBundleItemLines(prefix, items) {
  const lines = prefix === "edit" ? editItemBundleItemLines : itemBundleItemLines;
  if (!lines) {
    return;
  }

  lines.innerHTML = "";
  items.forEach((item) => addBundleItemLine(prefix, item));
}

function handleBundleItemLineClick(event, prefix) {
  const removeButton = event.target.closest('[data-action="remove-bundle-item"]');
  if (!removeButton) {
    return;
  }

  const lines = prefix === "edit" ? editItemBundleItemLines : itemBundleItemLines;
  removeButton.closest(".bundle-item-line")?.remove();

  if (lines && !lines.children.length) {
    addBundleItemLine(prefix);
  }
}

function updateBookFieldsUI(prefix) {
  const categoryInput = prefix === "edit" ? editItemCategoryInput : itemCategoryInput;
  const subcategoryInput = prefix === "edit" ? editItemSubcategoryInput : itemSubcategoryInput;
  const titleInput = prefix === "edit" ? editItemBookTitleInput : itemBookTitleInput;
  const authorInput = prefix === "edit" ? editItemBookAuthorInput : itemBookAuthorInput;
  const publisherInput = prefix === "edit" ? editItemBookPublisherInput : itemBookPublisherInput;
  const selectedSubcategory = PROPERTY_CLASSIFICATIONS[categoryInput?.value]?.subcategories
    .find((entry) => entry.name === subcategoryInput?.value);
  const isStandardTextbook = categoryInput?.value === "55" && selectedSubcategory?.code === "10";
  const isReferenceMaterial = categoryInput?.value === "55" && selectedSubcategory?.code === "20";

  [
    [titleInput, isStandardTextbook || isReferenceMaterial],
    [authorInput, isStandardTextbook],
    [publisherInput, isStandardTextbook || isReferenceMaterial],
  ].forEach(([input, isVisible]) => {
    if (!input) {
      return;
    }

    input.closest("label")?.classList.toggle("hidden", !isVisible);
    input.required = Boolean(isVisible);

    if (!isVisible) {
      input.value = "";
    }
  });
}

function renderBookAutocomplete() {
  if (!state.bookCatalog.length) {
    return;
  }

  const fields = [
    ["bookTitleOptions", "title", [itemBookTitleInput, editItemBookTitleInput]],
    ["bookAuthorOptions", "authors", [itemBookAuthorInput, editItemBookAuthorInput]],
    ["bookPublisherOptions", "publisher", [itemBookPublisherInput, editItemBookPublisherInput]],
  ];

  fields.forEach(([listId, property, inputs]) => {
    let dataList = document.querySelector(`#${listId}`);

    if (!dataList) {
      dataList = document.createElement("datalist");
      dataList.id = listId;
      document.body.append(dataList);
    }

    const values = [...new Set(state.bookCatalog.map((book) => String(book[property] || "").trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    dataList.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}"></option>`).join("");
    inputs.filter(Boolean).forEach((input) => input.setAttribute("list", listId));
  });
}

function applyBookCatalogMatch(prefix) {
  const titleInput = prefix === "edit" ? editItemBookTitleInput : itemBookTitleInput;
  const authorInput = prefix === "edit" ? editItemBookAuthorInput : itemBookAuthorInput;
  const publisherInput = prefix === "edit" ? editItemBookPublisherInput : itemBookPublisherInput;
  const selectedTitle = titleInput?.value.trim().toLowerCase();

  if (!selectedTitle) {
    return;
  }

  const matches = state.bookCatalog.filter((book) => book.title.trim().toLowerCase() === selectedTitle);
  const authorMatch = matches.find((book) => book.authors?.trim());
  const publisherMatch = matches.find((book) => book.publisher?.trim());

  if (authorInput && !authorInput.value.trim() && authorMatch) {
    authorInput.value = authorMatch.authors.trim();
  }

  if (publisherInput && !publisherInput.value.trim() && publisherMatch) {
    publisherInput.value = publisherMatch.publisher.trim();
  }
}

function updateEquipmentFieldsUI(prefix) {
  const categoryInput = prefix === "edit" ? editItemCategoryInput : itemCategoryInput;
  const inputs = prefix === "edit"
    ? [editItemBrandNameInput, editItemModelNumberInput, editItemSerialNumberInput]
    : [itemBrandNameInput, itemModelNumberInput, itemSerialNumberInput];
  const isEquipmentCategory = ["50", "51", "53"].includes(categoryInput?.value);

  inputs.forEach((input) => {
    if (!input) {
      return;
    }

    input.closest("label")?.classList.toggle("hidden", !isEquipmentCategory);
    input.required = isEquipmentCategory;

    if (!isEquipmentCategory) {
      input.value = "";
    }
  });
}

function renderCategoryOptions() {
  const options = [
    '<option value="">Select category</option>',
    ...Object.entries(PROPERTY_CLASSIFICATIONS).map(([code, classification]) =>
      `<option value="${code}">${escapeHtml(classification.name)}</option>`),
  ].join("");

  [itemCategoryInput, editItemCategoryInput].filter(Boolean).forEach((input) => {
    input.innerHTML = options;
  });
}

function reorderAddInventoryFields() {
  const grid = inventoryForm?.querySelector(".input-grid");
  const orderedFieldIds = [
    "itemSchoolName", "itemName", "itemDescription", "itemCategory", "itemSubcategory",
    "itemBookTitle", "itemBookAuthor", "itemBookPublisher", "itemBrandName", "itemModelNumber", "itemSerialNumber",
    "itemCategoryCode", "itemSubcategoryCode", "itemUacsCode", "itemTag",
    "itemForm", "itemBundleItemsWrap", "itemAmount", "itemAssetType", "itemFundClusterCode", "itemUnit",
    "itemAcquiredType", "itemAcquiredDetails", "itemReferenceNumber", "itemDateReceived",
    "itemQuantity", "itemTotalAmount", "itemQuantityPerPropertyCard", "itemQuantityPerPhysicalCount",
    "itemUsableCount", "itemNonUsableCount", "itemIcsNumberSource", "itemIcsNumberDistribute",
    "itemTeacher", "itemAssignedDate", "itemLocation", "itemStatus", "itemNotes",
  ];

  if (!grid) {
    return;
  }

  orderedFieldIds.forEach((id) => {
    const element = document.querySelector(`#${id}`);
    const field = element?.matches("label, .bundle-items-editor") ? element : element?.closest("label");
    if (field) {
      grid.append(field);
    }
  });
}

function toLegacyAcquiredType(acquisitionType) {
  if (acquisitionType === "Purchase") {
    return "Purchase";
  }

  if (acquisitionType === "Donation") {
    return "Donated";
  }

  return "Not Applicable";
}

function normalizeAcquisitionType(acquiredType) {
  return acquiredType === "Donated" ? "Donation" : acquiredType === "Purchase" ? "Purchase" : "Provision/Issuance";
}

function mapPropertyConditionToStatus(condition) {
  if (condition === "For Maintenance/Repair") {
    return "Maintenance";
  }

  if (condition === "Not Usable") {
    return "Retired";
  }

  return "Available";
}

function getPropertyConditionFromStatus(status) {
  if (status === "Maintenance") {
    return "For Maintenance/Repair";
  }

  if (status === "Retired") {
    return "Not Usable";
  }

  return "Working/Available";
}

function getSelectedCategoryName(prefix) {
  const categoryInput = prefix === "edit" ? editItemCategoryInput : itemCategoryInput;
  return PROPERTY_CLASSIFICATIONS[categoryInput?.value]?.name || "";
}

function getCategoryCodeForItem(item) {
  if (item.categoryCode && PROPERTY_CLASSIFICATIONS[item.categoryCode]) {
    return item.categoryCode;
  }

  return Object.entries(PROPERTY_CLASSIFICATIONS)
    .find(([, classification]) => classification.name === item.category)?.[0] || "";
}

function updateSubcategoryUI(prefix, selectedSubcategory = "") {
  const categoryInput = prefix === "edit" ? editItemCategoryInput : itemCategoryInput;
  const subcategoryInput = prefix === "edit" ? editItemSubcategoryInput : itemSubcategoryInput;
  const classification = PROPERTY_CLASSIFICATIONS[categoryInput?.value];

  if (!subcategoryInput) {
    return;
  }

  if (!classification) {
    subcategoryInput.innerHTML = '<option value="">No mapped sub-categories</option>';
    subcategoryInput.disabled = true;
    subcategoryInput.required = false;
    clearPropertyClassification(prefix);
    return;
  }

  subcategoryInput.innerHTML = [
    '<option value="">Select sub-category</option>',
    ...classification.subcategories.map((subcategory) =>
      `<option value="${escapeHtml(subcategory.name)}">${escapeHtml(subcategory.name)}</option>`),
  ].join("");
  subcategoryInput.disabled = false;
  subcategoryInput.required = true;

  if (classification.subcategories.some((subcategory) => subcategory.name === selectedSubcategory)) {
    subcategoryInput.value = selectedSubcategory;
  }

  applyPropertyClassification(prefix);
}

function applyPropertyClassification(prefix) {
  const idPrefix = prefix === "edit" ? "editItem" : "item";
  const categoryInput = prefix === "edit" ? editItemCategoryInput : itemCategoryInput;
  const subcategoryInput = prefix === "edit" ? editItemSubcategoryInput : itemSubcategoryInput;
  const categoryCodeInput = document.querySelector(`#${idPrefix}CategoryCode`);
  const subcategoryCodeInput = document.querySelector(`#${idPrefix}SubcategoryCode`);
  const propertyNumberInput = document.querySelector(`#${idPrefix}Tag`);
  const uacsInput = document.querySelector(`#${idPrefix}UacsCode`);
  const classification = PROPERTY_CLASSIFICATIONS[categoryInput?.value];
  const subcategory = classification?.subcategories.find((entry) => entry.name === subcategoryInput?.value);

  const effectiveCategoryCode = subcategory?.categoryCode || categoryInput?.value || "";
  categoryCodeInput.value = effectiveCategoryCode;
  subcategoryCodeInput.value = subcategory?.code || "";

  if (!classification || !subcategory) {
    return;
  }

  propertyNumberInput.value = `${effectiveCategoryCode}-${subcategory.code}-`;
  uacsInput.value = subcategory.uacsCode;
}

function clearPropertyClassification(prefix) {
  const idPrefix = prefix === "edit" ? "editItem" : "item";
  document.querySelector(`#${idPrefix}CategoryCode`).value = "";
  document.querySelector(`#${idPrefix}SubcategoryCode`).value = "";
}

function updateSchoolFieldVisibility() {
  const isAdmin = state.auth.role === "admin";

  [
    [document.querySelector("#itemSchoolNameWrap"), itemSchoolNameInput],
    [editItemSchoolNameInput?.closest("label"), editItemSchoolNameInput],
  ].forEach(([wrap, input]) => {
    if (!wrap || !input) {
      return;
    }

    wrap.classList.toggle("hidden", !isAdmin);
  });
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

  if (selected === "Donation") {
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

  if (type === "Donation" || type === "Donated") {
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
  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
    return;
  }

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
  document.querySelector("#editTeacherSchoolName").value = teacher.schoolName || "Landahan Elementary School";
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
  if (!state.auth.authenticated) {
    showAuthRequiredMessage();
    return;
  }

  if (!addTeacherModal || !teacherForm) {
    return;
  }

  teacherForm.reset();
  document.querySelector("#teacherSchoolName").value = "Landahan Elementary School";
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
  document.querySelector("#teacherSchoolName").value = "Landahan Elementary School";
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

function escapeHtmlAttribute(value) {
  return escapeHtml(value).replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function showAuthRequiredMessage() {
  window.alert("Please log in first to add, edit, or delete records.");
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
