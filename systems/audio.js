let audioContext;

const SOUND_MAP = {
  tap: { frequency: 320, duration: 0.035, type: "triangle", gain: 0.035 },
  hit: { frequency: 150, duration: 0.045, type: "square", gain: 0.03 },
  ex: { frequency: 520, duration: 0.12, type: "sawtooth", gain: 0.04 },
  victory: { frequency: 760, duration: 0.16, type: "triangle", gain: 0.045 },
  gacha: { frequency: 620, duration: 0.18, type: "sine", gain: 0.05 },
  upgrade: { frequency: 470, duration: 0.1, type: "triangle", gain: 0.04 },
  boss: { frequency: 92, duration: 0.18, type: "sawtooth", gain: 0.035 },
};

export function playSound(save, id) {
  if (!save?.settings?.sfx) return;
  const preset = SOUND_MAP[id] || SOUND_MAP.tap;
  try {
    const AudioCtor = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioCtor) return;
    audioContext = audioContext || new AudioCtor();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = preset.type;
    oscillator.frequency.value = preset.frequency;
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(preset.gain, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + preset.duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + preset.duration + 0.02);
  } catch {
    // Audio is optional. Browsers can block it until the first user gesture.
  }
}
