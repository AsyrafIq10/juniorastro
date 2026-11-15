import React, { useEffect, useMemo, useState } from "react";
import drFarahImg from "../assets/dr-farah.png";

// Five illustrated, animated main-menu scenes that cross-fade in a loop:
// 1 rocket launch close-up • 2 Earth seen from the Moon • 3 rover at the compound
// 4 Mars close-up under night stars • 5 astronaut suiting up for launch
const SCENE_MS = 7000;

const CSS = `
.mb-scene { position:absolute; inset:0; opacity:0; transition:opacity 1.2s ease; }
.mb-scene.is-on { opacity:1; }
.mb-scene svg { position:absolute; inset:0; width:100%; height:100%; }
.mb-zoom { transform-origin:50% 50%; }
.is-on .mb-zoom { animation: mb-kenburns 7.4s ease-out both; }
@keyframes mb-kenburns { from { transform: scale(1.08); } to { transform: scale(1); } }

@keyframes mb-twinkle { 0%,100% { opacity:.25; } 50% { opacity:1; } }
.mb-tw { animation: mb-twinkle 2.4s ease-in-out infinite; }
@keyframes mb-shoot { 0% { transform: translate(0,0); opacity:0; } 8% { opacity:1; } 30%,100% { transform: translate(-900px,420px); opacity:0; } }
.mb-shoot { animation: mb-shoot 5s ease-in infinite; }

/* 1: rocket */
@keyframes mb-rise { 0% { transform: translateY(150px); } 100% { transform: translateY(-260px); } }
.is-on .mb-rocket { animation: mb-rise 7.2s cubic-bezier(.45,0,.7,1) both; }
@keyframes mb-shake { 0%,100% { transform: translate(0,0); } 25% { transform: translate(-3px,1px); } 50% { transform: translate(3px,-1px); } 75% { transform: translate(-2px,-1px); } }
.mb-shake { animation: mb-shake .12s linear infinite; }
@keyframes mb-flame { 0%,100% { transform: scaleY(1) scaleX(1); } 50% { transform: scaleY(1.25) scaleX(.9); } }
.mb-flame { transform-box: fill-box; transform-origin: 50% 0%; animation: mb-flame .14s ease-in-out infinite; }
@keyframes mb-billow { 0% { transform: scale(.4) translate(0,0); opacity:.95; } 100% { transform: scale(1.6) translate(var(--dx),-30px); opacity:0; } }
.mb-smoke { transform-box: fill-box; transform-origin: 50% 50%; animation: mb-billow 2.6s ease-out infinite; }

/* 2: Earth from the Moon */
@keyframes mb-spin-land { from { transform: translateX(0); } to { transform: translateX(-520px); } }
.mb-land { animation: mb-spin-land 26s linear infinite; }
@keyframes mb-wave { 0%,100% { transform: skewX(0deg); } 50% { transform: skewX(-8deg); } }
.mb-flag { transform-box: fill-box; transform-origin: 0% 50%; animation: mb-wave 2.2s ease-in-out infinite; }
@keyframes mb-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
.mb-bob { animation: mb-bob 4s ease-in-out infinite; }

/* 3: rover */
@keyframes mb-drive { 0% { transform: translateX(-260px); } 45%,55% { transform: translateX(120px); } 100% { transform: translateX(-260px); } }
.mb-rover { animation: mb-drive 9s ease-in-out infinite; }
@keyframes mb-wheel { to { transform: rotate(360deg); } }
.mb-wheel { transform-box: fill-box; transform-origin: 50% 50%; animation: mb-wheel 1s linear infinite; }
@keyframes mb-dust { 0% { transform: translate(0,0) scale(.4); opacity:.8; } 100% { transform: translate(-60px,-30px) scale(1.4); opacity:0; } }
.mb-dust { transform-box: fill-box; transform-origin: 50% 50%; animation: mb-dust 1.2s ease-out infinite; }
@keyframes mb-blink { 0%,90%,100% { opacity:1; } 95% { opacity:.2; } }
.mb-blink { animation: mb-blink 1.6s linear infinite; }
@keyframes mb-dish { 0%,100% { transform: rotate(-14deg); } 50% { transform: rotate(14deg); } }
.mb-dish { transform-box: fill-box; transform-origin: 50% 100%; animation: mb-dish 5s ease-in-out infinite; }

/* 4: Mars */
@keyframes mb-spin-mars { from { transform: translateX(0); } to { transform: translateX(-640px); } }
.mb-mars-surf { animation: mb-spin-mars 40s linear infinite; }
@keyframes mb-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.mb-orbit { transform-origin: 800px 470px; animation: mb-orbit 14s linear infinite; }

/* 5: suiting up */
@keyframes mb-suit-in { 0% { transform: translateY(70%) scale(.9); opacity:0; } 18% { transform: translateY(0) scale(1); opacity:1; } 78% { transform: translateX(0) scale(1); opacity:1; } 100% { transform: translateX(34vw) scale(.7); opacity:0; } }
.is-on .mb-astro { animation: mb-suit-in 7.2s ease-in-out both; }
@keyframes mb-shine { 0% { transform: translateX(-140%) rotate(25deg); } 100% { transform: translateX(260%) rotate(25deg); } }
.mb-shine { animation: mb-shine 2.4s ease-in-out 1.2s infinite; }
@keyframes mb-tick { 0% { transform: scale(0); opacity:0; } 60% { transform: scale(1.2); opacity:1; } 100% { transform: scale(1); opacity:1; } }
.is-on .mb-check { animation: mb-tick .45s ease-out both; }
@keyframes mb-hatch { 0%,70% { transform: scaleX(1); } 100% { transform: scaleX(.12); } }
.is-on .mb-hatch-door { transform-box: fill-box; transform-origin: 0% 50%; animation: mb-hatch 7s ease-in-out both; }
`;

