import type { Metadata } from "next";

export const siteUrl = "https://pisaka.team";

export function pageMetadata(title: string, description: string, path: string, image = "/social/home.jpg"): Metadata {
  const images = [{ url: image, width: 1200, height: 630, alt: "pisaka — СРС на А4. Пример готовой работы." }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "ru_RU", siteName: "pisaka", url: path, title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
