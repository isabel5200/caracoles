import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/login": "Iniciar sesión",
  "/register": "Registro",
};

function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = `Pista lenta | ${pageTitles[pathname] ?? "Dashboard"}`;
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <PageTitle />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
