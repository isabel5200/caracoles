import type { AuthUser } from "@caracoles/shared";

export type StoredUser = AuthUser & {
  passwordHash: string;
  balance: number;
};

declare global {
  namespace Express {
    interface Request {
      authClaims?: { userId: string; email: string };
    }
  }
}
