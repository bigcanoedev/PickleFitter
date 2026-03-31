import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: ["GPTBot", "CCBot", "ChatGPT-User", "Google-Extended", "anthropic-ai", "ClaudeBot"],
        disallow: "/",
      },
    ],
    sitemap: "https://picklefitter.com/sitemap.xml",
  };
}
