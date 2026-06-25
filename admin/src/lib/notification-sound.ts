let audioContext: AudioContext | null = null;

export function unlockNotificationAudio() {
  if (typeof window === 'undefined') return;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
}

/** Short two-tone chime for new notifications. */
export function playNotificationSound() {
  if (typeof window === 'undefined') return;

  try {
    unlockNotificationAudio();
    const ctx = audioContext ?? new AudioContext();
    audioContext = ctx;

    const now = ctx.currentTime;
    [880, 1174].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const start = now + i * 0.13;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  } catch {
    // Browser may block audio until user gesture
  }
}
