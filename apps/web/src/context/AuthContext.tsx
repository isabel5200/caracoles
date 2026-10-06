import { createContext, useEffect, useState, type ReactNode } from "react";
import * as authService from "../services/auth.service";
import * as walletService from "../services/wallet.service";
import { ApiRequestError } from "../services/http";
import type {
  SnailPayChargeRequest,
  SnailPayOperation,
} from "@caracoles/shared";
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
  topUp: (payment: SnailPayChargeRequest) => Promise<SnailPayOperation>;
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

        if (cause instanceof ApiRequestError && cause.status === 401) {
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

  async function topUp(
    payment: SnailPayChargeRequest,
  ): Promise<SnailPayOperation> {
    if (!session) throw new ApiRequestError("Inicia sesión para cargar saldo.");

    let result: SnailPayOperation;

    try {
      result = await walletService.topUp(session.token, payment);
    } catch (cause) {
      if (
        cause instanceof ApiRequestError &&
        cause.status === 401 &&
        loadSession()?.token === session.token
      ) {
        logout();
      }
      throw cause;
    }

    const stored = loadSession();

    if (!stored || stored.token !== session.token) {
      throw new ApiRequestError("La sesión cambió. Inicia sesión de nuevo.");
    }

    const nextSession = {
      ...stored,
      lastPayment: result,
      balance: result.status === "approved" ? result.balance! : stored.balance,
    };
    saveSession(nextSession);
    setSession(nextSession);
    return result;
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
        topUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
