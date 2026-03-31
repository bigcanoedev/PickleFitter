import { MetadataRoute } from "next";
import { paddleData } from "@/lib/paddle-data";
import { Paddle } from "@/lib/types";

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
  ];

  const paddlePages: MetadataRoute.Sitemap = (paddleData as Paddle[]).map((p) => ({
    url: `${BASE_URL}/paddle/${p.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...paddlePages];
}
