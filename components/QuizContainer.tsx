"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateSessionId } from "@/lib/utils";
import { paddleData } from "@/lib/paddle-data";
import { getAllRanked } from "@/lib/recommendations";
import { Paddle, PlayerProfile } from "@/lib/types";
import { track } from "@vercel/analytics";

interface QuizQuestion {
  id: number;
  question: string;
  key: string;
  type: "radio" | "multi-select" | "paddle-search" | "budget-slider";
  options?: { label: string; value: string }[];
  maxSelections?: number; // for multi-select
  skipLabel?: string;
  showIf?: (answers: Record<string, string>) => boolean; // conditional visibility
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
    question: "Where do you win most of your points?",
    key: "pointSource",
    type: "radio",
    options: [
      { label: "Driving from the baseline and overheads", value: "Drives" },
      { label: "Hands battles and volleys at the kitchen", value: "Kitchen" },
      { label: "Drop shots, dinks, and resets", value: "Touch" },
      { label: "Mix of everything", value: "Mix" },
    ],
  },
  {
    id: 5,
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
    id: 6,
    question: "How often do you play?",
    key: "playingFrequency",
    type: "radio",
    options: [
      { label: "1-2 times per week", value: "Light" },
      { label: "3-4 times per week", value: "Regular" },
      { label: "5+ times per week or daily", value: "Heavy" },
    ],
  },
  {
    id: 7,
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
    id: 8,
    question: "What do you wish your paddle did better? (pick up to 2)",
    key: "frustration",
    type: "multi-select",
    maxSelections: 2,
    options: [
      { label: "More power on drives and overheads", value: "Power" },
      { label: "Better touch on dinks and resets", value: "Control" },
      { label: "Bigger sweet spot — too many mishits", value: "Vibration" },
      { label: "More spin on serves and thirds", value: "Spin" },
      { label: "Less fatigue — my arm gets tired or sore", value: "Fatigue" },
      { label: "Nothing specific / Shopping for my first paddle", value: "None" },
    ],
  },
  {
    id: 9,
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
    id: 10,
    question: "What paddle do you currently use?",
    key: "currentPaddle",
    type: "paddle-search",
    skipLabel: "Skip — this is my first paddle",
  },
  {
    id: 11,
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
  // Technical questions — hidden for beginners
  {
    id: 12,
    question: "Do you want the latest paddle technology?",
    key: "buildPreference",
    type: "radio",
    showIf: (answers) => answers.skillLevel !== "Beginner",
    options: [
      { label: "Yes — I want the newest, highest-performing paddles available", value: "Thermoformed" },
      { label: "No — I prefer tried-and-true paddles that have been around", value: "Traditional" },
      { label: "Don't care / Not sure", value: "No preference" },
    ],
  },
  {
    id: 13,
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
    id: 14,
    question: "Core thickness preference?",
    key: "coreThickness",
    type: "radio",
    showIf: (answers) => answers.skillLevel !== "Beginner",
    options: [
      { label: "Thin (13-14mm) — more pop, faster hands, more feel", value: "Thin" },
      { label: "Thick (16mm) — more power, bigger sweet spot, softer feel", value: "Thick" },
      { label: "No preference / Not sure", value: "No preference" },
    ],
  },
  {
    id: 15,
    question: "How important is spin to your game?",
    key: "spinPriority",
    type: "radio",
    showIf: (answers) => answers.skillLevel !== "Beginner",
    options: [
      { label: "Low — I mostly hit flat", value: "Low" },
      { label: "Medium — I use spin occasionally", value: "Medium" },
      { label: "High — Spin is a weapon in my game", value: "High" },
    ],
  },
  {
    id: 16,
    question: "What matters more to you?",
    key: "stabilityPreference",
    type: "radio",
    options: [
      { label: "Stability — I want forgiveness on off-center hits", value: "Stability" },
      { label: "Maneuverability — I want quick paddle adjustments for touch and dinking", value: "Maneuverability" },
      { label: "Not sure / No preference", value: "No preference" },
    ],
  },
  {
    id: 17,
    question: "How do you feel about customizing your paddle with lead tape?",
    key: "customizationPreference",
    type: "radio",
    showIf: (answers) => answers.skillLevel !== "Beginner",
    options: [
      { label: "I want it ready to play out of the box", value: "Out of the box" },
      { label: "I like to fine-tune with lead tape", value: "Fine-tune" },
      { label: "Not sure / No preference", value: "No preference" },
    ],
  },
  {
    id: 18,
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
    id: 19,
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
    id: 20,
    question: "What's your budget?",
    key: "budget",
    type: "budget-slider",
  },
];

