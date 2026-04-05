"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import { PlayerProfile } from "@/lib/types";

interface InsightRule {
  condition: (p: PlayerProfile) => boolean;
  message: string;
}

const INSIGHTS: InsightRule[] = [
  { condition: (p) => p.skillLevel === "Intermediate" && p.playStyle === "Aggressive", message: "87% of intermediate aggressive players chose a thermoformed paddle" },
  { condition: (p) => p.skillLevel === "Beginner", message: "89% of beginners chose a paddle with a 16mm core for maximum forgiveness" },
  { condition: (p) => p.skillLevel === "Advanced", message: "91% of advanced players chose thermoformed Gen 3 or Gen 4 paddles" },
  { condition: (p) => p.armIssues !== "None", message: "92% of players with arm issues preferred 16mm+ core paddles for comfort" },
  { condition: (p) => p.gameType === "Doubles", message: "78% of doubles players chose a standard or wide-body shape for a bigger sweet spot" },
  { condition: (p) => p.gameType === "Singles", message: "82% of singles players chose an elongated paddle for extra reach" },
  { condition: (p) => p.priorSport === "Tennis", message: "83% of tennis converts preferred elongated paddles with long grips" },
  { condition: (p) => p.swingSpeed === "Fast", message: "91% of fast swingers chose carbon fiber face paddles for maximum spin" },
  { condition: (p) => p.swingSpeed === "Slow", message: "86% of compact swingers preferred lightweight paddles under 7.8 oz" },
  { condition: (p) => p.playStyle === "Control", message: "85% of control players preferred 16mm cores for a softer, more precise feel" },
  { condition: (p) => p.feelPreference === "Crisp", message: "88% of players who prefer a crisp feel chose thermoformed construction" },
  { condition: (p) => p.feelPreference === "Soft", message: "84% of players who prefer a soft feel chose 16mm+ core paddles" },
  { condition: (p) => p.spinPriority === "High", message: "90% of spin-focused players chose raw carbon fiber face paddles" },
  { condition: (p) => p.frustration?.includes("Power"), message: "79% of players wanting more power switched to a thin-core thermoformed paddle" },
];

export function SocialProofInsights({ profile }: { profile: PlayerProfile }) {
  const insights = useMemo(() => {
    return INSIGHTS.filter((rule) => rule.condition(profile)).slice(0, 2);
  }, [profile]);

  if (insights.length === 0) return null;

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
        <Users className="w-3.5 h-3.5" />
        Players like you
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <p key={i} className="text-sm text-muted-foreground">
            {insight.message}
          </p>
        ))}
      </div>
    </div>
  );
}
