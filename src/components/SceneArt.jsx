import React from "react";

// Reusable 2D Mars art (astronaut, rover, props, weather) for the hands-on mini-games.
// Stage is 800×360 SVG units; the ground line is y = 290.

export const GROUND = 290;

const CSS = `
@keyframes as-appear { from { opacity: 0 } to { opacity: 1 } }
@keyframes as-vanish { from { opacity: 1 } to { opacity: 0 } }
@keyframes as-drive-in { from { transform: translateX(-460px) } to { transform: translateX(0) } }
@keyframes as-drive-out { from { transform: translateX(0) } to { transform: translateX(560px) } }
@keyframes as-bounce { 0%,100% { transform: translateY(0) rotate(0) } 25% { transform: translateY(-7px) rotate(-2deg) } 50% { transform: translateY(2px) rotate(1.5deg) } 75% { transform: translateY(-4px) rotate(-1deg) } }
@keyframes as-wobble { 0%,100% { transform: rotate(-2.5deg) } 50% { transform: rotate(2.5deg) } }
@keyframes as-spin { to { transform: rotate(360deg) } }
@keyframes as-step-out { from { transform: translateX(-60px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
@keyframes as-leg-a { 0%,100% { transform: rotate(20deg) } 50% { transform: rotate(-20deg) } }
@keyframes as-leg-b { 0%,100% { transform: rotate(-20deg) } 50% { transform: rotate(20deg) } }
@keyframes as-arm-dig { 0%,100% { transform: rotate(-75deg) } 50% { transform: rotate(15deg) } }
@keyframes as-arm-work { 0%,100% { transform: rotate(-85deg) } 50% { transform: rotate(-60deg) } }
@keyframes as-arm-wave { 0%,100% { transform: rotate(-165deg) } 50% { transform: rotate(-125deg) } }
@keyframes as-shiver { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-2px) } 75% { transform: translateX(2px) } }
@keyframes as-spark { 0% { opacity: 0; transform: scale(.2) } 30% { opacity: 1 } 100% { opacity: 0; transform: scale(1.5) } }
@keyframes as-storm-in { from { transform: translateX(460px) } to { transform: translateX(140px) } }
@keyframes as-devil-cross { from { transform: translateX(-260px) } to { transform: translateX(980px) } }
@keyframes as-devil-back { from { transform: translateX(980px) } to { transform: translateX(-300px) } }
@keyframes as-devil-sway { 0%,100% { transform: translateX(-30px) } 50% { transform: translateX(30px) } }
@keyframes as-devil-spin { 0%,100% { transform: scaleX(1) } 50% { transform: scaleX(-1) } }
@keyframes as-smoke { from { opacity: .85; transform: translate(0,0) scale(.5) } to { opacity: 0; transform: translate(-24px,-70px) scale(1.7) } }
@keyframes as-twinkle { 0%,100% { opacity: .25 } 50% { opacity: 1 } }
@keyframes as-pop { 0% { opacity: 0; transform: scale(.3) } 60% { opacity: 1; transform: scale(1.15) } 100% { opacity: 1; transform: scale(1) } }
@keyframes as-sink { 0% { transform: translateY(0) } 30% { transform: translateY(16px) } 50% { transform: translateY(16px) rotate(-3deg) } 60% { transform: translateY(13px) rotate(3deg) } 75% { transform: translateY(8px) rotate(-2deg) } 90%,100% { transform: translateY(0) } }
@keyframes as-laser { 0%,100% { opacity: 0 } 10%,40% { opacity: 1 } 50% { opacity: 0 } 60%,90% { opacity: 1 } }
@keyframes as-lift { from { transform: translateY(0) } to { transform: translateY(-160px) } }
@keyframes as-grow-up { from { transform: scaleY(0) } to { transform: scaleY(1) } }
@keyframes as-nozzle { 0%,100% { transform: translateX(-26px) } 50% { transform: translateX(26px) } }
@keyframes as-race { from { transform: translateX(-320px) } to { transform: translateX(760px) } }
@keyframes as-chase { from { transform: translateX(-520px) } to { transform: translateX(560px) } }
@keyframes as-climb { from { transform: translate(0,0) rotate(0) } to { transform: translate(170px,-78px) rotate(-14deg) } }
@keyframes as-climb-slide { 0% { transform: translate(0,0) rotate(0) } 38% { transform: translate(150px,-70px) rotate(0) } 66% { transform: translate(150px,-70px) rotate(0) } 72% { transform: translate(150px,-70px) rotate(-25deg) } 100% { transform: translate(30px,0) rotate(-25deg) } }
@keyframes as-glow { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
@keyframes as-spray { from { opacity: .9; transform: translate(0,0) } to { opacity: 0; transform: translate(-60px,-30px) } }
@keyframes as-spray-up { from { opacity: 1; transform: translate(0,0) } to { opacity: 0; transform: translate(20px,-50px) } }
@keyframes as-rock-back { 0%,100% { transform: translateX(-14px) } 50% { transform: translateX(14px) } }
@keyframes as-orb { from { transform: translate(0,0); opacity: 1 } to { transform: translate(-190px,-70px); opacity: .2 } }
@keyframes as-ridge { 0% { transform: translate(0,0) rotate(-12deg) } 50% { transform: translate(260px,-60px) rotate(4deg) } 100% { transform: translate(520px,-30px) rotate(8deg) } }
@keyframes as-roof { from { transform: translate(0,0) } to { transform: translate(-150px,-14px) } }
.as-stage .wheel { animation: as-spin .6s linear infinite; transform-box: fill-box; transform-origin: 50% 50%; }
.as-stage .still .wheel { animation: none; }
@media (prefers-reduced-motion: reduce) {
  .as-stage *, .as-stage *::before { animation-duration: .001s !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; }
}
`;

