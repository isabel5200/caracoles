export function isValidBalance(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    Number.isSafeInteger(Math.round(value * 100)) &&
    Math.abs(Math.round(value * 100) / 100 - value) < 1e-9
  );
}
