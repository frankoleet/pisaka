import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_RECEIPT_BYTES, receiptFileError, receiptSignatureMatches } from "../src/lib/receipt.ts";

test("чек обязателен, только изображения не больше 3 МБ", () => {
  assert.ok(receiptFileError(null));
  assert.ok(receiptFileError({ size: 0, type: "image/png" }));
  assert.ok(receiptFileError({ size: MAX_RECEIPT_BYTES + 1, type: "image/jpeg" }));
  assert.ok(receiptFileError({ size: 100, type: "application/pdf" }));
  assert.ok(receiptFileError({ size: 100, type: "video/mp4" }));
  assert.ok(receiptFileError({ size: 100, type: "image/svg+xml" }));
  for (const type of ["image/jpeg", "image/png", "image/webp"]) assert.equal(receiptFileError({ size: MAX_RECEIPT_BYTES, type }), null);
});
test("проверка сигнатуры файла, а не только расширения", () => {
  const png = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0]);
  assert.equal(receiptSignatureMatches(png, "image/png"), true);
  assert.equal(receiptSignatureMatches(png, "image/jpeg"), false);
  assert.equal(receiptSignatureMatches(new TextEncoder().encode("not-an-image-file"), "image/png"), false);
  assert.equal(receiptSignatureMatches(new Uint8Array([255,216,255,0,0,0,0,0,0,0,0,0]), "image/jpeg"), true);
  assert.equal(receiptSignatureMatches(new TextEncoder().encode("RIFF1234WEBP"), "image/webp"), true);
});
