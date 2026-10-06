import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { AuthRequestError } from "../services/auth.service";
import type { LoginInput } from "../types/auth.types";

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await login(form);
      navigate("/", { replace: true });
    } catch (cause) {
      setError(
        cause instanceof AuthRequestError || cause instanceof Error
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
      <h2>Iniciar sesión</h2>
      <p className="card-subtitle">
        ¿Aún no tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
      {registered && (
        <div className="success-message" role="status">
          Cuenta creada. Ya puedes iniciar sesión.
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="login-email">Correo electrónico</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(event) =>
            setForm({ ...form, password: event.target.value })
          }
        />
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Entrando…" : "Iniciar sesión"}
          <span aria-hidden="true">↗</span>
        </button>
      </form>
    </AuthLayout>
  );
}
