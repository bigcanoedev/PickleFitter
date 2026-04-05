"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingCart, Zap, ShieldCheck, Wind, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Paddle } from "@/lib/types";
import { paddleSlug, selectBestLink } from "@/lib/utils";
import { getGuideBySlug, getGuideRanking, type GuideFAQ } from "@/lib/guides";
import { generatePros, generateCons } from "@/lib/paddle-analysis";

export default function GuideContent({ slug }: { slug: string }) {
  const guide = useMemo(() => getGuideBySlug(slug), [slug]);
  const paddles = useMemo(() => (guide ? getGuideRanking(guide) : []), [guide]);
  const quizLink = useMemo(() => {
    if (!guide?.quizPrefill) return "/quiz";
    const params = new URLSearchParams(guide.quizPrefill);
    return `/quiz?${params.toString()}`;
  }, [guide]);

  if (!guide) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-black">Guide not found</h1>
        <Link href="/best" className="text-primary hover:underline mt-4 inline-block">
          Back to guides
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Link
        href="/best"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All guides
      </Link>

      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black">{guide.title}</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">{guide.intro}</p>
        <div className="mt-4">
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href={quizLink}>
              Want a personalized match? Find My Match
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Rankings */}
      <section className="space-y-6">
        {paddles.map((paddle, index) => (
          <PaddleCard key={paddle.id} paddle={paddle} rank={index + 1} />
        ))}
      </section>

      {/* FAQ */}
      {guide.faqs && guide.faqs.length > 0 && (
        <section>
          <h2 className="text-xl font-black mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {guide.faqs.map((faq: GuideFAQ, i: number) => (
              <div key={i} className="border rounded-lg p-5">
                <h3 className="font-bold text-sm">{faq.question}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="text-center border rounded-lg p-8 bg-primary/5 border-primary/20">
        <h2 className="text-xl font-black">Not sure which one is right for you?</h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Our quiz matches you to the best paddle based on your play style, skill level, and preferences across all 727 paddles.
        </p>
        <div className="mt-4">
          <Button asChild className="gap-1.5">
            <Link href={quizLink}>
              Find My Match
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function PaddleCard({ paddle, rank }: { paddle: Paddle; rank: number }) {
  const pros = useMemo(() => generatePros(paddle).slice(0, 3), [paddle]);
  const cons = useMemo(() => generateCons(paddle).slice(0, 2), [paddle]);
  const slug = paddleSlug(paddle.brand, paddle.name);
  const spinVal = paddle.spin_rpm || paddle.rpm;

  return (
    <div className="border rounded-lg p-5 sm:p-6 hover:border-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary font-black text-lg flex items-center justify-center">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                {paddle.brand}
              </div>
              <Link
                href={`/paddle/${slug}`}
                className="text-lg sm:text-xl font-black hover:text-primary transition-colors"
              >
                {paddle.name}
              </Link>
            </div>
            <div className="text-2xl font-black text-primary shrink-0">${paddle.price}</div>
          </div>

          {/* Key specs */}
          <div className="flex flex-wrap gap-3 mt-3">
            <SpecBadge icon={<Zap className="w-3.5 h-3.5" />} label="SW" value={String(paddle.swing_weight)} />
            <SpecBadge icon={<ShieldCheck className="w-3.5 h-3.5" />} label="TW" value={String(paddle.twist_weight)} />
            <SpecBadge icon={<Weight className="w-3.5 h-3.5" />} label="Weight" value={`${parseFloat(paddle.weight_oz.toFixed(1))} oz`} />
            {paddle.power_mph && (
              <SpecBadge icon={<Zap className="w-3.5 h-3.5" />} label="Power" value={`${paddle.power_mph} MPH`} highlight />
            )}
            {spinVal && (
              <SpecBadge icon={<Wind className="w-3.5 h-3.5" />} label="Spin" value={`${spinVal} RPM`} highlight />
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {paddle.shape && (
              <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                {paddle.shape}
              </span>
            )}
            {paddle.core_thickness_mm && (
              <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                {paddle.core_thickness_mm}mm
              </span>
            )}
            {paddle.build_style && (
              <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                {paddle.build_style}
              </span>
            )}
            {paddle.firepower_tier && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                paddle.firepower_tier.includes("Elite")
                  ? "bg-primary/15 text-primary"
                  : paddle.firepower_tier.includes("High")
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
              }`}>
                {paddle.firepower_tier}
              </span>
            )}
          </div>

          {/* Pros & Cons */}
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {pros.length > 0 && (
              <div>
                {pros.map((pro, i) => (
                  <div key={i} className="flex gap-1.5 text-sm mb-1">
                    <span className="text-primary font-bold shrink-0">+</span>
                    <span className="text-muted-foreground">{pro}</span>
                  </div>
                ))}
              </div>
            )}
            {cons.length > 0 && (
              <div>
                {cons.map((con, i) => (
                  <div key={i} className="flex gap-1.5 text-sm mb-1">
                    <span className="text-orange-500 font-bold shrink-0">&minus;</span>
                    <span className="text-muted-foreground">{con}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {selectBestLink(paddle) && (
              <Button asChild size="sm" className="gap-1.5">
                <a href={selectBestLink(paddle)} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Buy Now
                </a>
              </Button>
            )}
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link href={`/paddle/${slug}`}>
                Full specs & lead tape optimizer
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecBadge({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`inline-flex items-center gap-1 text-xs rounded-md border px-2 py-1 ${
      highlight ? "border-primary/30 bg-primary/5 text-primary" : "text-muted-foreground"
    }`}>
      {icon}
      <span className="font-medium">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
