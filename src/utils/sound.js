// Zero-asset Web Audio API synthesizer for Jezero 6: Mission Mars

class SpaceAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ambientGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientRunning = false;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
  }

  ensureContext() {
    if (!this.enabled) return false;
    this.init();
    if (!this.ctx) return false;
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  setEnabled(value) {
    this.enabled = value;
    if (!value) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
  }

  startAmbient() {
    if (!this.ensureContext() || this.ambientRunning) return;
    try {
      const now = this.ctx.currentTime;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(220, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 1.5);

      const osc1 = this.ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(65.41, now); // C2 warm hum

      const osc2 = this.ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(98.0, now); // G2 fifth

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      this.ambientGain = gain;
      this.ambientOsc1 = osc1;
      this.ambientOsc2 = osc2;
      this.ambientRunning = true;
    } catch {
      // Ignore audio errors on restricted environments
    }
  }

  stopAmbient() {
    if (!this.ambientRunning || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.ambientGain) {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      }
      setTimeout(() => {
        try {
          this.ambientOsc1?.stop();
          this.ambientOsc2?.stop();
        } catch {
          // ignore
        }
        this.ambientOsc1 = null;
        this.ambientOsc2 = null;
        this.ambientGain = null;
        this.ambientRunning = false;
      }, 350);
    } catch {
      this.ambientRunning = false;
    }
  }

  playTone(freq, duration = 0.12, type = "sine", volume = 0.12, delay = 0) {
    if (!this.ensureContext()) return;
    try {
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // ignore
    }
  }

  // Filtered white-noise burst (rocket engine rumble)
  playNoise(duration = 2, volume = 0.2, cutoff = 400, delay = 0) {
    if (!this.ensureContext()) return;
    try {
      const now = this.ctx.currentTime + delay;
      const len = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cutoff, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.25);
      gain.gain.setValueAtTime(volume, now + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(now);
      src.stop(now + duration + 0.05);
    } catch {
      // ignore
    }
  }

  // ----- Spacesuit "feelings" -----
  // One breath inside the helmet: soft filtered noise in, then out
  playBreath(stress = 0) {
    const dur = 1.6 - stress * 0.8;
    this.playNoise(dur * 0.45, 0.05 + stress * 0.04, 900);
    this.playNoise(dur * 0.55, 0.035 + stress * 0.03, 600, dur * 0.5);
  }

  playHeartbeat() {
    this.playTone(58, 0.12, "sine", 0.22);
    this.playTone(52, 0.14, "sine", 0.18, 0.16);
  }

  // Soft low-gravity landing (louder for bigger drops)
  playThud(impact = 1) {
    const v = Math.min(1, impact / 2);
    this.playNoise(0.2, 0.06 + v * 0.12, 140);
    this.playTone(62, 0.18, "sine", 0.08 + v * 0.1);
  }

  playBump() {
    this.playNoise(0.25, 0.3, 160);
    this.playTone(70, 0.2, "triangle", 0.2);
  }

  playZap() {
    if (!this.ensureContext()) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignore
    }
  }

  playWhoosh() {
    this.playNoise(1.6, 0.18, 700);
  }

  // Continuous tool sound (drill / shovel / printer) while the player holds a button
  startHum(kind = "drill") {
    if (!this.ensureContext() || this.humOsc) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = kind === "printer" ? "square" : "sawtooth";
      osc.frequency.setValueAtTime(kind === "shovel" ? 90 : kind === "printer" ? 220 : 140, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      this.humOsc = osc;
      this.humGain = gain;
    } catch {
      // ignore
    }
  }

  stopHum() {
    if (!this.humOsc || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.humGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      this.humOsc.stop(now + 0.1);
    } catch {
      // ignore
    }
    this.humOsc = null;
    this.humGain = null;
  }

  // ----- Little UI sounds -----
  playPop() {
    this.playTone(660, 0.06, "sine", 0.09);
    this.playTone(990, 0.08, "sine", 0.07, 0.04);
  }

  playDing() {
    this.playTone(1318.5, 0.25, "sine", 0.08);
    this.playTone(1975.5, 0.3, "sine", 0.05, 0.05);
  }

  playTick(pitch = 0) {
    this.playTone(880 + pitch * 40, 0.04, "square", 0.035);
  }

  playWrong() {
    this.playTone(220, 0.12, "sawtooth", 0.06);
    this.playTone(185, 0.18, "sawtooth", 0.06, 0.1);
  }

  playBadge() {
    [784, 988, 1175, 1568].forEach((f, i) => this.playTone(f, 0.22, "triangle", 0.09, i * 0.08));
    this.playTone(2093, 0.5, "sine", 0.06, 0.34);
  }

  // ----- Rover motor: a hum that revs with speed (level 0..1) -----
  setMotor(level) {
    if (!this.enabled) {
      this.stopMotor();
      return;
    }
    if (!this.motorOsc) {
      if (level < 0.02 || !this.ensureContext()) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc2.type = "square";
        osc.frequency.setValueAtTime(50, now);
        osc2.frequency.setValueAtTime(75, now);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, now);
        gain.gain.setValueAtTime(0.0001, now);
        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc2.start(now);
        this.motorOsc = osc;
        this.motorOsc2 = osc2;
        this.motorGain = gain;
      } catch {
        return;
      }
    }
    const now = this.ctx.currentTime;
    const l = Math.min(1, Math.max(0, level));
    this.motorGain.gain.setTargetAtTime(0.0001 + l * 0.045, now, 0.08);
    this.motorOsc.frequency.setTargetAtTime(48 + l * 70, now, 0.1);
    this.motorOsc2.frequency.setTargetAtTime(72 + l * 105, now, 0.1);
  }

  stopMotor() {
    if (!this.motorOsc || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.motorGain.gain.setTargetAtTime(0.0001, now, 0.05);
      this.motorOsc.stop(now + 0.3);
      this.motorOsc2.stop(now + 0.3);
    } catch {
      // ignore
    }
    this.motorOsc = null;
    this.motorOsc2 = null;
    this.motorGain = null;
  }

  playCountdownBeep(final = false) {
    this.playTone(final ? 1320 : 880, final ? 0.35 : 0.12, "square", 0.06);
  }

  playLiftoff() {
    this.playNoise(2.8, 0.28, 520);
    this.playTone(55, 2.4, "sawtooth", 0.05);
  }

  playRetroBurn() {
    this.playNoise(2.6, 0.16, 300);
  }

  playTouchdown() {
    this.playNoise(0.5, 0.25, 180);
    this.playSuccess();
  }

  playClick() {
    this.playTone(540, 0.07, "sine", 0.09);
  }

  playSuccess() {
    this.playTone(523.25, 0.14, "sine", 0.1, 0);
    this.playTone(659.25, 0.16, "sine", 0.1, 0.08);
    this.playTone(783.99, 0.22, "sine", 0.11, 0.16);
  }

  playAlert() {
    this.playTone(320, 0.18, "triangle", 0.12, 0);
    this.playTone(240, 0.25, "triangle", 0.12, 0.18);
  }

  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.28, "sine", 0.11, i * 0.11);
    });
  }
}

export const spaceAudio = new SpaceAudio();
