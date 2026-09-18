import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${config.siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${config.siteUrl}/league`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
