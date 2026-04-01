import { Paddle, PlayerProfile, PaddleScore, IdealSpecs, CustomizerSpecs } from "./types";

/**
 * Recommendation Engine v3
 *
 * Uses lab-tested data from Pickleball Effect where available (Power MPH,
 * Pop MPH, Spin RPM, Firepower tiers) combined with specs from Pickleball Studio.
 *
 * Scoring weights:
 *   20% - Swing weight match
 *   12% - Twist weight match
 *   12% - Core thickness match
 *   12% - Shape match
 *   10% - Spin match (RPM)
 *   10% - Lab power match (Power MPH + Firepower tier)
 *   6%  - Face material match
 *   5%  - Weight match
 *   8%  - Budget fit
 *   5%  - Build style match (thermoformed vs traditional)
 *   4%  - Lab bonus (paddles with lab data get a slight edge for trust)
 */

const WEIGHTS = {
  swingWeight: 0.17,
  twistWeight: 0.10,
  coreThickness: 0.09,
  shape: 0.09,
  rpm: 0.08,
  labPower: 0.10,
  feel: 0.07,
  buildStyle: 0.05,
  grip: 0.06,
  material: 0.05,
  weight: 0.03,
  budget: 0.07,
  labBonus: 0.04,
};

// ── Ideal spec calculation ──────────────────────────────────────────────────
//
// Research-backed ranges from:
//   - Pro Pickleball Store: Light 80-110, Medium 110-120, Heavy 120+
//   - Picklebowls: Low <110, High >125, Control = mid-to-low, Power = high
//   - Pickleball Studio: Beginners → thicker core, Singles → thinner core
//   - JustPaddles/PickleballEffect: 14mm = power/singles, 16mm = control/doubles
//   - Shape guides: Elongated = singles/power, Widebody = doubles/forgiveness
//   - Demographics: Women/teens 105-115, Men/fitness 115-125
//   - TW: <5 = small sweet spot, 5-7 = most players, 7+ = maximum forgiveness

/** Try to find the user's current paddle in our database by fuzzy matching. */
function findCurrentPaddle(currentPaddleStr: string, allPaddles?: Paddle[]): Paddle | null {
  if (!currentPaddleStr || !allPaddles) return null;

  const query = currentPaddleStr.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  if (!query) return null;

  let bestMatch: Paddle | null = null;
  let bestScore = 0;

  for (const paddle of allPaddles) {
    const name = `${paddle.brand} ${paddle.name}`.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();

    // Exact match
    if (name === query) return paddle;

    // Count how many query words appear in the paddle name
    const queryWords = query.split(/\s+/);
    const matchedWords = queryWords.filter((w) => name.includes(w)).length;
    const score = matchedWords / queryWords.length;

    if (score > bestScore && score >= 0.6) {
      bestScore = score;
      bestMatch = paddle;
    }
  }

  return bestMatch;
}

