import React, { useEffect, useRef } from "react";
import { Settings, Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { MODULE_COLLIDERS } from "./MarsScene";
import { STAT_KEYS, STAT_META, TASKS, HOME_POS, FLAG_POS, SCIENCE_PER_UPGRADE, MAX_ROVER_LEVEL, REPAIR_COST, roverSpeedMultiplier } from "../data/tasks";

const MAP_ICONS = { habitat: "🏠", solar: "⚡", moxie: "🫁", greenhouse: "🌱" };
const MAP_RANGE = 28; // world units from centre to map edge

function toMap(x, z) {
  const k = 50 / MAP_RANGE;
  const mx = Math.max(-46, Math.min(46, x * k));
  const my = Math.max(-46, Math.min(46, z * k));
  return { left: `${50 + mx}%`, top: `${50 + my}%` };
}

function MiniMap({ t, roverState, nearby, taskIndex, badges, flagPending }) {
  const arrowRef = useRef(null);

  // Move the rover marker straight from the 3D rover state (no React re-renders)
  useEffect(() => {
    let raf;
    const loop = () => {
      const s = roverState?.current;
      if (s && arrowRef.current) {
        const p = toMap(s.pos.x, s.pos.z);
        arrowRef.current.style.left = p.left;
        arrowRef.current.style.top = p.top;
        arrowRef.current.style.transform = `translate(-50%, -50%) rotate(${Math.PI - s.rotY}rad)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [roverState]);

  return (
    <div className="rover-pop-in flex flex-col items-center gap-1">
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-cyan-400/50 shadow-xl overflow-hidden">
        <div className="absolute inset-[18%] rounded-full border border-white/10" />
        <div className="absolute inset-[36%] rounded-full border border-white/10" />
        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-extrabold text-slate-400">N</span>
        {MODULE_COLLIDERS.map((c) => {
          const p = toMap(c.x, c.z);
          const active = nearby === c.id;
          return (
            <span
              key={c.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all duration-300 ${
                active ? "w-6 h-6 bg-amber-300/90 shadow-[0_0_12px_rgba(252,211,77,0.9)]" : "w-4 h-4 bg-slate-700/80"
              }`}
              style={p}
            >
              <span className="text-[9px] leading-none">{MAP_ICONS[c.id]}</span>
            </span>
          );
        })}
        {TASKS.map((task, i) => {
          const p = toMap(task.pos.x, task.pos.z);
          const done = i < taskIndex;
          const active = i === taskIndex;
          const quiz = done && !badges.includes(i);
          return (
            <span
              key={task.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full font-extrabold ${
                active
                  ? "w-6 h-6 bg-amber-400 text-slate-950 text-[11px] animate-pulse shadow-[0_0_14px_rgba(251,191,36,0.95)]"
                  : quiz
                  ? "w-5 h-5 bg-violet-500 text-[9px] animate-pulse"
                  : done
                  ? "w-4 h-4 bg-emerald-500 text-[8px] text-white"
                  : "w-4 h-4 bg-slate-600/80 text-[8px] text-slate-200"
              }`}
              style={p}
            >
              {quiz ? "🏅" : done ? "✓" : i + 1}
            </span>
          );
        })}
        {taskIndex >= TASKS.length && flagPending && (
          <span
            className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-[11px] animate-pulse shadow-[0_0_14px_rgba(239,68,68,0.95)]"
            style={toMap(FLAG_POS.x, FLAG_POS.z)}
          >
            🚩
          </span>
        )}
        {taskIndex >= TASKS.length && !flagPending && (
          <span
            className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-sky-400 text-[11px] animate-pulse shadow-[0_0_14px_rgba(56,189,248,0.95)]"
            style={toMap(HOME_POS.x, HOME_POS.z)}
          >
            🚀
          </span>
        )}
        <div ref={arrowRef} className="absolute z-10" style={{ left: "50%", top: "50%" }} aria-label={t.rover.you}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M9 1 L16 16 L9 12 L2 16 Z" fill="#22d3ee" stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-[10px] font-extrabold uppercase tracking-wider text-cyan-200">
        🗺️ {t.rover.map}
      </span>
    </div>
  );
}

// Live "Task N: name • 34 m away" panel
function TaskPanel({ t, roverState, taskIndex, flagPending }) {
  const distRef = useRef(null);
  const allDone = taskIndex >= TASKS.length;
  const task = allDone ? { pos: flagPending ? FLAG_POS : HOME_POS, env: null } : TASKS[taskIndex];

  useEffect(() => {
    if (!task) return undefined;
    let raf;
    const loop = () => {
      const s = roverState?.current;
      if (s && distRef.current) {
        const d = Math.max(0, Math.hypot(s.pos.x - task.pos.x, s.pos.z - task.pos.z) * 10 - 26);
        distRef.current.textContent = `${Math.round(d)} ${t.blast.metersAway}`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [roverState, task, t]);

  const envLabel = task.env ? t.blast.env[task.env] : null;

  return (
    <div className={`rover-pop-in max-w-[260px] px-3.5 py-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border-2 shadow-xl ${allDone ? "border-sky-400/70" : "border-amber-400/60"}`}>
      <div className={`text-[10px] font-extrabold uppercase tracking-wider ${allDone ? "text-sky-300" : "text-amber-300"}`}>
        {allDone ? `🎉 ${t.blast.allDone}` : `🏁 ${t.blast.taskLabel} ${taskIndex + 1} ${t.blast.of} ${TASKS.length}`}
      </div>
      <div className="font-display text-base font-bold text-white leading-tight">{allDone ? (flagPending ? `🚩 ${t.flag.checkpoint}` : `🚀 ${t.blast.homeCheckpoint}`) : t.tasks[taskIndex].short}</div>
      <div className="flex items-center gap-2 mt-1">
        <span ref={distRef} className="text-xs font-bold text-cyan-200" />
        {envLabel && <span className="text-[10px] font-bold text-rose-200">{envLabel}</span>}
      </div>
      <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{t.blast.followArrow}</div>
    </div>
  );
}

function DpadButton({ dir, Icon, onPress }) {
  return (
    <button
      type="button"
      aria-label={dir}
      onPointerDown={(e) => {
        try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* pointer already gone */ }
        onPress(dir, true);
      }}
      onPointerUp={() => onPress(dir, false)}
      onPointerCancel={() => onPress(dir, false)}
      onLostPointerCapture={() => onPress(dir, false)}
      onContextMenu={(e) => e.preventDefault()}
      style={{ touchAction: "none" }}
      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/85 active:bg-cyan-400 active:text-slate-950 active:scale-95 text-white border-2 border-white/20 flex items-center justify-center shadow-lg transition-transform"
    >
      <Icon className="w-7 h-7" />
    </button>
  );
}

const CP_STYLE = {
  task: { icon: "🏁", cls: "from-amber-400 to-orange-500 text-slate-950" },
  quiz: { icon: "🏅", cls: "from-violet-500 to-fuchsia-500 text-white" },
  home: { icon: "🚀", cls: "from-sky-400 to-cyan-400 text-slate-950" },
  flag: { icon: "🚩", cls: "from-red-500 to-amber-400 text-white" },
  secret: { icon: "🌀", cls: "from-violet-600 to-fuchsia-500 text-white" },
  piece: { icon: "✨", cls: "from-indigo-600 to-slate-700 text-white" },
  mega: { icon: "🌀", cls: "from-red-600 to-rose-500 text-white" },
};

// "Press E" prompt when the rover is parked inside a checkpoint ring
function EnterPrompt({ t, cp, onEnter }) {
  const st = CP_STYLE[cp.kind];
  const label = cp.kind === "secret" || cp.kind === "piece" || cp.kind === "mega" ? "???" : cp.kind === "task" ? t.tasks[cp.index].short : cp.kind === "quiz" ? `${t.blast.quizStation}: ${t.tasks[cp.index].quiz.badge}` : cp.kind === "flag" ? t.flag.plantLabel : t.blast.homeCheckpoint;
  return (
    <div className="fixed inset-x-0 bottom-28 sm:bottom-32 z-20 flex justify-center px-4 pointer-events-none">
      <button
        type="button"
        onClick={onEnter}
        className={`rover-pop-in pointer-events-auto flex items-center gap-3 pl-2 pr-5 py-2 rounded-2xl bg-gradient-to-r ${st.cls} font-display font-bold shadow-[0_10px_30px_rgba(0,0,0,0.45)] border-2 border-white/80 animate-pulse hover:scale-105 transition`}
      >
        <kbd className="w-10 h-10 rounded-xl bg-slate-950/85 text-white text-xl flex items-center justify-center border-b-4 border-slate-600">E</kbd>
        <span className="text-left leading-tight">
          <span className="block text-[11px] uppercase tracking-wider opacity-80">{t.blast.pressE}</span>
          <span className="block text-base sm:text-lg">
            {st.icon} {label}
          </span>
        </span>
      </button>
    </div>
  );
}

function RoverControls({ t, roverState, roverNearby, onExitRover, setDpad, taskIndex, badges, roverDamaged, onRepair, canRepair, nearCp, onEnterCheckpoint, flagPending }) {
  const showRepair = roverNearby === "habitat" && roverDamaged;
  return (
    <>
      {/* Entry banner (fades out by itself; a discovery card takes its place) */}
      <div className={`fixed top-28 sm:top-24 inset-x-0 z-20 flex justify-center pointer-events-none px-4 ${roverNearby ? "invisible" : ""}`}>
        <div className="rover-banner flex flex-col items-center text-center px-5 py-2.5 rounded-2xl bg-cyan-500/90 text-slate-950 shadow-xl">
          <span className="font-display text-lg sm:text-xl font-bold">🎮 {t.rover.camOn}</span>
          <span className="text-xs sm:text-sm font-bold">{t.blast.readyHint}</span>
        </div>
      </div>

      {/* "You found" discovery card (+ repair at the habitat garage) */}
      {roverNearby && (
        <div className="fixed top-28 sm:top-24 inset-x-0 z-20 flex justify-center pointer-events-none px-4">
          <div
            key={roverNearby}
            className="rover-pop-in flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border-2 border-amber-300/70 shadow-xl"
          >
            <span className="text-3xl">{MAP_ICONS[roverNearby]}</span>
            <div className="text-left">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">{t.rover.found}</div>
              <div className="font-display text-base sm:text-lg font-bold text-white">{t.modules[roverNearby]}</div>
            </div>
            {showRepair && (
              <button
                type="button"
                onClick={onRepair}
                disabled={!canRepair}
                className="pointer-events-auto ml-1 px-3 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 text-sm font-extrabold shadow-lg"
              >
                🔧 {t.blast.repairBtn} <span className="text-xs">{t.blast.repairCost}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Current task (top-left, under the HUD) */}
      <div className="fixed left-3 sm:left-5 top-[9.5rem] lg:top-24 z-20 pointer-events-none">
        <TaskPanel t={t} roverState={roverState} taskIndex={taskIndex} flagPending={flagPending} />
      </div>

      {nearCp && <EnterPrompt t={t} cp={nearCp} onEnter={onEnterCheckpoint} />}

      {/* Mini-map (bottom-left) */}
      <div className="fixed left-3 sm:left-5 bottom-4 sm:bottom-6 z-20 pointer-events-none">
        <MiniMap t={t} roverState={roverState} nearby={roverNearby} taskIndex={taskIndex} badges={badges} flagPending={flagPending} />
      </div>

      {/* Back to base (bottom-centre) */}
      <div className="fixed bottom-4 sm:bottom-6 inset-x-0 z-20 flex justify-center pointer-events-none">
        <button
          type="button"
          onClick={onExitRover}
          className="rover-pop-in pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-display text-base sm:text-lg font-bold shadow-[0_10px_30px_rgba(234,88,12,0.45)] border border-orange-300/60 transition hover:-translate-y-0.5"
        >
          <span>🏠</span>
          <span className="hidden sm:inline">{t.rover.backToBase}</span>
        </button>
      </div>

      {/* D-pad (bottom-right) */}
      <div className="fixed right-3 sm:right-5 bottom-4 sm:bottom-6 z-20 flex flex-col items-center gap-1.5 pointer-events-auto rover-pop-in select-none">
        <div className="hidden md:block px-2.5 py-1 rounded-full bg-slate-900/80 border border-cyan-400/40 text-[11px] font-bold text-cyan-200 mb-1 max-w-[220px] text-center">
          {t.roverHint}
        </div>
        <DpadButton dir="up" Icon={ArrowUp} onPress={setDpad} />
        <div className="flex gap-1.5">
          <DpadButton dir="left" Icon={ArrowLeft} onPress={setDpad} />
          <DpadButton dir="down" Icon={ArrowDown} onPress={setDpad} />
          <DpadButton dir="right" Icon={ArrowRight} onPress={setDpad} />
        </div>
      </div>
    </>
  );
}

function Gauge({ k, value, t, roverLevel }) {
  const meta = STAT_META[k];
  const isScience = k === "science";
  const val = isScience ? value : Math.max(0, Math.min(100, value));
  const isLow = !isScience && val <= 25;
  // Science bar fills toward the next rover upgrade
  const width = isScience
    ? roverLevel >= MAX_ROVER_LEVEL
      ? 100
      : ((val % SCIENCE_PER_UPGRADE) / SCIENCE_PER_UPGRADE) * 100
    : val;
  return (
    <div className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border ${isLow ? "border-rose-500/80 animate-pulse" : meta.border} shadow-lg`}>
      <div className="flex items-center justify-between gap-1.5 text-[11px] sm:text-xs font-bold mb-1">
        <span className="flex items-center gap-1 text-slate-100 min-w-0 leading-tight">
          <span className="shrink-0">{meta.icon}</span>
          <span className="whitespace-normal break-words">{t.resources[k]}</span>
        </span>
        <span className={`shrink-0 tabular-nums ${isLow ? "text-rose-400 font-extrabold" : meta.text}`}>{isScience ? val : `${val}%`}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${isLow ? "bg-rose-500" : meta.bar}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function HUD({
  t,
  stats,
  taskIndex,
  roverMode,
  roverLevel,
  roverDamaged,
  onToggleRoverMode,
  onResetCam,
  onOpenSettings,
  onOpenNasa,
  onDpadChange,
  roverState,
  roverNearby,
  onExitRover,
  onRepair,
  showRoverControls,
  badges = [],
  nearCp = null,
  flagPending = false,
  onEnterCheckpoint,
  logCount = 0,
  onPause,
  onHelp,
  onOpenLog,
  secretBadge = false,
  megaBadge = false,
}) {
  const setDpad = (dir, pressed) => {
    onDpadChange((prev) => ({ ...prev, [dir]: pressed }));
  };
  const speedPct = Math.round(roverSpeedMultiplier(roverLevel, roverDamaged) * 100);

  return (
    <>
      {/* Top HUD Bar */}
      <div className="fixed top-0 inset-x-0 z-20 p-3 sm:p-4 pointer-events-none">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Task progress + rover status */}
          <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/15 shadow-lg">
            <span className="text-lg">🏁</span>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-orange-300">
                {t.blast.tasks} {Math.min(taskIndex, TASKS.length)}/{TASKS.length}
              </div>
              <div className="flex gap-1 mt-1">
                {TASKS.map((task, i) => (
                  <span
                    key={task.id}
                    className={`w-3.5 h-3.5 rounded-full border ${
                      i < taskIndex ? "bg-emerald-400 border-emerald-300" : i === taskIndex ? "bg-amber-400 border-amber-200 animate-pulse" : "bg-slate-700 border-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="hidden sm:block ml-1 pl-2.5 border-l border-white/15" title={t.blast.badges}>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-violet-300">🏅 {badges.length}/{TASKS.length}</div>
              <div className="flex gap-0.5 mt-0.5">
                {TASKS.map((task, i) => (
                  <span key={task.id} className={`text-sm leading-none ${badges.includes(i) ? "" : "grayscale opacity-30"}`}>
                    {task.badge}
                  </span>
                ))}
                {megaBadge && (
                  <span title="MEGA" className="ml-0.5 text-sm leading-none">
                    🏆
                  </span>
                )}
                {secretBadge && (
                  <span title="?" className="ml-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-[10px] font-extrabold text-white flex items-center justify-center">
                    ?
                  </span>
                )}
              </div>
            </div>
            <div
              className={`hidden sm:block ml-1 pl-2.5 border-l border-white/15 text-[11px] font-extrabold leading-tight ${roverDamaged ? "text-rose-300" : "text-cyan-200"}`}
              title={roverDamaged ? t.blast.repairHint : t.blast.goodShape}
            >
              <div>🚙 {t.blast.level} {roverLevel}</div>
              <div>{roverDamaged ? `⚠️ ${t.blast.damaged}` : `${t.blast.speed} ${speedPct}%`}</div>
            </div>
          </div>

          {/* 4 Resource Gauges */}
          <div className="pointer-events-auto flex-1 min-w-[280px] max-w-3xl grid grid-cols-2 lg:grid-cols-4 gap-2">
            {STAT_KEYS.map((k) => (
              <Gauge key={k} k={k} value={stats[k]} t={t} roverLevel={roverLevel} />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleRoverMode}
              title={t.roverMode}
              className={`flex items-center gap-1.5 h-11 px-3 rounded-2xl backdrop-blur-md border text-xs font-bold transition shadow-lg ${
                roverMode ? "bg-cyan-500 text-slate-950 border-cyan-300" : "bg-slate-900/80 hover:bg-slate-800 text-slate-100 border-white/15"
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden md:inline">{t.roverMode}</span>
            </button>

            <button type="button" onClick={onOpenLog} title={t.blast.logTitle} className="relative flex items-center justify-center min-w-[44px] h-11 px-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/15 transition shadow-lg text-lg">
              📔
              {logCount > 0 && (
                <span key={logCount} className="rover-pop-in absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-extrabold flex items-center justify-center border-2 border-slate-900">
                  {logCount}
                </span>
              )}
            </button>

            <button type="button" onClick={onHelp} title={t.help.title} className="flex items-center justify-center min-w-[44px] h-11 px-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/15 transition shadow-lg text-lg">
              ❓
            </button>

            <button type="button" onClick={onPause} title={t.help.paused} className="flex items-center justify-center min-w-[44px] h-11 px-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/15 transition shadow-lg text-lg">
              ⏸️
            </button>

            <button type="button" onClick={onOpenSettings} title={t.settings} className="flex items-center justify-center min-w-[44px] h-11 px-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/15 transition shadow-lg text-amber-300 hidden sm:flex">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Rover Mode controls */}
      {roverMode && showRoverControls && (
        <RoverControls
          t={t}
          roverState={roverState}
          roverNearby={roverNearby}
          onExitRover={onExitRover}
          setDpad={setDpad}
          taskIndex={taskIndex}
          badges={badges}
          flagPending={flagPending}
          nearCp={nearCp}
          onEnterCheckpoint={onEnterCheckpoint}
          roverDamaged={roverDamaged}
          onRepair={onRepair}
          canRepair={Object.entries(REPAIR_COST).every(([k, v]) => stats[k] > -v)}
        />
      )}
    </>
  );
}
