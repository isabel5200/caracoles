export function toCents(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0)
    return null;

  const cents = Math.round(value * 100);

  if (cents <= 0 || !Number.isSafeInteger(cents) || Math.abs(cents / 100 - value) > 1e-9)
    return null;

  return cents;
}
