import React, { useEffect, useMemo, useRef } from "react";

// Game studio splash ("Interstellar V") shown before the main menu.
// Two shooting stars streak in and draw a giant glowing V, a ring-planet orbit spins around it,
// the studio name bounces in letter by letter, a little rocket zooms past, then it fades to the menu.
const DURATION_MS = 5600;

const CSS = `
.si-root { animation: si-out .7s ease-in ${DURATION_MS - 700}ms forwards; }
@keyframes si-out { to { opacity: 0; transform: scale(1.06); } }
@keyframes si-twinkle { 0%,100% { opacity:.2; } 50% { opacity:1; } }
.si-star { animation: si-twinkle 2s ease-in-out infinite; }
@keyframes si-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.si-stroke { stroke-dasharray: 1; stroke-dashoffset: 1; animation: si-draw .9s cubic-bezier(.6,0,.3,1) forwards; }
@keyframes si-head { 0% { transform: translate(var(--x0), var(--y0)); opacity: 1; } 92% { opacity: 1; } 100% { transform: translate(var(--x1), var(--y1)); opacity: 0; } }
.si-head { transform-box: view-box; transform: translate(var(--x0), var(--y0)); animation: si-head .9s cubic-bezier(.6,0,.3,1) forwards; }
@keyframes si-fill { from { opacity: 0; } to { opacity: 1; } }
.si-fill { opacity: 0; animation: si-fill .5s ease-out 1s forwards; }
@keyframes si-burst { 0% { transform: scale(.2); opacity: 0; } 30% { opacity: .9; } 100% { transform: scale(2.6); opacity: 0; } }
.si-burst { transform-box: fill-box; transform-origin: 50% 50%; opacity: 0; animation: si-burst 1.1s ease-out 1.05s forwards; }
@keyframes si-orbit-in { from { opacity: 0; transform: rotate(-30deg) scale(.6); } to { opacity: 1; transform: rotate(0) scale(1); } }
.si-orbit { transform-box: fill-box; transform-origin: 50% 50%; opacity: 0; animation: si-orbit-in .8s ease-out 1.3s forwards; }
@keyframes si-spin { to { transform: rotate(360deg); } }
.si-moon { transform-origin: 200px 175px; animation: si-spin 3s linear 1.3s infinite; }
@keyframes si-letter { 0% { transform: translateY(40px) scale(.3); opacity: 0; } 60% { transform: translateY(-10px) scale(1.15); opacity: 1; } 100% { transform: none; opacity: 1; } }
.si-letter { display: inline-block; opacity: 0; animation: si-letter .5s cubic-bezier(.2,1.5,.4,1) forwards; }
@keyframes si-tag { from { opacity: 0; letter-spacing: 1.2em; } to { opacity: 1; letter-spacing: .5em; } }
.si-tag { opacity: 0; animation: si-tag .9s ease-out 3s forwards; }
@keyframes si-rocket { from { transform: translateX(-60vw) rotate(8deg); } to { transform: translateX(120vw) rotate(-4deg); } }
.si-rocket { animation: si-rocket 1.8s ease-in 3.1s both; }
@keyframes si-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.si-logo { animation: si-bob 2.4s ease-in-out 1.6s infinite; }
`;

const NAME = "INTERSTELLAR";

