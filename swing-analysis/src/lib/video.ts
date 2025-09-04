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

// Shared: Resolve analyzed video download URL from various sources
export interface AnalyzedVideoSource {
  downloadUrl?: string | null;
  analysisResult?: string | null; // JSON string possibly containing fields
  hlsUrl?: string | null;
  videoKey?: string | null;
}

function hlsToMp4Download(hlsUrl: string): string | null {
  if (!hlsUrl) return null;
  // Typical CF Stream HLS path ends with /manifest/video.m3u8
  if (hlsUrl.includes('/manifest/video.m3u8')) {
    return hlsUrl.replace('/manifest/video.m3u8', '/downloads/default.mp4');
  }
  // Fallback: if URL already looks like a downloads URL, return as-is
  if (hlsUrl.includes('/downloads/')) return hlsUrl;
  return null;
}

export function resolveAnalyzedDownloadUrl(source: AnalyzedVideoSource): string | null {
  try {
    // 1) Prefer explicit field
    if (source.downloadUrl) return source.downloadUrl;

    // 2) Parse analysisResult if present
    if (source.analysisResult) {
      const data = JSON.parse(source.analysisResult);
      if (data?.downloadUrl) return data.downloadUrl as string;
      if (data?.mp4Url) return data.mp4Url as string;
      if (data?.analysisUrl) return data.analysisUrl as string;
      if (data?.hlsUrl) {
        const maybe = hlsToMp4Download(data.hlsUrl as string);
        if (maybe) return maybe;
      }
      if (data?.videoKey) {
        return `https://customer-yq8x3fnnfhzi0vpw.cloudflarestream.com/${data.videoKey}/downloads/default.mp4`;
      }
    }

    // 3) Direct hlsUrl/videoKey on the object
    if (source.hlsUrl) {
      const maybe = hlsToMp4Download(source.hlsUrl);
      if (maybe) return maybe;
    }
    if (source.videoKey) {
      return `https://customer-yq8x3fnnfhzi0vpw.cloudflarestream.com/${source.videoKey}/downloads/default.mp4`;
    }
  } catch (e) {
    // Swallow parse errors and fall through
    console.warn('Failed to resolve analyzed download URL:', e);
  }
  return null;
}