function Stars({ n = 90, seed = 1, w = 1600, h = 900, maxY = 1 }) {
  const stars = useMemo(() => {
    let s = seed * 9301;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: n }, () => ({ x: r() * w, y: r() * h * maxY, r: 0.8 + r() * 2.2, d: r() * 3, c: r() > 0.85 ? "#fde68a" : r() > 0.7 ? "#bae6fd" : "#ffffff" }));
  }, [n, seed, w, h, maxY]);
  return (
    <g>
      {stars.map((st, i) => (
        <circle key={i} cx={st.x} cy={st.y} r={st.r} fill={st.c} className="mb-tw" style={{ animationDelay: `${st.d}s` }} />
      ))}
    </g>
  );
}

function RocketScene() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="mb-zoom">
      <defs>
        <linearGradient id="mb-sky1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e1b4b" />
          <stop offset=".45" stopColor="#4338ca" />
          <stop offset=".8" stopColor="#f472b6" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
        <radialGradient id="mb-glow1" cx=".5" cy="1" r=".6">
          <stop offset="0" stopColor="#fde047" stopOpacity=".9" />
          <stop offset="1" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mb-body" x1="0" x2="1">
          <stop offset="0" stopColor="#cbd5e1" />
          <stop offset=".45" stopColor="#ffffff" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#mb-sky1)" />
      <Stars n={70} seed={3} maxY={0.45} />
      <rect width="1600" height="900" fill="url(#mb-glow1)" />
      {/* launch tower */}
      <g fill="none" stroke="#334155" strokeWidth="10">
        <rect x="930" y="180" width="110" height="720" fill="#1e293b" />
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M930 ${200 + i * 50} L1040 ${250 + i * 50} M1040 ${200 + i * 50} L930 ${250 + i * 50}`} stroke="#475569" strokeWidth="6" />
        ))}
        <rect x="1040" y="330" width="90" height="16" fill="#475569" stroke="none" />
        <circle cx="985" cy="170" r="12" fill="#ef4444" stroke="none" className="mb-blink" />
      </g>
      {/* rocket */}
      <g className="mb-rocket">
        <g className="mb-shake">
          <g transform="translate(1230 0)">
            {/* flame */}
            <g transform="translate(0 735)">
              <path className="mb-flame" d="M-70 0 Q-80 140 0 300 Q80 140 70 0 Z" fill="#f97316" />
              <path className="mb-flame" d="M-48 0 Q-55 110 0 230 Q55 110 48 0 Z" fill="#facc15" style={{ animationDelay: ".05s" }} />
              <path className="mb-flame" d="M-24 0 Q-26 70 0 150 Q26 70 24 0 Z" fill="#fffbeb" style={{ animationDelay: ".09s" }} />
            </g>
            {/* body */}
            <path d="M-95 300 Q-95 140 0 40 Q95 140 95 300 L95 700 L-95 700 Z" fill="url(#mb-body)" stroke="#0f172a" strokeWidth="8" />
            <path d="M0 40 Q-68 110 -82 190 L82 190 Q68 110 0 40 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="8" />
            <rect x="-95" y="470" width="190" height="34" fill="#ef4444" />
            <rect x="-95" y="610" width="190" height="20" fill="#2563eb" />
            <circle cx="0" cy="330" r="46" fill="#38bdf8" stroke="#0f172a" strokeWidth="10" />
            <circle cx="-14" cy="316" r="14" fill="#e0f2fe" />
            <text x="0" y="440" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="34" fill="#1e293b">
              JEZERO 6
            </text>
            <path d="M-95 560 L-190 720 L-95 700 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="8" />
            <path d="M95 560 L190 720 L95 700 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="8" />
            <rect x="-70" y="700" width="140" height="40" rx="8" fill="#475569" stroke="#0f172a" strokeWidth="8" />
          </g>
        </g>
      </g>
      {/* smoke clouds */}
      {Array.from({ length: 16 }, (_, i) => {
        const x = 700 + i * 70;
        return (
          <circle
            key={i}
            cx={x}
            cy={860 - (i % 3) * 30}
            r={90 + (i % 4) * 25}
            fill={i % 2 ? "#f1f5f9" : "#e2e8f0"}
            className="mb-smoke"
            style={{ "--dx": `${(x - 1230) * 0.25}px`, animationDelay: `${(i % 6) * 0.4}s` }}
          />
        );
      })}
      <rect y="840" width="1600" height="60" fill="#f8fafc" opacity=".85" />
    </svg>
  );
}

function EarthFromMoonScene() {
  const land = [
    [40, 60, 90, 70],
    [140, 150, 60, 110],
    [260, 40, 110, 80],
    [330, 140, 70, 90],
    [430, 70, 60, 60],
  ];
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="mb-zoom">
      <defs>
        <radialGradient id="mb-space2" cx=".7" cy=".25" r=".9">
          <stop offset="0" stopColor="#1e3a8a" />
          <stop offset=".5" stopColor="#0b1026" />
          <stop offset="1" stopColor="#02030a" />
        </radialGradient>
        <radialGradient id="mb-ocean" cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset=".6" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#172554" />
        </radialGradient>
        <radialGradient id="mb-atmo" cx=".5" cy=".5" r=".5">
          <stop offset=".86" stopColor="#7dd3fc" stopOpacity="0" />
          <stop offset=".94" stopColor="#7dd3fc" stopOpacity=".7" />
          <stop offset="1" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mb-moonground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#64748b" />
        </linearGradient>
        <clipPath id="mb-earthclip">
          <circle cx="1120" cy="300" r="190" />
        </clipPath>
      </defs>
      <rect width="1600" height="900" fill="url(#mb-space2)" />
      <Stars n={140} seed={7} />
      <path d="M0 380 Q500 260 1600 120 L1600 220 Q600 360 0 470 Z" fill="#a78bfa" opacity=".08" />
      <line x1="1500" y1="80" x2="1560" y2="52" stroke="#fff" strokeWidth="3" className="mb-shoot" />
      {/* Earth */}
      <g className="mb-bob">
        <circle cx="1120" cy="300" r="260" fill="url(#mb-atmo)" />
        <circle cx="1120" cy="300" r="190" fill="url(#mb-ocean)" />
        <g clipPath="url(#mb-earthclip)">
          <g className="mb-land">
            {[0, 520].map((off) => (
              <g key={off} transform={`translate(${930 + off} 110)`}>
                {land.map(([x, y, w, h], i) => (
                  <ellipse key={i} cx={x} cy={y} rx={w / 2} ry={h / 2} fill={i % 2 ? "#22c55e" : "#16a34a"} />
                ))}
                {[
                  [60, 120, 120],
                  [300, 230, 150],
                  [420, 30, 90],
                ].map(([x, y, w], i) => (
                  <rect key={i} x={x} y={y} width={w} height="16" rx="8" fill="#fff" opacity=".85" />
                ))}
              </g>
            ))}
          </g>
          <circle cx="1210" cy="370" r="190" fill="#020617" opacity=".35" />
        </g>
      </g>
      {/* lunar ground */}
      <path d="M0 640 Q300 580 620 620 T1200 600 T1600 640 L1600 900 L0 900 Z" fill="url(#mb-moonground)" />
      {[
        [220, 740, 110, 26],
        [700, 800, 160, 34],
        [1150, 720, 90, 20],
        [1400, 830, 140, 30],
        [450, 680, 60, 14],
      ].map(([x, y, w, h], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={w} ry={h} fill="#475569" opacity=".55" />
          <ellipse cx={x} cy={y - 4} rx={w * 0.8} ry={h * 0.6} fill="#334155" opacity=".55" />
        </g>
      ))}
      {/* lander + flag + footprints */}
      <g transform="translate(330 560)">
        <path d="M-80 70 L-50 0 L50 0 L80 70" stroke="#94a3b8" strokeWidth="8" fill="none" />
        <rect x="-60" y="-60" width="120" height="70" rx="10" fill="#fbbf24" stroke="#1e293b" strokeWidth="6" />
        <path d="M-40 -60 L0 -120 L40 -60 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="6" />
        <circle cx="0" cy="-28" r="16" fill="#38bdf8" stroke="#1e293b" strokeWidth="5" />
      </g>
      <g transform="translate(560 520)">
        <rect x="-4" y="0" width="8" height="150" fill="#e2e8f0" />
        <g className="mb-flag">
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x="4" y={i * 10} width="110" height="10" fill={i % 2 ? "#fff" : "#dc2626"} />
          ))}
          <rect x="4" y="0" width="50" height="40" fill="#1e3a8a" />
          <circle cx="24" cy="20" r="11" fill="#facc15" />
          <circle cx="28" cy="20" r="9" fill="#1e3a8a" />
        </g>
      </g>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx={640 + i * 70} cy={760 + (i % 2) * 22} rx="16" ry="7" fill="#475569" opacity=".6" />
      ))}
    </svg>
  );
}

function RoverCompoundScene() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="mb-zoom">
      <defs>
        <linearGradient id="mb-sky3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdba74" />
          <stop offset=".6" stopColor="#fed7aa" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
        <linearGradient id="mb-ground3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ea580c" />
          <stop offset="1" stopColor="#9a3412" />
        </linearGradient>
        <linearGradient id="mb-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0f2fe" stopOpacity=".9" />
          <stop offset="1" stopColor="#7dd3fc" stopOpacity=".45" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#mb-sky3)" />
      <circle cx="1350" cy="150" r="60" fill="#fff7ed" opacity=".8" />
      <path d="M0 520 Q200 430 420 500 T900 470 T1300 450 T1600 500 L1600 900 L0 900 Z" fill="#f97316" opacity=".55" />
      <path d="M0 590 Q300 540 700 580 T1600 560 L1600 900 L0 900 Z" fill="url(#mb-ground3)" />
      {/* habitat */}
      <g transform="translate(1080 600)">
        <path d="M-200 0 A200 170 0 0 1 200 0 Z" fill="#f8fafc" stroke="#475569" strokeWidth="8" />
        <path d="M-200 0 A200 170 0 0 1 200 0" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="30 18" transform="scale(.8) translate(0 -10)" />
        {[-90, 0, 90].map((x) => (
          <circle key={x} cx={x} cy="-80" r="22" fill="#38bdf8" stroke="#334155" strokeWidth="6" className="mb-blink" style={{ animationDelay: `${x / 90}s` }} />
        ))}
        <rect x="-36" y="-70" width="72" height="70" rx="10" fill="#f97316" stroke="#334155" strokeWidth="6" />
        <g transform="translate(150 -160)">
          <rect x="-5" y="0" width="10" height="70" fill="#64748b" />
          <path className="mb-dish" d="M-50 0 Q0 -40 50 0 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="5" />
        </g>
      </g>
      {/* greenhouse */}
      <g transform="translate(560 600)">
        <path d="M-130 0 A130 120 0 0 1 130 0 Z" fill="url(#mb-glass)" stroke="#94a3b8" strokeWidth="6" />
        {[-70, -20, 30, 80].map((x, i) => (
          <g key={x} transform={`translate(${x} -10)`}>
            <path d="M0 0 Q-20 -40 0 -60 Q20 -40 0 0" fill={i % 2 ? "#22c55e" : "#4ade80"} />
          </g>
        ))}
        <path d="M-130 0 A130 120 0 0 1 130 0" fill="none" stroke="#e0f2fe" strokeWidth="3" transform="scale(.6)" />
      </g>
      {/* solar panels */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${120 + i * 120} ${640 + (i % 2) * 18}) skewX(-14)`}>
          <rect x="0" y="0" width="100" height="56" fill="#1d4ed8" stroke="#e2e8f0" strokeWidth="4" />
          <path d="M33 0 V56 M66 0 V56 M0 28 H100" stroke="#93c5fd" strokeWidth="2" />
          <rect x="44" y="56" width="10" height="34" fill="#64748b" />
        </g>
      ))}
      {/* rover */}
      <g className="mb-rover">
        <g transform="translate(860 760)">
          <circle className="mb-dust" cx="-150" cy="40" r="26" fill="#fdba74" />
          <circle className="mb-dust" cx="-170" cy="20" r="18" fill="#fed7aa" style={{ animationDelay: ".4s" }} />
          <rect x="-130" y="-70" width="260" height="70" rx="16" fill="#f8fafc" stroke="#1e293b" strokeWidth="8" />
          <rect x="-130" y="-42" width="260" height="16" fill="#f97316" />
          <rect x="-150" y="-92" width="300" height="20" rx="6" fill="#2563eb" stroke="#1e293b" strokeWidth="6" />
          <rect x="-8" y="-170" width="16" height="80" fill="#cbd5e1" stroke="#1e293b" strokeWidth="5" />
          <rect x="-56" y="-212" width="112" height="50" rx="14" fill="#1e293b" />
          <circle cx="-24" cy="-188" r="13" fill="#67e8f9" className="mb-blink" />
          <circle cx="24" cy="-188" r="13" fill="#67e8f9" className="mb-blink" />
          <path d="M130 -40 L210 -90 L250 -20" fill="none" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round" />
          <circle cx="250" cy="-14" r="14" fill="#facc15" className="mb-blink" />
          {[-95, 0, 95].map((x) => (
            <g key={x} transform={`translate(${x} 22)`}>
              <circle r="38" fill="#1e293b" />
              <g className="mb-wheel">
                <circle r="38" fill="#1e293b" />
                <path d="M-30 0 H30 M0 -30 V30" stroke="#94a3b8" strokeWidth="8" />
                <circle r="11" fill="#cbd5e1" />
              </g>
            </g>
          ))}
        </g>
      </g>
      <g transform="translate(1160 790)">
        <path d="M-60 30 L-40 -30 L20 -46 L60 0 L40 34 Z" fill="#7c2d12" />
      </g>
    </svg>
  );
}

