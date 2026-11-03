import assert from "node:assert/strict";
import { test } from "node:test";
import { formatWhatsApp, editWhatsAppNumber, validateOrder } from "../src/lib/order.ts";

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
test("редактирование начала номера не дублирует код страны и сохраняет курсор", () => {
  assert.deepEqual(editWhatsAppNumber("1555 123", 1), { value: "155 512 3", caret: 1 });
  assert.deepEqual(editWhatsAppNumber("555 9123", 5), { value: "555 912 3", caret: 5 });
  assert.equal(formatWhatsApp("996123456"), "+996 996 123 456");
  assert.equal(formatWhatsApp("996555123456"), "+996 555 123 456");
  assert.deepEqual(editWhatsAppNumber("", 0), { value: "", caret: 0 });
});
test("лимит от 1 до 100, без дробей и пустого значения", () => {
  for (const sheets of ["1", "5", "10", "15", "20", "100"]) assert.deepEqual(validateOrder({ ...valid, sheets }, 1, 100), {});
  for (const sheets of ["", "0", "101", "1.5", "-1", "abc"]) assert.ok(validateOrder({ ...valid, sheets }, 1, 100).sheets);
});
test("ограничения имени и темы действуют при валидации", () => {
  assert.ok(validateOrder({ ...valid, name: "я".repeat(21) }, 1, 100).name);
  assert.ok(validateOrder({ ...valid, topic: "я".repeat(301) }, 1, 100).topic);
});
