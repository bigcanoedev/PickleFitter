import { Paddle } from "./types";
import { paddleData } from "./paddle-data";

/* ───────────────── Fleet Stats (computed once) ───────────────── */

interface FleetStats {
  power: { avg: number; values: number[] };
  pop: { avg: number; values: number[] };
  spin: { avg: number; values: number[] };
  sw: { avg: number; values: number[] };
  tw: { avg: number; values: number[] };
  weight: { avg: number; values: number[] };
  price: { avg: number; values: number[] };
}

function computeFleetStats(): FleetStats {
  const collect = (fn: (p: Paddle) => number | null) =>
    (paddleData as Paddle[]).map(fn).filter((v): v is number => v != null && v > 0);

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const power = collect((p) => p.power_mph);
  const pop = collect((p) => p.pop_mph);
  const spin = collect((p) => p.spin_rpm || p.rpm);
  const sw = collect((p) => p.swing_weight);
  const tw = collect((p) => p.twist_weight);
  const weight = collect((p) => p.weight_oz);
  const price = collect((p) => p.price);

  return {
    power: { avg: avg(power), values: power.sort((a, b) => a - b) },
    pop: { avg: avg(pop), values: pop.sort((a, b) => a - b) },
    spin: { avg: avg(spin), values: spin.sort((a, b) => a - b) },
    sw: { avg: avg(sw), values: sw.sort((a, b) => a - b) },
    tw: { avg: avg(tw), values: tw.sort((a, b) => a - b) },
    weight: { avg: avg(weight), values: weight.sort((a, b) => a - b) },
    price: { avg: avg(price), values: price.sort((a, b) => a - b) },
  };
}

const fleet = computeFleetStats();

/** Returns what percentile a value falls at within a sorted array (0–100). */
function percentile(sortedValues: number[], value: number): number {
  let count = 0;
  for (const v of sortedValues) {
    if (v < value) count++;
    else break;
  }
  return Math.round((count / sortedValues.length) * 100);
}

function fmtPct(pct: number): string {
  if (pct >= 90) return `top ${100 - pct}%`;
  if (pct <= 10) return `bottom ${pct}%`;
  return `${pct}th percentile`;
}

/* ───────────────── Pro Players ───────────────── */

export interface ProPlayer {
  name: string;
  note?: string;
}

