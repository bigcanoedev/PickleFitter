import { Paddle } from "./types";

/* ───────────────── Pro Players ───────────────── */

export interface ProPlayer {
  name: string;
  note?: string; // e.g. "signature paddle", "primary", "former"
}

// Map paddle IDs to known pro players who use/used them.
// This is a curated starting set — expand over time.
const PRO_PLAYER_MAP: Record<number, ProPlayer[]> = {
  // Ben Johns — JOOLA Hyperion / Perseus / Scorpeus line
  198: [{ name: "Ben Johns", note: "former paddle" }],
  199: [{ name: "Ben Johns", note: "former paddle" }],
  200: [{ name: "Ben Johns", note: "former paddle" }],
  201: [{ name: "Ben Johns", note: "former paddle" }],
  202: [{ name: "Ben Johns", note: "signature line" }],
  203: [{ name: "Ben Johns", note: "signature line" }],
  204: [{ name: "Ben Johns", note: "signature line" }],
  205: [{ name: "Ben Johns", note: "signature line" }],

  // Anna Leigh Waters — JOOLA Hyperion line
  193: [{ name: "Anna Leigh Waters", note: "former paddle" }],
  194: [{ name: "Anna Leigh Waters", note: "former paddle" }],

  // Tyson McGuffin — Selkirk
  300: [{ name: "Tyson McGuffin" }],
  301: [{ name: "Tyson McGuffin" }],

  // Catherine Parenteau — Selkirk
  296: [{ name: "Catherine Parenteau", note: "former paddle" }],

  // Riley Newman — Selkirk Vanguard Power Air
  307: [{ name: "Riley Newman", note: "former paddle" }],

  // Federico Staksrud — Six Zero
  317: [{ name: "Federico Staksrud", note: "former paddle" }],
  326: [{ name: "Federico Staksrud" }],
  327: [{ name: "Federico Staksrud" }],

  // Andre Agassi — JOOLA Agassi line
  190: [{ name: "Andre Agassi", note: "signature paddle" }],
  191: [{ name: "Andre Agassi", note: "signature paddle" }],
  192: [{ name: "Andre Agassi", note: "signature paddle" }],

  // Parris Todd — Franklin
  108: [{ name: "Parris Todd", note: "signature paddle" }],

  // James Ignatowich — JOOLA
  196: [{ name: "James Ignatowich", note: "former paddle" }],

  // Jack Sock — Selkirk Labs
  308: [{ name: "Jack Sock" }],
  315: [{ name: "Jack Sock" }],
};

export function getProPlayers(paddleId: number): ProPlayer[] {
  return PRO_PLAYER_MAP[paddleId] || [];
}

/* ───────────────── Pros & Cons Generator ───────────────── */

