const { loadLocalEnv } = require("./env");
const localData = require("./local-data");
const supabaseData = require("./data");

loadLocalEnv();

function useSupabase() {
  const configured = (process.env.APP_DATABASE || "").toLowerCase();

  if (configured) {
    return configured === "supabase";
  }

  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

module.exports = useSupabase() ? supabaseData : localData;