function calculateIdealSpecs(profile: PlayerProfile, allPaddles?: Paddle[]): IdealSpecs {
  // ── If user specified a current paddle, anchor specs to it ──
  const currentPaddleMatch = findCurrentPaddle(profile.currentPaddle, allPaddles);

  // Base specs: anchor to current paddle if found, otherwise use research defaults
  const specs: IdealSpecs = currentPaddleMatch
    ? {
        // Center ranges around the current paddle's specs (±10 for SW, ±0.8 for TW, etc.)
        swingWeightRange: [currentPaddleMatch.swing_weight - 10, currentPaddleMatch.swing_weight + 10],
        twistWeightRange: [
          Math.max(5, (currentPaddleMatch.twist_weight || 6.5) - 0.8),
          (currentPaddleMatch.twist_weight || 6.5) + 0.8,
        ],
        weightRange: [
          Math.max(7, currentPaddleMatch.weight_oz - 0.4),
          currentPaddleMatch.weight_oz + 0.4,
        ],
        coreThicknessRange: currentPaddleMatch.core_thickness_mm
          ? [currentPaddleMatch.core_thickness_mm - 1.5, currentPaddleMatch.core_thickness_mm + 1.5]
          : [14, 16],
        rpmRange: currentPaddleMatch.rpm
          ? [currentPaddleMatch.rpm - 300, currentPaddleMatch.rpm + 300]
          : [1200, 1800],
        preferredMaterials: [currentPaddleMatch.face_material, "Carbon", "Hybrid"],
        preferredShapes: currentPaddleMatch.shape
          ? [currentPaddleMatch.shape, "Hybrid"]
          : ["Standard", "Hybrid", "Wide body", "Elongated"],
      }
    : {
        // Research-based defaults for balanced intermediate
        swingWeightRange: [110, 120],
        twistWeightRange: [6.0, 7.0],
        weightRange: [7.4, 8.0],
        coreThicknessRange: [14, 16],
        rpmRange: [1200, 1800],
        preferredMaterials: ["Carbon", "Hybrid"],
        preferredShapes: ["Standard", "Hybrid", "Wide body", "Elongated"],
      };

  // ── Skill level (research: beginners 100-115, intermediate 110-120, advanced 120+) ──
  if (profile.skillLevel === "Beginner") {
    specs.swingWeightRange = [100, 115];  // "Light range" — quick hands, forgiving
    specs.twistWeightRange = [6.5, 8.5];  // 7+ = max forgiveness, beginners need this
    specs.coreThicknessRange = [15, 16];  // Thicker = bigger sweet spot, Pickleball Studio recommends for <3.5
    specs.preferredMaterials = ["Fiberglass", "Hybrid", "Composite"]; // Forgiving, cheaper
    specs.preferredShapes = ["Standard", "Wide body"]; // Biggest sweet spot
  } else if (profile.skillLevel === "Advanced") {
    specs.swingWeightRange = [115, 128];  // Upper medium to heavy
    specs.twistWeightRange = [5.8, 7.5];
    specs.preferredMaterials = ["Carbon", "Hybrid"];
  } else if (profile.skillLevel === "Pro") {
    specs.swingWeightRange = [118, 135];  // "Heavy range" 120+ for power players
    specs.twistWeightRange = [5.5, 7.5];  // Pros can handle lower TW
    specs.preferredMaterials = ["Carbon", "Hybrid"];
  }

  // ── Play style (research: control = mid-to-low SW, power = high SW) ──
  if (profile.playStyle === "Aggressive") {
    specs.swingWeightRange[0] += 5;   // Power players lean toward 120+
    specs.swingWeightRange[1] += 5;
    specs.twistWeightRange[0] += 0.3; // Higher TW = more stable for hard hits
    specs.weightRange = [7.7, 8.5];
    specs.preferredMaterials = ["Carbon", "Hybrid"];
  } else if (profile.playStyle === "Control") {
    specs.swingWeightRange[0] -= 5;   // Control = easier to maneuver
    specs.swingWeightRange[1] -= 3;
    specs.weightRange = [7.2, 7.8];
  }

  // ── Game type (research: elongated for singles, widebody for doubles) ──
  if (profile.gameType === "Singles") {
    specs.swingWeightRange[0] += 3;   // Singles = more drives, benefit from momentum
    specs.swingWeightRange[1] += 5;
    specs.coreThicknessRange = [13, 14.5]; // Thinner = more pop for passing shots
    specs.preferredShapes = ["Elongated", "Hybrid"]; // Reach matters in singles
  } else if (profile.gameType === "Doubles") {
    specs.swingWeightRange[0] -= 3;   // Doubles = fast hands at kitchen
    specs.swingWeightRange[1] -= 2;
    specs.coreThicknessRange = [15, 16]; // Thicker = better resets and dinks
    specs.preferredShapes = ["Standard", "Wide body", "Hybrid"]; // Sweet spot > reach
  }

  // ── Swing speed ──
  if (profile.swingSpeed === "Fast") {
    specs.swingWeightRange[1] += 5;   // Fast swingers can handle heavy paddles
  } else if (profile.swingSpeed === "Slow") {
    specs.swingWeightRange[0] -= 5;   // Light SW = easier to swing
    specs.swingWeightRange[1] -= 3;
  }

  // ── Core thickness preference ──
  if (profile.coreThickness === "Thin") {
    specs.coreThicknessRange = [13, 14.5];
  } else if (profile.coreThickness === "Thick") {
    specs.coreThicknessRange = [15.5, 20];
  }

  // ── Spin priority ──
  if (profile.spinPriority === "High") {
    specs.rpmRange = [1600, 2400];
    // Raw carbon faces generate the most spin
    if (!specs.preferredMaterials.includes("Carbon")) {
      specs.preferredMaterials.unshift("Carbon");
    }
  } else if (profile.spinPriority === "Low") {
    specs.rpmRange = [900, 1500];
  }

  // ── Shape preference override ──
  if (profile.shapePreference !== "No preference") {
    specs.preferredShapes = [profile.shapePreference];
  }

  // ── Arm/wrist/elbow issues (hard override — safety first) ──
  if (profile.armIssues === "Serious") {
    specs.swingWeightRange = [
      Math.min(specs.swingWeightRange[0], 105),
      Math.min(specs.swingWeightRange[1], 115),
    ];
    specs.twistWeightRange = [
      Math.max(specs.twistWeightRange[0], 7.0),
      Math.max(specs.twistWeightRange[1], 8.5),
    ];
    specs.coreThicknessRange = [15, 20]; // thicker = more shock absorption
  } else if (profile.armIssues === "Mild") {
    specs.swingWeightRange[1] = Math.min(specs.swingWeightRange[1], 122);
    specs.twistWeightRange[0] = Math.max(specs.twistWeightRange[0], 6.5);
    specs.coreThicknessRange[0] = Math.max(specs.coreThicknessRange[0], 14);
  }

  // ── Prior racquet sport ──
  if (profile.priorSport === "Tennis") {
    // Tennis players are used to heavier racquets and elongated frames
    specs.swingWeightRange[0] += 3;
    specs.swingWeightRange[1] += 5;
    if (!profile.shapePreference || profile.shapePreference === "No preference") {
      specs.preferredShapes = ["Elongated", "Hybrid"];
    }
  } else if (profile.priorSport === "Racquetball") {
    // Racquetball = fast wrist action, want lighter and maneuverable
    specs.swingWeightRange[0] -= 3;
    specs.swingWeightRange[1] -= 2;
  } else if (profile.priorSport === "Table tennis") {
    // Table tennis = extreme wrist control, light paddles, spin-focused
    specs.swingWeightRange[0] -= 5;
    specs.swingWeightRange[1] -= 3;
    specs.rpmRange[0] += 100;
    specs.rpmRange[1] += 200;
  }

  // ── Frustration adjustments ──
  if (profile.frustration === "Power") {
    specs.swingWeightRange[0] += 3;
    specs.swingWeightRange[1] += 5;
  } else if (profile.frustration === "Control") {
    specs.swingWeightRange[0] -= 5;
    specs.swingWeightRange[1] -= 3;
  } else if (profile.frustration === "Vibration") {
    specs.twistWeightRange[0] += 0.5;
    specs.twistWeightRange[1] += 0.5;
  } else if (profile.frustration === "Spin") {
    specs.rpmRange[0] += 200;
    specs.rpmRange[1] += 200;
  } else if (profile.frustration === "Fatigue") {
    specs.swingWeightRange[0] -= 5;
    specs.swingWeightRange[1] = Math.min(specs.swingWeightRange[1], 118);
    specs.twistWeightRange[0] = Math.max(specs.twistWeightRange[0], 6.5);
    specs.coreThicknessRange[0] = Math.max(specs.coreThicknessRange[0], 15);
  }

  // ── Stability vs maneuverability (narrows TW range) ──
  if (profile.stabilityPreference === "Stability") {
    // Player wants forgiveness: push TW range upward
    specs.twistWeightRange[0] = Math.max(specs.twistWeightRange[0], 6.5);
    specs.twistWeightRange[1] = Math.max(specs.twistWeightRange[1], 7.5);
  } else if (profile.stabilityPreference === "Maneuverability") {
    // Player wants touch/quick adjustments: push TW range lower
    specs.twistWeightRange[1] = Math.min(specs.twistWeightRange[1], 6.5);
    specs.twistWeightRange[0] = Math.min(specs.twistWeightRange[0], 5.5);
  }

  // ── Customization preference (lighter paddles = more headroom for tape) ──
  if (profile.customizationPreference === "Fine-tune") {
    // Shift weight range down — prefer paddles with room to add tape
    specs.weightRange[0] = Math.max(6.8, specs.weightRange[0] - 0.4);
    specs.weightRange[1] -= 0.3;
    // Widen SW and TW ranges — they'll fine-tune to their ideal with tape
    specs.swingWeightRange[0] -= 8;
    specs.twistWeightRange[0] -= 0.5;
  }

  return specs;
}

