import { Paddle } from "./types";
import { paddleData } from "./paddle-data";

/* ───────────────── Fleet Stats (for percentile calculations) ───────────────── */

function computeSorted(fn: (p: Paddle) => number | null): number[] {
  return (paddleData as Paddle[])
    .map(fn)
    .filter((v): v is number => v != null && v > 0)
    .sort((a, b) => a - b);
}

function percentile(sorted: number[], value: number): number {
  let count = 0;
  for (const v of sorted) {
    if (v < value) count++;
    else break;
  }
  return Math.round((count / sorted.length) * 100);
}

const sortedPower = computeSorted((p) => p.power_mph);
const sortedPop = computeSorted((p) => p.pop_mph);
const sortedSpin = computeSorted((p) => p.spin_rpm || p.rpm);
const sortedSW = computeSorted((p) => p.swing_weight);
const sortedTW = computeSorted((p) => p.twist_weight);
const sortedWeight = computeSorted((p) => p.weight_oz);

/* ───────────────── Guide Definition ───────────────── */

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  rank: (paddles: Paddle[]) => Paddle[];
}

const allPaddles = paddleData as Paddle[];

export const guides: Guide[] = [
  {
    slug: "best-paddles-for-power",
    title: "Best Pickleball Paddles for Power",
    metaTitle: "10 Best Pickleball Paddles for Power (2025) — Lab-Tested | PickleFitter",
    description:
      "The hardest-hitting pickleball paddles ranked by lab-tested drive speed (MPH). Real data, not marketing claims.",
    intro:
      "Power matters when you want to put balls away. We ranked every paddle by lab-tested drive speed — not manufacturer claims — to find the ones that actually hit hardest. These are the top 10.",
    rank: (paddles) =>
      paddles
        .filter((p) => p.power_mph != null && p.power_mph > 0)
        .sort((a, b) => b.power_mph! - a.power_mph!),
  },
  {
    slug: "best-paddles-for-control",
    title: "Best Pickleball Paddles for Control",
    metaTitle: "10 Best Pickleball Paddles for Control (2025) — Lab-Tested | PickleFitter",
    description:
      "Top control-oriented pickleball paddles with high stability, thick cores, and soft feel. Ranked by twist weight and touch.",
    intro:
      "Control paddles prioritize placement over power. We looked for thick cores (16mm+), high twist weight for stability, and moderate pop — paddles that reward touch and consistency over brute force.",
    rank: (paddles) =>
      paddles
        .filter(
          (p) =>
            p.core_thickness_mm != null &&
            p.core_thickness_mm >= 16 &&
            percentile(sortedTW, p.twist_weight) >= 50
        )
        .sort((a, b) => b.twist_weight - a.twist_weight),
  },
  {
    slug: "best-paddles-for-spin",
    title: "Best Pickleball Paddles for Spin",
    metaTitle: "10 Best Pickleball Paddles for Spin (2025) — Lab-Tested RPM | PickleFitter",
    description:
      "The highest-spin pickleball paddles ranked by measured RPM. Lab-tested spin rates, not surface texture marketing.",
    intro:
      "Spin lets you curve serves, dip third shots, and add kick to volleys. We ranked paddles by actual measured RPM from lab testing to find the ones that generate the most spin.",
    rank: (paddles) =>
      paddles
        .filter((p) => (p.spin_rpm || p.rpm) != null && (p.spin_rpm || p.rpm)! > 0)
        .sort((a, b) => (b.spin_rpm || b.rpm || 0) - (a.spin_rpm || a.rpm || 0)),
  },
  {
    slug: "best-paddles-for-beginners",
    title: "Best Pickleball Paddles for Beginners",
    metaTitle: "10 Best Pickleball Paddles for Beginners (2025) | PickleFitter",
    description:
      "Forgiving, stable pickleball paddles ideal for new players. High twist weight and thick cores for a large sweet spot.",
    intro:
      "As a beginner, you want a paddle that's forgiving on off-center hits and easy to control. That means high twist weight (stability) and a thick core (large sweet spot). These paddles make learning easier.",
    rank: (paddles) =>
      paddles
        .filter(
          (p) =>
            p.core_thickness_mm != null &&
            p.core_thickness_mm >= 16 &&
            percentile(sortedTW, p.twist_weight) >= 50
        )
        .sort((a, b) => {
          const twA = percentile(sortedTW, a.twist_weight);
          const twB = percentile(sortedTW, b.twist_weight);
          // Prefer high twist weight, then lower price for beginners
          if (twB !== twA) return twB - twA;
          return a.price - b.price;
        }),
  },
  {
    slug: "best-paddles-for-advanced-players",
    title: "Best Pickleball Paddles for Advanced Players",
    metaTitle: "10 Best Pickleball Paddles for Advanced Players (2025) | PickleFitter",
    description:
      "High-performance pickleball paddles for advanced and tournament players. Elite and High firepower tiers ranked by power.",
    intro:
      "Advanced players can handle extra pace and want a paddle that rewards clean technique. We filtered for Elite and High firepower tiers — paddles with serious drive speed that competitive players actually use.",
    rank: (paddles) =>
      paddles
        .filter(
          (p) =>
            p.firepower_tier != null &&
            (p.firepower_tier.includes("Elite") || p.firepower_tier.includes("High")) &&
            p.power_mph != null
        )
        .sort((a, b) => b.power_mph! - a.power_mph!),
  },
  {
    slug: "best-paddles-for-tennis-players",
    title: "Best Pickleball Paddles for Tennis Players",
    metaTitle: "10 Best Pickleball Paddles for Tennis Players (2025) | PickleFitter",
    description:
      "Pickleball paddles that feel familiar to tennis players. Higher swing weight, longer grips, and familiar feel.",
    intro:
      "Coming from tennis, you're used to heavier racquets with longer handles. These paddles have above-average swing weight and 5.5\"+ grips that feel natural for tennis converts — no adjustment period.",
    rank: (paddles) =>
      paddles
        .filter(
          (p) =>
            percentile(sortedSW, p.swing_weight) >= 55 &&
            p.grip_length != null &&
            p.grip_length >= 5.5
        )
        .sort((a, b) => {
          // Sort by swing weight (familiar heft), then grip length
          if (b.swing_weight !== a.swing_weight) return b.swing_weight - a.swing_weight;
          return (b.grip_length || 0) - (a.grip_length || 0);
        }),
  },
  {
    slug: "best-paddles-for-tennis-elbow",
    title: "Best Pickleball Paddles for Tennis Elbow",
    metaTitle: "10 Best Pickleball Paddles for Tennis Elbow & Arm Issues (2025) | PickleFitter",
    description:
      "Arm-friendly pickleball paddles for players with tennis elbow or joint issues. Thick cores and lightweight builds that reduce vibration.",
    intro:
      "Tennis elbow and arm pain can end your season. These paddles combine thick cores (16mm+) that absorb vibration with lightweight builds under 7.9 oz to minimize strain. Arm protection without giving up playability.",
    rank: (paddles) =>
      paddles
        .filter(
          (p) =>
            p.core_thickness_mm != null &&
            p.core_thickness_mm >= 16 &&
            p.weight_oz <= 7.9
        )
        .sort((a, b) => {
          // Thicker core first, then lighter weight
          if (b.core_thickness_mm! !== a.core_thickness_mm!) return b.core_thickness_mm! - a.core_thickness_mm!;
          return a.weight_oz - b.weight_oz;
        }),
  },
  {
    slug: "best-lightweight-paddles",
    title: "Best Lightweight Pickleball Paddles",
    metaTitle: "10 Best Lightweight Pickleball Paddles (2025) — Under 7.5 oz | PickleFitter",
    description:
      "The lightest pickleball paddles for quick hands and reduced fatigue. Sorted by weight with full specs.",
    intro:
      "Lighter paddles mean faster reactions at the kitchen and less fatigue over long sessions. We sorted every paddle by weight to find the lightest options that still deliver solid performance.",
    rank: (paddles) =>
      paddles
        .filter((p) => percentile(sortedWeight, p.weight_oz) <= 25)
        .sort((a, b) => a.weight_oz - b.weight_oz),
  },
  {
    slug: "best-paddles-under-100",
    title: "Best Pickleball Paddles Under $100",
    metaTitle: "10 Best Pickleball Paddles Under $100 (2025) | PickleFitter",
    description:
      "Top-performing pickleball paddles under $100. Budget-friendly picks ranked by overall quality from lab data.",
    intro:
      "You don't need to spend $200+ to get a good paddle. We filtered to paddles under $100 and ranked them by a combination of power, spin, and stability — the best bang for your buck.",
    rank: (paddles) =>
      paddles
        .filter((p) => p.price > 0 && p.price <= 100)
        .sort((a, b) => {
          const scoreA = qualityScore(a);
          const scoreB = qualityScore(b);
          return scoreB - scoreA;
        }),
  },
  {
    slug: "best-paddles-under-150",
    title: "Best Pickleball Paddles Under $150",
    metaTitle: "10 Best Pickleball Paddles Under $150 (2025) | PickleFitter",
    description:
      "Best pickleball paddles under $150 ranked by lab-tested performance. Mid-range paddles that punch above their price.",
    intro:
      "The $100-150 range is the sweet spot for quality without overpaying. These paddles offer lab-tested performance that rivals premium options at a fraction of the cost.",
    rank: (paddles) =>
      paddles
        .filter((p) => p.price > 0 && p.price <= 150)
        .sort((a, b) => {
          const scoreA = qualityScore(a);
          const scoreB = qualityScore(b);
          return scoreB - scoreA;
        }),
  },
  {
    slug: "best-elongated-paddles",
    title: "Best Elongated Pickleball Paddles",
    metaTitle: "10 Best Elongated Pickleball Paddles (2025) — Extra Reach | PickleFitter",
    description:
      "Top elongated pickleball paddles for extra reach and singles play. Ranked by power and swing weight.",
    intro:
      "Elongated paddles give you extra reach on defense, overheads, and two-handed backhands — a big advantage in singles. We ranked the best elongated options by power and swing weight for driving games.",
    rank: (paddles) =>
      paddles
        .filter((p) => p.shape === "Elongated")
        .sort((a, b) => {
          // Sort by power if available, then swing weight
          if (a.power_mph && b.power_mph) return b.power_mph - a.power_mph;
          if (b.power_mph) return 1;
          if (a.power_mph) return -1;
          return b.swing_weight - a.swing_weight;
        }),
  },
  {
    slug: "best-thermoformed-paddles",
    title: "Best Thermoformed Pickleball Paddles",
    metaTitle: "10 Best Thermoformed Pickleball Paddles (2025) — Gen 3 & Gen 4 | PickleFitter",
    description:
      "Top thermoformed (Gen 3 & Gen 4) pickleball paddles ranked by lab-tested power. The latest paddle technology.",
    intro:
      "Thermoformed paddles (Gen 3 and Gen 4) use heat-molded construction for a stiffer, more consistent feel with more power. They've taken over competitive play — here are the best ones.",
    rank: (paddles) =>
      paddles
        .filter(
          (p) =>
            p.build_style != null &&
            (p.build_style.includes("Gen 3") || p.build_style.includes("Gen 4"))
        )
        .sort((a, b) => {
          if (a.power_mph && b.power_mph) return b.power_mph - a.power_mph;
          if (b.power_mph) return 1;
          if (a.power_mph) return -1;
          return b.swing_weight - a.swing_weight;
        }),
  },
];

/** Composite quality score for budget rankings */
function qualityScore(p: Paddle): number {
  let score = 0;
  if (p.power_mph) score += percentile(sortedPower, p.power_mph);
  if (p.spin_rpm || p.rpm) score += percentile(sortedSpin, p.spin_rpm || p.rpm || 0);
  if (p.pop_mph) score += percentile(sortedPop, p.pop_mph);
  score += percentile(sortedTW, p.twist_weight);
  return score;
}

/** Get a guide's top 10 paddles */
export function getGuideRanking(guide: Guide): Paddle[] {
  return guide.rank(allPaddles).slice(0, 10);
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
