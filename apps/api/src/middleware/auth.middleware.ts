import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";
import { readToken } from "../utils/jwt.js";

export const requireAuth: RequestHandler = (request, _response, next) => {
  try {
    const match = /^Bearer (\S+)$/.exec(request.header("Authorization") ?? "");
    if (!match?.[1])
      throw new AppError(
        401,
        "TOKEN_REQUIRED",
        "Inicia sesión para continuar.",
      );
    request.authClaims = readToken(match[1]);
    next();
  } catch (error) {
    next(error);
  }
};
