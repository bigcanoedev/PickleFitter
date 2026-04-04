import { NextRequest, NextResponse } from "next/server";
import { PlayerProfile, Paddle } from "@/lib/types";
import { getRecommendations } from "@/lib/recommendations";
import { paddleData } from "@/lib/paddle-data";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") || "unknown";

  const { success } = rateLimit(`recommendations:${ip}`, { limit: 15, windowMs: 60_000 });
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const { searchParams } = new URL(request.url);

  const profile: PlayerProfile = {
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

  const recommendations = getRecommendations(profile, paddleData as Paddle[]);
  return NextResponse.json(recommendations);
}
