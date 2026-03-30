"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Loader2, DollarSign } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateSessionId } from "@/lib/utils";
import { paddleData } from "@/lib/paddle-data";

interface QuizQuestion {
  id: number;
  question: string;
  key: string;
  type: "radio" | "paddle-search" | "budget-slider";
  options?: { label: string; value: string }[];
  placeholder?: string;
  skipLabel?: string; // label for "skip" button on text questions
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What's your skill level?",
    key: "skillLevel",
    type: "radio",
    options: [
      { label: "Beginner (learning the game)", value: "Beginner" },
      { label: "Intermediate (consistent rallies, developing strategy)", value: "Intermediate" },
      { label: "Advanced (tournament play, rating 4.0+)", value: "Advanced" },
      { label: "Pro / Elite (5.0+ or competing professionally)", value: "Pro" },
    ],
  },
  {
    id: 2,
    question: "What's your play style?",
    key: "playStyle",
    type: "radio",
    options: [
      { label: "Aggressive / Power focused", value: "Aggressive" },
      { label: "Control / Touch focused", value: "Control" },
      { label: "Balanced / All-around", value: "Balanced" },
    ],
  },
  {
    id: 3,
    question: "Do you mainly play singles, doubles, or both?",
    key: "gameType",
    type: "radio",
    options: [
      { label: "Singles (more driving, reach matters)", value: "Singles" },
      { label: "Doubles (more dinking, hands speed matters)", value: "Doubles" },
      { label: "Both equally", value: "Both" },
    ],
  },
  {
    id: 4,
    question: "How would you describe your swings?",
    key: "swingSpeed",
    type: "radio",
    options: [
      { label: "Compact and controlled — I don't take big swings", value: "Slow" },
      { label: "Moderate — I swing with some pace but stay in control", value: "Moderate" },
      { label: "Big and fast — I rip drives and overheads", value: "Fast" },
    ],
  },
  {
    id: 5,
    question: "Do you have any arm, wrist, or elbow issues?",
    key: "armIssues",
    type: "radio",
    options: [
      { label: "No issues", value: "None" },
      { label: "Mild (occasional discomfort after long sessions)", value: "Mild" },
      { label: "Serious (tennis elbow, wrist pain, or chronic issues)", value: "Serious" },
    ],
  },
  {
    id: 6,
    question: "What do you wish your paddle did better?",
    key: "frustration",
    type: "radio",
    options: [
      { label: "More power on drives and overheads", value: "Power" },
      { label: "Better touch on dinks and resets", value: "Control" },
      { label: "Bigger sweet spot — too many mishits", value: "Vibration" },
      { label: "More spin on serves and thirds", value: "Spin" },
      { label: "Less fatigue — my arm gets tired or sore", value: "Fatigue" },
      { label: "Nothing specific / Shopping for my first paddle", value: "Other" },
    ],
  },
  {
    id: 7,
    question: "When the ball hits your paddle, what do you prefer?",
    key: "feelPreference",
    type: "radio",
    options: [
      { label: "Quiet and cushioned — the ball sinks in and I place it where I want", value: "Soft" },
      { label: "Loud and punchy — I feel the ball pop off the face with energy", value: "Crisp" },
      { label: "Not sure / No preference", value: "No preference" },
    ],
  },
  {
    id: 8,
    question: "What paddle do you currently use?",
    key: "currentPaddle",
    type: "paddle-search",
    skipLabel: "Skip — this is my first paddle",
  },
  {
    id: 9,
    question: "Are you coming from another racquet sport?",
    key: "priorSport",
    type: "radio",
    options: [
      { label: "Tennis", value: "Tennis" },
      { label: "Racquetball / Squash", value: "Racquetball" },
      { label: "Table tennis / Ping pong", value: "Table tennis" },
      { label: "No — pickleball is my first", value: "None" },
      { label: "Other racquet sport", value: "Other" },
    ],
  },
  {
    id: 10,
    question: "Do you want the latest paddle technology?",
    key: "buildPreference",
    type: "radio",
    options: [
      { label: "Yes — I want the newest, highest-performing paddles available", value: "Thermoformed" },
      { label: "No — I prefer tried-and-true paddles that have been around", value: "Traditional" },
      { label: "Don't care / Not sure", value: "No preference" },
    ],
  },
  {
    id: 11,
    question: "What matters most in your paddle shape?",
    key: "shapePreference",
    type: "radio",
    options: [
      { label: "Forgiveness — I want the biggest sweet spot possible", value: "Wide body" },
      { label: "Balance — a mix of reach and sweet spot", value: "Hybrid" },
      { label: "Reach — I want extra length for range and power", value: "Elongated" },
      { label: "Classic — the traditional paddle shape", value: "Standard" },
      { label: "Not sure / No preference", value: "No preference" },
    ],
  },
  {
    id: 12,
    question: "Core thickness preference?",
    key: "coreThickness",
    type: "radio",
    options: [
      { label: "Thin (13-14mm) — more pop, faster hands, more feel", value: "Thin" },
      { label: "Thick (16mm) — more power, bigger sweet spot, softer feel", value: "Thick" },
      { label: "No preference / Not sure", value: "No preference" },
    ],
  },
  {
    id: 13,
    question: "How important is spin to your game?",
    key: "spinPriority",
    type: "radio",
    options: [
      { label: "Low — I mostly hit flat", value: "Low" },
      { label: "Medium — I use spin occasionally", value: "Medium" },
      { label: "High — Spin is a weapon in my game", value: "High" },
    ],
  },
  {
    id: 14,
    question: "Hand size?",
    key: "handSize",
    type: "radio",
    options: [
      { label: "Small (glove size < 8) — best with 4\" grip", value: "Small" },
      { label: "Medium (glove size 8-9) — best with 4.25\" grip", value: "Medium" },
      { label: "Large (glove size > 9) — best with 4.25-4.5\" grip", value: "Large" },
    ],
  },
  {
    id: 15,
    question: "How do you hit your backhand?",
    key: "gripLength",
    type: "radio",
    options: [
      { label: "Two-handed backhand (need room for both hands)", value: "Long" },
      { label: "One-handed, tennis style", value: "Standard" },
      { label: "Compact / wrist-driven (table tennis style)", value: "Short" },
      { label: "Not sure", value: "No preference" },
    ],
  },
  {
    id: 16,
    question: "What's your budget?",
    key: "budget",
    type: "budget-slider",
  },
];

