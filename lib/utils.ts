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
