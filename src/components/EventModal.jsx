import React, { useEffect, useState } from "react";
import { EVENTS } from "../data/events";
import { STAT_KEYS, STAT_META } from "../data/tasks";
import { ResourceBars } from "./OutcomeScene";
import SpeakButton from "./SpeakButton";
import { useAutoSpeak } from "../utils/speech";

// A quick 2-choice surprise while driving: big icons, one line, instant result.
export default function EventModal({ t, eventIndex, onChoose, onClose, onSfx }) {
  const ev = EVENTS[eventIndex];
  const copy = t.events[eventIndex];
  const [result, setResult] = useState(null); // { choice, before, after }
  const [typed, setTyped] = useState(0);

  // "Incoming transmission" typewriter for the message
  useEffect(() => {
    if (typed >= copy.text.length) return undefined;
    const id = setTimeout(() => setTyped((n) => n + 2), 18);
    return () => clearTimeout(id);
  }, [typed, copy.text.length]);

  useAutoSpeak(`${copy.title} ${copy.text}`, !result);
  useAutoSpeak(result ? copy.choices[result.choice].result : null, !!result);

  const pick = (i) => {
    onSfx?.("pop");
    setResult({ choice: i, ...onChoose(i) });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="rover-pop-in w-full max-w-lg bg-slate-900 border-2 border-cyan-400/60 rounded-3xl p-4 sm:p-6 shadow-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-extrabold uppercase tracking-wider mb-2 animate-pulse">
          📡 {t.blast.surprise}
        </div>
        <div className="text-6xl sm:text-7xl my-1 event-wobble">{ev.icon}</div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">{copy.title}</h2>
        <p className="mt-1 flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-cyan-100 min-h-[3em]">
          <span>
            {copy.text.slice(0, typed)}
            {typed < copy.text.length && <span className="animate-pulse">▌</span>}
          </span>
          <SpeakButton text={`${copy.title} ${copy.text}`} className="w-8 h-8 text-sm" />
        </p>

        {!result ? (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {ev.choices.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                className={`flex flex-col items-center p-3 rounded-2xl border-2 bg-slate-800 hover:bg-slate-700 active:scale-95 transition ${
                  i === 0 ? "border-cyan-400/50" : "border-amber-400/50"
                }`}
              >
                <span className="text-4xl">{c.icon}</span>
                <span className="mt-1 font-bold text-sm sm:text-base text-white">{copy.choices[i].short}</span>
                <span className="flex flex-wrap justify-center gap-1 mt-1.5">
                  {STAT_KEYS.filter((k) => c.effects[k]).map((k) => (
                    <span
                      key={k}
                      className={`px-1.5 py-0.5 rounded-full text-[11px] font-extrabold ${c.effects[k] > 0 ? "bg-emerald-500/25 text-emerald-200" : "bg-rose-500/25 text-rose-200"}`}
                    >
                      {STAT_META[k].icon}
                      {c.effects[k] > 0 ? "▲" : "▼"}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="rover-pop-in font-display text-lg sm:text-xl font-bold text-amber-200">
              {ev.choices[result.choice].icon} {copy.choices[result.choice].result}
            </p>
            <ResourceBars before={result.before} after={result.after} deltas={ev.choices[result.choice].effects} t={t} />
            {copy.fact && (
              <p className="text-left text-xs sm:text-sm text-sky-100 p-3 rounded-2xl bg-sky-500/10 border border-sky-400/40">🧠 {copy.fact}</p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-display font-bold text-lg shadow-lg"
            >
              🚙 {t.blast.backToRover}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
