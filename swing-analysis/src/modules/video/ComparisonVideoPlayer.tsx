import React, { useRef, useCallback, useEffect, useState } from 'react';
import { type VideoViewportRef } from './player/VideoViewport';
import ViewModeToggle from './components/ViewModeToggle';
import VideoDisplay from './components/VideoDisplay';
import SplitVideoView from './SplitVideoView';
import { useVideoControls } from './hooks/useVideoControls';
import { useSplitViewState } from './hooks/useSplitViewState';
import { useVideoStore, useAnnotationStore, useComparisonStore } from '../../state/store';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { useHotkeys } from '../../lib/useHotkeys';

interface ComparisonVideoPlayerProps {
  className?: string;
  onVideo1Change?: (setVideo1: (file: File) => void) => void;
  onVideo2Change?: (setVideo2: (file: File) => void) => void;
  onStateChange?: (state: {
    video1File: File | null;
    video2File: File | null;
    handleVideo1Select: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleVideo2Select: (e: React.ChangeEvent<HTMLInputElement>) => void;
    playback: any;
    metadata: any;
    handlePlayPause: () => void;
    handleSeek: (time: number) => void;
    handleSeekByFrames: (frames: number) => void;
    handleSeekBySeconds: (seconds: number) => void;
    handlePlaybackRateChange: (rate: number) => void;
    viewMode: string;
    video1Controls?: any;
    video2Controls?: any;
  }) => void;
}

// SplitVideoView component has been extracted to its own file

