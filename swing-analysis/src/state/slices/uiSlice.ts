import type { StateCreator } from 'zustand';

export interface UISlice {
  // State
  isToolbarVisible: boolean;
  isTimelineVisible: boolean;
  isSidebarVisible: boolean;
  activePanel: 'single' | 'compare' | 'record';
  isFullscreen: boolean;
  showKeyboardShortcuts: boolean;
  showStats: boolean;
  videoError: string | null;

  // Actions
  toggleToolbar: () => void;
  toggleTimeline: () => void;
  toggleSidebar: () => void;
  setActivePanel: (panel: 'single' | 'compare' | 'record') => void;
  toggleFullscreen: () => void;
  setShowKeyboardShortcuts: (show: boolean) => void;
  setShowStats: (show: boolean) => void;
  setVideoError: (error: string | null) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  // Initial state
  isToolbarVisible: true,
  isTimelineVisible: true,
  isSidebarVisible: true,
  activePanel: 'single',
  isFullscreen: false,
  showKeyboardShortcuts: false,
  showStats: false,
  videoError: null,

  // Actions
  toggleToolbar: () => {
    set((state) => ({ isToolbarVisible: !state.isToolbarVisible }));
  },

  toggleTimeline: () => {
    set((state) => ({ isTimelineVisible: !state.isTimelineVisible }));
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarVisible: !state.isSidebarVisible }));
  },

  setActivePanel: (panel) => {
    set({ activePanel: panel });
  },

  toggleFullscreen: () => {
    set((state) => {
      const newFullscreen = !state.isFullscreen;

      if (newFullscreen) {
        // Request fullscreen
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }

      return { isFullscreen: newFullscreen };
    });
  },

  setShowKeyboardShortcuts: (show) => {
    set({ showKeyboardShortcuts: show });
  },

  setShowStats: (show) => {
    set({ showStats: show });
  },

  setVideoError: (error) => {
    set({ videoError: error });
  },
});