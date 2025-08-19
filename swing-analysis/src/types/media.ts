export interface Timecode {
  hours: number;
  minutes: number;
  seconds: number;
  frames: number;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  frameRate: number;
}

export interface VideoStatus {
  isLoading: boolean;
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
}

export interface PlaybackState {
  currentTime: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
}

export interface FrameInfo {
  currentFrame: number;
  totalFrames: number;
  frameDuration: number;
}

export const DEFAULT_FRAME_RATE = 30;

export type AspectRatio = '16:9' | '4:3' | 'free';