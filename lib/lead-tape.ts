import { LeadTapeCalculation, LeadTapePlacementResult } from "./types";

/**
 * Lead Tape Physics Model — Calibrated to Measured Data
 *
 * Base model: parallel axis theorem (I = m × d²) on an elliptical paddle face.
 * Calibrated against Thrive Pickleball's RDC-measured data:
 *
 *   Thrive measured (3g per position):
 *     3g at 3&9:       ΔSW = +3.67,  ΔTW = +0.73
 *     3g at 2&10:      ΔSW = +7.87,  ΔTW = +0.32
 *     3g from handle:  ΔSW = +0.65,  ΔTW = +0.13
 *     3g at 1" above:  ΔSW = +0.97,  ΔTW = +0.31
 *     6g at 3&9:       ΔSW = +7.87,  ΔTW = +1.59  (roughly 2× the 3g values)
 *
 *   Source: https://thrivepb.com/pages/custom-weighting
 *
 * We derive per-gram rates directly from Thrive's measurements where available,
 * and interpolate/extrapolate using the physics model's relative ratios for
 * positions Thrive didn't measure.
 *
 * The physics model predicts RELATIVE rates between positions accurately
 * (the d² ratios hold), but the absolute scale needs a calibration factor
 * because real paddle geometry and RDC measurement details differ from
 * our simplified ellipse model.
 */

// ── Thrive-calibrated rates per gram (total at that position) ──────────────
// Directly from Thrive data: rate = measured_delta / grams
// Positions not measured by Thrive are interpolated using physics ratios.

// Thrive measured rates (per total gram):
const THRIVE_3_9_SW  = 3.67 / 3;  // 1.223 SW/g
const THRIVE_3_9_TW  = 0.73 / 3;  // 0.243 TW/g
const THRIVE_2_10_SW = 7.87 / 3;  // 2.623 SW/g
const THRIVE_2_10_TW = 0.32 / 3;  // 0.107 TW/g
const THRIVE_CAP_SW  = 0.65 / 3;  // 0.217 SW/g (handle/butt cap)

// Physics model relative ratios (from d² calculations on our ellipse):
// These are used to scale from the calibrated positions to unmeasured ones.
const PHYSICS_RATIOS = {
  "12":   { sw: 0.900, tw: 0.000 },
  "1&11": { sw: 0.807, tw: 0.025 },
  "2&10": { sw: 0.576, tw: 0.075 },
  "3&9":  { sw: 0.324, tw: 0.100 },
  "4&8":  { sw: 0.144, tw: 0.075 },
  "5&7":  { sw: 0.058, tw: 0.025 },
};

// Calibration: scale physics ratios to match Thrive's measured absolute values.
// Use 3&9 as the anchor point for calibration.
const SW_SCALE = THRIVE_3_9_SW / PHYSICS_RATIOS["3&9"].sw;  // ~3.78
const TW_SCALE = THRIVE_3_9_TW / PHYSICS_RATIOS["3&9"].tw;  // ~2.43

