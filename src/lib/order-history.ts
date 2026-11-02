export const ORDER_HISTORY_KEY = "pisaka.orders.v1";
export type SavedOrder = {
  number: string;
  createdAt: string;
  topic: string;
  sheets: number;
  urgent: boolean;
  total: number;
  status: "sent";
  demo: boolean;
};
type HistoryStorage = Pick<Storage, "getItem" | "setItem">;

export function readOrders(storage: HistoryStorage): SavedOrder[] {
  const raw = storage.getItem(ORDER_HISTORY_KEY);
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("Invalid order history");
  return data.map(value => {
    if (!value || typeof value !== "object" || typeof value.number !== "string" || !/^\d{8}$/.test(value.number) || typeof value.createdAt !== "string" || !Number.isFinite(Date.parse(value.createdAt)) || typeof value.topic !== "string" || value.topic.length > 300 || !Number.isInteger(value.sheets) || value.sheets < 1 || value.sheets > 100 || typeof value.urgent !== "boolean" || typeof value.total !== "number" || !Number.isFinite(value.total) || value.total <= 0 || value.status !== "sent" || typeof value.demo !== "boolean") throw new Error("Invalid order history");
    // Only keep the fields needed for the history, never contact details.
    return { number: value.number, createdAt: value.createdAt, topic: value.topic, sheets: value.sheets, urgent: value.urgent, total: value.total, status: "sent", demo: value.demo };
  });
}

export function saveOrder(storage: HistoryStorage, order: SavedOrder): void {
  const orders = readOrders(storage);
  if (orders.some(existing => existing.number === order.number)) return;
  storage.setItem(ORDER_HISTORY_KEY, JSON.stringify([order, ...orders]));
}
