import type { StateCreator } from 'zustand';
import type { VideoMetadata, PlaybackState } from '../../types/media';
import { getFrameDuration } from '../../lib/video';

export interface VideoSlice {
  // State
  videoFile: File | null;
  videoUrl: string | null;
  metadata: VideoMetadata | null;
  playback: PlaybackState;
  
  // Actions
  loadVideo: (file: File, url: string) => void;
  clearVideo: () => void;
  setMetadata: (metadata: VideoMetadata) => void;
  setPlaybackState: (state: Partial<PlaybackState>) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  seekByFrames: (frames: number) => void;
  seekBySeconds: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
}

export const createVideoSlice: StateCreator<VideoSlice> = (set, get) => ({
  // Initial state
  videoFile: null,
  videoUrl: null,
  metadata: null,
  playback: {
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1,
  },

  // Actions
  loadVideo: (file, url) => {
    set({
      videoFile: file,
      videoUrl: url,
      metadata: null,
      playback: {
        isPlaying: false,
        currentTime: 0,
        playbackRate: 1,
      },
    });
  },

  clearVideo: () => {
    const state = get();
    // Note: URL revocation should be handled by useObjectUrl hook
    set({
      videoFile: null,
      videoUrl: null,
      metadata: null,
      playback: {
        isPlaying: false,
        currentTime: 0,
        playbackRate: 1,
      },
    });
  },

  setMetadata: (metadata) => {
    set({ metadata });
  },

  setPlaybackState: (state) => {
    set((prev) => ({
      playback: { ...prev.playback, ...state },
    }));
  },

  play: () => {
    set((state) => ({
      playback: { ...state.playback, isPlaying: true },
    }));
  },

  pause: () => {
    set((state) => ({
      playback: { ...state.playback, isPlaying: false },
    }));
  },

  togglePlayPause: () => {
    set((state) => ({
      playback: { ...state.playback, isPlaying: !state.playback.isPlaying },
    }));
  },

  seek: (time) => {
    const { metadata } = get();
    if (!metadata) return;

    const clampedTime = Math.max(0, Math.min(time, metadata.duration));
    set((state) => ({
      playback: { ...state.playback, currentTime: clampedTime },
    }));
  },

  seekByFrames: (frames) => {
    const { metadata, playback } = get();
    if (!metadata) return;

    const frameDuration = getFrameDuration(metadata.frameRate);
    const newTime = playback.currentTime + frames * frameDuration;
    const clampedTime = Math.max(0, Math.min(newTime, metadata.duration));
    
    set((state) => ({
      playback: { ...state.playback, currentTime: clampedTime },
    }));
  },

  seekBySeconds: (seconds) => {
    const { metadata, playback } = get();
    if (!metadata) return;

    const newTime = playback.currentTime + seconds;
    const clampedTime = Math.max(0, Math.min(newTime, metadata.duration));
    
    set((state) => ({
      playback: { ...state.playback, currentTime: clampedTime },
    }));
  },

  setPlaybackRate: (rate) => {
    set((state) => ({
      playback: { ...state.playback, playbackRate: rate },
    }));
  },
});