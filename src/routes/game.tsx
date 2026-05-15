import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import GameField from "@/components/GameField";
import QuestionCard from "@/components/QuestionCard";
import { fetchQuestionsByTopic, fetchTopics, type Question, type Topic } from "@/lib/questions-store";

type Search = { topic?: string };

export const Route = createFileRoute("/game")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    topic: typeof s.topic === "string" ? s.topic : undefined,
  }),
  component: GamePage,
  head: () => ({
    meta: [
      { title: "Game — Kok Boru Edu" },
      { name: "description", content: "Play the Kok Boru classroom quiz." },
    ],
  }),
});

function pickTwoDistinct(pool: Question[], excludeA?: string, excludeB?: string): [Question | null, Question | null] {
  const available = pool.filter((q) => q.id !== excludeA && q.id !== excludeB);
  if (pool.length < 2) return [pool[0] ?? null, null];
  if (available.length < 2) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  }
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function pickOne(pool: Question[], exclude: string[]): Question | null {
  const available = pool.filter((q) => !exclude.includes(q.id));
  if (available.length) return available[Math.floor(Math.random() * available.length)];
  const fallback = pool.filter((q) => q.id !== exclude[0]);
  return fallback.length ? fallback[Math.floor(Math.random() * fallback.length)] : pool[0] ?? null;
}

const WIN_AT = 5;