// Small helper for timed CSS animations
export const BOX = { transformBox: "fill-box", transformOrigin: "50% 50%" };
export const anim = (name, dur, delay = 0, extra = "") => ({
  ...BOX,
  animation: `${name} ${dur}s ${extra || "ease-in-out"} ${delay}s both`,
});
export const loop = (name, dur, delay = 0, timing = "ease-in-out") => ({
  ...BOX,
  animation: `${name} ${dur}s ${timing} ${delay}s infinite`,
});
export const appear = (delay, dur = 0.4) => anim("as-appear", dur, delay);
export const vanish = (delay, dur = 0.4) => anim("as-vanish", dur, delay);

// ---------- Characters ----------

export function Tool({ type }) {
  if (type === "drill")
    return (
      <g>
        <rect x="-4" y="20" width="8" height="10" rx="2" fill="#f59e0b" />
        <rect x="-1.5" y="30" width="3" height="14" fill="#94a3b8" />
      </g>
    );
  if (type === "shovel")
    return (
      <g>
        <rect x="-1.5" y="16" width="3" height="26" fill="#a16207" />
        <path d="M-7 42 L7 42 L5 54 L-5 54 Z" fill="#94a3b8" />
      </g>
    );
  if (type === "wrench")
    return (
      <g>
        <rect x="-1.5" y="18" width="3" height="16" fill="#cbd5e1" />
        <circle cx="0" cy="36" r="4" fill="none" stroke="#cbd5e1" strokeWidth="3" />
      </g>
    );
  if (type === "magnifier")
    return (
      <g>
        <rect x="-1.5" y="18" width="3" height="10" fill="#475569" />
        <circle cx="0" cy="34" r="7" fill="#bae6fd" fillOpacity=".5" stroke="#475569" strokeWidth="2.5" />
      </g>
    );
  return null;
}

export function Astronaut({ x, y = GROUND, legs = "stand", arm = "down", tool = null, shiver = false, headlamp = false, scale = 1, style, holding = null }) {
  const legA = legs === "walk" ? loop("as-leg-a", 0.6) : undefined;
  const legB = legs === "walk" ? loop("as-leg-b", 0.6) : undefined;
  const kneel = legs === "kneel";
  const armStyle =
    arm === "dig" ? loop("as-arm-dig", 0.7) : arm === "work" ? loop("as-arm-work", 0.35) : arm === "wave" ? loop("as-arm-wave", 0.5) : undefined;
  const armStatic = arm === "point" ? -95 : arm === "up" ? -170 : arm === "cross" ? -55 : arm === "look" ? -110 : 8;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g style={style}>
      <g style={shiver ? loop("as-shiver", 0.12, 0, "linear") : undefined}>
        <g transform={kneel ? "translate(0 10)" : undefined}>
          {headlamp && <path d="M10 -64 L150 -112 L150 -6 Z" fill="url(#lamp)" style={loop("as-glow", 1.2)} />}
          {/* back arm */}
          <g transform="translate(-2 -48) rotate(18)">
            <rect x="-3" y="0" width="6" height="20" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          </g>
          {/* legs */}
          <g transform="translate(-4 -26)">
            <g style={legA} transform={kneel ? "rotate(70)" : undefined}>
              <rect x="-3.5" y="0" width="7" height="24" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
              <rect x="-4" y="20" width="10" height="6" rx="2" fill="#475569" />
            </g>
          </g>
          <g transform="translate(4 -26)">
            <g style={legB} transform={kneel ? "rotate(-15)" : undefined}>
              <rect x="-3.5" y="0" width="7" height={kneel ? 14 : 24} rx="3" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
              <rect x="-4" y={kneel ? 10 : 20} width="10" height="6" rx="2" fill="#475569" />
            </g>
          </g>
          {/* backpack + body */}
          <rect x="-18" y="-54" width="9" height="24" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
          <rect x="-11" y="-54" width="22" height="30" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
          <rect x="-4" y="-46" width="9" height="6" rx="1.5" fill="#f97316" />
          {/* helmet */}
          <circle cx="0" cy="-64" r="13" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
          <ellipse cx="5" cy="-64" rx="8" ry="7" fill="url(#visor)" />
          <ellipse cx="7.5" cy="-67" rx="2.4" ry="1.6" fill="#fff" opacity=".7" />
          {/* front arm (+ tool / held object) */}
          <g transform={`translate(4 -48) rotate(${armStyle ? 0 : armStatic})`}>
            <g style={armStyle ? { ...armStyle, transformOrigin: "50% 0%" } : undefined}>
              <rect x="-3.5" y="0" width="7" height="20" rx="3.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="0" cy="21" r="4" fill="#64748b" />
              <Tool type={tool} />
            </g>
          </g>
          {holding}
        </g>
      </g>
      </g>
    </g>
  );
}

