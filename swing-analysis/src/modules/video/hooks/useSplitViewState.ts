import { useState, useCallback } from 'react';

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

export const useSplitViewState = () => {
  const [video1State, setVideo1State] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });
  
  const [video2State, setVideo2State] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });
  
  const [video1Meta, setVideo1Meta] = useState<VideoMetadata | null>(null);
  const [video2Meta, setVideo2Meta] = useState<VideoMetadata | null>(null);
  
  const updateVideo1Meta = useCallback((meta: VideoMetadata) => {
    setVideo1Meta(meta);
    setVideo1State(prev => ({ ...prev, duration: meta.duration }));
  }, []);
  
  const updateVideo2Meta = useCallback((meta: VideoMetadata) => {
    setVideo2Meta(meta);
    setVideo2State(prev => ({ ...prev, duration: meta.duration }));
  }, []);

  return {
    video1State,
    setVideo1State,
    video2State,
    setVideo2State,
    video1Meta,
    setVideo1Meta: updateVideo1Meta,
    video2Meta,
    setVideo2Meta: updateVideo2Meta,
  };
};