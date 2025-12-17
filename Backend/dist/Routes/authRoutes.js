"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../Controllers/authController");
const router = (0, express_1.Router)();
// Create new user
router.post("/register", authController_1.register);
// Log in user
router.post("/login", authController_1.login);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map