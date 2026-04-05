"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { track } from "@vercel/analytics";

interface TopPaddle {
  id: number;
  name: string;
  brand: string;
  price: number;
}

interface EmailSignupProps {
  sessionId?: string;
  recommendedPaddleId?: number;
  topPaddles?: TopPaddle[];
}

export function EmailSignup({ sessionId, recommendedPaddleId, topPaddles }: EmailSignupProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await fetch("/api/email-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          sessionId,
          recommendedPaddleId: recommendedPaddleId || topPaddles?.[0]?.id,
          topPaddles,
        }),
      });
      setSubmitted(true);
      track("email_signup", { source: "results" });
    } catch {
      // Fail silently for MVP
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold mb-2">Saved!</div>
          <p className="text-muted-foreground">
            Your top matches and buy links are on the way. You&apos;ll also get alerts if any go on sale.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Save Your Results</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Get your top matches with buy links emailed to you, plus deal alerts if any go on sale.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "..." : "Email My Results"}
          </Button>
        </form>
        <p className="text-[11px] text-muted-foreground/60 mt-2">
          We&apos;ll email your results and occasional deal alerts. Unsubscribe anytime.{" "}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
      </CardContent>
    </Card>
  );
}
