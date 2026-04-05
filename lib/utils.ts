import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Paddle } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function paddleSlug(brand: string, name: string): string {
  return `${brand} ${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function selectBestLink(paddle: Paddle): string {
  return paddle.purchase_link || paddle.generic_affiliate_link || paddle.amazon_link || "";
}

/* ───────────── Brand Affiliate Links ───────────── */

const BRAND_AFFILIATE_LINKS: Record<string, { url: string; label: string }> = {
  "Holbrook": { url: "https://holbrookpickleball.com/pickleleague", label: "Holbrook" },
  "Paddletek": { url: "https://www.paddletek.com/picklefitter", label: "Paddletek" },
  "Bread & Butter": { url: "https://breadbutterpickleballco.sjv.io/QYKPNo", label: "Bread & Butter" },
  "Enhance": { url: "https://www.enhancepickleball.com/TANNER41733", label: "Enhance" },
  "Core": { url: "https://coreathletics.com/?bg_ref=5uBhsfY8kr", label: "Core Pickleball" },
};

export interface RetailerLink {
  url: string;
  label: string;
  primary: boolean;
}

export function getRetailerLinks(paddle: Paddle): RetailerLink[] {
  const links: RetailerLink[] = [];

  // Per-paddle store link (most specific — bit.ly/short.gy to product page)
  const storeLink = paddle.purchase_link || paddle.generic_affiliate_link;
  if (storeLink) {
    const brandAffiliate = BRAND_AFFILIATE_LINKS[paddle.brand];
    const label = brandAffiliate ? brandAffiliate.label : "Official Store";
    links.push({ url: storeLink, label, primary: true });
  } else {
    // Fallback: brand-level affiliate link
    const brandAffiliate = BRAND_AFFILIATE_LINKS[paddle.brand];
    if (brandAffiliate) {
      links.push({ url: brandAffiliate.url, label: brandAffiliate.label, primary: true });
    }
  }

  // Amazon as secondary (or primary if no store link)
  if (paddle.amazon_link) {
    links.push({ url: paddle.amazon_link, label: "Amazon", primary: links.length === 0 });
  }

  return links;
}

/* ───────────── Discount Code Parsing ───────────── */

export function parseDiscountCode(raw: string): { code: string; description: string } {
  const trimmed = raw.trim();
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx === -1) return { code: trimmed, description: "" };

  const code = trimmed.substring(0, spaceIdx);
  let description = trimmed.substring(spaceIdx + 1).trim();

  // Clean up leading filler words like "to save", "for", "—"
  description = description.replace(/^(to\s+(save|get|receive)\s+)/i, "").replace(/^(for\s+)/i, "");

  return { code, description };
}
