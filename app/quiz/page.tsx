import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizContainer } from "@/components/QuizContainer";

export const metadata: Metadata = {
  title: "Pickleball Paddle Quiz — Find Your Perfect Match | PickleFitter",
  description:
    "Answer a few quick questions about your play style, skill level, and preferences. Our algorithm matches you from 727 lab-tested paddles in under 2 minutes.",
  alternates: { canonical: "https://picklefitter.com/quiz" },
  openGraph: {
    title: "Pickleball Paddle Quiz — Find Your Perfect Match",
    description:
      "Answer a few quick questions and get matched to your perfect pickleball paddle from 727 lab-tested options.",
    url: "https://picklefitter.com/quiz",
  },
};

export default function QuizPage() {
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black">Find Your Perfect Paddle</h1>
        <p className="text-muted-foreground mt-2">
          Answer a few quick questions and we&apos;ll match you from 727 paddles.
        </p>
      </div>
      <Suspense>
        <QuizContainer />
      </Suspense>
    </div>
  );
}
