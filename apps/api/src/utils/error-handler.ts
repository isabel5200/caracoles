import type { ErrorRequestHandler } from "express";
import type { ApiError } from "@caracoles/shared";
import { AppError } from "./app-error.js";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    response.status(error.status).json({
      error: { code: error.code, message: error.message, fields: error.fields },
    } satisfies ApiError);
    return;
  }
  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({
      error: { code: "INVALID_JSON", message: "El JSON enviado no es válido." },
    } satisfies ApiError);
    return;
  }
  console.error(error);
  response.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Ocurrió un error inesperado." },
  } satisfies ApiError);
};
