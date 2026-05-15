const { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } = require("node:crypto");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const { HttpError } = require("./data-provider");

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

function getLocalDatabasePath() {
  return process.env.LOCAL_DATABASE_PATH || path.join(process.cwd(), "database", "saims.db");
}

function sqlValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  return `'${String(value).replaceAll("'", "''")}'`;
}

function ensureUsersTable() {
  execFileSync("sqlite3", [getLocalDatabasePath(), `
    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'manager')),
      school_name TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `]);
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

function hashPassword(password, salt = randomBytes(16).toString("base64url"), iterations = 120000) {
  const hash = pbkdf2Sync(String(password), salt, iterations, 32, "sha256").toString("base64url");
  return `pbkdf2-sha256:${iterations}:${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [algorithm, iterationsText, salt, expectedHash] = String(storedHash || "").split(":");

  if (algorithm !== "pbkdf2-sha256" || !iterationsText || !salt || !expectedHash) {
    return false;
  }

  const actualHash = hashPassword(password, salt, Number(iterationsText)).split(":").at(-1);
  return safeCompare(actualHash, expectedHash);
}

function getUserByUsername(username) {
  ensureUsersTable();

  const output = execFileSync("sqlite3", [
    "-json",
    getLocalDatabasePath(),
    `
      SELECT id, username, password_hash, role, school_name
      FROM app_users
      WHERE username = ${sqlValue(username)}
      LIMIT 1
    `,
  ], { encoding: "utf8" });
  const rows = JSON.parse(output || "[]");

  return rows[0] || null;
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

function createSessionCookie(user) {
  const payload = JSON.stringify({
    username: user.username,
    role: user.role || "admin",
    schoolName: user.schoolName || user.school_name || "",
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
      role: payload.role || "admin",
      schoolName: payload.schoolName || "",
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
  const user = getUserByUsername(username);

  if (user && verifyPassword(password, user.password_hash)) {
    return {
      username: user.username,
      role: user.role,
      schoolName: user.school_name || "",
    };
  }

  if (safeCompare(username, getAdminUsername()) && safeCompare(password, getAdminPassword())) {
    return {
      username: getAdminUsername(),
      role: "admin",
      schoolName: "",
    };
  }

  return null;
}

module.exports = {
  authenticateCredentials,
  clearSessionCookie,
  createSessionCookie,
  getAdminUsername,
  hashPassword,
  readSession,
  requireAuthenticated,
};
