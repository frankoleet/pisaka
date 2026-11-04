import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { workExamples } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, images: workExamples.map(example => `${siteUrl}${example.image}`) },
    { url: `${siteUrl}/order` },
  ];
}
