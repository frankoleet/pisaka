export function formatWhatsApp(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("996")) digits = digits.slice(3);
  digits = digits.slice(0, 9);
  return "+996 " + (digits.match(/.{1,3}/g)?.join(" ") ?? "");
}

export type OrderFields = { topic: string; name: string; phone: string; sheets: string; comment: string };
export type OrderErrors = Partial<Record<"topic" | "name" | "phone" | "sheets", string>>;

export function validateOrder(values: OrderFields, min: number, max: number): OrderErrors {
  const errors: OrderErrors = {};
  if (!values.topic.trim()) errors.topic = "Укажите тему или предмет.";
  if (!values.name.trim()) errors.name = "Укажите ваше имя.";
  if (!/^\+996 \d{3} \d{3} \d{3}$/.test(values.phone)) errors.phone = "Введите номер WhatsApp: +996 XXX XXX XXX.";
  const count = Number(values.sheets);
  if (!values.sheets.trim() || !Number.isInteger(count) || count < min || count > max) errors.sheets = `Укажите целое число от ${min} до ${max}.`;
  return errors;
}
