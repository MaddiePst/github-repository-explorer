"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv")); // reads env file
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const authRoutes_1 = __importDefault(require("./Routes/authRoutes"));
const repoRoutes_1 = __importDefault(require("./Routes/repoRoutes"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 8000);
app.use((0, cors_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "https://your-frontend-name.vercel.app"],
    credentials: true,
}));
app.use(express_1.default.json()); // parses incoming JSON request bodies
app.use((0, morgan_1.default)("dev")); // logs requests to the console
app.use("/auth", authRoutes_1.default);
app.use("/repo", repoRoutes_1.default);
app.get("/", (req, res) => res.send("GitHub Repo Explorer API"));
// Error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res
        .status(err?.status || 500)
        .json({ message: err?.message || "Server error" });
});
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
//# sourceMappingURL=server.js.map