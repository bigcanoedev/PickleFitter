"use client";

import { useState, useMemo } from "react";
import { Paddle, PaddleScore } from "@/lib/types";
import { scoreAllPaddles } from "@/lib/recommendations";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { PaddleCard } from "@/components/PaddleCard";

interface PaddleCustomizerProps {
  allPaddles: Paddle[];
  initialBudget?: string;
  onSelectPaddle?: (paddle: PaddleScore) => void;
}

export function PaddleCustomizer({ allPaddles, initialBudget, onSelectPaddle }: PaddleCustomizerProps) {
  const [swingWeight, setSwingWeight] = useState(120);
  const [twistWeight, setTwistWeight] = useState(6.5);
  const [weight, setWeight] = useState(7.8);
  const [material, setMaterial] = useState("Carbon");

  const matches = useMemo(() => {
    return scoreAllPaddles(
      { swingWeight, twistWeight, weight, material, budget: initialBudget },
      allPaddles
    );
  }, [swingWeight, twistWeight, weight, material, initialBudget, allPaddles]);

  const swDescription =
    swingWeight < 110
      ? "Responsive, quick repositioning"
      : swingWeight > 130
      ? "Solid, powerful momentum"
      : "Balanced feel";

  const twDescription =
    twistWeight < 6.0
      ? "Better for spin and touch"
      : twistWeight > 7.0
      ? "Maximum stability on off-center hits"
      : "Balanced stability";

  const wDescription =
    weight < 7.4
      ? "Lighter = easier maneuver, less power"
      : weight > 8.1
      ? "Heavier = more power, more momentum"
      : "Balanced weight";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black mb-2">Design Your Ideal Paddle</h2>
        <p className="text-muted-foreground">
          Adjust the specs below and see which real paddles match your design.
        </p>
      </div>

      <div className="space-y-6 bg-card border rounded-lg p-6">
        {/* Swing Weight */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label className="font-medium">Swing Weight</label>
            <span className="text-2xl font-bold text-primary">{swingWeight}</span>
          </div>
          <p className="text-xs text-muted-foreground">100 (light) to 140 (heavy)</p>
          <Slider
            min={100}
            max={140}
            step={1}
            value={[swingWeight]}
            onValueChange={([val]) => setSwingWeight(val)}
          />
          <p className="text-sm text-muted-foreground">{swDescription}</p>
        </div>

        {/* Twist Weight */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label className="font-medium">Twist Weight (Stability)</label>
            <span className="text-2xl font-bold text-primary">{twistWeight.toFixed(1)}</span>
          </div>
          <p className="text-xs text-muted-foreground">5.5 (spin-friendly) to 8.0 (stable)</p>
          <Slider
            min={5.5}
            max={8.0}
            step={0.1}
            value={[twistWeight]}
            onValueChange={([val]) => setTwistWeight(parseFloat(val.toFixed(1)))}
          />
          <p className="text-sm text-muted-foreground">{twDescription}</p>
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label className="font-medium">Weight</label>
            <span className="text-2xl font-bold text-primary">{weight.toFixed(1)} oz</span>
          </div>
          <p className="text-xs text-muted-foreground">7.0 (light) to 8.5 (heavy)</p>
          <Slider
            min={7.0}
            max={8.5}
            step={0.1}
            value={[weight]}
            onValueChange={([val]) => setWeight(parseFloat(val.toFixed(1)))}
          />
          <p className="text-sm text-muted-foreground">{wDescription}</p>
        </div>

        {/* Face Material */}
        <div className="space-y-2">
          <label className="font-medium">Face Material</label>
          <div className="flex flex-wrap gap-2">
            {["Carbon", "Hybrid", "Graphite", "Fiberglass"].map((mat) => (
              <Button
                key={mat}
                variant={material === mat ? "default" : "outline"}
                size="sm"
                onClick={() => setMaterial(mat)}
              >
                {mat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <h3 className="text-lg font-bold mb-4">Paddles That Match Your Design:</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {matches.map((match, i) => (
            <PaddleCard
              key={match.id}
              paddle={match}
              rank={i + 1}
              onSelect={onSelectPaddle}
              showSelectButton={!!onSelectPaddle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
