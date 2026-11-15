import React, { useEffect, useReducer, useRef } from "react";
import {
  GROUND,
  Astronaut,
  Rover,
  Drone,
  Hill,
  Meteorite,
  IceCrystals,
  Sparks,
  SandSpray,
  DustDevil,
  Backdrop,
  LayeredRock,
  SceneStyles,
  SceneDefs,
  anim,
  loop,
} from "./SceneArt";
import { pauseState } from "../utils/pause";

// Hands-on mini-games. Every game gets:
//   cfg  – numbers from playConfigs.js
//   p    – translated UI strings (t.play)
//   feel – { set({stress, cold}), bump(), sound(name), hum(on, kind) } -> spacesuit effects
//   onFinish(score 0..1)

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const GAME_KEYS = ["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS"];

function useKeys() {
  const keys = useRef({});
  useEffect(() => {
    const down = (e) => {
      if (!GAME_KEYS.includes(e.code)) return;
      e.preventDefault();
      keys.current[e.code] = true;
    };
    const up = (e) => {
      keys.current[e.code] = false;
    };
    const blur = () => {
      keys.current = {};
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
  return keys;
}

function useLoop(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    let raf;
    let last = performance.now();
    const tick = (now) => {
      // rAF timestamps can be slightly older than performance.now() on the first frame
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (!pauseState.paused) ref.current(dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}

function useTick() {
  const [, force] = useReducer((x) => x + 1, 0);
  return force;
}

// Edge-triggered press: true only on the frame the key/button goes down
function useEdges() {
  const prev = useRef({});
  return (name, isDown) => {
    const was = prev.current[name];
    prev.current[name] = isDown;
    return isDown && !was;
  };
}

function Stage({ env, children, svgRef, onPointerMove, onPointerDown, cursor }) {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 360"
      className="block w-full h-auto select-none"
      style={{ touchAction: "none", cursor }}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
    >
      <SceneStyles />
      <SceneDefs />
      {env && <Backdrop env={env} />}
      {children}
    </svg>
  );
}

function Meter({ label, value, color, warn }) {
  return (
    <div className="min-w-[110px]">
      <div className="flex justify-between text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-white/90 drop-shadow">
        <span>{label}</span>
        <span>{Math.round(clamp(value) * 100)}%</span>
      </div>
      <div className={`h-2.5 rounded-full bg-slate-900/70 border border-white/20 overflow-hidden ${warn ? "animate-pulse" : ""}`}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${clamp(value) * 100}%` }} />
      </div>
    </div>
  );
}

function Timer({ left }) {
  return (
    <div className="px-2.5 py-1 rounded-full bg-slate-900/75 border border-white/20 text-xs font-extrabold text-white tabular-nums">
      ⏱ {Math.max(0, Math.ceil(left))}s
    </div>
  );
}

function PadButton({ children, onDown, onUp, className = "", label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* pointer already gone */ }
        onDown?.();
      }}
      onPointerUp={() => onUp?.()}
      onPointerCancel={() => onUp?.()}
      onLostPointerCapture={() => onUp?.()}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => e.preventDefault()}
      style={{ touchAction: "none" }}
      className={`select-none rounded-2xl font-display font-bold shadow-xl border-2 active:scale-95 transition-transform ${className}`}
    >
      {children}
    </button>
  );
}

function Banner({ text, tone = "rose" }) {
  if (!text) return null;
  const tones = { rose: "bg-rose-500/90", amber: "bg-amber-400/90 text-slate-950", emerald: "bg-emerald-400/90 text-slate-950" };
  return (
    <div className="absolute inset-x-0 top-[38%] flex justify-center pointer-events-none">
      <div className={`rover-pop-in px-4 py-2 rounded-2xl font-display text-lg sm:text-2xl font-bold text-white shadow-xl ${tones[tone]}`}>{text}</div>
    </div>
  );
}

// =====================================================================
// 1) HOLD — drill / dig / fix / print. Pace yourself before the tool overheats or hands freeze.
// =====================================================================
function HoldScene({ scene, s }) {
  const working = s.holding;
  switch (scene) {
    case "drone":
      return (
        <>
          <Rover x={160} moving={false} />
          {s.progress >= 1 ? (
            <Drone x={520} y={GROUND - 4} spinning broken={false} style={anim("as-lift", 1.6, 0, "ease-in")} />
          ) : (
            <Drone x={520} y={GROUND - 4} broken />
          )}
          <Astronaut x={468} legs="kneel" arm={working ? "work" : "down"} tool="wrench" shiver={s.danger > 0.6} />
          {working && <Sparks x={505} y={GROUND - 24} />}
        </>
      );
    case "dune":
      return (
        <>
          <path d={`M180 ${GROUND} Q400 ${GROUND - 40} 620 ${GROUND} Z`} fill="#d97706" />
          <Rover x={360} moving={working} bodyStyle={{ transform: `translateY(${(1 - s.progress) * 18}px)`, transition: "transform .3s" }} />
          <Astronaut x={470} arm={working ? "dig" : "down"} tool="shovel" />
          {working && <SandSpray x={440} y={GROUND - 6} up />}
        </>
      );
    case "printer":
      return (
        <>
          <circle cx="640" cy="110" r="64" fill="#78350f" stroke="#64748b" strokeWidth="8" />
          <g style={loop("as-devil-sway", 1.5)}>
            <circle cx="620" cy="100" r="20" fill="#b45309" opacity=".7" />
            <circle cx="660" cy="122" r="14" fill="#92400e" opacity=".7" />
          </g>
          <rect y={GROUND} width="800" height="70" fill="#1e293b" />
          <Rover x={110} moving={false} />
          <rect x="300" y={GROUND - 160} width="200" height="160" rx="8" fill="#334155" stroke={s.danger > 0.7 ? "#ef4444" : "#64748b"} strokeWidth="4" />
          <rect x="315" y={GROUND - 145} width="170" height="8" fill="#94a3b8" />
          <g transform={`translate(400 ${GROUND - 137})`}>
            <g style={working ? loop("as-nozzle", 0.8, 0, "linear") : undefined}>
              <rect x="-8" y="0" width="16" height="16" fill={s.danger > 0.7 ? "#ef4444" : "#f59e0b"} />
              <path d="M-4 16 L4 16 L0 24 Z" fill="#fde047" />
            </g>
          </g>
          <g transform={`translate(400 ${GROUND - 14})`}>
            {/* printed layer by layer: reveal from the bottom up */}
            <defs>
              <clipPath id="print-clip">
                <rect x="-46" y={-84 * s.progress - 2} width="92" height={84 * s.progress + 4} />
              </clipPath>
            </defs>
            <g clipPath="url(#print-clip)">
              <circle cx="0" cy="-40" r="40" fill="#cbd5e1" stroke="#475569" strokeWidth="4" />
              <path d="M-32 -54 L-20 -40 L-32 -26 M-12 -66 L0 -52 L-12 -38 M8 -66 L20 -52 L8 -38 M24 -50 L34 -40 L24 -30" stroke="#475569" strokeWidth="3" fill="none" />
            </g>
          </g>
          {s.danger > 0.7 && <SmokePuffs x={470} y={GROUND - 150} />}
          <Astronaut x={600} arm={s.progress >= 1 ? "wave" : "point"} />
        </>
      );
    case "deltaRock":
      return (
        <>
          <LayeredRock x={600} />
          <Rover x={360} moving={false} />
          <Astronaut x={548} legs="kneel" arm={working ? "work" : "down"} tool="drill" />
          {working && <Sparks x={570} y={GROUND - 22} />}
        </>
      );
    case "moonIce":
      return (
        <>
          <Rover x={170} moving={false} glow />
          {[[520, 14], [560, 18], [600, 12]].map(([x, sz], i) => (
            <path key={i} d={`M${x - sz} ${GROUND} L${x} ${GROUND - sz * 2.2} L${x + sz} ${GROUND} Z`} fill="#bae6fd" stroke="#e0f2fe" strokeWidth="2" style={loop("as-twinkle", 1, i * 0.3)} />
          ))}
          <Astronaut x={480} legs="kneel" arm={working ? "work" : "down"} tool="drill" headlamp />
          {working && <Sparks x={512} y={GROUND - 22} />}
          {working && <SandSpray x={520} y={GROUND - 6} up color="#e0f2fe" />}
        </>
      );
    case "dirtBags":
      return (
        <>
          <path d={`M520 ${GROUND} Q600 ${GROUND - 130} 700 ${GROUND} Z`} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="4" />
          {Array.from({ length: 8 }, (_, i) => {
            const shown = s.progress * 8 > i;
            const row = i < 4 ? 0 : 1;
            const x = 548 + (i % 4) * 36 + row * 18;
            return shown ? <rect key={i} x={x} y={GROUND - 22 - row * 22} width="34" height="22" rx="8" fill="#a8a29e" stroke="#57534e" strokeWidth="2" /> : null;
          })}
          <Rover x={150} moving={false} />
          <Astronaut x={400} arm={working ? "dig" : "down"} tool="shovel" />
          {working && <SandSpray x={430} y={GROUND - 6} up color="#d6d3d1" />}
        </>
      );
    case "heater":
      return (
        <>
          <rect x="250" y={GROUND - 170} width="300" height="170" rx="14" fill="#1e293b" stroke="#475569" strokeWidth="4" />
          <rect x="300" y={GROUND - 130} width="200" height="90" rx="10" fill={working ? "#f97316" : "#334155"} opacity={0.4 + s.progress * 0.6} style={working ? loop("as-glow", 0.5) : undefined} />
          {[330, 370, 410, 450].map((x) => (
            <rect key={x} x={x} y={GROUND - 125} width="12" height="80" rx="6" fill={working ? "#fdba74" : "#64748b"} />
          ))}
          <text x="400" y={GROUND - 145} textAnchor="middle" fontSize="22">{s.progress > 0.6 ? "😊" : "🥶"}</text>
          <Astronaut x={620} arm={working ? "work" : "cross"} shiver={!working && s.progress < 0.5} />
        </>
      );
    case "ice":
    default:
      return (
        <>
          <Rover x={170} moving={false} glow />
          <IceCrystals x={545} />
          <Astronaut x={470} arm={working ? "dig" : "down"} tool="shovel" headlamp shiver={s.danger > 0.5} />
          {working && <SandSpray x={505} y={GROUND - 4} up color="#e0f2fe" />}
        </>
      );
  }
}

function SmokePuffs({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 0.4, 0.8].map((d) => (
        <circle key={d} r="9" fill="#94a3b8" style={loop("as-smoke", 1.2, d, "ease-out")} />
      ))}
    </g>
  );
}

const DANGER_STYLE = {
  heat: { color: "bg-gradient-to-r from-amber-400 to-red-500", key: "heat", lock: "overheat" },
  cold: { color: "bg-gradient-to-r from-sky-300 to-indigo-500", key: "cold", lock: "tooCold" },
  tired: { color: "bg-gradient-to-r from-lime-300 to-orange-500", key: "tired", lock: "tooTired" },
  battery: { color: "bg-gradient-to-r from-amber-300 to-red-500", key: "batteryDrain", lock: "lowBattery" },
};

export function HoldGame({ cfg, p, feel, onFinish }) {
  const keys = useKeys();
  const btn = useRef(false);
  const tick = useTick();
  const g = useRef({ progress: 0, danger: 0, time: cfg.duration, lock: 0, lockouts: 0, done: false, holding: false });

  useLoop((dt) => {
    const s = g.current;
    if (s.done) return;
    s.time -= dt;
    if (s.lock > 0) s.lock -= dt;
    const holding = (btn.current || !!keys.current.Space) && s.lock <= 0;
    if (holding !== s.holding) feel.hum(holding, cfg.hum);
    s.holding = holding;
    if (holding) {
      s.progress = clamp(s.progress + cfg.work * dt);
      s.danger += cfg.dangerUp * dt;
    } else {
      s.danger = Math.max(0, s.danger - cfg.dangerDown * dt);
    }
    if (s.danger >= 1) {
      // Pushed too hard: forced break
      s.danger = 0.8;
      s.lock = 1.4;
      s.lockouts += 1;
      s.holding = false;
      feel.hum(false);
      feel.bump();
    }
    feel.set({ stress: clamp(s.danger * 0.85 + (s.time < 4 ? 0.25 : 0)), cold: cfg.danger === "cold" ? s.danger : cfg.env === "night" ? 0.3 : 0 });
    if (s.progress >= 1 || s.time <= 0) {
      s.done = true;
      feel.hum(false);
      const score = s.progress >= 1 ? clamp(0.6 + 0.4 * Math.min(1, s.time / (cfg.duration * 0.25)) - 0.12 * s.lockouts) : 0.4 * s.progress;
      setTimeout(() => onFinish(score), 900);
    }
    tick();
  });
  useEffect(() => () => feel.hum(false), [feel]);

  const s = g.current;
  const d = DANGER_STYLE[cfg.danger] || DANGER_STYLE.heat;
  return (
    <div className="relative">
      <Stage env={cfg.env === "garage" ? "garage" : cfg.env}>
        <HoldScene scene={cfg.scene} s={s} />
      </Stage>
      <div className="absolute top-2 inset-x-2 flex items-start justify-between gap-2">
        <Meter label={p.progress} value={s.progress} color="bg-emerald-400" />
        <Timer left={s.time} />
        <Meter label={p[d.key]} value={s.danger} color={d.color} warn={s.danger > 0.75} />
      </div>
      <Banner text={s.lock > 0 ? p[d.lock] : s.done && s.progress >= 1 ? p.done : null} tone={s.lock > 0 ? "rose" : "emerald"} />
      <div className="absolute bottom-3 right-3">
        <PadButton
          label={p.hold}
          onDown={() => (btn.current = true)}
          onUp={() => (btn.current = false)}
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full text-xl ${
            s.lock > 0 ? "bg-slate-600 border-slate-400 text-slate-300" : s.holding ? "bg-amber-300 border-white text-slate-950 scale-95" : "bg-amber-400 border-amber-200 text-slate-950"
          }`}
        >
          {p.hold}
        </PadButton>
      </div>
    </div>
  );
}

// =====================================================================
// 2) STEER — top-down drive, dodge obstacles in 3 lanes
// =====================================================================
const LANES = [115, 190, 265];
const ROVER_X = 150;

function TopRover({ y, hit }) {
  return (
    <g transform={`translate(${ROVER_X} ${y})`}>
      {[-28, 0, 28].map((wx) => (
        <g key={wx}>
          <rect x={wx - 9} y="-31" width="18" height="10" rx="3" fill="#0f172a" />
          <rect x={wx - 9} y="21" width="18" height="10" rx="3" fill="#0f172a" />
        </g>
      ))}
      <rect x="-40" y="-23" width="80" height="46" rx="9" fill={hit ? "#fecaca" : "#f8fafc"} stroke="#94a3b8" strokeWidth="2" />
      <rect x="-40" y="-4" width="80" height="8" fill="#f97316" />
      <rect x="-32" y="-18" width="42" height="36" rx="3" fill="#1d4ed8" opacity=".9" />
      <circle cx="24" cy="0" r="9" fill="#1e293b" />
      <circle cx="27" cy="-3" r="2.2" fill="#67e8f9" />
      <circle cx="27" cy="3" r="2.2" fill="#67e8f9" />
    </g>
  );
}

function Obstacle({ scene, x, y, hit }) {
  if (scene === "sharpRocks")
    return (
      <g transform={`translate(${x} ${y})`} opacity={hit ? 0.4 : 1}>
        <path d="M-26 14 L-14 -18 L-2 14 Z" fill="#7c2d12" stroke="#431407" strokeWidth="2" />
        <path d="M-6 16 L8 -24 L22 16 Z" fill="#9a3412" stroke="#431407" strokeWidth="2" />
        <path d="M10 18 L20 -6 L30 18 Z" fill="#7c2d12" stroke="#431407" strokeWidth="2" />
      </g>
    );
  if (scene === "ridge")
    return (
      <g transform={`translate(${x} ${y})`} opacity={hit ? 0.4 : 1}>
        <path d="M-32 0 L-22 -20 L0 -26 L24 -16 L32 4 L18 22 L-8 24 L-26 16 Z" fill="#1c0a05" stroke="#7c2d12" strokeWidth="3" />
      </g>
    );
  return (
    <g transform={`translate(${x} ${y})`} opacity={hit ? 0.4 : 1}>
      <ellipse rx="34" ry="22" fill="#fcd34d" opacity=".85" />
      <ellipse rx="22" ry="12" cy="-4" fill="#fde68a" />
    </g>
  );
}

function SteerScene({ cfg, s }) {
  const ground = cfg.env === "storm" ? "#8a4a2c" : "#c9824f";
  const devilX = 20 + Math.min(4, s.hits) * 22;
  return (
    <>
        <rect width="800" height="360" fill={ground} />
      {/* scrolling pebbles */}
      {Array.from({ length: 34 }, (_, i) => {
        const x = (((i * 137 - s.scroll) % 900) + 900) % 900 - 50;
        return <circle key={i} cx={x} cy={(i * 53) % 360} r={2 + (i % 3)} fill="#7c2d12" opacity=".5" />;
      })}
      {cfg.scene === "ridge" ? (
        <>
          <rect width="800" height="70" fill="#3b1a0e" />
          <rect y="300" width="800" height="60" fill="#3b1a0e" />
          <rect y="66" width="800" height="6" fill="#7c2d12" />
          <rect y="296" width="800" height="6" fill="#7c2d12" />
        </>
      ) : (
        [152, 228].map((y) =>
          Array.from({ length: 12 }, (_, i) => {
            const x = (((i * 80 - s.scroll) % 960) + 960) % 960 - 80;
            return <rect key={`${y}-${i}`} x={x} y={y - 2} width="40" height="4" rx="2" fill="#fde68a" opacity=".35" />;
          })
        )
      )}
      {s.obs.map((o) => (
        <Obstacle key={o.id} scene={cfg.scene} x={o.x} y={LANES[o.lane]} hit={o.hit} />
      ))}
      {/* dust trail */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={ROVER_X - 50 - i * 16} cy={s.y + ((i % 2) * 2 - 1) * 8} r={6 - i * 1.5} fill="#fde68a" opacity={0.5 - i * 0.12} />
      ))}
      <TopRover y={s.y} hit={s.flash > 0} />
      {cfg.scene === "devilChase" && (
        <g transform={`translate(${devilX} ${s.y})`}>
          <g style={loop("as-spin", 0.6, 0, "linear")}>
            {[44, 32, 20].map((r, i) => (
              <circle key={r} r={r} fill="none" stroke="#a8643f" strokeWidth="8" strokeDasharray={`${r} ${r / 2}`} opacity={0.5 + i * 0.15} />
            ))}
          </g>
        </g>
      )}
      {cfg.env === "storm" && <rect width="800" height="360" fill="#78350f" opacity={0.08 + (s.time / cfg.duration) * 0.35} />}
    </>
  );
}

export function SteerGame({ cfg, p, feel, onFinish }) {
  const keys = useKeys();
  const edge = useEdges();
  const tick = useTick();
  const g = useRef({ time: 0, lane: 1, y: LANES[1], obs: [], spawn: 0.8, hits: 0, scroll: 0, flash: 0, done: false, id: 0 });
  const move = (dir) => {
    const s = g.current;
    s.lane = clamp(s.lane + dir, 0, 2);
  };

  useLoop((dt) => {
    const s = g.current;
    if (s.done) return;
    s.time += dt;
    const speed = 270 * cfg.speed;
    s.scroll += speed * dt;
    if (edge("up", !!(keys.current.ArrowUp || keys.current.KeyW))) move(-1);
    if (edge("down", !!(keys.current.ArrowDown || keys.current.KeyS))) move(1);
    s.y += (LANES[s.lane] - s.y) * Math.min(1, dt * 12);

    s.spawn -= dt;
    if (s.spawn <= 0 && s.time < cfg.duration - 1.5) {
      s.spawn = (0.8 + Math.random() * 0.45) / cfg.speed;
      const free = Math.floor(Math.random() * 3);
      const lanes = [0, 1, 2].filter((l) => l !== free).sort(() => Math.random() - 0.5);
      const count = Math.random() < 0.4 ? 2 : 1;
      for (let i = 0; i < count; i++) s.obs.push({ id: s.id++, x: 880 + i * 30, lane: lanes[i], hit: false });
    }
    for (const o of s.obs) {
      o.x -= speed * dt;
      if (!o.hit && Math.abs(o.x - ROVER_X) < 50 && Math.abs(LANES[o.lane] - s.y) < 36) {
        o.hit = true;
        s.hits += 1;
        s.flash = 0.45;
        feel.bump();
      }
    }
    s.obs = s.obs.filter((o) => o.x > -80);
    s.flash = Math.max(0, s.flash - dt);
    feel.set({ stress: clamp(0.35 + s.hits * 0.13 + (s.flash > 0 ? 0.3 : 0)), cold: 0 });
    if (s.time >= cfg.duration) {
      s.done = true;
      setTimeout(() => onFinish(clamp(1 - s.hits * 0.2, 0.15, 1)), 700);
    }
    tick();
  });

  const s = g.current;
  return (
    <div className="relative">
      <Stage>
        <SteerScene cfg={cfg} s={s} />
      </Stage>
      <div className="absolute top-2 inset-x-2 flex items-start justify-between gap-2">
        <div className="px-2.5 py-1 rounded-full bg-slate-900/75 border border-white/20 text-xs font-extrabold text-white">
          💥 {p.bumps}: {s.hits}
        </div>
        <Timer left={cfg.duration - s.time} />
        {cfg.env === "storm" ? (
          <div className="px-2.5 py-1 rounded-full bg-rose-600/80 text-xs font-extrabold text-white">🌪️ {p.stormIn} {Math.max(0, Math.ceil(cfg.duration - s.time))}s</div>
        ) : (
          <span />
        )}
      </div>
      <Banner text={s.flash > 0.2 ? p.bump : s.done ? p.done : null} tone={s.done ? "emerald" : "rose"} />
      <div className="absolute right-3 inset-y-0 flex flex-col justify-center gap-3">
        <PadButton label="up" onDown={() => move(-1)} className="w-16 h-16 sm:w-20 sm:h-20 text-3xl bg-slate-900/85 border-white/30 text-white">
          ▲
        </PadButton>
        <PadButton label="down" onDown={() => move(1)} className="w-16 h-16 sm:w-20 sm:h-20 text-3xl bg-slate-900/85 border-white/30 text-white">
          ▼
        </PadButton>
      </div>
    </div>
  );
}

// =====================================================================
// 3) AIM — wobbly gloved hand: line up the crosshair and fire / tap
// =====================================================================
const AIM_TARGETS = {
  meteorite: [
    { x: 360, y: 170 },
    { x: 470, y: 232 },
    { x: 520, y: 150 },
  ],
  droneScrews: [
    { x: 292, y: 152 },
    { x: 508, y: 152 },
    { x: 292, y: 238 },
    { x: 508, y: 238 },
  ],
  valves: [
    { x: 250, y: 150 },
    { x: 400, y: 150 },
    { x: 550, y: 150 },
  ],
  switches: [
    { x: 280, y: 175 },
    { x: 360, y: 175 },
    { x: 440, y: 175 },
    { x: 520, y: 175 },
  ],
  // Alien treasure vault: four glowing lock gems around the door
  vault: [
    { x: 300, y: 110 },
    { x: 500, y: 110 },
    { x: 300, y: 250 },
    { x: 500, y: 250 },
  ],
};

// Background art for each aim scene
function AimArt({ scene }) {
  if (scene === "meteorite")
    return (
      <>
        <Hill x={180} w={560} h={120} />
        <g transform="translate(440 205) scale(5.2)">
          <path d="M-26 8 L-20 -16 L2 -24 L24 -12 L22 10 L-2 18 Z" fill="#475569" stroke="#cbd5e1" strokeWidth=".6" />
          <path d="M-12 -10 L4 -16 L14 -6" stroke="#94a3b8" strokeWidth=".8" fill="none" />
        </g>
        <Rover x={70} y={GROUND + 40} scale={0.7} moving={false} />
      </>
    );
  if (scene === "valves")
    return (
      <>
        {[250, 400, 550].map((x) => (
          <g key={x}>
            <rect x={x - 45} y="170" width="90" height="120" rx="40" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" />
            <rect x={x - 45} y="215" width="90" height="16" fill="#0ea5e9" />
            <rect x={x - 6} y="150" width="12" height="22" fill="#64748b" />
          </g>
        ))}
        <path d="M250 150 Q325 110 400 150 Q475 110 550 150" fill="none" stroke="#64748b" strokeWidth="6" />
      </>
    );
  if (scene === "switches")
    return (
      <>
        <rect x="220" y="110" width="360" height="140" rx="16" fill="#334155" stroke="#94a3b8" strokeWidth="4" />
        <text x="400" y="100" textAnchor="middle" fontSize="18" fontWeight="900" fill="#e2e8f0">🔌 LOW POWER</text>
        {[280, 360, 440, 520].map((x) => (
          <rect key={x} x={x - 22} y="150" width="44" height="60" rx="8" fill="#0f172a" />
        ))}
      </>
    );
  if (scene === "vault")
    return (
      <>
        <rect width="800" height="360" fill="#1e1b4b" />
        <rect x="250" y="60" width="300" height="240" rx="26" fill="#312e81" stroke="#a78bfa" strokeWidth="6" />
        <circle cx="400" cy="180" r="70" fill="#4c1d95" stroke="#c4b5fd" strokeWidth="6" />
        <path d="M400 125 L400 235 M345 180 L455 180 M361 141 L439 219 M439 141 L361 219" stroke="#c4b5fd" strokeWidth="5" />
        <circle cx="400" cy="180" r="18" fill="#fde047" style={loop("as-glow", 1.2)} />
        <text x="400" y="45" textAnchor="middle" fontSize="20" fontWeight="900" fill="#e9d5ff">💎 ??? VAULT ???</text>
      </>
    );
  return (
    <>
      <rect x="250" y="120" width="300" height="150" rx="22" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" />
      <rect x="330" y="160" width="140" height="70" rx="10" fill="#1e293b" />
      <circle cx="400" cy="195" r="22" fill="#38bdf8" stroke="#0f172a" strokeWidth="5" />
      <rect x="200" y="100" width="400" height="10" rx="5" fill="#1e293b" transform="rotate(-6 400 105)" />
    </>
  );
}

// What an un-hit target looks like in each scene
function AimTarget({ scene, x, y }) {
  if (scene === "vault")
    return (
      <g transform={`translate(${x} ${y})`}>
        <path d="M0 -20 L16 0 L0 20 L-16 0 Z" fill="#f0abfc" stroke="#a21caf" strokeWidth="3" style={loop("as-glow", 0.7)} />
      </g>
    );
  if (scene === "valves")
    return (
      <g transform={`translate(${x} ${y})`}>
        <circle r="18" fill="none" stroke="#ef4444" strokeWidth="6" style={loop("as-glow", 0.8)} />
        <path d="M-18 0 L18 0 M0 -18 L0 18" stroke="#ef4444" strokeWidth="5" />
      </g>
    );
  if (scene === "switches")
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x="-14" y="-22" width="28" height="22" rx="5" fill="#facc15" style={loop("as-glow", 0.6)} />
        <circle cy="14" r="5" fill="#22c55e" />
      </g>
    );
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="14" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
      <path d="M-8 0 L8 0 M0 -8 L0 8" stroke="#334155" strokeWidth="3" />
    </g>
  );
}

