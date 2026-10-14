export function parseOptionalNumber(value: string) {
  let normalizedValue = value.trim();
  if (!normalizedValue) return undefined;
  if (normalizedValue.includes(',')) {
    if (!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+),\d+$/.test(normalizedValue)) return undefined;
    normalizedValue = normalizedValue.replace(/\./g, '').replace(',', '.');
  } else if (/^-?\d{1,3}(?:\.\d{3})+$/.test(normalizedValue)) {
    normalizedValue = normalizedValue.replace(/\./g, '');
  }
  if (!/^-?\d+(?:\.\d+)?$/.test(normalizedValue)) return undefined;
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}
