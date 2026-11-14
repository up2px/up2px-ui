import type { MetadataRoute } from "next";
import { getAllComponents } from "@/lib/registry";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ui.up2px.com";
  const now = new Date();

  const componentEntries: MetadataRoute.Sitemap = getAllComponents().map(
    (comp) => ({
      url: `${baseUrl}/components/${comp.slug}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/components/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/templates/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blocks/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...componentEntries,
  ];
}
