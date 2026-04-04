import { MetadataRoute } from "next";
import { paddleData } from "@/lib/paddle-data";
import { Paddle } from "@/lib/types";
import { paddleSlug } from "@/lib/utils";
import { guides } from "@/lib/guides";

const BASE_URL = "https://picklefitter.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/quiz`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/results`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/database`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/best`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/methodology`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/guides/how-to-choose`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/compare`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${BASE_URL}/best/${g.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const paddlePages: MetadataRoute.Sitemap = (paddleData as Paddle[]).map((p) => ({
    url: `${BASE_URL}/paddle/${paddleSlug(p.brand, p.name)}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...guidePages, ...paddlePages];
}
