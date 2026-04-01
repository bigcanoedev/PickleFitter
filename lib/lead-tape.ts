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
 */

/** Realistic upper bound for twist weight — the highest in our 727-paddle database is 8.34 */
export const MAX_REALISTIC_TW = 9.0;

/**
 * Calculate resulting specs from user-specified grams at each position.
 * For paired positions, gramsPerSide means the weight on EACH side.
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
      return {
        position: p.position,
        label: spec.label,
        gramsPerSide: p.gramsPerSide,
        grams: totalGrams,
        swDelta: parseFloat((totalGrams * spec.swPerGram).toFixed(1)),
        twDelta: parseFloat((totalGrams * spec.twPerGram).toFixed(2)),
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
