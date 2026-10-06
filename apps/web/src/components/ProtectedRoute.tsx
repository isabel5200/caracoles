import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router";
import { DashboardLoading } from "./DashboardLoading";
import { useAuth } from "../hooks/useAuth";
import { waitForLoadingCue } from "../utils/loading";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const [isDashboardReady, setIsDashboardReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isInitializing) return;
    let active = true;
    void waitForLoadingCue().then(() => {
      if (active) setIsDashboardReady(true);
    });
    return () => {
      active = false;
    };
  }, [isAuthenticated, isInitializing]);

  if (isInitializing || (isAuthenticated && !isDashboardReady)) {
    return <DashboardLoading />;
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
