import React from "react";
import { STAT_KEYS, STAT_META } from "../data/tasks";

// ❓ "How to play" card: icons first, very few words
export function HelpModal({ t, onClose }) {
  const h = t.help;
  const rows = [
    { icon: "🕹️", text: h.drive, keys: ["W", "A", "S", "D"] },
    { icon: "🏁", text: h.enter, keys: ["E"] },
    { icon: "👆", text: h.spots },
    { icon: "🎮", text: h.play },
    { icon: "🏅", text: h.badges },
    { icon: "🔧", text: h.repair },
    { icon: "🚀", text: h.home },
  ];
  return (
    <div className="fixed inset-0 z-[46] flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="rover-pop-in w-full max-w-lg max-h-[94vh] overflow-y-auto bg-slate-900 border-2 border-cyan-400/60 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <h2 className="font-display text-2xl font-bold text-cyan-300 mb-3 text-center">❓ {h.title}</h2>
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.icon} className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-800/80 border border-white/10">
              <span className="text-3xl w-10 text-center">{r.icon}</span>
              <span className="flex-1 text-sm sm:text-base font-bold text-slate-100">{r.text}</span>
              {r.keys && (
                <span className="flex gap-1">
                  {r.keys.map((k) => (
                    <kbd key={k} className="w-7 h-7 rounded-lg bg-slate-950 border-b-4 border-slate-600 text-white text-xs font-extrabold flex items-center justify-center">
                      {k}
                    </kbd>
                  ))}
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {STAT_KEYS.map((k) => (
            <div key={k} className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-white/10">
              <span className="text-xl">{STAT_META[k].icon}</span>
              <span className="text-xs font-bold text-slate-200">{h.stats[k]}</span>
            </div>
          ))}
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-display font-bold text-lg shadow-lg">
          👍 {h.gotIt}
        </button>
      </div>
    </div>
  );
}

// ⏸ Pause screen
export function PauseOverlay({ t, onResume, onHelp, onSettings, onLog, onResetCam, onNasa }) {
  const h = t.help;
  return (
    <div className="fixed inset-0 z-[44] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="rover-pop-in w-full max-w-sm text-center">
        <div className="text-7xl mb-2">⏸️</div>
        <h2 className="font-display text-4xl font-bold text-white mb-5">{h.paused}</h2>
        <div className="grid gap-3">
          <button type="button" onClick={onResume} className="py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-display font-bold text-2xl shadow-lg">
            ▶ {h.resume}
          </button>
          <button type="button" onClick={onLog} className="py-3.5 rounded-2xl bg-amber-300 text-slate-950 font-display font-bold text-lg">
            📔 {t.blast.logTitle}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={onHelp} className="py-3.5 rounded-2xl bg-slate-800 border-2 border-cyan-400/50 text-cyan-100 font-display font-bold text-lg">
              ❓ {h.title}
            </button>
            <button type="button" onClick={onSettings} className="py-3.5 rounded-2xl bg-slate-800 border-2 border-amber-400/50 text-amber-100 font-display font-bold text-lg">
              ⚙️ {t.settings}
            </button>
            <button type="button" onClick={onResetCam} className="py-3 rounded-2xl bg-slate-800 border-2 border-white/20 text-slate-100 font-bold">
              🎥 {t.resetCam}
            </button>
            <button type="button" onClick={onNasa} className="py-3 rounded-2xl bg-slate-800 border-2 border-sky-400/50 text-sky-100 font-bold">
              ✨ NASA
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs font-bold text-slate-400">{h.pauseKey}</p>
      </div>
    </div>
  );
}
