// Hands-on mini-game for every task choice (keyed by the choice's `play` id in tasks.js).
// type: hold | steer | aim | balance | breathe | rhythm
// danger (hold games): heat = tool overheats, cold = hands freeze, tired = muscles get tired

export const PLAY_CONFIGS = {
  // Task 1: Scout Drone
  fixDrone: { type: "hold", env: "day", scene: "drone", tool: "wrench", danger: "cold", hum: "drill", duration: 18, work: 0.11, dangerUp: 0.24, dangerDown: 0.4 },
  carryDrone: { type: "balance", env: "day", scene: "droneRoof", duration: 15, need: 7, drift: 1.0 },
  salvageDrone: { type: "aim", env: "day", scene: "droneScrews", targets: 4, shots: 8, duration: 16, wobble: 16 },

  // Task 2: Shiny Space Rock
  laserZap: { type: "aim", env: "day", scene: "meteorite", targets: 3, shots: 6, duration: 16, wobble: 24 },
  climbLook: { type: "balance", env: "day", scene: "climb", duration: 15, need: 7, drift: 1.2 },
  roverClimb: { type: "balance", env: "day", scene: "roverSlope", duration: 13, need: 6, drift: 1.5 },

  // Task 3: Delta Rock Garden
  drillSample: { type: "steer", env: "storm", scene: "sharpRocks", duration: 15, speed: 1.0 },
  digOutSand: { type: "hold", env: "storm", scene: "dune", tool: "shovel", danger: "tired", hum: "shovel", duration: 18, work: 0.11, dangerUp: 0.22, dangerDown: 0.35 },
  printWheel: { type: "hold", env: "garage", scene: "printer", tool: null, danger: "heat", hum: "printer", duration: 18, work: 0.12, dangerUp: 0.26, dangerDown: 0.4 },
  drillCalm: { type: "hold", env: "day", scene: "deltaRock", tool: "drill", danger: "heat", hum: "drill", duration: 16, work: 0.13, dangerUp: 0.24, dangerDown: 0.45 },

  // Task 4: Frozen Ice Hunt
  nightDig: { type: "hold", env: "night", scene: "ice", tool: "shovel", danger: "cold", hum: "shovel", duration: 18, work: 0.11, dangerUp: 0.28, dangerDown: 0.38 },
  campOut: { type: "breathe", env: "night", scene: "camp", period: 5, cycles: 3 },
  wheelScrape: { type: "rhythm", env: "night", scene: "scrape", need: 20, duration: 12 },

  // Task 5: Rocket Pad Delivery
  raceDevil: { type: "steer", env: "dustDevil", scene: "devilChase", duration: 15, speed: 1.3 },
  hideRock: { type: "breathe", env: "dustDevil", scene: "hide", period: 5, cycles: 3 },
  ridgeDrive: { type: "steer", env: "dustDevil", scene: "ridge", duration: 15, speed: 0.9 },

  // ===== Moon (Shackleton Crater) =====
  // Task 1: Ice-Mining Dilemma
  moonDrill: { type: "hold", env: "moonDark", scene: "moonIce", tool: "drill", danger: "heat", hum: "drill", duration: 18, work: 0.11, dangerUp: 0.24, dangerDown: 0.4 },
  backupTanks: { type: "aim", env: "moonDay", scene: "valves", targets: 3, shots: 7, duration: 15, wobble: 18 },
  // Task 2: Water Recycler (Water Drops mini-action)
  waterDrops: { type: "drag", env: "moonDay", scene: "recycler", start: 0, goal: 98, step: 14, duration: 16 },
  storedTanks: { type: "drag", env: "moonDay", scene: "plants", start: 0, goal: 100, step: 20, duration: 14 },
  // Task 3: DONKI Early Warning
  dirtBags: { type: "hold", env: "moonStorm", scene: "dirtBags", tool: "shovel", danger: "tired", hum: "shovel", duration: 18, work: 0.11, dangerUp: 0.22, dangerDown: 0.35 },
  stormWatch: { type: "tapTiming", env: "moonStorm", scene: "donki", spikes: 3, duration: 14 },
  // Task 4: Lunar Dust (Dust Brush mini-action)
  dustBrush: { type: "swipe", env: "moonDay", scene: "panel", goal: 0.85, duration: 15 },
  lowPower: { type: "aim", env: "moonDay", scene: "switches", targets: 4, shots: 8, duration: 15, wobble: 12 },
  // Task 5: Final Lunar Night Freeze
  nightBalance: { type: "balance", env: "moonNight", scene: "seesaw", duration: 15, need: 7, drift: 1.1 },
  // ===== Hidden wormhole quest: treasure room vault =====
  vaultLock: { type: "aim", env: null, scene: "vault", targets: 4, shots: 9, duration: 18, wobble: 14 },

  fullHeat: { type: "hold", env: "moonNight", scene: "heater", tool: null, danger: "battery", hum: "printer", duration: 16, work: 0.13, dangerUp: 0.3, dangerDown: 0.35 },
};

// Score (0..1) -> stars -> bonus science
export function starsFor(score) {
  if (score >= 0.75) return 3;
  if (score >= 0.45) return 2;
  return 1;
}
export const STAR_BONUS = { 1: 0, 2: 2, 3: 5 };
