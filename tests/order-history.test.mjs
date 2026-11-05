import assert from "node:assert/strict";
import { test } from "node:test";
import { ORDER_HISTORY_KEY, readOrders, saveOrder } from "../src/lib/order-history.ts";
const order = { number: "12345678", createdAt: "2026-11-03T10:00:00.000Z", topic: "История", sheets: 10, urgent: false, total: 450, status: "sent", demo: true };
function storage(initial = null) {
  let value = initial;
  return { getItem: () => value, setItem: (key, next) => { assert.equal(key, ORDER_HISTORY_KEY); value = next; } };
}
test("история сохраняется и читается заново, без дубликатов", () => {
  const store = storage();
  assert.deepEqual(readOrders(store), []);
  saveOrder(store, order);
  saveOrder(store, order);
  assert.deepEqual(readOrders(store), [order]);
  saveOrder(store, { ...order, number: "87654321" });
  assert.deepEqual(readOrders(store).map(item => item.number), ["87654321", "12345678"]);
});
test("повреждённая история не перезаписывается", () => {
  for (const raw of ["broken", "{}", JSON.stringify([{ ...order, total: -1 }])]) {
    const store = storage(raw);
    assert.throws(() => saveOrder(store, order));
    assert.equal(store.getItem(), raw);
  }
});
test("ошибки доступа и переполнения не скрываются", () => {
  assert.throws(() => readOrders({ getItem() { throw new Error("blocked"); } }));
  assert.throws(() => saveOrder({ getItem: () => null, setItem() { throw new Error("quota"); } }, order));
});
test("реальные заказы и прежние демо-заявки читаются вместе", () => {
  const store = storage(JSON.stringify([order]));
  saveOrder(store, { ...order, number: "55556666", demo: false });
  assert.deepEqual(readOrders(store).map(item => item.demo), [false, true]);
});

test("контакты для повтора сохраняются у каждого заказа после добавления следующего", () => {
  const store = storage();
  const first = { ...order, demo: false, contact: { name: "Алия", phone: "+996 555 123 456" } };
  const second = { ...order, number: "87654321", demo: false, contact: { name: "Асан", phone: "+996 700 654 321" } };
  saveOrder(store, first);
  saveOrder(store, second);
  assert.deepEqual(readOrders(store), [second, first]);
});

test("старые заказы без контактов сохраняются вместе с новыми", () => {
  const store = storage(JSON.stringify([order]));
  const next = { ...order, number: "55556666", contact: { name: "Алия", phone: "+996 555 123 456" } };
  saveOrder(store, next);
  assert.deepEqual(readOrders(store), [next, order]);
});

test("некорректные контакты не подставляются и не ломают историю", () => {
  for (const contact of [null, "broken", {}, { name: " ", phone: "+996 555 123 456" }, { name: "я".repeat(21), phone: "+996 555 123 456" }, { name: "Алия", phone: "555" }]) {
    assert.deepEqual(readOrders(storage(JSON.stringify([{ ...order, contact }]))), [order]);
  }
  const contact = { name: " Алия ", phone: "+996 555 123 456", receipt: "must-not-be-copied" };
  const [saved] = readOrders(storage(JSON.stringify([{ ...order, contact }])));
  assert.deepEqual(saved.contact, { name: "Алия", phone: "+996 555 123 456" });
});
