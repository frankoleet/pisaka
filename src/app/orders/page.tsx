import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import OrderHistory from "@/components/OrderHistory";

export const metadata: Metadata = { title: "Мои заказы — pisaka", robots: { index: false, follow: false } };

export default function OrdersPage() {
  return <><Link className="skip-link" href="#main">Перейти к заказам</Link><SiteHeader/><main id="main" className="container history-page"><Link className="back-link" href="/">← На главную</Link><div className="history-heading"><h1>Мои заказы</h1><Link className="button" href="/order">Новый заказ</Link></div><OrderHistory/></main></>;
}
