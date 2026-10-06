export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
  balance: number;
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

export type ApiError = {
  error: { code: string; message: string; fields?: Record<string, string> };
};