function MarsNightScene() {
  const features = [
    [60, 80, 90, 40, "#b91c1c"],
    [220, 200, 140, 30, "#9a3412"],
    [380, 90, 70, 70, "#7f1d1d"],
    [120, 300, 60, 60, "#9a3412"],
    [480, 260, 110, 36, "#b91c1c"],
  ];
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="mb-zoom">
      <defs>
        <radialGradient id="mb-space4" cx=".5" cy=".5" r=".8">
          <stop offset="0" stopColor="#3b0764" />
          <stop offset=".55" stopColor="#1e1b4b" />
          <stop offset="1" stopColor="#020617" />
        </radialGradient>
        <radialGradient id="mb-mars" cx=".38" cy=".35" r=".75">
          <stop offset="0" stopColor="#fdba74" />
          <stop offset=".45" stopColor="#ea580c" />
          <stop offset="1" stopColor="#7c2d12" />
        </radialGradient>
        <radialGradient id="mb-marsglow" cx=".5" cy=".5" r=".5">
          <stop offset=".8" stopColor="#fb923c" stopOpacity=".55" />
          <stop offset="1" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
        <clipPath id="mb-marsclip">
          <circle cx="800" cy="470" r="300" />
        </clipPath>
      </defs>
      <rect width="1600" height="900" fill="url(#mb-space4)" />
      <Stars n={220} seed={11} />
      <line x1="300" y1="90" x2="360" y2="62" stroke="#fff" strokeWidth="3" className="mb-shoot" style={{ animationDelay: "2s" }} />
      <circle cx="800" cy="470" r="360" fill="url(#mb-marsglow)" />
      <circle cx="800" cy="470" r="300" fill="url(#mb-mars)" />
      <g clipPath="url(#mb-marsclip)">
        <g className="mb-mars-surf">
          {[0, 640].map((off) => (
            <g key={off} transform={`translate(${520 + off} 190)`}>
              {features.map(([x, y, w, h, c], i) => (
                <ellipse key={i} cx={x} cy={y} rx={w / 2} ry={h / 2} fill={c} opacity=".75" />
              ))}
              <path d="M0 330 Q200 300 420 340 Q520 360 640 330" stroke="#7f1d1d" strokeWidth="18" fill="none" opacity=".6" />
              {[
                [300, 420, 18],
                [90, 200, 12],
                [520, 120, 14],
              ].map(([x, y, r], i) => (
                <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="#fed7aa" strokeWidth="4" opacity=".5" />
              ))}
            </g>
          ))}
        </g>
        <ellipse cx="800" cy="185" rx="120" ry="34" fill="#fff7ed" opacity=".9" />
        <circle cx="920" cy="560" r="300" fill="#020617" opacity=".38" />
      </g>
      <g className="mb-orbit">
        <circle cx="800" cy="70" r="22" fill="#a8a29e" />
        <circle cx="794" cy="64" r="6" fill="#78716c" />
      </g>
      <g className="mb-orbit" style={{ animationDuration: "22s", animationDirection: "reverse" }}>
        <circle cx="1210" cy="470" r="13" fill="#d6d3d1" />
      </g>
    </svg>
  );
}