export function Rover({ x, y = GROUND, damaged = false, moving = true, glow = false, style, bodyStyle, scale = 1, children }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g style={style}>
        <g className={moving ? "" : "still"} style={bodyStyle}>
          {/* wheels */}
          {[-52, 0, 52].map((wx, i) => (
            <g key={wx} transform={`translate(${wx} -17)`}>
              <g className="wheel">
                <circle r="17" fill={damaged && i === 2 ? "#7f1d1d" : "#1e293b"} />
                <circle r="7" fill="#94a3b8" />
                <rect x="-1.5" y="-15" width="3" height="30" fill="#475569" />
                <rect x="-15" y="-1.5" width="30" height="3" fill="#475569" />
              </g>
              {damaged && i === 2 && <path d="M-6 -14 L2 -4 L-3 2 L6 13" stroke="#fca5a5" strokeWidth="2.5" fill="none" />}
            </g>
          ))}
          <rect x="-62" y="-30" width="124" height="6" fill="#64748b" />
          {/* body */}
          <rect x="-66" y="-62" width="132" height="32" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="-66" y="-50" width="132" height="7" fill="#f97316" />
          <rect x="-60" y="-70" width="92" height="8" rx="2" fill="#1d4ed8" />
          {/* window */}
          <rect x="34" y="-58" width="24" height="14" rx="3" fill={glow ? "#fdba74" : "#0ea5e9"} style={glow ? loop("as-glow", 1.4) : undefined} />
          {/* mast + head */}
          <rect x="42" y="-100" width="5" height="38" fill="#cbd5e1" />
          <rect x="30" y="-112" width="30" height="14" rx="3" fill="#1e293b" />
          <circle cx="54" cy="-105" r="3.5" fill="#67e8f9" />
          <circle cx="44" cy="-105" r="3.5" fill="#67e8f9" />
          {/* antenna */}
          <rect x="-48" y="-96" width="2.5" height="26" fill="#cbd5e1" />
          <circle cx="-46.7" cy="-97" r="3.5" fill="#ef4444" style={loop("as-twinkle", 0.6)} />
          {children}
        </g>
      </g>
    </g>
  );
}

// ---------- Props & effects ----------

export const SharpRocks = ({ x }) => (
  <g transform={`translate(${x} ${GROUND})`}>
    <path d="M0 0 L14 -30 L26 0 Z" fill="#7c2d12" />
    <path d="M40 0 L52 -22 L64 0 Z" fill="#9a3412" />
    <path d="M80 0 L90 -36 L104 0 Z" fill="#7c2d12" />
    <path d="M120 0 L128 -18 L140 0 Z" fill="#9a3412" />
  </g>
);

export const LayeredRock = ({ x }) => (
  <g transform={`translate(${x} ${GROUND})`}>
    {["#c2410c", "#fdba74", "#9a3412", "#fed7aa"].map((c, i) => (
      <rect key={i} x={-46 + i * 6} y={-14 - i * 14} width={92 - i * 12} height="14" rx="3" fill={c} />
    ))}
  </g>
);

