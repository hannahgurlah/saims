const {
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
} = require("./data-provider");
const {
  authenticateCredentials,
  clearSessionCookie,
  createSessionCookie,
  getAdminUsername,
  readSession,
  requireAuthenticated,
} = require("./auth");
const { readJsonBody, sendJson } = require("./http");

function isSchoolManager(session) {
  return session && session.role === "manager" && session.schoolName;
}

function filterBySessionSchool(items, session) {
  if (!isSchoolManager(session)) {
    return items;
  }

  return items.filter((item) => item.schoolName === session.schoolName);
}

function assertSchoolAccess(session, schoolName) {
  if (isSchoolManager(session) && schoolName !== session.schoolName) {
    throw new HttpError(403, "Managers can only manage records for their assigned school");
  }
}

async function assertTeacherAccess(session, teacherId) {
  if (!isSchoolManager(session)) {
    return;
  }

  const teacher = (await listTeachers()).find((entry) => entry.id === teacherId);

  if (!teacher) {
    throw new HttpError(404, "Teacher not found");
  }

  assertSchoolAccess(session, teacher.schoolName);
}

async function assertInventoryAccess(session, itemId) {
  if (!isSchoolManager(session)) {
    return null;
  }

  const item = await getInventoryItem(itemId);

  if (!item) {
    throw new HttpError(404, "Inventory item not found");
  }

  assertSchoolAccess(session, item.schoolName);
  return item;
}

async function handleApiRequest(request, response, pathname) {
  try {
    const movementMatch = pathname.match(/^\/api\/inventory\/([^/]+)\/movements$/);
    const inventoryMatch = pathname.match(/^\/api\/inventory\/([^/]+)$/);
    const teacherMatch = pathname.match(/^\/api\/teachers\/([^/]+)$/);

    if (request.method === "GET" && pathname === "/api/auth/session") {
      const session = readSession(request);
      sendJson(response, 200, {
        authenticated: Boolean(session),
        username: session ? session.username : "",
        role: session ? session.role : "",
        schoolName: session ? session.schoolName : "",
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/auth/login") {
      const body = await readJsonBody(request);
      const user = authenticateCredentials(body.username || "", body.password || "");

      if (!user) {
        throw new HttpError(401, "Invalid username or password");
      }

      sendJson(
        response,
        200,
        {
          authenticated: true,
          username: user.username || getAdminUsername(),
          role: user.role || "admin",
          schoolName: user.schoolName || "",
        },
        {
          "Set-Cookie": createSessionCookie(user),
        },
      );
      return;
    }

    if (request.method === "POST" && pathname === "/api/auth/logout") {
      sendJson(
        response,
        200,
        {
          authenticated: false,
          username: "",
          role: "",
          schoolName: "",
        },
        {
          "Set-Cookie": clearSessionCookie(),
        },
      );
      return;
    }

    if (request.method === "GET" && pathname === "/api/teachers") {
      sendJson(response, 200, filterBySessionSchool(await listTeachers(), readSession(request)));
      return;
    }

    if (request.method === "POST" && pathname === "/api/teachers") {
      const session = requireAuthenticated(request);
      const body = await readJsonBody(request);
      assertSchoolAccess(session, body.schoolName || "Landahan Elementary School");
      sendJson(response, 201, await createTeacher(body));
      return;
    }

    if (teacherMatch && request.method === "PUT") {
      const session = requireAuthenticated(request);
      const teacherId = decodeURIComponent(teacherMatch[1]);
      const body = await readJsonBody(request);
      await assertTeacherAccess(session, teacherId);
      assertSchoolAccess(session, body.schoolName || "Landahan Elementary School");
      sendJson(response, 200, await updateTeacher(teacherId, body));
      return;
    }

    if (teacherMatch && request.method === "DELETE") {
      const session = requireAuthenticated(request);
      const teacherId = decodeURIComponent(teacherMatch[1]);
      await assertTeacherAccess(session, teacherId);
      await deleteTeacher(teacherId);
      sendJson(response, 204, null);
      return;
    }

    if (request.method === "GET" && pathname === "/api/inventory") {
      sendJson(response, 200, filterBySessionSchool(await listInventory(), readSession(request)));
      return;
    }

    if (request.method === "GET" && pathname === "/api/books") {
      requireAuthenticated(request);
      sendJson(response, 200, await listBookCatalog());
      return;
    }

    if (request.method === "POST" && pathname === "/api/inventory") {
      const session = requireAuthenticated(request);
      const body = await readJsonBody(request);
      assertSchoolAccess(session, body.schoolName || "Landahan Elementary School");
      sendJson(response, 201, await createInventoryItem(body));
      return;
    }

    if (movementMatch && request.method === "GET") {
      const session = readSession(request);
      const itemId = decodeURIComponent(movementMatch[1]);
      await assertInventoryAccess(session, itemId);
      sendJson(response, 200, await listStockMovements(itemId));
      return;
    }

    if (movementMatch && request.method === "POST") {
      const session = requireAuthenticated(request);
      const itemId = decodeURIComponent(movementMatch[1]);
      await assertInventoryAccess(session, itemId);
      sendJson(response, 201, await createStockMovement(itemId, await readJsonBody(request)));
      return;
    }

    if (inventoryMatch && request.method === "GET") {
      const session = readSession(request);
      const itemId = decodeURIComponent(inventoryMatch[1]);
      const item = await getInventoryItem(itemId);

      if (!item) {
        throw new HttpError(404, "Inventory item not found");
      }

      assertSchoolAccess(session, item.schoolName);
      sendJson(response, 200, item);
      return;
    }

    if (inventoryMatch && request.method === "PUT") {
      const session = requireAuthenticated(request);
      const itemId = decodeURIComponent(inventoryMatch[1]);
      const body = await readJsonBody(request);
      await assertInventoryAccess(session, itemId);
      assertSchoolAccess(session, body.schoolName || "Landahan Elementary School");
      sendJson(response, 200, await updateInventoryItem(itemId, body));
      return;
    }

    if (inventoryMatch && request.method === "DELETE") {
      const session = requireAuthenticated(request);
      const itemId = decodeURIComponent(inventoryMatch[1]);
      await assertInventoryAccess(session, itemId);
      await deleteInventoryItem(itemId);
      sendJson(response, 204, null);
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(response, error.statusCode, { error: error.message });
      return;
    }

    console.error(error);
    sendJson(response, 500, { error: "Internal server error" });
  }
}

module.exports = {
  handleApiRequest,
};
