// "Blast Off!" rover expeditions: 5 checkpoint tasks per mission (Mars: Jezero Crater, Moon: Shackleton Crater).
// All player-facing text lives in translations (t.tasks[i]); this file holds the game numbers.
// The exports below are *live*: setActiveMission() swaps them, and every component that imports them
// reads the active mission on its next render.
import { setEventsFor } from "./events";

// ---------- Shared ----------
export const ALL_STAT_META = {
  health: { icon: "❤️", bar: "bg-rose-400", text: "text-rose-300", border: "border-rose-400/30" },
  power: { icon: "⚡", bar: "bg-amber-400", text: "text-amber-300", border: "border-amber-400/30" },
  supplies: { icon: "🌱", bar: "bg-emerald-400", text: "text-emerald-300", border: "border-emerald-400/30" },
  science: { icon: "🔬", bar: "bg-violet-400", text: "text-violet-300", border: "border-violet-400/30" },
  oxygen: { icon: "🫁", bar: "bg-cyan-400", text: "text-cyan-300", border: "border-cyan-400/30" },
  food: { icon: "🍎", bar: "bg-emerald-400", text: "text-emerald-300", border: "border-emerald-400/30" },
  shielding: { icon: "🛡️", bar: "bg-indigo-400", text: "text-indigo-300", border: "border-indigo-400/30" },
};

// Rover progression
export const SCIENCE_PER_UPGRADE = 50;
export const MAX_ROVER_LEVEL = 3;
export const SPEED_PER_LEVEL = 0.15;
export const SIZE_PER_LEVEL = 0.1;
export const DAMAGED_SPEED = 0.7;
export const CHECKPOINT_RADIUS = 2.6;

// rover: "damage" | "upgrade" | "none"
// play: hands-on mini-game id (see data/playConfigs.js)
// icon: big emoji on the choice card
// scene: which animated problem scene (ProblemScene.jsx)
// hotspots: tap-to-discover spots in the problem scene (800×360 stage), labels in the text files
// badge + quiz: checkpoint quiz (question text in the text files), correct = option index