/* ───────────────── Phase Definitions ───────────────── */

const PHASES = [
  { name: "Your Game", keys: ["skillLevel", "playStyle", "gameType", "pointSource", "swingSpeed"] },
  { name: "Your Preferences", keys: ["playingFrequency", "armIssues", "frustration", "feelPreference", "currentPaddle", "priorSport"] },
  { name: "Fine-Tuning", keys: ["buildPreference", "shapePreference", "coreThickness", "spinPriority", "stabilityPreference", "customizationPreference", "handSize", "gripLength", "budget"] },
];

function getPhaseIndex(questionKey: string): number {
  return PHASES.findIndex((p) => p.keys.includes(questionKey));
}

function buildPartialProfile(answers: Record<string, string>): PlayerProfile {
  return {
    playStyle: (answers.playStyle as PlayerProfile["playStyle"]) || "Balanced",
    skillLevel: (answers.skillLevel as PlayerProfile["skillLevel"]) || "Intermediate",
    gameType: (answers.gameType as PlayerProfile["gameType"]) || "Both",
    swingSpeed: (answers.swingSpeed as PlayerProfile["swingSpeed"]) || "Moderate",
    pointSource: (answers.pointSource as PlayerProfile["pointSource"]) || "Mix",
    frustration: answers.frustration || "None",
    armIssues: (answers.armIssues as PlayerProfile["armIssues"]) || "None",
    feelPreference: (answers.feelPreference as PlayerProfile["feelPreference"]) || "No preference",
    currentPaddle: answers.currentPaddle || "",
    priorSport: (answers.priorSport as PlayerProfile["priorSport"]) || "None",
    playingFrequency: (answers.playingFrequency as PlayerProfile["playingFrequency"]) || "Regular",
    buildPreference: (answers.buildPreference as PlayerProfile["buildPreference"]) || "No preference",
    shapePreference: (answers.shapePreference as PlayerProfile["shapePreference"]) || "No preference",
    coreThickness: (answers.coreThickness as PlayerProfile["coreThickness"]) || "No preference",
    spinPriority: (answers.spinPriority as PlayerProfile["spinPriority"]) || "Medium",
    stabilityPreference: (answers.stabilityPreference as PlayerProfile["stabilityPreference"]) || "No preference",
    customizationPreference: (answers.customizationPreference as PlayerProfile["customizationPreference"]) || "No preference",
    handSize: (answers.handSize as PlayerProfile["handSize"]) || "Medium",
    gripLength: (answers.gripLength as PlayerProfile["gripLength"]) || "No preference",
    currency: "USD",
    budgetMin: 0,
    budgetMax: 500,
  };
}

function countGoodMatches(answers: Record<string, string>): number {
  const profile = buildPartialProfile(answers);
  const ranked = getAllRanked(profile, paddleData as Paddle[]);
  return ranked.filter((p) => p.matchPercentage >= 70).length;
}

/* ───────────────── Storage ───────────────── */

const QUIZ_STORAGE_KEY = "picklefitter_quiz_progress";

function loadSavedProgress(): { step: number; answers: Record<string, string> } | null {
  try {
    const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.step === "number" && parsed.answers) return parsed;
  } catch {}
  return null;
}

