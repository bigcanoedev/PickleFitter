"use client";

import { useMemo } from "react";
import { Paddle, PaddleScore } from "@/lib/types";
import { paddleData } from "@/lib/paddle-data";
import { PaddleRankings } from "@/components/PaddleRankings";
import { selectBestLink } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function DatabaseClient() {
  const allPaddles: PaddleScore[] = useMemo(() => {
    return (paddleData as Paddle[]).map((p) => ({
      ...p,
      matchPercentage: 0,
      reason: "",
      affiliateLink: selectBestLink(p),
    }));
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-black">Paddle Database</h1>
        <p className="text-muted-foreground mt-2">
          {paddleData.length} paddles with specs, lab-tested performance data, and purchase links.
        </p>
        <div className="mt-4">
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/quiz">
              Want personalized matches? Take the Quiz
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      <PaddleRankings allRanked={allPaddles} startExpanded defaultSort="price" />
    </div>
  );
}
