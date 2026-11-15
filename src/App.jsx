import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MarsScene, { createRoverState, SECRET_POS, SPACE_PIECES, ROVER_BOUNDARY } from "./components/MarsScene";
import MegaQuest, { MegaAssemble, MegaBadgeModal } from "./components/MegaQuest";
import { MEGA_TEXT } from "./data/megaText";
import CapAvatar from "./components/CapAvatar";
import WormholeQuest, { SecretBadgeModal } from "./components/WormholeQuest";
import TaskActionMenu from "./components/TaskActionMenu";
import StudioIntro from "./components/StudioIntro";
import { FACT_TEXT } from "./data/factText";
import StartScreen, { EarthBackdrop } from "./components/StartScreen";
import LaunchSequence from "./components/LaunchSequence";
import HUD from "./components/HUD";
import TaskCard from "./components/TaskCard";
import ScenarioModal from "./components/ScenarioModal";
import { CertificateModal } from "./components/QuizAndCertificate";
import QuizStation from "./components/QuizStation";
import { SettingsModal, LoseModal, NasaDataModal, CreditsModal } from "./components/Modals";
import { TRANSLATIONS } from "./data/translations";
import { MOON_TEXT } from "./data/moonText";
import {
  INITIAL_STATS,
  SURVIVAL_KEYS,
  TASKS,
  HOME_POS,
  FLAG_POS,
  SCIENCE_PER_UPGRADE,
  MAX_ROVER_LEVEL,
  REPAIR_COST,
  STAT_KEYS,
  UPGRADES_FROM,
  WORLD,
  setActiveMission,
  roverSpeedMultiplier,
  roverSizeMultiplier,
} from "./data/tasks";
import { spaceAudio } from "./utils/sound";
import { music } from "./utils/music";
import Leaderboard from "./components/Leaderboard";
import EventModal from "./components/EventModal";
import MissionLog from "./components/MissionLog";
import { HelpModal, PauseOverlay } from "./components/HelpPause";
import FlagPlantModal from "./components/FlagPlant";
import { EVENTS, EVENT_AFTER_DRIVE_SECONDS } from "./data/events";
import { configureSpeech, stopSpeaking } from "./utils/speech";
import { pauseState } from "./utils/pause";
import { STAR_BONUS } from "./data/playConfigs";

const INITIAL_ROVER = { level: 0, damaged: false, scienceUpgrades: 0 };
const NO_DPAD = { up: false, down: false, left: false, right: false };
music.attach(spaceAudio);

// Which background tune plays in each phase (null = let the launch sounds shine)
const PHASE_MUSIC = { studio: null, start: "menu", launch: null, intro: "mars", playing: "mars", secret: "menu", mega: "menu", lost: "mars", homeLaunch: null, victory: "victory", certificate: "victory" };

const EARTH_PHASES = ["victory", "certificate"];

function applyStatEffects(stats, effects) {
  const next = { ...stats };
  for (const [k, delta] of Object.entries(effects)) {
    next[k] = k === "science" ? Math.max(0, next[k] + delta) : Math.max(0, Math.min(100, next[k] + delta));
  }
  return next;
}

// Hand out any rover upgrades the player's science has earned (only while the rover isn't broken)
// Moon text sits on top of the base (Mars) text: objects merge, arrays/strings replace
function deepMerge(base, over) {
  if (!over) return base;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) {
    out[k] = v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k]) ? deepMerge(base[k], v) : v;
  }
  return out;
}

function grantScienceUpgrades(rover, science, events) {
  if (UPGRADES_FROM !== "science") return rover;
  const earned = Math.floor((science || 0) / SCIENCE_PER_UPGRADE);
  if (earned <= rover.scienceUpgrades) return rover;
  if (rover.damaged) {
    events.push({ type: "waiting" });
    return rover;
  }
  let { level } = rover;
  for (let i = rover.scienceUpgrades; i < earned; i++) {
    if (level < MAX_ROVER_LEVEL) {
      level += 1;
      events.push({ type: "upgrade", level });
    } else if (!events.some((e) => e.type === "max")) {
      events.push({ type: "max" });
    }
  }
  return { ...rover, level, scienceUpgrades: earned };
}

