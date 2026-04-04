import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { FooterEmailSignup } from "@/components/FooterEmailSignup";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = "https://picklefitter.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "PickleFitter — Find Your Perfect Pickleball Paddle",
  description:
    "Data-driven pickleball paddle recommendations powered by lab-tested performance data, swing physics, and 727 real paddles. Take a 2-minute quiz, customize specs, and get lead tape placement guides.",
  openGraph: {
    type: "website",
    siteName: "PickleFitter",
    title: "PickleFitter — Find Your Perfect Pickleball Paddle",
    description:
      "Lab-tested paddle recommendations matched to your play style. 727 paddles, 13 scoring dimensions, real swing data — not marketing hype.",
    url: BASE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PickleFitter — Find Your Perfect Pickleball Paddle" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PickleFitter — Find Your Perfect Pickleball Paddle",
    description:
      "Lab-tested paddle recommendations matched to your play style. 727 paddles, 13 scoring dimensions, real swing data.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "PickleFitter",
                url: BASE_URL,
                logo: `${BASE_URL}/logo.svg`,
                description:
                  "Data-driven pickleball paddle recommendations powered by lab-tested performance data and swing physics. 727 paddles scored across 13 dimensions.",
                sameAs: [],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "PickleFitter",
                url: BASE_URL,
                description:
                  "Find your perfect pickleball paddle with lab-tested data and a 2-minute quiz.",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${BASE_URL}/database`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">{children}</main>
        <footer className="border-t bg-card mt-16">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-8">
            <div className="flex flex-col items-center gap-4 text-center mb-6">
              <p className="text-sm font-medium text-foreground">Get paddle updates, deals, and new features</p>
              <FooterEmailSignup />
            </div>
            <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img src="/logo.svg" alt="" className="w-5 h-5" />
                <span className="font-black text-foreground">
                  Pickle<span className="text-primary">Fitter</span>
                </span>
              </Link>
              <div className="flex flex-wrap items-center gap-4">
                <p>Lab-tested paddle recommendations based on swing physics.</p>
                <Link href="/best" className="hover:text-foreground transition-colors whitespace-nowrap">
                  Best Paddles
                </Link>
                <Link href="/guides/how-to-choose" className="hover:text-foreground transition-colors whitespace-nowrap">
                  Buying Guide
                </Link>
                <Link href="/about" className="hover:text-foreground transition-colors whitespace-nowrap">
                  About
                </Link>
                <Link href="/methodology" className="hover:text-foreground transition-colors whitespace-nowrap">
                  Methodology
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors whitespace-nowrap">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors whitespace-nowrap">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
