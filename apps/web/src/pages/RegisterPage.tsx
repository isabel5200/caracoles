import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
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
      if (cause instanceof ApiRequestError) {
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
      description="Crea tu cuenta con saldo inicial de $0. Después podrás cargar saldo con SnailPay, nuestra pasarela simulada."
    >
      <CardHeader className="px-6 sm:px-9">
        <CardTitle className="font-serif text-3xl font-semibold tracking-tight text-slate-950">
          <h2>Crear cuenta</h2>
        </CardTitle>
        <CardDescription className="mt-1 text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            className="font-semibold text-emerald-800 underline-offset-2 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-emerald-700"
            to="/login"
          >
            Inicia sesión
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 sm:px-9">
        <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
          <Label className="mt-2 mb-2 text-slate-700" htmlFor="full-name">
            Nombre completo
          </Label>
          <Input
            id="full-name"
            autoComplete="name"
            className="h-11 bg-slate-50 px-3"
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
          <Label className="mt-5 mb-2 text-slate-700" htmlFor="register-email">
            Correo electrónico
          </Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            className="h-11 bg-slate-50 px-3"
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
          <Label
            className="mt-5 mb-2 text-slate-700"
            htmlFor="register-password"
          >
            Contraseña
          </Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            className="h-11 bg-slate-50 px-3"
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
          <Label
            className="mt-5 mb-2 text-slate-700"
            htmlFor="password-confirmation"
          >
            Confirmar contraseña
          </Label>
          <Input
            id="password-confirmation"
            type="password"
            autoComplete="new-password"
            className="h-11 bg-slate-50 px-3"
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
          >
            {submitting ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>
      </CardContent>
    </AuthLayout>
  );
}
