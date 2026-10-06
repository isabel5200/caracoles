import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { LoadingSpiral } from "../components/LoadingSpiral";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../hooks/useAuth";
import { ApiRequestError } from "../services/http";
import type { LoginInput } from "../types/auth.types";
import { waitForLoadingCue } from "../utils/loading";

export function LoginPage() {
  const { isAuthenticated, isInitializing, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const registered =
    typeof location.state === "object" &&
    location.state !== null &&
    "registered" in location.state &&
    location.state.registered === true;
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isInitializing)
    return <div className="page-loading">Verificando sesión…</div>;
  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await waitForLoadingCue();
      await login(form);

      navigate("/", { replace: true });
    } catch (cause) {
      setError(
        cause instanceof ApiRequestError || cause instanceof Error
          ? cause.message
          : "No se pudo iniciar sesión.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="BIENVENIDO DE NUEVO"
      title="Entra a la pista."
      description="Inicia sesión para continuar con tu perfil y tu saldo de créditos."
    >
      <CardHeader className="px-6 sm:px-9">
        <CardTitle className="font-serif text-3xl font-semibold tracking-tight text-slate-950">
          <h2>Iniciar sesión</h2>
        </CardTitle>

        <CardDescription className="mt-1 text-slate-600">
          ¿Aún no tienes cuenta?{" "}
          <Link
            className="font-semibold text-emerald-800 underline-offset-2 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-emerald-700"
            to="/register"
          >
            Regístrate aquí
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 sm:px-9">
        {registered && (
          <Alert
            role="status"
            className="mb-5 border-emerald-200 bg-emerald-50 text-emerald-900"
          >
            <AlertDescription className="text-emerald-900">
              Cuenta creada. Ya puedes iniciar sesión.
            </AlertDescription>
          </Alert>
        )}

        <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
          <Label className="mt-2 mb-2 text-slate-700" htmlFor="login-email">
            Correo electrónico
          </Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            className="h-11 bg-slate-50 px-3"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />

          <Label className="mt-5 mb-2 text-slate-700" htmlFor="login-password">
            Contraseña
          </Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className="h-11 bg-slate-50 px-3"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
          />
          {error && (
            <Alert
              variant="destructive"
              className="mt-5 border-red-200 bg-red-50"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            className="mt-6 h-11 w-full bg-emerald-800 text-white hover:bg-emerald-700"
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting && <LoadingSpiral />}
            {submitting ? "Iniciando sesión…" : "Iniciar sesión"}
          </Button>
        </form>
      </CardContent>
    </AuthLayout>
  );
}
