import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, FlaskConical, Layers, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About PickleFitter — How We Recommend Pickleball Paddles | PickleFitter",
  description:
    "PickleFitter is a free, data-driven pickleball paddle recommendation engine. We use lab-tested performance data from 727 paddles scored across 13 dimensions to match players to their ideal paddle.",
  alternates: { canonical: "https://picklefitter.com/about" },
  openGraph: {
    title: "About PickleFitter — How We Recommend Pickleball Paddles",
    description:
      "Free, data-driven paddle recommendations using lab-tested data from 727 paddles. No sponsored picks — just real data.",
    url: "https://picklefitter.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <section className="text-center">
        <h1 className="text-2xl sm:text-3xl font-black">About PickleFitter</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed max-w-2xl mx-auto">
          PickleFitter is a free, data-driven pickleball paddle recommendation engine.
          We match players to paddles using lab-tested performance data — not marketing claims,
          not sponsorship deals, not gut feel.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">Why We Built This</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            Choosing a pickleball paddle is overwhelming. There are hundreds of options, and most
            &ldquo;best paddle&rdquo; lists are driven by affiliate revenue or manufacturer relationships —
            not objective data. Specs are inconsistent across brands, and terms like &ldquo;power&rdquo;
            and &ldquo;control&rdquo; mean different things to different people.
          </p>
          <p>
            We built PickleFitter to solve this. Our recommendation engine scores every paddle across
            13 weighted dimensions using lab-tested data from Pickleball Effect, then matches those
            scores to your play style, skill level, and preferences. No paddle is ever promoted or
            demoted based on anything other than the data.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">How It Works</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: Database,
              title: "727 Paddles",
              desc: "Every major brand and model in our database with standardized specs, prices, and availability.",
            },
            {
              icon: FlaskConical,
              title: "Lab-Tested Data",
              desc: "Power (MPH), spin (RPM), and pop data from Pickleball Effect's lab testing — not manufacturer claims.",
            },
            {
              icon: Layers,
              title: "13 Scoring Dimensions",
              desc: "Swing weight, twist weight, power, spin, control, stability, comfort, feel, value, and more — each weighted to your profile.",
            },
            {
              icon: Target,
              title: "Profile Matching",
              desc: "Your quiz answers create a player profile. The engine scores every paddle against your profile and ranks them by match percentage.",
            },
          ].map((item) => (
            <div key={item.title} className="border rounded-lg p-5">
              <item.icon className="w-5 h-5 text-primary mb-2" />
              <div className="font-bold text-sm mb-1">{item.title}</div>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">Our Data Sources</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Pickleball Effect</strong> — Lab-tested power (MPH),
            pop (MPH), and spin (RPM) data from controlled testing conditions. This is the most
            comprehensive independent paddle testing dataset available.
          </p>
          <p>
            <strong className="text-foreground">Manufacturer Specs</strong> — Weight, dimensions,
            core thickness, face material, grip length, and shape data sourced directly from
            manufacturer specifications and verified against lab measurements.
          </p>
          <p>
            <strong className="text-foreground">Swing Weight & Twist Weight</strong> — Measured with
            RDC-calibrated instruments, these are the two most important specs for predicting how a
            paddle feels in your hand and performs on court.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">What Makes Us Different</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">No sponsored picks.</strong> Every recommendation
            comes from the algorithm. We include affiliate links to help cover hosting costs, but
            they never influence which paddle ranks where.
          </p>
          <p>
            <strong className="text-foreground">Real data, not reviews.</strong> We don&apos;t write
            subjective reviews. Every paddle&apos;s pros, cons, and &ldquo;best for&rdquo; tags are
            generated algorithmically from percentile analysis against the entire fleet of 727
            paddles.
          </p>
          <p>
            <strong className="text-foreground">Transparent methodology.</strong> Our scoring engine
            is deterministic — the same inputs always produce the same outputs.
            <Link href="/methodology" className="text-primary hover:underline ml-1">
              Read how it works.
            </Link>
          </p>
        </div>
      </section>

      <section className="text-center border rounded-lg p-8 bg-primary/5 border-primary/20">
        <h2 className="text-xl font-black">Ready to find your paddle?</h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Take our 2-minute quiz and get matched to your ideal paddle from all 727 in our database.
        </p>
        <div className="mt-4">
          <Button asChild className="gap-1.5">
            <Link href="/quiz">
              Take the Quiz
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
