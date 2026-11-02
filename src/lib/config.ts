import type { Tariff } from "./pricing";
// Фотографии работ лежат в public/works. Теги описывают содержание фото.
export const workExamples = [
  { title: "Финансовая грамотность", tag: "Финансы", image: "/works/example-1.webp", alt: "Рукописный конспект о финансовой грамотности и личном бюджете на листе А4" },
  { title: "Основы экологии", tag: "Экология", image: "/works/example-2.webp", alt: "Рукописный конспект об экологии и развитии представлений о природе" },
  { title: "Список литературы", tag: "Оформление", image: "/works/example-3.webp", alt: "Рукописный список использованной литературы на листе А4" },
];
export const tariff: Tariff = {
  pricePerSheet: 45, // TODO: подтвердить тариф.
  rushMultiplier: 2,
};
// QR-код ELQR для оплаты заказов
export const QR_IMAGE_URL = "/payment-qr.jpg";
export const siteConfig = {
  name: "pisaka",
  minSheets: 1, maxSheets: 100,
  sheetDescription: "Один лист — одна заполненная сторона А4.", // TODO: подтвердить формат.
  timing: "Срок согласуем после уточнения темы и объёма.", // TODO: уточнить сроки.
  delivery: "Способ и место передачи готовых листов согласуем лично.", // TODO: условия доставки.
  telegram: "", // TODO: https://t.me/ваше_имя
  whatsapp: "", // TODO: https://wa.me/номер
  paymentRecipient: "", // TODO: имя получателя для проверки перед оплатой.
};
