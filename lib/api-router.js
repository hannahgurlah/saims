const {
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
} = require("./data");
const {
  authenticateCredentials,
  clearSessionCookie,
  createSessionCookie,
  getAdminUsername,
  readSession,
  requireAuthenticated,
} = require("./auth");
const { readJsonBody, sendJson } = require("./http");

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
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/auth/login") {
      const body = await readJsonBody(request);

      if (!authenticateCredentials(body.username || "", body.password || "")) {
        throw new HttpError(401, "Invalid username or password");
      }

      sendJson(
        response,
        200,
        {
          authenticated: true,
          username: body.username || getAdminUsername(),
        },
        {
          "Set-Cookie": createSessionCookie(body.username || getAdminUsername()),
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
        },
        {
          "Set-Cookie": clearSessionCookie(),
        },
      );
      return;
    }

    if (request.method === "GET" && pathname === "/api/teachers") {
      sendJson(response, 200, await listTeachers());
      return;
    }

    if (request.method === "POST" && pathname === "/api/teachers") {
      requireAuthenticated(request);
      sendJson(response, 201, await createTeacher(await readJsonBody(request)));
      return;
    }

    if (teacherMatch && request.method === "PUT") {
      requireAuthenticated(request);
      const teacherId = decodeURIComponent(teacherMatch[1]);
      sendJson(response, 200, await updateTeacher(teacherId, await readJsonBody(request)));
      return;
    }

    if (teacherMatch && request.method === "DELETE") {
      requireAuthenticated(request);
      const teacherId = decodeURIComponent(teacherMatch[1]);
      await deleteTeacher(teacherId);
      sendJson(response, 204, null);
      return;
    }

    if (request.method === "GET" && pathname === "/api/inventory") {
      sendJson(response, 200, await listInventory());
      return;
    }

    if (request.method === "POST" && pathname === "/api/inventory") {
      requireAuthenticated(request);
      sendJson(response, 201, await createInventoryItem(await readJsonBody(request)));
      return;
    }

    if (movementMatch && request.method === "GET") {
      const itemId = decodeURIComponent(movementMatch[1]);
      sendJson(response, 200, await listStockMovements(itemId));
      return;
    }

    if (movementMatch && request.method === "POST") {
      requireAuthenticated(request);
      const itemId = decodeURIComponent(movementMatch[1]);
      sendJson(response, 201, await createStockMovement(itemId, await readJsonBody(request)));
      return;
    }

    if (inventoryMatch && request.method === "GET") {
      const itemId = decodeURIComponent(inventoryMatch[1]);
      const item = await getInventoryItem(itemId);

      if (!item) {
        throw new HttpError(404, "Inventory item not found");
      }

      sendJson(response, 200, item);
      return;
    }

    if (inventoryMatch && request.method === "PUT") {
      requireAuthenticated(request);
      const itemId = decodeURIComponent(inventoryMatch[1]);
      sendJson(response, 200, await updateInventoryItem(itemId, await readJsonBody(request)));
      return;
    }

    if (inventoryMatch && request.method === "DELETE") {
      requireAuthenticated(request);
      const itemId = decodeURIComponent(inventoryMatch[1]);
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