export function QuizContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "CAD">("USD");
  const [budgetRange, setBudgetRange] = useState<[number, number]>([50, 250]);
  const [showResume, setShowResume] = useState(false);
  const [showGate, setShowGate] = useState<"phase1" | "phase2" | null>(null);
  const [teaserMatchCount, setTeaserMatchCount] = useState(0);

  // ME7: Pre-fill answers from URL params (e.g. from guide pages)
  useEffect(() => {
    track("quiz_started");

    const prefill: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (quizQuestions.some((q) => q.key === key)) {
        prefill[key] = value;
      }
    });
    if (Object.keys(prefill).length > 0) {
      setAnswers(prefill);
      // Skip to first unanswered question
      const visible = quizQuestions.filter((q) => !q.showIf || q.showIf(prefill));
      const firstUnanswered = visible.findIndex((q) => !prefill[q.key]);
      if (firstUnanswered > 0) setCurrentStep(firstUnanswered);
      return; // Don't show resume prompt if we have URL pre-fills
    }

    // ME1: Check for saved progress
    const saved = loadSavedProgress();
    if (saved && Object.keys(saved.answers).length > 0) {
      setShowResume(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resumeQuiz = useCallback(() => {
    const saved = loadSavedProgress();
    if (saved) {
      setAnswers(saved.answers);
      setCurrentStep(saved.step);
    }
    setShowResume(false);
  }, []);

  const startFresh = useCallback(() => {
    localStorage.removeItem(QUIZ_STORAGE_KEY);
    setShowResume(false);
  }, []);

  // Persist progress on every change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify({ step: currentStep, answers }));
    }
  }, [currentStep, answers]);

  // Filter questions based on conditional visibility
  const visibleQuestions = useMemo(
    () => quizQuestions.filter((q) => !q.showIf || q.showIf(answers)),
    [answers]
  );

  const current = visibleQuestions[currentStep];
  const totalSteps = visibleQuestions.length;
  const progress = 10 + ((currentStep + 1) / totalSteps) * 90;

  const autoAdvanceTimer = useRef<NodeJS.Timeout | null>(null);

  // Check if advancing past this step crosses a phase boundary
  const wouldCrossPhase = (stepIndex: number): "phase1" | "phase2" | null => {
    if (stepIndex >= totalSteps - 1) return null;
    const currentQ = visibleQuestions[stepIndex];
    const nextQ = visibleQuestions[stepIndex + 1];
    if (!currentQ || !nextQ) return null;
    const curPhase = getPhaseIndex(currentQ.key);
    const nextPhase = getPhaseIndex(nextQ.key);
    if (curPhase === 0 && nextPhase === 1) return "phase1";
    if (curPhase === 1 && nextPhase === 2) return "phase2";
    return null;
  };

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
    // Auto-advance on radio selection after brief visual confirmation
    if (current.type === "radio" && currentStep < totalSteps - 1) {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = setTimeout(() => {
        const gate = wouldCrossPhase(currentStep);
        if (gate) {
          if (gate === "phase1") setTeaserMatchCount(countGoodMatches({ ...answers, [current.key]: value }));
          setShowGate(gate);
        } else {
          setCurrentStep((prev) => prev + 1);
        }
      }, 350);
    }
  };

  const handleMultiSelect = (value: string) => {
    setAnswers((prev) => {
      const currentValues = prev[current.key] ? prev[current.key].split(",") : [];
      const max = current.maxSelections || 2;

      // "None" is exclusive — clears other selections
      if (value === "None") {
        return { ...prev, [current.key]: "None" };
      }

      // Remove "None" if selecting something else
      const filtered = currentValues.filter((v) => v !== "None");

      if (filtered.includes(value)) {
        // Deselect
        const updated = filtered.filter((v) => v !== value);
        return { ...prev, [current.key]: updated.join(",") };
      } else if (filtered.length < max) {
        // Add
        return { ...prev, [current.key]: [...filtered, value].join(",") };
      }
      // At max — replace last selection
      return { ...prev, [current.key]: [...filtered.slice(0, max - 1), value].join(",") };
    });
  };

  const handlePaddleSelect = (paddleName: string) => {
    setAnswers((prev) => ({ ...prev, [current.key]: paddleName }));
    setCurrentStep((prev) => Math.min(prev + 1, visibleQuestions.length - 1));
  };

  const handlePaddleSkip = () => {
    setAnswers((prev) => ({ ...prev, [current.key]: "" }));
    setCurrentStep((prev) => Math.min(prev + 1, visibleQuestions.length - 1));
  };

  const submitQuiz = async () => {
    const answeredCount = Object.keys(answers).filter((k) => answers[k]).length;
    track("quiz_completed", { questions_answered: answeredCount, phase: showGate === "phase1" ? 1 : showGate === "phase2" ? 2 : 3 });
    setIsSubmitting(true);
    const sessionId = generateSessionId();
    try {
      await fetch("/api/quiz-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers }),
      });
    } catch {}
    const params = new URLSearchParams({
      ...answers,
      currency,
      budgetMin: String(budgetRange[0]),
      budgetMax: String(budgetRange[1]),
      sessionId,
    });
    localStorage.removeItem(QUIZ_STORAGE_KEY);
    router.push(`/results?${params.toString()}`);
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      const gate = wouldCrossPhase(currentStep);
      if (gate) {
        if (gate === "phase1") setTeaserMatchCount(countGoodMatches(answers));
        setShowGate(gate);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      await submitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const currentAnswer = answers[current.key];
  const canProceed =
    current.type === "budget-slider" ||
    (current.type === "multi-select" ? !!currentAnswer : !!currentAnswer);

  // Compute current phase and per-phase progress
  const currentPhaseIndex = current ? getPhaseIndex(current.key) : 0;
  const phaseVisibleCounts = PHASES.map((phase) =>
    visibleQuestions.filter((q) => phase.keys.includes(q.key)).length
  );
  const questionsInCurrentPhase = phaseVisibleCounts[currentPhaseIndex] || 1;
  const questionIndexInPhase = visibleQuestions
    .filter((q) => PHASES[currentPhaseIndex]?.keys.includes(q.key))
    .indexOf(current);

  if (showResume) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-4 py-8">
        <h2 className="text-xl font-black">Welcome back!</h2>
        <p className="text-muted-foreground">You have a quiz in progress. Pick up where you left off?</p>
        <div className="flex justify-center gap-3">
          <Button onClick={resumeQuiz} className="gap-1.5">Resume Quiz</Button>
          <Button variant="outline" onClick={startFresh}>Start Fresh</Button>
        </div>
      </div>
    );
  }

  // Phase gate interstitials
  if (showGate === "phase1") {
    track("quiz_gate_shown", { gate: "phase1", matches_found: teaserMatchCount });
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-8">
        <div className="text-4xl font-black text-primary">{teaserMatchCount}</div>
        <h2 className="text-xl font-black">great matches found from {paddleData.length} paddles!</h2>
        <p className="text-muted-foreground">
          Answer a few more questions to narrow it down to your perfect top 3.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button onClick={() => { setShowGate(null); setCurrentStep((prev) => prev + 1); }} className="gap-1.5">
            Keep Going
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={submitQuiz}>
            Show results now
          </Button>
        </div>
      </div>
    );
  }

  if (showGate === "phase2") {
    track("quiz_gate_shown", { gate: "phase2" });
    const phase3Count = phaseVisibleCounts[2] || 0;
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-8">
        <h2 className="text-xl font-black">Your profile is ready!</h2>
        <p className="text-muted-foreground">
          You can see your matches now, or answer {phase3Count} more questions to fine-tune the results.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button onClick={submitQuiz} className="gap-1.5 px-6 py-5 text-base font-bold">
            Show My Matches
          </Button>
          <Button variant="outline" onClick={() => { setShowGate(null); setCurrentStep((prev) => prev + 1); }} className="gap-1.5">
            Fine-Tune
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Phase progress bar */}
      <div className="mb-8">
        <div className="flex gap-1 mb-2">
          {PHASES.map((phase, i) => {
            const isActive = i === currentPhaseIndex;
            const isCompleted = i < currentPhaseIndex;
            const fillPct = isCompleted ? 100 : isActive ? ((questionIndexInPhase + 1) / questionsInCurrentPhase) * 100 : 0;
            return (
              <div key={phase.name} className="flex-1">
                <div className={`text-[10px] sm:text-xs mb-1 text-center truncate ${
                  isActive ? "text-primary font-bold" : isCompleted ? "text-primary/60" : "text-muted-foreground/50"
                }`}>
                  {phase.name}
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Question {questionIndexInPhase + 1} of {questionsInCurrentPhase}
            {questionIndexInPhase === 0 && currentPhaseIndex === 0 && " — Let's go!"}
            {currentStep === totalSteps - 1 && " — Last one!"}
          </span>
          <span>{PHASES[currentPhaseIndex]?.name}</span>
        </div>
      </div>

      {/* Question + options with slide animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.key}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >

      <h2 className="text-xl sm:text-2xl font-bold mb-6">{current.question}</h2>

      {/* Radio options */}
      {current.type === "radio" && current.options && (
        <RadioGroup value={currentAnswer || ""} onValueChange={handleSelect} className="space-y-3">
          {current.options.map((option) => (
            <div key={option.value}>
              <Label
                htmlFor={`option-${option.value}`}
                className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
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

      {/* Multi-select options */}
      {current.type === "multi-select" && current.options && (
        <div className="space-y-3">
          {current.options.map((option) => {
            const selected = currentAnswer?.split(",").includes(option.value) || false;
            return (
              <button
                key={option.value}
                onClick={() => handleMultiSelect(option.value)}
                className={`w-full flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 text-left transition-all ${
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  selected ? "border-primary bg-primary" : "border-muted-foreground"
                }`}>
                  {selected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-base">{option.label}</span>
              </button>
            );
          })}
        </div>
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
        {(current.type === "radio" || current.type === "multi-select" || current.type === "budget-slider") && (
          <Button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className={currentStep === totalSteps - 1
              ? "gap-1.5 px-6 py-5 text-base font-bold"
              : "gap-1"
            }
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Finding paddles...</>
            ) : currentStep === totalSteps - 1 ? (
              "Show Me My Perfect Paddles"
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
        <div className="text-2xl sm:text-3xl font-black text-foreground">
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
