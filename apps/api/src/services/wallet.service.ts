import type { SnailPayOperation } from "@caracoles/shared";
import { creditBalance } from "../repositories/user.repository.js";
import { getCurrentUser } from "./auth.service.js";
import { makeOperation } from "./snailpay.service.js";
import { toCents } from "../utils/money.js";
import { AppError } from "../utils/app-error.js";

export async function topUp(
  userId: string,
  input: unknown,
): Promise<{ operation: SnailPayOperation; httpStatus: number }> {
  const { user } = await getCurrentUser(userId);
  const operation = makeOperation(user, input);
  if (operation.status === "error") return { operation, httpStatus: 503 };
  if (operation.status === "rejected") {
    return {
      operation,
      httpStatus: operation.status_detail === "card_declined" ? 402 : 422,
    };
  }

  const cents = toCents(operation.transaction_amount);
  if (cents === null) throw new Error("Monto aprobado inválido.");
  try {
    operation.balance = await creditBalance(userId, cents);
  } catch (error) {
    if (!(error instanceof AppError) || error.code !== "BALANCE_LIMIT")
      throw error;
    operation.status = "rejected";
    operation.status_detail = "balance_limit";
    operation.authorization_code = null;
    return { operation, httpStatus: 422 };
  }
  return { operation, httpStatus: 200 };
}
