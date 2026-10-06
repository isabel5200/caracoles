import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing)
    return <div className="page-loading">Verificando sesión…</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
