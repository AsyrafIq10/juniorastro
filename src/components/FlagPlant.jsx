import React, { useEffect, useRef, useState } from "react";
import { GROUND, Astronaut, Rover, Backdrop, SandSpray, SceneStyles, SceneDefs } from "./SceneArt";
import SpeakButton from "./SpeakButton";
import { useAutoSpeak } from "../utils/speech";
import { spaceAudio } from "../utils/sound";
import { pauseState } from "../utils/pause";

// ===== Jalur Gemilang (Malaysia's flag) =====
// 14 red & white stripes, blue canton with a yellow crescent and 14-point star (1:2 ratio).
const RED = "#cc0001";
const BLUE = "#010066";
const YELLOW = "#ffcc00";

function starPoints(cx, cy, R, r, n = 14) {
  const pts = [];
  for (let k = 0; k < n * 2; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / n;
    const rad = k % 2 === 0 ? R : r;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`);
  }
  return pts.join(" ");
}

// Flag shapes in a 280×140 box (use inside any <svg>)
export function JalurGemilangShapes() {
  return (
    <g>
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x="0" y={i * 10} width="280" height="10" fill={i % 2 === 0 ? RED : "#ffffff"} />
      ))}
      <rect x="0" y="0" width="140" height="80" fill={BLUE} />
      <circle cx="54" cy="40" r="28" fill={YELLOW} />
      <circle cx="63" cy="40" r="24" fill={BLUE} />
      <polygon points={starPoints(102, 40, 24, 10)} fill={YELLOW} />
    </g>
  );
}

export function JalurGemilang({ width = 140, className = "", style }) {
  return (
    <svg viewBox="0 0 280 140" width={width} className={className} style={style} role="img" aria-label="Jalur Gemilang">
      <JalurGemilangShapes />
    </svg>
  );
}

// Same flag drawn on a canvas (used as the 3D flag's texture)
export function drawJalurGemilang(ctx, w, h) {
  const sh = h / 14;
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = i % 2 === 0 ? RED : "#ffffff";
    ctx.fillRect(0, i * sh, w, sh + 1);
  }
  const cw = w / 2;
  const ch = sh * 8;
  ctx.fillStyle = BLUE;
  ctx.fillRect(0, 0, cw, ch);
  const k = ch / 80;
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(54 * k, 40 * k, 28 * k, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = BLUE;
  ctx.beginPath();
  ctx.arc(63 * k, 40 * k, 24 * k, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  for (let i = 0; i < 28; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 14;
    const rad = (i % 2 === 0 ? 24 : 10) * k;
    const x = 102 * k + Math.cos(a) * rad;
    const y = 40 * k + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

// ===== Hold-to-plant screen =====
const PLANT_RATE = 0.34; // ~3 seconds of holding

export default function FlagPlantModal({ t, soundOn, onDone }) {
  const f = t.flag;
  const [stage, setStage] = useState("hold"); // hold | raise | done
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const btnRef = useRef(false);
  const keyRef = useRef(false);
  const progRef = useRef(0);

  useAutoSpeak(`${f.holdTitle} ${f.holdHint}`, stage === "hold");
  useAutoSpeak(`${f.done} ${f.windFact}`, stage === "done");

  // Keyboard: hold SPACE or E
  useEffect(() => {
    const down = (e) => {
      if (e.code === "Space" || e.code === "KeyE") {
        e.preventDefault();
        keyRef.current = true;
      }
    };
    const up = (e) => {
      if (e.code === "Space" || e.code === "KeyE") keyRef.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Pushing the pole into the hard Moon dust
  useEffect(() => {
    if (stage !== "hold") return undefined;
    let raf;
    let last = performance.now();
    let lastThunk = 0;
    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const on = (btnRef.current || keyRef.current) && !pauseState.paused;
      setHolding(on);
      if (on) {
        progRef.current = Math.min(1, progRef.current + PLANT_RATE * dt);
        setProgress(progRef.current);
        if (soundOn && now - lastThunk > 380) {
          lastThunk = now;
          spaceAudio.playThud(0.8);
        }
      }
      if (progRef.current >= 1) {
        if (soundOn) {
          spaceAudio.playBadge();
          setTimeout(() => spaceAudio.playVictory(), 500);
        }
        setStage("raise");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage, soundOn]);

  // Flag rises and unfurls, then the facts
  useEffect(() => {
    if (stage !== "raise") return undefined;
    const id = setTimeout(() => setStage("done"), 3200);
    return () => clearTimeout(id);
  }, [stage]);

  const depth = progress * 46; // how far the pole has gone into the ground
  const raised = stage !== "hold";

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <style>{`
        @keyframes flag-rise { from { transform: translateY(150px); } to { transform: translateY(0); } }
        @keyframes flag-unfurl { 0%, 35% { transform: scaleX(0.08); } 100% { transform: scaleX(1); } }
      `}</style>
      <div className="rover-pop-in w-full max-w-3xl max-h-[96vh] overflow-y-auto bg-slate-900 border-2 border-red-400/60 rounded-3xl p-3 sm:p-5 shadow-2xl">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-extrabold uppercase tracking-wider">🚩 {f.checkpoint}</span>
          <h2 className="font-display text-lg sm:text-2xl font-bold text-white">{f.holdTitle}</h2>
        </div>

        <div className="relative rounded-2xl overflow-hidden border-2 border-white/15">
          <svg viewBox="0 0 800 360" className="block w-full h-auto select-none">
            <SceneStyles />
            <SceneDefs />
            <Backdrop env="moonDay" />
            <Rover x={150} moving={false} />
            {/* pole + flag */}
            <g transform={`translate(470 ${GROUND - 170 + depth})`}>
              <rect x="-4" y="0" width="8" height={190 - depth} fill="#e2e8f0" stroke="#94a3b8" />
              <circle cx="0" cy="-2" r="6" fill="#fde047" />
              {raised && (
                <g style={{ animation: "flag-rise 1.4s cubic-bezier(.2,.9,.3,1) both" }}>
                  {/* the horizontal crossbar holds the flag open: there's no wind on the Moon */}
                  <rect x="0" y="2" width="180" height="5" rx="2" fill="#cbd5e1" />
                  <g style={{ animation: "flag-unfurl 2s ease-out 0.6s both", transformBox: "fill-box", transformOrigin: "0% 50%" }}>
                    <g transform="translate(0 7) scale(0.643)">
                      <JalurGemilangShapes />
                    </g>
                  </g>
                </g>
              )}
            </g>
            {/* astronaut pushing the pole down */}
            <g transform={holding ? "translate(0 4)" : undefined}>
              <Astronaut x={440} arm={raised ? "wave" : "up"} />
            </g>
            {holding && <SandSpray x={470} y={GROUND - 4} up color="#d6d3d1" />}
            {stage === "done" &&
              ["🎉", "⭐", "✨", "🚩", "⭐", "🎊"].map((e, i) => (
                <text key={i} x={300 + i * 70} y={70 + (i % 2) * 30} fontSize="30" style={{ animation: `as-pop .5s ease-out ${i * 0.1}s both`, transformBox: "fill-box", transformOrigin: "50% 50%" }}>
                  {e}
                </text>
              ))}
          </svg>

          {stage === "hold" && (
            <>
              <div className="absolute top-2 inset-x-2 flex items-start justify-between gap-2 pointer-events-none">
                <div className="min-w-[140px]">
                  <div className="flex justify-between text-[11px] font-extrabold uppercase tracking-wider text-white drop-shadow">
                    <span>{f.depth}</span>
                    <span>{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-900/70 border border-white/20 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-300" style={{ width: `${progress * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 right-3">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    try {
                      e.currentTarget.setPointerCapture?.(e.pointerId);
                    } catch {
                      /* pointer already gone */
                    }
                    btnRef.current = true;
                  }}
                  onPointerUp={() => (btnRef.current = false)}
                  onPointerCancel={() => (btnRef.current = false)}
                  onLostPointerCapture={() => (btnRef.current = false)}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ touchAction: "none" }}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full font-display font-bold text-lg border-4 shadow-xl transition-transform ${
                    holding ? "bg-amber-300 border-white text-slate-950 scale-95" : "bg-red-500 border-red-200 text-white animate-pulse"
                  }`}
                >
                  {f.push}
                </button>
              </div>
            </>
          )}

          {stage === "raise" && (
            <button
              type="button"
              onClick={() => setStage("done")}
              className="absolute top-2.5 right-2.5 px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/20 text-xs font-bold text-white"
            >
              {t.blast.skip} ⏭
            </button>
          )}
        </div>

        {stage === "hold" && (
          <p className="mt-3 flex items-center justify-center gap-2 text-center text-sm sm:text-base font-bold text-slate-200">
            <span>✋ {f.holdHint}</span>
            <SpeakButton text={`${f.holdTitle} ${f.holdHint}`} />
          </p>
        )}

        {stage === "done" && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-center gap-3">
              <JalurGemilang width={84} className="rounded shadow-lg" />
              <p className="font-display text-xl sm:text-2xl font-bold text-amber-300">{f.done}</p>
              <SpeakButton text={`${f.done} ${f.windFact}`} />
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/40">
              <div className="text-xs font-extrabold uppercase tracking-wider text-sky-300 mb-1">🧠 {t.blast.capFact}</div>
              <p className="text-sm text-slate-100 leading-relaxed">{f.windFact}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-400">📚 NASA</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-400/40">
              <div className="text-xs font-extrabold uppercase tracking-wider text-red-300 mb-1"><JalurGemilang width={22} className="inline-block align-middle rounded-sm" /> {f.malaysiaTitle}</div>
              <p className="text-sm text-slate-100 leading-relaxed">{f.astronautFact}</p>
            </div>
            <button
              type="button"
              onClick={onDone}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-amber-400 text-white font-display font-bold text-lg shadow-lg"
            >
              🚀 {f.continue}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
