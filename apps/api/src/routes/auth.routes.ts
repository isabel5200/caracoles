import { Router } from "express";
import {
  loginController,
  meController,
  registerController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRoutes = Router();
authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.get("/me", requireAuth, meController);
