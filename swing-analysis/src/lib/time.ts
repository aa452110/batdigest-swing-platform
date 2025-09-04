import type { Timecode } from '../types/media';

/**
 * Convert seconds to timecode format (HH:MM:SS:FF)
 */
export function secondsToTimecode(seconds: number, frameRate: number = 30): Timecode {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * frameRate);

  return { hours, minutes, seconds: secs, frames };
}

/**
 * Format timecode as string (MM:SS:FF or HH:MM:SS:FF)
 */
export function formatTimecode(timecode: Timecode, showHours = false): string {
  const { hours, minutes, seconds, frames } = timecode;
  
  const parts = [
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
    frames.toString().padStart(2, '0'),
  ];

  if (showHours || hours > 0) {
    parts.unshift(hours.toString().padStart(2, '0'));
  }

  return parts.join(':');
}

/**
 * Format seconds as MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Convert timecode to seconds
 */
export function timecodeToSeconds(timecode: Timecode, frameRate: number = 30): number {
  const { hours, minutes, seconds, frames } = timecode;
  return hours * 3600 + minutes * 60 + seconds + frames / frameRate;
}