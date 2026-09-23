/* ============================================================
   COUCHE CLOUD (Supabase) — auth, config partagée, Tamagotchis
   en base, classement. Chargé après supabase-js (UMD) et tama-config.js.
   Expose window.CLOUD.
   ============================================================ */
(function () {
  "use strict";

  const SUPABASE_URL = "https://sxzipfpgsdpixmewbebi.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ebeV9_CXgPOWO48yJgfi9A_rt7AsfqU";
  const FN_SAVE_CONFIG = SUPABASE_URL + "/functions/v1/save-config";

  const ok = window.supabase && window.supabase.createClient;
  const sb = ok ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  }) : null;

  function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
  function deepMerge(base, over) {
    if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
    const out = JSON.parse(JSON.stringify(base));
    for (const k in over) out[k] = (isObj(base[k]) && isObj(over[k])) ? deepMerge(base[k], over[k]) : over[k];
    return out;
  }

  const CLOUD = {
    available: !!sb,
    sb,

    // ---- Auth ----
    async currentUser() { if (!sb) return null; const { data } = await sb.auth.getUser(); return data.user || null; },
    onAuth(cb) { if (sb) sb.auth.onAuthStateChange((_e, session) => cb(session)); },
    async signUp(email, password, username) {
      return await sb.auth.signUp({ email, password, options: { data: { username } } });
    },
    async signIn(email, password) { return await sb.auth.signInWithPassword({ email, password }); },
    async signOut() { if (sb) await sb.auth.signOut(); },
    async username() {
      const u = await this.currentUser(); if (!u) return null;
      const { data } = await sb.from("profiles").select("username").eq("id", u.id).maybeSingle();
      return (data && data.username) || (u.email ? u.email.split("@")[0] : "Joueur");
    },

    // ---- Config partagée ----
    async loadConfig() {
      const defaults = window.TAMA.DEFAULTS;
      if (!sb) return JSON.parse(JSON.stringify(defaults));
      try {
        const { data } = await sb.from("game_config").select("config").eq("id", "default").maybeSingle();
        return deepMerge(defaults, (data && data.config) || {});
      } catch { return JSON.parse(JSON.stringify(defaults)); }
    },
    async saveConfig(password, config) {
      const r = await fetch(FN_SAVE_CONFIG, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
        body: JSON.stringify({ password, config }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || ("Erreur " + r.status));
      return j;
    },

    // ---- Tamagotchis ----
    async listPets() {
      const { data, error } = await sb.from("pets").select("*").order("updated_at", { ascending: false });
      if (error) throw error; return data || [];
    },
    async createPet(name, state) {
      const u = await this.currentUser();
      const { data, error } = await sb.from("pets").insert({ user_id: u.id, name, state, score: 0, summary: {} }).select().single();
      if (error) throw error; return data;
    },
    async savePet(id, state, score, summary) {
      const { error } = await sb.from("pets").update({ state, score, summary, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    async deletePet(id) { const { error } = await sb.from("pets").delete().eq("id", id); if (error) throw error; },

    // ---- Classement ----
    async leaderboard() { const { data, error } = await sb.rpc("get_leaderboard"); if (error) throw error; return data || []; },
    async leaderboardCat(cat) { const { data, error } = await sb.rpc("get_leaderboard_cat", { cat: cat || "age" }); if (error) throw error; return data || []; },
  };

  window.CLOUD = CLOUD;
})();