export function Drone({ x, y, style, spinning = false, broken = true }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g style={style}>
        <rect x="-16" y="-14" width="32" height="18" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
        <rect x="-1.5" y="-30" width="3" height="16" fill="#94a3b8" />
        {spinning ? (
          <ellipse cx="0" cy="-30" rx="44" ry="4" fill="#1e293b" opacity=".45" style={loop("as-twinkle", 0.12, 0, "linear")} />
        ) : (
          <>
            <rect x="-40" y="-32" width="40" height="4" rx="2" fill="#1e293b" />
            <rect x="0" y="-32" width={broken ? 14 : 40} height="4" rx="2" fill="#1e293b" />
          </>
        )}
        <line x1="-12" y1="4" x2="-20" y2="14" stroke="#64748b" strokeWidth="2" />
        <line x1="12" y1="4" x2="20" y2="14" stroke="#64748b" strokeWidth="2" />
      </g>
    </g>
  );
}

export const Hill = ({ x, w = 320, h = 110, color = "#9a3412" }) => (
  <path d={`M${x} ${GROUND} Q${x + w * 0.45} ${GROUND - h * 1.25} ${x + w * 0.62} ${GROUND - h} L${x + w} ${GROUND} Z`} fill={color} />
);

export const Meteorite = ({ x, y, style }) => (
  <g transform={`translate(${x} ${y})`}>
    <g style={style}>
    <path d="M-14 0 L-10 -16 L4 -20 L16 -10 L12 2 Z" fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" />
    <circle cx="2" cy="-12" r="2.5" fill="#e2e8f0" style={loop("as-twinkle", 0.9)} />
    </g>
  </g>
);

export const IceCrystals = ({ x }) => (
  <g transform={`translate(${x} ${GROUND})`}>
    {[[-14, 10], [4, 14], [20, 9]].map(([dx, s], i) => (
      <path key={i} d={`M${dx} 0 L${dx + s / 2} ${-s * 1.6} L${dx + s} 0 Z`} fill="#bae6fd" stroke="#e0f2fe" strokeWidth="1" />
    ))}
    {[[-8, -18], [10, -26], [24, -12]].map(([sx, sy], i) => (
      <text key={i} x={sx} y={sy} fontSize="12" style={loop("as-twinkle", 0.9, i * 0.3)}>✨</text>
    ))}
  </g>
);

export function Sparks({ x, y, delay = 0, count = 3 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: count }, (_, i) => (
        <g key={i} style={{ ...loop("as-spark", 0.5, delay + i * 0.17), transformOrigin: "50% 50%" }}>
          <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#fde047" />
        </g>
      ))}
    </g>
  );
}

export function Smoke({ x, y, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 0.4, 0.8].map((d) => (
        <circle key={d} r="10" fill="#64748b" style={{ ...loop("as-smoke", 1.2, delay + d, "ease-out"), transformOrigin: "50% 50%" }} />
      ))}
    </g>
  );
}

export function SandSpray({ x, y, delay = 0, up = false, color = "#fdba74" }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 0.15, 0.3, 0.45].map((d, i) => (
        <circle key={d} cx={i * 4} cy={-i * 2} r={3 + (i % 2)} fill={color} style={loop(up ? "as-spray-up" : "as-spray", 0.6, delay + d, "ease-out")} />
      ))}
    </g>
  );
}

export function DustDevil({ x, y = GROUND, style, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g style={style}>
        <g style={{ ...loop("as-devil-spin", 0.5, 0, "linear"), transformOrigin: "50% 100%" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse key={i} cx={(i % 2 ? 6 : -6) * (i / 3)} cy={-12 - i * 28} rx={14 + i * 9} ry={8 + i * 2} fill="#a8643f" opacity={0.8 - i * 0.07} />
          ))}
        </g>
      </g>
    </g>
  );
}