export default function App() {
  const [lang, setLang] = useState("en");
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [totalStars, setTotalStars] = useState(0);
  const [cadetName, setCadetName] = useState("");
  // start | launch | intro | playing | lost | homeLaunch | victory (leaderboard) | certificate
  const [phase, setPhase] = useState("studio"); // studio splash plays first, then the main menu
  const [stats, setStats] = useState({ ...INITIAL_STATS });
  const [depletedResource, setDepletedResource] = useState(null);

  // Rover-task progress
  const [taskIndex, setTaskIndex] = useState(0);
  const [revisit, setRevisit] = useState(false);
  const [rover, setRoverProgress] = useState(INITIAL_ROVER);
  const [scenario, setScenario] = useState(null); // { taskIndex, revisit, key }
  const pendingRef = useRef(null);
  const sunsetTipRef = useRef(false);
  const [toast, setToast] = useState(null);
  // Checkpoint badges + home
  const [badges, setBadges] = useState([]); // task indices whose quiz was answered
  const [quizTask, setQuizTask] = useState(null); // task index of the open badge quiz
  const [homePrompt, setHomePrompt] = useState(false);
  // Moon finale: plant Malaysia's flag before flying home
  const [flagPlanted, setFlagPlanted] = useState(false);
  const [flagModal, setFlagModal] = useState(false);
  const flagAwardRef = useRef(false);
  // Mission log stickers + surprise events
  const [missionLog, setMissionLog] = useState([]);
  const [eventIndex, setEventIndex] = useState(null);
  const eventLegRef = useRef(-1); // task leg that already had its surprise
  const eventsUsedRef = useRef([]);
  const driveTimeRef = useRef(0);
  const eventPendingRef = useRef(null);
  // Hidden wormhole quest (secret badge "?")
  const [secretDone, setSecretDone] = useState(false);
  const [secretAward, setSecretAward] = useState(false);
  const [secretStage, setSecretStage] = useState(null);
  // Press E at a task: Do task / Fact / Quit
  const [taskMenu, setTaskMenu] = useState(null);
  // Moon-only MEGA quest: pieces of space -> wormhole -> boss fight
  const [megaPieces, setMegaPieces] = useState([]);
  const [megaPortal, setMegaPortal] = useState(null);
  const [megaDone, setMegaDone] = useState(false);
  const [megaAward, setMegaAward] = useState(false);
  const [megaAssembling, setMegaAssembling] = useState(false);
  const [megaStage, setMegaStage] = useState(null);
  const [farahLine, setFarahLine] = useState(null); // Dr Farah pops up with a line
  const modalOpen = !!scenario || quizTask != null || homePrompt || eventIndex != null || flagModal || secretAward || taskMenu != null || megaAssembling || megaAward;

  const [focusModule, setFocusModule] = useState("habitat");
  const [selectedModule, setSelectedModule] = useState(null);
  const [camResetTick, setCamResetTick] = useState(0);
  const [roverMode, setRoverMode] = useState(false);
  const [dpadInput, setDpadInput] = useState(NO_DPAD);
  const roverState = useRef(null);
  if (roverState.current === null) roverState.current = createRoverState();
  const [roverNearby, setRoverNearby] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showNasa, setShowNasa] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [paused, setPausedState] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  const [bigText, setBigText] = useState(false);
  // Anything on top of the crater stops the rover
  const inputLocked = modalOpen || paused || showLog || showHelp || showSettings || showNasa;

  const [mission, setMission] = useState("mars"); // mars | moon
  // Keep the shared mission data in sync with this state (also survives dev hot-reloads)
  if (WORLD !== mission) setActiveMission(mission);
  const t = useMemo(() => (mission === "moon" ? deepMerge(TRANSLATIONS[lang], MOON_TEXT[lang]) : TRANSLATIONS[lang]), [lang, mission]);

  const capMood = useMemo(() => {
    const minVal = Math.min(...SURVIVAL_KEYS.map((k) => stats[k]));
    if (minVal <= 20) return "alert";
    if (minVal <= 35) return "worried";
    return "happy";
  }, [stats]);

  // Weather follows the current task (the Delta storm has passed on a second visit)
  // ...and the final drive to the rocket happens at a blue Mars sunset
  const env =
    phase !== "playing"
      ? mission === "moon"
        ? "moonDay"
        : "day"
      : taskIndex >= TASKS.length
      ? mission === "moon"
        ? "moonNight"
        : "night"
      : !revisit
      ? TASKS[taskIndex].env
      : "day";

  const playSfx = (type) => {
    if (!soundOn) return;
    if (type === "click") spaceAudio.playClick();
    if (type === "success") spaceAudio.playSuccess();
    if (type === "alert") spaceAudio.playAlert();
    if (type === "victory") spaceAudio.playVictory();
    if (type === "badge") spaceAudio.playBadge();
    if (type === "wrong") spaceAudio.playWrong();
    if (type === "pop") spaceAudio.playPop();
    if (type === "ding") spaceAudio.playDing();
    if (type === "whoosh") spaceAudio.playWhoosh();
    if (type === "tick") spaceAudio.playTick();
  };

  const showToast = (text) => setToast({ text, key: Date.now() });
  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    spaceAudio.setEnabled(next);
    if (next) spaceAudio.playClick();
    // Sound off silences everything, music included
    music.setEnabled(next && musicOn);
  };

  const handleToggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    music.setEnabled(next && soundOn);
    playSfx("click");
  };

  const setPaused = (value) => {
    setPausedState((cur) => {
      const next = typeof value === "function" ? value(cur) : value;
      pauseState.paused = next;
      if (next) {
        stopSpeaking();
        spaceAudio.stopHum();
        spaceAudio.setMotor(0);
      }
      return next;
    });
  };

  const setRover = (on) => {
    setRoverMode(on);
    setDpadInput(NO_DPAD);
    if (!on) setRoverNearby(null);
  };

  const resetMission = (targetPhase = "intro") => {
    setStats({ ...INITIAL_STATS });
    setTaskIndex(0);
    setRevisit(false);
    setRoverProgress(INITIAL_ROVER);
    setScenario(null);
    pendingRef.current = null;
    setBadges([]);
    setTotalStars(0);
    setMissionLog([]);
    setEventIndex(null);
    eventLegRef.current = -1;
    eventsUsedRef.current = [];
    driveTimeRef.current = 0;
    setPaused(false);
    setQuizTask(null);
    setTaskMenu(null);
    setHomePrompt(false);
    setFlagPlanted(false);
    setFlagModal(false);
    flagAwardRef.current = false;
    setSecretDone(false);
    setSecretAward(false);
    setSecretStage(null);
    setMegaPieces([]);
    setMegaPortal(null);
    setMegaDone(false);
    setMegaAward(false);
    setMegaAssembling(false);
    setMegaStage(null);
    setFarahLine(null);
    roverState.current = createRoverState();
    setDepletedResource(null);
    setFocusModule("habitat");
    setSelectedModule(null);
    setRover(false);
    setPhase(targetPhase);
  };

  const startMission = (id) => {
    playSfx("click");
    setActiveMission(id); // swap tasks, stats, events and the 3D world before resetting
    setMission(id);
    sunsetTipRef.current = false;
    resetMission("launch");
  };
  const handleStartMars = () => startMission("mars");
  const handleStartMoon = () => startMission("moon");

  const handleLaunchComplete = () => {
    if (soundOn) spaceAudio.startAmbient();
    setPhase("intro");
  };

  const handleStartMission = () => {
    playSfx("click");
    setPhase("playing");
    setRover(true);
  };

  // ----- Checkpoints: current task, badge quiz stations, and the rocket home -----
  const allDone = taskIndex >= TASKS.length;
  const targets = useMemo(() => {
    const list = [];
    if (!allDone) {
      const tk = TASKS[taskIndex];
      list.push({ key: "task-" + taskIndex, kind: "task", index: taskIndex, x: tk.pos.x, z: tk.pos.z });
    }
    TASKS.forEach((tk, i) => {
      if (i < taskIndex && !badges.includes(i)) list.push({ key: "quiz-" + i, kind: "quiz", index: i, x: tk.pos.x, z: tk.pos.z });
    });
    // Moon: the flagpole comes first, the relief ship unlocks after the flag is planted
    const flagPending = allDone && FLAG_POS && !flagPlanted;
    if (flagPending) list.push({ key: "flag", kind: "flag", index: -1, x: FLAG_POS.x, z: FLAG_POS.z });
    else if (allDone) list.push({ key: "home", kind: "home", index: -1, x: HOME_POS.x, z: HOME_POS.z });
    // The secret is never shown on the map or task list, the rover just has to stumble on it
    if (!secretDone && mission === "mars") list.push({ key: "secret", kind: "secret", index: -1, x: SECRET_POS.x, z: SECRET_POS.z });
    if (mission === "moon" && !megaDone) {
      SPACE_PIECES.forEach((p, i) => {
        if (!megaPieces.includes(i)) list.push({ key: "piece-" + i, kind: "piece", index: i, x: p.x, z: p.z });
      });
      if (megaPortal) list.push({ key: "mega", kind: "mega", index: -1, x: megaPortal.x, z: megaPortal.z });
    }
    return list;
  }, [taskIndex, badges, allDone, flagPlanted, secretDone, mission, megaDone, megaPieces, megaPortal]);
  const flagPending = allDone && !!FLAG_POS && !flagPlanted;
  const guideTarget = flagPending
    ? { x: FLAG_POS.x, z: FLAG_POS.z }
    : allDone
    ? { x: HOME_POS.x, z: HOME_POS.z }
    : { x: TASKS[taskIndex].pos.x, z: TASKS[taskIndex].pos.z };

  // Finishing the last Moon task earns the Jalur Gemilang
  useEffect(() => {
    if (phase === "playing" && flagPending && !flagAwardRef.current) {
      flagAwardRef.current = true;
      setTimeout(() => {
        showToast(t.flag.awarded);
        playSfx("badge");
      }, 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, flagPending]);

  // The rover reports which checkpoint ring it is parked in; the kid presses E (or taps) to go in
  const [nearCp, setNearCp] = useState(null);
  const handleReachCheckpoint = (target) => {
    setNearCp(target);
    if (target) playSfx("ding");
  };
  const enterCheckpoint = (target = nearCp) => {
    if (!target || phase !== "playing" || inputLocked) return;
    setDpadInput(NO_DPAD);
    if (target.kind === "task" && target.index === taskIndex) {
      setTaskMenu(target.index);
      playSfx("pop");
    } else if (target.kind === "quiz") {
      setQuizTask(target.index);
      playSfx("click");
    } else if (target.kind === "flag") {
      setFlagModal(true);
      playSfx("success");
    } else if (target.kind === "home") {
      setHomePrompt(true);
      playSfx("success");
    } else if (target.kind === "piece") {
      const mt = MEGA_TEXT[lang] || MEGA_TEXT.en;
      if (megaPieces.includes(target.index)) return;
      const next = [...megaPieces, target.index];
      setMegaPieces(next);
      playSfx("ding");
      if (next.length === 1) setFarahLine({ text: mt.firstPiece, key: Date.now() });
      else showToast(mt.pieceCount.replace("{n}", next.length));
      if (next.length >= SPACE_PIECES.length) setTimeout(() => setMegaAssembling(true), 900);
    } else if (target.kind === "mega") {
      setNearCp(null);
      setMegaStage("suck");
      setPhase("mega");
      playSfx("alert");
    } else if (target.kind === "secret") {
      setNearCp(null);
      setSecretStage("suck");
      setPhase("secret");
      playSfx("alert");
    }
  };

  const handleSecretStage = useCallback((s) => setSecretStage(s), []);
  const handleStudioDone = useCallback(() => setPhase((p) => (p === "studio" ? "start" : p)), []);
  const handleMegaStage = useCallback((s) => setMegaStage(s), []);
  // All 6 pieces glued together: a wormhole opens just in front of the rover
  const handleMegaAssembled = useCallback(() => {
    const s = roverState.current;
    let x = s.pos.x + Math.sin(s.rotY) * 5;
    let z = s.pos.z + Math.cos(s.rotY) * 5;
    const d = Math.hypot(x, z);
    const max = ROVER_BOUNDARY - 4;
    if (d > max) {
      x *= max / d;
      z *= max / d;
    }
    setMegaPortal({ x, z });
    setMegaAssembling(false);
    setFarahLine({ text: (MEGA_TEXT[lang] || MEGA_TEXT.en).portalReady, key: Date.now() });
    playSfx("badge");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, soundOn]);
  const handleMegaComplete = () => {
    roverState.current = createRoverState();
    setMegaDone(true);
    setMegaPortal(null);
    setMegaStage(null);
    setPhase("playing");
    setMegaAward(true);
    playSfx("victory");
  };
  // Dr Farah's pop-up line hides itself
  useEffect(() => {
    if (!farahLine) return undefined;
    const id = setTimeout(() => setFarahLine(null), 6500);
    return () => clearTimeout(id);
  }, [farahLine]);
  const handleSecretComplete = () => {
    // The aliens' portal drops the rover back at the compound
    roverState.current = createRoverState();
    setSecretDone(true);
    setSecretStage(null);
    setPhase("playing");
    setSecretAward(true);
    playSfx("victory");
  };

  const handleBadge = (idx) => {
    if (badges.includes(idx)) return;
    setBadges((b) => (b.includes(idx) ? b : [...b, idx]));
    if (UPGRADES_FROM === "badges" && rover.level < MAX_ROVER_LEVEL) {
      const level = rover.level + 1;
      setRoverProgress((r) => ({ ...r, level: Math.min(MAX_ROVER_LEVEL, r.level + 1) }));
      setTimeout(() => showToast(`🚙✨ ${t.blast.roverUpgraded} ${t.blast.upgradeNames[level - 1]}`), 400);
    }
  };

  // Called by the scenario modal after the kid has played the chosen option (A/B/C or "revisit")
  const handleChoose = (choiceIdx, stars = 1) => {
    const task = TASKS[scenario.taskIndex];
    const isRevisit = choiceIdx === "revisit";
    const choice = isRevisit ? task.revisit : task.choices[choiceIdx];
    // Star bonus goes to Science (Mars); on the Moon stars count toward Mission Points instead
    const bonus = STAT_KEYS.includes("science") ? STAR_BONUS[stars] || 0 : 0;
    const before = { ...stats };
    const next = applyStatEffects(stats, bonus ? { ...choice.effects, science: (choice.effects.science || 0) + bonus } : choice.effects);

    const events = [];
    let nextRover = { ...rover };
    const roverEffect = isRevisit ? "none" : choice.rover;
    if (roverEffect === "damage") {
      nextRover.damaged = true;
      events.push({ type: "damage" });
    } else if (roverEffect === "upgrade") {
      // The upgrade choices rebuild the rover, which also fixes any damage
      nextRover.damaged = false;
      if (nextRover.level < MAX_ROVER_LEVEL) {
        nextRover.level += 1;
        events.push({ type: "upgrade", level: nextRover.level });
      } else {
        events.push({ type: "max" });
      }
    }
    nextRover = grantScienceUpgrades(nextRover, next.science, events);

    const completes = isRevisit || choice.completes;
    const lostKey = SURVIVAL_KEYS.find((k) => next[k] <= 0) || null;

    setStats(next);
    setRoverProgress(nextRover);
    setTotalStars((n) => n + stars);
    setMissionLog((log) => [...log, { taskIndex: scenario.taskIndex, choice: choiceIdx, stars, completes, roverEvents: events.map((e) => e.type) }]);
    pendingRef.current = { completes, lostKey, taskIndex: scenario.taskIndex };

    if (soundOn) {
      if (lostKey || roverEffect === "damage") spaceAudio.playAlert();
      else if (events.some((e) => e.type === "upgrade")) spaceAudio.playVictory();
      else spaceAudio.playSuccess();
    }
    return { effects: choice.effects, roverEvents: events, completes, lostKey, stars, bonus, before, after: next };
  };

  const handleBlastOffHome = () => {
    playSfx("click");
    setRover(false);
    setPhase("homeLaunch");
  };

  // After the outcome screen: back to the rover, or straight into the badge quiz
  const handleScenarioFinish = ({ quiz = false } = {}) => {
    const p = pendingRef.current;
    pendingRef.current = null;
    setScenario(null);
    if (!p) return;
    if (p.lostKey) {
      setDepletedResource(p.lostKey);
      setRover(false);
      setPhase("lost");
      return;
    }
    if (p.completes) {
      setTaskIndex((i) => i + 1);
      setRevisit(false);
    } else {
      setRevisit(true);
    }
    playSfx("click");
    showToast(t.blast.logAdded);
    if (quiz && p.completes) setQuizTask(p.taskIndex);
  };

  // ----- Surprise events while driving between tasks -----
  const handleEventChoose = (i) => {
    const ev = EVENTS[eventIndex];
    const before = { ...stats };
    const next = applyStatEffects(stats, ev.choices[i].effects);
    const evs = [];
    setRoverProgress((r) => grantScienceUpgrades(r, next.science, evs));
    setStats(next);
    eventPendingRef.current = SURVIVAL_KEYS.find((k) => next[k] <= 0) || null;
    playSfx(eventPendingRef.current ? "alert" : "success");
    return { before, after: next };
  };
  const handleEventClose = () => {
    const lost = eventPendingRef.current;
    eventPendingRef.current = null;
    setEventIndex(null);
    playSfx("click");
    if (lost) {
      setDepletedResource(lost);
      setRover(false);
      setPhase("lost");
    }
  };

  // ----- Rover repair at the habitat garage -----
  const handleRepair = () => {
    if (!rover.damaged || Object.entries(REPAIR_COST).some(([k, v]) => stats[k] <= -v)) return;
    const next = applyStatEffects(stats, REPAIR_COST);
    const events = [];
    const fixed = grantScienceUpgrades({ ...rover, damaged: false }, next.science, events);
    setStats(next);
    setRoverProgress(fixed);
    const upgrades = events.filter((e) => e.type === "upgrade").map((e) => `🚙✨ ${t.blast.upgradeNames[e.level - 1]}`);
    showToast([t.blast.repairDone, ...upgrades].join("  •  "));
    if (soundOn) (upgrades.length ? spaceAudio.playVictory() : spaceAudio.playSuccess());
  };

  const handleSelectModule = (modId) => {
    setSelectedModule(modId);
    if (modId) {
      playSfx("click");
      setFocusModule(modId);
    }
  };

  const handleRoverNearby = useCallback(
    (id) => {
      setRoverNearby(id);
      if (id) {
        setSelectedModule(id);
        if (soundOn) spaceAudio.playSuccess();
      }
    },
    [soundOn]
  );

  // ----- Background music -----
  useEffect(() => {
    music.play(musicOn && soundOn ? PHASE_MUSIC[phase] : null);
  }, [phase, musicOn, soundOn]);
  useEffect(() => {
    music.setDucked(modalOpen || paused);
  }, [modalOpen, paused]);

  // First blue sunset: Cap explains why it's blue
  useEffect(() => {
    // Mars: first blue sunset. Moon: as soon as you start (Earth hanging in a black sky)
    const show = phase === "playing" && (mission === "moon" || env === "night");
    if (show && !sunsetTipRef.current) {
      sunsetTipRef.current = true;
      showToast(t.sky.blueSunsetTip);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env, phase, mission]);

  // Cap's voice follows the language, sound and auto-read settings
  useEffect(() => {
    configureSpeech({ lang, auto: autoRead, enabled: soundOn });
  }, [lang, autoRead, soundOn]);

  // Bigger text for young readers (everything is sized in rem)
  useEffect(() => {
    document.documentElement.style.fontSize = bigText ? "112.5%" : "";
  }, [bigText]);

  // Auto-pause when the tab/app is hidden; P toggles pause
  useEffect(() => {
    const onHide = () => {
      if (document.hidden && (phase === "playing" || phase === "secret" || phase === "mega")) setPaused(true);
    };
    const onKey = (e) => {
      if (e.code === "KeyP" && (phase === "playing" || phase === "secret" || phase === "mega")) setPaused((v) => !v);
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // One surprise event per trip between checkpoints, after a few seconds of real driving
  useEffect(() => {
    if (phase !== "playing" || !roverMode || inputLocked || taskIndex < 1 || eventLegRef.current === taskIndex) return undefined;
    const id = setInterval(() => {
      if (Math.abs(roverState.current?.speed || 0) > 0.8) driveTimeRef.current += 0.5;
      if (driveTimeRef.current < EVENT_AFTER_DRIVE_SECONDS) return;
      let pool = EVENTS.map((_, i) => i).filter((i) => !eventsUsedRef.current.includes(i));
      if (!pool.length) {
        eventsUsedRef.current = [];
        pool = EVENTS.map((_, i) => i);
      }
      const pick = pool[Math.floor(Math.random() * pool.length)];
      eventsUsedRef.current.push(pick);
      eventLegRef.current = taskIndex;
      driveTimeRef.current = 0;
      setDpadInput(NO_DPAD);
      setEventIndex(pick);
      playSfx("alert");
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roverMode, inputLocked, taskIndex]);
  // Browsers only allow audio after the first tap/click: wake the audio up then
  useEffect(() => {
    const wake = () => {
      if (spaceAudio.enabled) spaceAudio.ensureContext();
    };
    window.addEventListener("pointerdown", wake);
    window.addEventListener("keydown", wake);
    return () => {
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, []);

  // Rover mode only while on Mars
  useEffect(() => {
    if (roverMode && !(phase === "intro" || phase === "playing")) setRover(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // E enters the checkpoint the rover is parked in
  useEffect(() => {
    if (!nearCp || !roverMode || inputLocked) return undefined;
    const onKey = (e) => {
      if (e.code === "KeyE") enterCheckpoint();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearCp, roverMode, inputLocked, taskIndex, revisit]);

  // Esc leaves rover mode (not while a task is open)
  useEffect(() => {
    if (!roverMode || modalOpen || phase === "secret" || phase === "mega") return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setRover(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [roverMode, modalOpen, phase]);

  const handleResetCam = () => {
    playSfx("click");
    setRover(false);
    setFocusModule("habitat");
    setSelectedModule(null);
    setCamResetTick((n) => n + 1);
  };

  const onEarth = EARTH_PHASES.includes(phase);
  const onMarsHud = phase === "intro" || phase === "playing" || phase === "lost";

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      {/* 3D Jezero Crater (hidden once we're home on Earth) */}
      {/* the 3D world stays unloaded during the studio intro, so it can never peek through */}
      {!onEarth && phase !== "studio" && !(phase === "secret" && secretStage !== "suck") && !(phase === "mega" && megaStage !== "suck") && (
        <MarsScene
          key={mission}
          phase={phase}
          stats={stats}
          env={env}
          focusModule={focusModule}
          selectedModule={selectedModule}
          onSelectModule={handleSelectModule}
          camResetTick={camResetTick}
          roverMode={roverMode}
          dpadInput={dpadInput}
          moduleLabels={t.modules}
          roverState={roverState}
          onRoverNearby={handleRoverNearby}
          taskIndex={taskIndex}
          taskLabels={t.tasks.map((x) => x.short)}
          roverSpeed={roverSpeedMultiplier(rover.level, rover.damaged)}
          roverSize={roverSizeMultiplier(rover.level)}
          roverDamaged={rover.damaged}
          inputLocked={inputLocked || phase === "secret" || phase === "mega"}
          onReachCheckpoint={handleReachCheckpoint}
          targets={targets}
          guideTarget={guideTarget}
          badges={badges}
          quizLabel={t.blast.quizStation}
          homeLabel={t.blast.homeCheckpoint}
          flagActive={flagPending}
          flagPlanted={flagPlanted}
          flagLabel={t.flag?.checkpoint || ""}
          skyLabels={t.sky}
          onFirstHop={() => showToast(t.sky.lowGravityTip)}
          secretActive={phase === "playing" && !secretDone && mission === "mars"}
          spacePieces={phase === "playing" && mission === "moon" && !megaDone ? SPACE_PIECES.map((_, i) => i).filter((i) => !megaPieces.includes(i)) : []}
          megaPortal={phase === "playing" && mission === "moon" && !megaDone ? megaPortal : null}
        />
      )}
      {onEarth && (
        <div className="fixed inset-0 z-0">
          <EarthBackdrop />
        </div>
      )}

      {/* Game studio splash (Interstellar V) before the main menu */}
      {phase === "studio" && <StudioIntro onDone={handleStudioDone} onSfx={playSfx} />}

      {/* Main menu */}
      {/* main menu is already drawn under the studio intro, so the intro fades straight into it */}
      {(phase === "start" || phase === "studio") && (
        <StartScreen
          t={t}
          onStartMars={handleStartMars}
          onStartMoon={handleStartMoon}
          onOpenSettings={() => {
            playSfx("click");
            setShowSettings(true);
          }}
          onOpenNasa={() => {
            playSfx("click");
            setShowNasa(true);
          }}
          onOpenCredits={() => {
            playSfx("click");
            setShowCredits(true);
          }}
          onClick={() => playSfx("click")}
        />
      )}

      {/* Earth -> Mars, and Mars -> Earth at the end */}
      {phase === "launch" && <LaunchSequence t={t} soundOn={soundOn} world={mission} onComplete={handleLaunchComplete} />}
      {phase === "homeLaunch" && (
        <LaunchSequence
          t={t}
          soundOn={soundOn}
          world={mission}
          home
          onComplete={() => {
            playSfx("victory");
            setPhase("victory");
          }}
        />
      )}

      {onMarsHud && (
        <HUD
          t={t}
          stats={stats}
          taskIndex={taskIndex}
          roverMode={roverMode}
          roverLevel={rover.level}
          roverDamaged={rover.damaged}
          onToggleRoverMode={() => {
            playSfx("click");
            setRover(!roverMode);
          }}
          onResetCam={handleResetCam}
          onOpenSettings={() => {
            playSfx("click");
            setShowSettings(true);
          }}
          onOpenNasa={() => {
            playSfx("click");
            setShowNasa(true);
          }}
          onDpadChange={setDpadInput}
          roverState={roverState}
          roverNearby={roverNearby}
          onExitRover={() => {
            playSfx("click");
            setRover(false);
          }}
          onRepair={handleRepair}
          showRoverControls={!modalOpen}
          badges={badges}
          nearCp={inputLocked ? null : nearCp}
          onEnterCheckpoint={() => enterCheckpoint()}
          logCount={missionLog.length}
          flagPending={flagPending}
          onPause={() => {
            playSfx("click");
            setPaused(true);
          }}
          onHelp={() => {
            playSfx("click");
            setShowHelp(true);
          }}
          onOpenLog={() => {
            playSfx("click");
            setShowLog(true);
          }}
          secretBadge={secretDone}
          megaBadge={megaDone}
        />
      )}

      {/* Hidden wormhole quest */}
      {phase === "secret" && (
        <WormholeQuest
          lang={lang}
          play={t.play}
          soundOn={soundOn}
          locked={paused || showSettings || showHelp || showLog || showNasa}
          onSfx={playSfx}
          onStageChange={handleSecretStage}
          onComplete={handleSecretComplete}
          onPause={() => {
            playSfx("click");
            setPaused(true);
          }}
        />
      )}
      {/* Moon MEGA quest */}
      {phase === "playing" && megaAssembling && <MegaAssemble lang={lang} onDone={handleMegaAssembled} />}
      {phase === "mega" && (
        <MegaQuest
          lang={lang}
          soundOn={soundOn}
          locked={paused || showSettings || showHelp || showLog || showNasa}
          onSfx={playSfx}
          onStageChange={handleMegaStage}
          onComplete={handleMegaComplete}
          onPause={() => {
            playSfx("click");
            setPaused(true);
          }}
        />
      )}
      {phase === "playing" && megaAward && (
        <MegaBadgeModal
          lang={lang}
          onClose={() => {
            playSfx("click");
            setMegaAward(false);
            setRover(true);
          }}
        />
      )}
      {phase === "playing" && farahLine && (
        <div key={farahLine.key} className="rover-pop-in fixed left-3 sm:left-5 bottom-48 sm:bottom-52 z-30 pointer-events-none">
          <CapAvatar mood="happy" message={farahLine.text} />
        </div>
      )}

      {phase === "playing" && secretAward && (
        <SecretBadgeModal
          lang={lang}
          onClose={() => {
            playSfx("click");
            setSecretAward(false);
            setRover(true);
          }}
        />
      )}

      {(phase === "intro" || (phase === "playing" && !roverMode && !modalOpen)) && (
        <TaskCard
          t={t}
          phase={phase}
          taskIndex={taskIndex}
          revisit={revisit}
          capMood={capMood}
          roverDamaged={rover.damaged}
          onStartMission={handleStartMission}
          onDrive={() => {
            playSfx("click");
            setRover(true);
          }}
          flagPending={flagPending}
          onDriveHome={() => {
            playSfx("click");
            setRover(true);
          }}
        />
      )}

      {/* Back on Earth: mission points + leaderboard */}
      {phase === "victory" && (
        <Leaderboard
          t={t}
          stats={stats}
          badges={badges.length}
          stars={totalStars}
          roverLevel={rover.level}
          name={cadetName}
          onNameChange={setCadetName}
          onSfx={(name, i) => {
            if (!soundOn) return;
            if (name === "tick") spaceAudio.playTick(i);
            else playSfx(name);
          }}
          onContinue={() => {
            playSfx("click");
            setPhase("certificate");
          }}
        />
      )}

      {/* Checkpoint task: problem -> astronaut animation -> consequences */}
      {phase === "playing" && scenario && (
        <ScenarioModal
          key={scenario.key}
          t={t}
          taskIndex={scenario.taskIndex}
          revisit={scenario.revisit}
          soundOn={soundOn}
          badgeEarned={badges.includes(scenario.taskIndex)}
          onSfx={playSfx}
          onChoose={handleChoose}
          onFinish={handleScenarioFinish}
        />
      )}

      {phase === "playing" && taskMenu != null && (
        <TaskActionMenu
          t={t}
          lang={lang}
          taskIndex={taskMenu}
          onSfx={playSfx}
          onDoTask={() => {
            setTaskMenu(null);
            setScenario({ taskIndex: taskMenu, revisit, key: Date.now() });
            playSfx("alert");
          }}
          onQuit={() => {
            setTaskMenu(null);
            playSfx("click");
            showToast(`🚙 ${(FACT_TEXT[lang] || FACT_TEXT.en).ui.quitToast}`);
          }}
        />
      )}

      {phase === "playing" && quizTask != null && (
        <QuizStation
          key={quizTask}
          t={t}
          taskIndex={quizTask}
          onCorrect={handleBadge}
          onSfx={playSfx}
          onClose={() => {
            playSfx("click");
            setQuizTask(null);
            setRover(true);
          }}
        />
      )}

      {phase === "playing" && flagModal && (
        <FlagPlantModal
          t={t}
          soundOn={soundOn}
          onDone={() => {
            setFlagModal(false);
            setFlagPlanted(true);
            setMissionLog((log) => [...log, { type: "flag" }]);
            showToast(t.flag.readyHome);
            playSfx("click");
            setRover(true);
          }}
        />
      )}

      {phase === "playing" && homePrompt && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm">
          <div className="rover-pop-in w-full max-w-md bg-slate-900 border-2 border-sky-400/60 rounded-3xl p-5 sm:p-6 shadow-2xl text-center">
            <div className="text-6xl mb-2">🚀</div>
            <h2 className="font-display text-2xl font-bold text-white">{t.blast.homeTitle}</h2>
            <p className="text-sm font-bold text-slate-300 mt-1">{t.blast.homeText}</p>
            <div className="flex justify-center gap-1.5 my-3 text-3xl">
              {TASKS.map((tk, i) => (
                <span key={tk.id} className={badges.includes(i) ? "" : "grayscale opacity-30"}>
                  {tk.badge}
                </span>
              ))}
            </div>
            {badges.length < TASKS.length && (
              <p className="text-sm font-bold text-violet-200 mb-3">{t.blast.badgesMissing.replace("{n}", TASKS.length - badges.length)}</p>
            )}
            <div className="grid gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setHomePrompt(false);
                  handleBlastOffHome();
                }}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-display font-bold text-xl shadow-lg"
              >
                🚀 {t.blast.flyHome}
              </button>
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  setHomePrompt(false);
                  setRover(true);
                }}
                className="py-3 rounded-2xl bg-slate-800 border-2 border-cyan-400/50 text-cyan-100 font-display font-bold text-lg"
              >
                🚙 {t.blast.keepExploring}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "playing" && eventIndex != null && (
        <EventModal key={eventIndex} t={t} eventIndex={eventIndex} onChoose={handleEventChoose} onClose={handleEventClose} onSfx={playSfx} />
      )}

      {paused && (phase === "playing" || phase === "secret" || phase === "mega") && (
        <PauseOverlay
          t={t}
          onResume={() => {
            playSfx("click");
            setPaused(false);
          }}
          onHelp={() => setShowHelp(true)}
          onSettings={() => setShowSettings(true)}
          onLog={() => setShowLog(true)}
          onResetCam={() => {
            setPaused(false);
            handleResetCam();
          }}
          onNasa={() => setShowNasa(true)}
        />
      )}

      {showLog && <MissionLog t={t} log={missionLog} badges={badges} onClose={() => setShowLog(false)} />}
      {showHelp && <HelpModal t={t} onClose={() => setShowHelp(false)} />}

      {toast && (
        <div className="fixed top-24 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
          <div key={toast.key} className="rover-pop-in px-5 py-3 rounded-2xl bg-emerald-400 text-slate-950 font-bold shadow-xl text-sm sm:text-base text-center">
            {toast.text}
          </div>
        </div>
      )}

      {phase === "lost" && (
        <LoseModal
          t={t}
          depletedResource={depletedResource}
          onRetry={() => {
            playSfx("click");
            resetMission("intro");
          }}
        />
      )}


      {phase === "certificate" && (
        <CertificateModal
          t={t}
          stats={stats}
          roverLevel={rover.level}
          badges={badges}
          initialName={cadetName}
          flagPlanted={flagPlanted}
          onOpenLog={() => {
            playSfx("click");
            setShowLog(true);
          }}
          onPlayAgain={() => {
            playSfx("click");
            resetMission("start");
          }}
          onOpenNasa={() => {
            playSfx("click");
            setShowNasa(true);
          }}
        />
      )}

      {showSettings && (
        <SettingsModal
          t={t}
          lang={lang}
          onChangeLang={(nextLang) => {
            playSfx("click");
            setLang(nextLang);
          }}
          soundOn={soundOn}
          onToggleSound={handleToggleSound}
          musicOn={musicOn}
          onToggleMusic={handleToggleMusic}
          autoRead={autoRead}
          onToggleAutoRead={() => {
            playSfx("click");
            setAutoRead((v) => !v);
          }}
          bigText={bigText}
          onToggleBigText={() => {
            playSfx("click");
            setBigText((v) => !v);
          }}
          onClose={() => {
            playSfx("click");
            setShowSettings(false);
          }}
        />
      )}

      {showCredits && (
        <CreditsModal
          t={t}
          onClose={() => {
            playSfx("click");
            setShowCredits(false);
          }}
        />
      )}

      {showNasa && (
        <NasaDataModal
          t={t}
          onClose={() => {
            playSfx("click");
            setShowNasa(false);
          }}
        />
      )}
    </div>
  );
}
