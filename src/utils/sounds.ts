let audioCtx: AudioContext | null = null;
let bgmNodes: { oscs: OscillatorNode[]; gains: GainNode[]; master: GainNode } | null = null;
let bgmPlaying = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  delay = 0
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

export function playFlip() {
  playTone(600, 0.08, 'sine', 0.1);
  playTone(900, 0.06, 'sine', 0.08, 0.04);
}

export function playMatch() {
  playTone(523, 0.12, 'sine', 0.15);
  playTone(659, 0.12, 'sine', 0.15, 0.1);
  playTone(784, 0.2, 'sine', 0.15, 0.2);
}

export function playMismatch() {
  playTone(300, 0.15, 'square', 0.08);
  playTone(250, 0.2, 'square', 0.06, 0.12);
}

export function playWin() {
  // Fanfare intro
  playTone(523, 0.2, 'sine', 0.2);          // C5
  playTone(523, 0.2, 'triangle', 0.1);
  playTone(659, 0.2, 'sine', 0.2, 0.15);    // E5
  playTone(784, 0.2, 'sine', 0.2, 0.3);     // G5
  playTone(1047, 0.4, 'sine', 0.25, 0.45);  // C6 (hold)
  playTone(1047, 0.4, 'triangle', 0.12, 0.45);

  // Sparkle cascade
  const sparkle = [1319, 1568, 1760, 2093, 1760, 1568, 1319, 1568, 2093];
  sparkle.forEach((freq, i) => {
    playTone(freq, 0.12, 'sine', 0.08, 0.8 + i * 0.07);
  });

  // Final chord
  [1047, 1319, 1568].forEach((freq) => {
    playTone(freq, 0.6, 'sine', 0.15, 1.5);
    playTone(freq, 0.6, 'triangle', 0.08, 1.5);
  });
}

export function playClick() {
  playTone(800, 0.04, 'sine', 0.08);
}

export function playStart() {
  playTone(440, 0.1, 'sine', 0.1);
  playTone(554, 0.1, 'sine', 0.1, 0.08);
  playTone(659, 0.15, 'sine', 0.12, 0.16);
}

