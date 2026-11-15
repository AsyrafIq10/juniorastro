import React from "react";
import ProblemScene from "./ProblemScene";
import { TASKS } from "../data/tasks";
import { JalurGemilang } from "./FlagPlant";
import { SECRET_TEXT } from "../data/secretText";
import { MEGA_TEXT } from "../data/megaText";

// 📔 Scrapbook of sticker cards: one per task attempt (picture, choice, stars, result, badge)
export default function MissionLog({ t, lang = "en", log, badges, onClose }) {
  const b = t.blast;
  return (
    <div className="fixed inset-0 z-[45] flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="rover-pop-in w-full max-w-3xl max-h-[94vh] overflow-y-auto rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-amber-200/80 bg-[#fdf6e3] text-slate-800">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-700">📔 {b.logTitle}</h2>
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              {log.length} {b.logStickers}
            </p>
          </div>
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700">
            ✕ {t.close}
          </button>
        </div>

        {log.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-6xl mb-2">🗒️</div>
            <p className="font-display text-lg font-bold text-slate-600">{b.logEmpty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-2">
            {log.map((entry, i) => {
              // Secret "?" badge and MEGA badge stickers (only appear once they're earned)
              if (entry.type === "secret" || entry.type === "mega") {
                const mega = entry.type === "mega";
                const st = (mega ? MEGA_TEXT : SECRET_TEXT)[lang] || (mega ? MEGA_TEXT : SECRET_TEXT).en;
                return (
                  <div
                    key={i}
                    className={`relative rover-pop-in bg-white rounded-2xl p-2.5 pb-3 shadow-[0_6px_18px_rgba(0,0,0,0.18)] border-2 ${mega ? "border-amber-400" : "border-violet-400"} -rotate-1`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-200/80 rotate-2 rounded-sm" />
                    <div
                      className="rounded-xl overflow-hidden flex items-center justify-center py-6 relative"
                      style={{ background: mega ? "radial-gradient(circle, #7f1d1d, #1c1917 70%)" : "radial-gradient(circle, #4c1d95, #0f172a 70%)" }}
                    >
                      <div className={`w-24 h-24 rounded-full p-1 shadow-xl ${mega ? "bg-gradient-to-br from-amber-300 via-red-500 to-fuchsia-600" : "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400"}`}>
                        <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                          {mega ? (
                            <>
                              <span className="text-3xl">🏆</span>
                              <span className="font-display text-sm font-bold text-amber-200">MEGA</span>
                            </>
                          ) : (
                            <span className="font-display text-5xl font-bold text-white">?</span>
                          )}
                        </div>
                      </div>
                      <span className="absolute top-2 right-3 text-2xl">{mega ? "🤖" : "👽"}</span>
                      <span className="absolute bottom-2 left-3 text-xl">🌀</span>
                    </div>
                    <div className={`mt-2 text-[11px] font-extrabold uppercase tracking-wider ${mega ? "text-amber-600" : "text-violet-600"}`}>✨ {st.logTag}</div>
                    <div className="font-display text-base font-bold text-slate-800">{st.logTitle}</div>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{st.logText}</p>
                  </div>
                );
              }
              if (entry.type === "flag") {
                return (
                  <div key={i} className="relative rover-pop-in bg-white rounded-2xl p-2.5 pb-3 shadow-[0_6px_18px_rgba(0,0,0,0.18)] border-2 border-red-300 rotate-1" style={{ animationDelay: `${i * 0.06}s` }}>
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-200/80 -rotate-2 rounded-sm" />
                    <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center py-5 relative">
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-zinc-500" />
                      <div className="relative flex items-end">
                        <div className="w-1.5 h-28 bg-slate-200 rounded-full" />
                        <JalurGemilang width={130} className="mb-[47px] shadow-lg" />
                      </div>
                      <span className="absolute top-2 right-3 text-2xl">🌍</span>
                    </div>
                    <div className="mt-2 text-[11px] font-extrabold uppercase tracking-wider text-red-600"><JalurGemilang width={22} className="inline-block align-middle rounded-sm" /> {t.flag.stickerTag}</div>
                    <div className="font-display text-base font-bold text-slate-800">{t.flag.sticker}</div>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{t.flag.done}</p>
                  </div>
                );
              }
              const task = TASKS[entry.taskIndex];
              const copy = t.tasks[entry.taskIndex];
              const choice = entry.choice === "revisit" ? null : task.choices[entry.choice];
              const choiceCopy = entry.choice === "revisit" ? null : copy.choices[entry.choice];
              const tilt = i % 2 === 0 ? "-rotate-1" : "rotate-1";
              return (
                <div key={i} className={`relative rover-pop-in bg-white rounded-2xl p-2.5 pb-3 shadow-[0_6px_18px_rgba(0,0,0,0.18)] border border-slate-200 ${tilt}`} style={{ animationDelay: `${i * 0.06}s` }}>
                  {/* tape */}
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-200/80 rotate-2 rounded-sm" />
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <ProblemScene index={entry.taskIndex} thumb />
                  </div>
                  <div className="mt-2 flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
                        {b.taskLabel} {entry.taskIndex + 1} · {copy.short}
                      </div>
                      <div className="font-display text-base font-bold text-slate-800">
                        {choice ? `${choice.icon} ${choiceCopy.short}` : `🧪 ${copy.revisit.title}`}
                      </div>
                    </div>
                    <div className="shrink-0 text-lg leading-none">
                      {"⭐".repeat(entry.stars)}
                      <span className="opacity-25">{"⭐".repeat(3 - entry.stars)}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{choiceCopy ? choiceCopy.resultShort : copy.revisit.text}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {entry.roverEvents.includes("damage") && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-extrabold">🚙💥 {b.damaged}</span>}
                    {entry.roverEvents.includes("upgrade") && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-extrabold">🚙✨ {b.roverUpgraded}</span>}
                    {!entry.completes && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-extrabold">↩️ {b.checkpointNotDone}</span>}
                    {entry.completes && badges.includes(entry.taskIndex) && (
                      <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[11px] font-extrabold">
                        {task.badge} {copy.quiz.badge}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