export default function StudioIntro({ onDone, onSfx }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 110 }, (_, i) => ({
        x: (i * 73.13) % 100,
        y: (i * 41.7 + (i % 7) * 13) % 100,
        s: 1 + ((i * 17) % 3) * 0.8,
        d: ((i * 31) % 30) / 10,
        c: i % 9 === 0 ? "#fde68a" : i % 5 === 0 ? "#a5f3fc" : "#ffffff",
      })),
    []
  );

  // keep the latest callbacks without restarting the timeline when the parent re-renders
  const cb = useRef({ onDone, onSfx });
  cb.current = { onDone, onSfx };
  useEffect(() => {
    const sfx = (n) => cb.current.onSfx?.(n);
    const done = () => cb.current.onDone();
    const timers = [setTimeout(() => sfx("whoosh"), 150), setTimeout(() => sfx("ding"), 1050), setTimeout(() => sfx("whoosh"), 3100), setTimeout(done, DURATION_MS)];
    // Any key or tap skips the intro
    window.addEventListener("keydown", done);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", done);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden select-none cursor-pointer" onClick={onDone} role="button" aria-label="Skip intro">
      <style>{CSS}</style>
      <div className="si-root absolute inset-0 flex flex-col items-center justify-center" style={{ background: "radial-gradient(ellipse at 50% 45%, #312e81 0%, #1e1b4b 35%, #020617 75%)" }}>
        {stars.map((st, i) => (
          <span
            key={i}
            className="si-star absolute rounded-full"
            style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, background: st.c, animationDelay: `${st.d}s` }}
          />
        ))}

        {/* The V logo */}
        <svg viewBox="0 0 400 330" className="si-logo relative w-[min(62vw,340px)] h-auto overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="si-vgrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#22d3ee" />
              <stop offset=".5" stopColor="#a78bfa" />
              <stop offset="1" stopColor="#f472b6" />
            </linearGradient>
            <radialGradient id="si-glow" cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor="#fff" stopOpacity=".95" />
              <stop offset=".4" stopColor="#c4b5fd" stopOpacity=".6" />
              <stop offset="1" stopColor="#c4b5fd" stopOpacity="0" />
            </radialGradient>
            <filter id="si-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          {/* burst when the two stars meet */}
          <circle className="si-burst" cx="200" cy="270" r="70" fill="url(#si-glow)" />
          {/* filled V */}
          <path className="si-fill" d="M40 40 L110 40 L200 220 L290 40 L360 40 L225 300 L175 300 Z" fill="url(#si-vgrad)" stroke="#fff" strokeWidth="8" strokeLinejoin="round" />
          <path className="si-fill" d="M40 40 L110 40 L200 220 L290 40 L360 40 L225 300 L175 300 Z" fill="url(#si-vgrad)" filter="url(#si-blur)" opacity=".6" />
          {/* shooting-star trails drawing the two arms */}
          <path id="si-armL" d="M30 20 L200 290" pathLength="1" className="si-stroke" stroke="#67e8f9" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path id="si-armR" d="M370 20 L200 290" pathLength="1" className="si-stroke" stroke="#f9a8d4" strokeWidth="10" strokeLinecap="round" fill="none" style={{ animationDelay: ".1s" }} />
          {/* star heads riding along the arms */}
          <g className="si-head" style={{ "--x0": "30px", "--y0": "20px", "--x1": "200px", "--y1": "290px" }}>
            <circle r="14" fill="#ecfeff" />
            <circle r="26" fill="#67e8f9" opacity=".35" />
          </g>
          <g className="si-head" style={{ "--x0": "370px", "--y0": "20px", "--x1": "200px", "--y1": "290px", animationDelay: ".1s" }}>
            <circle r="14" fill="#fdf2f8" />
            <circle r="26" fill="#f9a8d4" opacity=".35" />
          </g>
          {/* orbit ring + little moon */}
          <g className="si-orbit">
            <ellipse cx="200" cy="175" rx="190" ry="48" fill="none" stroke="#fde68a" strokeWidth="5" opacity=".9" transform="rotate(-12 200 175)" />
          </g>
          <g className="si-orbit">
            {/* the moon rides along the same tilted oval as the ring */}
            <g transform="rotate(-12 200 175)">
              <circle r="13" fill="#fde047" stroke="#fff" strokeWidth="3">
                <animateMotion dur="3s" repeatCount="indefinite" path="M390 175 A190 48 0 1 1 10 175 A190 48 0 1 1 390 175" />
              </circle>
            </g>
          </g>
        </svg>

        {/* studio name */}
        <div className="relative mt-4 sm:mt-6 font-display font-bold text-center leading-none" style={{ fontSize: "clamp(2rem, 8vw, 4.5rem)" }}>
          {[...NAME].map((ch, i) => (
            <span
              key={i}
              className="si-letter"
              style={{
                animationDelay: `${1.6 + i * 0.07}s`,
                background: "linear-gradient(180deg,#ffffff 0%,#e0e7ff 45%,#a5b4fc 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 4px 0 #312e81) drop-shadow(0 0 18px rgba(167,139,250,.8))",
              }}
            >
              {ch}
            </span>
          ))}
          <span
            className="si-letter ml-3"
            style={{
              animationDelay: `${1.6 + NAME.length * 0.07 + 0.15}s`,
              background: "linear-gradient(135deg,#22d3ee,#a78bfa,#f472b6)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 4px 0 #312e81) drop-shadow(0 0 22px rgba(244,114,182,.9))",
            }}
          >
            V
          </span>
        </div>
        <div className="si-tag mt-3 font-display font-bold text-amber-200 text-xs sm:text-base uppercase">Game Studio</div>

        {/* a little rocket zooms across */}
        <div className="si-rocket absolute bottom-[14%] left-0 flex items-center">
          <span className="block h-2 w-40 rounded-full bg-gradient-to-r from-transparent via-orange-300 to-amber-200 opacity-80" />
          <span className="text-4xl sm:text-5xl -ml-2 rotate-45 inline-block">🚀</span>
        </div>

        <div className="absolute bottom-4 right-5 text-[11px] font-bold text-slate-400">Tap or press any key to skip</div>
      </div>
    </div>
  );
}
