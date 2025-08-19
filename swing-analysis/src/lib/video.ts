import type { FrameInfo } from '../types/media';

/**
 * Calculate frame duration in seconds
 */
export function getFrameDuration(frameRate: number): number {
  return 1 / frameRate;
}

/**
 * Get current frame number from time
 */
export function timeToFrame(time: number, frameRate: number): number {
  return Math.floor(time * frameRate);
}

/**
 * Get time from frame number
 */
export function frameToTime(frame: number, frameRate: number): number {
  return frame / frameRate;
}

/**
 * Get frame info for current time
 */
export function getFrameInfo(currentTime: number, duration: number, frameRate: number): FrameInfo {
  const currentFrame = timeToFrame(currentTime, frameRate);
  const totalFrames = timeToFrame(duration, frameRate);
  const frameDuration = getFrameDuration(frameRate);

  return { currentFrame, totalFrames, frameDuration };
}

/**
 * Seek to specific frame
 */
export function seekToFrame(video: HTMLVideoElement, frameNumber: number, frameRate: number): void {
  const time = frameToTime(frameNumber, frameRate);
  video.currentTime = Math.max(0, Math.min(time, video.duration));
}

/**
 * Seek by frame offset
 */
export function seekByFrames(video: HTMLVideoElement, frames: number, frameRate: number): void {
  const frameDuration = getFrameDuration(frameRate);
  const newTime = video.currentTime + frames * frameDuration;
  video.currentTime = Math.max(0, Math.min(newTime, video.duration));
}

/**
 * Check if browser supports required video APIs
 */
export function checkVideoSupport(): {
  hasRequestVideoFrameCallback: boolean;
  hasGetDisplayMedia: boolean;
  hasMediaRecorder: boolean;
} {
  return {
    hasRequestVideoFrameCallback: 'requestVideoFrameCallback' in HTMLVideoElement.prototype,
    hasGetDisplayMedia: 'getDisplayMedia' in navigator.mediaDevices,
    hasMediaRecorder: 'MediaRecorder' in window,
  };
}

/**
 * Check if video codec is supported
 */
export function checkCodecSupport(mimeType: string): boolean {
  const video = document.createElement('video');
  return video.canPlayType(mimeType) !== '';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}