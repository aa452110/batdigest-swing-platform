import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VideoState {
  videoFile: File | null;
  videoUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  frameRate: number;
  setVideoFile: (file: File | null) => void;
  setVideoUrl: (url: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  setFrameRate: (fps: number) => void;
  seekTo: (time: number) => void;
  seekByFrames: (frames: number) => void;
  seekBySeconds: (seconds: number) => void;
  clearVideo: () => void;
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      videoFile: null,
      videoUrl: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1,
      frameRate: 30, // Default to 30fps, will be updated from video metadata
      setVideoFile: (file) => set({ videoFile: file }),
      setVideoUrl: (url) => set({ videoUrl: url }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration: duration }),
      setPlaybackRate: (rate) => set({ playbackRate: rate }),
      setFrameRate: (fps) => set({ frameRate: fps }),
      seekTo: (time) => {
        const { duration } = get();
        const clampedTime = Math.max(0, Math.min(time, duration));
        set({ currentTime: clampedTime, isPlaying: false });
      },
      seekByFrames: (frames) => {
        const { currentTime, frameRate, duration } = get();
        const frameDuration = 1 / frameRate;
        const newTime = currentTime + frames * frameDuration;
        const clampedTime = Math.max(0, Math.min(newTime, duration));
        set({ currentTime: clampedTime });
      },
      seekBySeconds: (seconds) => {
        const { currentTime, duration } = get();
        const newTime = currentTime + seconds;
        const clampedTime = Math.max(0, Math.min(newTime, duration));
        set({ currentTime: clampedTime });
      },
      clearVideo: () =>
        set({
          videoFile: null,
          videoUrl: null,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          playbackRate: 1,
          frameRate: 30,
        }),
    }),
    {
      name: 'video-storage',
      partialize: (state) => ({
        // Don't persist blob URLs as they're invalid on reload
        currentTime: state.currentTime,
        duration: state.duration,
        playbackRate: state.playbackRate,
      }),
    }
  )
);
