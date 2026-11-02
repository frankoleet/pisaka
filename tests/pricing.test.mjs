import assert from "node:assert/strict";
import { test } from "node:test";
import { calcPrice, sheetWord, formatSom } from "../src/lib/pricing.ts";
const tariff = { pricePerSheet: 45, rushMultiplier: 2 };
test("обычный и срочный заказ, границы объёма", () => {
  assert.equal(calcPrice(10, false, tariff), 450);
  assert.equal(calcPrice(10, true, tariff), 900);
  assert.equal(calcPrice(1, false, tariff), 45);
  assert.equal(calcPrice(500, true, tariff), 45000);
});
test("невалидные значения не превращаются в цену", () => {
  for (const sheets of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => calcPrice(sheets, false, tariff), RangeError);
  assert.throws(() => calcPrice(1, false, { pricePerSheet: NaN, rushMultiplier: 2 }), RangeError);
  assert.throws(() => calcPrice(1, true, { pricePerSheet: 45, rushMultiplier: 0 }), RangeError);
});
test("русское склонение и сомы", () => {
  for (const [count, word] of [[1,"лист"],[2,"листа"],[5,"листов"],[11,"листов"],[12,"листов"],[14,"листов"],[21,"лист"],[24,"листа"],[111,"листов"],[500,"листов"]]) assert.equal(sheetWord(count), word);
  assert.equal(formatSom(450), "450 сом");
  assert.match(formatSom(22500), /^22\s500 сом$/u);
});