// ── Scoring functions ───────────────────────────────────────────────────────

function rangeScore(value: number, min: number, max: number, falloffPerUnit: number): number {
  if (value >= min && value <= max) {
    // Peaked curve: 100 at center, tapering to 85 at the edges.
    // This differentiates paddles within the "acceptable" range —
    // center-of-range is preferred over edge-of-range.
    const center = (min + max) / 2;
    const halfSpan = (max - min) / 2;
    if (halfSpan === 0) return 100;
    const distFromCenter = Math.abs(value - center) / halfSpan; // 0 at center, 1 at edge
    return 100 - 15 * distFromCenter * distFromCenter; // quadratic: 100 at center, 85 at edge
  }
  const dist = value < min ? min - value : value - max;
  return Math.max(0, 85 - dist * falloffPerUnit);
}

function scoreSwingWeight(paddle: Paddle, specs: IdealSpecs): number {
  return rangeScore(paddle.swing_weight, specs.swingWeightRange[0], specs.swingWeightRange[1], 3);
}

function scoreTwistWeight(paddle: Paddle, specs: IdealSpecs): number {
  if (!paddle.twist_weight) return 50;
  return rangeScore(paddle.twist_weight, specs.twistWeightRange[0], specs.twistWeightRange[1], 12);
}

function scoreCoreThickness(paddle: Paddle, specs: IdealSpecs): number {
  if (!paddle.core_thickness_mm) return 50;
  return rangeScore(paddle.core_thickness_mm, specs.coreThicknessRange[0], specs.coreThicknessRange[1], 15);
}

