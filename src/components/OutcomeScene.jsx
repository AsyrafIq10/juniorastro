import React, { useEffect, useState } from "react";
import { GROUND, Rover, Smoke, Sparks, Backdrop, SceneStyles, SceneDefs, loop, anim } from "./SceneArt";
import { STAT_KEYS, STAT_META, WORLD } from "../data/tasks";

// "What happened" — an animation instead of a wall of text:
// the rover reacts (smoke + cracked wheel / sparkle upgrade / happy bounce),
// the checkpoint flag goes up (or a "come back" sign), and every resource bar
// slides from its old value to its new one with a floating +/− number.

function Flag({ up }) {
  return (
    <g transform={`translate(610 ${GROUND})`}>
      <rect x="-3" y="-120" width="6" height="120" fill="#e2e8f0" />
      {up ? (
        <g style={anim("as-flag-up", 1.1, 0.5, "cubic-bezier(.2,.9,.3,1.2)")}>
          <path d="M3 -118 L66 -104 L3 -88 Z" fill="#22c55e" stroke="#fff" strokeWidth="2" />
          <text x="22" y="-97" fontSize="16">✓</text>
        </g>
      ) : (
        <g style={anim("as-pop", 0.5, 0.6)}>
          <rect x="-40" y="-150" width="80" height="34" rx="10" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
          <text x="0" y="-127" textAnchor="middle" fontSize="20">↩️ ⏳</text>
        </g>
      )}
    </g>
  );
}

// Resource bars that slide from old to new values, with +/- bubbles (task outcomes + surprise events)
export function ResourceBars({ before, after, deltas, t }) {
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMoved(true), 700);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {STAT_KEYS.map((k) => {
        const meta = STAT_META[k];
        const from = before[k];
        const to = after[k];
        const delta = deltas[k] || 0;
        const isSci = k === "science";
        const show = moved ? to : from;
        const pct = isSci ? Math.min(100, show) : show;
        return (
          <div key={k} className={`relative px-3 py-2 rounded-2xl bg-slate-800/80 border ${delta ? meta.border : "border-white/10"}`}>
            <div className="flex items-center justify-between text-xs font-bold mb-1 text-slate-200">
              <span>
                {meta.icon} {t.resources[k]}
              </span>
              <span className={`tabular-nums ${meta.text}`}>{isSci ? show : `${show}%`}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-900 overflow-hidden">
              <div className={`h-full rounded-full ${meta.bar} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
            </div>
            {delta !== 0 && moved && (
              <span
                className={`rover-pop-in absolute -top-3 right-2 px-2 py-0.5 rounded-full text-xs font-extrabold shadow ${
                  delta > 0 ? "bg-emerald-400 text-slate-950" : "bg-rose-500 text-white"
                }`}
              >
                {delta > 0 ? `+${delta}` : delta}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OutcomeScene({ outcome, t }) {

  const damaged = outcome.roverEvents.some((e) => e.type === "damage");
  const upgraded = outcome.roverEvents.some((e) => e.type === "upgrade");
  const upgradeLevel = outcome.roverEvents.filter((e) => e.type === "upgrade").map((e) => e.level).pop();
  const totals = { ...outcome.effects, science: (outcome.effects.science || 0) + (outcome.bonus || 0) };
  const b = t.blast;

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden border-2 border-white/15">
        <style>{`@keyframes as-flag-up { from { transform: translateY(90px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
        <svg viewBox="0 0 800 360" className="block w-full h-auto">
          <SceneStyles />
          <SceneDefs />
          <Backdrop env={WORLD === "moon" ? "moonDay" : "day"} />
          <Flag up={outcome.completes} />
          <g style={upgraded ? anim("as-pop", 0.7, 0.4) : undefined}>
            <Rover
              x={330}
              damaged={damaged}
              moving={!damaged}
              scale={upgraded ? 1.15 : 1}
              bodyStyle={
                damaged
                  ? { ...loop("as-wobble", 0.3), transformOrigin: "50% 100%" }
                  : { ...loop("as-bounce", 0.9), transformOrigin: "50% 100%" }
              }
            />
          </g>
          {damaged && (
            <>
              <Smoke x={300} y={GROUND - 70} />
              <text x="388" y={GROUND - 110} fontSize="34" style={anim("as-pop", 0.4, 0.3)}>
                💥
              </text>
            </>
          )}
          {upgraded && (
            <>
              <Sparks x={260} y={GROUND - 100} count={3} />
              <Sparks x={410} y={GROUND - 120} count={3} delay={0.25} />
              <g style={anim("as-pop", 0.5, 0.8)}>
                <rect x="250" y="40" width="160" height="40" rx="14" fill="#22c55e" stroke="#fff" strokeWidth="3" />
                <text x="330" y="67" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff">
                  🚙 {b.level} {upgradeLevel} ✨
                </text>
              </g>
            </>
          )}
          {!damaged && !upgraded && (
            <text x="330" y={GROUND - 150} textAnchor="middle" fontSize="36" style={anim("as-pop", 0.4, 0.4)}>
              {outcome.completes ? "🎉" : "👍"}
            </text>
          )}
          {/* stars from the mini-game */}
          <g transform="translate(36 34)">
            {[0, 1, 2].map((i) => (
              <text key={i} x={i * 34} y="10" fontSize="28" opacity={i < outcome.stars ? 1 : 0.25} style={anim("as-pop", 0.35, 0.2 + i * 0.15)}>
                ⭐
              </text>
            ))}
          </g>
        </svg>
      </div>

      <ResourceBars before={outcome.before} after={outcome.after} deltas={totals} t={t} />
    </div>
  );
}
