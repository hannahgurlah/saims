const { handleApiRequest } = require("../lib/api-router");

module.exports = async function handler(request, response) {
  const rawPath = Array.isArray(request.query.path) ? request.query.path.join("/") : (request.query.path || "");
  const pathname = rawPath ? `/api/${rawPath}` : "/api";
  await handleApiRequest(request, response, pathname);
};
