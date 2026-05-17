import { useMemo } from "react";
import { motion } from "framer-motion";
import riderAImg from "@/assets/rider-a.png";
import riderBImg from "@/assets/rider-b.png";
import carcassImg from "@/assets/carcass.png";
import goalAImg from "@/assets/goal-a.png";
import goalBImg from "@/assets/goal-b.png";
import arenaBg from "@/assets/arena-bg.jpg";

type Props = {
  position: number; // -5..5  (negative = Team A goal on left, positive = Team B goal on right)
  flash?: "A" | "B" | null;
  throwing?: "A" | "B" | null;
  teamAName?: string;
  teamBName?: string;
};

type SlotType = "goal-a" | "goal-b" | "rider-a" | "rider-b" | "center";

export default function GameField({ position, flash = null, throwing = null, teamAName = "TEAM A", teamBName = "TEAM B" }: Props) {
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
      style={{
        backgroundImage: `url(${arenaBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-200/0 via-transparent to-emerald-900/30" />

      <div className="relative flex items-center justify-between gap-2 px-2 py-2 text-[10px] font-extrabold uppercase tracking-widest sm:px-5 sm:py-3 sm:text-xs">
        <span
          className={`truncate rounded-full bg-team-a px-2 py-1 text-team-a-foreground shadow-md transition-transform sm:px-3 ${
            flash === "A" ? "scale-110" : ""
          }`}
        >
          ← {teamAName}
        </span>
        <span className="hidden truncate rounded-full bg-black/40 px-3 py-1 text-white backdrop-blur-sm sm:inline-block">
          🏇 Кок Бору Арена 🐐
        </span>
        <span
          className={`truncate rounded-full bg-team-b px-2 py-1 text-team-b-foreground shadow-md transition-transform sm:px-3 ${
            flash === "B" ? "scale-110" : ""
          }`}
        >
          {teamBName} →
        </span>
      </div>

      <div className="relative h-52 px-1 pb-3 sm:h-72 sm:px-4 sm:pb-4 md:h-80">
        <div className="absolute inset-x-3 bottom-4 h-24 rounded-[40%] bg-amber-700/60 shadow-inner ring-2 ring-amber-900/40 sm:inset-x-6 sm:bottom-6 sm:h-32 md:h-40" />
        <div className="absolute inset-x-6 bottom-7 h-1.5 rounded-full bg-amber-50/40 sm:inset-x-10 sm:bottom-10 sm:h-2" />

        <div className="relative grid h-full grid-cols-11 items-end gap-0.5">
          {slots.map((s) => (
            <div
              key={s.pos}
              className={`relative flex h-full flex-col items-center justify-end pb-1.5 sm:pb-2 ${
                s.pos === -5 ? "-ml-3 sm:-ml-6" : ""
              } ${s.pos === 5 ? "-mr-3 sm:-mr-6" : ""}`}
            >
              <Slot type={s.type} active={s.pos === position && !throwing} carrying={s.pos === position && !throwing && (s.type === "rider-a" || s.type === "rider-b")} />
              {s.label && (
                <div className="mt-1 hidden rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white sm:block md:text-[10px]">
                  {s.label}
                </div>
              )}

              {s.pos === position && !throwing && (
                <motion.div
                  layoutId="carcass"
                  transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.6 }}
                  className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2"
                  style={{ bottom: "2rem" }}
                >
                  <Carcass />
                </motion.div>
              )}

              {throwing && ((throwing === "A" && s.pos === -5) || (throwing === "B" && s.pos === 5)) && (
                <motion.div
                  layoutId="carcass"
                  initial={false}
                  animate={{ y: [0, -40, 10], scale: [1, 1.2, 0.6], rotate: [0, 360, 720], opacity: [1, 1, 0] }}
                  transition={{ duration: 1.2, ease: "easeIn", times: [0, 0.5, 1] }}
                  className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2"
                  style={{ bottom: "2.5rem" }}
                >
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
    return (
      <motion.img
        src={type === "goal-a" ? goalAImg : goalBImg}
        alt={type === "goal-a" ? "Тай Казан A" : "Тай Казан B"}
        loading="eager"
        decoding="async"
        animate={active ? { scale: [0.78, 0.84, 0.78] } : { scale: 0.78 }}
        transition={{ duration: 0.6, repeat: active ? Infinity : 0 }}
        style={{ transform: "translateY(14px)", filter: "brightness(0.92) saturate(0.9)" }}
        className="-z-10 h-20 w-auto object-contain opacity-90 drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] sm:h-28 md:h-36"
      />
    );
  }
  if (type === "center") {
    return (
      <div
        className={`flex size-7 items-center justify-center rounded-full border-2 border-dashed bg-white/30 backdrop-blur-sm sm:size-10 md:size-12 ${
          active ? "border-accent ring-4 ring-accent/60" : "border-white/70"
        }`}
      >
        <div className="size-1.5 rounded-full bg-accent sm:size-2" />
      </div>
    );
  }
  return <Rider color={type === "rider-a" ? "a" : "b"} active={active} carrying={carrying} />;
}

function Rider({ color, active, carrying = false }: { color: "a" | "b"; active: boolean; carrying?: boolean }) {
  const carryAnim = carrying
    ? { y: [0, -8, 0, -6, 0], rotate: [-3, 3, -3], scale: [1.1, 1.15, 1.1] }
    : active
    ? { scale: 1.08 }
    : { scale: 1 };
  const carryTransition = carrying
    ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const }
    : { type: "spring" as const, stiffness: 260, damping: 20 };
  return (
    <motion.div
      animate={carryAnim}
      transition={carryTransition}
      className="relative"
    >
      {active && (
        <div
          className={`absolute inset-0 -z-10 rounded-full blur-xl ${
            carrying ? "bg-amber-400/70 animate-pulse" : "bg-accent/50"
          }`}
          aria-hidden
        />
      )}
      <img
        src={color === "a" ? riderAImg : riderBImg}
        alt={color === "a" ? "Команда A" : "Команда B"}
        loading="eager"
        decoding="async"
        className={`h-14 w-auto object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.45)] sm:h-20 md:h-24 ${
          carrying
            ? "drop-shadow-[0_0_14px_rgba(255,180,40,0.95)]"
            : active
            ? "drop-shadow-[0_0_10px_rgba(255,200,80,0.85)]"
            : ""
        }`}
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