function AimScene({ cfg, s, cross }) {
  const targets = AIM_TARGETS[cfg.scene];
  const sequential = cfg.scene === "meteorite";
  return (
    <>
      <AimArt scene={cfg.scene} />
      {targets.map((tg, i) => {
        const hit = s.hits.includes(i);
        const active = !hit && (!sequential || i === s.hits.length);
        if (hit && sequential) return <circle key={i} cx={tg.x} cy={tg.y} r="10" fill="#22c55e" opacity=".8" />;
        if (hit) return null;
        return sequential ? (
          active && <circle key={i} cx={tg.x} cy={tg.y} r="16" fill="#fde047" opacity=".9" style={loop("as-twinkle", 0.7)} />
        ) : (
          <AimTarget key={i} scene={cfg.scene} x={tg.x} y={tg.y} />
        );
      })}
      {s.beam && <line x1="105" y1="260" x2={s.beam.x} y2={s.beam.y} stroke="#ef4444" strokeWidth="5" opacity=".9" />}
      {s.pops.map((pp, i) => (
        <g key={i} transform={`translate(${pp.x} ${pp.y - (0.8 - pp.life) * 50})`} opacity={pp.life}>
          <text fontSize="26" textAnchor="middle">{sequential ? "✨" : cfg.scene === "droneScrews" ? "🔩" : "✅"}</text>
        </g>
      ))}
      {/* wobbly crosshair */}
      <g transform={`translate(${cross.x} ${cross.y})`} pointerEvents="none">
        <circle r="22" fill="none" stroke="#f8fafc" strokeWidth="3" />
        <circle r="3" fill="#ef4444" />
        <path d="M-32 0 L-14 0 M14 0 L32 0 M0 -32 L0 -14 M0 14 L0 32" stroke="#f8fafc" strokeWidth="3" />
      </g>
    </>
  );
}