const PRO_PLAYER_MAP: Record<number, ProPlayer[]> = {
  198: [{ name: "Ben Johns", note: "former paddle" }],
  199: [{ name: "Ben Johns", note: "former paddle" }],
  200: [{ name: "Ben Johns", note: "former paddle" }],
  201: [{ name: "Ben Johns", note: "former paddle" }],
  202: [{ name: "Ben Johns", note: "signature line" }],
  203: [{ name: "Ben Johns", note: "signature line" }],
  204: [{ name: "Ben Johns", note: "signature line" }],
  205: [{ name: "Ben Johns", note: "signature line" }],
  193: [{ name: "Anna Leigh Waters", note: "former paddle" }],
  194: [{ name: "Anna Leigh Waters", note: "former paddle" }],
  300: [{ name: "Tyson McGuffin" }],
  301: [{ name: "Tyson McGuffin" }],
  296: [{ name: "Catherine Parenteau", note: "former paddle" }],
  307: [{ name: "Riley Newman", note: "former paddle" }],
  317: [{ name: "Federico Staksrud", note: "former paddle" }],
  326: [{ name: "Federico Staksrud" }],
  327: [{ name: "Federico Staksrud" }],
  190: [{ name: "Andre Agassi", note: "signature paddle" }],
  191: [{ name: "Andre Agassi", note: "signature paddle" }],
  192: [{ name: "Andre Agassi", note: "signature paddle" }],
  108: [{ name: "Parris Todd", note: "signature paddle" }],
  196: [{ name: "James Ignatowich", note: "former paddle" }],
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
  if (paddle.power_mph) {
    const pct = percentile(fleet.power.values, paddle.power_mph);
    if (pct >= 85) {
      pros.push(`Elite power — ${paddle.power_mph} MPH puts it in the ${fmtPct(pct)} of all paddles tested (avg ${fleet.power.avg.toFixed(1)})`);
    } else if (pct >= 65) {
      pros.push(`Above-average power at ${paddle.power_mph} MPH (${fmtPct(pct)}, avg ${fleet.power.avg.toFixed(1)})`);
    }
  }

  // Pop
  if (paddle.pop_mph) {
    const pct = percentile(fleet.pop.values, paddle.pop_mph);
    if (pct >= 85) {
      pros.push(`Exceptional pop at ${paddle.pop_mph} MPH — ${fmtPct(pct)} for fast hands battles (avg ${fleet.pop.avg.toFixed(1)})`);
    } else if (pct >= 65) {
      pros.push(`Solid pop at ${paddle.pop_mph} MPH (${fmtPct(pct)}) for net exchanges`);
    }
  }

  // Spin
  const spinVal = paddle.spin_rpm || paddle.rpm;
  if (spinVal) {
    const pct = percentile(fleet.spin.values, spinVal);
    if (pct >= 85) {
      pros.push(`Outstanding spin at ${spinVal} RPM — ${fmtPct(pct)} for heavy serves and thirds (avg ${fleet.spin.avg.toFixed(0)})`);
    } else if (pct >= 65) {
      pros.push(`Good spin generation at ${spinVal} RPM (${fmtPct(pct)})`);
    }
  }

  // Twist weight / stability
  if (paddle.twist_weight) {
    const pct = percentile(fleet.tw.values, paddle.twist_weight);
    if (pct >= 80) {
      pros.push(`Exceptional stability — ${paddle.twist_weight} twist weight is ${fmtPct(pct)} (avg ${fleet.tw.avg.toFixed(1)}), very forgiving on off-center hits`);
    }
  }

  // Swing weight
  if (paddle.swing_weight) {
    const pct = percentile(fleet.sw.values, paddle.swing_weight);
    if (pct <= 20) {
      pros.push(`Quick hands — swing weight of ${paddle.swing_weight} is in the ${fmtPct(pct)} (avg ${fleet.sw.avg.toFixed(0)}), easy to maneuver`);
    } else if (pct >= 80) {
      pros.push(`Heavy swing weight of ${paddle.swing_weight} (${fmtPct(pct)}) delivers extra momentum and plow-through on drives`);
    }
  }

  // Shape advantages
  if (paddle.shape === "Elongated") {
    pros.push("Elongated shape gives extra reach on defense, overheads, and two-handed backhands");
  } else if (paddle.shape === "Wide body") {
    pros.push("Wide body maximizes the sweet spot for more forgiveness on off-center hits");
  }

  // Core thickness
  if (paddle.core_thickness_mm && paddle.core_thickness_mm >= 16) {
    pros.push("Thick core (16mm+) provides a soft, controlled feel with a large sweet spot");
  } else if (paddle.core_thickness_mm && paddle.core_thickness_mm <= 14) {
    pros.push(`Thin core (${paddle.core_thickness_mm}mm) gives a crisp, responsive feel with fast feedback`);
  }

  // Price
  if (paddle.price) {
    const pct = percentile(fleet.price.values, paddle.price);
    if (pct <= 15) {
      pros.push(`Great value at $${paddle.price} — cheaper than ${100 - pct}% of paddles (avg $${fleet.price.avg.toFixed(0)})`);
    } else if (pct <= 35) {
      pros.push(`Competitive price at $${paddle.price} (below the $${fleet.price.avg.toFixed(0)} average)`);
    }
  }

  // Firepower tier
  if (paddle.firepower_tier?.includes("Elite")) {
    pros.push("Firepower Elite tier — one of the most powerful paddles in lab testing");
  }

  // Weight
  if (paddle.weight_oz) {
    const pct = percentile(fleet.weight.values, paddle.weight_oz);
    if (pct <= 15) {
      pros.push(`Lightweight at ${paddle.weight_oz.toFixed(1)} oz (${fmtPct(pct)}) — reduces fatigue during long sessions`);
    }
  }

  // Build style
  if (paddle.build_style?.includes("Gen 3") || paddle.build_style?.includes("Gen 4")) {
    pros.push("Latest-generation thermoformed construction for premium feel and consistency");
  }

  return pros.slice(0, 5);
}

