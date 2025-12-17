"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabaseClient_1 = require("../Connections/supabaseClient");
const uuid_1 = require("uuid");
// Constants
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10; //Number of bcrypt rounds
// Read the JWT secret and expiry from env.
const RAW_JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ??
    "1h");
// Fail if SECRET is missing
if (!RAW_JWT_SECRET) {
    console.error("Missing JWT_SECRET environment variable. Set JWT_SECRET in your .env or environment.");
    throw new Error("Missing JWT_SECRET environment variable");
}
const JWT_SECRET = RAW_JWT_SECRET;
// ---- Controllers ----
// Register: POST /auth/register
async function register(req, res) {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }
        // check if user exists
        const { data: existing, error: qErr } = await supabaseClient_1.supabase
            .from("users")
            .select("id")
            .eq("email", String(email).toLowerCase())
            .limit(1);
        if (qErr) {
            console.error("DB error checking existing user:", qErr);
            return res.status(500).json({ message: "Database error" });
        }
        if (existing && existing.length > 0)
            return res.status(400).json({ message: "User already exists" });
        // hash password
        const hashed = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
        // insert user and return id, email, name
        // after hashing password and validating inputs: include name in the insert payload
        const { data, error } = await supabaseClient_1.supabase
            .from("users")
            .insert([
            {
                id: (0, uuid_1.v4)(),
                email: String(email).toLowerCase(),
                password: hashed,
                name: String(req.body.name || "").trim() || null,
            },
        ])
            .select("id, email, name")
            .single();
        if (!email || !password || !req.body.name) {
            return res
                .status(400)
                .json({ message: "Name, email and password required" });
        }
        if (error) {
            console.error("DB insert error:", error);
            return res.status(500).json({ message: "Insert failed" });
        }
        // Sign token with the typed secret and typed options
        const token = jsonwebtoken_1.default.sign({ id: data.id, email: data.email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });
        return res.status(201).json({
            token,
            user: { id: data.id, email: data.email, name: data.name },
        });
    }
    catch (err) {
        console.error("register error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}
// Login: POST /auth/login
async function login(req, res) {
    try {
        const { email, password } = req.body || {};
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });
        // fetch user row including hashed password
        const { data, error } = await supabaseClient_1.supabase
            .from("users")
            .select("id, email, password, name")
            .eq("email", String(email).toLowerCase())
            .limit(1)
            .single();
        if (error) {
            // user not found or other DB error
            console.error("DB error fetching user for login:", error);
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const user = data;
        // compare password
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match)
            return res.status(401).json({ message: "Invalid credentials" });
        // Sign token using the same JWT_SECRET and expiry defined above
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });
        return res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    }
    catch (err) {
        console.error("login error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}
//# sourceMappingURL=authController.js.map