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

// Background music - chill lofi vibes
export function startBGM() {
  if (bgmPlaying) return;
  bgmPlaying = true;

  const ctx = getCtx();
  const master = ctx.createGain();
  master.gain.value = 0.04;
  master.connect(ctx.destination);

  const oscs: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  // Warm sub bass
  const bassOsc = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bassOsc.type = 'sine';
  bassOsc.frequency.value = 55; // A1
  bassGain.gain.value = 0.35;
  bassOsc.connect(bassGain);
  bassGain.connect(master);
  bassOsc.start();
  oscs.push(bassOsc);
  gains.push(bassGain);

  // Dreamy pad - Fmaj9 (warm, floaty)
  const padNotes = [174.61, 220, 261.63, 329.63, 392]; // F3, A3, C4, E4, G4
  padNotes.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    oscs.push(osc);
    gains.push(gain);
  });

  // Slow lofi melody - pentatonic, relaxed timing
  const melodyNotes = [
    659, 587, 523, 440, 523, 587, 440, 392,
    523, 659, 587, 523, 440, 392, 440, 523
  ];
  let melodyIndex = 0;
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
    if (!bgmPlaying) { clearInterval(melodyInterval); return; }
    const now = ctx.currentTime;
    melodyIndex = (melodyIndex + 1) % melodyNotes.length;
    melodyOsc.frequency.setValueAtTime(melodyNotes[melodyIndex], now);
    melodyGain.gain.setValueAtTime(0.2, now);
    melodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
  }, 1000);

  // Gentle high shimmer - slow breathing
  const shimOsc = ctx.createOscillator();
  const shimGain = ctx.createGain();
  shimOsc.type = 'sine';
  shimOsc.frequency.value = 1047; // C6
  shimGain.gain.value = 0.03;
  const shimLfo = ctx.createOscillator();
  const shimLfoGain = ctx.createGain();
  shimLfo.type = 'sine';
  shimLfo.frequency.value = 0.1; // very slow
  shimLfoGain.gain.value = 0.02;
  shimLfo.connect(shimLfoGain);
  shimLfoGain.connect(shimGain.gain);
  shimLfo.start();
  shimOsc.connect(shimGain);
  shimGain.connect(master);
  shimOsc.start();
  oscs.push(shimOsc, shimLfo);
  gains.push(shimGain, shimLfoGain);

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
