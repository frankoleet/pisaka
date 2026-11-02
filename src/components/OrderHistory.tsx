"use client";

import { useEffect, useState } from "react";
import { ORDER_HISTORY_KEY, readOrders, type SavedOrder } from "@/lib/order-history";
import { formatSom, sheetWord } from "@/lib/pricing";
import Icon from "./Icon";

export default function OrderHistory() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  function refresh() {
    try { setOrders(readOrders(window.localStorage)); setError(""); }
    catch { setError("Не удалось прочитать историю. Проверьте, разрешено ли хранение данных для этого сайта. Существующие записи не изменены."); }
    setLoaded(true);
  }
  useEffect(() => {
    const initialRead = window.requestAnimationFrame(refresh);
    function sync(event: StorageEvent) { if (event.key === ORDER_HISTORY_KEY || event.key === null) refresh(); }
    window.addEventListener("storage", sync);
    return () => {
      window.cancelAnimationFrame(initialRead);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return <>
    <p className="history-intro">История хранится только в этом браузере. При очистке данных сайта она удалится.</p>
    {!loaded && <p role="status">Загружаем заказы…</p>}
    {error ? <div className="history-empty"><p role="alert">{error}</p><button type="button" className="button" onClick={refresh}>Попробовать снова</button></div> : loaded && orders.length === 0 ? <div className="history-empty"><Icon name="paper"/><h2>Пока нет заказов</h2><p>После оформления здесь появятся тема, сумма и номер вашей заявки.</p><a className="button" href="/order">Оставить заявку <Icon name="arrow"/></a></div> : <div className="history-list">{orders.map(order => <article className="history-card" key={order.number}>
      <div className="history-card-top"><span>Заказ №{order.number}</span><span className="history-status">Отправлена</span></div>
      <time dateTime={order.createdAt}>{new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(order.createdAt))}</time>
      <h2>{order.topic}</h2>
      <div className="history-facts"><span>{order.sheets} {sheetWord(order.sheets)} · {order.urgent ? "Срочно" : "Обычный заказ"}</span><strong>{formatSom(order.total)}</strong></div>
      <p>Свяжемся с вами в WhatsApp.</p>
      <p className="history-demo">Демо-заявка: сохранена в браузере, но ещё не отправлена нам.</p>
    </article>)}</div>}
  </>;
}
