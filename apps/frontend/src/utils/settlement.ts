export function extractSettlementId(value: unknown): string {
  if (!value || typeof value !== "object") return "";

  const data = value as Record<string, unknown>;
  if (typeof data.id === "string") return data.id;
  if (typeof data.settlementId === "string") return data.settlementId;

  if (data.settlement && typeof data.settlement === "object") {
    return extractSettlementId(data.settlement);
  }

  return "";
}
