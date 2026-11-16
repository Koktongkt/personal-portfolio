import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, changeFrequency: "weekly", priority: 1 }];
}
