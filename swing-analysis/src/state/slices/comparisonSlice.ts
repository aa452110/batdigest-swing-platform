import type { StateCreator } from 'zustand';
import type { VideoMetadata, PlaybackState } from '../../types/media';

export interface VideoData {
  file: File | null;
  url: string | null;
  metadata: VideoMetadata | null;
  playback: PlaybackState;
}

export type ViewMode = 'video1' | 'video2' | 'split';

export interface ComparisonSlice {
  // State for two videos
  video1: VideoData;
  video2: VideoData;
  viewMode: ViewMode;
  
  // Actions
  loadComparisonVideo: (file: File, url: string, videoId: 1 | 2) => void;
  clearComparisonVideo: (videoId: 1 | 2) => void;
  setComparisonMetadata: (metadata: VideoMetadata, videoId: 1 | 2) => void;
  setComparisonPlayback: (state: Partial<PlaybackState>, videoId: 1 | 2) => void;
  playComparison: (videoId: 1 | 2) => void;
  pauseComparison: (videoId: 1 | 2) => void;
  toggleComparisonPlayPause: (videoId: 1 | 2) => void;
  seekComparison: (time: number, videoId: 1 | 2) => void;
  setViewMode: (mode: ViewMode) => void;
  syncVideos: () => void; // Sync both videos to same time
}

const initialVideoData: VideoData = {
  file: null,
  url: null,
  metadata: null,
  playback: {
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1,
  },
};

export const createComparisonSlice: StateCreator<ComparisonSlice> = (set, get) => ({
  // Initial state
  video1: { ...initialVideoData },
  video2: { ...initialVideoData },
  viewMode: 'video1',

  // Actions
  loadComparisonVideo: (file, url, videoId) => {
    set((state) => ({
      [`video${videoId}`]: {
        file,
        url,
        metadata: null,
        playback: {
          isPlaying: false,
          currentTime: 0,
          playbackRate: 1,
        },
      },
    }));
  },

  clearComparisonVideo: (videoId) => {
    set((state) => ({
      [`video${videoId}`]: { ...initialVideoData },
    }));
  },

  setComparisonMetadata: (metadata, videoId) => {
    set((state) => ({
      [`video${videoId}`]: {
        ...state[`video${videoId}`],
        metadata,
      },
    }));
  },

  setComparisonPlayback: (playbackUpdate, videoId) => {
    set((state) => ({
      [`video${videoId}`]: {
        ...state[`video${videoId}`],
        playback: {
          ...state[`video${videoId}`].playback,
          ...playbackUpdate,
        },
      },
    }));
  },

  playComparison: (videoId) => {
    set((state) => ({
      [`video${videoId}`]: {
        ...state[`video${videoId}`],
        playback: {
          ...state[`video${videoId}`].playback,
          isPlaying: true,
        },
      },
    }));
  },

  pauseComparison: (videoId) => {
    set((state) => ({
      [`video${videoId}`]: {
        ...state[`video${videoId}`],
        playback: {
          ...state[`video${videoId}`].playback,
          isPlaying: false,
        },
      },
    }));
  },

  toggleComparisonPlayPause: (videoId) => {
    const video = get()[`video${videoId}`];
    set((state) => ({
      [`video${videoId}`]: {
        ...state[`video${videoId}`],
        playback: {
          ...state[`video${videoId}`].playback,
          isPlaying: !video.playback.isPlaying,
        },
      },
    }));
  },

  seekComparison: (time, videoId) => {
    const video = get()[`video${videoId}`];
    if (!video.metadata) return;

    const clampedTime = Math.max(0, Math.min(time, video.metadata.duration));
    set((state) => ({
      [`video${videoId}`]: {
        ...state[`video${videoId}`],
        playback: {
          ...state[`video${videoId}`].playback,
          currentTime: clampedTime,
        },
      },
    }));
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  syncVideos: () => {
    const { video1 } = get();
    if (!video1.playback) return;
    
    set((state) => ({
      video2: {
        ...state.video2,
        playback: {
          ...state.video2.playback,
          currentTime: video1.playback.currentTime,
        },
      },
    }));
  },
});