export function AimGame({ cfg, p, feel, onFinish }) {
  const keys = useKeys();
  const edge = useEdges();
  const tick = useTick();
  const svgRef = useRef(null);
  const g = useRef({ t: 0, aim: { x: 400, y: 200 }, shots: cfg.shots, hits: [], misses: 0, beam: null, pops: [], done: false, msg: null, msgT: 0 });
  const targets = AIM_TARGETS[cfg.scene];
  const sequential = cfg.scene === "meteorite";

  const toStage = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 800, y: ((e.clientY - r.top) / r.height) * 360 };
  };
  const wobble = (t) => ({
    x: (Math.sin(t * 1.7) + Math.sin(t * 3.3) * 0.4) * cfg.wobble,
    y: (Math.cos(t * 1.3) + Math.sin(t * 2.6) * 0.35) * cfg.wobble * 0.8,
  });

  const fire = () => {
    const s = g.current;
    if (s.done || s.shots <= 0) return;
    s.shots -= 1;
    const w = wobble(s.t);
    const cx = s.aim.x + w.x;
    const cy = s.aim.y + w.y;
    const open = targets.map((tg, i) => ({ ...tg, i })).filter((tg) => !s.hits.includes(tg.i) && (!sequential || tg.i === s.hits.length));
    const hit = open.find((tg) => Math.hypot(tg.x - cx, tg.y - cy) < 30);
    if (sequential) {
      s.beam = { x: cx, y: cy, life: 0.25 };
      feel.sound("zap");
    }
    if (hit) {
      s.hits.push(hit.i);
      s.pops.push({ x: hit.x, y: hit.y, life: 0.8 });
      s.msg = p.hit;
      feel.sound(sequential ? "success" : "click");
    } else {
      s.misses += 1;
      s.msg = p.miss;
      feel.sound("miss");
    }
    s.msgT = 0.6;
  };

  useLoop((dt) => {
    const s = g.current;
    if (s.done) return;
    s.t += dt;
    const k = keys.current;
    const v = 320 * dt;
    if (k.ArrowLeft || k.KeyA) s.aim.x -= v;
    if (k.ArrowRight || k.KeyD) s.aim.x += v;
    if (k.ArrowUp || k.KeyW) s.aim.y -= v;
    if (k.ArrowDown || k.KeyS) s.aim.y += v;
    s.aim.x = clamp(s.aim.x, 20, 780);
    s.aim.y = clamp(s.aim.y, 20, 340);
    if (edge("fire", !!k.Space)) fire();
    if (s.beam) {
      s.beam.life -= dt;
      if (s.beam.life <= 0) s.beam = null;
    }
    s.pops.forEach((pp) => (pp.life -= dt));
    s.pops = s.pops.filter((pp) => pp.life > 0);
    s.msgT -= dt;
    feel.set({ stress: clamp(0.3 + s.misses * 0.08 + (s.t > cfg.duration - 4 ? 0.25 : 0)), cold: 0 });
    if (s.hits.length >= targets.length || s.shots <= 0 || s.t >= cfg.duration) {
      s.done = true;
      const score = clamp(s.hits.length / targets.length - s.misses * 0.05 + (s.hits.length >= targets.length ? 0.1 : 0));
      setTimeout(() => onFinish(score), 900);
    }
    tick();
  });

  const s = g.current;
  const w = wobble(s.t);
  const cross = { x: s.aim.x + w.x, y: s.aim.y + w.y };
  return (
    <div className="relative">
      <Stage
        env={cfg.env}
        svgRef={svgRef}
        cursor="none"
        onPointerMove={(e) => {
          g.current.aim = toStage(e);
        }}
        onPointerDown={(e) => {
          g.current.aim = toStage(e);
          fire();
        }}
      >
        <AimScene cfg={cfg} s={s} cross={cross} />
      </Stage>
      <div className="absolute top-2 inset-x-2 flex items-start justify-between gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-full bg-slate-900/75 border border-white/20 text-xs font-extrabold text-white">
          🎯 {s.hits.length}/{targets.length}
        </div>
        <Timer left={cfg.duration - s.t} />
        <div className="px-2.5 py-1 rounded-full bg-slate-900/75 border border-white/20 text-xs font-extrabold text-amber-200">
          {sequential ? "🔋" : "🔧"} {p.shotsLeft}: {s.shots}
        </div>
      </div>
      <Banner text={s.done ? p.done : s.msgT > 0 ? s.msg : null} tone={s.done || s.msg === p.hit ? "emerald" : "amber"} />
    </div>
  );
}

