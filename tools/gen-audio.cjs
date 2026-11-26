#!/usr/bin/env node
/**
 * FOOTYLESS audio forge — synthesizes the entire SFX library as 16-bit mono WAVs.
 * Run:  node tools/gen-audio.cjs
 * Output: assets/audio/*.wav
 * Taxonomy mirrors lessgames-style event naming: button, switch, type, backspace,
 * cell_reveal, correct, wrong, won, lost, finished, drum, crowd.
 */
const fs = require("fs");
const path = require("path");

const SR = 44100;
const OUT = path.join(__dirname, "..", "assets", "audio");
fs.mkdirSync(OUT, { recursive: true });

/* ---------- wav writer ---------- */
function writeWav(name, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);       // PCM
  buf.writeUInt16LE(1, 22);       // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((v * 32767) | 0, 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, name + ".wav"), buf);
  console.log("  ✓", name + ".wav", (n / SR).toFixed(2) + "s");
}

const silence = d => new Float32Array(Math.round(SR * d));

/** classic subtractive voice: oscillator with pitch ramp + exponential envelope */
function tone({ freq = 440, endFreq = null, dur = 0.12, type = "sine", gain = 0.5, attack = 0.004, delay = 0 }) {
  const start = silence(delay);
  const n = Math.round(SR * dur);
  const out = new Float32Array(start.length + n);
  out.set(start);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const f = endFreq != null ? freq + (endFreq - freq) * t : freq;
    phase += (2 * Math.PI * f) / SR;
    let s;
    switch (type) {
      case "square": s = Math.sin(phase) >= 0 ? 1 : -1; break;
      case "saw": s = 2 * ((phase / (2 * Math.PI)) % 1) - 1; break;
      case "tri": s = 2 * Math.abs(2 * ((phase / (2 * Math.PI)) % 1) - 1) - 1; break;
      default: s = Math.sin(phase);
    }
    const env =
      Math.min(1, i / (SR * attack)) *
      Math.exp((-3.2 * (i / SR)) / dur);
    out[start.length + i] = s * env * gain;
  }
  return out;
}

function mix(...tracks) {
  const len = Math.max(...tracks.map(t => t.length));
  const out = new Float32Array(len);
  for (const tr of tracks) for (let i = 0; i < tr.length; i++) out[i] += tr[i];
  return out;
}

/** filtered noise burst (crowd whisper, whooshes) */
function noise({ dur = 0.2, gain = 0.2, delay = 0, lp = 0.4, decay = 4 }) {
  const start = silence(delay);
  const n = Math.round(SR * dur);
  const out = new Float32Array(start.length + n);
  out.set(start);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const env = Math.exp((-decay * (i / SR)) / dur);
    const raw = Math.random() * 2 - 1;
    last = last + lp * (raw - last);       // crude one-pole lowpass
    out[start.length + i] = last * env * gain;
  }
  return out;
}

function concat(...parts) {
  const len = parts.reduce((s, p) => s + p.length, 0);
  const out = new Float32Array(len);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

/* ---------- library ---------- */
console.log("Forging FOOTYLESS audio…");

// UI blips
writeWav("button", tone({ freq: 720, endFreq: 620, dur: 0.05, type: "tri", gain: 0.5 }));
writeWav("switch", mix(
  tone({ freq: 520, dur: 0.04, type: "tri", gain: 0.4 }),
  tone({ freq: 780, dur: 0.05, type: "tri", gain: 0.4, delay: 0.035 })
));
writeWav("type", tone({ freq: 940, endFreq: 900, dur: 0.028, type: "sine", gain: 0.32 }));
writeWav("backspace", tone({ freq: 420, endFreq: 300, dur: 0.06, type: "tri", gain: 0.4 }));

// game events
writeWav("cell_reveal", mix(
  tone({ freq: 660, dur: 0.07, gain: 0.45 }),
  tone({ freq: 990, dur: 0.09, gain: 0.35, delay: 0.055 })
));
writeWav("correct", mix(
  tone({ freq: 659, dur: 0.11, gain: 0.5 }),
  tone({ freq: 880, dur: 0.16, gain: 0.45, delay: 0.09 }),
  noise({ dur: 0.12, gain: 0.08, delay: 0.02, lp: 0.5 })
));
writeWav("wrong", mix(
  tone({ freq: 175, endFreq: 120, dur: 0.22, type: "saw", gain: 0.4 }),
  tone({ freq: 110, dur: 0.24, type: "square", gain: 0.18, delay: 0.03 })
));
writeWav("won", concat(
  tone({ freq: 523, dur: 0.14, gain: 0.45 }),
  tone({ freq: 659, dur: 0.14, gain: 0.45, delay: 0.001 }),
  silence(0.13),
  tone({ freq: 784, dur: 0.16, gain: 0.45 }),
  silence(0.14),
  tone({ freq: 1046, dur: 0.3, gain: 0.5 }),
  noise({ dur: 0.4, gain: 0.12, lp: 0.55, decay: 3 })
));
writeWav("lost", concat(
  tone({ freq: 330, endFreq: 262, dur: 0.25, type: "tri", gain: 0.45 }),
  tone({ freq: 262, endFreq: 196, dur: 0.4, type: "tri", gain: 0.45, delay: 0.22 })
));
writeWav("finished", (() => {
  const seq = [392, 523, 659, 784, 1046, 784, 1046];
  let out = new Float32Array(0);
  seq.forEach((f, i) => { out = concat(out, tone({ freq: f, dur: 0.16, gain: 0.42 })); });
  return out;
})());

// referee whistle: two detuned squares + vibrato + breath noise
writeWav("whistle", (() => {
  const dur = 0.55, n = Math.round(SR * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const vib = 1 + 0.004 * Math.sin(2 * Math.PI * 38 * t);
    const f = 2350 * vib;
    const sq = Math.sign(Math.sin(2 * Math.PI * f * t));
    const trill = 0.6 + 0.4 * Math.sign(Math.sin(2 * Math.PI * 52 * t));
    const env = Math.min(1, t / 0.01) * (t > dur - 0.1 ? (dur - t) / 0.1 : 1);
    out[i] = sq * trill * env * 0.25;
  }
  return mix(out, noise({ dur, gain: 0.06, lp: 0.9, decay: 1.5 }));
})());

// kickoff drum: membrane thump
writeWav("drum", mix(
  tone({ freq: 150, endFreq: 42, dur: 0.16, type: "sine", gain: 0.95 }),
  noise({ dur: 0.05, gain: 0.25, lp: 0.2 })
));

// crowd bed: 2s seamless-ish loop for the ambient toggle
writeWav("crowd", (() => {
  const dur = 2.0, n = Math.round(SR * dur);
  const out = new Float32Array(n);
  let l1 = 0, l2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const swell = 0.7 + 0.3 * Math.sin(2 * Math.PI * t);
    const raw = Math.random() * 2 - 1;
    l1 = l1 + 0.12 * (raw - l1);
    l2 = l2 + 0.5 * (raw - l2);
    // crossfade tail into head for loopability
    const xf = Math.min(1, i / (SR * 0.1)) ;
    out[i] = (l1 * 0.7 + l2 * 0.3) * swell * xf * 0.5;
  }
  return out;
})());

console.log("Done →", OUT);
