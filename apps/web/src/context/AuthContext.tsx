import { createContext, useEffect, useState, type ReactNode } from "react";
import * as authService from "../services/auth.service";
import type {
  AuthSession,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "../types/auth.types";
import { clearSession, loadSession, saveSession } from "../utils/storage";

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  balance: number | null;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(loadSession);
  const [isInitializing, setIsInitializing] = useState(Boolean(session));

  useEffect(() => {
    const stored = loadSession();
    if (!stored) {
      setIsInitializing(false);
      return;
    }
    let active = true;
    authService
      .getCurrentUser(stored.token)
      .then(({ user, balance }) => {
        if (!active) return;
        const refreshed = { ...stored, user, balance };
        saveSession(refreshed);
        setSession(refreshed);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (
          cause instanceof authService.AuthRequestError &&
          cause.status === 401
        ) {
          clearSession();
          setSession(null);
        }
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function login(credentials: LoginInput) {
    const nextSession = await authService.login(credentials);
    saveSession(nextSession);
    setSession(nextSession);
  }

  async function register(data: RegisterInput) {
    await authService.register(data);
  }

  function logout() {
    clearSession();
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        isAuthenticated: Boolean(session),
        isInitializing,
        balance: session?.balance ?? null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
