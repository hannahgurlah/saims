const { createClient } = require("@supabase/supabase-js");

const DEFAULT_SUPABASE_URL = "https://uurrzwfxkwxurnuvtwnj.supabase.co";

function getSupabaseEnv() {
  return {
    url: process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL,
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "",
  };
}

function getSupabaseClient() {
  if (!globalThis.__landahanSupabaseClient) {
    const { url, serviceRoleKey } = getSupabaseEnv();

    if (!url || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEY/SUPABASE_PUBLISHABLE_KEY.");
    }

    globalThis.__landahanSupabaseClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return globalThis.__landahanSupabaseClient;
}

module.exports = {
  getSupabaseClient,
};