function scoreShape(paddle: Paddle, specs: IdealSpecs): number {
  if (!paddle.shape) return 50;
  if (specs.preferredShapes.length === 0) return 80;
  // Exact match = 100, adjacent shapes get partial credit
  if (specs.preferredShapes.includes(paddle.shape)) return 100;
  // Hybrid shape gets partial credit against everything
  if (paddle.shape === "Hybrid") return 75;
  if (specs.preferredShapes.includes("Hybrid")) return 70;
  return 40;
}

function scoreRpm(paddle: Paddle, specs: IdealSpecs): number {
  if (!paddle.rpm) return 50;
  return rangeScore(paddle.rpm, specs.rpmRange[0], specs.rpmRange[1], 0.08);
}

function scoreMaterial(paddle: Paddle, specs: IdealSpecs): number {
  if (specs.preferredMaterials.length === 0) return 80;
  const idx = specs.preferredMaterials.indexOf(paddle.face_material);
  if (idx === 0) return 100;
  if (idx > 0) return 85;
  // Partial credit for similar materials
  if (paddle.face_material === "Hybrid" || paddle.face_material === "Composite") return 65;
  return 50;
}

/**
 * Score grip fit based on hand size and grip style preference.
 *
 * Hand size → grip circumference:
 *   Small:  4" - 4.125"
 *   Medium: 4.125" - 4.25"
 *   Large:  4.25" - 4.5"
 *
 * Grip length preference:
 *   "Short":  4.75" - 5.25" (compact, wrist-driven, table tennis style)
 *   "Standard": 5.25" - 5.75" (one-handed, most players)
 *   "Long":  5.75"+ (two-handed backhand, tennis style, extra leverage)
 */
function scoreGrip(paddle: Paddle, profile: PlayerProfile): number {
  let score = 70; // neutral if no data

  // Grip circumference based on hand size
  if (paddle.grip_thickness) {
    const thickness = parseFloat(paddle.grip_thickness);
    if (!isNaN(thickness)) {
      const idealRanges: Record<string, [number, number]> = {
        Small:  [3.9, 4.125],
        Medium: [4.1, 4.25],
        Large:  [4.25, 4.5],
      };
      const range = idealRanges[profile.handSize];
      if (range) {
        if (thickness >= range[0] && thickness <= range[1]) {
          score = 100;
        } else {
          const dist = thickness < range[0] ? range[0] - thickness : thickness - range[1];
          score = Math.max(30, 100 - dist * 150);
        }
      }
    }
  }

  // Grip length preference
  if (paddle.grip_length && profile.gripLength && profile.gripLength !== "No preference") {
    const len = paddle.grip_length;
    const idealLenRanges: Record<string, [number, number]> = {
      Short:    [4.5, 5.25],
      Standard: [5.25, 5.75],
      Long:     [5.75, 7.0],
    };
    const range = idealLenRanges[profile.gripLength];
    if (range) {
      if (len >= range[0] && len <= range[1]) {
        // keep score or boost it
        score = Math.min(100, score + 10);
      } else {
        const dist = len < range[0] ? range[0] - len : len - range[1];
        score = Math.max(20, score - dist * 40);
      }
    }
  }

  return score;
}

/**
 * Score feel preference: Soft → Firepower Soft/Control+, Crisp → High/Elite.
 * Also considers core thickness: thicker cores = softer feel.
 */
