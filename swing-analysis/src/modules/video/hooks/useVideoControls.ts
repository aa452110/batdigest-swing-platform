import { useCallback, MutableRefObject } from 'react';
import { type VideoViewportRef } from '../player/VideoViewport';

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  frameRate: number;
  aspectRatio: string;
}

export const useVideoControls = (
  viewportRef: MutableRefObject<VideoViewportRef | null>,
  videoState: VideoState,
  setVideoState: React.Dispatch<React.SetStateAction<VideoState>>,
  videoMeta: VideoMetadata | null
) => {
  const handlePlayPause = useCallback(async () => {
    if (!viewportRef.current) return;
    
    if (videoState.isPlaying) {
      viewportRef.current.pause();
      setVideoState(prev => ({ ...prev, isPlaying: false }));
    } else {
      await viewportRef.current.play();
      setVideoState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [videoState.isPlaying, setVideoState]);

  const handleSeek = useCallback((time: number) => {
    if (!viewportRef.current) return;
    viewportRef.current.seekTo(time);
    setVideoState(prev => ({ ...prev, currentTime: time }));
  }, [setVideoState]);

  const handleFrameStep = useCallback((frames: number) => {
    if (!viewportRef.current || !videoMeta) return;
    const frameRate = videoMeta.frameRate || 30;
    const newTime = videoState.currentTime + (frames / frameRate);
    handleSeek(Math.max(0, Math.min(newTime, videoState.duration)));
  }, [videoState.currentTime, videoState.duration, videoMeta, handleSeek]);

  const handleMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    return {
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      frameRate: 30,
      aspectRatio: `${video.videoWidth}:${video.videoHeight}`,
    };
  }, []);

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (e && e.currentTarget) {
      const currentTime = e.currentTarget.currentTime;
      setVideoState(prev => ({
        isPlaying: prev?.isPlaying ?? false,
        currentTime: currentTime,
        duration: prev?.duration ?? 0
      }));
    }
  }, [setVideoState]);

  const handlePlay = useCallback(() => {
    setVideoState(prev => ({ 
      isPlaying: true,
      currentTime: prev?.currentTime ?? 0,
      duration: prev?.duration ?? 0
    }));
  }, [setVideoState]);

  const handlePause = useCallback(() => {
    setVideoState(prev => ({ 
      isPlaying: false,
      currentTime: prev?.currentTime ?? 0,
      duration: prev?.duration ?? 0
    }));
  }, [setVideoState]);

  const handleEnded = useCallback(() => {
    setVideoState(prev => ({ 
      isPlaying: false,
      currentTime: prev?.currentTime ?? 0,
      duration: prev?.duration ?? 0
    }));
  }, [setVideoState]);

  return {
    handlePlayPause,
    handleSeek,
    handleFrameStep,
    handleMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded
  };
};