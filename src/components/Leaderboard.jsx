import React, { useEffect, useMemo, useRef, useState } from "react";
import { missionPoints, RIVALS } from "../data/leaderboard";
import CapAvatar from "./CapAvatar";

const ROW = 54; // px per leaderboard row
const MEDALS = ["🥇", "🥈", "🥉"];

// After splashdown: tally the mission points (with ticking sounds), then the
// player's row climbs the leaderboard of other cadets to its final rank.
export default function Leaderboard({ t, stats, badges, stars, roverLevel, name, onNameChange, onContinue, onSfx }) {
  const lb = t.lb;
  const { rows, total } = useMemo(() => missionPoints({ stats, badges, stars, roverLevel }), [stats, badges, stars, roverLevel]);
  const [stage, setStage] = useState("tally"); // tally | board
  const [counts, setCounts] = useState(rows.map(() => 0));
  const [current, setCurrent] = useState(0);
  const [shownTotal, setShownTotal] = useState(0);
  const [climbed, setClimbed] = useState(false);
  const sfx = useRef(onSfx);
  sfx.current = onSfx;

  // Count each row up one after another
  useEffect(() => {
    if (stage !== "tally") return undefined;
    let raf;
    let start = null;
    const idx = current;
    if (idx >= rows.length) {
      // then the big total
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / 1000);
        setShownTotal(Math.round(total * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
        else sfx.current?.("success");
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }
    let lastTick = 0;
    const target = rows[idx].value;
    const tick = (now) => {
      if (start == null) start = now;
      const p = Math.min(1, (now - start) / 650);
      setCounts((c) => c.map((v, i) => (i === idx ? Math.round(target * p) : v)));
      if (target > 0 && now - lastTick > 70 && p < 1) {
        lastTick = now;
        sfx.current?.("tick", idx);
      }
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setCurrent((c) => c + 1), 180);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage, current, rows, total]);

  const board = useMemo(() => {
    const me = { name: name.trim() || lb.you, avatar: "🧑‍🚀", pts: total, badges, me: true };
    return [...RIVALS, me].sort((a, b) => b.pts - a.pts);
  }, [name, total, badges, lb.you]);
  const myRank = board.findIndex((r) => r.me);

  // Start the climb a moment after the board appears
  useEffect(() => {
    if (stage !== "board") return undefined;
    const id1 = setTimeout(() => {
      setClimbed(true);
      sfx.current?.("whoosh");
    }, 500);
    const id2 = setTimeout(() => sfx.current?.(myRank < 3 ? "badge" : "success"), 2200);
    return () => {
      clearTimeout(id1);
      clearTimeout(id2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const tallyDone = current >= rows.length && shownTotal === total;

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="rover-pop-in w-full max-w-xl my-auto bg-slate-900/95 backdrop-blur-md border-2 border-amber-300/60 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <div className="text-center mb-3">
          <div className="text-4xl">🏆</div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-300">{lb.title}</h2>
          <p className="text-xs sm:text-sm font-bold text-slate-400">{lb.subtitle}</p>
        </div>

        {stage === "tally" && (
          <>
            <CapAvatar mood="happy" message={t.victory.capLine} />
            <div className="mt-3 space-y-1.5">
              {rows.map((r, i) => (
                <div
                  key={r.key}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-2xl border transition-all duration-300 ${
                    i < current ? "bg-slate-800 border-white/15" : i === current ? "bg-amber-400/15 border-amber-300/60 scale-[1.02]" : "bg-slate-800/40 border-white/5 opacity-50"
                  }`}
                >
                  <span className="text-sm font-bold text-slate-100">
                    {r.icon} {lb.rows[r.key]}
                  </span>
                  <span className="font-display text-lg font-bold text-white tabular-nums">
                    {counts[i]} <span className="text-xs text-slate-400">{lb.pts}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950">
              <span className="font-display text-lg font-bold">⭐ {lb.total}</span>
              <span className="font-display text-3xl font-bold tabular-nums">
                {shownTotal} <span className="text-sm">{lb.pts}</span>
              </span>
            </div>
            <button
              type="button"
              disabled={!tallyDone}
              onClick={() => {
                sfx.current?.("click");
                setStage("board");
              }}
              className="mt-3 w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 disabled:opacity-40 text-slate-950 font-display font-bold text-lg shadow-lg transition"
            >
              🏆 {lb.seeBoard} →
            </button>
          </>
        )}

        {stage === "board" && (
          <>
            <label className="block mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">✏️ {lb.yourName}</span>
              <input
                value={name}
                onChange={(e) => onNameChange(e.target.value.slice(0, 16))}
                placeholder={lb.namePlaceholder}
                className="mt-1 w-full px-4 py-2.5 rounded-2xl bg-slate-800 border-2 border-cyan-400/50 text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-cyan-300"
              />
            </label>

            <div className="relative overflow-hidden rounded-2xl bg-slate-950/60 border border-white/10" style={{ height: board.length * ROW }}>
              {board.map((r, i) => {
                // The player's row starts at the bottom and climbs; rows it passes slide down
                const from = r.me ? (board.length - 1 - i) * ROW : i > myRank ? -ROW : 0;
                return (
                  <div
                    key={r.me ? "me" : r.name}
                    className={`absolute inset-x-0 flex items-center gap-3 px-3 ${r.me ? "z-10" : ""}`}
                    style={{
                      top: i * ROW,
                      height: ROW,
                      transform: `translateY(${climbed ? 0 : from}px)`,
                      transition: "transform 1.6s cubic-bezier(.2,.8,.2,1)",
                    }}
                  >
                    <div
                      className={`flex-1 flex items-center gap-3 h-[46px] px-3 rounded-xl border-2 ${
                        r.me ? "bg-gradient-to-r from-amber-300 to-orange-400 border-white text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.6)]" : "bg-slate-800/90 border-white/10 text-slate-100"
                      }`}
                    >
                      <span className="w-8 text-center font-display font-bold text-lg">{i < 3 ? MEDALS[i] : `#${i + 1}`}</span>
                      <span className="text-2xl">{r.avatar}</span>
                      <span className="flex-1 font-bold truncate">
                        {r.name} {r.me && <span className="text-xs font-extrabold">({lb.you})</span>}
                      </span>
                      <span className="hidden sm:inline text-xs font-bold opacity-80">🏅 {r.badges}</span>
                      <span className="font-display font-bold tabular-nums">
                        {r.pts} <span className="text-[10px]">{lb.pts}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {climbed && (
              <div className="rover-pop-in mt-3 text-center" style={{ animationDelay: "1.5s" }}>
                <p className="font-display text-xl font-bold text-white">
                  {lb.rankLine.replace("{r}", myRank + 1).replace("{n}", board.length)}
                </p>
                {myRank < 3 && <p className="text-sm font-bold text-amber-300">🎉 {lb.top3}</p>}
                {myRank >= 3 && <p className="text-sm font-bold text-cyan-200">💪 {lb.tryAgainHint}</p>}
              </div>
            )}

            <button
              type="button"
              onClick={onContinue}
              className="mt-3 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-display font-bold text-lg shadow-lg"
            >
              📜 {lb.certBtn} →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
