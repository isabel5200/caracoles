import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, it } from "node:test";
import { findUserByEmail } from "../src/repositories/user.repository.js";
import { login, register } from "../src/services/auth.service.js";
import { AppError } from "../src/utils/app-error.js";
import { readToken } from "../src/utils/jwt.js";

const validUser = {
  fullName: "Isa Lovera",
  email: "isa@example.com",
  password: "Password123!",
  passwordConfirmation: "Password123!",
};

let usersFile: string;

beforeEach(() => {
  usersFile = join(tmpdir(), `snailbet-test-${randomUUID()}.json`);
  process.env.USERS_FILE = usersFile;
  process.env.JWT_SECRET = "test-secret-for-auth-tests-1234567890";
});

afterEach(async () => {
  await rm(usersFile, { force: true });
  delete process.env.USERS_FILE;
  delete process.env.JWT_SECRET;
});

it("should register a new user successfully", async () => {
  const user = await register(validUser);

  assert.ok(user.id);
  assert.equal(user.email, validUser.email);
  assert.equal((await findUserByEmail(validUser.email))?.id, user.id);
  assert.equal("password" in user, false);
  assert.equal("passwordHash" in user, false);
});

it("should reject an already registered email", async () => {
  await register(validUser);

  await assert.rejects(
    register({ ...validUser, fullName: "Otra Persona" }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.status, 409);
      assert.equal(error.code, "EMAIL_TAKEN");
      return true;
    },
  );
});

it("should login with valid credentials", async () => {
  const user = await register(validUser);

  const session = await login({
    email: validUser.email,
    password: validUser.password,
  });

  assert.deepEqual(session.user, user);
  assert.equal(session.balance, 0);
  assert.ok(session.token);
  assert.deepEqual(readToken(session.token), {
    userId: user.id,
    email: user.email,
  });
});