// ---------- Mars: Jezero Crater ----------
const MARS = {
  id: "mars",
  initialStats: { health: 90, power: 90, supplies: 90, science: 0 },
  // Running out of any of these ends the mission. Science is progress, not survival.
  survivalKeys: ["health", "power", "supplies"],
  statKeys: ["health", "power", "supplies", "science"],
  upgradesFrom: "science",
  repairCost: { supplies: -10 },
  homePos: { x: 9, z: -18.5 },
  flagPos: null,
  gravity: 3.71,
  tasks: [
    {
      id: 1,
      pos: { x: 14, z: -12 },
      env: "day",
      prop: "drone",
      scene: "drone",
      badge: "🚁",
      hotspots: [{ x: 532, y: 246 }, { x: 400, y: 80 }, { x: 488, y: 284 }],
      quiz: { correct: 0, emojis: ["🌬️", "🐦", "🎵"] },
      choices: [
        { effects: { health: -10, supplies: -10, science: 20 }, rover: "none", completes: true, play: "fixDrone", icon: "🔧" },
        { effects: { power: -10, science: 10 }, rover: "damage", completes: true, play: "carryDrone", icon: "🧳" },
        { effects: { power: 10, science: 5 }, rover: "upgrade", completes: true, play: "salvageDrone", icon: "🔋" },
      ],
    },
    {
      id: 2,
      pos: { x: -16, z: -10 },
      env: "day",
      prop: "meteorite",
      scene: "meteorite",
      badge: "☄️",
      hotspots: [{ x: 612, y: 150 }, { x: 520, y: 232 }, { x: 200, y: 130 }],
      quiz: { correct: 1, emojis: ["🔦", "🔴", "🧲"] },
      choices: [
        { effects: { power: -20, science: 20 }, rover: "none", completes: true, play: "laserZap", icon: "🔴" },
        { effects: { health: -10, supplies: -5, science: 15 }, rover: "none", completes: true, play: "climbLook", icon: "🧗" },
        { effects: { power: -10, science: 25 }, rover: "damage", completes: true, play: "roverClimb", icon: "🚙" },
      ],
    },
    {
      id: 3,
      pos: { x: -12, z: 16 },
      env: "storm",
      prop: "deltaRock",
      scene: "delta",
      badge: "🌪️",
      hotspots: [{ x: 282, y: 268 }, { x: 700, y: 140 }, { x: 470, y: 262 }],
      quiz: { correct: 1, emojis: ["🎨", "🪨", "🌊"] },
      choices: [
        { effects: { power: -10, health: -5, science: 25 }, rover: "damage", completes: true, play: "drillSample", icon: "🪨" },
        { effects: { power: -20, supplies: -5, science: 15 }, rover: "none", completes: true, play: "digOutSand", icon: "🏜️" },
        { effects: { power: -5, health: 5, supplies: -15, science: 10 }, rover: "upgrade", completes: false, play: "printWheel", icon: "🖨️" },
      ],
      // Coming back after choosing a "not complete" option
      revisit: { effects: { science: 10 }, play: "drillCalm" },
    },
    {
      id: 4,
      pos: { x: 20, z: 12 },
      env: "night",
      prop: "ice",
      scene: "ice",
      badge: "🧊",
      hotspots: [{ x: 520, y: 326 }, { x: 700, y: 236 }, { x: 110, y: 110 }],
      quiz: { correct: 1, emojis: ["🍦", "💧", "🪙"] },
      choices: [
        { effects: { health: -15, power: -10, science: 25 }, rover: "none", completes: true, play: "nightDig", icon: "🔦" },
        { effects: { power: -20, supplies: -10, health: 5, science: 15 }, rover: "none", completes: true, play: "campOut", icon: "⛺" },
        { effects: { power: -5, science: 20 }, rover: "damage", completes: true, play: "wheelScrape", icon: "🛞" },
      ],
    },
    {
      id: 5,
      pos: { x: 3, z: -22 },
      env: "dustDevil",
      prop: "rocket",
      scene: "devil",
      badge: "🚀",
      hotspots: [{ x: 450, y: 200 }, { x: 690, y: 190 }, { x: 180, y: 196 }],
      quiz: { correct: 1, emojis: ["🧹", "🌀", "🌧️"] },
      choices: [
        { effects: { power: -5, science: 10 }, rover: "damage", completes: true, play: "raceDevil", icon: "💨" },
        { effects: { supplies: -10, power: 15, science: 15 }, rover: "none", completes: true, play: "hideRock", icon: "🙈" },
        { effects: { power: -15, supplies: -5, science: 5 }, rover: "none", completes: true, play: "ridgeDrive", icon: "⛰️" },
      ],
    },
  ],
};

