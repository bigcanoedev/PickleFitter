import { Paddle, PlayerProfile } from "./types";
import { paddleData } from "./paddle-data";
import { getAllRanked } from "./recommendations";

/* ───────────────── Fleet Stats (for lightweight filter) ───────────────── */

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

const sortedWeight = computeSorted((p) => p.weight_oz);

/* ───────────────── Neutral Profile Defaults ───────────────── */

const NEUTRAL: PlayerProfile = {
  playStyle: "Balanced",
  skillLevel: "Intermediate",
  gameType: "Both",
  swingSpeed: "Moderate",
  frustration: "None",
  armIssues: "None",
  feelPreference: "No preference",
  currentPaddle: "",
  priorSport: "None",
  buildPreference: "No preference",
  shapePreference: "No preference",
  coreThickness: "No preference",
  spinPriority: "Medium",
  stabilityPreference: "No preference",
  handSize: "Medium",
  gripLength: "No preference",
  moistureLevel: "Medium",
  currency: "USD",
  budgetMin: 0,
  budgetMax: 999,
};

function profile(overrides: Partial<PlayerProfile>): PlayerProfile {
  return { ...NEUTRAL, ...overrides };
}

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

/* ───────────────── Archetype Profiles ───────────────── */

const POWER_PROFILE = profile({
  playStyle: "Aggressive",
  skillLevel: "Advanced",
  gameType: "Singles",
  swingSpeed: "Fast",
  frustration: "Power",
  feelPreference: "Crisp",
  coreThickness: "Thin",
});

const CONTROL_PROFILE = profile({
  playStyle: "Control",
  gameType: "Doubles",
  frustration: "Control",
  feelPreference: "Soft",
  coreThickness: "Thick",
  stabilityPreference: "Stability",
});

const SPIN_PROFILE = profile({
  frustration: "Spin",
  spinPriority: "High",
});

const BEGINNER_PROFILE = profile({
  skillLevel: "Beginner",
  swingSpeed: "Slow",
  feelPreference: "Soft",
  coreThickness: "Thick",
  spinPriority: "Low",
  stabilityPreference: "Stability",
  budgetMax: 150,
});

const ADVANCED_PROFILE = profile({
  playStyle: "Aggressive",
  skillLevel: "Advanced",
  swingSpeed: "Fast",
  feelPreference: "Crisp",
  buildPreference: "Thermoformed",
  spinPriority: "High",
});

const TENNIS_PROFILE = profile({
  playStyle: "Aggressive",
  gameType: "Singles",
  swingSpeed: "Fast",
  feelPreference: "Crisp",
  priorSport: "Tennis",
  shapePreference: "Elongated",
  coreThickness: "Thin",
  spinPriority: "High",
  gripLength: "Long",
});

const TENNIS_ELBOW_PROFILE = profile({
  playStyle: "Control",
  gameType: "Doubles",
  swingSpeed: "Slow",
  frustration: "Vibration",
  armIssues: "Serious",
  feelPreference: "Soft",
  coreThickness: "Thick",
  spinPriority: "Low",
  stabilityPreference: "Stability",
});

const LIGHTWEIGHT_PROFILE = profile({
  playStyle: "Control",
  gameType: "Doubles",
  frustration: "Fatigue",
  armIssues: "Mild",
});

const BUDGET_BEGINNER_PROFILE = profile({
  skillLevel: "Beginner",
  budgetMax: 100,
});

const BUDGET_MID_PROFILE = profile({
  budgetMax: 150,
});

const ELONGATED_PROFILE = profile({
  playStyle: "Aggressive",
  gameType: "Singles",
  swingSpeed: "Fast",
  shapePreference: "Elongated",
  spinPriority: "High",
  gripLength: "Long",
});

const THERMOFORMED_PROFILE = profile({
  playStyle: "Aggressive",
  skillLevel: "Advanced",
  swingSpeed: "Fast",
  feelPreference: "Crisp",
  buildPreference: "Thermoformed",
  spinPriority: "High",
});

/* ───────────────── Guide Definitions ───────────────── */

