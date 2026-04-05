"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useEffect, useRef } from "react";
import { Paddle, PaddleScore } from "@/lib/types";
import { paddleData } from "@/lib/paddle-data";
import { LeadTapeOptimizer } from "@/components/LeadTapeOptimizer";
import { generatePros, generateCons, generateBestFor, getProPlayers, getSpecVerdict } from "@/lib/paddle-analysis";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShoppingCart, ShieldCheck, Zap, Target, Wind, Ruler, Weight, CircleDot, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paddleSlug, selectBestLink } from "@/lib/utils";

export default function PaddleDetail() {
  const params = useParams();
  const slug = params.slug as string;

  const paddle: PaddleScore | null = useMemo(() => {
    const found = (paddleData as Paddle[]).find(
      (p) => paddleSlug(p.brand, p.name) === slug
    );
    if (!found) return null;
    return {
      ...found,
      matchPercentage: 0,
      reason: "",
      affiliateLink: "",
    };
  }, [slug]);

  const analysis = useMemo(() => {
    if (!paddle) return null;
    return {
      pros: generatePros(paddle),
      cons: generateCons(paddle),
      bestFor: generateBestFor(paddle),
      proPlayers: getProPlayers(paddle.id),
      verdict: getSpecVerdict(paddle),
    };
  }, [paddle]);

  const buyLink = paddle ? selectBestLink(paddle) : "";

  // Sticky buy CTA: show when hero buy button scrolls out of view
  const heroBuyRef = useRef<HTMLDivElement>(null);
  const [showStickyBuy, setShowStickyBuy] = useState(false);

  useEffect(() => {
    if (!heroBuyRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBuy(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(heroBuyRef.current);
    return () => observer.disconnect();
  }, [paddle]);

  if (!paddle || !analysis) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-black">Paddle not found</h1>
        <Link href="/database" className="text-primary hover:underline mt-4 inline-block">
          Back to database
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Back nav */}
      <Link
        href="/database"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to database
      </Link>

      {/* ── Hero Section ── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{paddle.brand}</div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">{paddle.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">{analysis.verdict}</p>
          </div>
          <div ref={heroBuyRef} className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <div className="text-3xl font-black text-primary">${paddle.price}</div>
            {buyLink && (
              <Button asChild className="gap-1.5">
                <a href={buyLink} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="w-4 h-4" />
                  Buy Now
                </a>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/quiz">Find Your Match</Link>
            </Button>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-2 mt-4">
          {paddle.shape && (
            <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-full">{paddle.shape}</span>
          )}
          {paddle.core_thickness_mm && (
            <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-full">{paddle.core_thickness_mm}mm core</span>
          )}
          <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-full">{paddle.face_material}</span>
          {paddle.build_style && (
            <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-full">{paddle.build_style}</span>
          )}
          {paddle.firepower_tier && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              paddle.firepower_tier.includes("Elite") ? "bg-primary/15 text-primary" :
              paddle.firepower_tier.includes("High") ? "bg-blue-100 text-blue-700" :
              paddle.firepower_tier.includes("Balanced") ? "bg-gray-100 text-gray-700" :
              paddle.firepower_tier.includes("Control") ? "bg-purple-100 text-purple-700" :
              "bg-orange-100 text-orange-700"
            }`}>
              {paddle.firepower_tier}
            </span>
          )}
          {paddle.paddle_type && (
            <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-full">{paddle.paddle_type}</span>
          )}
        </div>
      </section>

      {/* ── Specs Grid ── */}
      <section>
        <h2 className="text-xl font-black mb-4">Specs & Lab Data</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <SpecCard icon={<Zap className="w-4 h-4" />} label="Swing Weight" value={String(paddle.swing_weight)} sub={paddle.sw_percentile ? `${paddle.sw_percentile}th percentile` : undefined} />
          <SpecCard icon={<ShieldCheck className="w-4 h-4" />} label="Twist Weight" value={String(paddle.twist_weight)} sub={paddle.tw_percentile ? `${paddle.tw_percentile}th percentile` : undefined} />
          <SpecCard icon={<Weight className="w-4 h-4" />} label="Weight" value={`${parseFloat(paddle.weight_oz.toFixed(1))} oz`} />
          {paddle.core_thickness_mm && (
            <SpecCard icon={<Layers className="w-4 h-4" />} label="Core Thickness" value={`${paddle.core_thickness_mm}mm`} />
          )}
          {paddle.power_mph && (
            <SpecCard icon={<Zap className="w-4 h-4" />} label="Power" value={`${paddle.power_mph} MPH`} sub={paddle.power_percentile ? `${paddle.power_percentile}th percentile` : undefined} highlight />
          )}
          {paddle.pop_mph && (
            <SpecCard icon={<Target className="w-4 h-4" />} label="Pop" value={`${paddle.pop_mph} MPH`} sub={paddle.pop_percentile ? `${paddle.pop_percentile}th percentile` : undefined} highlight />
          )}
          {(paddle.spin_rpm || paddle.rpm) && (
            <SpecCard icon={<Wind className="w-4 h-4" />} label="Spin" value={`${paddle.spin_rpm || paddle.rpm} RPM`} sub={paddle.spin_rating || undefined} highlight />
          )}
          {paddle.balance && (
            <SpecCard icon={<CircleDot className="w-4 h-4" />} label="Balance" value={`${paddle.balance}mm`} />
          )}
          {paddle.grip_length && (
            <SpecCard icon={<Ruler className="w-4 h-4" />} label="Grip Length" value={`${paddle.grip_length}"`} />
          )}
          {paddle.grip_thickness && (
            <SpecCard icon={<Ruler className="w-4 h-4" />} label="Grip Size" value={`${paddle.grip_thickness}"`} />
          )}
        </div>
      </section>

      {/* ── Pros & Cons ── */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="border rounded-lg p-5">
          <h2 className="text-lg font-black mb-3 text-primary">Pros</h2>
          <ul className="space-y-2">
            {analysis.pros.map((pro, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-primary font-bold shrink-0">+</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border rounded-lg p-5">
          <h2 className="text-lg font-black mb-3 text-orange-600">Cons</h2>
          <ul className="space-y-2">
            {analysis.cons.map((con, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-orange-500 font-bold shrink-0">&minus;</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Best For ── */}
      {analysis.bestFor.length > 0 && (
        <section>
          <h2 className="text-xl font-black mb-4">Best For</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {analysis.bestFor.map((tag) => (
              <div key={tag.label} className="border rounded-lg p-4 bg-primary/5 border-primary/20">
                <div className="font-bold text-sm">{tag.label}</div>
                <p className="text-sm text-muted-foreground mt-1">{tag.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Pro Players ── */}
      {analysis.proPlayers.length > 0 && (
        <section>
          <h2 className="text-xl font-black mb-4">Pro Players</h2>
          <div className="flex flex-wrap gap-3">
            {analysis.proPlayers.map((player) => (
              <div key={player.name} className="border rounded-lg px-4 py-3 bg-card">
                <div className="font-bold text-sm">{player.name}</div>
                {player.note && (
                  <div className="text-xs text-muted-foreground mt-0.5 capitalize">{player.note}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── YouTube Review ── */}
      {paddle.youtube_review && (
        <section>
          <h2 className="text-xl font-black mb-4">Video Review</h2>
          <a
            href={paddle.youtube_review}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            Watch review on YouTube
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </section>
      )}

      {/* ── Lead Tape Optimizer ── */}
      <section>
        <LeadTapeOptimizer selectedPaddle={paddle} />
      </section>

      {/* Sticky buy bar */}
      {buyLink && showStickyBuy && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t shadow-lg">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{paddle.brand} {paddle.name}</div>
              <div className="text-primary font-black">${paddle.price}</div>
            </div>
            <Button asChild className="gap-1.5 shrink-0">
              <a href={buyLink} target="_blank" rel="noopener noreferrer">
                <ShoppingCart className="w-4 h-4" />
                Buy Now
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────── Spec Card ───────────────── */

function SpecCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-primary/30 bg-primary/5" : ""}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
