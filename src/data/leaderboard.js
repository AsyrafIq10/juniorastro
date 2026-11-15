import { SURVIVAL_KEYS } from "./tasks";

// Mission points + a pretend leaderboard of other Interstellar V cadets (hardcoded, no server).

export const POINT_RULES = {
  science: 10, // per Science point
  crew: 2, // per % of Crew Health + Power + Supplies left
  badge: 100, // per quiz badge
  star: 20, // per mini-game star
  rover: 50, // per rover upgrade level
};

// Bonus points for the hidden quests (only shown when earned)
export const SECRET_POINTS = { secret: 150, mega: 300 };

export function missionPoints({ stats, badges, stars, roverLevel, secret = false, mega = false }) {
  const kept = SURVIVAL_KEYS.reduce((sum, k) => sum + (stats[k] || 0), 0);
  const rows = [
    ...("science" in stats ? [{ key: "science", icon: "🔬", value: stats.science * POINT_RULES.science }] : []),
    { key: "crew", icon: "❤️", value: kept * POINT_RULES.crew },
    { key: "badges", icon: "🏅", value: badges * POINT_RULES.badge },
    { key: "stars", icon: "⭐", value: stars * POINT_RULES.star },
    { key: "rover", icon: "🚙", value: roverLevel * POINT_RULES.rover },
    ...(secret ? [{ key: "secret", icon: "❔", value: SECRET_POINTS.secret }] : []),
    ...(mega ? [{ key: "mega", icon: "🏆", value: SECRET_POINTS.mega }] : []),
  ];
  return { rows, total: rows.reduce((sum, r) => sum + r.value, 0) };
}

export const RIVALS = [
  { name: "AstroAisyah", avatar: "👩‍🚀", pts: 2480, badges: 5 },
  { name: "CometKai", avatar: "☄️", pts: 2150, badges: 4 },
  { name: "NovaNur", avatar: "🌟", pts: 1960, badges: 5 },
  { name: "RoverRizal", avatar: "🚙", pts: 1720, badges: 3 },
  { name: "LunaLim", avatar: "🌙", pts: 1540, badges: 4 },
  { name: "MeteorMei", avatar: "🌠", pts: 1310, badges: 2 },
  { name: "OrbitOmar", avatar: "🛰️", pts: 1120, badges: 3 },
  { name: "StarSiti", avatar: "⭐", pts: 940, badges: 2 },
  { name: "GalaxyGopal", avatar: "🌌", pts: 760, badges: 1 },
];
