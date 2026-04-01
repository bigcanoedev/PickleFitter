"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Paddle, PlayerProfile, PaddleScore } from "@/lib/types";
import { getAllRanked } from "@/lib/recommendations";
import { paddleData } from "@/lib/paddle-data";
import { PaddleCard } from "@/components/PaddleCard";
import { PickleballLoader } from "@/components/PickleballLoader";
import { PaddleRankings } from "@/components/PaddleRankings";
import { PaddleCustomizer } from "@/components/PaddleCustomizer";
import { LeadTapeOptimizer } from "@/components/LeadTapeOptimizer";
import { EmailSignup } from "@/components/EmailSignup";

function parseProfile(searchParams: URLSearchParams): PlayerProfile {
  return {
    playStyle: (searchParams.get("playStyle") as PlayerProfile["playStyle"]) || "Balanced",
    skillLevel: (searchParams.get("skillLevel") as PlayerProfile["skillLevel"]) || "Intermediate",
    gameType: (searchParams.get("gameType") as PlayerProfile["gameType"]) || "Both",
    swingSpeed: (searchParams.get("swingSpeed") as PlayerProfile["swingSpeed"]) || "Moderate",
    frustration: searchParams.get("frustration") || "Other",
    armIssues: (searchParams.get("armIssues") as PlayerProfile["armIssues"]) || "None",
    feelPreference: (searchParams.get("feelPreference") as PlayerProfile["feelPreference"]) || "No preference",
    currentPaddle: searchParams.get("currentPaddle") || "",
    priorSport: (searchParams.get("priorSport") as PlayerProfile["priorSport"]) || "None",
    buildPreference: (searchParams.get("buildPreference") as PlayerProfile["buildPreference"]) || "No preference",
    shapePreference: (searchParams.get("shapePreference") as PlayerProfile["shapePreference"]) || "No preference",
    coreThickness: (searchParams.get("coreThickness") as PlayerProfile["coreThickness"]) || "No preference",
    spinPriority: (searchParams.get("spinPriority") as PlayerProfile["spinPriority"]) || "Medium",
    stabilityPreference: (searchParams.get("stabilityPreference") as PlayerProfile["stabilityPreference"]) || "No preference",
    customizationPreference: (searchParams.get("customizationPreference") as PlayerProfile["customizationPreference"]) || "No preference",
    handSize: (searchParams.get("handSize") as PlayerProfile["handSize"]) || "Medium",
    gripLength: (searchParams.get("gripLength") as PlayerProfile["gripLength"]) || "No preference",
    moistureLevel: (searchParams.get("moistureLevel") as PlayerProfile["moistureLevel"]) || "Medium",
    currency: (searchParams.get("currency") as PlayerProfile["currency"]) || "USD",
    budgetMin: parseInt(searchParams.get("budgetMin") || "0") || 0,
    budgetMax: parseInt(searchParams.get("budgetMax") || "500") || 500,
  };
}

function ProfileSummary({ profile }: { profile: PlayerProfile }) {
  const tags = [
    profile.skillLevel,
    profile.playStyle,
    profile.gameType !== "Both" ? profile.gameType : null,
    `${profile.swingSpeed} swing`,
    profile.armIssues !== "None" ? `${profile.armIssues} arm issues` : null,
    profile.feelPreference !== "No preference" ? `${profile.feelPreference} feel` : null,
    profile.priorSport !== "None" ? `From ${profile.priorSport}` : null,
    profile.buildPreference !== "No preference" ? profile.buildPreference : null,
    profile.shapePreference !== "No preference" ? profile.shapePreference : null,
    profile.coreThickness !== "No preference" ? `${profile.coreThickness} core` : null,
    profile.spinPriority === "High" ? "High spin" : null,
    profile.stabilityPreference !== "No preference" ? profile.stabilityPreference : null,
    profile.customizationPreference === "Fine-tune" ? "Customizer" : profile.customizationPreference === "Out of the box" ? "Out of the box" : null,
    profile.currentPaddle ? `Upgrading from ${profile.currentPaddle}` : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-3">
      {tags.map((tag) => (
        <span key={tag} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
          {tag}
        </span>
      ))}
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [recommendations, setRecommendations] = useState<PaddleScore[]>([]);
  const [allRanked, setAllRanked] = useState<PaddleScore[]>([]);
  const [selectedPaddle, setSelectedPaddle] = useState<PaddleScore | null>(null);

  const selectAndScroll = (p: PaddleScore) => {
    setSelectedPaddle(p);
    // Small delay so the section renders before scrolling
    setTimeout(() => {
      document.getElementById("lead-tape-optimizer")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const profile = parseProfile(searchParams);
  const sessionId = searchParams.get("sessionId") || "";

  useEffect(() => {
    // Score all paddles once, top 3 = first 3
    const ranked = getAllRanked(profile, paddleData as Paddle[]);
    setAllRanked(ranked);
    setRecommendations(ranked.slice(0, 3));
    if (ranked.length > 0) {
      setSelectedPaddle(ranked[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-16">
      {/* Section 1: Quiz Results */}
      <section>
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black">Your Paddle Matches</h1>
          <p className="text-muted-foreground mt-2">
            Profile:{" "}
            <strong>
              {profile.skillLevel} {profile.playStyle} player, {profile.swingSpeed} swing
            </strong>
          </p>
          <ProfileSummary profile={profile} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {recommendations.map((paddle, i) => (
            <PaddleCard
              key={paddle.id}
              paddle={paddle}
              rank={i + 1}
              onSelect={(p) => selectAndScroll(p)}
              showSelectButton
              currency={profile.currency}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Full Rankings */}
      {allRanked.length > 0 && (
        <section>
          <PaddleRankings
            allRanked={allRanked}
            onSelectPaddle={(p) => selectAndScroll(p)}
          />
        </section>
      )}

      {/* Section 3: Lead Tape Optimizer */}
      {selectedPaddle && (
        <section id="lead-tape-optimizer">
          <LeadTapeOptimizer selectedPaddle={selectedPaddle} />
        </section>
      )}

      {/* Section 4: Email Signup */}
      <section>
        <EmailSignup
          sessionId={sessionId}
          recommendedPaddleId={selectedPaddle?.id}
        />
      </section>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<PickleballLoader text="Finding your perfect paddles..." />}>
      <ResultsContent />
    </Suspense>
  );
}
