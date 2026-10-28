const { createHmac, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } = require("node:crypto");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const { HttpError } = require("./data-provider");
const { sendUserWelcomeEmail } = require("./email");

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
      role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
      school_name TEXT DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      first_name TEXT NOT NULL DEFAULT '',
      middle_name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `]);

  const columns = JSON.parse(execFileSync("sqlite3", ["-json", getLocalDatabasePath(), "PRAGMA table_info(app_users)"], { encoding: "utf8" }) || "[]");
  [["last_name", "TEXT NOT NULL DEFAULT ''"], ["first_name", "TEXT NOT NULL DEFAULT ''"], ["middle_name", "TEXT NOT NULL DEFAULT ''"], ["email", "TEXT NOT NULL DEFAULT ''"], ["status", "TEXT NOT NULL DEFAULT 'active'"]].forEach(([name, definition]) => {
    if (!columns.some((column) => column.name === name)) execFileSync("sqlite3", [getLocalDatabasePath(), `ALTER TABLE app_users ADD COLUMN ${name} ${definition}`]);
  });
  const tableSql = execFileSync("sqlite3", [getLocalDatabasePath(), "SELECT sql FROM sqlite_master WHERE type='table' AND name='app_users'"], { encoding: "utf8" });
  if (!tableSql.includes("'staff'")) {
    execFileSync("sqlite3", [getLocalDatabasePath(), `
      BEGIN;
      ALTER TABLE app_users RENAME TO app_users_legacy;
      CREATE TABLE app_users (
        id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')), school_name TEXT DEFAULT '',
        last_name TEXT NOT NULL DEFAULT '', first_name TEXT NOT NULL DEFAULT '', middle_name TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO app_users SELECT id, username, password_hash, role, school_name, last_name, first_name, middle_name, email, status, created_at, updated_at FROM app_users_legacy;
      DROP TABLE app_users_legacy;
      COMMIT;
    `]);
  }

  execFileSync("sqlite3", [getLocalDatabasePath(), "CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_email_unique ON app_users (LOWER(email)) WHERE email <> ''"]);
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
      SELECT id, username, password_hash, role, school_name, status
      FROM app_users
      WHERE username = ${sqlValue(username)}
      LIMIT 1
    `,
  ], { encoding: "utf8" });
  const rows = JSON.parse(output || "[]");

  return rows[0] || null;
}

function requireAdmin(request) {
  const session = requireAuthenticated(request);
  if (session.role !== "admin") throw new HttpError(403, "Administrator access required");
  return session;
}

function mapUser(row) {
  return { id: row.id, username: row.username, lastName: row.last_name || "", firstName: row.first_name || "", middleName: row.middle_name || "", email: row.email || "", role: row.role, assignment: row.school_name || "", status: row.status || "active" };
}

function listUsers() {
  ensureUsersTable();
  const output = execFileSync("sqlite3", ["-json", getLocalDatabasePath(), "SELECT id, username, last_name, first_name, middle_name, email, role, school_name, status FROM app_users ORDER BY last_name, first_name, username"], { encoding: "utf8" });
  return JSON.parse(output || "[]").map(mapUser);
}

function getUser(id) {
  return listUsers().find((user) => user.id === id) || null;
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "A valid email address is required");
  return email;
}

async function createUser(input) {
  ensureUsersTable();
  const username = String(input.username || "").trim();
  const password = String(input.password || "");
  const role = ["admin", "manager", "staff"].includes(input.role) ? input.role : "staff";
  const status = input.status === "inactive" ? "inactive" : "active";
  const assignment = role === "admin" ? "" : String(input.assignment || "").trim();
  const email = normalizeEmail(input.email);
  if (!username) throw new HttpError(400, "Username is required");
  if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters");
  if (role !== "admin" && !assignment) throw new HttpError(400, "An office or school assignment is required");
  const id = randomUUID();
  try {
    execFileSync("sqlite3", [getLocalDatabasePath(), `INSERT INTO app_users (id, username, password_hash, role, school_name, last_name, first_name, middle_name, email, status) VALUES (${sqlValue(id)}, ${sqlValue(username)}, ${sqlValue(hashPassword(password))}, ${sqlValue(role)}, ${sqlValue(assignment)}, ${sqlValue(String(input.lastName || "").trim())}, ${sqlValue(String(input.firstName || "").trim())}, ${sqlValue(String(input.middleName || "").trim())}, ${sqlValue(email)}, ${sqlValue(status)})`]);
  } catch (error) {
    if (/app_users\.email|idx_app_users_email_unique/i.test(error.message)) throw new HttpError(409, "Email address is already in use");
    if (/UNIQUE constraint failed/.test(error.message)) throw new HttpError(409, "Username is already in use");
    throw error;
  }
  const user = getUser(id);
  let notification = { sent: false, reason: "The notification could not be sent." };
  try { notification = await sendUserWelcomeEmail(user); } catch (error) { console.error("Unable to send SAIMS user notification:", error); }
  return { ...user, notificationSent: notification.sent, notificationMessage: notification.reason };
}

function updateUser(id, input) {
  ensureUsersTable();
  const role = ["admin", "manager", "staff"].includes(input.role) ? input.role : "staff";
  const status = input.status === "inactive" ? "inactive" : "active";
  const assignment = role === "admin" ? "" : String(input.assignment || "").trim();
  const email = normalizeEmail(input.email);
  if (role !== "admin" && !assignment) throw new HttpError(400, "An office or school assignment is required");
  try {
    execFileSync("sqlite3", [getLocalDatabasePath(), `UPDATE app_users SET username=${sqlValue(String(input.username || "").trim())}, last_name=${sqlValue(String(input.lastName || "").trim())}, first_name=${sqlValue(String(input.firstName || "").trim())}, middle_name=${sqlValue(String(input.middleName || "").trim())}, email=${sqlValue(email)}, role=${sqlValue(role)}, school_name=${sqlValue(assignment)}, status=${sqlValue(status)}, updated_at=CURRENT_TIMESTAMP WHERE id=${sqlValue(id)}`]);
  } catch (error) {
    if (/app_users\.email|idx_app_users_email_unique/i.test(error.message)) throw new HttpError(409, "Email address is already in use");
    if (/UNIQUE constraint failed/.test(error.message)) throw new HttpError(409, "Username is already in use");
    throw error;
  }
  const user = getUser(id);
  if (!user) throw new HttpError(404, "User not found");
  return user;
}

function deleteUser(id, currentUsername) {
  const user = getUser(id);
  if (!user) throw new HttpError(404, "User not found");
  if (user.username === currentUsername) throw new HttpError(400, "You cannot delete your own account");
  execFileSync("sqlite3", [getLocalDatabasePath(), `DELETE FROM app_users WHERE id=${sqlValue(id)}`]);
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
  if (safeCompare(username, getAdminUsername()) && safeCompare(password, getAdminPassword())) {
    return {
      username: getAdminUsername(),
      role: "admin",
      schoolName: "",
    };
  }

  const user = getUserByUsername(username);

  if (user && (user.status || "active") === "active" && verifyPassword(password, user.password_hash)) {
    return {
      username: user.username,
      role: user.role,
      schoolName: user.school_name || "",
    };
  }

  return null;
}

module.exports = {
  authenticateCredentials,
  clearSessionCookie,
  createSessionCookie,
  createUser,
  getAdminUsername,
  deleteUser,
  getUser,
  hashPassword,
  listUsers,
  readSession,
  requireAdmin,
  requireAuthenticated,
  updateUser,
};
