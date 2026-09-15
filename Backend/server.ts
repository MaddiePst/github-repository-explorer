import dotenv from "dotenv"; // reads env file
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./Routes/authRoutes";
import repoRoutes from "./Routes/repoRoutes";

const app = express();
const PORT = Number(process.env.PORT || 8000);

// Allowed frontend origins. Override/extend via CORS_ORIGIN in .env
// (comma-separated) so deployed URLs don't need a code change.
const defaultOrigins = [
  "http://localhost:5173",
  "https://github-repository-explorer-three.vercel.app",
];
const envOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json()); // parses incoming JSON request bodies
app.use(morgan("dev")); // logs requests to the console

app.use("/auth", authRoutes);
app.use("/repo", repoRoutes);

app.get("/", (req, res) => res.send("GitHub Repo Explorer API"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled error:", err);
  res
    .status(err?.status || 500)
    .json({ message: err?.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