// =====================================================================
// 4) BALANCE — keep the needle in the green zone (slippery slope / wobbly drone)
// =====================================================================
// Point + slope angle on the Hill's quadratic curve (same maths as <Hill>)
function onHill(x, w, h, u) {
  const p0 = [x, GROUND];
  const c = [x + w * 0.45, GROUND - h * 1.25];
  const p1 = [x + w * 0.62, GROUND - h];
  const px = (1 - u) ** 2 * p0[0] + 2 * u * (1 - u) * c[0] + u * u * p1[0];
  const py = (1 - u) ** 2 * p0[1] + 2 * u * (1 - u) * c[1] + u * u * p1[1];
  const dx = 2 * (1 - u) * (c[0] - p0[0]) + 2 * u * (p1[0] - c[0]);
  const dy = 2 * (1 - u) * (c[1] - p0[1]) + 2 * u * (p1[1] - c[1]);
  return { px, py, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

function BalanceScene({ scene, s }) {
  const v = s.v;
  if (scene === "climb") {
    const { px, py } = onHill(300, 460, 150, 0.08 + 0.82 * s.progress);
    return (
      <>
        <Hill x={300} w={460} h={150} />
        <Meteorite x={572} y={GROUND - 148} />
        <Rover x={160} moving={false} />
        <g transform={`translate(${px} ${py}) rotate(${v * 28})`}>
          <Astronaut x={0} y={0} legs="walk" arm={Math.abs(v) > 0.6 ? "up" : "look"} tool="magnifier" />
        </g>
      </>
    );
  }
  if (scene === "roverSlope") {
    const { px, py, angle } = onHill(250, 500, 140, 0.1 + 0.75 * s.progress);
    return (
      <>
        <Hill x={250} w={500} h={140} />
        {s.progress < 1 && <Meteorite x={555} y={GROUND - 128} />}
        <g transform={`translate(${px} ${py}) rotate(${angle * 0.8 + v * 12})`}>
          <Rover x={0} y={0} />
          {Math.abs(v) > 0.55 && <SandSpray x={-70} y={-10} />}
        </g>
      </>
    );
  }
  if (scene === "seesaw") {
    // Heat on one side, air on the other: keep the seesaw level
    return (
      <>
        <path d={`M380 ${GROUND} L400 ${GROUND - 50} L420 ${GROUND} Z`} fill="#64748b" />
        <g transform={`translate(400 ${GROUND - 50}) rotate(${v * 22})`}>
          <rect x="-230" y="-8" width="460" height="14" rx="7" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <g transform="translate(-190 -10)">
            <rect x="-34" y="-60" width="68" height="60" rx="10" fill="#f97316" />
            <text x="0" y="-20" textAnchor="middle" fontSize="30">🔥</text>
          </g>
          <g transform="translate(190 -10)">
            <rect x="-34" y="-60" width="68" height="60" rx="10" fill="#0ea5e9" />
            <text x="0" y="-20" textAnchor="middle" fontSize="30">🫁</text>
          </g>
        </g>
        <text x="400" y={GROUND - 150} textAnchor="middle" fontSize="26">{Math.abs(v) < 0.35 ? "😊" : "😬"}</text>
      </>
    );
  }
  // droneRoof: driving home with Hopper strapped on top
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={(((i * 97 - s.t * 220) % 820) + 820) % 820} cy={GROUND + 20 + (i % 3) * 14} r="3" fill="#7c2d12" opacity=".6" />
      ))}
      <Rover x={380} bodyStyle={{ transform: `rotate(${v * 4}deg)`, transformBox: "fill-box", transformOrigin: "50% 100%" }}>
        <g transform={`translate(${v * 34} -74) rotate(${v * 26})`}>
          <Drone x={0} y={0} broken />
        </g>
      </Rover>
    </>
  );
}

