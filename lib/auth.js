const { createHmac, timingSafeEqual } = require("node:crypto");
const { HttpError } = require("./data");

const SESSION_COOKIE_NAME = "landahan_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "LandahanESAdmin2026!";
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || `${getAdminUsername()}:${getAdminPassword()}:landahan-session-secret`;
}

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookies(request) {
  const header = request.headers.cookie || "";

  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      const name = part.slice(0, separatorIndex);
      const value = part.slice(separatorIndex + 1);
      cookies[name] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function createSessionCookie(username) {
  const payload = JSON.stringify({
    username,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
  const encodedPayload = toBase64Url(payload);
  const signature = signValue(encodedPayload);
  const value = `${encodedPayload}.${signature}`;

  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function readSession(request) {
  const cookies = parseCookies(request);
  const rawValue = cookies[SESSION_COOKIE_NAME];

  if (!rawValue) {
    return null;
  }

  const [encodedPayload, signature] = rawValue.split(".");

  if (!encodedPayload || !signature || !safeCompare(signValue(encodedPayload), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload));

    if (!payload.username || !payload.expiresAt || payload.expiresAt < Date.now()) {
      return null;
    }

    return {
      username: payload.username,
    };
  } catch (error) {
    return null;
  }
}

function requireAuthenticated(request) {
  const session = readSession(request);

  if (!session) {
    throw new HttpError(401, "Authentication required");
  }

  return session;
}

function authenticateCredentials(username, password) {
  return safeCompare(username, getAdminUsername()) && safeCompare(password, getAdminPassword());
}

module.exports = {
  authenticateCredentials,
  clearSessionCookie,
  createSessionCookie,
  getAdminUsername,
  readSession,
  requireAuthenticated,
};