function SuitUpScene({ checks }) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="mb-zoom">
        <defs>
          <linearGradient id="mb-room" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0f172a" />
            <stop offset="1" stopColor="#1e3a8a" />
          </linearGradient>
          <radialGradient id="mb-spot" cx=".5" cy=".55" r=".5">
            <stop offset="0" stopColor="#38bdf8" stopOpacity=".45" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#mb-room)" />
        {/* wall panels */}
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={i * 200 + 10} y="40" width="180" height="560" rx="14" fill="#1e293b" stroke="#334155" strokeWidth="4" />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx={60 + i * 135} cy="80" r="9" fill={i % 3 ? "#22d3ee" : "#f472b6"} className="mb-blink" style={{ animationDelay: `${i * 0.13}s` }} />
        ))}
        {/* window with the rocket outside */}
        <g transform="translate(280 260)">
          <circle r="150" fill="#fb923c" stroke="#94a3b8" strokeWidth="18" />
          <circle r="150" fill="#4338ca" opacity=".55" />
          <path d="M-20 140 L-20 -40 Q0 -100 20 -40 L20 140 Z" fill="#f8fafc" />
          <path d="M-20 -40 Q0 -100 20 -40 Z" fill="#ef4444" />
        </g>
        {/* capsule hatch on the right */}
        <g transform="translate(1340 420)">
          <circle r="230" fill="#334155" stroke="#94a3b8" strokeWidth="16" />
          <circle r="180" fill="#020617" />
          <circle r="180" fill="#facc15" opacity=".25" />
          <rect className="mb-hatch-door" x="-180" y="-180" width="360" height="360" rx="180" fill="#64748b" stroke="#cbd5e1" strokeWidth="8" />
          <text y="-200" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="34" fill="#fde047">
            HATCH ▶
          </text>
        </g>
        <rect y="760" width="1600" height="140" fill="#0b1226" />
        <ellipse cx="800" cy="560" rx="600" ry="420" fill="url(#mb-spot)" />
      </svg>
      {/* Dr Farah suiting up, then heading to the hatch */}
      <div className="mb-astro absolute bottom-0 left-1/2 -translate-x-1/2" style={{ height: "min(78vh, 680px)", aspectRatio: "800 / 860" }}>
        <img src={drFarahImg} alt="" className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,.6)]" draggable={false} />
        <div className="absolute overflow-hidden rounded-full" style={{ left: "41%", top: "6%", width: "35%", height: "33%" }}>
          <div className="mb-shine absolute -top-1/4 h-[150%] w-1/4 bg-white/45 blur-md" />
        </div>
      </div>
      <div className="absolute left-[4%] bottom-[18%] flex flex-col gap-2">
        {checks.map((c, i) => (
          <div key={c} className="mb-check flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/90 text-slate-950 font-display font-bold text-sm sm:text-base shadow-lg" style={{ animationDelay: `${1.4 + i * 0.7}s` }}>
            ✅ {c}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MenuBackdrops({ checks = ["Helmet", "Oxygen", "Gloves", "Ready!"] }) {
  // idx = scene on screen; plays[i] = how many times scene i has started (its key, so it replays each loop)
  const [{ idx, plays }, setState] = useState({ idx: 0, plays: [1, 0, 0, 0, 0] });
  useEffect(() => {
    const id = setInterval(
      () =>
        setState(({ idx: cur, plays: p }) => {
          const next = (cur + 1) % 5;
          const np = [...p];
          np[next] += 1;
          return { idx: next, plays: np };
        }),
      SCENE_MS
    );
    return () => clearInterval(id);
  }, []);
  const scenes = [<RocketScene key="r" />, <EarthFromMoonScene key="e" />, <RoverCompoundScene key="c" />, <MarsNightScene key="m" />, <SuitUpScene key="s" checks={checks} />];
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617]" aria-hidden="true">
      <style>{CSS}</style>
      {scenes.map((sc, i) => (
        <div key={i} className={`mb-scene ${i === idx ? "is-on" : ""}`}>
          {/* only the current scene and the one fading out are drawn; a new key replays the story each loop */}
          {i === idx || i === (idx + 4) % 5 ? React.cloneElement(sc, { key: `${i}-${plays[i]}` }) : null}
        </div>
      ))}
      {/* soft vignette so the menu stays readable */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(2,6,23,.15) 0%, rgba(2,6,23,.55) 75%)" }} />
      <div className="absolute bottom-10 inset-x-0 flex justify-center gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-2 rounded-full transition-all duration-500 ${i === idx ? "w-8 bg-amber-300" : "w-2 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
