const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { ROOT_DIR } = require("./lib/db");
const { handleApiRequest } = require("./lib/api-router");
const { sendJson, sendText } = require("./lib/http");

const PORT = process.env.PORT || 3000;
const STATIC_ROOT_DIR = path.join(ROOT_DIR, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApiRequest(request, response, url.pathname);
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

function serveStaticFile(response, requestPath) {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.resolve(STATIC_ROOT_DIR, `.${normalizedPath}`);

  if (!filePath.startsWith(STATIC_ROOT_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(response, 404, "Not found");
    return;
  }

  const extension = path.extname(filePath);
  response.writeHead(200, {
    "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
  });
  response.end(fs.readFileSync(filePath));
}
