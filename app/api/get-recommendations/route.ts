import { NextRequest, NextResponse } from "next/server";
import { PlayerProfile, Paddle } from "@/lib/types";
import { getRecommendations } from "@/lib/recommendations";
import { paddleData } from "@/lib/paddle-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const profile: PlayerProfile = {
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

  const recommendations = getRecommendations(profile, paddleData as Paddle[]);
  return NextResponse.json(recommendations);
}
