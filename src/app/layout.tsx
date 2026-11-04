import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./pisaka.css";
import { siteUrl } from "@/lib/seo";
const manrope = localFont({ src: "./fonts/Manrope.ttf", variable: "--font-manrope", display: "swap", weight: "200 800" });
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "pisaka — СРС по вашей теме",
  description: "Составим СРС по вашей теме и напечатаем на А4. 45 сом за лист. Рассчитайте стоимость обычного или срочного заказа.",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru" className={manrope.variable}><body>{children}<Analytics /></body></html>;
}
