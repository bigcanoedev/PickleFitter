"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, ArrowRight, Zap, ShieldCheck, Wind, Weight, Layers, Target, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Paddle } from "@/lib/types";
import { paddleData } from "@/lib/paddle-data";
import { paddleSlug, selectBestLink } from "@/lib/utils";
import { generatePros, generateCons, generateBestFor, getSpecVerdict } from "@/lib/paddle-analysis";

function findPaddle(slug: string): Paddle | undefined {
  return (paddleData as Paddle[]).find(
    (p) => paddleSlug(p.brand, p.name) === slug
  );
}

export default function CompareClient({ slugA, slugB }: { slugA: string; slugB: string }) {
  const paddleA = useMemo(() => findPaddle(slugA), [slugA]);
  const paddleB = useMemo(() => findPaddle(slugB), [slugB]);

  if (!paddleA || !paddleB) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-black">Paddle not found</h1>
        <Link href="/database" className="text-primary hover:underline mt-4 inline-block">
          Back to database
        </Link>
      </div>
    );
  }

  const nameA = `${paddleA.brand} ${paddleA.name}`;
  const nameB = `${paddleB.brand} ${paddleB.name}`;
  const analysisA = {
    pros: generatePros(paddleA),
    cons: generateCons(paddleA),
    bestFor: generateBestFor(paddleA),
    verdict: getSpecVerdict(paddleA),
  };
  const analysisB = {
    pros: generatePros(paddleB),
    cons: generateCons(paddleB),
    bestFor: generateBestFor(paddleB),
    verdict: getSpecVerdict(paddleB),
  };

  const specs: { label: string; icon: React.ReactNode; getVal: (p: Paddle) => string | null; higherIsBetter?: boolean }[] = [
    { label: "Price", icon: null, getVal: (p) => `$${p.price}`, higherIsBetter: false },
    { label: "Swing Weight", icon: <Zap className="w-3.5 h-3.5" />, getVal: (p) => String(p.swing_weight) },
    { label: "Twist Weight", icon: <ShieldCheck className="w-3.5 h-3.5" />, getVal: (p) => String(p.twist_weight), higherIsBetter: true },
    { label: "Weight", icon: <Weight className="w-3.5 h-3.5" />, getVal: (p) => `${parseFloat(p.weight_oz.toFixed(1))} oz` },
    { label: "Core", icon: <Layers className="w-3.5 h-3.5" />, getVal: (p) => p.core_thickness_mm ? `${p.core_thickness_mm}mm` : null },
    { label: "Power", icon: <Zap className="w-3.5 h-3.5" />, getVal: (p) => p.power_mph ? `${p.power_mph} MPH` : null, higherIsBetter: true },
    { label: "Pop", icon: <Target className="w-3.5 h-3.5" />, getVal: (p) => p.pop_mph ? `${p.pop_mph} MPH` : null, higherIsBetter: true },
    { label: "Spin", icon: <Wind className="w-3.5 h-3.5" />, getVal: (p) => (p.spin_rpm || p.rpm) ? `${p.spin_rpm || p.rpm} RPM` : null, higherIsBetter: true },
    { label: "Shape", icon: null, getVal: (p) => p.shape },
    { label: "Face", icon: null, getVal: (p) => p.face_material },
    { label: "Build", icon: null, getVal: (p) => p.build_style },
    { label: "Balance", icon: <CircleDot className="w-3.5 h-3.5" />, getVal: (p) => p.balance ? `${p.balance}mm` : null },
  ];

  return (
    <div className="space-y-10">
      <Link
        href="/database"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to database
      </Link>

      {/* Header */}
      <section className="text-center">
        <h1 className="text-xl sm:text-2xl font-black">
          {nameA} <span className="text-muted-foreground font-normal">vs</span> {nameB}
        </h1>
        <p className="text-muted-foreground mt-2">Side-by-side comparison with lab-tested specs</p>
      </section>

      {/* Specs comparison table */}
      <section>
        <h2 className="text-lg font-black mb-4">Specs Comparison</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 bg-muted/50 font-bold text-sm">
            <div className="p-3">Spec</div>
            <div className="p-3 text-center border-l">{paddleA.brand} {paddleA.name}</div>
            <div className="p-3 text-center border-l">{paddleB.brand} {paddleB.name}</div>
          </div>
          {specs.map((spec) => {
            const valA = spec.getVal(paddleA);
            const valB = spec.getVal(paddleB);
            if (!valA && !valB) return null;
            return (
              <div key={spec.label} className="grid grid-cols-3 text-sm border-t">
                <div className="p-3 flex items-center gap-1.5 text-muted-foreground">
                  {spec.icon}
                  {spec.label}
                </div>
                <div className="p-3 text-center border-l font-medium">{valA || "—"}</div>
                <div className="p-3 text-center border-l font-medium">{valB || "—"}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pros & Cons side by side */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-black">{nameA}</h2>
          <p className="text-sm text-muted-foreground">{analysisA.verdict}</p>
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-sm text-primary mb-2">Pros</h3>
            <ul className="space-y-1.5">
              {analysisA.pros.map((pro, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-primary font-bold shrink-0">+</span>
                  <span className="text-muted-foreground">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-sm text-orange-600 mb-2">Cons</h3>
            <ul className="space-y-1.5">
              {analysisA.cons.map((con, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-orange-500 font-bold shrink-0">&minus;</span>
                  <span className="text-muted-foreground">{con}</span>
                </li>
              ))}
            </ul>
          </div>
          {analysisA.bestFor.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-2">Best For</h3>
              <div className="flex flex-wrap gap-1.5">
                {analysisA.bestFor.map((tag) => (
                  <span key={tag.label} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {selectBestLink(paddleA) && (
              <Button asChild size="sm" className="gap-1.5">
                <a href={selectBestLink(paddleA)} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Buy {paddleA.name}
                </a>
              </Button>
            )}
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link href={`/paddle/${slugA}`}>
                Full details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-black">{nameB}</h2>
          <p className="text-sm text-muted-foreground">{analysisB.verdict}</p>
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-sm text-primary mb-2">Pros</h3>
            <ul className="space-y-1.5">
              {analysisB.pros.map((pro, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-primary font-bold shrink-0">+</span>
                  <span className="text-muted-foreground">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-sm text-orange-600 mb-2">Cons</h3>
            <ul className="space-y-1.5">
              {analysisB.cons.map((con, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-orange-500 font-bold shrink-0">&minus;</span>
                  <span className="text-muted-foreground">{con}</span>
                </li>
              ))}
            </ul>
          </div>
          {analysisB.bestFor.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-2">Best For</h3>
              <div className="flex flex-wrap gap-1.5">
                {analysisB.bestFor.map((tag) => (
                  <span key={tag.label} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {selectBestLink(paddleB) && (
              <Button asChild size="sm" className="gap-1.5">
                <a href={selectBestLink(paddleB)} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Buy {paddleB.name}
                </a>
              </Button>
            )}
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link href={`/paddle/${slugB}`}>
                Full details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center border rounded-lg p-8 bg-primary/5 border-primary/20">
        <h2 className="text-xl font-black">Not sure which is right for you?</h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Our quiz matches you to the best paddle based on your specific play style, skill level, and preferences.
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