export function BalanceGame({ cfg, p, feel, onFinish }) {
  const keys = useKeys();
  const tick = useTick();
  const btn = useRef({ left: false, right: false });
  const g = useRef({ t: 0, v: 0, gust: 0, gustT: 0, inZone: 0, progress: 0, slips: 0, slipT: 0, done: false });

  useLoop((dt) => {
    const s = g.current;
    if (s.done) return;
    s.t += dt;
    s.gustT -= dt;
    if (s.gustT <= 0) {
      s.gust = (Math.random() * 2 - 1) * cfg.drift;
      s.gustT = 0.7 + Math.random() * 0.8;
    }
    const k = keys.current;
    const control = (k.ArrowRight || k.KeyD || btn.current.right ? 1 : 0) - (k.ArrowLeft || k.KeyA || btn.current.left ? 1 : 0);
    // Gusts push the needle; being off-centre makes it tip further (like a real wobble)
    s.v += (s.gust * 0.9 + control * 1.8 + s.v * 0.35) * dt;
    if (Math.abs(s.v) < 0.35) s.inZone += dt;
    if (Math.abs(s.v) >= 1) {
      s.slips += 1;
      s.slipT = 0.8;
      s.v = Math.sign(s.v) * 0.45;
      s.inZone = Math.max(0, s.inZone - 1);
      feel.bump();
    }
    s.slipT -= dt;
    s.progress = clamp(s.inZone / cfg.need);
    feel.set({ stress: clamp(Math.abs(s.v) * 0.75 + (s.slipT > 0 ? 0.3 : 0)), cold: 0 });
    if (s.progress >= 1 || s.t >= cfg.duration) {
      s.done = true;
      const score = s.progress >= 1 ? clamp(0.65 + 0.35 * clamp((cfg.duration - s.t) / 4) - 0.15 * s.slips) : 0.5 * s.progress;
      setTimeout(() => onFinish(score), 900);
    }
    tick();
  });

  const s = g.current;
  const side = (dir, on) => {
    btn.current[dir] = on;
  };
  return (
    <div className="relative">
      <Stage env={cfg.env}>
        <BalanceScene scene={cfg.scene} s={s} />
      </Stage>
      <div className="absolute top-2 inset-x-2 flex items-start justify-between gap-2">
        <Meter label={p.progress} value={s.progress} color="bg-emerald-400" />
        <Timer left={cfg.duration - s.t} />
        <div className="px-2.5 py-1 rounded-full bg-slate-900/75 border border-white/20 text-xs font-extrabold text-white">
          ⚠️ {p.slips}: {s.slips}
        </div>
      </div>
      <Banner text={s.slipT > 0 ? p.slip : s.done ? p.done : null} tone={s.done ? "emerald" : "rose"} />
      <div className="absolute bottom-3 inset-x-3 flex items-center gap-3">
        <PadButton label="left" onDown={() => side("left", true)} onUp={() => side("left", false)} className="w-16 h-16 sm:w-20 sm:h-20 text-3xl bg-slate-900/85 border-white/30 text-white">
          ◀
        </PadButton>
        <div className="relative flex-1 h-8 rounded-full bg-rose-500/70 border-2 border-white/40 overflow-hidden">
          <div className="absolute inset-y-0 left-[32.5%] right-[32.5%] bg-emerald-400/90" />
          <div className="absolute inset-y-0 w-2 -ml-1 bg-white shadow-[0_0_10px_white]" style={{ left: `${((clamp(s.v, -1, 1) + 1) / 2) * 100}%` }} />
        </div>
        <PadButton label="right" onDown={() => side("right", true)} onUp={() => side("right", false)} className="w-16 h-16 sm:w-20 sm:h-20 text-3xl bg-slate-900/85 border-white/30 text-white">
          ▶
        </PadButton>
      </div>
    </div>
  );
}

// =====================================================================
// 5) BREATHE — stay calm: hold while the circle grows, let go while it shrinks
// =====================================================================
function BreatheScene({ cfg, s, prog }) {
  return (
    <>
        {cfg.scene === "camp" ? (
        <>
          <rect width="800" height="360" fill="url(#sunrise-camp)" opacity={prog} />
          <defs>
            <linearGradient id="sunrise-camp" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#fdba74" />
              <stop offset=".6" stopColor="#f472b6" stopOpacity=".6" />
              <stop offset="1" stopColor="#1e1b4b" stopOpacity=".2" />
            </linearGradient>
          </defs>
          <rect y={GROUND} width="800" height="70" fill="#7c2d12" />
          <Rover x={330} moving={false} glow />
          <IceCrystals x={600} />
          <text x="390" y={GROUND - 140} fontSize="26" style={loop("as-twinkle", 2)}>
            💤
          </text>
        </>
      ) : (
        <>
          <Rover x={210} moving={false}>
            {s.done && (
              <g style={anim("as-appear", 0.4)}>
                <text x="-30" y="-74" fontSize="18">✨</text>
                <text x="10" y="-78" fontSize="14">✨</text>
              </g>
            )}
          </Rover>
          <path d={`M300 ${GROUND} Q320 ${GROUND - 120} 400 ${GROUND - 130} Q470 ${GROUND - 120} 480 ${GROUND} Z`} fill="#7c2d12" />
          <Astronaut x={300} legs="kneel" arm="cross" scale={0.95} />
          <DustDevil x={900 - 1150 * prog} />
        </>
      )}
    </>
  );
}

