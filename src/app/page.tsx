import SiteHeader from "@/components/SiteHeader";
import HomeMotion from "@/components/HomeMotion";
import WorkExamples from "@/components/WorkExamples";
import Faq from "@/components/Faq";
import Icon from "@/components/Icon";
import { siteConfig, tariff } from "@/lib/config";
import { formatSom } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "pisaka — СРС и конспекты на заказ",
  `Составим СРС по вашей теме и материалам. ${tariff.pricePerSheet} сом за лист А4. Примеры работ, расчёт стоимости и оформление заказа онлайн.`,
  "/",
);
const benefits = [
  { icon: "book", color: "orange", title: "По вашей теме", text: "Пишем по вашим материалам и заданию" },
  { icon: "check", color: "purple", title: "Красивый почерк", text: "Аккуратно и разборчиво" },
  { icon: "paper", color: "blue", title: "Формат А4", text: "Готово к сдаче, без переделок" },
  { icon: "bolt", color: "green", title: "Срочность?", text: "Срочный заказ возможен" },
] as const;
const steps = [["Заявка", "Укажите тему и объём"], ["Согласование", "Уточним детали и срок"], ["Работа", "Подготовим СРС"], ["Выдача", "Передадим готовые листы"]];
export default function Home() {
  return <><HomeMotion/><a className="skip-link" href="#main">Перейти к содержимому</a><SiteHeader/>
    <main id="main" className="container"><section className="hero"><h1>{siteConfig.name}<span className="pisaka-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></h1><p className="hero-subtitle">Составим СРС по вашей теме и напишем на А4</p><a className="button hero-cta" href="/order">Рассчитать стоимость<Icon name="arrow"/></a><div className="hero-pills"><span><Icon name="paper"/>{formatSom(tariff.pricePerSheet)} <span className="muted">/ лист А4</span></span><span><Icon name="bolt"/><span className="full-label">Нужно срочно?</span><span className="compact-label">Срочно</span> <strong><span className="full-label">Цена </span>×{tariff.rushMultiplier}</strong></span></div></section>
    <section id="benefits" className="benefits" aria-label="Наши преимущества">{benefits.map(item => <article className="benefit" key={item.title}><span className={"icon-tile " + item.color}><Icon name={item.icon}/></span><h2>{item.title}</h2><p>{item.text}</p></article>)}</section>
    <section id="how" className="how section"><div className="section-heading"><h2>Четыре шага. Всё просто.</h2></div><div className="steps">{steps.map(([title, text], i) => <article key={title}><span className="step-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <WorkExamples/><Faq/></main><footer className="footer container"><div><a className="brand" href="#">{siteConfig.name}<span className="brand-dot">.</span></a><p>Тема ваша. Листы — наши.</p></div><div className="footer-links">{siteConfig.telegram ? <a href={siteConfig.telegram}>Telegram <Icon name="arrowUpRight"/></a> : <span>Telegram · скоро</span>}{siteConfig.whatsapp ? <a href={siteConfig.whatsapp}>WhatsApp <Icon name="arrowUpRight"/></a> : <span>WhatsApp · скоро</span>}</div><span className="footer-note">Составлено с заботой.<br/>Напечатано на машинке.</span></footer></>;
}
