export const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;
export const RECEIPT_ACCEPT = "image/jpeg,image/png,image/webp";

export function receiptFileError(file: { size: number; type: string } | null): string | null {
  if (!file || file.size === 0) return "Добавьте фото или скриншот чека.";
  if (file.size > MAX_RECEIPT_BYTES) return "Изображение должно быть не больше 3 МБ.";
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Выберите изображение JPG, PNG или WebP.";
  return null;
}

export function receiptSignatureMatches(bytes: Uint8Array, type: string): boolean {
  if (bytes.length < 12) return false;
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}
