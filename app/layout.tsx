import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
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
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="" className="w-5 h-5" />
              <span className="font-black text-foreground">
                Pickle<span className="text-primary">Fitter</span>
              </span>
            </Link>
            <p>Lab-tested paddle recommendations based on swing physics.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
