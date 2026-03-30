"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Paddle, PaddleScore } from "@/lib/types";
import { paddleData } from "@/lib/paddle-data";
import { LeadTapeOptimizer } from "@/components/LeadTapeOptimizer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function selectBestLink(paddle: Paddle): string {
  return paddle.purchase_link || paddle.generic_affiliate_link || paddle.amazon_link || "#";
}

export default function PaddlePage() {
  const params = useParams();
  const id = Number(params.id);

  const paddle: PaddleScore | null = useMemo(() => {
    const found = (paddleData as Paddle[]).find((p) => p.id === id);
    if (!found) return null;
    return {
      ...found,
      matchPercentage: 0,
      reason: "",
      affiliateLink: selectBestLink(found),
    };
  }, [id]);

  if (!paddle) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-black">Paddle not found</h1>
        <Link href="/database" className="text-primary hover:underline mt-4 inline-block">
          Back to database
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/database"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to database
      </Link>

      <LeadTapeOptimizer selectedPaddle={paddle} />
    </div>
  );
}
