"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Supabase URL or KEY missing in env. Ensure SUPABASE_URL and SUPABASE_KEY are set.");
    throw new Error("Supabase URL and SUPABASE_KEY are required.");
}
exports.supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
//# sourceMappingURL=supabaseClient.js.map