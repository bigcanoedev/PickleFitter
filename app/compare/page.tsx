import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paddleData } from "@/lib/paddle-data";
import { Paddle } from "@/lib/types";
import { paddleSlug } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Compare Pickleball Paddles — Head-to-Head Comparisons | PickleFitter",
  description:
    "Compare any two pickleball paddles side by side. Lab-tested specs, pros, cons, and our recommendation to help you decide.",
  alternates: { canonical: "https://picklefitter.com/compare" },
  openGraph: {
    title: "Compare Pickleball Paddles — Head-to-Head Comparisons",
    description:
      "Compare any two pickleball paddles side by side with lab-tested data.",
    url: "https://picklefitter.com/compare",
  },
};

// Pre-generate popular comparisons from the top paddles by brand diversity
function getPopularComparisons() {
  const paddles = paddleData as Paddle[];
  // Get top paddles by different popular brands
  const topBrands = ["Joola", "Selkirk", "CRBN", "Engage", "Vatic Pro", "Six Zero", "Electrum", "Paddletek"];
  const topPaddles: Paddle[] = [];

  for (const brand of topBrands) {
    const brandPaddle = paddles.find((p) => p.brand === brand && p.price > 100);
    if (brandPaddle) topPaddles.push(brandPaddle);
  }

  const comparisons: { a: Paddle; b: Paddle; url: string }[] = [];
  for (let i = 0; i < topPaddles.length; i++) {
    for (let j = i + 1; j < topPaddles.length && comparisons.length < 12; j++) {
      const a = topPaddles[i];
      const b = topPaddles[j];
      comparisons.push({
        a,
        b,
        url: `/compare/${paddleSlug(a.brand, a.name)}-vs-${paddleSlug(b.brand, b.name)}`,
      });
    }
  }
  return comparisons;
}

export default function CompareIndexPage() {
  const comparisons = getPopularComparisons();

  return (
    <div className="space-y-10">
      <section className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black">Compare Pickleball Paddles</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Compare any two paddles head-to-head with lab-tested specs, pros, cons, and our analysis.
          Pick a popular comparison below or build your own from the{" "}
          <Link href="/database" className="text-primary hover:underline">paddle database</Link>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">Popular Comparisons</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {comparisons.map((comp) => (
            <Link
              key={comp.url}
              href={comp.url}
              className="border rounded-lg p-4 hover:border-primary/40 hover:bg-primary/5 transition-all group"
            >
              <div className="font-bold text-sm group-hover:text-primary transition-colors">
                {comp.a.brand} {comp.a.name}
                <span className="text-muted-foreground font-normal mx-2">vs</span>
                {comp.b.brand} {comp.b.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ${comp.a.price} vs ${comp.b.price}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="text-center border rounded-lg p-8 bg-primary/5 border-primary/20">
        <h2 className="text-xl font-black">Need a personalized recommendation?</h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Instead of comparing two paddles, let our algorithm find the best one for you from all 727 in our database.
        </p>
        <div className="mt-4">
          <Button asChild className="gap-1.5">
            <Link href="/quiz">
              Take the 2-Minute Quiz
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