// Background music - cinematic focus theme
export function startBGM() {
  if (bgmPlaying) return;
  bgmPlaying = true;

  const ctx = getCtx();
  const master = ctx.createGain();
  master.gain.value = 0.045;
  master.connect(ctx.destination);

  const oscs: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  // Deep warm bass - slow pulse
  const bassOsc = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bassOsc.type = 'sine';
  bassOsc.frequency.value = 65.41; // C2
  bassGain.gain.value = 0.6;
  const bassLfo = ctx.createOscillator();
  const bassLfoGain = ctx.createGain();
  bassLfo.type = 'sine';
  bassLfo.frequency.value = 0.5; // slow gentle pulse
  bassLfoGain.gain.value = 0.3;
  bassLfo.connect(bassLfoGain);
  bassLfoGain.connect(bassGain.gain);
  bassLfo.start();
  bassOsc.connect(bassGain);
  bassGain.connect(master);
  bassOsc.start();
  oscs.push(bassOsc, bassLfo);
  gains.push(bassGain, bassLfoGain);

  // Ambient pad - Am7 chord (warm, mysterious)
  const padNotes = [220, 261.63, 329.63, 392]; // A3, C4, E4, G4
  padNotes.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.12;
    // Gentle vibrato
    const vib = ctx.createOscillator();
    const vibGain = ctx.createGain();
    vib.type = 'sine';
    vib.frequency.value = 3 + Math.random() * 2;
    vibGain.gain.value = 1.5;
    vib.connect(vibGain);
    vibGain.connect(osc.frequency);
    vib.start();
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    oscs.push(osc, vib);
    gains.push(gain, vibGain);
  });

  // Melodic arpeggio - cycling through pentatonic scale
  const arpNotes = [523, 587, 659, 784, 880, 784, 659, 587]; // C5 pentatonic
  let arpIndex = 0;
  const arpOsc = ctx.createOscillator();
  const arpGain = ctx.createGain();
  arpOsc.type = 'sine';
  arpOsc.frequency.value = arpNotes[0];
  arpGain.gain.value = 0;
  arpOsc.connect(arpGain);
  arpGain.connect(master);
  arpOsc.start();
  oscs.push(arpOsc);
  gains.push(arpGain);

  const arpInterval = setInterval(() => {
    if (!bgmPlaying) { clearInterval(arpInterval); return; }
    const now = ctx.currentTime;
    arpIndex = (arpIndex + 1) % arpNotes.length;
    arpOsc.frequency.setValueAtTime(arpNotes[arpIndex], now);
    arpGain.gain.setValueAtTime(0.18, now);
    arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  }, 600);

  // Soft heartbeat rhythm
  const kickOsc = ctx.createOscillator();
  const kickGain = ctx.createGain();
  kickOsc.type = 'sine';
  kickOsc.frequency.value = 80;
  kickGain.gain.value = 0;
  kickOsc.connect(kickGain);
  kickGain.connect(master);
  kickOsc.start();
  oscs.push(kickOsc);
  gains.push(kickGain);

  let beatPhase = 0;
  const beatInterval = setInterval(() => {
    if (!bgmPlaying) { clearInterval(beatInterval); return; }
    const now = ctx.currentTime;
    // Double beat like heartbeat: thump-thump ... thump-thump
    kickGain.gain.setValueAtTime(0.5, now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    if (beatPhase % 2 === 0) {
      // Second beat slightly softer and delayed
      setTimeout(() => {
        if (!bgmPlaying) return;
        const t = ctx.currentTime;
        kickGain.gain.setValueAtTime(0.3, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      }, 200);
    }
    beatPhase++;
  }, 800);

  bgmNodes = { oscs, gains, master };
}

export function stopBGM() {
  if (!bgmPlaying || !bgmNodes) return;
  bgmPlaying = false;

  const ctx = getCtx();
  // Fade out
  bgmNodes.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

  const nodes = bgmNodes;
  setTimeout(() => {
    nodes.oscs.forEach((osc) => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    nodes.master.disconnect();
  }, 600);

  bgmNodes = null;
}

export function isBGMPlaying(): boolean {
  return bgmPlaying;
}

// Menu music - chill, dreamy lobby theme
let menuNodes: { oscs: OscillatorNode[]; gains: GainNode[]; master: GainNode; interval: ReturnType<typeof setInterval> } | null = null;
let menuPlaying = false;

export function startMenuMusic() {
  if (menuPlaying) return;
  menuPlaying = true;

  const ctx = getCtx();
  const master = ctx.createGain();
  master.gain.value = 0.05;
  master.connect(ctx.destination);

  const oscs: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  // Warm pad - major 7th chord (Cmaj7)
  const padNotes = [130.81, 164.81, 196, 246.94]; // C3, E3, G3, B3
  padNotes.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.2;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    oscs.push(osc);
    gains.push(gain);
  });

  // Gentle shimmer
  const shimmerOsc = ctx.createOscillator();
  const shimmerGain = ctx.createGain();
  shimmerOsc.type = 'sine';
  shimmerOsc.frequency.value = 784; // G5
  shimmerGain.gain.value = 0.06;
  const shimmerLfo = ctx.createOscillator();
  const shimmerLfoGain = ctx.createGain();
  shimmerLfo.type = 'sine';
  shimmerLfo.frequency.value = 0.15;
  shimmerLfoGain.gain.value = 50;
  shimmerLfo.connect(shimmerLfoGain);
  shimmerLfoGain.connect(shimmerOsc.frequency);
  shimmerLfo.start();
  shimmerOsc.connect(shimmerGain);
  shimmerGain.connect(master);
  shimmerOsc.start();
  oscs.push(shimmerOsc, shimmerLfo);
  gains.push(shimmerGain, shimmerLfoGain);

  // Soft melody notes cycling
  const melodyNotes = [523, 587, 659, 784, 659, 587]; // C D E G E D
  let noteIndex = 0;
  const melodyOsc = ctx.createOscillator();
  const melodyGain = ctx.createGain();
  melodyOsc.type = 'triangle';
  melodyOsc.frequency.value = melodyNotes[0];
  melodyGain.gain.value = 0;
  melodyOsc.connect(melodyGain);
  melodyGain.connect(master);
  melodyOsc.start();
  oscs.push(melodyOsc);
  gains.push(melodyGain);

  const melodyInterval = setInterval(() => {
    if (!menuPlaying) {
      clearInterval(melodyInterval);
      return;
    }
    const now = ctx.currentTime;
    noteIndex = (noteIndex + 1) % melodyNotes.length;
    melodyOsc.frequency.setValueAtTime(melodyNotes[noteIndex], now);
    melodyGain.gain.setValueAtTime(0.15, now);
    melodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  }, 900);

  menuNodes = { oscs, gains, master, interval: melodyInterval };
}

export function stopMenuMusic() {
  if (!menuPlaying || !menuNodes) return;
  menuPlaying = false;

  const ctx = getCtx();
  menuNodes.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  clearInterval(menuNodes.interval);

  const nodes = menuNodes;
  setTimeout(() => {
    nodes.oscs.forEach((osc) => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    nodes.master.disconnect();
  }, 600);

  menuNodes = null;
}
