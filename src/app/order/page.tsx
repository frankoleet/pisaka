import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { tariff } from "@/lib/config";
import SiteHeader from "@/components/SiteHeader";
import OrderForm from "@/components/OrderForm";

export const metadata = pageMetadata(
  "Заказать СРС — расчёт стоимости | pisaka",
  `Укажите тему и объём СРС. Рассчитайте стоимость: ${tariff.pricePerSheet} сом за лист, срочный заказ — ×${tariff.rushMultiplier}.`,
  "/order",
  "/social/order.jpg",
);

export default function OrderPage() {
  return <>
    <Link className="skip-link" href="#main">Перейти к заявке</Link>
    <SiteHeader/>
    <main id="main" className="container order-page">
      <Link className="back-link" href="/">← На главную</Link>
      <OrderForm/>
    </main>
  </>;
}
