"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { track } from "@vercel/analytics";

export function FooterEmailSignup() {
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
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
      track("email_signup", { source: "footer" });
    } catch {
      // Fail silently
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <p className="text-sm text-primary font-medium">You&apos;re on the list!</p>;
  }

  return (
    <div className="w-full sm:w-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-56"
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "..." : "Subscribe"}
        </Button>
      </form>
      <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-center sm:text-left">
        Unsubscribe anytime.{" "}
        <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
      </p>
    </div>
  );
}
