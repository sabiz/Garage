/**
 * Audio utilities for the Timer tool
 */

/**
 * Pre-renders one cycle of the beep pattern into an AudioBuffer using
 * OfflineAudioContext so playback at alarm time is instantaneous.
 *
 * The pattern consists of 4 sine-wave beeps at alternating frequencies
 * (880 Hz → 1100 Hz → 880 Hz → 660 Hz), each 200ms long with a 400ms interval,
 * resulting in a 1.6-second loopable cycle.
 *
 * Returns null if the Web Audio API is unavailable.
 *
 * @returns A Promise resolving to a pre-rendered AudioBuffer, or null on failure
 */
export async function buildAlarmBuffer(): Promise<AudioBuffer | null> {
  try {
    const sampleRate = 44100;
    const frequencies = [880, 1100, 880, 660];
    const beepDuration = 0.2;  // seconds per beep
    const beepInterval = 0.4;  // seconds between beep starts
    const cycleDuration = frequencies.length * beepInterval; // 1.6s

    const offlineCtx = new OfflineAudioContext(1, Math.ceil(sampleRate * cycleDuration), sampleRate);

    frequencies.forEach((freq, i) => {
      const startTime = i * beepInterval;
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + beepDuration);
      osc.connect(gain);
      gain.connect(offlineCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + beepDuration);
    });

    return await offlineCtx.startRendering();
  } catch {
    // Web Audio API unavailable
    return null;
  }
}
