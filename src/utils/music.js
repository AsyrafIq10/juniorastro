// Fun background music, synthesized live with the Web Audio API (no audio files).
// A tiny step sequencer: each track is a 4-bar loop of 16th-note steps.

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

// note helpers: [startStep, midiNote(s), lengthInSteps]
function chordBars(chords, voicingGain) {
  return chords.map((notes, bar) => [bar * 16, notes, 16, voicingGain]);
}

const TRACKS = {
  // Dreamy, slow and twinkly: main menu
  menu: {
    bpm: 80,
    steps: 64,
    parts: [
      {
        wave: "sine",
        gain: 0.028,
        attack: 0.6,
        release: 1.2,
        notes: chordBars([
          [48, 55, 60, 64],
          [45, 52, 57, 60],
          [41, 48, 53, 57],
          [43, 50, 55, 59],
        ]),
      },
      {
        wave: "triangle",
        gain: 0.03,
        attack: 0.01,
        release: 0.5,
        notes: [
          [0, 72, 2], [6, 76, 2], [12, 79, 3],
          [16, 81, 2], [22, 76, 2], [28, 72, 3],
          [32, 77, 2], [38, 81, 2], [44, 84, 3],
          [48, 79, 2], [54, 74, 2], [58, 71, 3],
        ],
      },
    ],
    drums: [],
  },

  // Upbeat and playful: driving around Mars
  mars: {
    bpm: 112,
    steps: 64,
    parts: [
      {
        wave: "triangle",
        gain: 0.07,
        attack: 0.005,
        release: 0.12,
        notes: [36, 33, 29, 31].flatMap((root, bar) =>
          [0, 3, 6, 8, 11, 14].map((s, i) => [bar * 16 + s, root + (i === 2 || i === 5 ? 12 : 0), 2])
        ),
      },
      {
        wave: "square",
        gain: 0.018,
        attack: 0.01,
        release: 0.15,
        filter: 1800,
        notes: [
          [0, 72, 2], [2, 74, 2], [4, 76, 4], [8, 79, 2], [10, 76, 2], [12, 74, 4],
          [16, 72, 2], [18, 69, 2], [20, 72, 4], [24, 74, 6],
          [32, 77, 2], [34, 76, 2], [36, 74, 2], [38, 72, 2], [40, 74, 4], [44, 76, 4],
          [48, 79, 4], [52, 76, 2], [54, 74, 2], [56, 72, 8],
        ],
      },
      {
        wave: "sine",
        gain: 0.02,
        attack: 0.005,
        release: 0.2,
        notes: [
          [64, 67, 72], [57, 64, 69], [53, 60, 65], [55, 62, 67],
        ].flatMap((ch, bar) => [2, 6, 10, 14].map((s, i) => [bar * 16 + s, ch[i % 3] + 12, 1])),
      },
    ],
    drums: [
      ...[0, 16, 32, 48].flatMap((b) => [
        [b + 0, "kick"],
        [b + 8, "kick"],
        [b + 4, "clap"],
        [b + 12, "clap"],
        [b + 2, "hat"],
        [b + 6, "hat"],
        [b + 10, "hat"],
        [b + 14, "hat"],
      ]),
    ],
  },

  // Happy fanfare: back home + leaderboard
  victory: {
    bpm: 126,
    steps: 64,
    parts: [
      {
        wave: "triangle",
        gain: 0.07,
        attack: 0.005,
        release: 0.15,
        notes: [36, 41, 43, 36].flatMap((root, bar) => [0, 4, 8, 12].map((s) => [bar * 16 + s, root, 3])),
      },
      {
        wave: "square",
        gain: 0.02,
        attack: 0.01,
        release: 0.2,
        filter: 2400,
        notes: [
          [0, 72, 2], [2, 72, 1], [3, 72, 1], [4, 79, 6], [10, 77, 2], [12, 76, 4],
          [16, 77, 2], [18, 77, 1], [19, 77, 1], [20, 81, 6], [26, 79, 2], [28, 77, 4],
          [32, 79, 2], [34, 76, 2], [36, 72, 4], [40, 74, 2], [42, 76, 2], [44, 79, 4],
          [48, 84, 8], [56, 79, 4], [60, 72, 4],
        ],
      },
      {
        wave: "sine",
        gain: 0.022,
        attack: 0.3,
        release: 0.6,
        notes: chordBars([
          [60, 64, 67],
          [60, 65, 69],
          [62, 67, 71],
          [60, 64, 67],
        ]),
      },
    ],
    drums: [
      ...[0, 16, 32, 48].flatMap((b) => [
        [b + 0, "kick"],
        [b + 8, "kick"],
        [b + 4, "clap"],
        [b + 12, "clap"],
        ...[1, 3, 5, 7, 9, 11, 13, 15].map((s) => [b + s, "hat"]),
      ]),
    ],
  },
};

