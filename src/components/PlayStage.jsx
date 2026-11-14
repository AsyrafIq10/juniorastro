import React, { useEffect, useMemo, useRef, useState } from "react";
import { GAMES } from "./MiniGames";
import { PLAY_CONFIGS, starsFor } from "../data/playConfigs";
import { spaceAudio } from "../utils/sound";
import SpeakButton from "./SpeakButton";
import { useAutoSpeak, stopSpeaking } from "../utils/speech";

const CONTROL_ICONS = { hold: "✋", steer: "🕹️", aim: "🎯", balance: "⚖️", breathe: "🫁", rhythm: "🥁", drag: "💧", swipe: "🧹", tapTiming: "📈" };

// Everything the kid "feels" inside the spacesuit while doing a task:
// visor frame, heart rate / suit temperature / oxygen, breathing + heartbeat sounds,
// frost on the glass when cold, dust in storms, shake + phone vibration on bumps.
export default function PlayStage({ preset, goal, p, soundOn, onDone }) {
  const cfg = PLAY_CONFIGS[preset];
  const Game = GAMES[cfg.type];
  const [stage, setStage] = useState("brief"); // brief | countdown | play | stars
  const [count, setCount] = useState(3);
  const [stars, setStars] = useState(0);
  const visorRef = useRef(null);
  const [vitals, setVitals] = useState({ bpm: 82, temp: 21, o2: 99, cold: 0 });
  const feelRef = useRef({ stress: 0.2, cold: 0, ownBreath: false });
  const startRef = useRef(0);
  const sound = soundOn;

  // Stable API handed to the mini-game
  const feel = useMemo(
    () => ({
      set: (v) => Object.assign(feelRef.current, v),
      bump: () => {
        // Shake the helmet view (Web Animations so the game itself isn't re-rendered)
        visorRef.current?.animate?.(
          [
            { transform: "translate(0,0)" },
            { transform: "translate(-6px,3px) rotate(-0.6deg)" },
            { transform: "translate(5px,-4px) rotate(0.5deg)" },
            { transform: "translate(-3px,2px)" },
            { transform: "translate(0,0)" },
          ],
          { duration: 350, easing: "ease-out" }
        );
        try {
          navigator.vibrate?.(120);
        } catch {
          // ignore
        }
        if (sound) spaceAudio.playBump();
      },
      sound: (name) => {
        if (!sound) return;
        if (name === "breath") spaceAudio.playBreath(feelRef.current.stress);
        else if (name === "zap") spaceAudio.playZap();
        else if (name === "success") spaceAudio.playSuccess();
        else if (name === "click") spaceAudio.playClick();
        else if (name === "miss") spaceAudio.playTone(180, 0.15, "triangle", 0.1);
        else if (name === "whoosh") spaceAudio.playWhoosh();
        else if (name === "tick") spaceAudio.playTick();
      },
      hum: (on, kind) => {
        if (!sound) return;
        if (on) spaceAudio.startHum(kind);
        else spaceAudio.stopHum();
      },
    }),
    [sound]
  );

  // 3-2-1 countdown
  useEffect(() => {
    if (stage !== "countdown") return undefined;
    if (count === 0) {
      startRef.current = performance.now();
      setStage("play");
      if (sound) spaceAudio.playCountdownBeep(true);
      return undefined;
    }
    if (sound) spaceAudio.playCountdownBeep(false);
    const id = setTimeout(() => setCount((c) => c - 1), 750);
    return () => clearTimeout(id);
  }, [stage, count, sound]);

  // Vitals readout (smoothed) while playing
  useEffect(() => {
    if (stage !== "play") return undefined;
    const id = setInterval(() => {
      const f = feelRef.current;
      const secs = (performance.now() - startRef.current) / 1000;
      setVitals((v) => ({
        bpm: Math.round(v.bpm + (78 + f.stress * 72 - v.bpm) * 0.25),
        temp: Math.round((v.temp + (22 - f.cold * 20 - v.temp) * 0.2) * 10) / 10,
        o2: Math.max(90, Math.round(99 - secs * 0.25 - f.stress * 2)),
        cold: f.cold,
      }));
    }, 150);
    return () => clearInterval(id);
  }, [stage]);

  // Breathing inside the helmet (faster when stressed) + heartbeat when the heart races
  useEffect(() => {
    if (stage !== "play" || !sound) return undefined;
    let breathT;
    let beatT;
    let alive = true;
    const breathe = () => {
      if (!alive) return;
      const f = feelRef.current;
      if (!f.ownBreath) spaceAudio.playBreath(f.stress);
      breathT = setTimeout(breathe, (3.4 - f.stress * 1.8) * 1000);
    };
    const beat = () => {
      if (!alive) return;
      const f = feelRef.current;
      if (f.stress > 0.55) spaceAudio.playHeartbeat();
      beatT = setTimeout(beat, 60000 / (78 + f.stress * 72));
    };
    breathe();
    beat();
    return () => {
      alive = false;
      clearTimeout(breathT);
      clearTimeout(beatT);
      spaceAudio.stopHum();
    };
  }, [stage, sound]);

  // Enter starts the task from the briefing
  useEffect(() => {
    if (stage !== "brief") return undefined;
    const onKey = (e) => {
      if (e.key === "Enter") setStage("countdown");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage]);

  const finish = (score) => {
    const s = starsFor(score);
    setStars(s);
    setStage("stars");
    if (sound) (s === 3 ? spaceAudio.playVictory() : spaceAudio.playSuccess());
  };

  useAutoSpeak(`${goal} ${p.controls[cfg.type]}`, stage === "brief");
  useEffect(() => {
    if (stage === "countdown") stopSpeaking();
  }, [stage]);

  const dusty = cfg.env === "storm" || cfg.env === "dustDevil";
  const heartDur = `${(60 / vitals.bpm).toFixed(2)}s`;

  return (
    <div className="space-y-2">
      {/* Suit vitals (helmet display) */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-extrabold">
        <span className={`px-2.5 py-1 rounded-full border ${vitals.bpm > 120 ? "bg-rose-500/25 border-rose-400/60 text-rose-200" : "bg-slate-800 border-white/15 text-rose-200"}`}>
          <span className="inline-block suit-heart" style={{ animationDuration: heartDur }}>
            ❤️
          </span>{" "}
          {p.vitals.heart} {vitals.bpm} bpm
        </span>
        <span className={`px-2.5 py-1 rounded-full border ${vitals.temp < 12 ? "bg-sky-500/25 border-sky-300/60 text-sky-100" : "bg-slate-800 border-white/15 text-amber-100"}`}>
          🌡️ {p.vitals.temp} {vitals.temp.toFixed(0)}°C
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-white/15 text-cyan-100">
          🫁 {p.vitals.o2} {vitals.o2}%
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-white/15 text-slate-300">📡 {p.vitals.delay}</span>
      </div>

      {/* Helmet visor */}
      <div
        ref={visorRef}
        className="relative rounded-[28px] overflow-hidden border-[6px] border-slate-300/90 bg-slate-950 shadow-[0_0_0_3px_rgba(15,23,42,1),0_10px_30px_rgba(0,0,0,.5)]"
      >
        {stage === "play" || stage === "stars" ? (
          <Game cfg={cfg} p={p} feel={feel} onFinish={finish} />
        ) : (
          <div className="aspect-[800/360] bg-gradient-to-b from-slate-800 to-slate-950" />
        )}

        {/* glass + helmet edge */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 100% at 50% 50%, transparent 62%, rgba(15,23,42,.6) 100%), linear-gradient(115deg, rgba(255,255,255,.14) 0%, rgba(255,255,255,0) 22%)",
          }}
        />
        {/* frost creeping in from the edges */}
        {vitals.cold > 0.12 && stage === "play" && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{ background: `radial-gradient(ellipse at center, transparent ${68 - vitals.cold * 38}%, rgba(224,242,254,${0.2 + vitals.cold * 0.6}) 100%)` }}
          />
        )}
        {dusty && stage === "play" && <div className="pointer-events-none absolute inset-0 suit-dust" />}

        {/* briefing */}
        {stage === "brief" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 text-center">
            <div className="text-4xl sm:text-5xl">{CONTROL_ICONS[cfg.type]}</div>
            <p className="flex items-center gap-2 font-display text-base sm:text-xl font-bold text-white max-w-lg">
              <span>{goal}</span>
              <SpeakButton text={`${goal} ${p.controls[cfg.type]}`} />
            </p>
            <p className="text-xs sm:text-sm font-semibold text-cyan-200 max-w-lg">🎮 {p.controls[cfg.type]}</p>
            <button
              type="button"
              onClick={() => setStage("countdown")}
              className="mt-1 px-7 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 font-display font-bold text-lg shadow-lg hover:-translate-y-0.5 transition"
            >
              🚀 {p.start}
            </button>
          </div>
        )}

        {/* countdown */}
        {stage === "countdown" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span key={count} className="rover-pop-in font-display text-7xl sm:text-8xl font-bold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              {count}
            </span>
          </div>
        )}

        {/* stars */}
        {stage === "stars" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/70 backdrop-blur-[2px] p-4 text-center">
            <div className="flex gap-2 text-4xl sm:text-6xl">
              {[1, 2, 3].map((n) => (
                <span key={n} className={`rover-pop-in ${n <= stars ? "" : "grayscale opacity-30"}`} style={{ animationDelay: `${n * 0.15}s` }}>
                  ⭐
                </span>
              ))}
            </div>
            <p className="font-display text-xl sm:text-3xl font-bold text-white">{p.starLines[stars - 1]}</p>
            <button
              type="button"
              onClick={() => onDone(stars)}
              className="mt-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-display font-bold text-lg shadow-lg hover:-translate-y-0.5 transition"
            >
              {p.seeResults} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
