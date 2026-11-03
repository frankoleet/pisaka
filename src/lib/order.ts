export function formatWhatsApp(value: string): string {
  return "+996 " + editWhatsAppNumber(value, value.length).value;
}

export function editWhatsAppNumber(raw: string, cursor: number) {
  let digits = raw.replace(/\D/g, "");
  let before = raw.slice(0, cursor).replace(/\D/g, "").length;
  // A national number may itself start with 996. Strip the country code
  // only from an explicit international number or a full 12-digit paste.
  if (digits.startsWith("996") && (raw.trimStart().startsWith("+") || digits.length >= 12)) {
    digits = digits.slice(3);
    before = Math.max(0, before - 3);
  }
  digits = digits.slice(0, 9);
  const value = digits.match(/.{1,3}/g)?.join(" ") ?? "";
  const target = Math.min(before, digits.length);
  let caret = 0;
  let seen = 0;
  while (caret < value.length && seen < target) {
    if (/\d/.test(value[caret])) seen++;
    caret++;
  }
  return { value, caret };
}

export const ORDER_LIMITS = { topic: 300, name: 20, comment: 200 } as const;
export type OrderFields = { topic: string; name: string; phone: string; sheets: string; comment: string };
export type OrderErrors = Partial<Record<"topic" | "name" | "phone" | "sheets", string>>;

export function validateOrder(values: OrderFields, min: number, max: number): OrderErrors {
  const errors: OrderErrors = {};
  if (!values.topic.trim()) errors.topic = "Укажите тему или предмет.";
  else if (values.topic.length > ORDER_LIMITS.topic) errors.topic = `Тема должна быть не длиннее ${ORDER_LIMITS.topic} символов.`;
  if (!values.name.trim()) errors.name = "Укажите ваше имя.";
  else if (values.name.length > ORDER_LIMITS.name) errors.name = `Имя должно быть не длиннее ${ORDER_LIMITS.name} символов.`;
  if (!/^\+996 \d{3} \d{3} \d{3}$/.test(values.phone)) errors.phone = "Введите номер WhatsApp: +996 XXX XXX XXX.";
  const count = Number(values.sheets);
  if (!values.sheets.trim() || !Number.isInteger(count) || count < min || count > max) errors.sheets = `Укажите целое число от ${min} до ${max}.`;
  return errors;
}

export function parseOrderSubmission(value: unknown, min: number, max: number) {
  if (!value || typeof value !== "object") throw new Error("Некорректная заявка.");
  const data = value as Record<string, unknown>;
  for (const [key, limit] of [["topic", ORDER_LIMITS.topic], ["name", ORDER_LIMITS.name], ["phone", 30], ["sheets", 3], ["comment", ORDER_LIMITS.comment]] as const) {
    if (typeof data[key] !== "string" || data[key].length > limit) throw new Error("Проверьте поля заявки.");
  }
  if (typeof data.number !== "string" || !/^\d{8}$/.test(data.number) || typeof data.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.requestId) || typeof data.urgent !== "boolean") throw new Error("Некорректная заявка.");
  const fields: OrderFields = { topic: (data.topic as string).trim(), name: (data.name as string).trim(), phone: data.phone as string, sheets: data.sheets as string, comment: (data.comment as string).trim() };
  if (Object.keys(validateOrder(fields, min, max)).length) throw new Error("Проверьте тему, имя, WhatsApp и количество листов.");
  return { ...fields, number: data.number, requestId: data.requestId, urgent: data.urgent };
}
