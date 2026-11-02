import { createHash } from "node:crypto";

type DeliveryOrder = { number: string; topic: string; name: string; phone: string; sheets: string; comment: string; urgent: boolean; total: number; requestId: string };
type Receipt = { number: string; createdAt: string; topic: string; sheets: number; urgent: boolean; total: number; status: "sent"; demo: false };
export class DeliveryError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

export function telegramConfig(tokenValue?: string, chatsValue?: string) {
  const token = tokenValue?.trim();
  const chats = [...new Set((chatsValue ?? "").split(/[,\s]+/).filter(Boolean))];
  if (!token || !/^\d+:[A-Za-z0-9_-]+$/.test(token) || !chats.length || chats.length > 10 || chats.some(id => !/^-?\d+$/.test(id))) {
    throw new DeliveryError("Приём заявок пока не настроен. Попробуйте позже или свяжитесь с нами напрямую.", 503);
  }
  return { token, chats };
}

export function telegramMessage(order: DeliveryOrder) {
  return [
    `Новая заявка pisaka · №${order.number}`,
    `Тема: ${order.topic}`,
    `Имя: ${order.name}`,
    `WhatsApp: ${order.phone}`,
    `https://wa.me/${order.phone.replace(/\D/g, "")}`,
    `Листов А4: ${order.sheets}`,
    `Режим: ${order.urgent ? "Срочный ×2" : "Обычный"}`,
    `Сумма: ${new Intl.NumberFormat("ru-RU").format(order.total)} сом`,
    `Комментарий: ${order.comment || "—"}`,
    "",
    "Клиент нажал «Я оплатил(а)». Перевод необходимо проверить вручную.",
  ].join("\n");
}

// Best-effort protection within a warm server instance, not a persistent database.
export function createTelegramDelivery(fetcher: typeof fetch = fetch) {
  const entries = new Map<string, { fingerprint: string; expires: number; delivered: Set<string>; receipt: Receipt; pending?: Promise<Receipt> }>();
  return async (order: DeliveryOrder, config: { token: string; chats: string[] }): Promise<Receipt> => {
    const now = Date.now();
    for (const [key, value] of entries) if (value.expires < now && !value.pending) entries.delete(key);
    const fingerprint = createHash("sha256").update(JSON.stringify(order)).digest("hex");
    let entry = entries.get(order.requestId);
    if (entry && entry.fingerprint !== fingerprint) throw new DeliveryError("Заявка изменилась. Вернитесь к форме и повторите отправку.", 409);
    if (!entry) {
      if (entries.size >= 1000) throw new DeliveryError("Сервис занят. Попробуйте немного позже.", 503);
      entry = { fingerprint, expires: now + 3600000, delivered: new Set(), receipt: { number: order.number, createdAt: new Date(now).toISOString(), topic: order.topic, sheets: Number(order.sheets), urgent: order.urgent, total: order.total, status: "sent", demo: false } };
      entries.set(order.requestId, entry);
    }
    if (entry.pending) return entry.pending;
    const current = entry;
    current.pending = (async () => {
      const missing = config.chats.filter(chat => !current.delivered.has(chat));
      const results = await Promise.allSettled(missing.map(async chat => {
        const response = await fetcher(`https://api.telegram.org/bot${config.token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chat, text: telegramMessage(order), link_preview_options: { is_disabled: true } }),
          signal: AbortSignal.timeout(12000),
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || result?.ok !== true) throw new Error("Telegram delivery failed");
        current.delivered.add(chat);
      }));
      if (results.some(result => result.status === "rejected")) throw new DeliveryError("Не удалось завершить отправку заявки. Повторите попытку — номер заказа сохранён.", 502);
      return current.receipt;
    })();
    try { return await current.pending; }
    finally { current.pending = undefined; }
  };
}