export const guides: Guide[] = [
  {
    slug: "best-paddles-for-power",
    title: "Best Pickleball Paddles for Power",
    metaTitle: "10 Best Pickleball Paddles for Power (2025) — Lab-Tested | PickleFitter",
    description:
      "The hardest-hitting pickleball paddles ranked by lab-tested drive speed (MPH). Real data, not marketing claims.",
    intro:
      "Power matters when you want to put balls away. We ranked every paddle using our 13-dimension scoring engine tuned for an aggressive, fast-swinging player — not just raw MPH, but the full picture of what makes a paddle hit hard.",
    rank: (paddles) => getAllRanked(POWER_PROFILE, paddles),
  },
  {
    slug: "best-paddles-for-control",
    title: "Best Pickleball Paddles for Control",
    metaTitle: "10 Best Pickleball Paddles for Control (2025) — Lab-Tested | PickleFitter",
    description:
      "Top control-oriented pickleball paddles with high stability, thick cores, and soft feel. Ranked by our recommendation engine.",
    intro:
      "Control paddles prioritize placement over power. We scored every paddle for a control-focused doubles player who values soft feel, thick cores, and stability — the full picture, not just one spec.",
    rank: (paddles) => getAllRanked(CONTROL_PROFILE, paddles),
  },
  {
    slug: "best-paddles-for-spin",
    title: "Best Pickleball Paddles for Spin",
    metaTitle: "10 Best Pickleball Paddles for Spin (2025) — Lab-Tested RPM | PickleFitter",
    description:
      "The highest-spin pickleball paddles ranked by our recommendation engine. Lab-tested spin rates and surface material analysis.",
    intro:
      "Spin lets you curve serves, dip third shots, and add kick to volleys. We scored every paddle for a spin-focused player — factoring in RPM, surface material, and overall playability.",
    rank: (paddles) => getAllRanked(SPIN_PROFILE, paddles),
  },
  {
    slug: "best-paddles-for-beginners",
    title: "Best Pickleball Paddles for Beginners",
    metaTitle: "10 Best Pickleball Paddles for Beginners (2025) | PickleFitter",
    description:
      "Forgiving, stable pickleball paddles ideal for new players. Scored for forgiveness, comfort, and value.",
    intro:
      "As a beginner, you want a paddle that's forgiving on off-center hits, comfortable to swing, and won't break the bank. We scored every paddle for a new player's needs — stability, soft feel, thick cores, and reasonable price.",
    rank: (paddles) => getAllRanked(BEGINNER_PROFILE, paddles),
  },
  {
    slug: "best-paddles-for-advanced-players",
    title: "Best Pickleball Paddles for Advanced Players",
    metaTitle: "10 Best Pickleball Paddles for Advanced Players (2025) | PickleFitter",
    description:
      "High-performance pickleball paddles for advanced and tournament players. Scored for power, spin, and thermoformed construction.",
    intro:
      "Advanced players can handle extra pace and want a paddle that rewards clean technique. We scored every paddle for a fast-swinging, aggressive player who demands thermoformed construction and high spin.",
    rank: (paddles) => getAllRanked(ADVANCED_PROFILE, paddles),
  },
  {
    slug: "best-paddles-for-tennis-players",
    title: "Best Pickleball Paddles for Tennis Players",
    metaTitle: "10 Best Pickleball Paddles for Tennis Players (2025) | PickleFitter",
    description:
      "Pickleball paddles that feel familiar to tennis players. Scored for swing weight, grip length, elongated shape, and spin.",
    intro:
      "Coming from tennis, you're used to heavier racquets with longer handles. We scored every paddle for a tennis convert — prioritizing swing weight, elongated shape, long grip, and spin potential.",
    rank: (paddles) => getAllRanked(TENNIS_PROFILE, paddles),
  },
  {
    slug: "best-paddles-for-tennis-elbow",
    title: "Best Pickleball Paddles for Tennis Elbow",
    metaTitle: "10 Best Pickleball Paddles for Tennis Elbow & Arm Issues (2025) | PickleFitter",
    description:
      "Arm-friendly pickleball paddles for players with tennis elbow or joint issues. Scored for vibration dampening, light weight, and comfort.",
    intro:
      "Tennis elbow and arm pain can end your season. We scored every paddle for a player with serious arm issues — the engine caps swing weight, demands thick cores for vibration absorption, and favors lightweight, soft-feel builds.",
    rank: (paddles) => getAllRanked(TENNIS_ELBOW_PROFILE, paddles),
  },
  {
    slug: "best-lightweight-paddles",
    title: "Best Lightweight Pickleball Paddles",
    metaTitle: "10 Best Lightweight Pickleball Paddles (2025) — Under 7.5 oz | PickleFitter",
    description:
      "The lightest pickleball paddles for quick hands and reduced fatigue. Filtered by weight, then ranked by overall quality.",
    intro:
      "Lighter paddles mean faster reactions at the kitchen and less fatigue over long sessions. We filtered to the lightest 25% of paddles, then ranked them by overall quality for a doubles player who values quick hands.",
    rank: (paddles) => {
      const filtered = paddles.filter((p) => percentile(sortedWeight, p.weight_oz) <= 25);
      return getAllRanked(LIGHTWEIGHT_PROFILE, filtered);
    },
  },
  {
    slug: "best-paddles-under-100",
    title: "Best Pickleball Paddles Under $100",
    metaTitle: "10 Best Pickleball Paddles Under $100 (2025) | PickleFitter",
    description:
      "Top-performing pickleball paddles under $100. Budget-friendly picks ranked by our full recommendation engine.",
    intro:
      "You don't need to spend $200+ to get a good paddle. We filtered to paddles under $100 and ranked them using our full scoring engine — the best bang for your buck across power, spin, stability, and feel.",
    rank: (paddles) => {
      const filtered = paddles.filter((p) => p.price > 0 && p.price <= 100);
      return getAllRanked(BUDGET_BEGINNER_PROFILE, filtered);
    },
  },
  {
    slug: "best-paddles-under-150",
    title: "Best Pickleball Paddles Under $150",
    metaTitle: "10 Best Pickleball Paddles Under $150 (2025) | PickleFitter",
    description:
      "Best pickleball paddles under $150 ranked by lab-tested performance. Mid-range paddles that punch above their price.",
    intro:
      "The $100-150 range is the sweet spot for quality without overpaying. We filtered to paddles under $150 and ranked them using our full scoring engine for an intermediate player.",
    rank: (paddles) => {
      const filtered = paddles.filter((p) => p.price > 0 && p.price <= 150);
      return getAllRanked(BUDGET_MID_PROFILE, filtered);
    },
  },
  {
    slug: "best-elongated-paddles",
    title: "Best Elongated Pickleball Paddles",
    metaTitle: "10 Best Elongated Pickleball Paddles (2025) — Extra Reach | PickleFitter",
    description:
      "Top elongated pickleball paddles for extra reach and singles play. Ranked by our engine for power, spin, and grip length.",
    intro:
      "Elongated paddles give you extra reach on defense, overheads, and two-handed backhands. We filtered to elongated shapes and ranked them for an aggressive singles player who needs power, spin, and a long grip.",
    rank: (paddles) => {
      const filtered = paddles.filter((p) => p.shape === "Elongated");
      return getAllRanked(ELONGATED_PROFILE, filtered);
    },
  },
  {
    slug: "best-thermoformed-paddles",
    title: "Best Thermoformed Pickleball Paddles",
    metaTitle: "10 Best Thermoformed Pickleball Paddles (2025) — Gen 3 & Gen 4 | PickleFitter",
    description:
      "Top thermoformed (Gen 3 & Gen 4) pickleball paddles ranked by our recommendation engine. The latest paddle technology.",
    intro:
      "Thermoformed paddles (Gen 3 and Gen 4) use heat-molded construction for a stiffer, more consistent feel with more power. We filtered to thermoformed builds and ranked them for an advanced, aggressive player.",
    rank: (paddles) => {
      const filtered = paddles.filter(
        (p) =>
          p.build_style != null &&
          (p.build_style.includes("Gen 3") || p.build_style.includes("Gen 4"))
      );
      return getAllRanked(THERMOFORMED_PROFILE, filtered);
    },
  },
];

/** Get a guide's top 10 paddles */
export function getGuideRanking(guide: Guide): Paddle[] {
  return guide.rank(allPaddles).slice(0, 10);
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
