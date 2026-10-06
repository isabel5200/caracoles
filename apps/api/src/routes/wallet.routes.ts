import { Router } from "express";
import { topUpController } from "../controllers/wallet.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const walletRoutes = Router();
walletRoutes.post("/top-up", requireAuth, topUpController);
