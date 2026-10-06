import { randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs";
import type {
  AuthSession,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@caracoles/shared";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../repositories/user.repository.js";
import type { StoredUser } from "../types/auth.types.js";
import { AppError } from "../utils/app-error.js";
import { createToken } from "../utils/jwt.js";

const INITIAL_BALANCE = 0;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user: StoredUser): AuthUser {
  return { id: user.id, fullName: user.fullName, email: user.email };
}

export async function register(
  input: Partial<RegisterInput> | undefined,
): Promise<AuthUser> {
  const fullName =
    typeof input?.fullName === "string" ? input.fullName.trim() : "";
  const email =
    typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input?.password === "string" ? input.password : "";
  const confirmation =
    typeof input?.passwordConfirmation === "string"
      ? input.passwordConfirmation
      : "";
  const fields: Record<string, string> = {};

  if (!fullName) fields.fullName = "Ingresa tu nombre completo.";
  else if (fullName.length < 2 || fullName.length > 80)
    fields.fullName = "El nombre debe tener entre 2 y 80 caracteres.";
  if (!email) fields.email = "Ingresa tu correo electrónico.";
  else if (email.length > 254 || !emailPattern.test(email))
    fields.email = "Ingresa un correo electrónico válido.";
  if (!password) fields.password = "Ingresa una contraseña.";
  else if (password.length < 8)
    fields.password = "La contraseña debe tener al menos 8 caracteres.";
  else if (Buffer.byteLength(password, "utf8") > 72)
    fields.password = "La contraseña es demasiado larga (máximo 72 bytes).";
  if (!confirmation) fields.passwordConfirmation = "Confirma tu contraseña.";
  else if (confirmation !== password)
    fields.passwordConfirmation = "Las contraseñas no coinciden.";
  if (Object.keys(fields).length > 0) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Revisa los campos del formulario.",
      fields,
    );
  }

  const user: StoredUser = {
    id: randomUUID(),
    fullName,
    email,
    passwordHash: await hash(password, 12),
    balance: INITIAL_BALANCE,
  };
  await createUser(user);
  return publicUser(user);
}

export async function login(
  input: Partial<LoginInput> | undefined,
): Promise<AuthSession> {
  const email =
    typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input?.password === "string" ? input.password : "";
  if (!email || !password) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Ingresa tu correo y contraseña.",
    );
  }
  const user = await findUserByEmail(email);
  if (!user || !(await compare(password, user.passwordHash))) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Correo o contraseña incorrectos.",
    );
  }
  return {
    user: publicUser(user),
    token: createToken(user.id, user.email),
    balance: user.balance,
  };
}

export async function getCurrentUser(
  id: string,
): Promise<{ user: AuthUser; balance: number }> {
  const user = await findUserById(id);
  if (!user)
    throw new AppError(401, "INVALID_TOKEN", "La sesión ya no es válida.");
  return { user: publicUser(user), balance: user.balance };
}
