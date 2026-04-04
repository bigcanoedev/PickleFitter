import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") || "unknown";

    const { success } = rateLimit(`quiz:${ip}`, { limit: 10, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await request.json();
    const { sessionId, answers } = body;

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from("quiz_responses").insert({
        session_id: sessionId,
        play_style: answers.playStyle,
        skill_level: answers.skillLevel,
        game_type: answers.gameType,
        swing_speed: answers.swingSpeed,
        frustration: answers.frustration,
        shape_preference: answers.shapePreference,
        core_thickness: answers.coreThickness,
        spin_priority: answers.spinPriority,
        hand_size: answers.handSize,
        moisture_level: answers.moistureLevel,
        budget: answers.budget,
        recommended_paddles: null,
        clicked_affiliate: false,
        clicked_customizer: false,
        clicked_lead_tape: false,
        email: null,
      });
    }

    return NextResponse.json({ success: true, sessionId });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
