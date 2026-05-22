import { useMemo } from "react";
import { motion } from "framer-motion";
import riderAImg from "@/assets/rider-a.png";
import riderBImg from "@/assets/rider-b.png";
import riderGirlImg from "@/assets/rider-girl.png";
import riderBoyImg from "@/assets/rider-boy.png";
import carcassImg from "@/assets/carcass.png";
import goalAImg from "@/assets/goal-a.png";
import goalBImg from "@/assets/goal-b.png";
import steppeBg from "@/assets/arena-bg.jpg";
import mountainsBg from "@/assets/arena-bg-mountains.jpg";

export type GameMode = "classic" | "chase";
export type BgKey = "steppe" | "mountains";

export const BG_IMAGES: Record<BgKey, string> = {
  steppe: steppeBg,
  mountains: mountainsBg,
};

type Props = {
  mode?: GameMode;
  bg?: BgKey;
  position: number; // classic: -5..5  | chase: 0..10 (gap; 10 = far, 0 = caught)
  flash?: "A" | "B" | null;
  throwing?: "A" | "B" | null;
  teamAName?: string;
  teamBName?: string;
  // Chase mode only — independent advances of each rider.
  girlSteps?: number;
  boySteps?: number;
  chaseTarget?: number;
};

type SlotType = "goal-a" | "goal-b" | "rider-a" | "rider-b" | "center";

export default function GameField({ mode = "classic", bg = "steppe", position, flash = null, throwing = null, teamAName = "TEAM A", teamBName = "TEAM B", girlSteps = 0, boySteps = 0, chaseTarget = 6 }: Props) {
  const bgUrl = BG_IMAGES[bg] ?? steppeBg;
  if (mode === "chase") {
    return <ChaseField bgUrl={bgUrl} flash={flash} girlsName={teamAName} boysName={teamBName} girlSteps={girlSteps} boySteps={boySteps} chaseTarget={chaseTarget} />;
  }
  return <ClassicField bgUrl={bgUrl} position={position} flash={flash} throwing={throwing} teamAName={teamAName} teamBName={teamBName} />;
}

/* ---------- Classic Kok Boru ---------- */