function scoreFeel(paddle: Paddle, profile: PlayerProfile): number {
  if (profile.feelPreference === "No preference") return 70;

  let score = 50;

  // Firepower tier is the best indicator of feel
  if (paddle.firepower_tier) {
    if (profile.feelPreference === "Soft") {
      const tierScores: Record<string, number> = {
        "Firepower Soft": 100,
        "Firepower Control+": 90,
        "Firepower Balanced": 65,
        "Firepower High": 35,
        "Firepower Elite": 20,
      };
      score = tierScores[paddle.firepower_tier] ?? 50;
    } else if (profile.feelPreference === "Crisp") {
      const tierScores: Record<string, number> = {
        "Firepower Soft": 20,
        "Firepower Control+": 40,
        "Firepower Balanced": 65,
        "Firepower High": 90,
        "Firepower Elite": 100,
      };
      score = tierScores[paddle.firepower_tier] ?? 50;
    }
  } else {
    // Fallback: use core thickness as proxy for feel
    if (paddle.core_thickness_mm) {
      if (profile.feelPreference === "Soft") {
        score = paddle.core_thickness_mm >= 16 ? 85 : paddle.core_thickness_mm >= 14 ? 60 : 35;
      } else if (profile.feelPreference === "Crisp") {
        score = paddle.core_thickness_mm <= 14 ? 85 : paddle.core_thickness_mm <= 16 ? 60 : 35;
      }
    }
  }

  return score;
}

/**
 * Score build style preference: Thermoformed = Gen 3/4, Traditional = Gen 1/2.
 */
function scoreBuildStyle(paddle: Paddle, profile: PlayerProfile): number {
  if (profile.buildPreference === "No preference") return 70;
  if (!paddle.build_style) return 50;

  const isThermo = paddle.build_style.includes("Gen 3") || paddle.build_style.includes("Gen 4");
  const isTrad = paddle.build_style.includes("Gen 1") || paddle.build_style.includes("Gen 2") || paddle.build_style === "No Gen";

  if (profile.buildPreference === "Thermoformed") {
    if (isThermo) return 100;
    if (isTrad) return 30;
    return 50;
  } else if (profile.buildPreference === "Traditional") {
    if (isTrad) return 100;
    if (isThermo) return 30;
    return 50;
  }

  return 50;
}

function scoreWeight(paddle: Paddle, specs: IdealSpecs): number {
  if (!paddle.weight_oz) return 50;
  return rangeScore(paddle.weight_oz, specs.weightRange[0], specs.weightRange[1], 15);
}

/**
 * Score lab-tested power data.
 * Power players want high Power MPH / Firepower Elite or High.
 * Control players want lower power / Firepower Control+ or Soft.
 * Balanced players want Firepower Balanced.
 */
function scoreLabPower(paddle: Paddle, profile: PlayerProfile): number {
  // If no lab data, neutral score
  if (!paddle.power_mph && !paddle.firepower_tier) return 50;

  let score = 50;

  if (paddle.firepower_tier) {
    const tierScores: Record<string, Record<string, number>> = {
      Aggressive: {
        "Firepower Elite": 100,
        "Firepower High": 95,
        "Firepower Balanced": 70,
        "Firepower Control+": 40,
        "Firepower Soft": 25,
      },
      Control: {
        "Firepower Elite": 30,
        "Firepower High": 40,
        "Firepower Balanced": 75,
        "Firepower Control+": 95,
        "Firepower Soft": 90,
      },
      Balanced: {
        "Firepower Elite": 60,
        "Firepower High": 80,
        "Firepower Balanced": 100,
        "Firepower Control+": 80,
        "Firepower Soft": 60,
      },
    };
    score = tierScores[profile.playStyle]?.[paddle.firepower_tier] ?? 50;
  } else if (paddle.power_mph) {
    // Fallback: use raw power MPH
    if (profile.playStyle === "Aggressive") {
      score = paddle.power_mph >= 56 ? 100 : paddle.power_mph >= 54 ? 80 : 50;
    } else if (profile.playStyle === "Control") {
      score = paddle.power_mph <= 53 ? 90 : paddle.power_mph <= 55 ? 70 : 40;
    } else {
      score = paddle.power_mph >= 54 && paddle.power_mph <= 56 ? 90 : 60;
    }
  }

  return score;
}

function scoreLabBonus(paddle: Paddle): number {
  // Paddles with lab data are more trustworthy recommendations
  if (paddle.power_mph && paddle.firepower_tier) return 100;
  if (paddle.power_mph || paddle.firepower_tier) return 75;
  return 30;
}

