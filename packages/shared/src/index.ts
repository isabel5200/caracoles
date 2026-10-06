export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
  balance: number;
  lastPayment?: SnailPayOperation;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type CurrentUserResponse = {
  user: AuthUser;
  balance: number;
};

export type SnailPayChargeRequest = {
  card_number: string;
  expiration_date: string;
  cvv: string;
  full_name: string;
  transaction_amount: number;
};

export type SnailPayStatusDetail =
  | "accredited"
  | "card_declined"
  | "invalid_payment_data"
  | "unsupported_test_card"
  | "balance_limit"
  | "gateway_unavailable";

export type SnailPayOperation = {
  id: string;
  status: "approved" | "rejected" | "error";
  status_detail: SnailPayStatusDetail;
  transaction_amount: number;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string;
  payer_email: string;
  card_number: string;
  cvv: string;
  balance?: number;
};

export type ApiError = {
  error: { code: string; message: string; fields?: Record<string, string> };
};