function ClassicField({ bgUrl, position, flash, throwing, teamAName, teamBName }: { bgUrl: string; position: number; flash: "A" | "B" | null; throwing: "A" | "B" | null; teamAName: string; teamBName: string }) {
  const slots = useMemo(
    () => [
      { pos: -5, label: "", type: "goal-a" as SlotType },
      { pos: -4, label: "", type: "rider-a" as SlotType },
      { pos: -3, label: "", type: "rider-a" as SlotType },
      { pos: -2, label: "", type: "rider-a" as SlotType },
      { pos: -1, label: "", type: "rider-a" as SlotType },
      { pos: 0, label: "Талаа", type: "center" as SlotType },
      { pos: 1, label: "", type: "rider-b" as SlotType },
      { pos: 2, label: "", type: "rider-b" as SlotType },
      { pos: 3, label: "", type: "rider-b" as SlotType },
      { pos: 4, label: "", type: "rider-b" as SlotType },
      { pos: 5, label: "", type: "goal-b" as SlotType },
    ],
    [],
  );

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-4 border-accent shadow-2xl sm:rounded-3xl"
      style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center bottom" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-200/0 via-transparent to-emerald-900/30" />

      <div className="relative flex items-center justify-between gap-2 px-2 py-2 text-[10px] font-extrabold uppercase tracking-widest sm:px-5 sm:py-3 sm:text-xs">
        <span className={`truncate rounded-full bg-team-a px-2 py-1 text-team-a-foreground shadow-md transition-transform sm:px-3 ${flash === "A" ? "scale-110" : ""}`}>← {teamAName}</span>
        <span className="hidden truncate rounded-full bg-black/40 px-3 py-1 text-white backdrop-blur-sm sm:inline-block">🏇 Кок Бору Арена 🐐</span>
        <span className={`truncate rounded-full bg-team-b px-2 py-1 text-team-b-foreground shadow-md transition-transform sm:px-3 ${flash === "B" ? "scale-110" : ""}`}>{teamBName} →</span>
      </div>

      <div className="relative h-52 px-1 pb-3 sm:h-72 sm:px-4 sm:pb-4 md:h-80">
        <div className="absolute inset-x-3 bottom-4 h-24 rounded-[40%] bg-amber-700/60 shadow-inner ring-2 ring-amber-900/40 sm:inset-x-6 sm:bottom-6 sm:h-32 md:h-40" />
        <div className="absolute inset-x-6 bottom-7 h-1.5 rounded-full bg-amber-50/40 sm:inset-x-10 sm:bottom-10 sm:h-2" />

        <div className="relative grid h-full grid-cols-11 items-end gap-0.5">
          {slots.map((s) => (
            <div key={s.pos} className={`relative flex h-full flex-col items-center justify-end pb-1.5 sm:pb-2 ${s.pos === -5 ? "-ml-3 sm:-ml-6" : ""} ${s.pos === 5 ? "-mr-3 sm:-mr-6" : ""}`}>
              <Slot type={s.type} active={s.pos === position && !throwing} carrying={s.pos === position && !throwing && (s.type === "rider-a" || s.type === "rider-b")} />
              {s.label && (
                <div className="mt-1 hidden rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white sm:block md:text-[10px]">{s.label}</div>
              )}

              {s.pos === position && !throwing && (
                <motion.div layoutId="carcass" transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.6 }} className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2" style={{ bottom: "2rem" }}>
                  <Carcass />
                </motion.div>
              )}

              {throwing && ((throwing === "A" && s.pos === -5) || (throwing === "B" && s.pos === 5)) && (
                <motion.div layoutId="carcass" initial={false} animate={{ y: [0, -40, 10], scale: [1, 1.2, 0.6], rotate: [0, 360, 720], opacity: [1, 1, 0] }} transition={{ duration: 1.2, ease: "easeIn", times: [0, 0.5, 1] }} className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2" style={{ bottom: "2.5rem" }}>
                  <Carcass />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Slot({ type, active, carrying = false }: { type: SlotType; active: boolean; carrying?: boolean }) {
  if (type === "goal-a" || type === "goal-b") {
    const isA = type === "goal-a";
    return (
      <motion.img
        src={isA ? goalAImg : goalBImg}
        alt={isA ? "Тай Казан A" : "Тай Казан B"}
        loading="eager"
        decoding="async"
        animate={active ? { scale: isA ? [0.85, 0.92, 0.85] : [0.7, 0.76, 0.7] } : { scale: isA ? 0.85 : 0.7 }}
        transition={{ duration: 0.6, repeat: active ? Infinity : 0 }}
        style={{ filter: "brightness(0.95) saturate(0.95)" }}
        className={`relative z-0 w-auto object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.45)] ${
          isA
            ? "h-24 -translate-y-2 sm:h-32 sm:-translate-y-3 md:h-40 md:-translate-y-4"
            : "h-20 -translate-y-3 sm:h-28 sm:-translate-y-4 md:h-36 md:-translate-y-5"
        }`}
      />
    );
  }
  if (type === "center") {
    return (
      <div className={`flex size-7 items-center justify-center rounded-full border-2 border-dashed bg-white/30 backdrop-blur-sm sm:size-10 md:size-12 ${active ? "border-accent ring-4 ring-accent/60" : "border-white/70"}`}>
        <div className="size-1.5 rounded-full bg-accent sm:size-2" />
      </div>
    );
  }
  return <Rider color={type === "rider-a" ? "a" : "b"} active={active} carrying={carrying} />;
}

function Rider({ color, active, carrying = false }: { color: "a" | "b"; active: boolean; carrying?: boolean }) {
  const carryAnim = carrying ? { y: [0, -8, 0, -6, 0], rotate: [-3, 3, -3], scale: [1.1, 1.15, 1.1] } : active ? { scale: 1.08 } : { scale: 1 };
  const carryTransition = carrying ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const } : { type: "spring" as const, stiffness: 260, damping: 20 };
  return (
    <motion.div animate={carryAnim} transition={carryTransition} className="relative">
      {active && <div className={`absolute inset-0 -z-10 rounded-full blur-xl ${carrying ? "bg-amber-400/70 animate-pulse" : "bg-accent/50"}`} aria-hidden />}
      <img
        src={color === "a" ? riderAImg : riderBImg}
        alt={color === "a" ? "Команда A" : "Команда B"}
        loading="eager"
        decoding="async"
        className={`h-14 w-auto object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.45)] sm:h-20 md:h-24 ${carrying ? "drop-shadow-[0_0_14px_rgba(255,180,40,0.95)]" : active ? "drop-shadow-[0_0_10px_rgba(255,200,80,0.85)]" : ""}`}
      />
      <div className="absolute -bottom-1 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-black/40 blur-sm sm:h-2 sm:w-12" />
    </motion.div>
  );
}

function Carcass() {
  return (
    <motion.img
      src={carcassImg}
      alt="Улак"
      loading="eager"
      decoding="async"
      animate={{ rotate: [-6, 6, -6], y: [0, -3, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      className="h-9 w-auto object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.55)] sm:h-12 md:h-14"
    />
  );
}

/* ---------- Chase mode (boys vs girls) ---------- */

function ChaseField({ bgUrl, flash, girlsName, boysName, girlSteps, boySteps, chaseTarget }: { bgUrl: string; flash: "A" | "B" | null; girlsName: string; boysName: string; girlSteps: number; boySteps: number; chaseTarget: number }) {
  const HEAD_START = 2;
  const STEP_PCT = 8;
  const BOY_BASE = 10;
  // Each rider advances forward independently. Boys catch up by closing the gap.
  const boyLeftPct = Math.min(80, BOY_BASE + boySteps * STEP_PCT);
  const girlLeftPct = Math.min(88, BOY_BASE + (HEAD_START + girlSteps) * STEP_PCT);
  const gap = HEAD_START + girlSteps - boySteps;
  const finishLeftPct = Math.min(92, BOY_BASE + (HEAD_START + chaseTarget) * STEP_PCT);
  const girlProgress = Math.min(100, (girlSteps / chaseTarget) * 100);
  const boyProgress = Math.min(100, (boySteps / (chaseTarget + HEAD_START)) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl border-4 border-accent shadow-2xl sm:rounded-3xl">
      {/* Seamless scrolling background: original + mirrored copies in a strip.
          Because adjacent edges are mirror images of each other, the seam is invisible. */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 flex"
          style={{ width: "400%" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <img src={bgUrl} alt="" className="h-full w-1/4 object-cover" />
          <img src={bgUrl} alt="" className="h-full w-1/4 object-cover" style={{ transform: "scaleX(-1)" }} />
          <img src={bgUrl} alt="" className="h-full w-1/4 object-cover" />
          <img src={bgUrl} alt="" className="h-full w-1/4 object-cover" style={{ transform: "scaleX(-1)" }} />
        </motion.div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-200/0 via-transparent to-emerald-900/40" />

      {/* Traditional Kyrgyz ornament frame — top & bottom borders */}
      <KyrgyzOrnamentBorder position="top" />
      <KyrgyzOrnamentBorder position="bottom" />

      {/* Parallax mid-layer: scrolling traditional Kyrgyz ornament band */}
      <div className="pointer-events-none absolute inset-x-0 bottom-14 h-10 overflow-hidden opacity-70 sm:bottom-20 sm:h-14">
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{ width: "200%" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <KyrgyzOrnamentStrip />
        </motion.div>
      </div>

      <div className="relative flex items-center justify-between gap-2 px-2 py-2 text-[10px] font-extrabold uppercase tracking-widest sm:px-5 sm:py-3 sm:text-xs">
        <span className={`truncate rounded-full bg-team-b px-2 py-1 text-team-b-foreground shadow-md transition-transform sm:px-3 ${flash === "B" ? "scale-110" : ""}`}>🐎 {boysName}</span>
        <span className="hidden truncate rounded-full bg-black/40 px-3 py-1 text-white backdrop-blur-sm sm:inline-block">Gap: {Math.max(0, gap)} · {girlSteps}/{chaseTarget}</span>
        <span className={`truncate rounded-full bg-team-a px-2 py-1 text-team-a-foreground shadow-md transition-transform sm:px-3 ${flash === "A" ? "scale-110" : ""}`}>{girlsName} 🐎</span>
      </div>

      {/* Progress bars */}
      <div className="relative z-10 mx-2 mb-1 space-y-1 sm:mx-4">
        <div className="flex items-center gap-2">
          <span className="w-5 text-xs">🏁</span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-black/40">
            <motion.div className="h-full bg-team-a" animate={{ width: `${girlProgress}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
          </div>
          <span className="w-10 text-right text-[10px] font-bold text-white">{girlSteps}/{chaseTarget}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 text-xs">🐎</span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-black/40">
            <motion.div className="h-full bg-team-b" animate={{ width: `${boyProgress}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
          </div>
          <span className="w-10 text-right text-[10px] font-bold text-white">{Math.max(0, gap)}</span>
        </div>
      </div>

      <div className="relative h-52 sm:h-72 md:h-80">
        {/* Ground line */}
        <div className="absolute inset-x-0 bottom-4 h-1.5 bg-amber-50/40 sm:bottom-6" />
        <motion.div
          className="absolute inset-x-0 bottom-2 h-3 bg-amber-700/40"
          animate={{ backgroundPositionX: ["0px", "-200px"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0 10px, transparent 10px 24px)" }}
        />

        {/* Finish line — where girls must reach to win */}
        <div className="absolute bottom-4 z-10 flex flex-col items-center sm:bottom-6" style={{ left: `${finishLeftPct}%`, transform: "translateX(-50%)" }}>
          <motion.div
            animate={{ y: [0, -3, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-1 text-2xl drop-shadow-[0_3px_3px_rgba(0,0,0,0.6)] sm:text-3xl"
          >
            🏁
          </motion.div>
          <div
            className="h-28 w-1.5 sm:h-40 sm:w-2"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #fff 0 8px, #111 8px 16px)",
              boxShadow: "0 0 8px rgba(0,0,0,0.5)",
            }}
          />
          <span className="mt-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white sm:text-[10px]">FINISH</span>
        </div>

        {/* Boy (chaser) */}
        <motion.div
          className="absolute bottom-6 sm:bottom-10"
          animate={{ left: `${boyLeftPct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          <ChaseRider src={riderBoyImg} alt={boysName} bobbing />
        </motion.div>

        {/* Girl (runner) */}
        <motion.div
          className="absolute bottom-6 sm:bottom-10"
          animate={{ left: `${girlLeftPct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          <ChaseRider src={riderGirlImg} alt={girlsName} bobbing />
        </motion.div>
      </div>
    </div>
  );
}

function ChaseRider({ src, alt, bobbing }: { src: string; alt: string; bobbing?: boolean }) {
  return (
    <motion.img
      src={src}
      alt={alt}
      loading="eager"
      decoding="async"
      animate={bobbing ? { y: [0, -6, 0, -4, 0] } : {}}
      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
      className="h-20 w-auto object-contain drop-shadow-[0_6px_6px_rgba(0,0,0,0.55)] sm:h-28 md:h-36"
    />
  );
}

/* ---------- Kyrgyz traditional ornament SVGs ---------- */

// A repeating "kyial" / horn-style motif inspired by Kyrgyz felt-shyrdak ornaments.
function KyrgyzOrnamentStrip() {
  return (
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <defs>
        <pattern id="kyrgyzMotif" x="0" y="0" width="80" height="40" patternUnits="userSpaceOnUse">
          {/* Central rhombus (tumar — amulet) */}
          <path
            d="M40 6 L54 20 L40 34 L26 20 Z"
            fill="none"
            stroke="#fde68a"
            strokeWidth="1.5"
          />
          <path
            d="M40 12 L48 20 L40 28 L32 20 Z"
            fill="#dc2626"
            stroke="#fde68a"
            strokeWidth="0.8"
          />
          {/* Curling horns (kochkor muyuz — ram horns) on each side */}
          <path
            d="M10 20 Q10 10 20 10 Q26 10 26 18 Q26 22 22 22 Q18 22 18 18"
            fill="none"
            stroke="#fde68a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10 20 Q10 30 20 30 Q26 30 26 22 Q26 18 22 18 Q18 18 18 22"
            fill="none"
            stroke="#fde68a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M70 20 Q70 10 60 10 Q54 10 54 18 Q54 22 58 22 Q62 22 62 18"
            fill="none"
            stroke="#fde68a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M70 20 Q70 30 60 30 Q54 30 54 22 Q54 18 58 18 Q62 18 62 22"
            fill="none"
            stroke="#fde68a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </pattern>
      </defs>
      <rect width="400" height="40" fill="url(#kyrgyzMotif)" />
    </svg>
  );
}

// Decorative top/bottom border evoking shyrdak felt-rug edge bands.
function KyrgyzOrnamentBorder({ position }: { position: "top" | "bottom" }) {
  const isTop = position === "top";
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-[5] h-3 sm:h-4 ${isTop ? "top-9 sm:top-11" : "bottom-0"}`}
      style={{
        background:
          "repeating-linear-gradient(90deg, #7c2d12 0 14px, #fde68a 14px 16px, #7c2d12 16px 30px, #dc2626 30px 32px)",
        borderTop: isTop ? "none" : "1px solid rgba(253,230,138,0.6)",
        borderBottom: isTop ? "1px solid rgba(253,230,138,0.6)" : "none",
        boxShadow: "inset 0 0 6px rgba(0,0,0,0.4)",
      }}
    />
  );
}