export function BreatheGame({ cfg, p, feel, onFinish }) {
  const keys = useKeys();
  const tick = useTick();
  const btn = useRef(false);
  const total = cfg.period * cfg.cycles;
  const g = useRef({ t: 0, sync: 0, measured: 0, lastHalf: -1, done: false, whooshed: false });

  useLoop((dt) => {
    const s = g.current;
    if (s.done) return;
    s.t += dt;
    const phase = (s.t % cfg.period) / cfg.period;
    const inhale = phase < 0.5;
    const local = (phase % 0.5) / 0.5;
    const half = Math.floor(s.t / (cfg.period / 2));
    if (half !== s.lastHalf) {
      s.lastHalf = half;
      if (inhale) feel.sound("breath");
    }
    const held = btn.current || !!keys.current.Space;
    if (local > 0.15) {
      s.measured += dt;
      if (held === inhale) s.sync += dt;
    }
    const rate = s.measured > 0 ? s.sync / s.measured : 0.5;
    if (cfg.scene === "hide" && !s.whooshed && s.t > total * 0.45) {
      s.whooshed = true;
      feel.sound("whoosh");
      feel.bump();
    }
    feel.set({ stress: clamp(0.9 - rate * 0.6 - (s.t / total) * 0.3), cold: cfg.env === "night" ? clamp(0.6 - (s.t / total) * 0.5) : 0, ownBreath: true });
    if (s.t >= total) {
      s.done = true;
      setTimeout(() => onFinish(clamp(rate / 0.85)), 900);
    }
    tick();
  });

  const s = g.current;
  const phase = (s.t % cfg.period) / cfg.period;
  const inhale = phase < 0.5;
  const local = (phase % 0.5) / 0.5;
  const ease = (x) => 0.5 - Math.cos(Math.PI * x) / 2;
  const size = inhale ? 0.45 + 0.55 * ease(local) : 1 - 0.55 * ease(local);
  const prog = clamp(s.t / total);
  const rate = s.measured > 0 ? s.sync / s.measured : 0;

  return (
    <div className="relative">
      <Stage env={cfg.env}>
        <BreatheScene cfg={cfg} s={s} prog={prog} />
      </Stage>
      {/* breathing guide */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`rounded-full border-4 flex items-center justify-center text-center ${inhale ? "border-cyan-200 bg-cyan-400/25" : "border-violet-200 bg-violet-400/20"}`}
          style={{ width: `${size * 38}%`, aspectRatio: "1 / 1" }}
        >
          <span className="font-display text-base sm:text-2xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] px-2">
            {inhale ? p.breatheIn : p.breatheOut}
          </span>
        </div>
      </div>
      <div className="absolute top-2 inset-x-2 flex items-start justify-between gap-2">
        <Meter label={p.calm} value={rate} color="bg-cyan-300" />
        <Timer left={total - s.t} />
        <span />
      </div>
      <Banner text={s.done ? p.done : null} tone="emerald" />
      <div className="absolute bottom-3 right-3">
        <PadButton
          label={p.hold}
          onDown={() => (btn.current = true)}
          onUp={() => (btn.current = false)}
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full text-lg ${btn.current ? "bg-cyan-300 border-white text-slate-950" : "bg-cyan-400/90 border-cyan-100 text-slate-950"}`}
        >
          {p.hold}
        </PadButton>
      </div>
    </div>
  );
}

// =====================================================================
// 6) RHYTHM — rock the rover: ← → ← → to scrape ice
// =====================================================================
function RhythmScene({ s }) {
  return (
    <>
        <IceCrystals x={580} />
      <Rover x={380} moving={s.chipT > 0} bodyStyle={{ transform: `translateX(${s.rock * 16}px)`, transition: "transform .15s" }}>
        <g opacity={s.frost}>
          {[-52, 0, 52].map((wx) => (
            <circle key={wx} cx={wx} cy={-17} r="19" fill="none" stroke="#e0f2fe" strokeWidth="4" strokeDasharray="4 3" />
          ))}
        </g>
      </Rover>
      {s.chipT > 0 && (
        <>
          <SandSpray x={330} y={GROUND - 8} up color="#e0f2fe" />
          <SandSpray x={430} y={GROUND - 8} up color="#e0f2fe" />
        </>
      )}
    </>
  );
}

export function RhythmGame({ cfg, p, feel, onFinish }) {
  const keys = useKeys();
  const edge = useEdges();
  const tick = useTick();
  const g = useRef({ t: 0, progress: 0, last: null, mistakes: 0, frost: 0.1, rock: 0, chipT: 0, slipT: 0, done: false });

  const press = (side) => {
    const s = g.current;
    if (s.done) return;
    if (side !== s.last) {
      s.progress = clamp(s.progress + 1 / cfg.need);
      s.last = side;
      s.rock = side === "L" ? -1 : 1;
      s.chipT = 0.35;
      feel.sound("click");
    } else {
      s.mistakes += 1;
      s.slipT = 0.6;
      s.frost = clamp(s.frost + 0.06);
      feel.bump();
    }
  };

  useLoop((dt) => {
    const s = g.current;
    if (s.done) return;
    s.t += dt;
    const k = keys.current;
    if (edge("L", !!(k.ArrowLeft || k.KeyA))) press("L");
    if (edge("R", !!(k.ArrowRight || k.KeyD))) press("R");
    s.frost = clamp(s.frost + dt * 0.035);
    s.chipT -= dt;
    s.slipT -= dt;
    feel.set({ stress: clamp(0.3 + s.mistakes * 0.08 + (s.slipT > 0 ? 0.25 : 0)), cold: s.frost });
    if (s.progress >= 1 || s.t >= cfg.duration) {
      s.done = true;
      const score = s.progress >= 1 ? clamp(0.7 + 0.3 * clamp((cfg.duration - s.t) / 3) - s.mistakes * 0.05) : s.progress * 0.6;
      setTimeout(() => onFinish(score), 900);
    }
    tick();
  });

  const s = g.current;
  const next = s.last === "L" ? "R" : s.last === "R" ? "L" : null;
  return (
    <div className="relative">
      <Stage env={cfg.env}>
        <RhythmScene s={s} />
      </Stage>
      <div className="absolute top-2 inset-x-2 flex items-start justify-between gap-2">
        <Meter label={p.progress} value={s.progress} color="bg-emerald-400" />
        <Timer left={cfg.duration - s.t} />
        <Meter label={p.cold} value={s.frost} color="bg-gradient-to-r from-sky-300 to-indigo-500" warn={s.frost > 0.7} />
      </div>
      <Banner text={s.slipT > 0 ? p.slip : s.done ? p.done : null} tone={s.done ? "emerald" : "rose"} />
      <div className="absolute bottom-3 inset-x-3 flex justify-between">
        {["L", "R"].map((side) => (
          <PadButton
            key={side}
            label={side === "L" ? "left" : "right"}
            onDown={() => press(side)}
            className={`w-20 h-20 sm:w-24 sm:h-24 text-4xl text-white ${next === side ? "bg-amber-400 border-white text-slate-950 animate-pulse" : "bg-slate-900/85 border-white/30"}`}
          >
            {side === "L" ? "◀" : "▶"}
          </PadButton>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// 7) DRAG — Water Drops: drag drops into the recycler (or water the plant beds)
// =====================================================================
const DROP_KINDS = {
  recycler: [
    { key: "washing", icon: "🧼" },
    { key: "sweat", icon: "💦" },
    { key: "breath", icon: "😮‍💨" },
  ],
  plants: [{ key: "tank", icon: "🛢️" }],
};
const DRAG_TARGET = { x: 0.75, y: 0.52 }; // fraction of the stage

function DragScene({ cfg, gauge, splash }) {
  const pct = clamp(gauge / 100);
  if (cfg.scene === "plants") {
    return (
      <>
        {[60, 130].map((x) => (
          <g key={x} transform={`translate(${x} ${GROUND})`}>
            <rect x="-26" y="-110" width="52" height="110" rx="10" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" />
            <rect x="-26" y="-60" width="52" height="14" fill="#0ea5e9" />
          </g>
        ))}
        <g transform={`translate(600 ${GROUND})`}>
          <rect x="-110" y="-40" width="220" height="40" rx="8" fill="#78350f" />
          {[-80, -40, 0, 40, 80].map((x, i) => {
            const h = 10 + pct * 70 * (0.7 + (i % 2) * 0.3);
            return (
              <g key={x} transform={`translate(${x} -40)`}>
                <rect x="-3" y={-h} width="6" height={h} fill="#16a34a" />
                <ellipse cx="-10" cy={-h + 8} rx="12" ry="6" fill="#22c55e" />
                <ellipse cx="10" cy={-h + 16} rx="12" ry="6" fill="#4ade80" />
              </g>
            );
          })}
          {splash > 0 && <text x="0" y="-120" textAnchor="middle" fontSize="30">💧</text>}
        </g>
      </>
    );
  }
  // Water recycler machine with a big gauge
  return (
    <g transform="translate(600 0)">
      <rect x="-90" y="70" width="180" height="220" rx="18" fill="#e2e8f0" stroke="#64748b" strokeWidth="4" />
      <rect x="-70" y="95" width="140" height="150" rx="10" fill="#0f172a" />
      <rect x="-70" y={245 - 150 * pct} width="140" height={150 * pct} rx="8" fill="#38bdf8" opacity=".85" />
      <line x1="-70" y1={245 - 150 * 0.98} x2="70" y2={245 - 150 * 0.98} stroke="#facc15" strokeWidth="3" strokeDasharray="6 4" />
      <text x="0" y="60" textAnchor="middle" fontSize="20" fontWeight="900" fill="#e0f2fe">
        ♻️ {Math.round(gauge)}%
      </text>
      {splash > 0 && <circle cx="0" cy="110" r="40" fill="#7dd3fc" opacity={splash} />}
      <rect x="-30" y="260" width="60" height="16" rx="4" fill="#22c55e" style={loop("as-twinkle", 0.8)} />
    </g>
  );
}

export function DragGame({ cfg, p, feel, onFinish }) {
  const tick = useTick();
  const areaRef = useRef(null);
  const kinds = DROP_KINDS[cfg.scene] || DROP_KINDS.recycler;
  const make = (s) => {
    const k = kinds[s.id % kinds.length];
    // tidy slots so new drops never land on top of each other
    const slots = [[0.12, 0.3], [0.3, 0.42], [0.14, 0.66], [0.32, 0.72], [0.22, 0.2]];
    const free = slots.filter(([x, y]) => !s.drops.some((d) => Math.hypot(d.x - x, d.y - y) < 0.1));
    const [x, y] = free.length ? free[s.id % free.length] : slots[s.id % slots.length];
    s.drops.push({ id: s.id++, x, y, kind: k });
  };
  const g = useRef(null);
  if (!g.current) {
    g.current = { t: 0, gauge: cfg.start || 0, drops: [], id: 0, drag: null, done: false, splash: 0 };
    for (let i = 0; i < 3; i++) make(g.current);
  }

  useLoop((dt) => {
    const s = g.current;
    if (s.done) return;
    s.t += dt;
    s.splash = Math.max(0, s.splash - dt * 2);
    feel.set({ stress: clamp(0.25 + (s.t / cfg.duration) * 0.45), cold: 0 });
    if (s.gauge >= cfg.goal || s.t >= cfg.duration) {
      s.done = true;
      const score = s.gauge >= cfg.goal ? clamp(0.6 + 0.4 * Math.min(1, (cfg.duration - s.t) / (cfg.duration * 0.35))) : 0.5 * (s.gauge / cfg.goal);
      setTimeout(() => onFinish(score), 900);
    }
    tick();
  });

  const toFrac = (e) => {
    const r = areaRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };
  const deliver = (d) => {
    const s = g.current;
    s.drops = s.drops.filter((x) => x.id !== d.id);
    s.gauge = Math.min(cfg.goal, s.gauge + cfg.step);
    s.splash = 1;
    feel.sound("click");
    if (s.gauge < cfg.goal) make(s);
  };
  const onDown = (d) => (e) => {
    e.preventDefault();
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* pointer already gone */ }
    g.current.drag = { id: d.id, moved: false };
  };
  const onMove = (d) => (e) => {
    const s = g.current;
    if (!s.drag || s.drag.id !== d.id) return;
    const f = toFrac(e);
    d.x = clamp(f.x, 0.02, 0.98);
    d.y = clamp(f.y, 0.05, 0.95);
    s.drag.moved = true;
  };
  const onUp = (d) => () => {
    const s = g.current;
    if (!s.drag || s.drag.id !== d.id) return;
    const near = Math.hypot((d.x - DRAG_TARGET.x) * 2.2, d.y - DRAG_TARGET.y) < 0.3;
    // a plain tap also sends the drop (easier for little fingers)
    if (near || !s.drag.moved) deliver(d);
    s.drag = null;
  };

  const s = g.current;
  return (
    <div className="relative" ref={areaRef}>
      <Stage env={cfg.env}>
        <DragScene cfg={cfg} gauge={s.gauge} splash={s.splash} />
      </Stage>
      {s.drops.map((d) => (
        <button
          key={d.id}
          type="button"
          aria-label={p.drops[d.kind.key]}
          onPointerDown={onDown(d)}
          onPointerMove={onMove(d)}
          onPointerUp={onUp(d)}
          onPointerCancel={() => (g.current.drag = null)}
          style={{ left: `${d.x * 100}%`, top: `${d.y * 100}%`, touchAction: "none" }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none cursor-grab active:cursor-grabbing"
        >
          <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-sky-400/90 border-4 border-white flex items-center justify-center text-2xl shadow-[0_6px_16px_rgba(14,165,233,0.6)]" style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}>
            {d.kind.icon}
          </span>
          <span className="mt-0.5 px-1.5 rounded bg-slate-900/80 text-[10px] font-extrabold text-white">{p.drops[d.kind.key]}</span>
        </button>
      ))}
      <div className="absolute top-2 inset-x-2 flex items-start justify-between gap-2 pointer-events-none">
        <Meter label={p.gauge} value={s.gauge / 100} color="bg-sky-400" />
        <Timer left={cfg.duration - s.t} />
        <div className="px-2.5 py-1 rounded-full bg-slate-900/75 border border-white/20 text-xs font-extrabold text-amber-200">🎯 {cfg.goal}%</div>
      </div>
      <Banner text={s.done && s.gauge >= cfg.goal ? p.done : null} tone="emerald" />
    </div>
  );
}

// =====================================================================
// 8) SWIPE — Dust Brush: wipe the sticky Moon dust off the solar panel
// =====================================================================
const PANEL = { x: 0.24, y: 0.27, w: 0.52, h: 0.42 }; // fraction of the stage

function SwipeScene({ clean }) {
  return (
    <>
      <circle cx="120" cy="70" r="30" fill="#fde047" opacity={0.3 + clean * 0.7} />
      {clean > 0.3 && <text x="120" y="80" textAnchor="middle" fontSize="28" opacity={clean}>☀️</text>}
      <g>
        <rect x={PANEL.x * 800} y={PANEL.y * 360} width={PANEL.w * 800} height={PANEL.h * 360} rx="8" fill="#1d4ed8" stroke="#cbd5e1" strokeWidth="6" />
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`v${i}`} x1={PANEL.x * 800 + ((i + 1) * PANEL.w * 800) / 8} y1={PANEL.y * 360} x2={PANEL.x * 800 + ((i + 1) * PANEL.w * 800) / 8} y2={(PANEL.y + PANEL.h) * 360} stroke="#60a5fa" strokeWidth="2" />
        ))}
        {Array.from({ length: 3 }, (_, i) => (
          <line key={`h${i}`} x1={PANEL.x * 800} y1={PANEL.y * 360 + ((i + 1) * PANEL.h * 360) / 4} x2={(PANEL.x + PANEL.w) * 800} y2={PANEL.y * 360 + ((i + 1) * PANEL.h * 360) / 4} stroke="#60a5fa" strokeWidth="2" />
        ))}
        <rect x="390" y={(PANEL.y + PANEL.h) * 360} width="20" height="50" fill="#94a3b8" />
      </g>
      <Astronaut x={700} arm="up" tool="shovel" />
    </>
  );
}

export function SwipeGame({ cfg, p, feel, onFinish }) {
  const tick = useTick();
  const canvasRef = useRef(null);
  const g = useRef({ t: 0, clean: 0, done: false, drawing: false, last: null, lastSound: 0 });

  // Paint a layer of grey Moon dust over the panel
  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#a8a29e";
    ctx.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = ["#78716c", "#d6d3d1", "#57534e", "#e7e5e4"][i % 4];
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(Math.random() * c.width, Math.random() * c.height, 1 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, []);

  const measure = () => {
    const c = canvasRef.current;
    const data = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 64) {
      total++;
      if (data[i] < 40) clear++;
    }
    return clear / total;
  };

  const wipe = (e) => {
    const s = g.current;
    if (!s.drawing || s.done) return;
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * c.width;
    const y = ((e.clientY - r.top) / r.height) * c.height;
    const ctx = c.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineWidth = 46;
    ctx.beginPath();
    ctx.moveTo(s.last ? s.last.x : x, s.last ? s.last.y : y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    s.last = { x, y };
    if (performance.now() - s.lastSound > 180) {
      s.lastSound = performance.now();
      feel.sound("tick");
    }
  };

  useLoop((dt) => {
    const s = g.current;
    if (s.done) return;
    s.t += dt;
    s.measureT = (s.measureT || 0) + dt;
    if (s.measureT > 0.2) {
      s.measureT = 0;
      s.clean = measure();
    }
    feel.set({ stress: clamp(0.3 + (s.t / cfg.duration) * 0.4), cold: 0 });
    if (s.clean >= cfg.goal || s.t >= cfg.duration) {
      s.done = true;
      const score = s.clean >= cfg.goal ? clamp(0.6 + 0.4 * Math.min(1, (cfg.duration - s.t) / (cfg.duration * 0.35))) : 0.6 * (s.clean / cfg.goal);
      setTimeout(() => onFinish(score), 900);
    }
    tick();
  });

  const s = g.current;
  return (
    <div className="relative">
      <Stage env={cfg.env}>
        <SwipeScene clean={s.clean} />
      </Stage>
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        onPointerDown={(e) => {
          try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* pointer already gone */ }
          g.current.drawing = true;
          g.current.last = null;
          wipe(e);
        }}
        onPointerMove={wipe}
        onPointerUp={() => (g.current.drawing = false)}
        onPointerCancel={() => (g.current.drawing = false)}
        className="absolute rounded-md cursor-crosshair"
        style={{ left: `${PANEL.x * 100}%`, top: `${PANEL.y * 100}%`, width: `${PANEL.w * 100}%`, height: `${PANEL.h * 100}%`, touchAction: "none" }}
      />
      <div className="absolute top-2 inset-x-2 flex items-start justify-between gap-2 pointer-events-none">
        <Meter label={p.clean} value={s.clean / cfg.goal} color="bg-amber-300" />
        <Timer left={cfg.duration - s.t} />
        <span />
      </div>
      {!s.done && s.clean < 0.05 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
          <span className="px-3 py-1.5 rounded-full bg-slate-900/80 text-sm font-extrabold text-white animate-pulse">👆 {p.swipeHint}</span>
        </div>
      )}
      <Banner text={s.done && s.clean >= cfg.goal ? p.done : null} tone="emerald" />
    </div>
  );
}

// =====================================================================
// 9) TAP TIMING — DONKI storm meter: tap the moment the line jumps
// =====================================================================
const SCREEN = { x: 110, y: 80, w: 580, h: 180 };

function TapScene({ samples, active, flash }) {
  const pts = samples
    .map((v, i) => `${SCREEN.x + (i / (samples.length - 1)) * SCREEN.w},${SCREEN.y + SCREEN.h / 2 - v * (SCREEN.h * 0.42)}`)
    .join(" ");
  return (
    <>
      <rect x={SCREEN.x - 14} y={SCREEN.y - 34} width={SCREEN.w + 28} height={SCREEN.h + 52} rx="16" fill="#1e293b" stroke="#64748b" strokeWidth="4" />
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="8" fill={flash > 0 ? "#14532d" : active ? "#450a0a" : "#020617"} />
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={SCREEN.x} y1={SCREEN.y + SCREEN.h * f} x2={SCREEN.x + SCREEN.w} y2={SCREEN.y + SCREEN.h * f} stroke="#1e3a5f" strokeWidth="1" />
      ))}
      <polyline points={pts} fill="none" stroke={active ? "#f87171" : "#4ade80"} strokeWidth="3.5" strokeLinejoin="round" />
      <text x={SCREEN.x + 6} y={SCREEN.y - 12} fontSize="15" fontWeight="900" fill="#e2e8f0">
        📡 NASA DONKI
      </text>
      {active && (
        <text x={SCREEN.x + SCREEN.w - 6} y={SCREEN.y - 12} textAnchor="end" fontSize="15" fontWeight="900" fill="#f87171" style={loop("as-twinkle", 0.3)}>
          ⚠ CME!
        </text>
      )}
    </>
  );
}

function stormValue(t, spikes) {
  let v = Math.sin(t * 9) * 0.05 + Math.sin(t * 23) * 0.03;
  for (const sp of spikes) {
    const u = t - sp.at;
    if (u >= 0 && u < 1) v += Math.sin(u * Math.PI) * (0.75 + Math.sin(u * 40) * 0.2);
  }
  return v;
}

export function TapTimingGame({ cfg, p, feel, onFinish }) {
  const keys = useKeys();
  const edge = useEdges();
  const tick = useTick();
  const g = useRef(null);
  if (!g.current) {
    const spikes = [];
    let at = 2.2;
    for (let i = 0; i < cfg.spikes; i++) {
      at += Math.random() * 1.5;
      spikes.push({ at, hit: false, missed: false });
      at += 2.6;
    }
    g.current = { t: 0, samples: Array(90).fill(0), spikes, hits: 0, misses: 0, flash: 0, msg: null, msgT: 0, done: false };
  }

  const tap = () => {
    const s = g.current;
    if (s.done) return;
    const sp = s.spikes.find((x) => !x.hit && s.t >= x.at && s.t < x.at + 1);
    if (sp) {
      sp.hit = true;
      s.hits += 1;
      s.flash = 0.4;
      s.msg = p.hit;
      feel.sound("success");
    } else {
      s.misses += 1;
      s.msg = p.miss;
      feel.sound("miss");
    }
    s.msgT = 0.6;
  };

  useLoop((dt) => {
    const s = g.current;
    if (s.done) return;
    s.t += dt;
    s.samples.push(stormValue(s.t, s.spikes));
    s.samples.shift();
    s.flash = Math.max(0, s.flash - dt);
    s.msgT -= dt;
    s.spikes.forEach((sp) => {
      if (!sp.hit && !sp.missed && s.t > sp.at + 1) {
        sp.missed = true;
        feel.bump();
      }
    });
    if (edge("tap", !!keys.current.Space)) tap();
    const active = s.spikes.some((sp) => !sp.hit && s.t >= sp.at && s.t < sp.at + 1);
    feel.set({ stress: clamp(0.3 + (active ? 0.45 : 0) + s.misses * 0.05), cold: 0 });
    if (s.t >= cfg.duration) {
      s.done = true;
      setTimeout(() => onFinish(clamp(s.hits / cfg.spikes - s.misses * 0.1)), 900);
    }
    tick();
  });

  const s = g.current;
  const active = s.spikes.some((sp) => !sp.hit && s.t >= sp.at && s.t < sp.at + 1);
  return (
    <div className="relative">
      <Stage env={cfg.env}>
        <TapScene samples={s.samples} active={active} flash={s.flash} />
      </Stage>
      <div className="absolute top-2 inset-x-2 flex items-start justify-between gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-full bg-slate-900/75 border border-white/20 text-xs font-extrabold text-white">
          ⚡ {p.spikes}: {s.hits}/{cfg.spikes}
        </div>
        <Timer left={cfg.duration - s.t} />
        <span />
      </div>
      <Banner text={s.done ? p.done : s.msgT > 0 ? s.msg : null} tone={s.done || s.msg === p.hit ? "emerald" : "amber"} />
      <div className="absolute bottom-3 right-3">
        <PadButton
          label={p.tapNow}
          onDown={tap}
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full text-2xl ${active ? "bg-rose-500 border-white text-white animate-pulse" : "bg-slate-700 border-slate-400 text-slate-200"}`}
        >
          {p.tapNow}
        </PadButton>
      </div>
    </div>
  );
}

