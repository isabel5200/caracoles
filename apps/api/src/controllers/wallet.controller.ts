import type { RequestHandler } from "express";
import { topUp } from "../services/wallet.service.js";
import { AppError } from "../utils/app-error.js";

export const topUpController: RequestHandler = async (request, response) => {
  if (!request.authClaims)
    throw new AppError(401, "TOKEN_REQUIRED", "Inicia sesión para continuar.");
  const { operation, httpStatus } = await topUp(
    request.authClaims.userId,
    request.body,
  );
  response.status(httpStatus).json(operation);
};
