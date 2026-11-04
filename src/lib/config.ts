import type { Tariff } from "./pricing";
// Фотографии работ лежат в public/works. Теги описывают содержание фото.
export const workExamples = [
  { title: "Финансовая грамотность", tag: "Финансы", image: "/works/example-1.webp", alt: "Рукописная СРС о финансовой грамотности и личном бюджете на листе А4" },
  { title: "Основы экологии", tag: "Экология", image: "/works/example-2.webp", alt: "Рукописная СРС об экологии и развитии представлений о природе" },
  { title: "Список литературы", tag: "Оформление", image: "/works/example-3.webp", alt: "Рукописный список использованной литературы на листе А4" },
];
export const tariff: Tariff = {
  pricePerSheet: 45,
  rushMultiplier: 2,
};
// QR-код ELQR для оплаты заказов
export const QR_IMAGE_URL = "/payment-qr.jpg";
export const siteConfig = {
  name: "pisaka",
  includedServices: "В стоимость входят составление текста по вашей теме, оформление и написание текста на листе А4.",
  minSheets: 1, maxSheets: 100,
  sheetDescription: "Один лист — одна заполненная сторона А4.", // TODO: подтвердить формат.
  timing: "Обычный заказ по Бишкеку — сегодня заказали, завтра получили. Время и место передачи согласуем с вами лично.",
  urgentTiming: "Срочный заказ отправляем по Бишкеку сразу после печати.",
  delivery: "Согласуем максимально удобное для вас место встречи в Бишкеке и передадим готовые листы лично. По вашему желанию можем отправить работу доставкой.",
  telegram: "tg://resolve?domain=pisaka_bishkek",
  whatsapp: "", // TODO: https://wa.me/номер
  paymentRecipient: "", // TODO: имя получателя для проверки перед оплатой.
};
