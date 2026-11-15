import React, { useEffect, useState } from "react";
import ProblemScene from "./ProblemScene";
import SpeakButton from "./SpeakButton";
import { useAutoSpeak } from "../utils/speech";
import { TASKS, WORLD } from "../data/tasks";
import { FACT_TEXT, FACT_IMAGES } from "../data/factText";
import solarImg from "../assets/moon-base-solar.jpg";
import hydroImg from "../assets/hydroponic-dome.jpg";

// Picture for the fact card: a real photo for the solar field and hydroponic farm, otherwise the task's scene
function FactImage({ kind, index }) {
  if (kind === "solar")
    // crop the Moon base picture down to the solar panel field (bottom-left of the photo)
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border-2 border-white/15 bg-slate-950" style={{ aspectRatio: "16 / 8" }}>
        <img src={solarImg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "20% 100%", transform: "scale(1.75)", transformOrigin: "30% 100%" }} draggable={false} />
      </div>
    );
  if (kind === "hydroponic")
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border-2 border-white/15 bg-slate-950" style={{ aspectRatio: "16 / 8" }}>
        <img src={hydroImg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "50% 60%" }} draggable={false} />
      </div>
    );
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-white/15 bg-slate-950">
      <ProblemScene index={index} thumb />
    </div>
  );
}

export default function TaskActionMenu({ t, lang, taskIndex, onDoTask, onQuit, onSfx }) {
  const [view, setView] = useState("menu"); // menu | fact
  const ui = (FACT_TEXT[lang] || FACT_TEXT.en).ui;
  const fact = ((FACT_TEXT[lang] || FACT_TEXT.en)[WORLD] || [])[taskIndex];
  const imgKind = (FACT_IMAGES[WORLD] || [])[taskIndex];
  const task = TASKS[taskIndex];
  useAutoSpeak(fact ? `${fact.title}. ${fact.text}` : null, view === "fact");

  // Keyboard: 1 = do task, 2 = fact, 3 = quit (Esc = quit / back)
  useEffect(() => {
    const onKey = (e) => {
      if (view === "menu") {
        if (e.key === "1") onDoTask();
        else if (e.key === "2") {
          onSfx("pop");
          setView("fact");
        } else if (e.key === "3" || e.key === "Escape") onQuit();
      } else if (e.key === "Escape" || e.key === "Backspace") setView("menu");
      else if (e.key === "1" || e.key === "Enter") onDoTask();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, onDoTask, onQuit, onSfx]);

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-3 bg-slate-950/65 backdrop-blur-sm">
      <div className="rover-pop-in w-full max-w-xl max-h-[94vh] overflow-y-auto bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">{task.badge}</span>
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
              🏁 {t.blast.taskLabel} {taskIndex + 1}/{TASKS.length}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight">{t.tasks[taskIndex].short}</h2>
          </div>
        </div>

        {view === "menu" ? (
          <>
            <div className="grid gap-2.5">
              <button
                type="button"
                onClick={onDoTask}
                className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 font-display font-bold text-xl shadow-lg hover:-translate-y-0.5 transition"
              >
                <kbd className="w-8 h-8 rounded-lg bg-slate-950/80 text-white text-sm flex items-center justify-center">1</kbd>▶ {ui.doTask}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSfx("pop");
                  setView("fact");
                }}
                className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-display font-bold text-xl shadow-lg hover:-translate-y-0.5 transition"
              >
                <kbd className="w-8 h-8 rounded-lg bg-slate-950/80 text-white text-sm flex items-center justify-center">2</kbd>💡 {ui.fact}
              </button>
              <button
                type="button"
                onClick={onQuit}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-800 border-2 border-white/15 text-slate-100 font-display font-bold text-lg hover:bg-slate-700 transition"
              >
                <kbd className="w-8 h-8 rounded-lg bg-slate-950/80 text-white text-sm flex items-center justify-center">3</kbd>✖ {ui.quit}
              </button>
            </div>
            <p className="hidden sm:block mt-3 text-center text-xs font-bold text-slate-400">{ui.keys}</p>
          </>
        ) : (
          <>
            <FactImage kind={imgKind} index={taskIndex} />
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-800/80 border border-cyan-400/30">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">💡 {ui.factTitle}</div>
                  <h3 className="font-display text-lg font-bold text-white">{fact?.title}</h3>
                </div>
                {fact && <SpeakButton text={`${fact.title}. ${fact.text}`} />}
              </div>
              <p className="mt-1.5 text-sm sm:text-base font-semibold text-slate-200 leading-relaxed">{fact?.text}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setView("menu")} className="py-3 rounded-2xl bg-slate-800 border-2 border-white/15 text-slate-100 font-display font-bold">
                ← {ui.back}
              </button>
              <button type="button" onClick={onDoTask} className="py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 font-display font-bold">
                ▶ {ui.doTask}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
