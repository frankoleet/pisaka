import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import OrderForm from "@/components/OrderForm";

export const metadata: Metadata = {
  title: "Заказать конспект — pisaka",
  description: "Укажите тему и объём конспекта. Рассчитайте стоимость: 45 сом за лист, срочный заказ — ×2.",
};

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
