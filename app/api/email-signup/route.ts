import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") || "unknown";

    const { success } = rateLimit(`email:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await request.json();
    const { email, sessionId, recommendedPaddleId, topPaddles } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (supabase) {
      const insertData: Record<string, unknown> = {
        email,
        session_id: sessionId || null,
        recommended_paddle_id: recommendedPaddleId || null,
      };

      // S3: Store top paddle data for deal alerts (columns may not exist yet)
      if (topPaddles && Array.isArray(topPaddles)) {
        insertData.top_paddle_ids = topPaddles.map((p: { id: number }) => p.id);
        insertData.price_snapshot = topPaddles.map((p: { id: number; brand: string; name: string; price: number }) => ({
          id: p.id,
          name: `${p.brand} ${p.name}`,
          price: p.price,
        }));
      }

      try {
        await supabase.from("email_signups").insert(insertData);
      } catch {
        // Graceful fallback if new columns don't exist yet
        await supabase.from("email_signups").insert({
          email,
          session_id: sessionId || null,
          recommended_paddle_id: recommendedPaddleId || null,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