export const Bubble = ({ x, y, emoji, delay = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <g style={{ ...anim("as-pop", 0.45, delay), transformOrigin: "50% 100%" }}>
      <rect x="-22" y="-40" width="44" height="34" rx="12" fill="#fff" stroke="#cbd5e1" />
      <path d="M-6 -7 L0 4 L6 -7 Z" fill="#fff" />
      <text x="0" y="-16" fontSize="20" textAnchor="middle">{emoji}</text>
    </g>
  </g>
);

export function Stars() {
  return (
    <g>
      {Array.from({ length: 50 }, (_, i) => (
        <circle key={i} cx={(i * 157) % 800} cy={(i * 61) % 220} r={i % 3 === 0 ? 1.8 : 1} fill="#fff" style={loop("as-twinkle", 2 + (i % 4), (i % 7) * 0.3)} />
      ))}
    </g>
  );
}

const SKIES = {
  day: ["#fdba74", "#c2410c"],
  storm: ["#b45309", "#5b2a16"],
  night: ["#1e1b4b", "#020617"],
  dustDevil: ["#fcd9b6", "#d97706"],
  garage: ["#334155", "#0f172a"],
};

// Moon backdrops: always a black sky (no air!), grey ground, and Earth hanging overhead
const MOON_ENVS = {
  moonDay: { ground: "#8b8b8f", hills: "#6b6b70", edge: "#a3a3a8", tint: null },
  moonDark: { ground: "#3f3f46", hills: "#27272a", edge: "#52525b", tint: null },
  moonStorm: { ground: "#7a6f6a", hills: "#57504c", edge: "#948a84", tint: "#f97316" },
  moonNight: { ground: "#2b2f3a", hills: "#1c1f27", edge: "#3b4252", tint: null },
};

export function MoonEarth({ x = 742, y = 52, r = 22 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 6} fill="#60a5fa" opacity=".18" />
      <circle r={r} fill="#2563eb" />
      <path d={`M${-r * 0.6} ${-r * 0.2} q${r * 0.3} ${-r * 0.5} ${r * 0.7} ${-r * 0.3} q${-r * 0.1} ${r * 0.5} ${-r * 0.6} ${r * 0.6} Z`} fill="#22c55e" />
      <path d={`M${r * 0.1} ${r * 0.2} q${r * 0.4} ${-r * 0.1} ${r * 0.5} ${r * 0.4} q${-r * 0.3} ${r * 0.3} ${-r * 0.5} ${-r * 0.1} Z`} fill="#16a34a" />
      <path d={`M${-r} 0 A${r} ${r} 0 0 0 ${r} 0`} fill="#f8fafc" opacity=".25" />
      <circle r={r} fill="none" stroke="#bfdbfe" strokeWidth="2" opacity=".6" />
    </g>
  );
}

export function Backdrop({ env }) {
  const moon = MOON_ENVS[env];
  if (moon) {
    return (
      <g>
        <rect width="800" height="360" fill="#020617" />
        <Stars />
        {moon.tint && (
          <g opacity=".16">
            <rect width="800" height="360" fill={moon.tint} style={loop("as-glow", 1.4)} />
          </g>
        )}
        {env === "moonStorm" && <circle cx="90" cy="60" r="30" fill="#fde047" opacity=".9" style={loop("as-glow", 0.8)} />}
        <MoonEarth />
        <path d="M0 262 Q120 230 240 250 T480 244 T800 240 L800 300 L0 300 Z" fill={moon.hills} />
        <rect y={GROUND} width="800" height={360 - GROUND} fill={moon.ground} />
        <rect y={GROUND} width="800" height="4" fill={moon.edge} />
        {[[120, 316, 26], [430, 330, 18], [650, 312, 32]].map(([cx, cy, rr], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rr} ry={rr * 0.3} fill="#00000033" />
        ))}
      </g>
    );
  }
  const [bottom, top] = SKIES[env] || SKIES.day;
  return (
    <g>
      <rect width="800" height="360" fill={`url(#sky-${env})`} />
      <defs>
        <linearGradient id={`sky-${env}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={bottom} />
          <stop offset="1" stopColor={top} />
        </linearGradient>
      </defs>
      {env === "night" && <Stars />}
      {env !== "garage" && (
        <>
          <path d="M0 250 L90 225 L180 245 L300 215 L420 240 L540 222 L660 246 L800 228 L800 300 L0 300 Z" fill={env === "night" ? "#1e293b" : "#9a3412"} opacity=".6" />
          <rect y={GROUND} width="800" height={360 - GROUND} fill={env === "night" ? "#3b1d12" : "#b45309"} />
          <rect y={GROUND} width="800" height="4" fill={env === "night" ? "#4a2617" : "#c2410c"} />
        </>
      )}
    </g>
  );
}

export const StormWall = () => (
  <g style={anim("as-storm-in", 6.5, 0, "linear")}>
    <rect x="420" y="0" width="600" height="360" fill="url(#storm)" />
    <defs>
      <linearGradient id="storm" x1="0" x2="1">
        <stop offset="0" stopColor="#92400e" stopOpacity="0" />
        <stop offset=".25" stopColor="#92400e" stopOpacity=".75" />
        <stop offset="1" stopColor="#78350f" stopOpacity=".95" />
      </linearGradient>
    </defs>
  </g>
);

// Global keyframes + shared gradients; render once inside every stage <svg>
export function SceneStyles() {
  return <style>{CSS}</style>;
}

export function SceneDefs() {
  return (
    <defs>
      <linearGradient id="visor" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fde68a" />
        <stop offset="1" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="lamp" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fef9c3" stopOpacity=".55" />
        <stop offset="1" stopColor="#fef9c3" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}
