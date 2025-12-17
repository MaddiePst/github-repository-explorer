"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}
function authMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    // No token → allow request but without user
    if (!authHeader) {
        req.user = undefined;
        return next();
    }
    const token = authHeader.replace("Bearer ", "");
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };
        next();
    }
    catch (err) {
        console.warn("Invalid token:", err);
        req.user = undefined;
        next(); // still allow request
    }
}
//# sourceMappingURL=authMiddleware.js.map