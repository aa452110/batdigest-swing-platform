import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { VideoSlice } from './slices/videoSlice';
import { createVideoSlice } from './slices/videoSlice';
import type { AnnotationSlice } from './slices/annotationSlice';
import { createAnnotationSlice } from './slices/annotationSlice';
import type { UISlice } from './slices/uiSlice';
import { createUISlice } from './slices/uiSlice';
import type { RecordingSlice } from './slices/recordingSlice';
import { createRecordingSlice } from './slices/recordingSlice';
import type { ComparisonSlice } from './slices/comparisonSlice';
import { createComparisonSlice } from './slices/comparisonSlice';

export type AppStore = VideoSlice & AnnotationSlice & UISlice & RecordingSlice & ComparisonSlice;

export const useStore = create<AppStore>()(
  devtools(
    (...args) => ({
      ...createVideoSlice(...args),
      ...createAnnotationSlice(...args),
      ...createUISlice(...args),
      ...createRecordingSlice(...args),
      ...createComparisonSlice(...args),
    }),
    {
      name: 'swing-analysis-store',
    }
  )
);

// Convenience hooks for specific slices
export const useVideoStore = () => {
  const {
    videoFile,
    videoUrl,
    metadata,
    playback,
    loadVideo,
    clearVideo,
    setMetadata,
    setPlaybackState,
    play,
    pause,
    togglePlayPause,
    seek,
    seekByFrames,
    seekBySeconds,
    setPlaybackRate,
  } = useStore();

  return {
    videoFile,
    videoUrl,
    metadata,
    playback,
    loadVideo,
    clearVideo,
    setMetadata,
    setPlaybackState,
    play,
    pause,
    togglePlayPause,
    seek,
    seekByFrames,
    seekBySeconds,
    setPlaybackRate,
  };
};

export const useAnnotationStore = () => {
  const {
    annotations,
    currentTool,
    currentStyle,
    selectedAnnotationId,
    history,
    setCurrentTool,
    setCurrentStyle,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectAnnotation,
    clearAnnotations,
    getAnnotationsAtTime,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useStore();

  return {
    annotations,
    currentTool,
    currentStyle,
    selectedAnnotationId,
    history,
    setCurrentTool,
    setCurrentStyle,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectAnnotation,
    clearAnnotations,
    getAnnotationsAtTime,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};

export const useRecordingStore = () => {
  const {
    recordings,
    currentRecording,
    recordingState,
    audioSettings,
    availableDevices,
    mediaRecorder,
    audioStream,
    setAvailableDevices,
    selectAudioDevice,
    setAudioSettings,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    deleteRecording,
    clearAllRecordings,
    setAudioLevel,
    setMediaRecorder,
    setAudioStream,
  } = useStore();

  return {
    recordings,
    currentRecording,
    recordingState,
    audioSettings,
    availableDevices,
    mediaRecorder,
    audioStream,
    setAvailableDevices,
    selectAudioDevice,
    setAudioSettings,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    deleteRecording,
    clearAllRecordings,
    setAudioLevel,
    setMediaRecorder,
    setAudioStream,
  };
};

export const useUIStore = () => {
  const {
    isToolbarVisible,
    isTimelineVisible,
    isSidebarVisible,
    activePanel,
    isFullscreen,
    showKeyboardShortcuts,
    showStats,
    videoError,
    toggleToolbar,
    toggleTimeline,
    toggleSidebar,
    setActivePanel,
    toggleFullscreen,
    setShowKeyboardShortcuts,
    setShowStats,
    setVideoError,
  } = useStore();

  return {
    isToolbarVisible,
    isTimelineVisible,
    isSidebarVisible,
    activePanel,
    isFullscreen,
    showKeyboardShortcuts,
    showStats,
    videoError,
    toggleToolbar,
    toggleTimeline,
    toggleSidebar,
    setActivePanel,
    toggleFullscreen,
    setShowKeyboardShortcuts,
    setShowStats,
    setVideoError,
  };
};

export const useComparisonStore = () => {
  const {
    video1,
    video2,
    viewMode,
    loadComparisonVideo,
    clearComparisonVideo,
    setComparisonMetadata,
    setComparisonPlayback,
    playComparison,
    pauseComparison,
    toggleComparisonPlayPause,
    seekComparison,
    setViewMode,
    syncVideos,
  } = useStore();

  return {
    video1,
    video2,
    viewMode,
    loadComparisonVideo,
    clearComparisonVideo,
    setComparisonMetadata,
    setComparisonPlayback,
    playComparison,
    pauseComparison,
    toggleComparisonPlayPause,
    seekComparison,
    setViewMode,
    syncVideos,
  };
};