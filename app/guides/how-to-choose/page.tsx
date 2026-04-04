import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How to Choose a Pickleball Paddle - Buyer Guide 2026 | PickleFitter",
  description:
    "Learn how to choose the right pickleball paddle. Understand swing weight, twist weight, core thickness, shape, face material, and which specs matter most for your play style.",
  alternates: { canonical: "https://picklefitter.com/guides/how-to-choose" },
  openGraph: {
    title: "How to Choose a Pickleball Paddle - Buyer Guide 2026",
    description: "Everything you need to know about pickleball paddle specs and which ones matter for your game.",
    url: "https://picklefitter.com/guides/how-to-choose",
  },
};

function SpecSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="font-bold text-base">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{content}</p>
    </div>
  );
}

function PlayStyleCard({ title, desc, link }: { title: string; desc: string; link: string }) {
  return (
    <Link
      href={link}
      className="border rounded-lg p-5 hover:border-primary/40 hover:bg-primary/5 transition-all group block"
    >
      <h3 className="font-black text-sm group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5">{desc}</p>
      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2">
        See top picks <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border rounded-lg p-5">
      <h3 className="font-bold text-sm">{q}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{a}</p>
    </div>
  );
}

export default function HowToChoosePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <section className="text-center">
        <h1 className="text-2xl sm:text-3xl font-black">How to Choose a Pickleball Paddle</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed max-w-2xl mx-auto">
          With 700+ paddles on the market, picking the right one can feel impossible. This guide
          breaks down the specs that actually matter and helps you understand what to look for
          based on how you play.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">The Specs That Matter Most</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Not all specs are created equal. Here are the ones that make the biggest difference in
          how a paddle performs, ranked by importance.
        </p>
        <div className="space-y-6">
          <SpecSection
            title="1. Swing Weight"
            content="Swing weight is the single most important paddle spec. It measures how heavy a paddle feels during the swing, not on a scale but in motion. Higher swing weight (115+) generates more power. Lower swing weight (under 105) means faster hand speed. Match swing weight to your swing speed."
          />
          <SpecSection
            title="2. Twist Weight"
            content="Twist weight measures resistance to twisting on off-center hits. Higher twist weight means a bigger effective sweet spot. Crucial for beginners and doubles players. A twist weight above 7.0 is considered high stability."
          />
          <SpecSection
            title="3. Core Thickness"
            content="Core thickness is the biggest determinant of feel. Thick cores (16mm+) absorb more energy for a softer feel with more control and arm comfort. Thin cores (14mm and under) return more energy for power. Most players find 16mm to be the sweet spot."
          />
          <SpecSection
            title="4. Shape"
            content="Standard (wide body) paddles have the largest sweet spot. Elongated paddles offer more reach but a smaller sweet spot. Hybrid shapes split the difference. Doubles/control players lean standard, singles/aggressive players lean elongated."
          />
          <SpecSection
            title="5. Face Material"
            content="Carbon fiber faces provide the most spin potential and a crisp feel. Fiberglass faces are softer and more forgiving with more pop. Raw carbon fiber produces the highest spin rates in lab testing."
          />
          <SpecSection
            title="6. Build Construction"
            content="Traditional paddles (Gen 1/Gen 2) use glued construction. Thermoformed (Gen 3/Gen 4) use heat-molded construction for a stiffer, more powerful frame. Most tournament players have moved to thermoformed builds."
          />
          <SpecSection
            title="7. Weight"
            content="Total weight matters less than swing weight. Lighter paddles (under 7.5 oz) reduce fatigue. Heavier paddles (8.0+ oz) generate more passive power. Weight can be added with lead tape but not removed."
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">Choose by Play Style</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <PlayStyleCard
            title="Power Players"
            desc="Thin core (14mm), high swing weight (115+), thermoformed construction, elongated shape."
            link="/best/best-paddles-for-power"
          />
          <PlayStyleCard
            title="Control Players"
            desc="Thick core (16mm+), high twist weight, standard shape, soft feel."
            link="/best/best-paddles-for-control"
          />
          <PlayStyleCard
            title="Spin Players"
            desc="Raw carbon fiber face, high RPM, elongated or hybrid shape."
            link="/best/best-paddles-for-spin"
          />
          <PlayStyleCard
            title="Beginners"
            desc="Standard shape, 16mm core, moderate weight, high twist weight."
            link="/best/best-paddles-for-beginners"
          />
          <PlayStyleCard
            title="Tennis Converts"
            desc="Elongated shape, high swing weight, long grip, high spin."
            link="/best/best-paddles-for-tennis-players"
          />
          <PlayStyleCard
            title="Arm Pain / Tennis Elbow"
            desc="Thick core (16mm+), lower swing weight, lighter weight, soft feel."
            link="/best/best-paddles-for-tennis-elbow"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">Choose by Budget</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Under $100</strong> - Great beginner and recreational paddles.{" "}
            <Link href="/best/best-paddles-under-100" className="text-primary hover:underline">See top picks.</Link>
          </p>
          <p>
            <strong className="text-foreground">$100-$150</strong> - The sweet spot for quality without overpaying.{" "}
            <Link href="/best/best-paddles-under-150" className="text-primary hover:underline">See top picks.</Link>
          </p>
          <p>
            <strong className="text-foreground">$150-$250+</strong> - Tournament-level thermoformed paddles.{" "}
            <Link href="/best/best-thermoformed-paddles" className="text-primary hover:underline">See top picks.</Link>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <FaqItem
            q="What is the most important spec in a pickleball paddle?"
            a="Swing weight. It determines how a paddle feels during play, affecting power, maneuverability, and fatigue."
          />
          <FaqItem
            q="What pickleball paddle should a beginner buy?"
            a="Look for a standard-shaped paddle with a thick core (16mm+), moderate swing weight (100-110), and high twist weight. Budget $60-$120."
          />
          <FaqItem
            q="Does core thickness matter?"
            a="Yes. Thicker cores (16mm+) produce a softer feel with more control. Thinner cores (14mm or less) return more energy for power."
          />
          <FaqItem
            q="Thermoformed vs traditional paddles?"
            a="Thermoformed (Gen 3/4) use heat-molded construction for a sealed edge, stiffer frame, more power, and better consistency than traditional glued construction."
          />
          <FaqItem
            q="How much should I spend?"
            a="Under $100 for beginners, $100-$150 for the sweet spot, $150-$250+ for tournament-level performance."
          />
        </div>
      </section>

      <section className="text-center border rounded-lg p-8 bg-primary/5 border-primary/20">
        <h2 className="text-xl font-black">Still not sure? Let our algorithm decide.</h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Take our 2-minute quiz to get matched from all 727 paddles in our database.
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
