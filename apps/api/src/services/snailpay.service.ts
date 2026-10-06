import { randomUUID } from "node:crypto";
import type {
  AuthUser,
  SnailPayChargeRequest,
  SnailPayOperation,
  SnailPayStatusDetail,
} from "@caracoles/shared";
import { toCents } from "../utils/money.js";

const APPROVED_CARD = "1234123412341234";
const DECLINED_CARD = "0000000000000000";
const TEST_EXPIRATION = "12/26";
const TEST_CVV = "543";
const DECLINED_CVV = "000";

export function makeOperation(
  payer: AuthUser,
  input: unknown,
): SnailPayOperation {
  const data =
    typeof input === "object" && input !== null
      ? (input as Partial<SnailPayChargeRequest>)
      : {};
  // Solo se devuelven valores de prueba conocidos; jamás se refleja una tarjeta real.
  const card_number =
    data.card_number === APPROVED_CARD || data.card_number === DECLINED_CARD
      ? data.card_number
      : DECLINED_CARD;
  const cvv =
    data.cvv === TEST_CVV || data.cvv === DECLINED_CVV
      ? data.cvv
      : DECLINED_CVV;
  const amountCents = toCents(data.transaction_amount);
  const id = randomUUID();
  const operation: SnailPayOperation = {
    id,
    status: "rejected",
    status_detail: "invalid_payment_data",
    transaction_amount:
      typeof data.transaction_amount === "number" &&
      Number.isFinite(data.transaction_amount)
        ? data.transaction_amount
        : 0,
    date_created: new Date().toISOString(),
    authorization_code: null,
    reference: `SNP-${id.slice(0, 8).toUpperCase()}`,
    payer_id: payer.id,
    payer_email: payer.email,
    card_number,
    cvv,
  };

  let detail: SnailPayStatusDetail;
  if (process.env.SNAILPAY_MODE === "system_error") {
    operation.status = "error";
    detail = "gateway_unavailable";
  } else if (
    amountCents === null ||
    typeof data.full_name !== "string" ||
    !data.full_name.trim() ||
    data.expiration_date !== TEST_EXPIRATION ||
    typeof data.card_number !== "string" ||
    !/^\d{16}$/.test(data.card_number) ||
    typeof data.cvv !== "string" ||
    !/^\d{3}$/.test(data.cvv)
  ) {
    detail = "invalid_payment_data";
  } else if (data.card_number === DECLINED_CARD && data.cvv === DECLINED_CVV) {
    detail = "card_declined";
  } else if (data.card_number === APPROVED_CARD && data.cvv === TEST_CVV) {
    operation.status = "approved";
    detail = "accredited";
    operation.authorization_code = randomUUID().slice(0, 8).toUpperCase();
  } else {
    detail = "unsupported_test_card";
  }
  operation.status_detail = detail;
  return operation;
}
