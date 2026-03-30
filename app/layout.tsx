import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AuthorBranding } from "@/components/AuthorBranding";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paddle Finder - Find Your Perfect Pickleball Paddle",
  description:
    "Data-driven pickleball paddle recommendations based on swing physics. Take a 2-minute quiz, customize specs with interactive sliders, and get lead tape placement guides.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-primary">Paddle</span>Finder
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/quiz"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Take Quiz
              </Link>
              <AuthorBranding />
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <AuthorBranding />
            <p>Data-driven paddle recommendations based on swing physics.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
