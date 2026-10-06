import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StoredUser } from "../types/auth.types.js";
import { AppError } from "../utils/app-error.js";

const defaultUsersPath = fileURLToPath(
  new URL("../../data/users.json", import.meta.url),
);
const usersPath = () =>
  process.env.USERS_FILE ? resolve(process.env.USERS_FILE) : defaultUsersPath;
let pendingWrite: Promise<void> = Promise.resolve();

function enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = pendingWrite.then(operation);
  pendingWrite = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function readUsers(): Promise<StoredUser[]> {
  let contents: string;
  try {
    contents = await readFile(usersPath(), "utf8");
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    )
      return [];
    throw error;
  }
  const users: unknown = JSON.parse(contents);
  if (!Array.isArray(users))
    throw new Error("El archivo de usuarios no es válido.");
  return users as StoredUser[];
}

export async function findUserByEmail(
  email: string,
): Promise<StoredUser | undefined> {
  return (await readUsers()).find((user) => user.email === email);
}

export async function findUserById(
  id: string,
): Promise<StoredUser | undefined> {
  return (await readUsers()).find((user) => user.id === id);
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  const destination = usersPath();
  await mkdir(dirname(destination), { recursive: true });
  const temporaryPath = join(dirname(destination), `users-${randomUUID()}.tmp`);
  await writeFile(temporaryPath, JSON.stringify(users, null, 2), {
    flag: "wx",
  });
  try {
    await rename(temporaryPath, destination);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

export function createUser(user: StoredUser): Promise<void> {
  return enqueueWrite(async () => {
    const users = await readUsers();
    if (users.some((existing) => existing.email === user.email)) {
      throw new AppError(
        409,
        "EMAIL_TAKEN",
        "Este correo ya está registrado.",
        {
          email: "Este correo ya está registrado.",
        },
      );
    }
    await writeUsers([...users, user]);
  });
}

export function creditBalance(
  userId: string,
  amountCents: number,
): Promise<number> {
  return enqueueWrite(async () => {
    const users = await readUsers();
    const user = users.find((candidate) => candidate.id === userId);
    if (!user)
      throw new AppError(401, "INVALID_TOKEN", "La sesión ya no es válida.");
    const nextCents = Math.round(user.balance * 100) + amountCents;
    if (!Number.isSafeInteger(nextCents)) {
      throw new AppError(
        400,
        "BALANCE_LIMIT",
        "El saldo excede el límite permitido.",
      );
    }
    user.balance = nextCents / 100;
    await writeUsers(users);
    return user.balance;
  });
}
