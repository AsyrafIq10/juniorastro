import React, { useMemo, useState } from "react";
import { Settings, Rocket, Sparkles, Users, ArrowLeft, Play } from "lucide-react";

function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => ({
        x: (i * 73.13) % 100,
        y: (i * 41.7 + (i % 7) * 13) % 100,
        s: 1 + ((i * 17) % 3) * 0.7,
        d: ((i * 31) % 40) / 10,
      })),
    []
  );
  return (
    <div className="absolute inset-0" aria-hidden="true">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white menu-twinkle"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }}
        />
      ))}
    </div>
  );
}

// One strip of continents; rendered twice side by side for a seamless spin loop
function Continents() {
  const land = [
    { l: 4, t: 8, w: 9, h: 9, r: "60% 40% 55% 45% / 50% 60% 40% 50%" },
    { l: 9, t: 16, w: 5, h: 13, r: "40% 60% 50% 50% / 30% 40% 60% 70%" },
    { l: 22, t: 5, w: 6, h: 7, r: "50% 50% 40% 60% / 60% 40% 60% 40%" },
    { l: 26, t: 13, w: 6, h: 14, r: "45% 55% 60% 40% / 40% 45% 55% 60%" },
    { l: 42, t: 4, w: 14, h: 9, r: "55% 45% 50% 50% / 45% 55% 45% 55%" },
    { l: 50, t: 12, w: 7, h: 7, r: "50% 50% 60% 40% / 40% 60% 40% 60%" },
    { l: 64, t: 18, w: 4, h: 4, r: "50%" },
    { l: 74, t: 22, w: 8, h: 6, r: "60% 40% 50% 50% / 50% 50% 50% 50%" },
    { l: 86, t: 7, w: 6, h: 10, r: "40% 60% 45% 55% / 55% 45% 55% 45%" },
  ];
  return (
    <div className="relative h-full" style={{ width: "50%" }}>
      {land.map((c, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${c.l}%`,
            top: `${c.t}%`,
            width: `${c.w}%`,
            height: `${c.h}%`,
            borderRadius: c.r,
            background: "radial-gradient(circle at 40% 40%, #4ade80, #15803d 60%, #a16207)",
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}

function Earth() {
  return (
    <div
      className="absolute left-1/2 rounded-full"
      style={{
        width: "max(150vmin, 760px)",
        height: "max(150vmin, 760px)",
        top: "68vh",
        transform: "translateX(-50%)",
        boxShadow: "0 0 80px 20px rgba(56,189,248,0.35), inset 0 0 60px rgba(186,230,253,0.5)",
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full overflow-hidden" style={{ background: "radial-gradient(circle at 50% 20%, #38bdf8, #1d4ed8 45%, #172554 80%)" }}>
        <div className="absolute inset-0 flex menu-earth-spin" style={{ width: "200%" }}>
          <Continents />
          <Continents />
        </div>
        {/* cloud layer, drifting a little faster */}
        <div className="absolute inset-0 flex menu-cloud-spin opacity-60" style={{ width: "200%" }}>
          {[0, 1].map((k) => (
            <div key={k} className="relative h-full" style={{ width: "50%" }}>
              {[
                [8, 10, 20],
                [40, 24, 26],
                [62, 6, 18],
                [20, 30, 14],
                [78, 28, 22],
              ].map(([l, tp, w], i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white blur-[6px]"
                  style={{ left: `${l}%`, top: `${tp}%`, width: `${w}%`, height: "3.5%" }}
                />
              ))}
            </div>
          ))}
        </div>
        {/* atmosphere rim + night shading */}
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.18), transparent 40%), linear-gradient(to bottom, transparent 30%, rgba(2,6,23,0.75))" }} />
      </div>
    </div>
  );
}

function Moon({ locked }) {
  return (
    <div
      className="absolute rounded-full menu-float"
      style={{
        width: "clamp(56px, 11vmin, 120px)",
        height: "clamp(56px, 11vmin, 120px)",
        right: "9%",
        top: "14%",
        background: "radial-gradient(circle at 35% 30%, #f1f5f9, #94a3b8 60%, #475569)",
        boxShadow: "0 0 30px rgba(226,232,240,0.25)",
        filter: locked ? "saturate(0.6)" : "none",
      }}
      aria-hidden="true"
    >
      <div className="absolute rounded-full bg-slate-500/50" style={{ width: "22%", height: "22%", left: "24%", top: "30%" }} />
      <div className="absolute rounded-full bg-slate-500/40" style={{ width: "14%", height: "14%", left: "58%", top: "56%" }} />
      <div className="absolute rounded-full bg-slate-500/40" style={{ width: "10%", height: "10%", left: "48%", top: "20%" }} />
    </div>
  );
}

// Space view of Earth (main menu, and the welcome-home screens at the end)
export function EarthBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617]" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 110%, #0c4a6e 0%, #020617 60%)" }} />
      <Starfield />
      <Moon locked />
      <Earth />
      <div className="absolute inset-x-0 top-[38%] h-0 pointer-events-none">
        <div className="menu-satellite absolute text-xl">🛰️</div>
      </div>
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex items-center justify-center gap-3 px-6 py-3.5 sm:py-4 rounded-2xl font-display text-lg sm:text-xl font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/60 ${
        primary
          ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-[0_10px_30px_rgba(234,88,12,0.45)] border border-orange-300/60"
          : "bg-slate-900/70 hover:bg-slate-800/85 backdrop-blur-md text-slate-100 border border-white/15 shadow-lg"
      }`}
    >
      <Icon className={`w-5 h-5 ${primary ? "" : "text-sky-300"} group-hover:scale-110 transition-transform`} />
      <span>{label}</span>
    </button>
  );
}

export default function StartScreen({ t, onStartMars, onStartMoon, onOpenSettings, onOpenNasa, onOpenCredits, onClick }) {
  const [view, setView] = useState("main"); // main | missions

  const go = (next) => {
    onClick?.();
    setView(next);
  };

  return (
    <div className="fixed inset-0 z-30 overflow-hidden bg-[#020617] select-none">
      <EarthBackdrop />

      {/* ===== Foreground UI ===== */}
      <div className="relative z-10 h-full flex flex-col p-4 sm:p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenNasa}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/75 hover:bg-slate-800/90 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-bold text-sky-200 transition shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>{t.nasaDataBtn}</span>
          </button>
          <button
            type="button"
            onClick={onOpenCredits}
            title={t.menu.credits}
            aria-label={t.menu.credits}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-slate-900/75 hover:bg-slate-800/90 backdrop-blur-md border border-white/15 text-sky-300 transition shadow-lg"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>

        {view === "main" ? (
          <div key="main" className="my-auto flex flex-col items-center text-center w-full max-w-md mx-auto menu-fade-in">
            <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.65)] mb-2">
              {t.gameTitle}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-sky-100/80 drop-shadow mb-8">{t.menu.subtitle}</p>

            <div className="flex flex-col gap-3 w-full">
              <MenuButton icon={Play} label={t.menu.startGame} onClick={() => go("missions")} primary />
              <MenuButton icon={Settings} label={t.settings} onClick={onOpenSettings} />
            </div>
          </div>
        ) : (
          <div key="missions" className="my-auto flex flex-col items-center text-center max-w-3xl mx-auto w-full menu-fade-in">
            <button
              type="button"
              onClick={() => go("main")}
              className="self-start sm:self-center mb-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/75 hover:bg-slate-800/90 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-bold text-slate-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.menu.back}
            </button>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.65)] mb-2">
              {t.menu.selectMission}
            </h2>
            <p className="text-sm sm:text-base font-semibold text-sky-100/80 drop-shadow mb-6 sm:mb-8">{t.choosePlanet}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
              {/* Mars mission (unlocked) */}
              <button
                type="button"
                onClick={onStartMars}
                className="group relative text-left p-5 sm:p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-900/90 backdrop-blur-md border-2 border-orange-400/70 hover:border-orange-300 shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition-all duration-200 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/60"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center text-2xl shadow-inner">
                    🔴
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                    {t.menu.missionMars}
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-orange-300 transition">
                  {t.marsTitle}
                </h3>
                <p className="text-sm text-slate-300 mb-4">{t.marsSubtitle}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
                  <Rocket className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span>{t.marsCTA} →</span>
                </div>
              </button>

              {/* Lunar mission (Shackleton Crater) */}
              <button
                type="button"
                onClick={onStartMoon}
                className="group relative text-left p-5 sm:p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-900/90 backdrop-blur-md border-2 border-slate-300/70 hover:border-white shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition-all duration-200 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200/60"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-500 flex items-center justify-center text-2xl shadow-inner">🌕</div>
                  <span className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-300/40 text-sky-200 text-xs font-extrabold uppercase tracking-wider">
                    {t.menu.missionLunar}
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-slate-200 transition">{t.moonTitle}</h3>
                <p className="text-sm text-slate-300 mb-4">{t.moonSubtitle}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-sky-200">
                  <Rocket className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span>{t.marsCTA} →</span>
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-[11px] font-semibold text-slate-500">{t.menu.version}</div>
      </div>
    </div>
  );
}
