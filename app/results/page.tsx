"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Paddle, PlayerProfile, PaddleScore } from "@/lib/types";
import { getAllRanked } from "@/lib/recommendations";
import { paddleData } from "@/lib/paddle-data";
import Link from "next/link";
import { PaddleCard } from "@/components/PaddleCard";
import { PickleballLoader } from "@/components/PickleballLoader";
import { PaddleRankings } from "@/components/PaddleRankings";
import { PaddleCustomizer } from "@/components/PaddleCustomizer";
import { LeadTapeOptimizer } from "@/components/LeadTapeOptimizer";
import { EmailSignup } from "@/components/EmailSignup";
import { ShareResults } from "@/components/ShareResults";
import { SocialProofInsights } from "@/components/SocialProofInsights";
import { track } from "@vercel/analytics";
import { paddleSlug } from "@/lib/utils";

function parseProfile(searchParams: URLSearchParams): PlayerProfile {
  return {
    playStyle: (searchParams.get("playStyle") as PlayerProfile["playStyle"]) || "Balanced",
    skillLevel: (searchParams.get("skillLevel") as PlayerProfile["skillLevel"]) || "Intermediate",
    gameType: (searchParams.get("gameType") as PlayerProfile["gameType"]) || "Both",
    swingSpeed: (searchParams.get("swingSpeed") as PlayerProfile["swingSpeed"]) || "Moderate",
    pointSource: (searchParams.get("pointSource") as PlayerProfile["pointSource"]) || "Mix",
    frustration: searchParams.get("frustration") || "None",
    armIssues: (searchParams.get("armIssues") as PlayerProfile["armIssues"]) || "None",
    feelPreference: (searchParams.get("feelPreference") as PlayerProfile["feelPreference"]) || "No preference",
    currentPaddle: searchParams.get("currentPaddle") || "",
    priorSport: (searchParams.get("priorSport") as PlayerProfile["priorSport"]) || "None",
    playingFrequency: (searchParams.get("playingFrequency") as PlayerProfile["playingFrequency"]) || "Regular",
    buildPreference: (searchParams.get("buildPreference") as PlayerProfile["buildPreference"]) || "No preference",
    shapePreference: (searchParams.get("shapePreference") as PlayerProfile["shapePreference"]) || "No preference",
    coreThickness: (searchParams.get("coreThickness") as PlayerProfile["coreThickness"]) || "No preference",
    spinPriority: (searchParams.get("spinPriority") as PlayerProfile["spinPriority"]) || "Medium",
    stabilityPreference: (searchParams.get("stabilityPreference") as PlayerProfile["stabilityPreference"]) || "No preference",
    customizationPreference: (searchParams.get("customizationPreference") as PlayerProfile["customizationPreference"]) || "No preference",
    handSize: (searchParams.get("handSize") as PlayerProfile["handSize"]) || "Medium",
    gripLength: (searchParams.get("gripLength") as PlayerProfile["gripLength"]) || "No preference",
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
    profile.pointSource !== "Mix" ? `Wins at ${profile.pointSource === "Drives" ? "baseline" : profile.pointSource === "Kitchen" ? "kitchen" : "net"}` : null,
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
  const [revealing, setRevealing] = useState(true);
  const [analyzeCount, setAnalyzeCount] = useState(0);

  const selectAndScroll = (p: PaddleScore) => {
    setSelectedPaddle(p);
    setTimeout(() => {
      document.getElementById("lead-tape-optimizer")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const profile = parseProfile(searchParams);
  const sessionId = searchParams.get("sessionId") || "";

  useEffect(() => {
    const ranked = getAllRanked(profile, paddleData as Paddle[]);
    setAllRanked(ranked);
    setRecommendations(ranked.slice(0, 3));
    if (ranked.length > 0) {
      setSelectedPaddle(ranked[0]);
      track("results_viewed", {
        top_match: `${ranked[0].brand} ${ranked[0].name}`,
        match_pct: ranked[0].matchPercentage,
        skill: profile.skillLevel,
        style: profile.playStyle,
      });
      // S4: Persist results for return visit banner
      try {
        localStorage.setItem("picklefitter_last_results", JSON.stringify({
          topPaddleName: `${ranked[0].brand} ${ranked[0].name}`,
          topPaddleMatch: ranked[0].matchPercentage,
          resultsUrl: window.location.href,
          timestamp: Date.now(),
        }));
        localStorage.removeItem("picklefitter_banner_dismissed");
      } catch {}
    }

    // Reveal animation: count up then show results
    const target = paddleData.length;
    const duration = 1800;
    const steps = 30;
    const increment = Math.ceil(target / steps);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnalyzeCount(target);
        clearInterval(timer);
        setTimeout(() => setRevealing(false), 400);
      } else {
        setAnalyzeCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (revealing) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <div className="space-y-1">
          <p className="text-lg font-bold">Analyzing {analyzeCount} paddles...</p>
          <p className="text-sm text-muted-foreground">Scoring against your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Section 1: Quiz Results — Hero #1 */}
      <section>
        <div className="text-center mb-8">
          {recommendations.length > 0 ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-black">
                Your #1 Match: {recommendations[0].brand} {recommendations[0].name}
              </h1>
              <p className="text-primary font-bold text-lg mt-1">
                {recommendations[0].matchPercentage}% match
              </p>
            </>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-black">Your Paddle Matches</h1>
          )}
          <p className="text-muted-foreground mt-2">
            {profile.skillLevel} {profile.playStyle} player, {profile.swingSpeed} swing
          </p>
          <ProfileSummary profile={profile} />
          {recommendations.length > 0 && (
            <div className="mt-4 flex justify-center">
              <ShareResults
                paddleName={`${recommendations[0].brand} ${recommendations[0].name}`}
                matchPercentage={recommendations[0].matchPercentage}
              />
            </div>
          )}
        </div>

        {/* Hero card for #1 */}
        {recommendations.length > 0 && (
          <div className="mb-6">
            <PaddleCard
              paddle={recommendations[0]}
              rank={1}
              onSelect={(p) => selectAndScroll(p)}
              showSelectButton
              currency={profile.currency}
            />
          </div>
        )}

        {/* #2 and #3 */}
        {recommendations.length > 1 && (
          <>
            <p className="text-sm font-bold text-muted-foreground mb-3">Also great for you:</p>
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.slice(1).map((paddle, i) => (
                <PaddleCard
                  key={paddle.id}
                  paddle={paddle}
                  rank={i + 2}
                  onSelect={(p) => selectAndScroll(p)}
                  showSelectButton
                  currency={profile.currency}
                />
              ))}
            </div>
          </>
        )}

        {/* Compare top 2 */}
        {recommendations.length >= 2 && (
          <div className="text-center mt-6">
            <Link
              href={`/compare/${paddleSlug(recommendations[0].brand, recommendations[0].name)}-vs-${paddleSlug(recommendations[1].brand, recommendations[1].name)}`}
              className="text-sm text-primary hover:underline font-medium"
            >
              Can&apos;t decide? Compare your top 2 head-to-head
            </Link>
          </div>
        )}
      </section>

      {/* Section 2: Social proof */}
      <SocialProofInsights profile={profile} />

      {/* Section 3: Email Signup — capture at peak excitement */}
      <section>
        <EmailSignup
          sessionId={sessionId}
          topPaddles={recommendations.map((p) => ({ id: p.id, name: p.name, brand: p.brand, price: p.price }))}
        />
      </section>

      {/* Section 3: Full Rankings */}
      {allRanked.length > 0 && (
        <section>
          <PaddleRankings
            allRanked={allRanked}
            onSelectPaddle={(p) => selectAndScroll(p)}
          />
        </section>
      )}

      {/* Section 4: Lead Tape Optimizer */}
      {selectedPaddle && (
        <section id="lead-tape-optimizer">
          <LeadTapeOptimizer selectedPaddle={selectedPaddle} />
        </section>
      )}
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
