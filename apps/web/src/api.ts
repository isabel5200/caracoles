import type { RaceRequest, RaceResult, Snail } from "@caracoles/shared";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor. Revisa que la API esté encendida.",
    );
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      isRecord(data) &&
      isRecord(data.error) &&
      typeof data.error.message === "string"
        ? data.error.message
        : `El servidor respondió con un error (${response.status}).`;
    throw new Error(message);
  }
  return data;
}

export async function getSnails(): Promise<Snail[]> {
  const data = await request("/api/snails");
  if (
    !Array.isArray(data) ||
    data.length === 0 ||
    !data.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.color === "string" &&
        typeof item.emoji === "string",
    )
  ) {
    throw new Error("La lista de caracoles tiene un formato inesperado.");
  }
  return data as Snail[];
}

export async function runRace(input: RaceRequest): Promise<RaceResult> {
  const data = await request("/api/races", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (
    !isRecord(data) ||
    typeof data.id !== "string" ||
    data.selectedSnailId !== input.snailId ||
    typeof data.winnerSnailId !== "string" ||
    data.stake !== input.stake ||
    typeof data.payout !== "number" ||
    !Number.isSafeInteger(data.payout) ||
    data.payout < 0 ||
    typeof data.createdAt !== "string"
  ) {
    throw new Error(
      "La carrera devolvió una respuesta inesperada. No se descontó tu apuesta.",
    );
  }
  return data as RaceResult;
}
