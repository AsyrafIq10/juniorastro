import React from "react";
import CapAvatar from "./CapAvatar";
import { TASKS } from "../data/tasks";

const BTN =
  "shrink-0 px-6 py-3 rounded-2xl font-display font-bold text-base shadow-lg transition transform hover:-translate-y-0.5";

export default function TaskCard({ t, phase, taskIndex, revisit, capMood, roverDamaged, onStartMission, onDrive, onDriveHome, flagPending }) {
  const b = t.blast;

  if (phase === "intro") {
    return (
      <div className="fixed bottom-4 inset-x-0 z-20 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          <CapAvatar mood="happy" message={t.intro.capLine} />
          <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-orange-400/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">{t.intro.title}</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{b.scienceHint}</p>
            </div>
            <button type="button" onClick={onStartMission} className={`${BTN} bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950`}>
              🚀 {t.intro.startBtn} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase !== "playing") return null;

  // All tasks finished: the rocket pad is now the "go home" checkpoint
  if (taskIndex >= TASKS.length) {
    return (
      <div className="fixed bottom-4 inset-x-0 z-20 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto">
          <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border-2 border-emerald-400/60 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-emerald-300">🎉 {b.allDone}</h2>
              <p className="text-xs sm:text-sm text-slate-300">{flagPending ? t.flag.allDoneFlag : b.allDoneDrive}</p>
            </div>
            <button type="button" onClick={onDriveHome} className={`${BTN} bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950`}>
              🚙 {flagPending ? t.flag.driveToFlag : b.driveToRocket} {flagPending ? "🚩" : "🚀"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const copy = t.tasks[taskIndex];
  const env = TASKS[taskIndex].env;

  return (
    <div className="fixed bottom-3 sm:bottom-4 inset-x-0 z-20 px-3 sm:px-4 pointer-events-none">
      <div className="max-w-3xl mx-auto flex flex-col gap-2.5">
        <CapAvatar mood={capMood} message={revisit ? copy.revisit.text : copy.capTip} />
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-amber-400/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
              🏁 {b.nextTask}: {b.taskLabel} {taskIndex + 1} {b.of} {TASKS.length}
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">{copy.title}</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              {!revisit && b.env[env] && <span className="text-xs font-bold text-rose-200">{b.env[env]}</span>}
              {roverDamaged && <span className="text-xs font-bold text-rose-300">🔧 {b.repairHint}</span>}
            </div>
          </div>
          <button type="button" onClick={onDrive} className={`${BTN} bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950`}>
            🚙 {b.driveBtn} →
          </button>
        </div>
      </div>
    </div>
  );
}
