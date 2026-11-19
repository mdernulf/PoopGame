/**
 * Ljudmotor för Sprattelgubben på äventyr.
 * Web Audio API: pruttar, djurläten, ambiens, musik.
 * Exportar en singleton `sound` som resten av spelet pratar med.
 */

class CrayonSoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ambientTimer = null;
    this.musicTimer = null;
    this.musicStep = 0;
    this.fartBuffers = { squeak: [], tuba: [], normal: [], all: [] };
    this.fartsLoading = false;
    this.lastFartBuffer = null;
    this.buildupBuffer = null;
    this.buildupSource = null;
    this.buildupGain = null;
    this.balloonBuffer = null;
    this.bananaBuffer = null;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      this.loadFartSounds();
    } catch (e) {}
  }

  loadFartSounds() {
    if (!this.ctx || this.fartsLoading || this.fartBuffers.all.length) return;
    this.fartsLoading = true;
    // Short/snappy files = squeak, long files = tuba, mid = normal.
    const files = [
      { url: "assets/audio/Prutt A.wav", style: "squeak" },
      { url: "assets/audio/Prutt C.wav", style: "squeak" },
      { url: "assets/audio/Prutt D.wav", style: "tuba" },
      { url: "assets/audio/Prutt E.wav", style: "normal" },
      { url: "assets/audio/Prutt in stereo.wav", style: "normal" },
    ];
    files.forEach((f) => {
      fetch(f.url)
        .then((r) => r.arrayBuffer())
        .then((buf) => new Promise((res, rej) => this.ctx.decodeAudioData(buf, res, rej)))
        .then((audioBuf) => {
          this.fartBuffers[f.style].push(audioBuf);
          this.fartBuffers.all.push(audioBuf);
        })
        .catch(() => {});
    });
    const oneShots = [
      { url: "assets/audio/buildup.wav", key: "buildupBuffer" },
      { url: "assets/audio/Balloon.wav", key: "balloonBuffer" },
      { url: "assets/audio/Banana.wav", key: "bananaBuffer" },
    ];
    oneShots.forEach((o) => {
      fetch(o.url)
        .then((r) => r.arrayBuffer())
        .then((buf) => new Promise((res, rej) => this.ctx.decodeAudioData(buf, res, rej)))
        .then((audioBuf) => {
          this[o.key] = audioBuf;
        })
        .catch(() => {});
    });
  }

  playSample(buffer, volume = 0.9) {
    if (this.muted || !this.ctx || !buffer) return;
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.value = volume;
      src.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(0);
    } catch (e) {}
  }

  playBalloon() {
    this.init();
    this.playSample(this.balloonBuffer, 1.6);
  }

  playBanana() {
    this.init();
    this.playSample(this.bananaBuffer, 3.0);
  }

  startBuildup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx || !this.buildupBuffer || this.buildupSource) return;
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = this.buildupBuffer;
      const gain = this.ctx.createGain();
      gain.gain.value = 2.8;
      src.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(0);
      this.buildupSource = src;
      this.buildupGain = gain;
      src.onended = () => {
        if (this.buildupSource === src) {
          this.buildupSource = null;
          this.buildupGain = null;
        }
      };
    } catch (e) {}
  }

  stopBuildup() {
    if (!this.buildupSource) return;
    try {
      const now = this.ctx.currentTime;
      this.buildupGain.gain.cancelScheduledValues(now);
      this.buildupGain.gain.setValueAtTime(this.buildupGain.gain.value, now);
      this.buildupGain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
      this.buildupSource.stop(now + 0.06);
    } catch (e) {}
    this.buildupSource = null;
    this.buildupGain = null;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playJump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.18);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  playPop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  playStar() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [587.33, 880].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.012, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.07 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.2);
      });
    } catch (e) {}
  }

  playOops() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(135, now + 0.28);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.31);
    } catch (e) {}
  }

  playQuack() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(290, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {}
  }

  playCrabPinch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [0, 0.09].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(760, now + offset);
        osc.frequency.exponentialRampToValueAtTime(340, now + offset + 0.05);
        gain.gain.setValueAtTime(0.09, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.07);
      });
    } catch (e) {}
  }

  playFart(style = "normal") {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const pool = this.fartBuffers[style]?.length
        ? this.fartBuffers[style]
        : this.fartBuffers.all;
      if (!pool.length) return;
      let buf = pool[Math.floor(Math.random() * pool.length)];
      if (pool.length > 1 && buf === this.lastFartBuffer) {
        buf = pool[(pool.indexOf(buf) + 1) % pool.length];
      }
      this.lastFartBuffer = buf;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const gain = this.ctx.createGain();
      gain.gain.value = 3.0;
      src.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(0);
    } catch (e) {}
  }

  playDogBark(breed) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      const base = breed === "dachshund" ? 520 : breed === "stbernard" ? 170 : 340;
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.exponentialRampToValueAtTime(base * 0.6, now + 0.14);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  playBirdCall(species) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = species === "crow" ? "sawtooth" : "sine";
      const f1 = species === "crow" ? 380 : species === "seagull" ? 920 : 760;
      const f2 = species === "crow" ? 280 : species === "seagull" ? 640 : 1120;
      osc.frequency.setValueAtTime(f1, now);
      osc.frequency.exponentialRampToValueAtTime(f2, now + 0.16);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {}
  }

  playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);
        gain.gain.setValueAtTime(0.14, now + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.34);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.36);
      });
    } catch (e) {}
  }

  playMusicNote() {
    if (this.muted || state.mode !== "PLAYING") return;
    this.init();
    if (!this.ctx) return;

    try {
      // Glad, mjuk xylofon-/speldosemelodi i C-dur som passar 3–6-åringar
      const melody = [
        523.25, 0, 659.25, 587.33, 523.25, 0, 392.0, 0, 440.0, 0, 523.25, 440.0, 392.0, 0, 0, 0, 523.25, 587.33, 659.25, 783.99,
        659.25, 0, 587.33, 0, 659.25, 523.25, 587.33, 493.88, 523.25, 0, 0, 0,
      ];
      const bass = [
        261.63, 0, 0, 0, 196.0, 0, 0, 0, 220.0, 0, 0, 0, 196.0, 0, 0, 0, 261.63, 0, 0, 0, 196.0, 0, 0, 0, 174.61, 0, 196.0, 0, 261.63,
        0, 0, 0,
      ];

      const idx = this.musicStep % melody.length;
      this.musicStep++;
      const now = this.ctx.currentTime;

      const noteFreq = melody[idx];
      if (noteFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(noteFreq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.055, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }

      const bassFreq = bass[idx];
      if (bassFreq > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = "triangle";
        bOsc.frequency.setValueAtTime(bassFreq, now);
        bGain.gain.setValueAtTime(0.001, now);
        bGain.gain.linearRampToValueAtTime(0.045, now + 0.02);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);
        bOsc.start(now);
        bOsc.stop(now + 0.35);
      }
    } catch (e) {}
  }

  startAmbient() {
    if (this.ambientTimer) clearInterval(this.ambientTimer);
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicStep = 0;

    this.musicTimer = setInterval(() => {
      this.playMusicNote();
    }, 260);

    this.ambientTimer = setInterval(() => {
      if (this.muted || state.mode !== "PLAYING") return;
      if (Math.random() < 0.45) {
        this.playBirdCall(["crow", "seagull", "parrot"][Math.floor(Math.random() * 3)]);
      }
    }, 4200);
  }
}

export const sound = new CrayonSoundEngine();
