export function formatCurrency(value: number): string {
  if (!isFinite(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });
}

export function formatArea(value: number): string {
  if (!isFinite(value)) return "0,00 m²";
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} m²`;
}

export function formatPercent(value: number, digits = 1): string {
  if (!isFinite(value)) return "0%";
  return `${(value * 100).toLocaleString("pt-BR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })}%`;
}

export function formatNumber(value: number, digits = 2): string {
  if (!isFinite(value)) return "0";
  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export function parseLocaleNumber(input: string): number {
  if (!input) return 0;
  const cleaned = input
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const n = parseFloat(cleaned);
  return isFinite(n) ? n : 0;
}
