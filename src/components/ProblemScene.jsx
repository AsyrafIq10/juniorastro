import React from "react";
import {
  GROUND,
  Astronaut,
  Rover,
  Drone,
  Hill,
  Meteorite,
  SharpRocks,
  DustDevil,
  Smoke,
  Backdrop,
  SceneStyles,
  SceneDefs,
  loop,
} from "./SceneArt";
import { TASKS } from "../data/tasks";

// Animated "what's the problem?" scene for each task, with glowing spots to tap.

function Battery({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-20" y="-10" width="40" height="20" rx="4" fill="#0f172a" stroke="#f8fafc" strokeWidth="2.5" />
      <rect x="20" y="-4" width="4" height="8" fill="#f8fafc" />
      <rect x="-16" y="-6" width="14" height="12" rx="2" fill="#f59e0b" style={loop("as-twinkle", 0.8)} />
    </g>
  );
}

function Thermometer({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-6" y="-30" width="12" height="44" rx="6" fill="#f8fafc" />
      <circle cy="18" r="10" fill="#38bdf8" />
      <rect x="-3" y="-4" width="6" height="22" fill="#38bdf8" />
    </g>
  );
}

function SceneBody({ scene }) {
  switch (scene) {
    case "drone": // Crashed drone
      return (
        <>
          <Backdrop env="day" />
          <Rover x={160} moving={false} />
          <g transform="rotate(14 500 280)">
            <Drone x={500} y={GROUND - 2} broken />
          </g>
          <rect x="560" y={GROUND - 6} width="30" height="4" rx="2" fill="#1e293b" transform={`rotate(-20 575 ${GROUND - 4})`} />
          <Smoke x={505} y={GROUND - 30} />
        </>
      );
    case "meteorite": // Meteorite on a steep hill, low battery
      return (
        <>
          <Backdrop env="day" />
          <Hill x={380} w={390} h={135} />
          <Meteorite x={614} y={GROUND - 140} />
          <circle cx="614" cy={GROUND - 152} r="26" fill="#fde047" opacity=".25" style={loop("as-glow", 1.2)} />
          <Rover x={200} moving={false} />
          <Battery x={200} y={130} />
        </>
      );
    case "delta": // Cracked wheel + storm rolling in
      return (
        <>
          <Backdrop env="storm" />
          <g style={loop("as-devil-sway", 3)}>
            <rect x="600" y="0" width="300" height="360" fill="#78350f" opacity=".7" />
            <circle cx="640" cy="120" r="60" fill="#92400e" opacity=".6" />
            <circle cx="700" cy="220" r="80" fill="#92400e" opacity=".5" />
          </g>
          <SharpRocks x={410} />
          <Rover x={230} damaged moving={false} bodyStyle={{ ...loop("as-wobble", 0.4), transformOrigin: "50% 100%" }} />
          <Astronaut x={120} arm="point" />
        </>
      );
    case "ice": // Ice under the ground, night falling
      return (
        <>
          <Backdrop env="night" />
          <circle cx="700" cy="250" r="34" fill="#f97316" opacity=".85" />
          <rect x="0" y={GROUND} width="800" height="70" fill="#3b1d12" />
          <rect x="430" y={GROUND + 10} width="180" height="50" rx="10" fill="#1c0f0a" stroke="#7c2d12" strokeDasharray="5 4" />
          {[[480, 336], [515, 330], [550, 338]].map(([x, y], i) => (
            <path key={i} d={`M${x - 10} ${y + 12} L${x} ${y - 10} L${x + 10} ${y + 12} Z`} fill="#bae6fd" style={loop("as-twinkle", 1, i * 0.3)} />
          ))}
          <Rover x={210} moving={false} glow />
          {[0, 0.5, 1].map((d) => (
            <circle key={d} cx="290" cy={GROUND} r="30" fill="none" stroke="#67e8f9" strokeWidth="2" style={loop("as-smoke", 1.5, d, "ease-out")} />
          ))}
          <Thermometer x={110} y={110} />
        </>
      );
    // ================= Moon =================
    case "moonIce": // Ice glowing in a pitch-black crater, the drill waiting
      return (
        <>
          <Backdrop env="moonDark" />
          <path d={`M420 ${GROUND} Q560 ${GROUND - 120} 760 ${GROUND - 20} L760 ${GROUND} Z`} fill="#18181b" />
          <rect x="430" y={GROUND - 2} width="300" height="70" fill="#09090b" />
          {[[520, 318], [560, 328], [610, 314], [660, 326]].map(([x, y], i) => (
            <path key={i} d={`M${x - 12} ${y + 12} L${x} ${y - 12} L${x + 12} ${y + 12} Z`} fill="#bae6fd" style={loop("as-twinkle", 1, i * 0.3)} />
          ))}
          <g transform="translate(500 95)">
            <circle r="16" fill="#fde047" opacity=".9" />
            <path d="M-40 60 L40 -10" stroke="#fde047" strokeWidth="3" strokeDasharray="6 6" opacity=".5" />
            <text x="10" y="70" fontSize="22">🚫</text>
          </g>
          <Rover x={180} moving={false} glow />
          <g transform="translate(250 140)">
            <rect x="-12" y="-30" width="24" height="60" rx="6" fill="#f59e0b" />
            <rect x="-4" y="30" width="8" height="40" fill="#94a3b8" />
            <text x="18" y="-10" fontSize="20" style={loop("as-twinkle", 0.6)}>🔋</text>
          </g>
        </>
      );
    case "recycler": // Water recycler machine full of used water
      return (
        <>
          <Backdrop env="moonDay" />
          <g transform={`translate(430 ${GROUND})`}>
            <rect x="-90" y="-210" width="180" height="210" rx="18" fill="#e2e8f0" stroke="#64748b" strokeWidth="4" />
            <rect x="-70" y="-185" width="140" height="130" rx="10" fill="#0f172a" />
            <rect x="-70" y="-120" width="140" height="65" rx="8" fill="#7c9cb5" opacity=".85" style={loop("as-glow", 1.4)} />
            <text x="0" y="-25" textAnchor="middle" fontSize="22">♻️</text>
          </g>
          {[["🧼", 560, 200], ["💦", 610, 240], ["😮‍💨", 650, 190]].map(([e, x, y], i) => (
            <text key={i} x={x} y={y} fontSize="30" style={loop("as-devil-sway", 2 + i * 0.4)}>{e}</text>
          ))}
          <Astronaut x={180} arm="point" />
        </>
      );
    case "donki": // DONKI antenna catching the solar storm warning
      return (
        <>
          <Backdrop env="moonStorm" />
          <g transform="translate(330 0)">
            <rect x="-6" y="170" width="12" height="120" fill="#94a3b8" />
            <path d="M-70 120 Q0 230 70 120 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3" transform="rotate(-25 0 160)" />
            {[0, 0.5, 1].map((d) => (
              <circle key={d} cx="-40" cy="110" r="20" fill="none" stroke="#f87171" strokeWidth="3" style={loop("as-smoke", 1.4, d, "ease-out")} />
            ))}
          </g>
          <g transform={`translate(600 ${GROUND})`}>
            <path d="M-90 0 Q0 -120 90 0 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="4" />
            <rect x="-14" y="-30" width="28" height="30" rx="6" fill="#ea580c" />
          </g>
          <Astronaut x={460} arm="point" />
        </>
      );
    case "moonDust": // Solar panels covered in sticky grey dust
      return (
        <>
          <Backdrop env="moonDay" />
          <g transform="translate(140 100)">
            <circle r="14" fill="#fbbf24" />
            <circle r="34" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 8" opacity=".6" style={loop("as-spin", 4, 0, "linear")} />
          </g>
          {[300, 470, 640].map((x) => (
            <g key={x}>
              <rect x={x - 70} y="150" width="140" height="80" rx="6" fill="#1d4ed8" stroke="#cbd5e1" strokeWidth="4" transform={`skewX(-10)`} />
              <rect x={x - 70} y="150" width="140" height="80" rx="6" fill="#a8a29e" opacity=".85" transform={`skewX(-10)`} />
              <rect x={x - 6} y="230" width="12" height="60" fill="#94a3b8" />
            </g>
          ))}
          <g transform={`translate(260 ${GROUND - 20})`}>
            <circle r="20" fill="#78716c" opacity=".7" style={loop("as-smoke", 1.6, 0, "ease-out")} />
          </g>
        </>
      );
    case "moonNight": // Freezing night, the relief ship on its way
      return (
        <>
          <Backdrop env="moonNight" />
          <g transform="translate(640 0)">
            <g style={loop("as-devil-sway", 4)}>
              <path d="M-12 70 L0 40 L12 70 L12 120 L-12 120 Z" fill="#f8fafc" />
              <path d="M-12 120 L0 150 L12 120 Z" fill="#fb923c" style={loop("as-glow", 0.4)} />
            </g>
          </g>
          <Thermometer x={120} y={120} />
          <g transform={`translate(330 ${GROUND})`}>
            <path d="M-120 0 Q0 -150 120 0 Z" fill="#334155" stroke="#64748b" strokeWidth="4" />
            <rect x="-40" y="-60" width="80" height="34" rx="8" fill="#f97316" opacity=".8" style={loop("as-glow", 1)} />
          </g>
          <Astronaut x={520} arm="cross" shiver />
        </>
      );
    case "devil": // Dust devil on the road to the rocket
    default:
      return (
        <>
          <Backdrop env="dustDevil" />
          <rect y={GROUND - 4} width="800" height="10" fill="#92400e" opacity=".5" />
          <g transform={`translate(690 ${GROUND})`}>
            <rect x="-10" y="-90" width="20" height="70" rx="6" fill="#f8fafc" />
            <path d="M-10 -90 L0 -112 L10 -90 Z" fill="#ea580c" />
            <rect x="-26" y="-20" width="52" height="20" rx="4" fill="#475569" />
          </g>
          <DustDevil x={450} style={loop("as-devil-sway", 2.4)} />
          <Rover x={180} moving={false}>
            {[-20, -6, 8].map((x) => (
              <rect key={x} x={x} y="-84" width="8" height="16" rx="3" fill="#a5f3fc" stroke="#0e7490" />
            ))}
          </Rover>
        </>
      );
  }
}

