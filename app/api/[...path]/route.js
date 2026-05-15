import { Readable } from "node:stream";
import apiRouter from "../../../lib/api-router.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { handleApiRequest } = apiRouter;

async function handle(request, context) {
  const params = await context.params;
  const pathname = `/api/${(params?.path || []).join("/")}`;
  const body = Buffer.from(await request.arrayBuffer());
  const nodeRequest = Readable.from(body.length ? [body] : []);

  nodeRequest.method = request.method;
  nodeRequest.headers = Object.fromEntries(request.headers.entries());

  const response = {
    statusCode: 200,
    headers: {},
    body: Buffer.alloc(0),
    writeHead(statusCode, headers = {}) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
    end(chunk = "") {
      this.body = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    },
  };

  await handleApiRequest(nodeRequest, response, pathname);

  return new Response(response.body, {
    status: response.statusCode,
    headers: response.headers,
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
