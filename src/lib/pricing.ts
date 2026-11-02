export type Tariff = { pricePerSheet: number; rushMultiplier: number };
export function calcPrice(sheets: number, urgent: boolean, tariff: Tariff): number {
  if (!Number.isSafeInteger(sheets) || sheets < 1 || !Number.isFinite(tariff.pricePerSheet) || tariff.pricePerSheet <= 0 || !Number.isFinite(tariff.rushMultiplier) || tariff.rushMultiplier < 1) throw new RangeError("Некорректное количество листов или тариф");
  const total = sheets * tariff.pricePerSheet * (urgent ? tariff.rushMultiplier : 1);
  if (!Number.isFinite(total)) throw new RangeError("Слишком большая сумма");
  return total;
}
export const formatSom = (amount: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(amount) + " сом";
export function sheetWord(count: number): string {
  if (count % 100 >= 11 && count % 100 <= 14) return "листов";
  return count % 10 === 1 ? "лист" : count % 10 >= 2 && count % 10 <= 4 ? "листа" : "листов";
}
