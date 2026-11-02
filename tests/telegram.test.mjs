import assert from "node:assert/strict";
import { test } from "node:test";
import { createTelegramDelivery, telegramConfig, telegramMessage } from "../src/lib/server/telegram.ts";
import { parseOrderSubmission } from "../src/lib/order.ts";
import { calcPrice } from "../src/lib/pricing.ts";

const order = { requestId: "bd6c25f7-b250-4296-b726-695339cba52d", number: "12345678", topic: "История <тема>", name: "Тест", phone: "+996 555 123 456", sheets: "10", comment: "Требования", urgent: false, total: 450 };
const config = { token: "123:test-token", chats: ["111", "-100222"] };
const success = () => Response.json({ ok: true, result: { message_id: 1 } });

test("сервер проверяет типы, длины и объём; цена клиента игнорируется", () => {
  const parsed = parseOrderSubmission({ ...order, total: 1 }, 1, 100);
  assert.equal("total" in parsed, false);
  assert.equal(calcPrice(Number(parsed.sheets), parsed.urgent, { pricePerSheet: 45, rushMultiplier: 2 }), 450);
  for (const invalid of [null, { ...order, urgent: "yes" }, { ...order, sheets: "101" }, { ...order, phone: "invalid" }, { ...order, comment: "a".repeat(2001) }, { ...order, topic: 123 }, { ...order, requestId: "bad" }]) assert.throws(() => parseOrderSubmission(invalid, 1, 100));
});
test("настройки: несколько чатов, удаление дублей, отсутствие токена", () => {
  assert.deepEqual(telegramConfig("123:token", "111, -100222,111").chats, ["111", "-100222"]);
  assert.throws(() => telegramConfig(), error => error.status === 503);
  assert.throws(() => telegramConfig("123:token", "@wrong"));
});
test("параллельные и повторные запросы отправляются один раз каждому чату", async () => {
  const messages = [];
  const deliver = createTelegramDelivery(async (_url, options) => { messages.push(JSON.parse(options.body)); return success(); });
  const [first, second] = await Promise.all([deliver(order, config), deliver(order, config)]);
  assert.deepEqual(first, second);
  assert.equal(first.demo, false);
  assert.equal(first.status, "sent");
  await deliver(order, config);
  assert.equal(messages.length, 2);
  assert.deepEqual(messages.map(message => message.chat_id), config.chats);
  assert.ok(messages.every(message => !message.parse_mode));
  await assert.rejects(deliver({ ...order, topic: "Другая тема" }, config), error => error.status === 409);
});
test("частичная доставка: ошибка, затем повтор только неуспешному получателю", async () => {
  const calls = [];
  let fail = true;
  const deliver = createTelegramDelivery(async (_url, options) => {
    const { chat_id } = JSON.parse(options.body);
    calls.push(chat_id);
    return chat_id === "-100222" && fail ? Response.json({ ok: false }, { status: 403 }) : success();
  });
  await assert.rejects(deliver(order, config), error => error.status === 502);
  fail = false;
  await deliver(order, config);
  assert.deepEqual(calls, ["111", "-100222", "-100222"]);
});
test("ошибка сети не раскрывает токен и не подтверждает доставку", async () => {
  const deliver = createTelegramDelivery(async () => { throw new Error("secret-token"); });
  await assert.rejects(deliver(order, config), error => error.status === 502 && !error.message.includes("secret-token"));
});
test("сообщение содержит контакт, комментарий и ручную проверку оплаты", () => {
  const text = telegramMessage(order);
  assert.match(text, /https:\/\/wa.me\/996555123456/);
  assert.match(text, /Требования/);
  assert.match(text, /проверить вручную/);
  assert.ok(telegramMessage({ ...order, topic: "я".repeat(300), name: "я".repeat(100), comment: "я".repeat(2000) }).length < 4096);
});
