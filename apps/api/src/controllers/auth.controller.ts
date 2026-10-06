import type { RequestHandler } from "express";
import { getCurrentUser, login, register } from "../services/auth.service.js";
import { AppError } from "../utils/app-error.js";

export const registerController: RequestHandler = async (request, response) => {
  const user = await register(request.body);
  response.status(201).json({ user });
};

export const loginController: RequestHandler = async (request, response) => {
  response.json(await login(request.body));
};

export const meController: RequestHandler = async (request, response) => {
  if (!request.authClaims)
    throw new AppError(401, "TOKEN_REQUIRED", "Inicia sesión para continuar.");
  const account = await getCurrentUser(request.authClaims.userId);
  if (account.user.email !== request.authClaims.email) {
    throw new AppError(401, "INVALID_TOKEN", "La sesión ya no es válida.");
  }
  response.json(account);
};
