"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthorBranding } from "@/components/AuthorBranding";

export function LandingHero() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Find Your Perfect Paddle
          <br />
          <span className="text-primary">in 2 Minutes</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Data-driven recommendations based on swing physics, not marketing.
          Matched to YOUR play style, swing speed, and budget.
        </p>

        <div className="flex justify-center">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/quiz">Take the Quiz</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-sm">
          <div className="bg-card border rounded-lg p-4">
            <div className="font-bold mb-1">Swing-Matched</div>
            <p className="text-muted-foreground">
              Paddles matched to YOUR swing speed and play style
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="font-bold mb-1">Spec-Driven</div>
            <p className="text-muted-foreground">
              See exact swing weight &amp; twist weight specs
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="font-bold mb-1">Lead Tape Guide</div>
            <p className="text-muted-foreground">
              Get custom tungsten tape placement for your paddle
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <AuthorBranding />
        </div>
      </div>
    </div>
  );
}
