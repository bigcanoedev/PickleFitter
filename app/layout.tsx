import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { FooterEmailSignup } from "@/components/FooterEmailSignup";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PickleFitter — Find Your Perfect Pickleball Paddle",
  description:
    "Data-driven pickleball paddle recommendations powered by lab-tested performance data, swing physics, and 727 real paddles. Take a 2-minute quiz, customize specs, and get lead tape placement guides.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
              <div className="flex items-center gap-4">
                <p>Lab-tested paddle recommendations based on swing physics.</p>
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
      </body>
    </html>
  );
}
