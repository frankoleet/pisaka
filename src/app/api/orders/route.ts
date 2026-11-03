import { createHash } from "node:crypto";
import { siteConfig, tariff } from "@/lib/config";
import { parseOrderSubmission } from "@/lib/order";
import { calcPrice } from "@/lib/pricing";
import { MAX_RECEIPT_BYTES, receiptFileError, receiptSignatureMatches } from "@/lib/receipt";
import { createTelegramDelivery, DeliveryError, telegramConfig } from "@/lib/server/telegram";

export const maxDuration = 60;
const deliver = createTelegramDelivery();
const limits = new Map<string, { count: number; until: number }>();
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return json({ error: "Недопустимый источник запроса." }, 403);
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data;")) return json({ error: "Добавьте чек и отправьте заявку ещё раз." }, 415);
  const now = Date.now();
  for (const [key, value] of limits) if (value.until <= now) limits.delete(key);
  const ip = (request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const key = createHash("sha256").update(ip).digest("hex");
  const limit = limits.get(key);
  if ((limit && limit.count >= 10) || (!limit && limits.size >= 10000)) return json({ error: "Слишком много попыток. Подождите минуту и повторите." }, 429);
  limits.set(key, { count: (limit?.count ?? 0) + 1, until: limit?.until ?? now + 60000 });

  try {
    // Bound streamed bodies too; do not trust Content-Length alone.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Пустая заявка." }, 400);
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_RECEIPT_BYTES + 32000) { await reader.cancel(); return json({ error: "Чек должен быть не больше 3 МБ." }, 413); }
      chunks.push(value);
    }
    let form;
    try { form = await new Response(new Uint8Array(Buffer.concat(chunks)), { headers: { "Content-Type": contentType } }).formData(); }
    catch { return json({ error: "Не удалось прочитать заявку и чек. Выберите файл заново." }, 400); }
    const file = form.get("receipt");
    if (!(file instanceof File) || form.getAll("receipt").length !== 1) return json({ error: "Добавьте одно фото или скриншот чека." }, 400);
    const fileError = receiptFileError(file);
    if (fileError) return json({ error: fileError }, 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!receiptSignatureMatches(bytes, file.type)) return json({ error: "Файл не соответствует формату изображения. Выберите JPG, PNG или WebP." }, 400);
    const payload = form.get("order");
    let order;
    try {
      if (typeof payload !== "string" || payload.length > 16000) throw new Error("Invalid order");
      order = parseOrderSubmission(JSON.parse(payload), siteConfig.minSheets, siteConfig.maxSheets);
    }
    catch { return json({ error: "Проверьте поля заявки: тему, имя, WhatsApp, объём и комментарий." }, 400); }
    const total = calcPrice(Number(order.sheets), order.urgent, tariff);
    const config = telegramConfig(process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_IDS);
    const receipt = await deliver({ ...order, total }, config, file);
    return json({ order: receipt });
  } catch (error) {
    // Never expose tokens, destination IDs, Telegram responses or submitted personal data.
    if (error instanceof DeliveryError) return json({ error: error.message }, error.status);
    return json({ error: "Не удалось отправить заявку. Попробуйте ещё раз." }, 502);
  }
}