function scoreBudget(paddle: Paddle, profile: PlayerProfile): number {
  const price = paddle.price * (profile.currency === "CAD" ? 1.36 : 1);
  const min = profile.budgetMin;
  const max = profile.budgetMax;
  if (price >= min && price <= max) return 100;
  const dist = price < min ? min - price : price - max;
  return Math.max(0, 100 - dist * 0.4);
}

// ── Reason generation ───────────────────────────────────────────────────────

function generateReason(paddle: Paddle, specs: IdealSpecs, profile: PlayerProfile): string {
  const reasons: string[] = [];

  // Swing weight match
  const swMid = (specs.swingWeightRange[0] + specs.swingWeightRange[1]) / 2;
  if (Math.abs(paddle.swing_weight - swMid) <= 5) {
    if (profile.playStyle === "Aggressive") {
      reasons.push(`SW ${paddle.swing_weight} matches your aggressive style`);
    } else if (profile.playStyle === "Control") {
      reasons.push(`SW ${paddle.swing_weight} for precise control`);
    } else {
      reasons.push(`SW ${paddle.swing_weight} fits your swing`);
    }
  }

  // Shape match
  if (paddle.shape && specs.preferredShapes.includes(paddle.shape)) {
    if (profile.gameType === "Singles" && paddle.shape === "Elongated") {
      reasons.push("Elongated for singles reach");
    } else if (paddle.shape === "Wide body") {
      reasons.push("Wide body for maximum sweet spot");
    } else if (paddle.shape) {
      reasons.push(`${paddle.shape} shape`);
    }
  }

  // Core thickness
  if (paddle.core_thickness_mm) {
    if (profile.coreThickness === "Thin" && paddle.core_thickness_mm <= 14) {
      reasons.push(`${paddle.core_thickness_mm}mm for fast hands`);
    } else if (profile.coreThickness === "Thick" && paddle.core_thickness_mm >= 16) {
      reasons.push(`${paddle.core_thickness_mm}mm for power & pop`);
    }
  }

  // Spin
  if (paddle.spin_rpm && profile.spinPriority === "High" && paddle.spin_rpm >= 1600) {
    reasons.push(`${paddle.spin_rpm} RPM spin`);
  } else if (paddle.rpm && profile.spinPriority === "High" && paddle.rpm >= 1600) {
    reasons.push(`${paddle.rpm} RPM spin`);
  }

  // Lab power data
  if (paddle.firepower_tier) {
    if (profile.playStyle === "Aggressive" && (paddle.firepower_tier === "Firepower Elite" || paddle.firepower_tier === "Firepower High")) {
      reasons.push(`Lab-tested ${paddle.firepower_tier.replace("Firepower ", "")}`);
    }
    if (profile.playStyle === "Control" && (paddle.firepower_tier === "Firepower Control+" || paddle.firepower_tier === "Firepower Soft")) {
      reasons.push(`Lab-tested ${paddle.firepower_tier.replace("Firepower ", "")}`);
    }
  }
  if (paddle.power_mph && profile.playStyle === "Aggressive") {
    reasons.push(`${paddle.power_mph} MPH power`);
  }

  // Twist weight / stability
  if (profile.frustration === "Vibration" && paddle.twist_weight && paddle.twist_weight >= 7.0) {
    reasons.push(`TW ${paddle.twist_weight} for stability`);
  }

  // Material
  if (profile.frustration === "Power" && paddle.face_material === "Carbon") {
    reasons.push("Carbon face for max power");
  }
  if (profile.frustration === "Spin" && paddle.face_material === "Carbon") {
    reasons.push("Raw carbon for grip on the ball");
  }

  // Skill level
  if (profile.skillLevel === "Beginner" && paddle.twist_weight && paddle.twist_weight >= 7.0) {
    reasons.push("Forgiving on off-center hits");
  }

  // Arm issues
  if (profile.armIssues === "Serious" && paddle.twist_weight && paddle.twist_weight >= 7.0 && paddle.swing_weight <= 115) {
    reasons.push("Arm-friendly: low SW + high TW");
  }

  // Feel preference
  if (profile.feelPreference === "Soft" && paddle.firepower_tier === "Firepower Soft") {
    reasons.push("Soft muted feel");
  } else if (profile.feelPreference === "Crisp" && (paddle.firepower_tier === "Firepower Elite" || paddle.firepower_tier === "Firepower High")) {
    reasons.push("Crisp lively feel");
  }

  // Build style
  if (profile.buildPreference === "Thermoformed" && paddle.build_style?.includes("Gen 3")) {
    reasons.push("Gen 3 thermoformed");
  } else if (profile.buildPreference === "Thermoformed" && paddle.build_style?.includes("Gen 4")) {
    reasons.push("Gen 4 thermoformed");
  } else if (profile.buildPreference === "Traditional" && (paddle.build_style?.includes("Gen 1") || paddle.build_style?.includes("Gen 2"))) {
    reasons.push("Traditional build");
  }

  // Grip fit
  if (paddle.grip_thickness) {
    const t = parseFloat(paddle.grip_thickness);
    if (!isNaN(t)) {
      if (profile.handSize === "Small" && t <= 4.125) reasons.push(`${t}" grip fits small hands`);
      else if (profile.handSize === "Large" && t >= 4.25) reasons.push(`${t}" grip fits large hands`);
    }
  }
  if (paddle.grip_length && profile.gripLength === "Long" && paddle.grip_length >= 5.75) {
    reasons.push(`${paddle.grip_length}" handle for two-handed backhand`);
  } else if (paddle.grip_length && profile.gripLength === "Short" && paddle.grip_length <= 5.25) {
    reasons.push(`${paddle.grip_length}" compact handle`);
  }

  // Prior sport
  if (profile.priorSport === "Tennis" && paddle.shape === "Elongated") {
    reasons.push("Elongated shape familiar for tennis players");
  }

  // Customization headroom
  if (profile.customizationPreference === "Fine-tune" && paddle.weight_oz && paddle.weight_oz <= 8.1) {
    const headroomOz = 8.5 - paddle.weight_oz;
    const headroomG = Math.round(headroomOz * 28.35);
    if (headroomG >= 8) {
      reasons.push(`Starts at ${paddle.weight_oz.toFixed(1)} oz — room for ${headroomG}g of tape`);
    }
  }

  if (reasons.length === 0) {
    reasons.push(`Good match for ${profile.playStyle.toLowerCase()} ${profile.gameType.toLowerCase()} play`);
  }

  return reasons.slice(0, 3).join(" \u2022 ");
}

