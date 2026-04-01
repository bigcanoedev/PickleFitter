import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { guides } from "@/lib/guides";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Best Pickleball Paddles — Top 10 Guides by Category | PickleFitter",
  description:
    "Lab-tested top 10 pickleball paddle guides for every play style, budget, and skill level. Ranked by real data from 727 paddles.",
};

export default function GuidesIndexPage() {
  return (
    <div className="space-y-10">
      <section className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black">Best Pickleball Paddles</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Top 10 rankings across {guides.length} categories — all backed by lab-tested data from 727 paddles.
          Not marketing hype.
        </p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/best/${guide.slug}`}
            className="border rounded-lg p-5 hover:border-primary/40 hover:bg-primary/5 transition-all group"
          >
            <h2 className="font-black text-lg group-hover:text-primary transition-colors">
              {guide.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {guide.description}
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-3">
              View top 10
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="text-center border rounded-lg p-8 bg-primary/5 border-primary/20">
        <h2 className="text-xl font-black">Want a recommendation just for you?</h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          These guides show the best paddles by category. Our quiz matches you to the best paddle for your specific play style across all 727 paddles.
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