const ComparisonVideoPlayer: React.FC<ComparisonVideoPlayerProps> = ({ className = '', onVideo1Change, onVideo2Change, onStateChange }) => {
  const [video1File, setVideo1File] = useState<File | null>(null);
  const [video2File, setVideo2File] = useState<File | null>(null);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
  
  // Use split view state hook
  const {
    video1State,
    setVideo1State,
    video2State,
    setVideo2State,
    video1Meta,
    setVideo1Meta,
    video2Meta,
    setVideo2Meta,
  } = useSplitViewState();
  
  const viewport1Ref = useRef<VideoViewportRef>(null);
  const viewport2Ref = useRef<VideoViewportRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const video1Url = useObjectUrl(video1File);
  const video2Url = useObjectUrl(video2File);

  const { viewMode, setViewMode } = useComparisonStore();

  // Use existing video store for main controls
  const {
    metadata,
    playback,
    setMetadata,
    setPlaybackState,
    play,
    pause,
    togglePlayPause,
    seek,
    seekByFrames,
    seekBySeconds,
    setPlaybackRate,
  } = useVideoStore();

  const {
    annotations,
    currentTool,
    currentStyle,
    selectedAnnotationId,
    addAnnotation,
    selectAnnotation,
    deleteAnnotation,
    getAnnotationsAtTime,
    undo,
    redo,
  } = useAnnotationStore();

  // Expose setVideo1File and setVideo2File to parent component
  useEffect(() => {
    if (onVideo1Change) {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => {
        onVideo1Change(setVideo1File);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [onVideo1Change]);

  useEffect(() => {
    if (onVideo2Change) {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => {
        onVideo2Change(setVideo2File);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [onVideo2Change]);

  // Expose state and handlers to parent
  useEffect(() => {
    if (onStateChange) {
      const timer = setTimeout(() => {
        onStateChange({
          video1File,
          video2File,
          handleVideo1Select,
          handleVideo2Select,
          playback,
          metadata,
          handlePlayPause,
          handleSeek,
          handleSeekByFrames,
          handleSeekBySeconds,
          handlePlaybackRateChange,
          viewMode,
          video1Controls: {
            state: video1State,
            meta: video1Meta,
            onPlayPause: handleVideo1PlayPause,
            onSeek: handleVideo1Seek,
            onFrameStep: handleVideo1FrameStep
          },
          video2Controls: {
            state: video2State,
            meta: video2Meta,
            onPlayPause: handleVideo2PlayPause,
            onSeek: handleVideo2Seek,
            onFrameStep: handleVideo2FrameStep
          }
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [onStateChange, video1File, video2File, playback, metadata, viewMode, video1State, video2State, video1Meta, video2Meta]);


  // File input handlers
  const handleVideo1Select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo1File(file);
      setActiveVideo(1);
    }
  };

  const handleVideo2Select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo2File(file);
      setActiveVideo(2);
    }
  };

  // Get the active video element
  const getActiveViewport = () => {
    return activeVideo === 1 ? viewport1Ref.current : viewport2Ref.current;
  };

  const getActiveFile = () => {
    return activeVideo === 1 ? video1File : video2File;
  };

  // Use video controls hooks
  const video1Controls = useVideoControls(
    viewport1Ref,
    video1State,
    setVideo1State,
    video1Meta
  );
  
  const video2Controls = useVideoControls(
    viewport2Ref,
    video2State,
    setVideo2State,
    video2Meta
  );
  
  const handleVideo1PlayPause = video1Controls.handlePlayPause;
  const handleVideo1Seek = video1Controls.handleSeek;
  const handleVideo1FrameStep = video1Controls.handleFrameStep;
  
  const handleVideo2PlayPause = video2Controls.handlePlayPause;
  const handleVideo2Seek = video2Controls.handleSeek;
  const handleVideo2FrameStep = video2Controls.handleFrameStep;

  // Event handlers
  const handleVideo1Metadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const meta = video1Controls.handleMetadata(e);
      setVideo1Meta(meta);
      if (activeVideo === 1 || viewMode === 'video1') {
        setMetadata(meta);
      }
    },
    [setMetadata, activeVideo, viewMode, video1Controls]
  );

  const handleVideo2Metadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const meta = video2Controls.handleMetadata(e);
      setVideo2Meta(meta);
      if (activeVideo === 2 || viewMode === 'video2') {
        setMetadata(meta);
      }
    },
    [setMetadata, activeVideo, viewMode, video2Controls]
  );

  const handleTimeUpdate = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      setPlaybackState({ currentTime: video.currentTime });
    },
    [setPlaybackState]
  );

  const handlePlayPause = useCallback(async () => {
    const viewport = getActiveViewport();
    if (!viewport) return;

    if (playback.isPlaying) {
      viewport.pause();
      pause();
    } else {
      await viewport.play();
      play();
    }
  }, [playback.isPlaying, play, pause, activeVideo]);

  const handleSeek = useCallback(
    (time: number) => {
      const viewport = getActiveViewport();
      if (!viewport) return;
      viewport.seekTo(time);
      seek(time);
    },
    [seek, activeVideo]
  );

  const handleSeekByFrames = useCallback(
    (frames: number) => {
      const viewport = getActiveViewport();
      if (!viewport || !metadata) return;
      const newTime = playback.currentTime + (frames / metadata.frameRate);
      viewport.seekTo(newTime);
      seekByFrames(frames);
    },
    [seekByFrames, playback.currentTime, metadata, activeVideo]
  );

  const handleSeekBySeconds = useCallback(
    (seconds: number) => {
      const viewport = getActiveViewport();
      if (!viewport || !metadata) return;
      const newTime = playback.currentTime + seconds;
      viewport.seekTo(newTime);
      seekBySeconds(seconds);
    },
    [seekBySeconds, playback.currentTime, metadata, activeVideo]
  );

  const handlePlaybackRateChange = useCallback(
    (rate: number) => {
      const viewport = getActiveViewport();
      if (!viewport?.video) return;
      viewport.video.playbackRate = rate;
      setPlaybackRate(rate);
    },
    [setPlaybackRate, activeVideo]
  );

  // Handle view mode changes
  const handleViewModeChange = useCallback((mode: string, video?: 1 | 2) => {
    setViewMode(mode);
    if (video) {
      setActiveVideo(video);
      const meta = video === 1 ? video1Meta : video2Meta;
      if (meta) setMetadata(meta);
    }
  }, [setViewMode, setMetadata, video1Meta, video2Meta]);

  // Setup hotkeys
  useHotkeys([
    {
      key: ' ',
      handler: () => togglePlayPause(),
      preventDefault: true,
    },
    {
      key: 'ArrowLeft',
      handler: () => handleSeekByFrames(-1),
      preventDefault: true,
    },
    {
      key: 'ArrowRight',
      handler: () => handleSeekByFrames(1),
      preventDefault: true,
    },
    {
      key: '1',
      handler: () => {
        if (video1File) {
          setViewMode('video1');
          setActiveVideo(1);
        }
      },
      preventDefault: true,
    },
    {
      key: '2',
      handler: () => {
        if (video2File) {
          setViewMode('video2');
          setActiveVideo(2);
        }
      },
      preventDefault: true,
    },
    {
      key: '3',
      handler: () => {
        if (video1File && video2File) {
          setViewMode('split');
        }
      },
      preventDefault: true,
    },
  ]);

  const visibleAnnotations = getAnnotationsAtTime(playback.currentTime);

  // Get active video element for annotations
  const getActiveVideoElement = () => {
    if (viewMode === 'split') return null; // No annotations in split view
    if (viewMode === 'video1') return viewport1Ref.current?.video || null;
    if (viewMode === 'video2') return viewport2Ref.current?.video || null;
    return null;
  };

  // Enable a loud visual overlay in local dev to validate exact cropping
  // Debug overlay disabled
  const showDebugOverlay = false;

  return (
    <div className={className}>
      <ViewModeToggle
        video1File={video1File}
        video2File={video2File}
        viewMode={viewMode}
        onVideo1Select={handleVideo1Select}
        onVideo2Select={handleVideo2Select}
        onViewModeChange={handleViewModeChange}
      />
      <div ref={containerRef} 
        id="video-container-actual" 
        style={{ 
          width: '1080px', 
          height: '608px',  // Maintains 16:9 ratio (1080 * 9/16 = 607.5)
          minWidth: '1080px',
          maxWidth: '1080px', 
          minHeight: '608px',
          maxHeight: '608px',
          flexShrink: 0,
          position: 'relative'
        }} 
        className="relative bg-black rounded-lg overflow-hidden">
          {showDebugOverlay && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255,105,180,0.7)', // hotpink with alpha
              zIndex: 9999,
              pointerEvents: 'none',
              border: '50px solid lightgreen',
              boxSizing: 'border-box'
            }}>
              {/* Crosshairs */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: 'black',
                transform: 'translateY(-50%)'
              }} />
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: '4px',
                backgroundColor: 'black',
                transform: 'translateX(-50%)'
              }} />

              {/* Center dot */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '60px',
                height: '60px',
                backgroundColor: 'red',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10000
              }} />

              {/* Labels */}
              <div style={{
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textShadow: '2px 2px 4px black'
              }}>
                <div>VIDEO CONTAINER ACTUAL</div>
                <div style={{ fontSize: '18px' }}>1080 x 608</div>
                <div style={{ fontSize: '14px', marginTop: '10px' }}>Top edge should align with recording</div>
              </div>
            </div>
          )}
          {viewMode === 'video1' && video1File && (
            <VideoDisplay
              ref={viewport1Ref}
              videoUrl={video1Url}
              videoMeta={video1Meta}
              onLoadedMetadata={handleVideo1Metadata}
              onTimeUpdate={(e) => {
                handleTimeUpdate(e);
                video1Controls.handleTimeUpdate(e);
              }}
              onPlay={() => {
                play();
                video1Controls.handlePlay();
              }}
              onPause={() => {
                pause();
                video1Controls.handlePause();
              }}
              onEnded={() => {
                pause();
                video1Controls.handleEnded();
              }}
            />
          )}

          {viewMode === 'video2' && video2File && (
            <VideoDisplay
              ref={viewport2Ref}
              videoUrl={video2Url}
              videoMeta={video2Meta}
              onLoadedMetadata={handleVideo2Metadata}
              onTimeUpdate={(e) => {
                handleTimeUpdate(e);
                video2Controls.handleTimeUpdate(e);
              }}
              onPlay={() => {
                play();
                video2Controls.handlePlay();
              }}
              onPause={() => {
                pause();
                video2Controls.handlePause();
              }}
              onEnded={() => {
                pause();
                video2Controls.handleEnded();
              }}
            />
          )}

          {viewMode === 'split' && video1File && video2File && (
            <SplitVideoView 
              video1File={video1File}
              video2File={video2File}
              video1Url={video1Url}
              video2Url={video2Url}
              viewport1Ref={viewport1Ref}
              viewport2Ref={viewport2Ref}
              onVideo1StateChange={(state) => setVideo1State(state)}
              onVideo2StateChange={(state) => setVideo2State(state)}
            />
          )}

          {!video1File && !video2File && (
            <div className="flex items-center justify-center h-full text-gray-400">
              Load videos above to begin
            </div>
          )}
      </div>


    </div>
  );
};

export default ComparisonVideoPlayer;
