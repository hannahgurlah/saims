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
  requireAdmin,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
} = require("./auth");
const { readJsonBody, sendJson } = require("./http");

function isScopedUser(session) {
  return session && ["manager", "staff"].includes(session.role) && session.schoolName;
}

function isWithinAssignment(item, session) {
  if (!isScopedUser(session)) return true;
  if (session.role === "manager" && session.schoolName === "Elementary Schools") return item.officeType === "ES" || /Elementary School|Central School/i.test(item.schoolName || "");
  if (session.role === "manager" && session.schoolName === "High Schools") return item.officeType === "HS" || /High School|Vocational School/i.test(item.schoolName || "");
  return item.schoolName === session.schoolName || item.officeType === session.schoolName;
}

function filterBySessionSchool(items, session) {
  if (!isScopedUser(session)) {
    return items;
  }

  return items.filter((item) => isWithinAssignment(item, session));
}

function assertSchoolAccess(session, schoolName) {
  if (isScopedUser(session) && !isWithinAssignment({ schoolName, officeType: schoolName }, session)) {
    throw new HttpError(403, "You can only manage records within your assigned office or school");
  }
}

async function assertTeacherAccess(session, teacherId) {
  if (!isScopedUser(session)) {
    return;
  }

  const teacher = (await listTeachers()).find((entry) => entry.id === teacherId);

  if (!teacher) {
    throw new HttpError(404, "Teacher not found");
  }

  assertSchoolAccess(session, teacher.schoolName);
}

async function assertInventoryAccess(session, itemId) {
  if (!isScopedUser(session)) {
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
    const userMatch = pathname.match(/^\/api\/users\/([^/]+)$/);

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

    if (request.method === "GET" && pathname === "/api/users") { requireAdmin(request); sendJson(response, 200, listUsers()); return; }
    if (request.method === "POST" && pathname === "/api/users") { requireAdmin(request); sendJson(response, 201, await createUser(await readJsonBody(request))); return; }
    if (userMatch && request.method === "GET") { requireAdmin(request); const user = getUser(decodeURIComponent(userMatch[1])); if (!user) throw new HttpError(404, "User not found"); sendJson(response, 200, user); return; }
    if (userMatch && request.method === "PUT") { requireAdmin(request); sendJson(response, 200, updateUser(decodeURIComponent(userMatch[1]), await readJsonBody(request))); return; }
    if (userMatch && request.method === "DELETE") { const session = requireAdmin(request); deleteUser(decodeURIComponent(userMatch[1]), session.username); sendJson(response, 204, null); return; }

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