export function generatePros(paddle: Paddle): string[] {
  const pros: string[] = [];

  // Power
  if (paddle.power_mph && paddle.power_mph >= 57) {
    pros.push("Elite-level power output for drives and overheads");
  } else if (paddle.power_mph && paddle.power_mph >= 56) {
    pros.push("Above-average power for punching drives");
  }

  // Pop
  if (paddle.pop_mph && paddle.pop_mph >= 38) {
    pros.push("Excellent pop for quick hands battles at the net");
  } else if (paddle.pop_mph && paddle.pop_mph >= 37) {
    pros.push("Good pop for fast exchanges");
  }

  // Spin
  if (paddle.spin_rpm && paddle.spin_rpm >= 2100) {
    pros.push("Outstanding spin generation for heavy serves and thirds");
  } else if (paddle.spin_rpm && paddle.spin_rpm >= 1900) {
    pros.push("Strong spin potential for shaping shots");
  }

  // Twist weight / stability
  if (paddle.twist_weight >= 7.0) {
    pros.push("High twist weight provides a stable, forgiving sweet spot");
  }

  // Swing weight
  if (paddle.swing_weight <= 110) {
    pros.push("Light swing weight for quick hands and easy maneuverability");
  } else if (paddle.swing_weight >= 125) {
    pros.push("High swing weight delivers extra momentum and plow-through");
  }

  // Shape advantages
  if (paddle.shape === "Elongated") {
    pros.push("Elongated shape gives extra reach on defense and overheads");
  } else if (paddle.shape === "Wide body") {
    pros.push("Wide body maximizes the sweet spot for more forgiveness");
  }

  // Core thickness
  if (paddle.core_thickness_mm && paddle.core_thickness_mm >= 16) {
    pros.push("Thick core provides a soft, controlled feel with a large sweet spot");
  } else if (paddle.core_thickness_mm && paddle.core_thickness_mm <= 14) {
    pros.push("Thin core gives a crisp, responsive feel with fast feedback");
  }

  // Price
  if (paddle.price <= 100) {
    pros.push("Budget-friendly price point without sacrificing quality");
  } else if (paddle.price <= 150) {
    pros.push("Competitive price for the performance level");
  }

  // Firepower tier
  if (paddle.firepower_tier?.includes("Elite")) {
    pros.push("Top-tier firepower — one of the most powerful paddles tested");
  }

  // Weight
  if (paddle.weight_oz <= 7.5) {
    pros.push("Lightweight design reduces fatigue during long sessions");
  }

  // Build style
  if (paddle.build_style?.includes("Gen 3") || paddle.build_style?.includes("Gen 4")) {
    pros.push("Latest-generation thermoformed construction for premium feel");
  }

  return pros.slice(0, 5); // Cap at 5
}

export function generateCons(paddle: Paddle): string[] {
  const cons: string[] = [];

  // Low power
  if (paddle.power_mph && paddle.power_mph < 54) {
    cons.push("Below-average power — may need to generate pace with technique");
  }

  // Low pop
  if (paddle.pop_mph && paddle.pop_mph < 35) {
    cons.push("Lower pop speed may feel sluggish in fast hands exchanges");
  }

  // Low spin
  if (paddle.spin_rpm && paddle.spin_rpm < 1700) {
    cons.push("Limited spin generation compared to newer paddles");
  }

  // Low twist weight
  if (paddle.twist_weight < 5.8) {
    cons.push("Low twist weight means off-center hits will twist more in your hand");
  }

  // Heavy swing weight
  if (paddle.swing_weight >= 130) {
    cons.push("Very high swing weight can cause fatigue and slow hand transitions");
  }

  // Light swing weight downside
  if (paddle.swing_weight <= 108) {
    cons.push("Very light swing weight sacrifices power and plow-through");
  }

  // Elongated tradeoff
  if (paddle.shape === "Elongated") {
    cons.push("Narrower face means a smaller horizontal sweet spot");
  }

  // Wide body tradeoff
  if (paddle.shape === "Wide body") {
    cons.push("Shorter face reduces reach compared to elongated paddles");
  }

  // Thick core tradeoff
  if (paddle.core_thickness_mm && paddle.core_thickness_mm >= 16) {
    cons.push("Thick core trades some pop and hand speed for control");
  }

  // Thin core tradeoff
  if (paddle.core_thickness_mm && paddle.core_thickness_mm <= 13) {
    cons.push("Very thin core can feel harsh on mishits and may cause arm fatigue");
  }

  // Expensive
  if (paddle.price >= 250) {
    cons.push("Premium price point — one of the more expensive paddles on the market");
  }

  // Heavy overall
  if (paddle.weight_oz >= 8.4) {
    cons.push("On the heavier side — may cause fatigue for players with arm issues");
  }

  // Control tier
  if (paddle.firepower_tier?.includes("Soft")) {
    cons.push("Very soft feel means you'll need to supply your own power");
  }

  return cons.slice(0, 4); // Cap at 4
}

/* ───────────────── Best For ───────────────── */

export interface BestForTag {
  label: string;
  description: string;
}

