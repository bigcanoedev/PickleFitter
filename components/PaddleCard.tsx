"use client";

import { PaddleScore } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { BuyButtons } from "@/components/BuyButtons";

interface PaddleCardProps {
  paddle: PaddleScore;
  rank?: number;
  onSelect?: (paddle: PaddleScore) => void;
  showSelectButton?: boolean;
  currency?: "USD" | "CAD";
}

export function PaddleCard({ paddle, rank, onSelect, showSelectButton, currency = "USD" }: PaddleCardProps) {
  const price = currency === "CAD" ? Math.round(paddle.price * 1.36) : paddle.price;
  const symbol = currency === "CAD" ? "CA$" : "$";
  return (
    <Card className="relative overflow-hidden">
      {rank && (
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
          #{rank}
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{paddle.brand}</div>
        <CardTitle className="text-lg">{paddle.name}</CardTitle>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-2xl font-bold text-primary">{symbol}{price}</span>
          <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs font-medium">
            {paddle.matchPercentage}% match
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary specs */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-muted rounded p-2">
            <div className="font-bold text-sm">{paddle.swing_weight}</div>
            <div className="text-muted-foreground">Swing Wt</div>
          </div>
          <div className="bg-muted rounded p-2">
            <div className="font-bold text-sm">{paddle.twist_weight}</div>
            <div className="text-muted-foreground">Twist Wt</div>
          </div>
          <div className="bg-muted rounded p-2">
            <div className="font-bold text-sm">{parseFloat(paddle.weight_oz.toFixed(1))}oz</div>
            <div className="text-muted-foreground">Weight</div>
          </div>
        </div>

        {/* Secondary specs */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {paddle.core_thickness_mm && (
            <div className="bg-muted rounded p-2">
              <div className="font-bold text-sm">{paddle.core_thickness_mm}mm</div>
              <div className="text-muted-foreground">Core</div>
            </div>
          )}
          {paddle.rpm && (
            <div className="bg-muted rounded p-2">
              <div className="font-bold text-sm">{paddle.rpm}</div>
              <div className="text-muted-foreground">RPM</div>
            </div>
          )}
          {paddle.shape && (
            <div className="bg-muted rounded p-2">
              <div className="font-bold text-sm">{paddle.shape}</div>
              <div className="text-muted-foreground">Shape</div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="bg-secondary px-2 py-0.5 rounded">{paddle.face_material}</span>
          {paddle.core_material && (
            <span className="bg-secondary px-2 py-0.5 rounded">{paddle.core_material}</span>
          )}
        </div>

        {/* Reason */}
        <p className="text-sm text-muted-foreground">{paddle.reason}</p>

        {/* Actions */}
        <BuyButtons paddle={paddle} />
        {showSelectButton && onSelect && (
          <Button variant="outline" onClick={() => onSelect(paddle)} className="gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Optimize
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