class MusicPlayer {
  constructor() {
    this.audio = null; // spaceAudio (shares its AudioContext)
    this.enabled = true;
    this.track = null;
    this.timer = null;
    this.master = null;
    this.duck = 1;
  }

  attach(audio) {
    this.audio = audio;
  }

  get ctx() {
    return this.audio?.ctx || null;
  }

  ensureMaster() {
    if (!this.audio?.ensureContext()) return false;
    if (!this.master) {
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 5000;
      this.master.connect(lp);
      lp.connect(this.ctx.destination);
      const len = Math.floor(this.ctx.sampleRate * 0.3);
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return true;
  }

  setEnabled(on) {
    this.enabled = on;
    if (!on) this.stop();
    else if (this.wanted) this.play(this.wanted);
  }

  // Quieter music while a task/mini-game is open, so suit sounds stay clear
  setDucked(ducked) {
    this.duck = ducked ? 0.35 : 1;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(0.9 * this.duck, this.ctx.currentTime, 0.3);
  }

  play(name) {
    this.wanted = name;
    if (!name) return this.stop();
    if (!this.enabled || this.track === name) return;
    if (!this.ensureMaster()) return;
    this.stop(true);
    this.track = name;
    this.def = TRACKS[name];
    this.stepDur = 60 / this.def.bpm / 4;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.master.gain.exponentialRampToValueAtTime(0.9 * this.duck, this.ctx.currentTime + 1.2);
    this.timer = setInterval(() => this.schedule(), 50);
  }

  stop(keepWanted = false) {
    if (!keepWanted) this.wanted = null;
    clearInterval(this.timer);
    this.timer = null;
    this.track = null;
  }

  schedule() {
    const ctx = this.ctx;
    if (!ctx || !this.def) return;
    while (this.nextTime < ctx.currentTime + 0.2) {
      const step = this.step % this.def.steps;
      for (const part of this.def.parts) {
        for (const [s, notes, len, gainOverride] of part.notes) {
          if (s !== step) continue;
          const list = Array.isArray(notes) ? notes : [notes];
          for (const n of list) this.voice(part, midi(n), this.nextTime, len * this.stepDur, gainOverride);
        }
      }
      for (const [s, kind] of this.def.drums) if (s === step) this.drum(kind, this.nextTime);
      this.nextTime += this.stepDur;
      this.step += 1;
    }
  }

  voice(part, freq, time, dur, gainOverride) {
    const ctx = this.ctx;
    try {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = part.wave;
      osc.frequency.setValueAtTime(freq, time);
      const peak = gainOverride || part.gain;
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(peak, time + part.attack);
      g.gain.setValueAtTime(peak, time + Math.max(part.attack, dur - 0.02));
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur + part.release);
      let out = osc;
      if (part.filter) {
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = part.filter;
        osc.connect(f);
        out = f;
      }
      out.connect(g);
      g.connect(this.master);
      osc.start(time);
      osc.stop(time + dur + part.release + 0.05);
    } catch {
      // ignore
    }
  }

  drum(kind, time) {
    const ctx = this.ctx;
    try {
      if (kind === "kick") {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.14);
        g.gain.setValueAtTime(0.12, time);
        g.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
        osc.connect(g);
        g.connect(this.master);
        osc.start(time);
        osc.stop(time + 0.2);
      } else {
        const src = ctx.createBufferSource();
        src.buffer = this.noise;
        const f = ctx.createBiquadFilter();
        f.type = kind === "hat" ? "highpass" : "bandpass";
        f.frequency.value = kind === "hat" ? 7000 : 1500;
        const g = ctx.createGain();
        const vol = kind === "hat" ? 0.025 : 0.05;
        const len = kind === "hat" ? 0.05 : 0.12;
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.0001, time + len);
        src.connect(f);
        f.connect(g);
        g.connect(this.master);
        src.start(time);
        src.stop(time + len + 0.02);
      }
    } catch {
      // ignore
    }
  }
}

export const music = new MusicPlayer();