export function QuizContainer() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "CAD">("USD");
  const [budgetRange, setBudgetRange] = useState<[number, number]>([50, 250]);

  const current = quizQuestions[currentStep];
  const totalSteps = quizQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
  };

  const handlePaddleSelect = (paddleName: string) => {
    setAnswers((prev) => ({ ...prev, [current.key]: paddleName }));
    setCurrentStep((prev) => prev + 1);
  };

  const handlePaddleSkip = () => {
    setAnswers((prev) => ({ ...prev, [current.key]: "" }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsSubmitting(true);
      const sessionId = generateSessionId();

      try {
        await fetch("/api/quiz-submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, answers }),
        });
      } catch {
        // Continue even if logging fails
      }

      const params = new URLSearchParams({
        ...answers,
        currency,
        budgetMin: String(budgetRange[0]),
        budgetMax: String(budgetRange[1]),
        sessionId,
      });

      router.push(`/results?${params.toString()}`);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const currentAnswer = answers[current.key];
  const canProceed = current.type === "budget-slider" || !!currentAnswer;

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>
            Question {currentStep + 1} of {totalSteps}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question + options with slide animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >

      <h2 className="text-2xl font-bold mb-6">{current.question}</h2>

      {/* Radio options */}
      {current.type === "radio" && current.options && (
        <RadioGroup value={currentAnswer || ""} onValueChange={handleSelect} className="space-y-3">
          {current.options.map((option) => (
            <div key={option.value}>
              <Label
                htmlFor={`option-${option.value}`}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  currentAnswer === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value={option.value} id={`option-${option.value}`} />
                <span className="text-base">{option.label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {/* Paddle search */}
      {current.type === "paddle-search" && (
        <PaddleSearch
          onSelect={handlePaddleSelect}
          onSkip={handlePaddleSkip}
          skipLabel={current.skipLabel}
        />
      )}

      {/* Budget slider */}
      {current.type === "budget-slider" && (
        <BudgetSlider
          currency={currency}
          setCurrency={setCurrency}
          range={budgetRange}
          setRange={setBudgetRange}
        />
      )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0} className="gap-1">
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        {(current.type === "radio" || current.type === "budget-slider") && (
          <Button onClick={handleNext} disabled={!canProceed || isSubmitting} className="gap-1">
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Finding paddles...</>
            ) : currentStep === totalSteps - 1 ? (
              "See My Matches"
            ) : (
              <>Next <ChevronRight className="w-4 h-4" /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ───────────────── Budget Slider ───────────────── */

const CAD_RATE = 1.36;

function BudgetSlider({
  currency,
  setCurrency,
  range,
  setRange,
}: {
  currency: "USD" | "CAD";
  setCurrency: (c: "USD" | "CAD") => void;
  range: [number, number];
  setRange: (r: [number, number]) => void;
}) {
  const symbol = currency === "CAD" ? "CA$" : "$";
  const maxVal = currency === "CAD" ? 450 : 330;

  return (
    <div className="space-y-6">
      {/* Currency toggle */}
      <div className="flex items-center justify-center gap-1 bg-muted rounded-lg p-1 w-fit mx-auto">
        {(["USD", "CAD"] as const).map((c) => (
          <button
            key={c}
            onClick={() => {
              if (c !== currency) {
                const rate = c === "CAD" ? CAD_RATE : 1 / CAD_RATE;
                setRange([
                  Math.round(range[0] * rate),
                  Math.round(range[1] * rate),
                ]);
                setCurrency(c);
              }
            }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              currency === c
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c === "USD" ? "🇺🇸 USD" : "🇨🇦 CAD"}
          </button>
        ))}
      </div>

      {/* Price display */}
      <div className="text-center">
        <div className="text-3xl font-black text-foreground">
          {symbol}{range[0]} — {symbol}{range[1]}{range[1] >= maxVal ? "+" : ""}
        </div>
      </div>

      {/* Dual range slider */}
      <div className="px-2">
        <Slider
          min={0}
          max={maxVal}
          step={10}
          value={range}
          onValueChange={(v) => setRange(v as [number, number])}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{symbol}0</span>
          <span>{symbol}{maxVal}+</span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Paddle Search Autocomplete ───────────────── */

// Build search index once (brand + name, deduplicated)
const paddleOptions = (() => {
  const seen = new Set<string>();
  return paddleData
    .map((p) => ({
      label: `${p.brand} ${p.name}`,
      brand: p.brand,
      name: p.name,
      sw: p.swing_weight,
      shape: p.shape,
    }))
    .filter((p) => {
      if (seen.has(p.label)) return false;
      seen.add(p.label);
      return true;
    });
})();

function PaddleSearch({
  onSelect,
  onSkip,
  skipLabel,
}: {
  onSelect: (name: string) => void;
  onSkip: () => void;
  skipLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return paddleOptions
      .filter((p) => p.label.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  useEffect(() => {
    setHighlightIdx(0);
  }, [results]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && highlightIdx >= 0) {
      const items = listRef.current.querySelectorAll("[data-item]");
      items[highlightIdx]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlightIdx]) {
        onSelect(results[highlightIdx].label);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Start typing your paddle name..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-border bg-background text-base focus:outline-none focus:border-primary transition-colors"
          autoComplete="off"
        />

        {/* Dropdown */}
        {isOpen && results.length > 0 && (
          <div
            ref={listRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border-2 border-border rounded-lg shadow-lg max-h-72 overflow-y-auto"
          >
            {results.map((paddle, i) => (
              <button
                key={paddle.label}
                data-item
                onClick={() => {
                  onSelect(paddle.label);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightIdx(i)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                  i === highlightIdx
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                } ${i > 0 ? "border-t border-border" : ""}`}
              >
                <div>
                  <div className="font-medium">{paddle.name}</div>
                  <div className="text-xs text-muted-foreground">{paddle.brand}</div>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {paddle.sw && <span>SW {paddle.sw}</span>}
                  {paddle.shape && <span className="ml-2">{paddle.shape}</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {isOpen && query.length >= 2 && results.length === 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border-2 border-border rounded-lg shadow-lg p-4 text-sm text-muted-foreground">
            No paddles found for &ldquo;{query}&rdquo;
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {skipLabel && (
        <Button variant="outline" onClick={onSkip} className="w-full">
          {skipLabel}
        </Button>
      )}
    </div>
  );
}
