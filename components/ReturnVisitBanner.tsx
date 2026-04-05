"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const RESULTS_KEY = "picklefitter_last_results";
const DISMISSED_KEY = "picklefitter_banner_dismissed";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface SavedResults {
  topPaddleName: string;
  topPaddleMatch: number;
  resultsUrl: string;
  timestamp: number;
}

export function ReturnVisitBanner() {
  const [data, setData] = useState<SavedResults | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
      const raw = localStorage.getItem(RESULTS_KEY);
      if (!raw) return;
      const parsed: SavedResults = JSON.parse(raw);
      if (Date.now() - parsed.timestamp > MAX_AGE_MS) {
        localStorage.removeItem(RESULTS_KEY);
        return;
      }
      setData(parsed);
    } catch {}
  }, []);

  if (!data || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  return (
    <div className="bg-primary/5 border-b border-primary/20 px-3 sm:px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            Welcome back! Your top match was{" "}
            <strong className="text-primary">{data.topPaddleName}</strong> at{" "}
            <strong>{data.topPaddleMatch}%</strong> match.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" className="h-7 text-xs">
            <Link href={data.resultsUrl}>View Results</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-7 text-xs">
            <Link href="/quiz">Retake Quiz</Link>
          </Button>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
