import { NextRequest, NextResponse } from "next/server";

// Known scraper/AI bot user-agent patterns
// Scraper/spam bots only — AI crawlers (GPTBot, ClaudeBot, etc.) are allowed
const BLOCKED_BOT_PATTERNS = [
  /Bytespider/i,
  /PetalBot/i,
  /Scrapy/i,
  /wget/i,
  /curl/i,
  /python-requests/i,
  /httpx/i,
  /aiohttp/i,
  /Go-http-client/i,
  /java\//i,
  /libwww-perl/i,
  /PHP\//i,
  /axios/i,
  /node-fetch/i,
  /undici/i,
  /scraperapi/i,
  /scrapingbee/i,
  /brightdata/i,
  /DataForSeoBot/i,
  /MJ12bot/i,
  /DotBot/i,
  /BLEXBot/i,
];

// Simple in-memory rate limiter for middleware (Edge Runtime compatible)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function middlewareRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Periodic cleanup
  if (rateLimitMap.size > 10000) {
    rateLimitMap.forEach((val, key) => {
      if (now > val.resetAt) rateLimitMap.delete(key);
    });
  }

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count++;
  return entry.count <= limit;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ua = request.headers.get("user-agent") || "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // --- Block known scraper bots ---
  if (BLOCKED_BOT_PATTERNS.some((pattern) => pattern.test(ua))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // --- Block requests with no user-agent (almost always bots) ---
  if (!ua || ua.length < 10) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // --- Block direct access to data files ---
  if (pathname.match(/\.(json|csv|xml)$/i) && !pathname.startsWith("/api/") && pathname !== "/sitemap.xml") {
    return new NextResponse("Not Found", { status: 404 });
  }

  // --- Rate limit API routes: 30 requests per minute per IP ---
  if (pathname.startsWith("/api/")) {
    if (!middlewareRateLimit(`api:${ip}`, 30, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // --- Rate limit page requests: 60 requests per minute per IP ---
  if (!middlewareRateLimit(`page:${ip}`, 60, 60_000)) {
    return new NextResponse("Too many requests. Please slow down.", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  // --- Add security headers ---
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Robots-Tag", "all");

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static assets and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|og-image.png).*)",
  ],
};
