import jwt, { type JwtPayload } from "jsonwebtoken";
import { AppError } from "./app-error.js";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "Configura JWT_SECRET con al menos 32 caracteres en apps/api/.env.",
    );
  }
  return secret;
}

export function createToken(userId: string, email: string): string {
  return jwt.sign({ email }, getJwtSecret(), {
    algorithm: "HS256",
    subject: userId,
    expiresIn: "2h",
  });
}

export function readToken(token: string): { userId: string; email: string } {
  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    }) as JwtPayload;
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      throw new Error("Invalid claims");
    }
    return { userId: payload.sub, email: payload.email };
  } catch {
    throw new AppError(
      401,
      "INVALID_TOKEN",
      "La sesión expiró o no es válida.",
    );
  }
}
