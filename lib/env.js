const fs = require("node:fs");
const path = require("node:path");

function loadLocalEnv() {
  const filePath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(filePath)) {
    return;
  }

  fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return;
      }

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

      if (!match || process.env[match[1]]) {
        return;
      }

      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    });
}

module.exports = {
  loadLocalEnv,
};
