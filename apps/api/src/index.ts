import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import express from "express";
import { authRoutes } from "./routes/auth.routes.js";
import { walletRoutes } from "./routes/wallet.routes.js";
import { errorHandler } from "./utils/error-handler.js";
import { getJwtSecret } from "./utils/jwt.js";

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) loadEnvFile(envPath);
getJwtSecret(); // Fallar al iniciar si falta la configuración necesaria.

const app = express();
const port = Number(process.env.PORT) || 3002;

app.use(express.json({ limit: "16kb" }));
app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use(errorHandler);

app.listen(port, () => console.log(`API lista en http://localhost:${port}`));
