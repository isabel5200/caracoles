import type {
  AuthSession,
  AuthUser,
  CurrentUserResponse,
  LoginInput,
  RegisterInput,
} from "../types/auth.types";
import { ApiRequestError, httpRequest, isRecord } from "./http";
import { isValidBalance } from "../utils/money";

function isUser(value: unknown): value is AuthUser {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.fullName === "string" &&
    typeof value.email === "string"
  );
}

export async function register(data: RegisterInput): Promise<AuthUser> {
  const result = await httpRequest("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!isRecord(result) || !isUser(result.user))
    throw new ApiRequestError("El servidor devolvió una respuesta inesperada.");
  return result.user;
}

export async function login(credentials: LoginInput): Promise<AuthSession> {
  const result = await httpRequest("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (
    !isRecord(result) ||
    !isUser(result.user) ||
    typeof result.token !== "string" ||
    !isValidBalance(result.balance)
  ) {
    throw new ApiRequestError("El servidor devolvió una respuesta inesperada.");
  }
  return result as AuthSession;
}

export async function getCurrentUser(
  token: string,
): Promise<CurrentUserResponse> {
  const result = await httpRequest("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (
    !isRecord(result) ||
    !isUser(result.user) ||
    !isValidBalance(result.balance)
  ) {
    throw new ApiRequestError("El servidor devolvió una respuesta inesperada.");
  }
  return result as CurrentUserResponse;
}
