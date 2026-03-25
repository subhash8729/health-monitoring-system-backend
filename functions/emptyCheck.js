export function isAnyEmpty(...vals) {
  return vals.some(v => v === undefined || v === null || v === "");
}
