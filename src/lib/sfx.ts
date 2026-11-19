'use client';

/**
 * Tiny WebAudio sound-effect kit — no audio assets, everything synthesized.
 * Built for the discovery experience but safe to reuse app-wide.
 *
 * Design rules:
 * - Kid-friendly: soft volumes (≤ 0.09), short notes, warm timbres.
 * - Every call is gated by the app-wide "sound effects" setting
 *   (stores/settings → `sound`) and silently no-ops when WebAudio
 *   is unavailable (SSR, old browsers, blocked autoplay).
 * - Safe to call from event handlers: the AudioContext resumes itself
 *   on the user gesture that triggered the call.
 */

import { useSettings } from '@/stores/settings';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null; // audio unavailable — stay silent, never crash
  }
}

/** one synthesized note with a soft attack + exponential release */
function note(freq: number, at: number, dur: number, type: OscillatorType, vol: number, glideTo?: number) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur * 0.9);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

/** one short filtered noise burst (a single clap / whoosh grain) */
function noiseBurst(at: number, dur: number, vol: number, freq = 1800) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + at;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq;
  bp.Q.value = 0.8;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t0);
}

function enabled(): boolean {
  try {
    return useSettings.getState().sound;
  } catch {
    return false;
  }
}

export const sfx = {
  /** soft pop — tapping a device card */
  pop() {
    if (!enabled()) return;
    note(460, 0, 0.1, 'triangle', 0.07, 830);
  },

  /** creak-whoosh + sparkle — the device shell opens into the exploded view */
  open() {
    if (!enabled()) return;
    // rising "unscrewing" sweep
    note(240, 0, 0.3, 'sawtooth', 0.03, 640);
    // sparkle arpeggio (C6 · E6 · G6)
    note(1046.5, 0.08, 0.14, 'sine', 0.05);
    note(1318.5, 0.17, 0.14, 'sine', 0.05);
    note(1568, 0.26, 0.18, 'sine', 0.05);
  },

  /** tiny blip — a part is selected in the exploded view */
  blip() {
    if (!enabled()) return;
    note(880, 0, 0.08, 'sine', 0.05, 1245);
  },

  /** small triumphant arpeggio — the 5-device discovery mission completes */
  fanfare() {
    if (!enabled()) return;
    const seq: Array<[number, number, number]> = [
      [523.25, 0, 0.16], // C5
      [659.25, 0.11, 0.16], // E5
      [783.99, 0.22, 0.16], // G5
      [1046.5, 0.33, 0.42], // C6 (held)
    ];
    for (const [f, at, dur] of seq) note(f, at, dur, 'triangle', 0.07);
  },

  /** robot voice blip — the teacher robot starts a sentence */
  beep() {
    if (!enabled()) return;
    note(660, 0, 0.07, 'square', 0.03, 880);
  },

  /** battery power-up — rising triad */
  powerup() {
    if (!enabled()) return;
    note(261.63, 0, 0.12, 'triangle', 0.06);
    note(392, 0.1, 0.12, 'triangle', 0.06);
    note(523.25, 0.2, 0.3, 'triangle', 0.07);
  },

  /** wire whoosh — electrons dashing through the path */
  whoosh() {
    if (!enabled()) return;
    noiseBurst(0, 0.26, 0.028, 900);
    note(300, 0, 0.3, 'sine', 0.028, 720);
  },

  /** switch click — mechanical snap */
  click() {
    if (!enabled()) return;
    note(1150, 0, 0.03, 'square', 0.05, 320);
    note(95, 0.02, 0.05, 'square', 0.045);
  },

  /** LED sparkle — bright glitter arpeggio */
  sparkle() {
    if (!enabled()) return;
    note(1318.5, 0, 0.12, 'sine', 0.05);
    note(1568, 0.09, 0.12, 'sine', 0.05);
    note(2093, 0.18, 0.24, 'sine', 0.055);
  },

  /** motor whirr — wobbly spinning sound */
  whirr() {
    if (!enabled()) return;
    note(140, 0, 0.5, 'sawtooth', 0.04, 185);
    note(158, 0.06, 0.44, 'square', 0.026, 200);
    note(132, 0.42, 0.32, 'sawtooth', 0.036, 110);
  },

  /** applause — a burst of synthesized claps (quiz win / medal) */
  applause() {
    if (!enabled()) return;
    const times = [0, 0.07, 0.13, 0.21, 0.28, 0.36, 0.45, 0.55, 0.66, 0.78, 0.9, 1.05, 1.2, 1.35, 1.5];
    for (const at of times) noiseBurst(at, 0.045, 0.045 + Math.random() * 0.03, 1600 + Math.random() * 700);
  },
};
