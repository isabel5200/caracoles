import type { AuthSession } from "../types/auth.types";

const SESSION_KEY = "snailBetSession";

export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const session = value as Partial<AuthSession>;
    if (
      typeof session.token !== "string" ||
      typeof session.balance !== "number" ||
      !Number.isSafeInteger(session.balance) ||
      session.balance < 0 ||
      typeof session.user !== "object" ||
      session.user === null ||
      typeof session.user.id !== "string" ||
      typeof session.user.fullName !== "string" ||
      typeof session.user.email !== "string"
    )
      return null;
    return session as AuthSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    throw new Error("No se pudo guardar la sesión en este navegador.");
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // El estado de React se limpia aunque el navegador bloquee LocalStorage.
  }
}
