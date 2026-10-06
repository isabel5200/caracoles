import type {
  SnailPayChargeRequest,
  SnailPayOperation,
} from "@caracoles/shared";
import { ApiRequestError, isRecord } from "./http";
import { isValidBalance } from "../utils/money";

function isOperation(value: unknown): value is SnailPayOperation {
  return (
    isRecord(value) &&
    ["approved", "rejected", "error"].includes(String(value.status)) &&
    typeof value.id === "string" &&
    typeof value.status_detail === "string" &&
    typeof value.transaction_amount === "number" &&
    typeof value.date_created === "string" &&
    (value.authorization_code === null ||
      typeof value.authorization_code === "string") &&
    typeof value.reference === "string" &&
    typeof value.payer_id === "string" &&
    typeof value.payer_email === "string" &&
    typeof value.card_number === "string" &&
    typeof value.cvv === "string" &&
    (value.status !== "approved" || isValidBalance(value.balance))
  );
}

export async function topUp(
  token: string,
  payment: SnailPayChargeRequest,
): Promise<SnailPayOperation> {
  let response: Response;
  try {
    response = await fetch("/api/wallet/top-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payment),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new ApiRequestError(
      "No se pudo contactar a SnailPay. Intenta de nuevo.",
    );
  }
  const data: unknown = await response.json().catch(() => null);
  if (isOperation(data)) return data;
  if (response.status === 404)
    throw new ApiRequestError(
      "La API de SnailPay no está actualizada. Reinicia el backend del proyecto.",
      {},
      404,
    );
  if (response.status === 401)
    throw new ApiRequestError(
      "La sesión venció. Inicia sesión de nuevo.",
      {},
      401,
    );
  throw new ApiRequestError(
    "SnailPay devolvió una respuesta inesperada.",
    {},
    response.status,
  );
}
