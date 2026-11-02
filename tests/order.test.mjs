import assert from "node:assert/strict";
import { test } from "node:test";
import { formatWhatsApp, validateOrder } from "../src/lib/order.ts";

const valid = { topic: "История", name: "Алия", phone: "+996 555 123 456", sheets: "10", comment: "" };
test("маска WhatsApp: ввод, вставка, очистка", () => {
  assert.equal(formatWhatsApp("555123456"), "+996 555 123 456");
  assert.equal(formatWhatsApp("+996 (555) 123-456"), "+996 555 123 456");
  assert.equal(formatWhatsApp("+996 555 123 456789"), "+996 555 123 456");
  assert.equal(formatWhatsApp(""), "+996 ");
  assert.equal(formatWhatsApp("+996 55"), "+996 55");
});
test("обязательные поля и полный номер", () => {
  assert.deepEqual(validateOrder(valid, 1, 100), {});
  const errors = validateOrder({ ...valid, topic: " ", name: "", phone: "+996 555" }, 1, 100);
  assert.deepEqual(Object.keys(errors), ["topic", "name", "phone"]);
});
test("лимит от 1 до 100, без дробей и пустого значения", () => {
  for (const sheets of ["1", "5", "10", "15", "20", "100"]) assert.deepEqual(validateOrder({ ...valid, sheets }, 1, 100), {});
  for (const sheets of ["", "0", "101", "1.5", "-1", "abc"]) assert.ok(validateOrder({ ...valid, sheets }, 1, 100).sheets);
});
