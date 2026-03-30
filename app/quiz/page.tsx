import { QuizContainer } from "@/components/QuizContainer";

export default function QuizPage() {
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black">Find Your Perfect Paddle</h1>
        <p className="text-muted-foreground mt-2">
          Answer a few quick questions and we&apos;ll match you from 727 paddles.
        </p>
      </div>
      <QuizContainer />
    </div>
  );
}
