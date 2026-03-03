/**
 * Time conversion utilities for the Timer tool
 */

export interface HMS {
  h: number;
  m: number;
  s: number;
}

/**
 * Converts a total number of seconds into hours, minutes, and seconds.
 *
 * @param totalSeconds - Non-negative integer representing total seconds
 * @returns An object with h (hours), m (minutes 0–59), s (seconds 0–59)
 */
export function secondsToHMS(totalSeconds: number): HMS {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h, m, s };
}

/**
 * Converts hours, minutes, and seconds into a total number of seconds.
 *
 * @param h - Hours
 * @param m - Minutes
 * @param s - Seconds
 * @returns Total seconds as an integer
 */
export function hmsToSeconds(h: number, m: number, s: number): number {
  return h * 3600 + m * 60 + s;
}
