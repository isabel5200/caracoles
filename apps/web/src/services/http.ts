import type { ApiError } from "@caracoles/shared";
import type { FieldErrors } from "../types/auth.types";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly fields: FieldErrors = {},
    public readonly status?: number,
  ) {
    super(message);
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function httpRequest(
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new ApiRequestError(
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
      throw new ApiRequestError(
        error.error.message,
        error.error.fields ?? {},
        response.status,
      );
    }
    throw new ApiRequestError(
      `El servidor respondió con un error (${response.status}).`,
      {},
      response.status,
    );
  }
  return data;
}
