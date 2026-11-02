import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./pisaka.css";
const manrope = localFont({ src: "./fonts/Manrope.ttf", variable: "--font-manrope", display: "swap", weight: "200 800" });
export const metadata: Metadata = {
  title: "pisaka — конспект по вашей теме",
  description: "Составим конспект по вашей теме и напечатаем на А4. 45 сом за лист. Рассчитайте стоимость обычного или срочного заказа.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru" className={manrope.variable}><body>{children}<Analytics /></body></html>;
}
