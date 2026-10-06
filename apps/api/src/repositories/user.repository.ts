import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { StoredUser } from "../types/auth.types.js";
import { AppError } from "../utils/app-error.js";

const usersPath = fileURLToPath(
  new URL("../../data/users.json", import.meta.url),
);
let pendingWrite: Promise<void> = Promise.resolve();

async function readUsers(): Promise<StoredUser[]> {
  let contents: string;
  try {
    contents = await readFile(usersPath, "utf8");
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

export function createUser(user: StoredUser): Promise<void> {
  const operation = pendingWrite.then(async () => {
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
    await mkdir(dirname(usersPath), { recursive: true });
    const temporaryPath = join(dirname(usersPath), `users-${randomUUID()}.tmp`);
    await writeFile(temporaryPath, JSON.stringify([...users, user], null, 2), {
      flag: "wx",
    });
    try {
      await rename(temporaryPath, usersPath);
    } catch (error) {
      await rm(temporaryPath, { force: true });
      throw error;
    }
  });
  pendingWrite = operation.catch(() => undefined);
  return operation;
}