// =====================================================================
// PREVIEW — the chosen mini-game playing itself on a loop (shown before the kid commits)
// =====================================================================
export function GamePreview({ cfg }) {
  const tick = useTick();
  const clock = useRef({ t: 0, obs: [], spawn: 0, id: 0, scroll: 0 });
  useLoop((dt) => {
    const c = clock.current;
    c.t += dt;
    if (cfg.type === "steer") {
      c.scroll += 230 * dt;
      c.spawn -= dt;
      if (c.spawn <= 0) {
        c.spawn = 0.9;
        c.obs.push({ id: c.id++, x: 860, lane: c.id % 3, hit: false });
      }
      c.obs.forEach((o) => (o.x -= 230 * dt));
      c.obs = c.obs.filter((o) => o.x > -80);
    }
    tick();
  });
  const t = clock.current.t;
  const wave = (period) => (t % period) / period;

  let body = null;
  if (cfg.type === "hold") {
    const holding = t % 2.6 < 1.8;
    body = <HoldScene scene={cfg.scene} s={{ holding, progress: wave(7), danger: (t % 2.6) / 2.6, done: false }} />;
  } else if (cfg.type === "balance") {
    body = <BalanceScene scene={cfg.scene} s={{ v: Math.sin(t * 1.6) * 0.55, progress: wave(7), t }} />;
  } else if (cfg.type === "steer") {
    const c = clock.current;
    const next = c.obs.find((o) => o.x > ROVER_X);
    const lane = next ? (next.lane + 1) % 3 : 1;
    body = <SteerScene cfg={cfg} s={{ ...c, hits: 0, flash: 0, y: LANES[lane], time: t }} />;
  } else if (cfg.type === "aim") {
    const targets = AIM_TARGETS[cfg.scene];
    const k = Math.floor(t / 1.6) % targets.length;
    const tg = targets[k];
    const prev = targets[(k + targets.length - 1) % targets.length];
    const u = Math.min(1, (t % 1.6) / 1.1);
    const cross = { x: prev.x + (tg.x - prev.x) * u + Math.sin(t * 3) * 8, y: prev.y + (tg.y - prev.y) * u + Math.cos(t * 2.4) * 6 };
    const firing = t % 1.6 > 1.2;
    body = <AimScene cfg={cfg} s={{ hits: [], pops: [], beam: firing ? cross : null }} cross={cross} />;
  } else if (cfg.type === "breathe") {
    body = <BreatheScene cfg={cfg} s={{ done: false }} prog={wave(10)} />;
  } else if (cfg.type === "rhythm") {
    const side = Math.floor(t / 0.45) % 2;
    body = <RhythmScene s={{ rock: side ? 1 : -1, chipT: t % 0.45 < 0.3 ? 1 : 0, frost: 0.2 + wave(6) * 0.5 }} />;
  } else if (cfg.type === "drag") {
    const u = wave(1.4);
    const gauge = (Math.floor(t / 1.4) % 8) * 13;
    body = (
      <>
        <DragScene cfg={cfg} gauge={gauge} splash={u > 0.85 ? 1 : 0} />
        <text x={150 + u * 430} y={150 + Math.sin(u * Math.PI) * -40} fontSize="40" textAnchor="middle">💧</text>
      </>
    );
  } else if (cfg.type === "swipe") {
    const u = wave(5);
    body = (
      <>
        <SwipeScene clean={u} />
        <rect x={(PANEL.x + PANEL.w * u) * 800} y={PANEL.y * 360} width={PANEL.w * 800 * (1 - u)} height={PANEL.h * 360} fill="#a8a29e" />
        <text x={(PANEL.x + PANEL.w * u) * 800} y={(PANEL.y + PANEL.h / 2) * 360 + Math.sin(t * 12) * 30} fontSize="40" textAnchor="middle">🧹</text>
      </>
    );
  } else if (cfg.type === "tapTiming") {
    const spikes = [{ at: Math.floor(t / 3) * 3 + 1.4 }];
    const samples = Array.from({ length: 90 }, (_, i) => stormValue(t - (89 - i) / 60, spikes));
    const active = t % 3 > 1.4 && t % 3 < 2.4;
    body = (
      <>
        <TapScene samples={samples} active={active} flash={0} />
        {active && <text x="700" y="320" textAnchor="middle" fontSize="40">👆</text>}
      </>
    );
  }
  const breatheSize = cfg.type === "breathe" ? 0.45 + 0.55 * (0.5 - Math.cos(Math.PI * 2 * wave(cfg.period)) / 2) : 0;

  return (
    <div className="relative">
      <Stage env={cfg.type === "steer" ? null : cfg.env === "garage" ? "garage" : cfg.env}>{body}</Stage>
      {cfg.type === "breathe" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-full border-4 border-cyan-200 bg-cyan-400/20" style={{ width: `${breatheSize * 34}%`, aspectRatio: "1 / 1" }} />
        </div>
      )}
    </div>
  );
}

export const GAMES = {
  hold: HoldGame,
  steer: SteerGame,
  aim: AimGame,
  balance: BalanceGame,
  breathe: BreatheGame,
  rhythm: RhythmGame,
  drag: DragGame,
  swipe: SwipeGame,
  tapTiming: TapTimingGame,
};
