import React, { useEffect, useMemo, useRef, useState } from "react";
import { spaceAudio } from "../utils/sound";

// Timeline (seconds)
const T = {
  countdownEnd: 3, // 3..2..1
  liftEnd: 5.6, // rocket climbs out of Earth's sky
  cruiseEnd: 8.8, // travel through space, Mars grows
  descentEnd: 12, // retro-rocket landing on Mars
  done: 13.8, // touchdown banner, then fade out
};

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (t, start, end) => clamp((t - start) / (end - start));
const easeIn = (p) => p * p * p;
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

function lerpColor(a, b, p) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * p)).join(",")})`;
}

function Rocket() {
  return (
    <svg viewBox="0 0 60 140" className="w-full h-auto block relative z-10" aria-hidden="true">
      <path d="M14 96 L2 128 L2 136 L14 122Z" fill="#dc2626" />
      <path d="M46 96 L58 128 L58 136 L46 122Z" fill="#dc2626" />
      <path d="M20 120 L40 120 L44 134 L16 134Z" fill="#475569" />
      <path d="M30 4 C44 20 46 40 46 60 L46 120 L14 120 L14 60 C14 40 16 20 30 4Z" fill="#f8fafc" />
      <path d="M30 4 C40 15 43 26 44.5 38 L15.5 38 C17 26 20 15 30 4Z" fill="#ef4444" />
      <path d="M38 40 L46 60 L46 120 L38 120Z" fill="#cbd5e1" opacity="0.7" />
      <circle cx="30" cy="62" r="8" fill="#38bdf8" stroke="#334155" strokeWidth="3" />
      <circle cx="27.5" cy="59.5" r="2.4" fill="#e0f2fe" />
      <rect x="14" y="92" width="32" height="6" fill="#f97316" />
      <path d="M28 98 L32 98 L32 128 L28 128Z" fill="#dc2626" />
    </svg>
  );
}

function Flame({ power }) {
  if (power <= 0.02) return null;
  return (
    <div
      className="absolute left-1/2 launch-flame"
      style={{
        top: "92%",
        width: "46%",
        height: `${40 + power * 160}%`,
        transform: "translateX(-50%)",
        transformOrigin: "top center",
        opacity: clamp(power * 1.5),
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          borderRadius: "50% 50% 50% 50% / 20% 20% 80% 80%",
          background: "radial-gradient(ellipse at 50% 10%, #fff7ed 0%, #fde047 25%, #f97316 55%, rgba(239,68,68,0) 80%)",
          filter: "blur(1.5px)",
        }}
      />
    </div>
  );
}

function Puffs({ count, t, start, color, spread, rise, origin = "50%", bottom }) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const born = start + i * 0.09;
    const age = t - born;
    if (age < 0 || age > 2.2) continue;
    const dir = i % 2 === 0 ? 1 : -1;
    const sx = dir * (0.4 + ((i * 37) % 10) / 10) * spread * easeOut(clamp(age / 1.6));
    const sy = -rise * age;
    const size = 40 + age * 90 + ((i * 13) % 30);
    items.push(
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          left: origin,
          bottom,
          width: size,
          height: size,
          background: color,
          opacity: clamp(0.85 - age / 2.2),
          transform: `translate(calc(-50% + ${sx}px), calc(50% + ${sy}px))`,
          filter: "blur(4px)",
        }}
      />
    );
  }
  return <>{items}</>;
}

const EARTH_BG = "radial-gradient(circle at 35% 30%, #7dd3fc, #2563eb 45%, #1e3a8a 75%, #0f172a)";
const MARS_BG = "radial-gradient(circle at 38% 32%, #fdba74, #ea580c 45%, #9a3412 72%, #431407)";

// Colours of the far-away world for each mission
const PALETTES = {
  mars: {
    bg: MARS_BG, glow: "rgba(249,115,22,0.5)", spot: "bg-orange-900/40", spot2: "bg-orange-900/30",
    skyBottom: "#fdba74", skyTop: "#c2410c", hills: "#9a3412", ground: "linear-gradient(#b45309, #7c2d12)",
    landSky: "linear-gradient(to top, #fdba74, #c2410c 55%, #431407)", landSpot: "bg-orange-950/40", puff: "#fdba74", emoji: "🔴",
  },
  moon: {
    bg: "radial-gradient(circle at 38% 32%, #f4f4f5, #a1a1aa 45%, #52525b 75%, #18181b)", glow: "rgba(226,232,240,0.45)", spot: "bg-zinc-600/50", spot2: "bg-zinc-700/40",
    skyBottom: "#27272a", skyTop: "#000000", hills: "#52525b", ground: "linear-gradient(#a1a1aa, #52525b)",
    landSky: "linear-gradient(to top, #27272a, #09090b 55%, #000000)", landSpot: "bg-zinc-700/50", puff: "#d4d4d8", emoji: "🌕",
  },
};

// home = false: Earth -> Mars (start of the game). home = true: Mars -> Earth splashdown (end of the game).
export default function LaunchSequence({ t: tr, soundOn, onComplete, home = false, world = "mars" }) {
  const L = home ? tr.launchHome : tr.launch;
  const P = PALETTES[world] || PALETTES.mars; // the other world (Mars or Moon)
  const [t, setT] = useState(0);
  const startRef = useRef(null);
  const cuesRef = useRef(new Set());
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  };

  // Animation clock
  useEffect(() => {
    let raf;
    const tick = (now) => {
      if (startRef.current == null) startRef.current = now;
      const elapsed = (now - startRef.current) / 1000;
      setT(elapsed);
      if (elapsed >= T.done) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard skip
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sound cues
  useEffect(() => {
    if (!soundOn) return;
    const cue = (id, at, fn) => {
      if (t >= at && !cuesRef.current.has(id)) {
        cuesRef.current.add(id);
        fn();
      }
    };
    cue("c3", 0, () => spaceAudio.playCountdownBeep());
    cue("c2", 1, () => spaceAudio.playCountdownBeep());
    cue("c1", 2, () => spaceAudio.playCountdownBeep());
    cue("go", T.countdownEnd, () => {
      spaceAudio.playCountdownBeep(true);
      spaceAudio.playLiftoff();
    });
    cue("retro", T.cruiseEnd + 0.2, () => spaceAudio.playRetroBurn());
    cue("land", T.descentEnd, () => spaceAudio.playTouchdown());
  }, [t, soundOn]);

  const stars = useMemo(
    () =>
      Array.from({ length: 110 }, (_, i) => ({
        x: (i * 73.13) % 100,
        y: (i * 41.7 + (i % 7) * 13) % 100,
        s: 1 + ((i * 17) % 3),
        speed: 0.6 + ((i * 29) % 10) / 10,
      })),
    []
  );

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // ---- Stage values ----
  const pLift = prog(t, T.countdownEnd, T.liftEnd);
  const pCruise = prog(t, T.liftEnd, T.cruiseEnd);
  const pDescent = prog(t, T.cruiseEnd, T.descentEnd);
  const inCountdown = t < T.countdownEnd;
  const landed = t >= T.descentEnd;

  // Earth scene
  const earthOpacity = 1 - prog(t, T.liftEnd - 0.4, T.liftEnd + 0.3);
  const skyP = easeIn(pLift);
  const groundShift = easeIn(pLift) * 110; // vh, ground falls away

  // Space scene
  const spaceOpacity = prog(t, T.liftEnd - 0.6, T.liftEnd) * (1 - prog(t, T.cruiseEnd - 0.3, T.cruiseEnd + 0.3));
  const starSpeed = 20 + 260 * Math.sin(Math.PI * pCruise); // vh per second-ish
  const earthSize = 90 - 80 * easeOut(pCruise); // vmin
  const marsSize = 3 + 200 * easeIn(pCruise); // vmin
  const marsTop = 22 - 60 * easeIn(pCruise); // % center

  // Mars scene
  const marsSceneOpacity = prog(t, T.cruiseEnd - 0.3, T.cruiseEnd + 0.3);
  const marsGround = (1 - easeOut(pDescent)) * 55; // vh, ground rises into view

  // Rocket transform
  let rocketY = 0; // vh (negative = up)
  let flame = 0;
  if (inCountdown) {
    flame = t > 2.4 ? (t - 2.4) * 0.6 : 0;
  } else if (t < T.liftEnd) {
    rocketY = -easeIn(pLift) * 30;
    flame = 0.9;
  } else if (t < T.cruiseEnd) {
    rocketY = -30 + Math.sin(t * 2) * 1.2;
    flame = 0.6 + 0.3 * Math.sin(Math.PI * pCruise);
  } else if (!landed) {
    rocketY = -(1 - easeOut(pDescent)) * 75;
    flame = 0.15 + Math.pow(1 - pDescent, 1.5) * 0.8;
  } else {
    rocketY = 0;
    flame = Math.max(0, 0.4 - (t - T.descentEnd) * 1.2);
  }

  // Camera shake
  let shake = 0;
  if (!reduceMotion) {
    if (t > 2.5 && t < T.countdownEnd + 1.6) shake = t < T.countdownEnd ? 1.5 : 4 * (1 - prog(t, T.countdownEnd + 0.6, T.countdownEnd + 1.6));
    if (t > T.descentEnd && t < T.descentEnd + 0.5) shake = 5 * (1 - prog(t, T.descentEnd, T.descentEnd + 0.5));
  }
  const sx = shake * Math.sin(t * 91);
  const sy = shake * Math.cos(t * 77);

  const fadeOut = prog(t, T.done - 0.9, T.done);
  const countdownNum = 3 - Math.floor(t);
  const countdownPulse = t % 1;

  // Caption
  let caption = null;
  let sub = null;
  if (t >= T.countdownEnd && t < T.countdownEnd + 1.6) caption = L.liftoff;
  else if (t >= T.liftEnd && t < T.cruiseEnd) {
    caption = L.cruise;
    sub = L.cruiseSub;
  } else if (t >= T.cruiseEnd && !landed) {
    caption = L.descent;
    sub = L.descentSub;
  }

  const groundH = "22vh";
  const rocketW = "clamp(46px, 8vh, 84px)";

  return (
    <div
      className="fixed inset-0 z-40 overflow-hidden bg-slate-950"
      style={{ opacity: 1 - fadeOut, pointerEvents: fadeOut > 0.6 ? "none" : "auto" }}
      role="dialog"
      aria-label={tr.marsCTA}
    >
      <style>{`
        @keyframes launch-flicker {
          0%, 100% { transform: translateX(-50%) scaleY(1) scaleX(1); }
          50% { transform: translateX(-50%) scaleY(1.12) scaleX(0.92); }
        }
        .launch-flame { animation: launch-flicker 0.09s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .launch-flame { animation: none; } }
      `}</style>

      <div className="absolute inset-0" style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        {/* ===== EARTH LAUNCH PAD ===== */}
        {earthOpacity > 0 && (
          <div className="absolute inset-0" style={{ opacity: earthOpacity }}>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${lerpColor(home ? P.skyBottom : "#bae6fd", "#0f172a", skyP)}, ${lerpColor(home ? P.skyTop : "#0ea5e9", "#020617", skyP)})`,
              }}
            />
            {/* stars appearing as sky darkens */}
            {stars.slice(0, 60).map((s, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, opacity: skyP * 0.9 }}
              />
            ))}
            <div className="absolute inset-0" style={{ transform: `translateY(${groundShift}vh)` }}>
              {/* clouds */}
              {!home && [
                [12, 22, 1],
                [70, 14, 1.3],
                [40, 34, 0.8],
              ].map(([x, y, sc], i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{ left: `${x + Math.sin(t * 0.3 + i) * 2}%`, top: `${y}%`, transform: `scale(${sc})` }}
                >
                  <div className="w-28 h-10 rounded-full bg-white/80 blur-[2px]" />
                  <div className="absolute -top-4 left-6 w-14 h-14 rounded-full bg-white/80 blur-[2px]" />
                </div>
              ))}
              {/* distant hills */}
              <svg
                className="absolute left-0 w-full"
                style={{ bottom: groundH, height: "14vh" }}
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M0 20 L0 12 Q12 2 25 10 T50 8 T78 11 T100 6 L100 20Z" fill={home ? P.hills : "#4d7c0f"} opacity="0.65" />
              </svg>
              {/* ground */}
              <div
                className="absolute left-0 right-0 bottom-0"
                style={{ height: groundH, background: home ? P.ground : "linear-gradient(#65a30d, #3f6212)" }}
              >
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-0 h-5 rounded-b-lg"
                  style={{ width: "min(70vw, 360px)", background: "#64748b", boxShadow: "inset 0 -4px 0 #475569" }}
                />
              </div>
              {/* launch tower */}
              <div
                className="absolute"
                style={{
                  bottom: groundH,
                  left: `calc(50% - ${rocketW} * 1.55)`,
                  width: "clamp(18px, 3vh, 30px)",
                  height: "38vh",
                  background:
                    "repeating-linear-gradient(45deg, transparent 0 6px, #94a3b8 6px 8px), repeating-linear-gradient(-45deg, transparent 0 6px, #94a3b8 6px 8px)",
                  borderLeft: "3px solid #cbd5e1",
                  borderRight: "3px solid #cbd5e1",
                }}
              >
                <div
                  className="absolute top-[30%] left-full h-1.5 bg-slate-300"
                  style={{ width: `calc(${rocketW} * 0.65)`, transformOrigin: "left", transform: `rotate(${t > 2 ? -35 : 0}deg)`, transition: "transform .5s" }}
                />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              {/* launch smoke */}
              <Puffs count={20} t={t} start={T.countdownEnd - 0.4} color="#e2e8f0" spread={260} rise={8} bottom={groundH} />
            </div>
          </div>
        )}

        {/* ===== DEEP SPACE CRUISE ===== */}
        {spaceOpacity > 0 && (
          <div className="absolute inset-0 bg-[#020617]" style={{ opacity: spaceOpacity }}>
            {stars.map((s, i) => {
              const y = (s.y + (t - T.liftEnd) * starSpeed * s.speed * 0.12) % 100;
              const streak = Math.max(s.s, starSpeed * 0.06 * s.speed);
              return (
                <div
                  key={i}
                  className="absolute bg-white rounded-full"
                  style={{ left: `${s.x}%`, top: `${y}%`, width: s.s, height: streak, opacity: 0.8 }}
                />
              );
            })}
            {/* Earth receding */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${earthSize}vmin`,
                height: `${earthSize}vmin`,
                left: `${20 - pCruise * 15}%`,
                top: `${100 + pCruise * 10}%`,
                transform: "translate(-50%, -40%)",
                background: home ? P.bg : EARTH_BG,
                boxShadow: home ? `0 0 40px ${P.glow}` : "0 0 40px rgba(56,189,248,0.45)",
              }}
            >
              <div className={`absolute rounded-full ${home ? P.spot : "bg-green-600/70"}`} style={{ width: "30%", height: "22%", left: "25%", top: "25%" }} />
              <div className={`absolute rounded-full ${home ? P.spot2 : "bg-green-600/60"}`} style={{ width: "18%", height: "26%", left: "58%", top: "40%" }} />
            </div>
            {/* Mars approaching */}
            <div
              className="absolute left-1/2 rounded-full"
              style={{
                width: `${marsSize}vmin`,
                height: `${marsSize}vmin`,
                top: `${marsTop}%`,
                transform: "translate(-50%, -50%)",
                background: home ? EARTH_BG : P.bg,
                boxShadow: `0 0 ${10 + marsSize * 0.3}px ${home ? "rgba(56,189,248,0.55)" : P.glow}`,
              }}
            >
              <div className={`absolute rounded-full ${home ? "bg-green-600/70" : P.spot}`} style={{ width: "22%", height: "14%", left: "30%", top: "45%" }} />
              <div className={`absolute rounded-full ${home ? "bg-green-600/60" : P.spot2}`} style={{ width: "12%", height: "10%", left: "60%", top: "28%" }} />
            </div>
          </div>
        )}

        {/* ===== MARS LANDING ===== */}
        {marsSceneOpacity > 0 && (
          <div className="absolute inset-0" style={{ opacity: marsSceneOpacity }}>
            <div className="absolute inset-0" style={{ background: home ? "linear-gradient(to top, #e0f2fe, #38bdf8 55%, #1d4ed8)" : P.landSky }} />
            <div className="absolute inset-0" style={{ transform: `translateY(${marsGround}vh)` }}>
              <svg
                className="absolute left-0 w-full"
                style={{ bottom: groundH, height: "16vh" }}
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M0 20 L0 9 L10 6 L18 10 L30 4 L42 9 L55 7 L66 12 L80 5 L92 9 L100 7 L100 20Z" fill={home ? "#475569" : P.hills} opacity="0.7" />
              </svg>
              <div
                className="absolute left-0 right-0 bottom-0"
                style={{ height: groundH, background: home ? "linear-gradient(#0ea5e9, #1e3a8a)" : P.ground }}
              >
                {[15, 72, 88, 33].map((x, i) => (
                  <div
                    key={i}
                    className={`absolute rounded-[50%] ${home ? "bg-white/30" : P.landSpot}`}
                    style={{ left: `${x}%`, top: `${25 + i * 15}%`, width: 30 + i * 14, height: 8 + i * 3 }}
                  />
                ))}
              </div>
              {/* landing dust */}
              <Puffs count={22} t={t} start={T.descentEnd - 0.6} color={home ? "#f8fafc" : P.puff} spread={320} rise={4} bottom={groundH} />
            </div>
          </div>
        )}

        {/* ===== ROCKET ===== */}
        <div
          className="absolute left-1/2"
          style={{
            bottom: `calc(${groundH} + 4px)`,
            width: rocketW,
            transform: `translate(-50%, ${rocketY}vh) translateX(${inCountdown && t > 2.4 && !reduceMotion ? Math.sin(t * 120) : 0}px)`,
          }}
        >
          {home && t >= T.cruiseEnd && (
            <svg
              viewBox="0 0 100 80"
              className="absolute left-1/2 -translate-x-1/2"
              style={{ bottom: "92%", width: "300%" }}
              aria-hidden="true"
            >
              <path d="M4 36 Q50 -14 96 36 Q73 28 50 36 Q27 28 4 36 Z" fill="#f97316" />
              <path d="M27 31 Q50 -6 73 31" fill="none" stroke="#fff" strokeWidth="5" opacity=".85" />
              {[6, 27, 50, 73, 94].map((x) => (
                <line key={x} x1={x} y1="36" x2="50" y2="80" stroke="#e2e8f0" strokeWidth="1" />
              ))}
            </svg>
          )}
          <Flame power={home && t >= T.cruiseEnd ? 0 : flame} />
          <Rocket />
        </div>
      </div>

      {/* ===== OVERLAY TEXT ===== */}
      {inCountdown && (
        <div className="absolute inset-x-0 top-[14%] flex flex-col items-center text-center pointer-events-none">
          <div className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.3em] text-white/85 drop-shadow mb-1">
            {L.countdown}
          </div>
          <div
            key={countdownNum}
            className="font-display font-bold text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)] leading-none"
            style={{
              fontSize: "clamp(72px, 18vh, 160px)",
              transform: `scale(${1.25 - countdownPulse * 0.25})`,
              opacity: 1 - countdownPulse * 0.4,
            }}
          >
            {countdownNum}
          </div>
        </div>
      )}

      {caption && (
        <div className="absolute inset-x-0 top-[10%] px-4 flex flex-col items-center text-center pointer-events-none">
          <div className="font-display text-3xl sm:text-5xl font-bold text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)]">
            {caption}
          </div>
          {sub && <div className="mt-2 text-sm sm:text-base font-semibold text-orange-100/90 drop-shadow">{sub}</div>}
        </div>
      )}

      {landed && (
        <div
          className="absolute inset-x-0 top-[18%] px-4 flex flex-col items-center text-center pointer-events-none"
          style={{ transform: `scale(${0.85 + easeOut(prog(t, T.descentEnd, T.descentEnd + 0.5)) * 0.15})` }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-300/50 backdrop-blur-md text-emerald-100 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-3">
            ✅ {L.touchdown}
          </div>
          <div className="font-display text-3xl sm:text-5xl font-bold text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)]">
            {L.touchdownSub}
          </div>
        </div>
      )}

      {/* Journey progress */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[min(80vw,420px)] flex items-center gap-3 pointer-events-none">
        <span className="text-lg" aria-hidden="true">{home ? P.emoji : "🌍"}</span>
        <div className="relative flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 to-orange-500"
            style={{ width: `${clamp(t / T.descentEnd) * 100}%` }}
          />
        </div>
        <span className="text-lg" aria-hidden="true">{home ? "🌍" : P.emoji}</span>
      </div>

      <button
        type="button"
        onClick={finish}
        className="absolute top-4 right-4 px-4 py-2 rounded-full bg-slate-900/70 hover:bg-slate-800/90 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-white shadow-lg transition"
      >
        {L.skip} ⏭
      </button>
    </div>
  );
}