// ---------- Moon: Shackleton Crater (Artemis base) ----------
// A/B effects are the exact numbers from the mission design sheet (P/O/F/S).
const MOON = {
  id: "moon",
  initialStats: { power: 70, oxygen: 70, food: 70, shielding: 70 },
  survivalKeys: ["power", "oxygen", "food", "shielding"],
  statKeys: ["power", "oxygen", "food", "shielding"],
  upgradesFrom: "badges",
  repairCost: { oxygen: -10 },
  homePos: { x: -3, z: 17.5 },
  // After the 5 tasks: plant Malaysia's flag here before the relief ship can leave
  flagPos: { x: -9, z: 12.5 },
  gravity: 1.62,
  tasks: [
    {
      id: 1,
      pos: { x: -15, z: 12 },
      env: "moonDark",
      prop: "ice",
      scene: "moonIce",
      badge: "🧊",
      hotspots: [{ x: 560, y: 300 }, { x: 500, y: 100 }, { x: 250, y: 140 }],
      quiz: { correct: 1, emojis: ["👅", "💥", "⛄"] },
      choices: [
        { effects: { oxygen: 20, power: -25 }, rover: "none", completes: true, play: "moonDrill", icon: "⛏️" },
        { effects: { power: 10, oxygen: -15 }, rover: "none", completes: true, play: "backupTanks", icon: "🧯" },
      ],
    },
    {
      id: 2,
      pos: { x: 16, z: -8 },
      env: "moonDay",
      prop: "recycler",
      scene: "recycler",
      badge: "💧",
      hotspots: [{ x: 430, y: 170 }, { x: 600, y: 250 }, { x: 180, y: 120 }],
      quiz: { correct: 2, emojis: ["🥛", "🌊", "💧"] },
      choices: [
        { effects: { power: -10, oxygen: 10 }, rover: "none", completes: true, play: "waterDrops", icon: "💧" },
        { effects: { power: 5, oxygen: -5, food: -5 }, rover: "none", completes: true, play: "storedTanks", icon: "🛢️" },
      ],
    },
    {
      id: 3,
      pos: { x: -14, z: -14 },
      env: "moonStorm",
      prop: "dish",
      scene: "donki",
      badge: "🌞",
      hotspots: [{ x: 120, y: 90 }, { x: 330, y: 160 }, { x: 600, y: 260 }],
      quiz: { correct: 1, emojis: ["⏱️", "⏰", "📅"] },
      choices: [
        { effects: { shielding: 15, oxygen: -10 }, rover: "none", completes: true, play: "dirtBags", icon: "🛡️" },
        { effects: { power: 10, shielding: -5 }, rover: "none", completes: true, play: "stormWatch", icon: "📡" },
      ],
    },
    {
      id: 4,
      pos: { x: 18, z: 14 },
      env: "moonDay",
      prop: "panel",
      scene: "moonDust",
      badge: "🧹",
      hotspots: [{ x: 470, y: 190 }, { x: 140, y: 100 }, { x: 260, y: 250 }],
      quiz: { correct: 0, emojis: ["💨", "🍯", "🧊"] },
      choices: [
        { effects: { power: 30, oxygen: -15, food: -10 }, rover: "none", completes: true, play: "dustBrush", icon: "🧹" },
        { effects: { power: -20, food: 10 }, rover: "none", completes: true, play: "lowPower", icon: "🔌" },
      ],
    },
    {
      id: 5,
      pos: { x: 2, z: 22 },
      env: "moonNight",
      prop: "rocket",
      scene: "moonNight",
      badge: "🌙",
      hotspots: [{ x: 120, y: 110 }, { x: 640, y: 150 }, { x: 330, y: 230 }],
      quiz: { correct: 1, emojis: ["🍿", "🥶", "🧀"] },
      choices: [
        { effects: { power: -15, oxygen: -10, shielding: -10 }, rover: "none", completes: true, play: "nightBalance", icon: "⚖️" },
        { effects: { power: -30, food: -15 }, rover: "none", completes: true, play: "fullHeat", icon: "🔥" },
      ],
    },
  ],
};

const MISSIONS = { mars: MARS, moon: MOON };

// ---------- Live exports (active mission) ----------
export let WORLD = "mars";
export let INITIAL_STATS = MARS.initialStats;
export let SURVIVAL_KEYS = MARS.survivalKeys;
export let STAT_KEYS = MARS.statKeys;
export let STAT_META = ALL_STAT_META;
export let UPGRADES_FROM = MARS.upgradesFrom;
export let REPAIR_COST = MARS.repairCost;
export let HOME_POS = MARS.homePos;
export let FLAG_POS = MARS.flagPos;
export let GRAVITY = MARS.gravity;
export let TASKS = MARS.tasks;

export function setActiveMission(id) {
  const m = MISSIONS[id] || MARS;
  WORLD = m.id;
  INITIAL_STATS = m.initialStats;
  SURVIVAL_KEYS = m.survivalKeys;
  STAT_KEYS = m.statKeys;
  UPGRADES_FROM = m.upgradesFrom;
  REPAIR_COST = m.repairCost;
  HOME_POS = m.homePos;
  FLAG_POS = m.flagPos;
  GRAVITY = m.gravity;
  TASKS = m.tasks;
  setEventsFor(m.id);
}

export function roverSpeedMultiplier(level, damaged) {
  return (1 + level * SPEED_PER_LEVEL) * (damaged ? DAMAGED_SPEED : 1);
}

export function roverSizeMultiplier(level) {
  return 1 + level * SIZE_PER_LEVEL;
}
