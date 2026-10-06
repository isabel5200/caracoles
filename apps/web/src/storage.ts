import type { RaceResult } from "@caracoles/shared";

export type Player = {
  name: string;
  sessionId: string | null;
  balance: number;
  history: RaceResult[];
};

const STORAGE_KEY = "caracoles.player.v1";
export const INITIAL_BALANCE = 1000;

export function loadPlayer(): Player | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const player = value as Partial<Player>;
    if (
      typeof player.name !== "string" ||
      !(typeof player.sessionId === "string" || player.sessionId === null) ||
      typeof player.balance !== "number" ||
      !Number.isSafeInteger(player.balance) ||
      player.balance < 0 ||
      !Array.isArray(player.history)
    )
      return null;
    return player as Player;
  } catch {
    return null;
  }
}

export function savePlayer(player: Player): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  } catch {
    // La app sigue funcionando si el navegador bloquea el almacenamiento.
  }
}
