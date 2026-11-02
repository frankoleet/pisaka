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
