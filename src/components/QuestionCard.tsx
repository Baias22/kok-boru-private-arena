import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Question } from "@/lib/questions-store";
import { cn } from "@/lib/utils";

type Props = {
  team: "A" | "B";
  teamName?: string;
  question: Question | null;
  disabled?: boolean;
  timeLimit?: number; // seconds
  onAnswer: (correct: boolean) => void;
};

export default function QuestionCard({ team, teamName, question, disabled, timeLimit = 20, onAnswer }: Props) {
  const [feedback, setFeedback] = useState<null | "correct" | "wrong">(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(timeLimit);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fbRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // reset timer/feedback whenever the question changes or disabled toggles
  useEffect(() => {
    setFeedback(null);
    setPicked(null);
    setRemaining(timeLimit);
    if (timerRef.current) clearInterval(timerRef.current);
    if (fbRef.current) clearTimeout(fbRef.current);
    if (!question || disabled) return;
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // timeout = wrong
          setFeedback("wrong");
          fbRef.current = setTimeout(() => onAnswer(false), 700);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (fbRef.current) clearTimeout(fbRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id, disabled, timeLimit]);

  function handleClick(idx: number) {
    if (!question || disabled || feedback) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const correct = idx === question.correctIndex;
    setPicked(idx);
    setFeedback(correct ? "correct" : "wrong");
    fbRef.current = setTimeout(() => onAnswer(correct), 900);
  }

  const teamColor = team === "A" ? "team-a" : "team-b";
  const pct = Math.max(0, Math.min(100, (remaining / timeLimit) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex h-full flex-col gap-3 rounded-2xl border-2 bg-card p-4 shadow-md sm:p-5",
        team === "A" ? "border-team-a/60" : "border-team-b/60",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-white shadow-md",
            team === "A" ? "bg-team-a" : "bg-team-b",
          )}
        >
          {teamName || `Team ${team}`}
        </span>
        <div className="flex items-center gap-2">
          {feedback && (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold text-white",
                feedback === "correct" ? "bg-emerald-600" : "bg-destructive",
              )}
            >
              {feedback === "correct" ? "✓ Correct!" : "✗ Wrong answer"}
            </span>
          )}
          {!disabled && question && (
            <span className="text-xs font-bold text-muted-foreground tabular-nums">{remaining}s</span>
          )}
        </div>
      </div>

      {/* timer bar */}
      {!disabled && question && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full transition-all", team === "A" ? "bg-team-a" : "bg-team-b")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {!question ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
          Please add more questions to this topic
        </div>
      ) : (
        <>
          <h3 className="min-h-[3rem] text-base font-bold text-foreground sm:text-lg">{question.text}</h3>
          <ul className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            {question.options.map((opt, idx) => {
              const isPicked = picked === idx;
              const showRed = isPicked && feedback === "wrong";
              const showGreen = isPicked && feedback === "correct";
              return (
                <li key={idx}>
                  <button
                    onClick={() => handleClick(idx)}
                    disabled={!!feedback || disabled}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-xl border-2 px-3 py-3 text-left text-sm transition-all",
                      "hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
                      showGreen && "border-emerald-600 bg-emerald-500/15 font-semibold",
                      showRed && "border-destructive bg-destructive/15 font-semibold",
                      !showGreen && !showRed && (team === "A"
                        ? "border-border bg-background hover:border-team-a"
                        : "border-border bg-background hover:border-team-b"),
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 flex-none items-center justify-center rounded-md text-xs font-bold text-white",
                        team === "A" ? "bg-team-a" : "bg-team-b",
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <span className="hidden">{teamColor}</span>
    </motion.div>
  );
}
