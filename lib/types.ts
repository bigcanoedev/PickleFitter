export interface Paddle {
  id: number;
  name: string;
  brand: string;
  price: number;
  weight_oz: number;
  swing_weight: number;
  twist_weight: number;
  face_material: string;
  core_material: string | null;
  shape: string | null;            // "Standard", "Elongated", "Wide body", "Hybrid", "Teardrop"
  core_thickness_mm: number | null; // 8-20mm
  rpm: number | null;              // spin potential
  balance: number | null;          // mm from butt cap
  grip_length: number | null;      // inches
  grip_thickness: string | null;   // e.g. "4.25"
  // Lab-tested performance data (from Pickleball Effect)
  power_mph: number | null;           // ball speed on drives
  pop_mph: number | null;             // ball speed on short shots
  spin_rpm: number | null;            // measured spin rate
  firepower_z: number | null;         // composite power score
  firepower_tier: string | null;      // "Elite", "High", "Balanced", "Control+", "Soft"
  paddle_type: string | null;         // "Power", "All-Court", "Control"
  build_style: string | null;         // "Gen 1", "Gen 2", "Gen 3", "Gen 4"
  spin_rating: string | null;         // "Very High", "High", etc.
  power_percentile: string | null;
  pop_percentile: string | null;
  sw_percentile: string | null;
  tw_percentile: string | null;
  // Classification & metadata
  best_for: string;
  description: string;
  image_url: string;
  purchase_link: string | null;
  youtube_review: string | null;
  discount_code: string | null;
  amazon_link: string | null;
  generic_affiliate_link: string | null;
  preferred_link_type: string;
}

export interface PlayerProfile {
  playStyle: "Aggressive" | "Control" | "Balanced";
  skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Pro";
  gameType: "Singles" | "Doubles" | "Both";
  swingSpeed: "Slow" | "Moderate" | "Fast";
  frustration: string;
  armIssues: "None" | "Mild" | "Serious";
  feelPreference: "Soft" | "Crisp" | "No preference";
  currentPaddle: string; // free text, empty = no current paddle
  priorSport: "Tennis" | "Racquetball" | "Table tennis" | "None" | "Other";
  buildPreference: "Thermoformed" | "Traditional" | "No preference";
  shapePreference: "Standard" | "Elongated" | "Wide body" | "No preference";
  coreThickness: "Thin" | "Thick" | "No preference";
  spinPriority: "Low" | "Medium" | "High";
  stabilityPreference: "Stability" | "Maneuverability" | "No preference";
  handSize: "Small" | "Medium" | "Large";
  gripLength: "Short" | "Standard" | "Long" | "No preference";
  moistureLevel: "Low" | "Medium" | "High";
  currency: "USD" | "CAD";
  budgetMin: number;
  budgetMax: number;
}

export interface PaddleScore extends Paddle {
  matchPercentage: number;
  reason: string;
  affiliateLink: string;
}

export interface QuizAnswer {
  questionId: number;
  value: string;
}

export interface IdealSpecs {
  swingWeightRange: [number, number];
  twistWeightRange: [number, number];
  weightRange: [number, number];
  coreThicknessRange: [number, number];
  rpmRange: [number, number];
  preferredMaterials: string[];
  preferredShapes: string[];
}

export interface LeadTapePlacementResult {
  position: string;
  label: string;
  gramsPerSide: number;
  grams: number;
  swDelta: number;
  twDelta: number;
}

export interface LeadTapeCalculation {
  placements: LeadTapePlacementResult[];
  totalGrams: number;
  capGrams: number;
  resultingSwingWeight: number;
  resultingTwistWeight: number;
  resultingWeightOz: number;
  explanation: string;
}

export interface CustomizerSpecs {
  swingWeight: number;
  twistWeight: number;
  weight: number;
  material: string;
  budget?: string;
}