export function generateCons(paddle: Paddle): string[] {
  const cons: string[] = [];

  // Low power
  if (paddle.power_mph) {
    const pct = percentile(fleet.power.values, paddle.power_mph);
    if (pct <= 20) {
      cons.push(`Below-average power at ${paddle.power_mph} MPH (${fmtPct(pct)}, avg ${fleet.power.avg.toFixed(1)}) — you'll need to generate pace with technique`);
    }
  }

  // Low pop
  if (paddle.pop_mph) {
    const pct = percentile(fleet.pop.values, paddle.pop_mph);
    if (pct <= 20) {
      cons.push(`Lower pop at ${paddle.pop_mph} MPH (${fmtPct(pct)}, avg ${fleet.pop.avg.toFixed(1)}) — may feel sluggish in fast hands exchanges`);
    }
  }

  // Low spin
  const spinVal = paddle.spin_rpm || paddle.rpm;
  if (spinVal) {
    const pct = percentile(fleet.spin.values, spinVal);
    if (pct <= 20) {
      cons.push(`Limited spin at ${spinVal} RPM (${fmtPct(pct)}, avg ${fleet.spin.avg.toFixed(0)}) compared to newer paddles`);
    }
  }

  // Low twist weight
  if (paddle.twist_weight) {
    const pct = percentile(fleet.tw.values, paddle.twist_weight);
    if (pct <= 15) {
      cons.push(`Low stability — twist weight of ${paddle.twist_weight} (${fmtPct(pct)}) means off-center hits will twist more in your hand`);
    }
  }

  // Very heavy swing weight
  if (paddle.swing_weight) {
    const pct = percentile(fleet.sw.values, paddle.swing_weight);
    if (pct >= 90) {
      cons.push(`Very high swing weight of ${paddle.swing_weight} (${fmtPct(pct)}) can cause fatigue and slow hand transitions`);
    }
  }

  // Very light swing weight downside
  if (paddle.swing_weight) {
    const pct = percentile(fleet.sw.values, paddle.swing_weight);
    if (pct <= 10) {
      cons.push(`Very light swing weight of ${paddle.swing_weight} (${fmtPct(pct)}) sacrifices power and plow-through`);
    }
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
  if (paddle.price) {
    const pct = percentile(fleet.price.values, paddle.price);
    if (pct >= 85) {
      cons.push(`Premium price at $${paddle.price} — more expensive than ${pct}% of paddles (avg $${fleet.price.avg.toFixed(0)})`);
    }
  }

  // Heavy overall
  if (paddle.weight_oz) {
    const pct = percentile(fleet.weight.values, paddle.weight_oz);
    if (pct >= 85) {
      cons.push(`On the heavy side at ${paddle.weight_oz.toFixed(1)} oz (${fmtPct(pct)}) — may cause fatigue for players with arm issues`);
    }
  }

  // Soft tier
  if (paddle.firepower_tier?.includes("Soft")) {
    cons.push("Firepower Soft tier — you'll need to supply your own power");
  }

  return cons.slice(0, 4);
}

/* ───────────────── Best For ───────────────── */

export interface BestForTag {
  label: string;
  description: string;
}

export function generateBestFor(paddle: Paddle): BestForTag[] {
  const tags: BestForTag[] = [];
  const swPct = percentile(fleet.sw.values, paddle.swing_weight);
  const twPct = percentile(fleet.tw.values, paddle.twist_weight);
  const popPct = paddle.pop_mph ? percentile(fleet.pop.values, paddle.pop_mph) : null;
  const powerPct = paddle.power_mph ? percentile(fleet.power.values, paddle.power_mph) : null;
  const spinVal = paddle.spin_rpm || paddle.rpm;
  const spinPct = spinVal ? percentile(fleet.spin.values, spinVal) : null;

  // Beginners
  if (twPct >= 60 && paddle.core_thickness_mm && paddle.core_thickness_mm >= 16) {
    tags.push({
      label: "Beginners",
      description: `Twist weight of ${paddle.twist_weight} (${fmtPct(twPct)}) and 16mm core create a forgiving sweet spot for learning`,
    });
  }

  // Advanced
  if (paddle.firepower_tier?.includes("Elite") || paddle.firepower_tier?.includes("High")) {
    tags.push({
      label: "Advanced / Tournament Players",
      description: `${paddle.firepower_tier} tier — high firepower rewards players who can control the extra pace`,
    });
  }

  // Power players
  if (powerPct && powerPct >= 75) {
    tags.push({
      label: "Power Players",
      description: `${paddle.power_mph} MPH drive speed (${fmtPct(powerPct)}) for aggressive baseliners and overhead-heavy games`,
    });
  }

  // Control players
  if (popPct && popPct < 45 && twPct >= 50 && paddle.core_thickness_mm && paddle.core_thickness_mm >= 16) {
    tags.push({
      label: "Control / Touch Players",
      description: "Soft feel and high stability prioritize placement and touch over raw pace",
    });
  }

  // Doubles
  if (swPct <= 30 && popPct && popPct >= 60) {
    tags.push({
      label: "Doubles Specialists",
      description: `Light swing weight (${paddle.swing_weight}, ${fmtPct(swPct)}) with ${paddle.pop_mph} MPH pop for fast exchanges at the kitchen`,
    });
  }

  // Singles
  if (swPct >= 65 && paddle.shape === "Elongated") {
    tags.push({
      label: "Singles Players",
      description: `Swing weight of ${paddle.swing_weight} (${fmtPct(swPct)}) plus elongated reach for court coverage and driving`,
    });
  }

  // Arm issues
  if (paddle.core_thickness_mm && paddle.core_thickness_mm >= 16 && paddle.weight_oz <= 7.8) {
    tags.push({
      label: "Players with Arm Issues",
      description: `Thick ${paddle.core_thickness_mm}mm core absorbs vibration while light ${paddle.weight_oz.toFixed(1)} oz weight reduces strain`,
    });
  }

  // Spin players
  if (spinPct && spinPct >= 80) {
    tags.push({
      label: "Spin-Heavy Players",
      description: `${spinVal} RPM (${fmtPct(spinPct)}) for kicking serves, heavy thirds, and roll volleys`,
    });
  }

  // Tennis converts
  if (swPct >= 55 && paddle.grip_length && paddle.grip_length >= 5.5) {
    tags.push({
      label: "Tennis Converts",
      description: `Swing weight of ${paddle.swing_weight} and ${paddle.grip_length}" grip feel familiar coming from tennis`,
    });
  }

  // Budget
  const pricePct = percentile(fleet.price.values, paddle.price);
  if (pricePct <= 25) {
    tags.push({
      label: "Budget-Conscious Buyers",
      description: `At $${paddle.price}, it's cheaper than ${100 - pricePct}% of paddles (avg $${fleet.price.avg.toFixed(0)})`,
    });
  }

  return tags.slice(0, 4);
}

/* ───────────────── Specs Summary ───────────────── */

export function getSpecVerdict(paddle: Paddle): string {
  const parts: string[] = [];

  if (paddle.power_mph) {
    const pct = percentile(fleet.power.values, paddle.power_mph);
    if (pct >= 80) parts.push(`${fmtPct(pct)} power (${paddle.power_mph} MPH)`);
    else if (pct <= 25) parts.push(`control-oriented ${paddle.power_mph} MPH power`);
    else parts.push(`mid-range ${paddle.power_mph} MPH power`);
  }

  if (paddle.core_thickness_mm && paddle.core_thickness_mm >= 16) {
    parts.push("plush 16mm+ feel");
  } else if (paddle.core_thickness_mm && paddle.core_thickness_mm <= 14) {
    parts.push(`crisp ${paddle.core_thickness_mm}mm feel`);
  }

  const spinVal = paddle.spin_rpm || paddle.rpm;
  if (spinVal) {
    const pct = percentile(fleet.spin.values, spinVal);
    if (pct >= 75) parts.push(`${fmtPct(pct)} spin (${spinVal} RPM)`);
  }

  if (paddle.twist_weight >= 7.0) {
    const pct = percentile(fleet.tw.values, paddle.twist_weight);
    parts.push(`rock-solid stability (${fmtPct(pct)})`);
  } else if (paddle.twist_weight < 6.0) {
    parts.push("spin-friendly low twist weight");
  }

  if (parts.length === 0) return "A well-rounded paddle with balanced characteristics across all specs.";

  const joined = parts.slice(0, 3).join(", ");
  return `This paddle delivers ${joined} — a ${paddle.paddle_type?.toLowerCase() || "versatile"} option${paddle.shape ? ` in a ${paddle.shape.toLowerCase()} shape` : ""}.`;
}