function GamePage() {
  const { topic: topicId } = Route.useSearch();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pool, setPool] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [position, setPosition] = useState(0); // negative = toward Team A kazan, positive = toward Team B kazan
  const [winner, setWinner] = useState<"A" | "B" | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [qA, setQA] = useState<Question | null>(null);
  const [qB, setQB] = useState<Question | null>(null);
  const [flash, setFlash] = useState<"A" | "B" | null>(null);
  const [throwing, setThrowing] = useState<"A" | "B" | null>(null);

  const topic = topics.find((t) => t.id === topicId);

  useEffect(() => {
    fetchTopics().then(setTopics).catch(console.error);
  }, []);

  useEffect(() => {
    if (!topicId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchQuestionsByTopic(topicId)
      .then(setPool)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [topicId]);

  const enough = pool.length >= 2;

  function startGame() {
    if (!enough) return;
    const [a, b] = pickTwoDistinct(pool);
    setQA(a);
    setQB(b);
    setPosition(0);
    setWinner(null);
    setThrowing(null);
    setStarted(true);
    setPaused(false);
  }

  function restart() {
    setStarted(false);
    setPaused(false);
    setPosition(0);
    setWinner(null);
    setQA(null);
    setQB(null);
    setThrowing(null);
    setScoreA(0);
    setScoreB(0);
  }

  function flashTeam(t: "A" | "B") {
    setFlash(t);
    setTimeout(() => setFlash(null), 600);
  }

  function checkWin(team: "A" | "B", newPos: number) {
    // Team A's kazan is on the LEFT (-5). Team B's kazan is on the RIGHT (+5).
    if (team === "A" && newPos <= -WIN_AT) {
      setThrowing("A");
      setTimeout(() => {
        setWinner("A");
        setScoreA((s) => s + 1);
      }, 900);
      return true;
    }
    if (team === "B" && newPos >= WIN_AT) {
      setThrowing("B");
      setTimeout(() => {
        setWinner("B");
        setScoreB((s) => s + 1);
      }, 900);
      return true;
    }
    return false;
  }

  function onAnswerA(correct: boolean) {
    if (winner || paused) return;
    if (correct) {
      flashTeam("A");
      setPosition((p) => {
        const np = p - 1;
        checkWin("A", np);
        return np;
      });
    }
    setQA((prev) => pickOne(pool, [prev?.id ?? "", qB?.id ?? ""]));
  }

  function onAnswerB(correct: boolean) {
    if (winner || paused) return;
    if (correct) {
      flashTeam("B");
      setPosition((p) => {
        const np = p + 1;
        checkWin("B", np);
        return np;
      });
    }
    setQB((prev) => pickOne(pool, [prev?.id ?? "", qA?.id ?? ""]));
  }

  const banner = useMemo(() => {
    if (!topicId) {
      return (
        <div className="rounded-xl bg-yellow-100 border-2 border-yellow-400 px-5 py-3 text-yellow-900 font-medium">
          No topic selected.{" "}
          <Link to="/topics" className="underline font-bold">Go to Topics</Link>
        </div>
      );
    }
    if (!loading && !enough) {
      return (
        <div className="rounded-xl bg-yellow-100 border-2 border-yellow-400 px-5 py-3 text-yellow-900 font-medium">
          Please add more questions to this topic (at least 2).{" "}
          <Link to="/questions" search={{ topic: topicId }} className="underline font-bold">
            Manage questions
          </Link>
        </div>
      );
    }
    return null;
  }, [topicId, loading, enough]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[oklch(0.97_0.02_80)] to-[oklch(0.93_0.04_140)] p-3 md:p-5">
      <header className="mx-auto mb-3 flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/" className="text-xl font-extrabold tracking-tight text-foreground">
            Kok Boru Edu
          </Link>
          {topic && (
            <div className="text-xs text-muted-foreground">
              Topic: <span className="font-bold">{topic.name}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!started ? (
            <button
              onClick={startGame}
              disabled={!enough}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50"
            >
              Start Game
            </button>
          ) : (
            <>
              <button
                onClick={() => setPaused((p) => !p)}
                className="px-4 py-2.5 rounded-lg bg-accent text-accent-foreground font-bold"
              >
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={restart}
                className="px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-bold"
              >
                Restart
              </button>
            </>
          )}
          <Link to="/topics" className="px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold">
            Back to Topics
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-4">
        {banner}

        {/* Score */}
        <div className="grid grid-cols-3 items-center gap-3 rounded-xl bg-card/70 p-3 shadow-sm backdrop-blur">
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Team A</div>
            <div className="text-3xl font-extrabold text-team-a">{scoreA}</div>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            ← push the carcass into your own Tai Kazan to win →
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Team B</div>
            <div className="text-3xl font-extrabold text-team-b">{scoreB}</div>
          </div>
        </div>

        {/* TOP: game field */}
        <GameField position={position} flash={flash} throwing={throwing} />

        {/* BOTTOM: two question cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <QuestionCard
            team="A"
            question={qA}
            disabled={!started || !!winner || paused}
            onAnswer={onAnswerA}
          />
          <QuestionCard
            team="B"
            question={qB}
            disabled={!started || !!winner || paused}
            onAnswer={onAnswerB}
          />
        </div>

        {!started && enough && (
          <div className="text-center text-muted-foreground">
            Click <strong>Start Game</strong> to deal questions to both teams.
          </div>
        )}
      </div>

      {paused && started && !winner && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl bg-card px-10 py-8 text-center shadow-2xl">
            <div className="text-5xl">⏸</div>
            <h2 className="mt-3 text-2xl font-extrabold">Paused</h2>
            <button
              onClick={() => setPaused(false)}
              className="mt-4 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-10 text-center shadow-2xl">
            <div className="text-7xl">🏆</div>
            <h2 className={`text-3xl font-extrabold ${winner === "A" ? "text-team-a" : "text-team-b"}`}>
              Team {winner} wins the round!
            </h2>
            <p className="text-muted-foreground">
              Score — A: <strong>{scoreA}</strong> · B: <strong>{scoreB}</strong>
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setWinner(null);
                  setPosition(0);
                  setThrowing(null);
                  const [a, b] = pickTwoDistinct(pool);
                  setQA(a);
                  setQB(b);
                }}
                className="rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground"
              >
                Next Round
              </button>
              <button
                onClick={restart}
                className="rounded-lg bg-secondary px-6 py-3 font-bold text-secondary-foreground"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
