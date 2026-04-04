import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How We Rank Paddles — Scoring Methodology | PickleFitter",
  description:
    "PickleFitter scores every paddle across 13 weighted dimensions including swing weight, twist weight, power, spin, control, stability, and comfort. Learn how our recommendation algorithm works.",
  alternates: { canonical: "https://picklefitter.com/methodology" },
  openGraph: {
    title: "How We Rank Paddles — PickleFitter Scoring Methodology",
    description:
      "Our 13-dimension scoring engine explained. Lab-tested data, transparent weights, deterministic rankings.",
    url: "https://picklefitter.com/methodology",
  },
};

export default function MethodologyPage() {
  const dimensions = [
    { name: "Swing Weight", desc: "How heavy the paddle feels when you swing it. Measured in RDC units. Higher = more momentum and power, lower = faster hand speed. Matched to your swing speed preference." },
    { name: "Twist Weight", desc: "Resistance to twisting on off-center hits. Higher twist weight = larger effective sweet spot and more stability. Critical for doubles players and beginners." },
    { name: "Static Weight", desc: "Overall paddle weight in ounces. Lighter paddles reduce fatigue and enable faster reactions. Heavier paddles generate more power passively." },
    { name: "Power (MPH)", desc: "Lab-tested ball speed on drives, measured by Pickleball Effect. Indicates how fast the ball leaves the paddle face on full swings." },
    { name: "Pop (MPH)", desc: "Lab-tested ball speed on short punch shots. Important for kitchen play and blocking where you can't take a full swing." },
    { name: "Spin (RPM)", desc: "Lab-tested spin rate. Indicates how much grip the face surface provides for topspin, slice, and serve rotation." },
    { name: "Core Thickness", desc: "Measured in millimeters. Thicker cores (16mm+) absorb more energy for a softer feel and better control. Thinner cores (14mm or less) return more energy for power." },
    { name: "Shape", desc: "Standard (widest sweet spot), elongated (more reach), hybrid, and teardrop shapes each suit different play styles and grip preferences." },
    { name: "Build Construction", desc: "Gen 1 through Gen 4 build styles. Thermoformed (Gen 3/4) paddles use heat-molded construction for a stiffer, more consistent response." },
    { name: "Face Material", desc: "Carbon fiber, fiberglass, and composite faces each produce different feel, spin, and durability characteristics." },
    { name: "Comfort & Arm Friendliness", desc: "A composite score factoring core thickness, weight, swing weight, and construction to predict vibration and impact on joints." },
    { name: "Value", desc: "Performance-per-dollar ratio. Ensures budget-friendly paddles aren't unfairly penalized against premium options." },
    { name: "Grip Fit", desc: "Grip length and thickness matched to hand size preference. Longer grips suit two-handed backhands and tennis converts." },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <section className="text-center">
        <h1 className="text-2xl sm:text-3xl font-black">How We Rank Paddles</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed max-w-2xl mx-auto">
          Every paddle recommendation on PickleFitter comes from a scoring algorithm, not editorial
          opinion. Here&apos;s exactly how it works.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">The Process</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">1. You create a player profile.</strong> When you take
            the quiz, your answers — play style, skill level, swing speed, game type, preferences —
            are combined into a weighted player profile. Each answer adjusts the importance of
            different scoring dimensions.
          </p>
          <p>
            <strong className="text-foreground">2. Every paddle is scored against your profile.</strong> The
            engine evaluates all 727 paddles across 13 dimensions. Each dimension gets a score from
            0-100 based on how well the paddle matches your profile. Dimensions are weighted
            differently depending on your answers — an aggressive singles player weights power and
            spin heavily, while a doubles control player weights stability and comfort.
          </p>
          <p>
            <strong className="text-foreground">3. Paddles are ranked by total weighted score.</strong> The
            final match percentage reflects how well a paddle fits your specific profile across all
            13 dimensions combined. The top paddle is your best overall match, not just the best in
            one category.
          </p>
          <p>
            <strong className="text-foreground">4. Pros, cons, and &ldquo;best for&rdquo; tags are generated.</strong> These
            aren&apos;t written by hand. They&apos;re computed from each paddle&apos;s percentile
            rankings against the full fleet. A paddle in the 90th percentile for power gets a
            &ldquo;power&rdquo; pro; one in the 10th percentile gets a con.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">The 13 Scoring Dimensions</h2>
        <div className="space-y-3">
          {dimensions.map((dim, i) => (
            <div key={dim.name} className="border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <h3 className="font-bold text-sm">{dim.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed ml-8">{dim.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">What About Affiliate Links?</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            PickleFitter includes affiliate links to help cover hosting costs. These links have
            <strong className="text-foreground"> zero influence on rankings</strong>. Whether a paddle
            has an affiliate link, an Amazon link, or no link at all, it gets the same score. The
            algorithm doesn&apos;t know or care which paddles have purchase links.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">Data Quality & Limitations</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            Not every paddle has lab-tested data. About 326 of 727 paddles have Pickleball Effect
            lab data for power, pop, and spin. Paddles without lab data are scored on their
            available specs (swing weight, twist weight, core thickness, etc.) and receive neutral
            scores for missing dimensions. This means lab-tested paddles tend to have more
            differentiated rankings.
          </p>
          <p>
            Our data is updated as new paddles are released and new lab tests are published.
            Paddle specs can change between production runs — our data reflects the most recent
            information available.
          </p>
        </div>
      </section>

      <section className="text-center border rounded-lg p-8 bg-primary/5 border-primary/20">
        <h2 className="text-xl font-black">See it in action</h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Take the quiz and watch the engine match you to your ideal paddle in under 2 minutes.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Button asChild className="gap-1.5">
            <Link href="/quiz">
              Take the Quiz
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/best">
              Browse Guides
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
