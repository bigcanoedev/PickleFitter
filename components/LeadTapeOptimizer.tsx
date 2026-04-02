"use client";

import { useState, useMemo, useCallback } from "react";
import { PaddleScore } from "@/lib/types";
import {
  calculateLeadTape,
  PLACEMENTS,
  PLACEMENT_KEYS,
  PRESETS,
  MAX_REALISTIC_TW,
  PlacementKey,
  PlacementGrams,
} from "@/lib/lead-tape";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";


interface LeadTapeOptimizerProps {
  selectedPaddle: PaddleScore;
}

export function LeadTapeOptimizer({ selectedPaddle }: LeadTapeOptimizerProps) {
  // Each placement has its own grams-per-side value (0 = inactive)
  const [placementGrams, setPlacementGrams] = useState<Record<PlacementKey, number>>({
    "12": 0,
    "1&11": 0,
    "2&10": 0,
    "3&9": 3,
    "4&8": 0,
    "5&7": 0,
  });
  const [capGrams, setCapGrams] = useState(0);

  const activePlacements: PlacementGrams[] = useMemo(
    () =>
      PLACEMENT_KEYS.filter((k) => placementGrams[k] > 0).map((k) => ({
        position: k,
        gramsPerSide: placementGrams[k],
      })),
    [placementGrams]
  );

  const calculation = useMemo(
    () =>
      calculateLeadTape(
        selectedPaddle.swing_weight,
        selectedPaddle.twist_weight,
        selectedPaddle.weight_oz,
        activePlacements,
        capGrams
      ),
    [selectedPaddle, activePlacements, capGrams]
  );

  const setGrams = useCallback((key: PlacementKey, value: number) => {
    setPlacementGrams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((preset: (typeof PRESETS)[number]) => {
    const newGrams: Record<PlacementKey, number> = {
      "12": 0, "1&11": 0, "2&10": 0, "3&9": 0, "4&8": 0, "5&7": 0,
    };
    for (const p of preset.placements) {
      newGrams[p.position] = p.gramsPerSide;
    }
    setPlacementGrams(newGrams);
    setCapGrams(preset.capGrams);
  }, []);

  const swDelta = parseFloat((calculation.resultingSwingWeight - selectedPaddle.swing_weight).toFixed(1));
  const twDelta = parseFloat((calculation.resultingTwistWeight - selectedPaddle.twist_weight).toFixed(1));
  const weightDelta = parseFloat((calculation.resultingWeightOz - selectedPaddle.weight_oz).toFixed(1));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-2">Lead Tape Optimizer</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Calibrated to Thrive Pickleball RDC measurements. Actual results may vary slightly with paddle shape.
        </p>
      </div>

      {/* Current Paddle - prominent card */}
      <div className="border-2 border-primary rounded-lg p-3 sm:p-4 bg-primary/5">
        <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="text-xs text-primary font-medium uppercase tracking-wide">Optimizing</div>
            <div className="text-lg sm:text-xl font-bold truncate">{selectedPaddle.name}</div>
            <div className="text-sm text-muted-foreground">{selectedPaddle.brand} &middot; ${selectedPaddle.price}</div>
          </div>
          {selectedPaddle.firepower_tier && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium whitespace-nowrap shrink-0">
              {selectedPaddle.firepower_tier.replace("Firepower ", "")}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 text-center text-sm">
          <div className="bg-background rounded-lg p-1.5 sm:p-2">
            <div className="text-[10px] sm:text-xs text-muted-foreground">Swing Wt</div>
            <div className="text-base sm:text-lg font-bold">{selectedPaddle.swing_weight}</div>
          </div>
          <div className="bg-background rounded-lg p-1.5 sm:p-2">
            <div className="text-[10px] sm:text-xs text-muted-foreground">Twist Wt</div>
            <div className="text-base sm:text-lg font-bold">{selectedPaddle.twist_weight}</div>
          </div>
          <div className="bg-background rounded-lg p-1.5 sm:p-2">
            <div className="text-[10px] sm:text-xs text-muted-foreground">Weight</div>
            <div className="text-base sm:text-lg font-bold">{parseFloat(selectedPaddle.weight_oz.toFixed(1))} oz</div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="secondary"
              size="sm"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPlacementGrams({ "12": 0, "1&11": 0, "2&10": 0, "3&9": 0, "4&8": 0, "5&7": 0 });
              setCapGrams(0);
            }}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Placement Controls + Diagram + Results */}
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6">
        {/* Left: Placement gram sliders */}
        <div className="space-y-3 order-2 md:order-1">
          <label className="font-medium">Head Placements</label>
          <p className="text-xs text-muted-foreground mb-1">
            Set grams per side for each position. Paired positions apply equal weight to both sides.
          </p>

          {PLACEMENT_KEYS.map((key) => {
            const spec = PLACEMENTS[key];
            const grams = placementGrams[key];
            const isActive = grams > 0;
            const totalAtPosition = spec.paired ? grams * 2 : grams;

            return (
              <div
                key={key}
                className={`rounded-lg border p-3 transition-all ${
                  isActive ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex justify-between items-center mb-1 gap-2">
                  <div className="min-w-0">
                    <span className="font-medium text-sm">{spec.label}</span>
                    <span className="text-[10px] text-muted-foreground ml-1 sm:ml-2 hidden sm:inline">
                      {spec.swPerGram} SW &middot; {spec.twPerGram} TW /g
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-primary text-sm">
                      {grams > 0
                        ? spec.paired
                          ? `${grams}g/side (${totalAtPosition}g)`
                          : `${grams}g`
                        : "off"}
                    </span>
                  </div>
                </div>
                <Slider
                  min={0}
                  max={8}
                  step={0.5}
                  value={[grams]}
                  onValueChange={([val]) => setGrams(key, val)}
                />
              </div>
            );
          })}

          {/* Cap Weight */}
          <div
            className={`rounded-lg border p-3 transition-all ${
              capGrams > 0 ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <div>
                <span className="font-medium text-sm">Cap weight</span>
                <span className="text-[10px] text-muted-foreground ml-2">
                  handle butt &middot; shifts balance toward hand
                </span>
              </div>
              <span className="font-bold text-primary text-sm">
                {capGrams > 0 ? `${capGrams}g` : "off"}
              </span>
            </div>
            <Slider
              min={0}
              max={6}
              step={0.5}
              value={[capGrams]}
              onValueChange={([val]) => setCapGrams(val)}
            />
          </div>
        </div>

        {/* Center: SVG Diagram */}
        <div className="flex justify-center items-start pt-2 md:pt-6 order-1 md:order-2">
          <PaddleDiagram
            placementGrams={placementGrams}
            capGrams={capGrams}
            shape={selectedPaddle.shape}
            paddleName={selectedPaddle.name}
          />
        </div>

        {/* Right: Results */}
        <div className="space-y-4 order-3 md:order-3">
          <label className="font-medium">Resulting Specs</label>

          {/* 3-column summary */}
          <div className="grid grid-cols-1 gap-2">
            <ResultCard
              label="Swing Weight"
              before={selectedPaddle.swing_weight}
              after={calculation.resultingSwingWeight}
              delta={swDelta}
              highlight={swDelta > 0}
            />
            <ResultCard
              label="Twist Weight"
              before={selectedPaddle.twist_weight}
              after={calculation.resultingTwistWeight}
              delta={twDelta}
              highlight={twDelta > 0}
            />
            <ResultCard
              label="Total Weight"
              before={selectedPaddle.weight_oz}
              after={calculation.resultingWeightOz}
              delta={weightDelta}
              suffix=" oz"
            />
          </div>

          {/* Breakdown table */}
          {(calculation.placements.length > 0 || capGrams > 0) && (
            <div className="border rounded-lg overflow-hidden text-xs sm:text-sm">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-2 sm:px-3 py-2 font-medium">Position</th>
                    <th className="text-right px-2 sm:px-3 py-2 font-medium">Tape</th>
                    <th className="text-right px-2 sm:px-3 py-2 font-medium">+SW</th>
                    <th className="text-right px-2 sm:px-3 py-2 font-medium">+TW</th>
                  </tr>
                </thead>
                <tbody>
                  {calculation.placements.map((p) => (
                    <tr key={p.position} className="border-t">
                      <td className="px-2 sm:px-3 py-1.5">{p.label}</td>
                      <td className="text-right px-2 sm:px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                        <span className="hidden sm:inline">{p.gramsPerSide}g/side ({p.grams}g)</span>
                        <span className="sm:hidden">{p.grams}g</span>
                      </td>
                      <td className="text-right px-2 sm:px-3 py-1.5 text-primary font-medium">
                        +{p.swDelta}
                      </td>
                      <td className="text-right px-2 sm:px-3 py-1.5 text-primary font-medium">
                        +{p.twDelta}
                      </td>
                    </tr>
                  ))}
                  {capGrams > 0 && (
                    <tr className="border-t">
                      <td className="px-2 sm:px-3 py-1.5">
                        Cap
                        <span className="hidden sm:inline"> weight</span>
                      </td>
                      <td className="text-right px-2 sm:px-3 py-1.5 text-muted-foreground">
                        {capGrams}g
                      </td>
                      <td className="text-right px-2 sm:px-3 py-1.5 text-muted-foreground font-medium">
                        +{(capGrams * 0.09).toFixed(1)}
                      </td>
                      <td className="text-right px-2 sm:px-3 py-1.5">0</td>
                    </tr>
                  )}
                  <tr className="border-t bg-muted font-medium">
                    <td className="px-2 sm:px-3 py-2">Total</td>
                    <td className="text-right px-2 sm:px-3 py-2">{calculation.totalGrams}g</td>
                    <td className="text-right px-2 sm:px-3 py-2 text-primary">
                      {swDelta > 0 ? "+" : ""}{swDelta}
                    </td>
                    <td className="text-right px-2 sm:px-3 py-2 text-primary">
                      {twDelta > 0 ? "+" : ""}{twDelta}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Explanation */}
      {calculation.totalGrams > 0 && (
        <p className="text-sm text-muted-foreground bg-muted rounded-lg p-4">
          {calculation.explanation}
        </p>
      )}

      {/* Warning for unrealistic twist weight */}
      {calculation.resultingTwistWeight > MAX_REALISTIC_TW && (
        <div className="border border-orange-300 bg-orange-50 rounded-lg p-4 text-sm text-orange-800">
          <strong>Heads up:</strong> A twist weight of {calculation.resultingTwistWeight} is beyond
          what any production paddle achieves (max ~{MAX_REALISTIC_TW}). The highest in our database
          of 727 paddles is 8.34. At this level, the estimates become less reliable.
        </div>
      )}

      {/* Warning for excessive weight */}
      {calculation.totalGrams > 15 && (
        <div className="border border-orange-300 bg-orange-50 rounded-lg p-4 text-sm text-orange-800">
          <strong>Heads up:</strong> Adding more than 15g of tape significantly changes how the
          paddle feels and may affect durability.
        </div>
      )}

    </div>
  );
}

/* ───────────────── Result Card ───────────────── */

function ResultCard({
  label,
  before,
  after,
  delta,
  suffix = "",
  highlight = false,
}: {
  label: string;
  before: number;
  after: number;
  delta: number;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-primary/50 bg-primary/5" : ""}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-base sm:text-lg font-bold">
          {before}{suffix} &rarr;{" "}
          <span className="text-primary">{after}{suffix}</span>
        </div>
        <div
          className={`text-sm font-medium ${
            delta > 0 ? "text-primary" : delta < 0 ? "text-orange-500" : "text-muted-foreground"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {delta}{suffix}
        </div>
      </div>
    </div>
  );
}

/* ───────────────── SVG Paddle Diagram ───────────────── */

// Keep it simple: ellipse face + thin handle. Scale by shape.
const SHAPE_DIMS: Record<string, { rx: number; ry: number; label: string }> = {
  Standard:     { rx: 38, ry: 50, label: "Standard" },
  "Wide body":  { rx: 42, ry: 46, label: "Wide Body" },
  Hybrid:       { rx: 36, ry: 54, label: "Hybrid" },
  Elongated:    { rx: 34, ry: 58, label: "Elongated" },
  Teardrop:     { rx: 37, ry: 55, label: "Teardrop" },
};

const TAPE_ANGLES: Record<PlacementKey, number[]> = {
  "12": [0], "1&11": [30, -30], "2&10": [60, -60],
  "3&9": [90, -90], "4&8": [120, -120], "5&7": [150, -150],
};

const TAPE_COLORS = ["#0d9488","#2563eb","#7c3aed","#db2777","#ea580c","#16a34a"];

/** Compute a point on the paddle face edge at a given clock angle.
 *  This is the shared function used by BOTH the face outline AND tape placement. */
function edgePt(absA: number, sign: number, cx: number, rx: number, ry: number, faceCY: number) {
  const faceT = faceCY - ry;
  const faceB = faceCY + ry;
  let px: number, py: number;
  if (absA === 0) {
    px = cx; py = faceT;
  } else if (absA <= 45) {
    const t = absA / 45;
    px = cx + sign * rx * t;
    py = faceT + (ry * 0.15) * t;
  } else if (absA <= 90) {
    const t = (absA - 45) / 45;
    px = cx + sign * rx;
    py = faceT + ry * 0.15 + (ry * 0.85) * t;
  } else if (absA <= 135) {
    const t = (absA - 90) / 45;
    px = cx + sign * rx * (1 - t * 0.15);
    py = faceCY + ry * t;
  } else {
    const t = (absA - 135) / 45;
    px = cx + sign * rx * (0.85 - t * 0.55);
    py = faceB - ry * 0.05 * (1 - t);
  }
  return { x: px, y: py };
}

function PaddleDiagram({
  placementGrams, capGrams, shape,
}: {
  placementGrams: Record<PlacementKey, number>;
  capGrams: number;
  shape: string | null;
  paddleName: string;
}) {
  const dims = (shape && SHAPE_DIMS[shape]) || SHAPE_DIMS.Standard;
  const cx = 60;
  const faceCY = dims.ry + 6;
  const { rx, ry } = dims;

  const throatTop = faceCY + ry;
  const handleTop = throatTop + 10;
  const handleH = 44;
  const handleBot = handleTop + handleH;
  const hw = 5; // handle half-width
  const svgH = handleBot + 10;

  const activeKeys = PLACEMENT_KEYS.filter((k) => placementGrams[k] > 0);
  const colorMap = new Map<string, string>();
  activeKeys.forEach((k, i) => colorMap.set(k, TAPE_COLORS[i % TAPE_COLORS.length]));

  return (
    <svg className="w-[120px] sm:w-[150px]" viewBox={`0 0 120 ${svgH}`}>
      <defs>
        <radialGradient id="fg" cx="44%" cy="40%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </radialGradient>
        <linearGradient id="hg" x1="0" x2="1">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="50%" stopColor="#4b5563" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
      </defs>

      {/* Face shadow */}
      <rect x={cx-rx+1} y={faceCY-ry+2} width={rx*2} height={ry*2} rx={rx*0.7} ry={ry*0.45} fill="#0001" />

      {/* Edge guard */}
      <rect x={cx-rx-2} y={faceCY-ry-2} width={rx*2+4} height={ry*2+4} rx={(rx+2)*0.7} ry={(ry+2)*0.45}
        fill="none" stroke="#9ca3af" strokeWidth="3"/>

      {/* Face */}
      <rect x={cx-rx} y={faceCY-ry} width={rx*2} height={ry*2} rx={rx*0.7} ry={ry*0.45}
        fill="url(#fg)" stroke="#b0b8c1" strokeWidth="0.8"/>

      {/* Throat */}
      <path d={`M${cx-10},${throatTop-4} Q${cx-10},${handleTop} ${cx-hw},${handleTop} L${cx+hw},${handleTop} Q${cx+10},${handleTop} ${cx+10},${throatTop-4}`}
        fill="#d4d8de" stroke="#b0b8c1" strokeWidth="0.6"/>

      {/* Handle */}
      <rect x={cx-hw} y={handleTop} width={hw*2} height={handleH} rx="2.5" fill="url(#hg)" stroke="#1f2937" strokeWidth="0.5"/>

      {/* Grip wraps */}
      {[0,1,2,3,4,5].map(i=>(
        <line key={i} x1={cx-hw+1} y1={handleTop+4+i*5} x2={cx+hw-1} y2={handleTop+5.5+i*5}
          stroke="#6b7280" strokeWidth="0.4" opacity="0.5"/>
      ))}

      {/* Butt cap */}
      <rect x={cx-hw-1} y={handleBot-1} width={hw*2+2} height="4" rx="2" fill="#1f2937"/>

      {/* Tape strips */}
      {PLACEMENT_KEYS.map(key => {
        const grams = placementGrams[key];
        if (grams <= 0) return null;
        const angles = TAPE_ANGLES[key];
        const spec = PLACEMENTS[key];
        const color = colorMap.get(key) || TAPE_COLORS[0];
        const sLen = Math.min(6 + grams * 2, 16);
        const sW = Math.min(2 + grams * 0.4, 5);

        return (
          <g key={key}>
            {angles.map((a, i) => {
              const rad = (a * Math.PI) / 180;
              const px = cx + rx * Math.sin(rad);
              const py = faceCY - ry * Math.cos(rad);
              return <rect key={i} x={-sLen/2} y={-sW/2} width={sLen} height={sW} rx={sW/2}
                fill={color} opacity={0.9}
                transform={`translate(${px.toFixed(1)},${py.toFixed(1)}) rotate(${a})`}/>;
            })}
            <text x={cx} y={faceCY - ry + ry*2*(Math.abs(angles[0])/180) + 2}
              textAnchor="middle" fontSize="5" fontWeight="700" fill={color}>
              {spec.paired ? `${grams}g/s` : `${grams}g`}
            </text>
          </g>
        );
      })}

      {/* Cap weight */}
      {capGrams > 0 && (
        <g>
          <rect x={cx-3} y={handleBot} width="6" height={Math.min(capGrams+2, 5)} rx="1.5"
            fill={TAPE_COLORS[activeKeys.length % TAPE_COLORS.length]} opacity="0.85"/>
          <text x={cx} y={handleBot+10} textAnchor="middle" fontSize="4" fontWeight="700" fill="#0d9488">
            Cap {capGrams}g
          </text>
        </g>
      )}

      {/* Shape label */}
      <text x={cx} y={svgH-2} textAnchor="middle" fontSize="4.5" fill="#9ca3af">{dims.label}</text>
    </svg>
  );
}
