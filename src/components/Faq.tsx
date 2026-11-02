import { siteConfig } from "@/lib/config";
const questions = [
  ["Как быстро будет готов конспект?", siteConfig.timing],
  ["Можно заказать срочно?", "Да. Отметьте «Срочно» в форме: стоимость увеличится в два раза. Возможность выполнения к нужному времени согласуем отдельно."],
  ["Как оплатить заказ?", "После заполнения формы вы увидите сумму и QR для оплаты, когда он будет добавлен. Введите указанную сумму в приложении банка и проверьте получателя. Оплату подтверждаем вручную."],
  ["Можно передать методичку?", "Да, можно передать методичку, план или требования преподавателя. Укажите это в комментарии — способ передачи материалов согласуем при связи."],
  ["Как получить готовые листы?", siteConfig.delivery],
];
export default function Faq() {
  return <section id="faq" className="faq section"><div className="section-heading"><div><h2>Остались вопросы?</h2></div><span className="muted">Здесь — самое важное</span></div><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span className="plus" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>;
}
