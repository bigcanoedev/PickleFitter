"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmailSignupProps {
  sessionId?: string;
  recommendedPaddleId?: number;
}

export function EmailSignup({ sessionId, recommendedPaddleId }: EmailSignupProps) {
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
        body: JSON.stringify({ email, sessionId, recommendedPaddleId }),
      });
      setSubmitted(true);
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
          <div className="text-2xl font-bold mb-2">You&apos;re in!</div>
          <p className="text-muted-foreground">
            We&apos;ll check in with you in 2 weeks to see how your new paddle is working out.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Get a 2-Week Check-In</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          We&apos;ll follow up in 2 weeks to see how your paddle choice is working out, plus send
          gear recommendations based on your play style.
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
            {loading ? "..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