export function generateBestFor(paddle: Paddle): BestForTag[] {
  const tags: BestForTag[] = [];

  // Skill level
  if (paddle.twist_weight >= 6.8 && paddle.core_thickness_mm && paddle.core_thickness_mm >= 16) {
    tags.push({ label: "Beginners", description: "Forgiving sweet spot and stable feel make it easy to learn with" });
  }
  if (paddle.firepower_tier?.includes("Elite") || paddle.firepower_tier?.includes("High")) {
    tags.push({ label: "Advanced / Tournament Players", description: "High firepower rewards players who can control the extra pace" });
  }

  // Play style
  if (paddle.power_mph && paddle.power_mph >= 56.5) {
    tags.push({ label: "Power Players", description: "Top-end drive and overhead speed for aggressive styles" });
  }
  if (paddle.pop_mph && paddle.pop_mph < 36 && paddle.twist_weight >= 6.5 && paddle.core_thickness_mm && paddle.core_thickness_mm >= 16) {
    tags.push({ label: "Control / Touch Players", description: "Soft feel and stability prioritize placement over pace" });
  }

  // Game type
  if (paddle.swing_weight <= 112 && paddle.pop_mph && paddle.pop_mph >= 36) {
    tags.push({ label: "Doubles Specialists", description: "Quick hands and pop for fast exchanges at the kitchen" });
  }
  if (paddle.swing_weight >= 120 && paddle.shape === "Elongated") {
    tags.push({ label: "Singles Players", description: "Extra reach and swing momentum for court coverage and drives" });
  }

  // Arm issues
  if (paddle.core_thickness_mm && paddle.core_thickness_mm >= 16 && paddle.weight_oz <= 7.8) {
    tags.push({ label: "Players with Arm Issues", description: "Thick core absorbs vibration while light weight reduces strain" });
  }

  // Spin
  if (paddle.spin_rpm && paddle.spin_rpm >= 2050) {
    tags.push({ label: "Spin-Heavy Players", description: "Top-tier RPM for kicking serves, heavy thirds, and roll volleys" });
  }

  // Tennis converts
  if (paddle.swing_weight >= 118 && paddle.grip_length && paddle.grip_length >= 5.5) {
    tags.push({ label: "Tennis Converts", description: "Familiar swing weight and grip length for players coming from tennis" });
  }

  // Budget
  if (paddle.price <= 120) {
    tags.push({ label: "Budget-Conscious Buyers", description: "Great performance-to-price ratio" });
  }

  return tags.slice(0, 4); // Cap at 4
}

/* ───────────────── Specs Summary ───────────────── */

export function getSpecVerdict(paddle: Paddle): string {
  const parts: string[] = [];

  // Power summary
  if (paddle.power_mph) {
    if (paddle.power_mph >= 57) parts.push("elite power");
    else if (paddle.power_mph >= 55.5) parts.push("solid power");
    else parts.push("modest power");
  }

  // Control/feel
  if (paddle.core_thickness_mm && paddle.core_thickness_mm >= 16) {
    parts.push("plush feel");
  } else if (paddle.core_thickness_mm && paddle.core_thickness_mm <= 14) {
    parts.push("crisp feel");
  }

  // Spin
  if (paddle.spin_rpm && paddle.spin_rpm >= 2000) {
    parts.push("heavy spin");
  }

  // Stability
  if (paddle.twist_weight >= 7.0) {
    parts.push("rock-solid stability");
  } else if (paddle.twist_weight < 6.0) {
    parts.push("spin-friendly twist weight");
  }

  if (parts.length === 0) return "A well-rounded paddle with balanced characteristics.";

  const joined = parts.slice(0, 3).join(", ");
  return `This paddle delivers ${joined} — a ${paddle.paddle_type?.toLowerCase() || "versatile"} option ${paddle.shape ? `in a ${paddle.shape.toLowerCase()} shape` : ""}.`.trim();
}
