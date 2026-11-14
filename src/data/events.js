// Surprise events that can pop up while driving between tasks (one per trip at most).
// Text lives in the text files -> t.events[i]; numbers live here. EVENTS is live: it follows the active mission.

const MARS_EVENTS = [
  {
    id: "solarFlare",
    icon: "☀️",
    choices: [
      { icon: "🛡️", effects: { power: -5, health: 5 } },
      { icon: "📏", effects: { science: 10, health: -10 } },
    ],
  },
  {
    id: "dustGust",
    icon: "💨",
    choices: [
      { icon: "🧹", effects: { supplies: -5, power: 10 } },
      { icon: "🚙", effects: { power: -10 } },
    ],
  },
  {
    id: "earthCall",
    icon: "📡",
    choices: [
      { icon: "📸", effects: { science: 10, power: -5 } },
      { icon: "😴", effects: { health: 10 } },
    ],
  },
  {
    id: "blueRock",
    icon: "🪨",
    choices: [
      { icon: "🔍", effects: { science: 15, power: -10 } },
      { icon: "📍", effects: { science: 5 } },
    ],
  },
  {
    id: "orbiter",
    icon: "🛰️",
    choices: [
      { icon: "📶", effects: { power: -5, science: 10 } },
      { icon: "🔋", effects: { power: 5 } },
    ],
  },
];

// Moon surprises: tasks from the mission sheet that weren't picked as checkpoints (exact P/O/F/S numbers)
const MOON_EVENTS = [
  {
    id: "micrometeoroid",
    icon: "🌠",
    choices: [
      { icon: "🧑‍🚀", effects: { shielding: 15, oxygen: -10 } },
      { icon: "🚪", effects: { power: 5, food: -15 } },
    ],
  },
  {
    id: "moonquake",
    icon: "📳",
    choices: [
      { icon: "🔍", effects: { power: -10, oxygen: 10 } },
      { icon: "😴", effects: { power: 5, oxygen: -10 } },
    ],
  },
  {
    id: "crumbs",
    icon: "🍪",
    choices: [
      { icon: "🌯", effects: { power: 5, food: -10 } },
      { icon: "🍘", effects: { power: -10, food: 10 } },
    ],
  },
  {
    id: "workout",
    icon: "🏋️",
    choices: [
      { icon: "💪", effects: { power: -10, shielding: 10 } },
      { icon: "🛋️", effects: { power: 5, shielding: -5 } },
    ],
  },
  {
    id: "lateShip",
    icon: "🛸",
    choices: [
      { icon: "🥣", effects: { food: 10, power: -10 } },
      { icon: "🍽️", effects: { food: -15, power: 5 } },
    ],
  },
];

export let EVENTS = MARS_EVENTS;

export function setEventsFor(missionId) {
  EVENTS = missionId === "moon" ? MOON_EVENTS : MARS_EVENTS;
}

// Seconds of actual driving on a trip before an event may appear
export const EVENT_AFTER_DRIVE_SECONDS = 6;
