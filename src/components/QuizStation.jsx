import React, { useState } from "react";
import { TASKS } from "../data/tasks";
import SpeakButton from "./SpeakButton";
import { useAutoSpeak } from "../utils/speech";

// Checkpoint quiz: one picture-style question per finished task. Correct answer = badge.
// Wrong answers just show a hint and let the kid try again.
export default function QuizStation({ t, taskIndex, onCorrect, onClose, onSfx }) {
  const b = t.blast;
  const task = TASKS[taskIndex];
  const quiz = t.tasks[taskIndex].quiz;
  const [wrong, setWrong] = useState([]);
  const [won, setWon] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const readOut = `${quiz.q} ${quiz.options.map((o, i) => `${i + 1}. ${o}.`).join(" ")}`;
  useAutoSpeak(readOut);

  const pick = (i) => {
    if (won || wrong.includes(i)) return;
    if (i === task.quiz.correct) {
      setWon(true);
      onSfx?.("badge");
      onCorrect(taskIndex);
    } else {
      setWrong((w) => [...w, i]);
      setShakeKey((k) => k + 1);
      onSfx?.("wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="rover-pop-in w-full max-w-xl max-h-[94vh] overflow-y-auto bg-slate-900 border-2 border-violet-400/60 rounded-3xl p-4 sm:p-6 shadow-2xl text-center">
        <div className="text-xs font-extrabold uppercase tracking-wider text-violet-300 mb-2">🏅 {b.quizTitle}</div>

        {/* The badge waiting to be won */}
        <div className="flex justify-center mb-3">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl border-4 transition-all duration-500 ${
              won ? "bg-amber-300 border-white shadow-[0_0_40px_rgba(252,211,77,0.9)] scale-110" : "bg-slate-800 border-slate-600 grayscale opacity-60"
            }`}
          >
            {task.badge}
          </div>
        </div>
        <div className={`font-display text-lg font-bold mb-3 ${won ? "text-amber-300" : "text-slate-400"}`}>{quiz.badge}</div>

        {!won ? (
          <>
            <h2 className="flex items-center justify-center gap-2 font-display text-xl sm:text-2xl font-bold text-white mb-4">
              <span>{quiz.q}</span>
              <SpeakButton text={readOut} />
            </h2>
            <div key={shakeKey} className={`grid gap-2.5 ${shakeKey ? "quiz-shake" : ""}`}>
              {quiz.options.map((opt, i) => {
                const isWrong = wrong.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pick(i)}
                    disabled={isWrong}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition active:scale-[0.98] ${
                      isWrong ? "bg-rose-500/10 border-rose-400/40 opacity-50" : "bg-slate-800 hover:bg-slate-700 border-violet-400/40 hover:border-violet-300"
                    }`}
                  >
                    <span className="text-3xl">{isWrong ? "❌" : task.quiz.emojis[i]}</span>
                    <span className="font-bold text-sm sm:text-base text-white">{opt}</span>
                  </button>
                );
              })}
            </div>
            {wrong.length > 0 && (
              <p className="mt-3 text-sm font-bold text-amber-200">
                🤔 {b.tryAgain} {quiz.hint}
              </p>
            )}
            <button type="button" onClick={onClose} className="mt-4 w-full py-3 rounded-2xl bg-slate-800 border-2 border-white/15 text-sm font-bold text-slate-200 hover:bg-slate-700">
              {b.backToRover}
            </button>
          </>
        ) : (
          <>
            <p className="font-display text-2xl font-bold text-emerald-300 mb-1">🎉 {b.correct}</p>
            <p className="text-sm font-bold text-white mb-3">{b.badgeEarned}</p>
            <div className="text-left p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/40 mb-4">
              <div className="text-xs font-extrabold uppercase tracking-wider text-sky-300 mb-1">🧠 {b.capFact}</div>
              <p className="text-sm text-slate-100 leading-relaxed">{t.tasks[taskIndex].learning}</p>
              {t.tasks[taskIndex].source && <p className="mt-1 text-[11px] font-bold text-slate-400">📚 {t.tasks[taskIndex].source}</p>}
            </div>
            <div className="pointer-events-none relative h-0">
              {["🎊", "⭐", "✨", "🎉", "⭐", "✨"].map((e, i) => (
                <span key={i} className="absolute text-2xl confetti-pop" style={{ left: `${10 + i * 16}%`, top: "-150px", animationDelay: `${i * 0.08}s` }}>
                  {e}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-display font-bold text-lg shadow-lg"
            >
              🚙 {b.backToRover}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
