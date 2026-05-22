import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameField, { type GameMode, type BgKey } from "@/components/GameField";
import QuestionCard from "@/components/QuestionCard";
import { fetchQuestionsByTopic, fetchTopics, type Question, type Topic } from "@/lib/questions-store";
import AuthGate from "@/components/AuthGate";
import { LanguageSwitcher, useT } from "@/lib/i18n";

type Search = { topic?: string };

export const Route = createFileRoute("/game")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    topic: typeof s.topic === "string" ? s.topic : undefined,
  }),
  component: GamePageGated,
  head: () => ({
    meta: [
      { title: "Game — Kok Boru Battle" },
      { name: "description", content: "Play the Kok Boru classroom quiz." },
    ],
  }),
});

function GamePageGated() {
  return (
    <AuthGate>
      <GamePage />
    </AuthGate>
  );
}

const WIN_AT = 5;
const CHASE_TARGET = 6; // both teams need this many correct answers to win — fair race

function randomFrom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function GamePage() {
  const { t } = useT();
  const { topic: topicId } = Route.useSearch();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pool, setPool] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<GameMode>("classic");
  const [bg, setBg] = useState<BgKey>("steppe");

  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  // classic: -5..5 ; chase: 0..10 (gap)
  const [position, setPosition] = useState(0);
  const [girlSteps, setGirlSteps] = useState(0);
  const [boySteps, setBoySteps] = useState(0);
  const [winner, setWinner] = useState<"A" | "B" | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [qA, setQA] = useState<Question | null>(null);
  const [qB, setQB] = useState<Question | null>(null);
  const [flash, setFlash] = useState<"A" | "B" | null>(null);
  const [throwing, setThrowing] = useState<"A" | "B" | null>(null);
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");
  const [qASerial, setQASerial] = useState(0);
  const [qBSerial, setQBSerial] = useState(0);

  const usedIdsRef = useRef<Set<string>>(new Set());
  const qARef = useRef<Question | null>(null);
  const qBRef = useRef<Question | null>(null);
  qARef.current = qA;
  qBRef.current = qB;

  const topic = topics.find((x) => x.id === topicId);

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

  // When user picks chase mode, suggest themed default names (only if untouched).
  useEffect(() => {
    if (started) return;
    if (mode === "chase") {
      setTeamAName((n) => (n === "Team A" ? t("game.team.girls") : n));
      setTeamBName((n) => (n === "Team B" ? t("game.team.boys") : n));
    } else {
      setTeamAName((n) => (n === t("game.team.girls") ? "Team A" : n));
      setTeamBName((n) => (n === t("game.team.boys") ? "Team B" : n));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const enough = pool.length >= 2;

  const pickNext = useCallback(
    (forTeam: "A" | "B"): Question | null => {
      if (pool.length === 0) return null;
      const opponentId = forTeam === "A" ? qBRef.current?.id : qARef.current?.id;
      const used = usedIdsRef.current;

      let candidates = pool.filter((q) => !used.has(q.id) && q.id !== opponentId);
      if (candidates.length === 0 && pool.some((q) => !used.has(q.id))) {
        candidates = pool.filter((q) => !used.has(q.id));
      }
      if (candidates.length === 0) {
        candidates = pool.filter((q) => q.id !== opponentId);
        if (candidates.length === 0) candidates = pool;
      }
      const picked = randomFrom(candidates);
      if (picked) used.add(picked.id);
      return picked;
    },
    [pool],
  );

  function startGame() {
    if (!enough) return;
    usedIdsRef.current = new Set();
    qARef.current = null;
    qBRef.current = null;
    const a = pickNext("A");
    qARef.current = a;
    const b = pickNext("B");
    setQA(a);
    setQB(b);
    setQASerial((s) => s + 1);
    setQBSerial((s) => s + 1);
    setPosition(0);
    setGirlSteps(0);
    setBoySteps(0);
    setWinner(null);
    setThrowing(null);
    setStarted(true);
    setPaused(false);
  }

  function restart() {
    setStarted(false);
    setPaused(false);
    setPosition(0);
    setGirlSteps(0);
    setBoySteps(0);
    setWinner(null);
    setQA(null);
    setQB(null);
    setThrowing(null);
    setScoreA(0);
    setScoreB(0);
    usedIdsRef.current = new Set();
    qARef.current = null;
    qBRef.current = null;
  }

  function flashTeam(team: "A" | "B") {
    setFlash(team);
    setTimeout(() => setFlash(null), 600);
  }

  function checkChaseWin(nextGirl: number, nextBoy: number) {
    // Fair race: first team to reach CHASE_TARGET correct answers wins.
    if (nextGirl >= CHASE_TARGET) {
      setWinner("A");
      setScoreA((s) => s + 1);
      return true;
    }
    if (nextBoy >= CHASE_TARGET) {
      setWinner("B");
      setScoreB((s) => s + 1);
      return true;
    }
    return false;
  }

  function checkWin(team: "A" | "B", newPos: number) {
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
      if (mode === "chase") {
        setGirlSteps((g) => {
          const ng = g + 1;
          checkChaseWin(ng, boySteps);
          return ng;
        });
      } else {
        setPosition((p) => {
          const np = p - 1;
          checkWin("A", np);
          return np;
        });
      }
    }
    const next = pickNext("A");
    qARef.current = next;
    setQA(next);
    setQASerial((s) => s + 1);
  }

  function onAnswerB(correct: boolean) {
    if (winner || paused) return;
    if (correct) {
      flashTeam("B");
      if (mode === "chase") {
        setBoySteps((b) => {
          const nb = b + 1;
          checkChaseWin(girlSteps, nb);
          return nb;
        });
      } else {
        setPosition((p) => {
          const np = p + 1;
          checkWin("B", np);
          return np;
        });
      }
    }
    const next = pickNext("B");
    qBRef.current = next;
    setQB(next);
    setQBSerial((s) => s + 1);
  }

  const banner = useMemo(() => {
    if (!topicId) {
      return (
        <div className="rounded-xl bg-yellow-100 border-2 border-yellow-400 px-5 py-3 text-yellow-900 font-medium">
          {t("game.noTopic")}{" "}
          <Link to="/topics" className="underline font-bold">{t("game.goToTopics")}</Link>
        </div>
      );
    }
    if (!loading && !enough) {
      return (
        <div className="rounded-xl bg-yellow-100 border-2 border-yellow-400 px-5 py-3 text-yellow-900 font-medium">
          {t("game.notEnough")}{" "}
          <Link to="/questions" search={{ topic: topicId }} className="underline font-bold">
            {t("game.manageQuestions")}
          </Link>
        </div>
      );
    }
    return null;
  }, [topicId, loading, enough, t]);

  const isChase = mode === "chase";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[oklch(0.97_0.02_80)] to-[oklch(0.93_0.04_140)] p-3 md:p-5">
      <header className="mx-auto mb-3 flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/" className="text-xl font-extrabold tracking-tight text-foreground">
            Kok Boru Battle
          </Link>
          {topic && (
            <div className="text-xs text-muted-foreground">
              {t("game.topic")}: <span className="font-bold">{topic.name}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <LanguageSwitcher />
          {!started ? (
            <button
              onClick={startGame}
              disabled={!enough}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50"
            >
              {t("game.start")}
            </button>
          ) : (
            <>
              <button
                onClick={() => setPaused((p) => !p)}
                className="px-4 py-2.5 rounded-lg bg-accent text-accent-foreground font-bold"
              >
                {paused ? t("game.resume") : t("game.pause")}
              </button>
              <button
                onClick={restart}
                className="px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-bold"
              >
                {t("game.restart")}
              </button>
            </>
          )}
          <Link to="/topics" className="px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold">
            {t("nav.backToTopics")}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-4">
        {banner}

        {/* Pre-game settings: mode + background */}
        {!started && (
          <div className="grid gap-3 rounded-xl bg-card/80 p-3 shadow-sm backdrop-blur md:grid-cols-2">
            <div>
              <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("game.mode")}</div>
              <div className="flex flex-wrap gap-2">
                {(["classic", "chase"] as GameMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-lg border-2 px-3 py-2 text-sm font-bold transition ${
                      mode === m ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    {t(`game.mode.${m}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("game.bg")}</div>
              <div className="flex flex-wrap gap-2">
                {(["steppe", "mountains"] as BgKey[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBg(b)}
                    className={`rounded-lg border-2 px-3 py-2 text-sm font-bold transition ${
                      bg === b ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    {t(`game.bg.${b}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Score */}
        <div className="grid grid-cols-3 items-center gap-3 rounded-xl bg-card/70 p-3 shadow-sm backdrop-blur">
          <div className="text-center">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-team-a/80">
              {t("game.teamNameHint")}
            </label>
            <input
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value.slice(0, 20))}
              placeholder="Team A"
              aria-label={t("game.teamNameHint")}
              className="w-full rounded-md border-2 border-dashed border-team-a bg-white px-2 py-1 text-center text-sm font-bold uppercase tracking-widest text-team-a shadow-sm outline-none transition focus:border-solid focus:ring-2 focus:ring-team-a/40"
            />
            <div className="text-3xl font-extrabold text-team-a">{scoreA}</div>
          </div>
          <div className="space-y-1 text-center text-xs text-muted-foreground">
            <div>{isChase ? t("game.chaseHint") : t("game.scoreHint")}</div>
          </div>
          <div className="text-center">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-team-b/80">
              {t("game.teamNameHint")}
            </label>
            <input
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value.slice(0, 20))}
              placeholder="Team B"
              aria-label={t("game.teamNameHint")}
              className="w-full rounded-md border-2 border-dashed border-team-b bg-white px-2 py-1 text-center text-sm font-bold uppercase tracking-widest text-team-b shadow-sm outline-none transition focus:border-solid focus:ring-2 focus:ring-team-b/40"
            />
            <div className="text-3xl font-extrabold text-team-b">{scoreB}</div>
          </div>
        </div>

        <GameField
          mode={mode}
          bg={bg}
          position={position}
          flash={flash}
          throwing={throwing}
          teamAName={teamAName}
          teamBName={teamBName}
          girlSteps={girlSteps}
          boySteps={boySteps}
          chaseTarget={CHASE_TARGET}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <QuestionCard
            key={`A-${qASerial}`}
            team="A"
            teamName={teamAName}
            question={qA}
            disabled={!started || !!winner || paused}
            onAnswer={onAnswerA}
          />
          <QuestionCard
            key={`B-${qBSerial}`}
            team="B"
            teamName={teamBName}
            question={qB}
            disabled={!started || !!winner || paused}
            onAnswer={onAnswerB}
          />
        </div>

        {!started && enough && (
          <div className="text-center text-muted-foreground">
            {t("game.startHint")}
          </div>
        )}
      </div>

      {paused && started && !winner && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl bg-card px-10 py-8 text-center shadow-2xl">
            <div className="text-5xl">⏸</div>
            <h2 className="mt-3 text-2xl font-extrabold">{t("game.paused")}</h2>
            <button
              onClick={() => setPaused(false)}
              className="mt-4 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground"
            >
              {t("game.resume")}
            </button>
          </div>
        </div>
      )}

      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-10 text-center shadow-2xl">
            <div className="text-7xl">🏆</div>
            <h2 className={`text-3xl font-extrabold ${winner === "A" ? "text-team-a" : "text-team-b"}`}>
              {t("game.winner", { name: winner === "A" ? teamAName : teamBName })}
            </h2>
            <p className="text-muted-foreground">
              {t("game.score")} — {teamAName}: <strong>{scoreA}</strong> · {teamBName}: <strong>{scoreB}</strong>
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setWinner(null);
                  setPosition(0);
                  setGirlSteps(0);
                  setBoySteps(0);
                  setThrowing(null);
                  qARef.current = null;
                  qBRef.current = null;
                  const a = pickNext("A");
                  qARef.current = a;
                  const b = pickNext("B");
                  qBRef.current = b;
                  setQA(a);
                  setQB(b);
                  setQASerial((s) => s + 1);
                  setQBSerial((s) => s + 1);
                }}
                className="rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground"
              >
                {t("game.nextRound")}
              </button>
              <button
                onClick={restart}
                className="rounded-lg bg-secondary px-6 py-3 font-bold text-secondary-foreground"
              >
                {t("game.restart")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