function Spot({ x, y, label, found, onFind }) {
  const w = Math.max(90, label.length * 8.6 + 26);
  const above = y > 120;
  const bx = Math.min(790 - w / 2, Math.max(10 + w / 2, x));
  const by = above ? y - 34 : y + 34;
  return (
    <g style={{ cursor: "pointer" }} onClick={onFind}>
      {!found && (
        <>
          <circle cx={x} cy={y} r="24" fill="#fde047" opacity=".25" style={loop("as-glow", 1)} />
          <circle cx={x} cy={y} r="13" fill="#fde047" stroke="#fff" strokeWidth="3" />
          <text x={x} y={y + 5} textAnchor="middle" fontSize="15" fontWeight="900" fill="#0f172a">
            ?
          </text>
        </>
      )}
      {found && (
        <g>
          <circle cx={x} cy={y} r="11" fill="#22c55e" stroke="#fff" strokeWidth="3" />
          <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff">
            ✓
          </text>
          <g style={{ animation: "as-pop .35s ease-out both", transformBox: "fill-box", transformOrigin: "50% 100%" }}>
            <rect x={bx - w / 2} y={by - 18} width={w} height="32" rx="12" fill="#fff" stroke="#cbd5e1" />
            <text x={bx} y={by + 4} textAnchor="middle" fontSize="15" fontWeight="800" fill="#0f172a">
              {label}
            </text>
          </g>
        </g>
      )}
    </g>
  );
}

export default function ProblemScene({ index, labels = [], found = [], onFind, thumb = false }) {
  const spots = TASKS[index].hotspots;
  const scene = TASKS[index].scene;
  return (
    <svg viewBox="0 0 800 360" className="block w-full h-auto select-none" style={{ touchAction: "manipulation" }}>
      <SceneStyles />
      <SceneDefs />
      <SceneBody scene={scene} />
      {!thumb && spots.map((sp, i) => (
        <Spot key={i} x={sp.x} y={sp.y} label={labels[i]} found={found.includes(i)} onFind={() => onFind(i)} />
      ))}
    </svg>
  );
}
