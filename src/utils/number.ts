export function parseOptionalNumber(value: string) {
  const normalizedValue = value.replace(',', '.').trim();
  if (!normalizedValue) return undefined;
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}