// ── Affiliate link selection ────────────────────────────────────────────────

function selectBestAffiliateLink(paddle: Paddle): string {
  if (paddle.purchase_link) return paddle.purchase_link;
  if (paddle.generic_affiliate_link) return paddle.generic_affiliate_link;
  if (paddle.amazon_link) return paddle.amazon_link;
  return "#";
}

// ── Main recommendation function ────────────────────────────────────────────

export function getRecommendations(profile: PlayerProfile, allPaddles: Paddle[]): PaddleScore[] {
  const idealSpecs = calculateIdealSpecs(profile, allPaddles);
  const currentPaddle = findCurrentPaddle(profile.currentPaddle, allPaddles);

  const scoredPaddles: PaddleScore[] = allPaddles.map((paddle) => {
    const scores = {
      swingWeight: scoreSwingWeight(paddle, idealSpecs),
      twistWeight: scoreTwistWeight(paddle, idealSpecs),
      coreThickness: scoreCoreThickness(paddle, idealSpecs),
      shape: scoreShape(paddle, idealSpecs),
      rpm: scoreRpm(paddle, idealSpecs),
      labPower: scoreLabPower(paddle, profile),
      feel: scoreFeel(paddle, profile),
      buildStyle: scoreBuildStyle(paddle, profile),
      grip: scoreGrip(paddle, profile),
      material: scoreMaterial(paddle, idealSpecs),
      weight: scoreWeight(paddle, idealSpecs),
      budget: scoreBudget(paddle, profile),
      labBonus: scoreLabBonus(paddle),
    };

    const total =
      scores.swingWeight * WEIGHTS.swingWeight +
      scores.twistWeight * WEIGHTS.twistWeight +
      scores.coreThickness * WEIGHTS.coreThickness +
      scores.shape * WEIGHTS.shape +
      scores.rpm * WEIGHTS.rpm +
      scores.labPower * WEIGHTS.labPower +
      scores.feel * WEIGHTS.feel +
      scores.buildStyle * WEIGHTS.buildStyle +
      scores.grip * WEIGHTS.grip +
      scores.material * WEIGHTS.material +
      scores.weight * WEIGHTS.weight +
      scores.budget * WEIGHTS.budget +
      scores.labBonus * WEIGHTS.labBonus;

    const isCurrentPaddle = currentPaddle && paddle.id === currentPaddle.id;
    let reason = generateReason(paddle, idealSpecs, profile);
    if (isCurrentPaddle) {
      reason = "\u2705 This is your current paddle! " + reason;
    }

    return {
      ...paddle,
      matchPercentage: Math.round(total),
      reason,
      affiliateLink: selectBestAffiliateLink(paddle),
    };
  });

  return scoredPaddles.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3);
}