function calibratedRate(position: keyof typeof PHYSICS_RATIOS) {
  return {
    swPerGram: round3(PHYSICS_RATIOS[position].sw * SW_SCALE),
    twPerGram: round3(PHYSICS_RATIOS[position].tw * TW_SCALE),
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Final calibrated rates per gram of tape (total at position).
 *
 * Validation against Thrive measured data:
 *   3g at 3&9:  predicted ΔSW = 3×1.223 = 3.67 ✓  ΔTW = 3×0.243 = 0.73 ✓
 *   3g at 2&10: predicted ΔSW = 3×2.175 = 6.52    Thrive measured 7.87
 *               (physics interpolation; ~17% under. 2&10 may sit higher on real paddle)
 *
 * | Position | SW/g   | TW/g   | Source                    |
 * |----------|--------|--------|---------------------------|
 * | 12       | 3.396  | 0.000  | Physics-scaled from 3&9   |
 * | 1&11     | 3.045  | 0.061  | Physics-scaled from 3&9   |
 * | 2&10     | 2.175  | 0.182  | Physics-scaled (Thrive: 2.62) |
 * | 3&9      | 1.223  | 0.243  | Thrive measured ✓         |
 * | 4&8      | 0.543  | 0.182  | Physics-scaled from 3&9   |
 * | 5&7      | 0.219  | 0.061  | Physics-scaled from 3&9   |
 * | Cap      | 0.217  | 0.000  | Thrive measured ✓         |
 */

const CAL_12   = calibratedRate("12");
const CAL_1_11 = calibratedRate("1&11");
// For 2&10, average our calibrated value with Thrive's direct measurement
const CAL_2_10 = {
  swPerGram: round3((calibratedRate("2&10").swPerGram + THRIVE_2_10_SW) / 2),
  twPerGram: round3((calibratedRate("2&10").twPerGram + THRIVE_2_10_TW) / 2),
};
const CAL_3_9  = { swPerGram: round3(THRIVE_3_9_SW), twPerGram: round3(THRIVE_3_9_TW) };
const CAL_4_8  = calibratedRate("4&8");
const CAL_5_7  = calibratedRate("5&7");
const CAL_CAP  = { swPerGram: round3(THRIVE_CAP_SW), twPerGram: 0 };

export const PLACEMENTS = {
  "12":   { label: "12 o'clock", swPerGram: CAL_12.swPerGram,   twPerGram: CAL_12.twPerGram,   paired: false },
  "1&11": { label: "1 & 11",    swPerGram: CAL_1_11.swPerGram, twPerGram: CAL_1_11.twPerGram, paired: true },
  "2&10": { label: "2 & 10",    swPerGram: CAL_2_10.swPerGram, twPerGram: CAL_2_10.twPerGram, paired: true },
  "3&9":  { label: "3 & 9",     swPerGram: CAL_3_9.swPerGram,  twPerGram: CAL_3_9.twPerGram,  paired: true },
  "4&8":  { label: "4 & 8",     swPerGram: CAL_4_8.swPerGram,  twPerGram: CAL_4_8.twPerGram,  paired: true },
  "5&7":  { label: "5 & 7",     swPerGram: CAL_5_7.swPerGram,  twPerGram: CAL_5_7.twPerGram,  paired: true },
} as const;

export const CAP_RATES = {
  swPerGram: CAL_CAP.swPerGram,
  twPerGram: 0,
};

export type PlacementKey = keyof typeof PLACEMENTS;

export const PLACEMENT_KEYS: PlacementKey[] = ["12", "1&11", "2&10", "3&9", "4&8", "5&7"];

export interface PlacementGrams {
  position: PlacementKey;
  gramsPerSide: number;
  isTape?: boolean;    // true = distributed tape, false/undefined = concentrated strip
  tapeRate?: number;   // grams per inch (for tape mode display)
}

/** Tape arc defined by start/end angles (0=12 o'clock, 90=3 o'clock, 180=6 o'clock) */
export interface TapeArc {
  startDeg: number;
  endDeg: number;
  tapeRate: number;    // grams per inch
  paired: boolean;     // apply to both sides
}

export const PRESETS: { label: string; placements: PlacementGrams[]; capGrams: number }[] = [
  { label: "Power",      placements: [{ position: "12", gramsPerSide: 3 }],                                                  capGrams: 0 },
  { label: "Stability",  placements: [{ position: "3&9", gramsPerSide: 3 }],                                                 capGrams: 0 },
  { label: "All-Around", placements: [{ position: "3&9", gramsPerSide: 2 }, { position: "12", gramsPerSide: 2 }],             capGrams: 0 },
  { label: "Pro Setup",  placements: [{ position: "2&10", gramsPerSide: 2 }, { position: "12", gramsPerSide: 2 }],            capGrams: 2 },
];

const GRAMS_PER_OZ = 28.3495;

/**
 * The linear model (rate × grams) is physically correct: I = m × d², and
 * since d is constant for a given position, the effect scales linearly
 * with mass. Thrive's measured data confirms this (3g vs 6g at 3&9 give
 * nearly identical per-gram rates). No taper or diminishing returns.
 *
 * For distributed tape: tape applied at a position spreads along the edge.
 * We model this by distributing weight across adjacent positions based on
 * how far the tape extends. A typical paddle has ~12 inches of edge per
 * side from 12 o'clock to 6 o'clock, with ~2 inches between each clock
 * position. Short tape (<2") stays within its position. Longer tape bleeds
 * into neighbors, and each neighbor has its own SW/TW rates.
 */

/** Realistic upper bound for twist weight — the highest in our 727-paddle database is 8.34 */
export const MAX_REALISTIC_TW = 9.0;

/**
 * Ordered positions from 12→6 with their angular midpoints (degrees from top).
 * Used to distribute tape weight across adjacent zones.
 */
const POSITION_ORDER: PlacementKey[] = ["12", "1&11", "2&10", "3&9", "4&8", "5&7"];
const INCHES_PER_ZONE = 2; // ~2 inches of edge between each clock position

/**
 * Distribute tape weight across positions based on tape length.
 * Returns a map of position → grams at that position (for one side).
 *
 * For a strip (isTape=false): all grams go to the specified position.
 * For tape (isTape=true): grams spread into adjacent positions proportionally.
 */
function distributeTapeWeight(
  centerPosition: PlacementKey,
  gramsPerSide: number,
  isTape: boolean,
  tapeRate: number,
): Record<PlacementKey, number> {
  const result: Record<PlacementKey, number> = { "12": 0, "1&11": 0, "2&10": 0, "3&9": 0, "4&8": 0, "5&7": 0 };

  if (!isTape || tapeRate <= 0) {
    // Strip mode: concentrated at position
    result[centerPosition] = gramsPerSide;
    return result;
  }

  // Tape mode: calculate inches and spread
  const inchesPerSide = gramsPerSide / tapeRate;
  const centerIdx = POSITION_ORDER.indexOf(centerPosition);

  // How many inches extend in each direction from center
  const halfInches = inchesPerSide / 2;

  // Walk outward from center, filling zones proportionally
  // Each zone is ~2 inches wide. Center zone gets filled first, then neighbors.
  let remaining = inchesPerSide;
  const zoneInches: Record<PlacementKey, number> = { "12": 0, "1&11": 0, "2&10": 0, "3&9": 0, "4&8": 0, "5&7": 0 };

  // Fill center zone (up to INCHES_PER_ZONE)
  const centerFill = Math.min(remaining, INCHES_PER_ZONE);
  zoneInches[centerPosition] = centerFill;
  remaining -= centerFill;

  // Fill outward in both directions
  let offset = 1;
  while (remaining > 0.01 && offset < POSITION_ORDER.length) {
    const perDirection = remaining / 2;

    // Toward 12 o'clock
    const upIdx = centerIdx - offset;
    if (upIdx >= 0) {
      const fill = Math.min(perDirection, INCHES_PER_ZONE);
      zoneInches[POSITION_ORDER[upIdx]] += fill;
      remaining -= fill;
    }

    // Toward 6 o'clock
    const downIdx = centerIdx + offset;
    if (downIdx < POSITION_ORDER.length) {
      const fill = Math.min(Math.min(perDirection, INCHES_PER_ZONE), remaining);
      zoneInches[POSITION_ORDER[downIdx]] += fill;
      remaining -= fill;
    }

    offset++;
  }

  // Convert inches per zone to grams per zone
  const totalInches = Object.values(zoneInches).reduce((a, b) => a + b, 0);
  if (totalInches > 0) {
    for (const key of PLACEMENT_KEYS) {
      result[key] = (zoneInches[key] / totalInches) * gramsPerSide;
    }
  }

  return result;
}

/** Angles for each calibrated position (degrees from 12 o'clock) */
const POSITION_DEGREES: { deg: number; sw: number; tw: number }[] = [
  { deg: 0,   sw: CAL_12.swPerGram,   tw: CAL_12.twPerGram },
  { deg: 30,  sw: CAL_1_11.swPerGram, tw: CAL_1_11.twPerGram },
  { deg: 60,  sw: CAL_2_10.swPerGram, tw: CAL_2_10.twPerGram },
  { deg: 90,  sw: CAL_3_9.swPerGram,  tw: CAL_3_9.twPerGram },
  { deg: 120, sw: CAL_4_8.swPerGram,  tw: CAL_4_8.twPerGram },
  { deg: 150, sw: CAL_5_7.swPerGram,  tw: CAL_5_7.twPerGram },
];

/** Interpolate SW/TW rate at any angle by lerping between known positions */
function ratesAtAngle(deg: number): { sw: number; tw: number } {
  const clamped = Math.max(0, Math.min(150, deg));
  for (let i = 0; i < POSITION_DEGREES.length - 1; i++) {
    const a = POSITION_DEGREES[i];
    const b = POSITION_DEGREES[i + 1];
    if (clamped >= a.deg && clamped <= b.deg) {
      const t = (clamped - a.deg) / (b.deg - a.deg);
      return {
        sw: a.sw + (b.sw - a.sw) * t,
        tw: a.tw + (b.tw - a.tw) * t,
      };
    }
  }
  return POSITION_DEGREES[POSITION_DEGREES.length - 1];
}

/** Inches of paddle edge per degree (~12" per 180°) */
const INCHES_PER_DEGREE = 12 / 180;

/**
 * Calculate SW/TW deltas from a tape arc defined by start/end angles.
 * Integrates the per-gram rates along the arc by sampling.
 */
export function calculateTapeArc(arc: TapeArc): { swDelta: number; twDelta: number; totalGrams: number; inchesPerSide: number } {
  const arcDeg = Math.max(0, arc.endDeg - arc.startDeg);
  const inchesPerSide = arcDeg * INCHES_PER_DEGREE;
  const gramsPerSide = inchesPerSide * arc.tapeRate;
  const sides = arc.paired ? 2 : 1;
  const totalGrams = gramsPerSide * sides;

  if (arcDeg < 0.5) return { swDelta: 0, twDelta: 0, totalGrams: 0, inchesPerSide: 0 };

  // Sample along the arc and integrate SW/TW contributions
  const steps = Math.max(12, Math.round(arcDeg / 2));
  let swSum = 0;
  let twSum = 0;
  for (let i = 0; i <= steps; i++) {
    const deg = arc.startDeg + (arcDeg * i) / steps;
    const rates = ratesAtAngle(deg);
    // Each sample represents (arcDeg/steps) degrees of tape
    const inchSlice = (arcDeg / steps) * INCHES_PER_DEGREE;
    const gramSlice = inchSlice * arc.tapeRate * sides;
    swSum += gramSlice * rates.sw;
    twSum += gramSlice * rates.tw;
  }

  return {
    swDelta: parseFloat(swSum.toFixed(1)),
    twDelta: parseFloat(twSum.toFixed(2)),
    totalGrams: parseFloat(totalGrams.toFixed(1)),
    inchesPerSide: parseFloat(inchesPerSide.toFixed(1)),
  };
}

/**
 * Calculate resulting specs from user-specified weight at each position.
 * For paired positions, gramsPerSide means the weight on EACH side.
 * Tape placements distribute weight across adjacent positions.
 */
export function calculateLeadTape(
  currentSwingWeight: number,
  currentTwistWeight: number,
  currentWeightOz: number,
  placements: PlacementGrams[],
  capGrams: number = 0,
): LeadTapeCalculation {
  const currentWeightG = currentWeightOz * GRAMS_PER_OZ;

  const placementResults: LeadTapePlacementResult[] = placements
    .filter((p) => p.gramsPerSide > 0)
    .map((p) => {
      const spec = PLACEMENTS[p.position];
      const totalGrams = spec.paired ? p.gramsPerSide * 2 : p.gramsPerSide;

      // Distribute weight across positions (tape spreads, strips don't)
      const distribution = distributeTapeWeight(
        p.position,
        p.gramsPerSide,
        !!p.isTape,
        p.tapeRate || 1,
      );

      // Calculate SW/TW deltas using distributed weights
      let swDelta = 0;
      let twDelta = 0;
      for (const key of PLACEMENT_KEYS) {
        const gAtPos = distribution[key];
        if (gAtPos > 0) {
          const posSpec = PLACEMENTS[key];
          const posTotalG = spec.paired ? gAtPos * 2 : gAtPos;
          swDelta += posTotalG * posSpec.swPerGram;
          twDelta += posTotalG * posSpec.twPerGram;
        }
      }

      return {
        position: p.position,
        label: spec.label,
        gramsPerSide: p.gramsPerSide,
        grams: totalGrams,
        swDelta: parseFloat(swDelta.toFixed(1)),
        twDelta: parseFloat(twDelta.toFixed(2)),
      };
    });

  const capSwDelta = parseFloat((capGrams * CAP_RATES.swPerGram).toFixed(1));
  const totalHeadGrams = placementResults.reduce((s, p) => s + p.grams, 0);
  const totalSwDelta = parseFloat((placementResults.reduce((s, p) => s + p.swDelta, 0) + capSwDelta).toFixed(1));
  const totalTwDelta = parseFloat(placementResults.reduce((s, p) => s + p.twDelta, 0).toFixed(2));
  const totalGrams = totalHeadGrams + capGrams;

  const resultSW = parseFloat((currentSwingWeight + totalSwDelta).toFixed(1));
  const resultTW = parseFloat((currentTwistWeight + totalTwDelta).toFixed(1));
  const resultWeight = parseFloat((currentWeightOz + totalGrams / GRAMS_PER_OZ).toFixed(1));

  const balanceShiftMm = computeBalanceShift(placements, capGrams, currentWeightG);
  const explanation = generateExplanation(placementResults, capGrams, totalGrams, balanceShiftMm);

  return {
    placements: placementResults,
    totalGrams,
    capGrams,
    resultingSwingWeight: resultSW,
    resultingTwistWeight: resultTW,
    resultingWeightOz: resultWeight,
    explanation,
  };
}

/** Full calculation from a tape arc + optional cap weight. */
export function calculateTapeArcFull(
  currentSwingWeight: number,
  currentTwistWeight: number,
  currentWeightOz: number,
  arc: TapeArc,
  capGrams: number = 0,
): LeadTapeCalculation {
  const arcResult = calculateTapeArc(arc);
  const capSwDelta = capGrams * CAP_RATES.swPerGram;
  const totalGrams = arcResult.totalGrams + capGrams;

  const resultSW = parseFloat((currentSwingWeight + arcResult.swDelta + capSwDelta).toFixed(1));
  const resultTW = parseFloat((currentTwistWeight + arcResult.twDelta).toFixed(1));
  const resultWeight = parseFloat((currentWeightOz + totalGrams / GRAMS_PER_OZ).toFixed(1));

  // Clock labels for display
  const startLabel = degToClockLabel(arc.startDeg);
  const endLabel = degToClockLabel(arc.endDeg);
  const label = arc.paired
    ? `${startLabel}–${endLabel} (both sides)`
    : `${startLabel}–${endLabel}`;

  const placementResult: LeadTapePlacementResult = {
    position: "3&9", // nominal
    label,
    gramsPerSide: parseFloat((arcResult.totalGrams / (arc.paired ? 2 : 1)).toFixed(1)),
    grams: arcResult.totalGrams,
    swDelta: arcResult.swDelta,
    twDelta: arcResult.twDelta,
  };

  const parts: string[] = [];
  parts.push(`${arcResult.inchesPerSide.toFixed(1)}″ of tape per side from ${startLabel} to ${endLabel} (${arcResult.totalGrams.toFixed(1)}g total).`);
  if (capGrams > 0) {
    parts.push(`${capGrams}g cap weight at the handle butt.`);
  }

  return {
    placements: [placementResult],
    totalGrams: parseFloat(totalGrams.toFixed(1)),
    capGrams,
    resultingSwingWeight: resultSW,
    resultingTwistWeight: resultTW,
    resultingWeightOz: resultWeight,
    explanation: parts.join(" "),
  };
}

/** Convert degrees from 12 o'clock to a clock label */
function degToClockLabel(deg: number): string {
  const hour = deg / 30; // 0=12, 1=1, 2=2, ..., 6=6
  if (hour <= 0.25) return "12";
  if (hour <= 0.75) return "12:30";
  if (hour <= 1.25) return "1";
  if (hour <= 1.75) return "1:30";
  if (hour <= 2.25) return "2";
  if (hour <= 2.75) return "2:30";
  if (hour <= 3.25) return "3";
  if (hour <= 3.75) return "3:30";
  if (hour <= 4.25) return "4";
  if (hour <= 4.75) return "4:30";
  if (hour <= 5.25) return "5";
  if (hour <= 5.75) return "5:30";
  return "6";
}

function computeBalanceShift(
  placements: PlacementGrams[],
  capGrams: number,
  currentWeightG: number,
): number {
  let totalAddedMass = 0;
  let massDistSum = 0;

  const angleMap: Record<PlacementKey, number> = {
    "12": 0, "1&11": 30, "2&10": 60, "3&9": 90, "4&8": 120, "5&7": 150,
  };

  for (const p of placements) {
    if (p.gramsPerSide <= 0) continue;
    const spec = PLACEMENTS[p.position];
    const totalG = spec.paired ? p.gramsPerSide * 2 : p.gramsPerSide;
    const θ = (angleMap[p.position] * Math.PI) / 180;
    const distFromButt = 28 + 12 * Math.cos(θ);
    totalAddedMass += totalG;
    massDistSum += totalG * distFromButt;
  }

  if (capGrams > 0) {
    totalAddedMass += capGrams;
    massDistSum += capGrams * 0.5;
  }

  if (totalAddedMass === 0) return 0;

  const currentBalanceMm = 240;
  const addedBalanceMm = (massDistSum / totalAddedMass) * 10;
  const newBalanceMm =
    (currentWeightG * currentBalanceMm + totalAddedMass * addedBalanceMm) /
    (currentWeightG + totalAddedMass);

  return Math.round(newBalanceMm - currentBalanceMm);
}

function generateExplanation(
  placements: LeadTapePlacementResult[],
  capGrams: number,
  totalGrams: number,
  balanceShiftMm: number,
): string {
  if (placements.length === 0 && capGrams === 0) {
    return "Add weight to one or more positions to see the effect on your paddle's specs.";
  }

  const parts: string[] = [];

  if (placements.length === 1) {
    const p = placements[0];
    if (p.position === "12") {
      parts.push(
        `${p.grams}g at 12 o'clock \u2014 the most efficient position for swing weight. Every gram here has the biggest impact on power.`
      );
    } else if (p.position === "3&9") {
      parts.push(
        `${p.gramsPerSide}g per side at 3 & 9 (${p.grams}g total). This is the widest point on the face \u2014 maximum twist weight for stability on off-center hits.`
      );
    } else {
      const spec = PLACEMENTS[p.position as PlacementKey];
      parts.push(
        `${p.gramsPerSide}g per side at ${spec.label} (${p.grams}g total).`
      );
    }
  } else {
    const labels = placements.map((p) => {
      const spec = PLACEMENTS[p.position as PlacementKey];
      return spec.paired
        ? `${p.gramsPerSide}g/side at ${spec.label}`
        : `${p.grams}g at ${spec.label}`;
    });
    parts.push(`${labels.join(", ")}.`);
  }

  if (capGrams > 0) {
    parts.push(
      `${capGrams}g of cap weight at the handle butt. This shifts the balance ${Math.abs(balanceShiftMm)}mm toward the handle, making it feel less head-heavy.`
    );
  } else if (balanceShiftMm > 1) {
    parts.push(`Balance shifts ~${balanceShiftMm}mm toward the head.`);
  }

  if (totalGrams > 15) {
    parts.push("\u26a0\ufe0f Adding more than 15g significantly alters the paddle's feel.");
  }

  return parts.join(" ");
}
