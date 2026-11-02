"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { siteConfig } from "@/lib/config";

const sections = [
  { id: "benefits", label: "Почему мы" },
  { id: "how", label: "Как заказать" },
  { id: "faq", label: "Вопросы" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (pathname !== "/") return;
    let frame = 0;
    const update = () => {
      let current = "";
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= 160) current = section.id;
      }
      // The last section may be too short to reach the top of the viewport.
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = "faq";
      setActiveSection(current);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, [pathname]);

  return <header className="header"><div className="header-inner">
    <Link className="brand" href="/" aria-label="pisaka — на главную"><span className="brand-icon"><Icon name="paper"/></span>{siteConfig.name}<span className="brand-dot">.</span></Link>
    <nav aria-label="Основная навигация">
      {sections.map(section => {
        const active = pathname === "/" && activeSection === section.id;
        return <Link key={section.id} className={"header-link" + (active ? " is-active" : "")} href={"/#" + section.id} aria-current={active ? "location" : undefined} onClick={() => { if (pathname === "/") setActiveSection(section.id); }}>{section.label}</Link>;
      })}
    </nav>
    <Link className={"history-nav" + (pathname === "/orders" ? " is-active" : "")} href="/orders" aria-current={pathname === "/orders" ? "page" : undefined} aria-label="Мои заказы" title="Мои заказы"><Icon name="book"/><span>Мои заказы</span></Link>
    <Link className={"button header-cta" + (pathname === "/order" ? " is-active" : "")} href="/order" aria-current={pathname === "/order" ? "page" : undefined}><span className="full-label">Заказать конспект</span><span className="compact-label">Заказать</span><Icon name="arrow"/></Link>
  </div></header>;
}
