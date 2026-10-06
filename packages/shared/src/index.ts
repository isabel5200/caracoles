export type Snail = {
  id: string;
  name: string;
  color: string;
  emoji: string;
};

export type RaceRequest = {
  snailId: string;
  stake: number;
};

export type RaceResult = {
  id: string;
  selectedSnailId: string;
  winnerSnailId: string;
  stake: number;
  payout: number;
  createdAt: string;
};

export type ApiError = {
  error: { code: string; message: string };
};
