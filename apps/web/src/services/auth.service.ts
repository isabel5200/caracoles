import type { ApiError } from "@caracoles/shared";
import type {
  AuthSession,
  AuthUser,
  CurrentUserResponse,
  FieldErrors,
  LoginInput,
  RegisterInput,
} from "../types/auth.types";

export class AuthRequestError extends Error {
  constructor(
    message: string,
    public readonly fields: FieldErrors = {},
    public readonly status?: number,
  ) {
    super(message);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUser(value: unknown): value is AuthUser {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.fullName === "string" &&
    typeof value.email === "string"
  );
}

async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new AuthRequestError(
      "No se pudo conectar con el servidor. Intenta de nuevo.",
    );
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (
      isRecord(data) &&
      isRecord(data.error) &&
      typeof data.error.message === "string"
    ) {
      const error = data as ApiError;
      throw new AuthRequestError(
        error.error.message,
        error.error.fields ?? {},
        response.status,
      );
    }
    throw new AuthRequestError(
      `El servidor respondió con un error (${response.status}).`,
      {},
      response.status,
    );
  }
  return data;
}

export async function register(data: RegisterInput): Promise<AuthUser> {
  const result = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!isRecord(result) || !isUser(result.user))
    throw new AuthRequestError(
      "El servidor devolvió una respuesta inesperada.",
    );
  return result.user;
}

export async function login(credentials: LoginInput): Promise<AuthSession> {
  const result = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (
    !isRecord(result) ||
    !isUser(result.user) ||
    typeof result.token !== "string" ||
    typeof result.balance !== "number" ||
    !Number.isSafeInteger(result.balance) ||
    result.balance < 0
  ) {
    throw new AuthRequestError(
      "El servidor devolvió una respuesta inesperada.",
    );
  }
  return result as AuthSession;
}

export async function getCurrentUser(
  token: string,
): Promise<CurrentUserResponse> {
  const result = await request("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (
    !isRecord(result) ||
    !isUser(result.user) ||
    typeof result.balance !== "number" ||
    !Number.isSafeInteger(result.balance) ||
    result.balance < 0
  ) {
    throw new AuthRequestError(
      "El servidor devolvió una respuesta inesperada.",
    );
  }
  return result as CurrentUserResponse;
}
