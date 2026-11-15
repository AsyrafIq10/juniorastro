import React, { useState } from "react";
import PlayStage from "./PlayStage";
import ProblemScene from "./ProblemScene";
import OutcomeScene from "./OutcomeScene";
import { GamePreview } from "./MiniGames";
import { STAT_KEYS, STAT_META, TASKS } from "../data/tasks";
import { PLAY_CONFIGS } from "../data/playConfigs";
import SpeakButton from "./SpeakButton";
import { speak, useAutoSpeak } from "../utils/speech";

const CARD_STYLES = [
  { idle: "border-cyan-400/40", on: "border-cyan-300 bg-cyan-500/20 ring-4 ring-cyan-300/30" },
  { idle: "border-amber-400/40", on: "border-amber-300 bg-amber-500/20 ring-4 ring-amber-300/30" },
  { idle: "border-fuchsia-400/40", on: "border-fuchsia-300 bg-fuchsia-500/20 ring-4 ring-fuchsia-300/30" },
];

// Tiny "what goes up / down" icons for a choice card
function MiniEffects({ effects }) {
  return (
    <div className="flex flex-wrap justify-center gap-1 mt-1.5">
      {STAT_KEYS.filter((k) => effects[k]).map((k) => (
        <span
          key={k}
          className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${
            effects[k] > 0 ? "bg-emerald-500/25 text-emerald-200" : "bg-rose-500/25 text-rose-200"
          }`}
        >
          {STAT_META[k].icon}
          {effects[k] > 0 ? "▲" : "▼"}
        </span>
      ))}
    </div>
  );
}

export default function ScenarioModal({ t, taskIndex, revisit, soundOn, badgeEarned, onChoose, onFinish, onSfx, onCancel }) {
  const b = t.blast;
  const copy = t.tasks[taskIndex];
  const task = TASKS[taskIndex];
  const [stage, setStage] = useState("problem"); // problem | play | result
  const [selected, setSelected] = useState(revisit ? "revisit" : null);
  const [found, setFound] = useState([]);
  const [outcome, setOutcome] = useState(null);

  const playId = selected === "revisit" ? task.revisit.play : selected != null ? task.choices[selected].play : null;
  const choiceCopy = typeof selected === "number" ? copy.choices[selected] : null;
  const goal = selected === "revisit" ? copy.revisit.play : choiceCopy?.play;
  const envLabel = !revisit && b.env[task.env];

  const mainLine =
    selected === "revisit" ? `${copy.revisit.title} ${copy.revisit.text}` : choiceCopy ? choiceCopy.label : copy.problemShort;
  useAutoSpeak(mainLine, stage === "problem");
  useAutoSpeak(outcome ? (choiceCopy ? choiceCopy.resultShort : copy.revisit.title) : null, stage === "result");

  const finishPlay = (stars) => {
    setOutcome(onChoose(selected, stars));
    setStage("result");
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="rover-pop-in w-full max-w-3xl max-h-[96vh] overflow-y-auto bg-slate-900 border-2 border-orange-400/50 rounded-3xl p-3 sm:p-5 shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider">
            🏁 {b.taskLabel} {taskIndex + 1}/{TASKS.length}
          </span>
          {envLabel && <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-extrabold">{envLabel}</span>}
          <h2 className="font-display text-lg sm:text-2xl font-bold text-white">{copy.short || copy.title}</h2>
          {/* Leave without finishing: nothing changes, the task waits for you */}
          {stage !== "result" && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/20 text-slate-100 text-xs sm:text-sm font-extrabold transition"
            >
              ✖ {b.cancelTask || "Cancel task"}
            </button>
          )}
        </div>

        {stage === "problem" && (
          <>
            {/* Big visual: the problem scene, or a live preview of the chosen action */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-white/15 bg-slate-950">
              {selected == null ? (
                <ProblemScene index={taskIndex} labels={copy.spots} found={found} onFind={(i) => {
                    if (!found.includes(i)) onSfx?.("ding");
                    speak(copy.spots[i]);
                    setFound((f) => (f.includes(i) ? f : [...f, i]));
                  }} />
              ) : (
                <GamePreview key={playId} cfg={PLAY_CONFIGS[playId]} />
              )}
              <div className="absolute top-2 left-2 right-2 flex justify-between gap-2 pointer-events-none">
                {selected == null ? (
                  <>
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-[11px] sm:text-xs font-extrabold text-amber-200">👆 {b.tapSpots}</span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-[11px] sm:text-xs font-extrabold text-emerald-200">
                      {b.found} {found.length}/{task.hotspots.length}
                    </span>
                  </>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-[11px] sm:text-xs font-extrabold text-cyan-200">👀 {b.previewHint}</span>
                )}
              </div>
              {selected != null && (
                <button
                  type="button"
                  onClick={() => setStage("play")}
                  className="rover-pop-in absolute bottom-3 right-3 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 font-display font-bold text-xl sm:text-2xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] border-2 border-white/70 hover:-translate-y-0.5 transition animate-pulse"
                >
                  ▶ {b.doIt}
                </button>
              )}
            </div>

            {/* One short line */}
            <p className="flex items-center justify-center gap-2 text-center font-display text-base sm:text-xl font-bold text-white my-2.5 px-2">
              <span>
                {selected === "revisit" ? `🌤️ ${copy.revisit.title}` : choiceCopy ? `${task.choices[selected].icon} ${choiceCopy.label}` : `🚨 ${copy.problemShort}`}
              </span>
              <SpeakButton text={mainLine} />
            </p>

            {selected !== "revisit" && (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="font-display text-sm sm:text-base font-bold text-amber-300">❓ {b.chooseOne}</span>
                  <span className="text-[11px] font-bold text-slate-400">({b.noPerfectShort})</span>
                </div>
                <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${copy.choices.length}, minmax(0, 1fr))` }}>
                  {copy.choices.map((c, i) => {
                    const on = selected === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          onSfx?.("pop");
                          setSelected(i);
                        }}
                        className={`flex flex-col items-center justify-start p-2 sm:p-3 rounded-2xl border-2 bg-slate-800/80 hover:bg-slate-700/80 transition active:scale-95 ${
                          on ? CARD_STYLES[i].on : CARD_STYLES[i].idle
                        }`}
                      >
                        <span className={`text-3xl sm:text-4xl ${on ? "animate-bounce" : ""}`}>{task.choices[i].icon}</span>
                        <span className="mt-1 font-bold text-xs sm:text-sm text-white leading-tight text-center">{c.short}</span>
                        <MiniEffects effects={task.choices[i].effects} />
                      </button>
                    );
                  })}
                </div>
              </>
            )}

          </>
        )}

        {stage === "play" && <PlayStage preset={playId} goal={goal} p={t.play} soundOn={soundOn} onDone={finishPlay} />}

        {stage === "result" && outcome && (
          <div className="space-y-3">
            <div className="text-center text-xs font-extrabold uppercase tracking-wider text-amber-300">✨ {b.whatHappened}</div>
            <OutcomeScene outcome={outcome} t={t} />
            <p className="flex items-center justify-center gap-2 text-center font-display text-lg sm:text-xl font-bold text-white px-2">
              <span>{choiceCopy ? choiceCopy.resultShort : copy.revisit.title}</span>
              <SpeakButton text={choiceCopy ? choiceCopy.resultShort : copy.revisit.title} />
            </p>
            {outcome.roverEvents.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {outcome.roverEvents.map((ev, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold ${
                      ev.type === "damage" ? "bg-rose-500/25 text-rose-200" : ev.type === "upgrade" ? "bg-emerald-500/25 text-emerald-200" : "bg-amber-500/25 text-amber-200"
                    }`}
                  >
                    {ev.type === "damage" && `🚙💥 ${b.roverDamaged}`}
                    {ev.type === "upgrade" && `🚙✨ ${b.upgradeNames[ev.level - 1]}`}
                    {ev.type === "waiting" && `🔧 ${b.upgradeWaiting}`}
                    {ev.type === "max" && `🏆 ${b.upgradeMax}`}
                  </span>
                ))}
              </div>
            )}

            {/* The reading is optional now */}
            <details className="rounded-2xl bg-sky-500/10 border border-sky-400/40 px-3.5 py-2">
              <summary className="cursor-pointer text-sm font-extrabold text-sky-300">🧠 {b.learnMore}</summary>
              <p className="mt-1.5 text-sm text-slate-100 leading-relaxed">{copy.learning}</p>
            </details>
            {choiceCopy && (
              <details className="rounded-2xl bg-violet-500/10 border border-violet-400/40 px-3.5 py-2">
                <summary className="cursor-pointer text-sm font-extrabold text-violet-300">🔮 {b.whatNext}</summary>
                <p className="mt-1.5 text-sm text-slate-100 leading-relaxed">{choiceCopy.future}</p>
              </details>
            )}

            {outcome.lostKey ? (
              <button type="button" onClick={() => onFinish({})} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-display font-bold text-lg shadow-lg">
                {b.continue} →
              </button>
            ) : outcome.completes && !badgeEarned ? (
              <div className="grid sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onFinish({ quiz: true })}
                  className="py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-display font-bold text-lg shadow-lg hover:-translate-y-0.5 transition"
                >
                  🏅 {b.quizBtn} {task.badge}
                </button>
                <button
                  type="button"
                  onClick={() => onFinish({})}
                  className="py-3.5 rounded-2xl bg-slate-800 border-2 border-cyan-400/50 text-cyan-100 font-display font-bold text-lg hover:bg-slate-700 transition"
                >
                  🚙 {b.backToRover}
                </button>
                <p className="sm:col-span-2 text-center text-[11px] font-bold text-slate-400">{b.quizLater}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onFinish({})}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-display font-bold text-lg shadow-lg"
              >
                🚙 {b.backToRover}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