/** Returns ALL paddles scored and ranked (for the full rankings table). */
export function getAllRanked(profile: PlayerProfile, allPaddles: Paddle[]): PaddleScore[] {
  const idealSpecs = calculateIdealSpecs(profile, allPaddles);
  const currentPaddle = findCurrentPaddle(profile.currentPaddle, allPaddles);

  return allPaddles
    .map((paddle) => {
      const scores = {
        swingWeight: scoreSwingWeight(paddle, idealSpecs),
        twistWeight: scoreTwistWeight(paddle, idealSpecs),
        coreThickness: scoreCoreThickness(paddle, idealSpecs),
        shape: scoreShape(paddle, idealSpecs),
        rpm: scoreRpm(paddle, idealSpecs),
        labPower: scoreLabPower(paddle, profile),
        feel: scoreFeel(paddle, profile),
        buildStyle: scoreBuildStyle(paddle, profile),
        grip: scoreGrip(paddle, profile),
        material: scoreMaterial(paddle, idealSpecs),
        weight: scoreWeight(paddle, idealSpecs),
        budget: scoreBudget(paddle, profile),
        labBonus: scoreLabBonus(paddle),
      };

      const total =
        scores.swingWeight * WEIGHTS.swingWeight +
        scores.twistWeight * WEIGHTS.twistWeight +
        scores.coreThickness * WEIGHTS.coreThickness +
        scores.shape * WEIGHTS.shape +
        scores.rpm * WEIGHTS.rpm +
        scores.labPower * WEIGHTS.labPower +
        scores.feel * WEIGHTS.feel +
        scores.buildStyle * WEIGHTS.buildStyle +
        scores.grip * WEIGHTS.grip +
        scores.material * WEIGHTS.material +
        scores.weight * WEIGHTS.weight +
        scores.budget * WEIGHTS.budget +
        scores.labBonus * WEIGHTS.labBonus;

      const isCurrentPaddle = currentPaddle && paddle.id === currentPaddle.id;
      let reason = generateReason(paddle, idealSpecs, profile);
      if (isCurrentPaddle) {
        reason = "\u2705 This is your current paddle! " + reason;
      }

      return {
        ...paddle,
        matchPercentage: Math.round(total),
        reason,
        affiliateLink: selectBestAffiliateLink(paddle),
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

// ── Customizer scoring (unchanged, uses spec-based matching) ────────────────

export function scoreAllPaddles(specs: CustomizerSpecs, allPaddles: Paddle[]): PaddleScore[] {
  const scoredPaddles: PaddleScore[] = allPaddles.map((paddle) => {
    const swDiff = Math.abs(paddle.swing_weight - specs.swingWeight);
    const swMatch = Math.max(0, 100 - swDiff * 3);

    const twDiff = Math.abs(paddle.twist_weight - specs.twistWeight);
    const twMatch = Math.max(0, 100 - twDiff * 12);

    const wDiff = Math.abs(paddle.weight_oz - specs.weight);
    const wMatch = Math.max(0, 100 - wDiff * 15);

    const materialMatch = paddle.face_material === specs.material ? 100 : 65;

    let score = swMatch * 0.35 + twMatch * 0.25 + wMatch * 0.15 + materialMatch * 0.1;

    // Budget adjustment (customizer uses simple string budget, convert to range)
    if (specs.budget) {
      const budgetRanges: Record<string, [number, number]> = {
        Budget: [0, 150], Mid: [100, 210], Premium: [170, 500],
      };
      const [bMin, bMax] = budgetRanges[specs.budget] || [0, 500];
      const inBudget = paddle.price >= bMin && paddle.price <= bMax ? 100 : Math.max(0, 100 - Math.abs(paddle.price - (bMin + bMax) / 2) * 0.4);
      score = score * 0.85 + inBudget * 0.15;
    }

    const reasons: string[] = [];
    if (swDiff <= 3) reasons.push(`SW ${paddle.swing_weight} spot on`);
    if (twDiff <= 0.3) reasons.push(`TW ${paddle.twist_weight} matches`);
    if (paddle.face_material === specs.material) reasons.push(`${specs.material} face`);
    if (paddle.shape) reasons.push(paddle.shape);

    return {
      ...paddle,
      matchPercentage: Math.round(score),
      reason: reasons.length > 0 ? reasons.join(" \u2022 ") : "Solid overall match",
      affiliateLink: selectBestAffiliateLink(paddle),
    };
  });

  return scoredPaddles.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3);
}
