import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { AuthRequestError } from "../services/auth.service";
import type { FieldErrors, RegisterInput } from "../types/auth.types";

const emptyForm: RegisterInput = {
  fullName: "",
  email: "",
  password: "",
  passwordConfirmation: "",
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: RegisterInput): FieldErrors {
  const fields: FieldErrors = {};
  const fullName = form.fullName.trim();
  const email = form.email.trim();
  if (!fullName) fields.fullName = "Ingresa tu nombre completo.";
  else if (fullName.length < 2 || fullName.length > 80)
    fields.fullName = "El nombre debe tener entre 2 y 80 caracteres.";
  if (!email) fields.email = "Ingresa tu correo electrónico.";
  else if (!emailPattern.test(email))
    fields.email = "Ingresa un correo electrónico válido.";
  if (!form.password) fields.password = "Ingresa una contraseña.";
  else if (form.password.length < 8)
    fields.password = "La contraseña debe tener al menos 8 caracteres.";
  if (!form.passwordConfirmation)
    fields.passwordConfirmation = "Confirma tu contraseña.";
  else if (form.passwordConfirmation !== form.password)
    fields.passwordConfirmation = "Las contraseñas no coinciden.";
  return fields;
}

export function RegisterPage() {
  const { isAuthenticated, isInitializing, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterInput>(emptyForm);
  const [fields, setFields] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isInitializing)
    return <div className="page-loading">Verificando sesión…</div>;
  if (isAuthenticated) return <Navigate to="/" replace />;

  function update(field: keyof RegisterInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFields((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validate(form);
    setFields(validation);
    if (Object.keys(validation).length > 0) {
      setError("Revisa los campos del formulario.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await register(form);
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (cause) {
      if (cause instanceof AuthRequestError) {
        setFields(cause.fields);
        setError(cause.message);
      } else {
        setError(
          cause instanceof Error
            ? cause.message
            : "No se pudo crear la cuenta.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="TU NUEVA CUENTA"
      title="Todo empieza lento."
      description="Crea tu cuenta y recibe 1000 créditos de demostración para usar más adelante."
    >
      <h2>Crear cuenta</h2>
      <p className="card-subtitle">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="full-name">Nombre completo</label>
        <input
          id="full-name"
          autoComplete="name"
          value={form.fullName}
          onChange={(event) => update("fullName", event.target.value)}
          aria-invalid={Boolean(fields.fullName)}
          aria-describedby={fields.fullName ? "full-name-error" : undefined}
        />
        {fields.fullName && (
          <small id="full-name-error" className="field-error">
            {fields.fullName}
          </small>
        )}
        <label htmlFor="register-email">Correo electrónico</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          aria-invalid={Boolean(fields.email)}
          aria-describedby={fields.email ? "register-email-error" : undefined}
        />
        {fields.email && (
          <small id="register-email-error" className="field-error">
            {fields.email}
          </small>
        )}
        <label htmlFor="register-password">Contraseña</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          aria-invalid={Boolean(fields.password)}
          aria-describedby={
            fields.password ? "register-password-error" : undefined
          }
        />
        {fields.password && (
          <small id="register-password-error" className="field-error">
            {fields.password}
          </small>
        )}
        <label htmlFor="password-confirmation">Confirmar contraseña</label>
        <input
          id="password-confirmation"
          type="password"
          autoComplete="new-password"
          value={form.passwordConfirmation}
          onChange={(event) =>
            update("passwordConfirmation", event.target.value)
          }
          aria-invalid={Boolean(fields.passwordConfirmation)}
          aria-describedby={
            fields.passwordConfirmation
              ? "password-confirmation-error"
              : undefined
          }
        />
        {fields.passwordConfirmation && (
          <small id="password-confirmation-error" className="field-error">
            {fields.passwordConfirmation}
          </small>
        )}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Creando cuenta…" : "Crear cuenta"}
          <span aria-hidden="true">↗</span>
        </button>
      </form>
    </AuthLayout>
  );
}
