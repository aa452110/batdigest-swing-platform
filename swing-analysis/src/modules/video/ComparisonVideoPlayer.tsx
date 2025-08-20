import React, { useRef, useCallback, useEffect, useState } from 'react';
import VideoViewport, { type VideoViewportRef } from './player/VideoViewport';
import Controls from './player/Controls';
import SimpleDrawingCanvas from '../annot/SimpleDrawingCanvas';
import SeparateDrawingCanvas from '../annot/SeparateDrawingCanvas';
import AnnotationToolbar from '../annot/AnnotationToolbar';
import { useVideoStore, useAnnotationStore, useUIStore, useComparisonStore } from '../../state/store';
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

// Split view component with independent controls
const SplitVideoView: React.FC<{
  video1File: File;
  video2File: File;
  video1Url: string | null;
  video2Url: string | null;
  viewport1Ref: React.RefObject<VideoViewportRef>;
  viewport2Ref: React.RefObject<VideoViewportRef>;
  onVideo1StateChange: (state: any) => void;
  onVideo2StateChange: (state: any) => void;
}> = ({ video1File, video2File, video1Url, video2Url, viewport1Ref, viewport2Ref, onVideo1StateChange, onVideo2StateChange }) => {
  // Independent states for each video
  const [video1State, setVideo1State] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });
  const [video2State, setVideo2State] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  // Use passed refs instead of local ones
  
  // Notify parent of state changes
  useEffect(() => {
    onVideo1StateChange(video1State);
  }, [video1State, onVideo1StateChange]);
  
  useEffect(() => {
    onVideo2StateChange(video2State);
  }, [video2State, onVideo2StateChange]);

  // Video 1 controls
  const handleVideo1PlayPause = async () => {
    if (!viewport1Ref.current) return;
    if (video1State.isPlaying) {
      viewport1Ref.current.pause();
      setVideo1State(prev => ({ ...prev, isPlaying: false }));
    } else {
      await viewport1Ref.current.play();
      setVideo1State(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleVideo1FrameStep = (direction: 1 | -1) => {
    if (!viewport1Ref.current) return;
    const newTime = video1State.currentTime + (direction / 30); // Assuming 30fps
    viewport1Ref.current.seekTo(newTime);
  };

  const handleVideo1Seek = (time: number) => {
    if (!viewport1Ref.current) return;
    viewport1Ref.current.seekTo(time);
    setVideo1State(prev => ({ ...prev, currentTime: time }));
  };

  // Video 2 controls
  const handleVideo2PlayPause = async () => {
    if (!viewport2Ref.current) return;
    if (video2State.isPlaying) {
      viewport2Ref.current.pause();
      setVideo2State(prev => ({ ...prev, isPlaying: false }));
    } else {
      await viewport2Ref.current.play();
      setVideo2State(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleVideo2FrameStep = (direction: 1 | -1) => {
    if (!viewport2Ref.current) return;
    const newTime = video2State.currentTime + (direction / 30); // Assuming 30fps
    viewport2Ref.current.seekTo(newTime);
  };

  const handleVideo2Seek = (time: number) => {
    if (!viewport2Ref.current) return;
    viewport2Ref.current.seekTo(time);
    setVideo2State(prev => ({ ...prev, currentTime: time }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div style={{ 
        width: '1280px', 
        height: '720px',
        minWidth: '1280px',
        maxWidth: '1280px',
        minHeight: '720px',
        maxHeight: '720px',
        position: 'relative'
      }} className="bg-black rounded-lg flex gap-2 p-2" data-video-container="true">
        {/* Video 1 */}
        <div 
          className="flex-1 relative bg-gray-900 rounded overflow-hidden flex items-center justify-center"
          onClick={() => viewport1Ref.current?.container?.focus()}
        >
          <div className="absolute top-2 left-2 z-10 bg-black/75 px-2 py-1 rounded text-xs text-white">
            Video 1
          </div>
          <VideoViewport
            ref={viewport1Ref}
            src={video1Url}
            className="w-full h-full"
            splitView={true}
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              setVideo1State(prev => ({ ...prev, duration: video.duration }));
            }}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              setVideo1State(prev => ({ ...prev, currentTime: video.currentTime }));
            }}
            onPlay={() => setVideo1State(prev => ({ ...prev, isPlaying: true }))}
            onPause={() => setVideo1State(prev => ({ ...prev, isPlaying: false }))}
            onEnded={() => setVideo1State(prev => ({ ...prev, isPlaying: false }))}
          />
          {/* Temporarily disable annotations in split view until we fix them */}
        </div>

        {/* Video 2 */}
        <div 
          className="flex-1 relative bg-gray-900 rounded overflow-hidden flex items-center justify-center"
          onClick={() => viewport2Ref.current?.container?.focus()}
        >
          <div className="absolute top-2 left-2 z-10 bg-black/75 px-2 py-1 rounded text-xs text-white">
            Video 2
          </div>
          <VideoViewport
            ref={viewport2Ref}
            src={video2Url}
            className="w-full h-full"
            splitView={true}
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              setVideo2State(prev => ({ ...prev, duration: video.duration }));
            }}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              setVideo2State(prev => ({ ...prev, currentTime: video.currentTime }));
            }}
            onPlay={() => setVideo2State(prev => ({ ...prev, isPlaying: true }))}
            onPause={() => setVideo2State(prev => ({ ...prev, isPlaying: false }))}
            onEnded={() => setVideo2State(prev => ({ ...prev, isPlaying: false }))}
          />
          {/* Temporarily disable annotations in split view until we fix them */}
        </div>
        
        {/* Single annotation canvas over entire split view */}
        <SimpleDrawingCanvas videoElement={viewport1Ref.current?.video || viewport2Ref.current?.video || null} />
      </div>
      
      {/* Controls BELOW the video container */}
      <div className="flex gap-2 mt-2" style={{ width: '1280px' }}>
        {/* Video 1 Controls */}
        <div className="flex-1 bg-gray-800 rounded p-1">
          <div className="flex items-center gap-1">
            <button
              onClick={handleVideo1PlayPause}
              className="px-1 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
            >
              {video1State.isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={() => handleVideo1FrameStep(-1)}
              className="px-1 py-0.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            >
              [
            </button>
            <button
              onClick={() => handleVideo1FrameStep(1)}
              className="px-1 py-0.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            >
              ]
            </button>
            <span className="text-xs text-gray-400">
              {formatTime(video1State.currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={video1State.duration || 0}
              step={0.01}
              value={video1State.currentTime}
              onChange={(e) => handleVideo1Seek(parseFloat(e.target.value))}
              className="flex-1 h-1"
            />
          </div>
        </div>

        {/* Video 2 Controls */}
        <div className="flex-1 bg-gray-800 rounded p-1">
          <div className="flex items-center gap-1">
            <button
              onClick={handleVideo2PlayPause}
              className="px-1 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
            >
              {video2State.isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={() => handleVideo2FrameStep(-1)}
              className="px-1 py-0.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            >
              [
            </button>
            <button
              onClick={() => handleVideo2FrameStep(1)}
              className="px-1 py-0.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            >
              ]
            </button>
            <span className="text-xs text-gray-400">
              {formatTime(video2State.currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={video2State.duration || 0}
              step={0.01}
              value={video2State.currentTime}
              onChange={(e) => handleVideo2Seek(parseFloat(e.target.value))}
              className="flex-1 h-1"
            />
          </div>
        </div>
      </div>
    </>
  );
};

const ComparisonVideoPlayer: React.FC<ComparisonVideoPlayerProps> = ({ className = '', onVideo1Change, onVideo2Change, onStateChange }) => {
  const [video1File, setVideo1File] = useState<File | null>(null);
  const [video2File, setVideo2File] = useState<File | null>(null);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
  
  // Track metadata for each video separately
  const [video1Meta, setVideo1Meta] = useState<any>(null);
  const [video2Meta, setVideo2Meta] = useState<any>(null);
  
  // Track state for split view controls
  const [video1State, setVideo1State] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });
  const [video2State, setVideo2State] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });
  
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

  // Individual video controls for split view
  const handleVideo1PlayPause = async () => {
    if (!viewport1Ref.current) return;
    if (video1State.isPlaying) {
      viewport1Ref.current.pause();
      setVideo1State(prev => ({ ...prev, isPlaying: false }));
    } else {
      await viewport1Ref.current.play();
      setVideo1State(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleVideo1Seek = (time: number) => {
    if (!viewport1Ref.current) return;
    viewport1Ref.current.seekTo(time);
    setVideo1State(prev => ({ ...prev, currentTime: time }));
  };

  const handleVideo1FrameStep = (frames: number) => {
    if (!viewport1Ref.current || !video1Meta) return;
    const frameRate = video1Meta.frameRate || 30;
    const newTime = video1State.currentTime + (frames / frameRate);
    handleVideo1Seek(Math.max(0, Math.min(newTime, video1State.duration)));
  };

  const handleVideo2PlayPause = async () => {
    if (!viewport2Ref.current) return;
    if (video2State.isPlaying) {
      viewport2Ref.current.pause();
      setVideo2State(prev => ({ ...prev, isPlaying: false }));
    } else {
      await viewport2Ref.current.play();
      setVideo2State(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleVideo2Seek = (time: number) => {
    if (!viewport2Ref.current) return;
    viewport2Ref.current.seekTo(time);
    setVideo2State(prev => ({ ...prev, currentTime: time }));
  };

  const handleVideo2FrameStep = (frames: number) => {
    if (!viewport2Ref.current || !video2Meta) return;
    const frameRate = video2Meta.frameRate || 30;
    const newTime = video2State.currentTime + (frames / frameRate);
    handleVideo2Seek(Math.max(0, Math.min(newTime, video2State.duration)));
  };

  // Event handlers
  const handleVideo1Metadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      const meta = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        frameRate: 30,
        aspectRatio: `${video.videoWidth}:${video.videoHeight}`,
      };
      setVideo1Meta(meta);
      setVideo1State(prev => ({ ...prev, duration: video.duration }));
      if (activeVideo === 1 || viewMode === 'video1') {
        setMetadata(meta);
      }
    },
    [setMetadata, activeVideo, viewMode]
  );

  const handleVideo2Metadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      const meta = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        frameRate: 30,
        aspectRatio: `${video.videoWidth}:${video.videoHeight}`,
      };
      setVideo2Meta(meta);
      setVideo2State(prev => ({ ...prev, duration: video.duration }));
      if (activeVideo === 2 || viewMode === 'video2') {
        setMetadata(meta);
      }
    },
    [setMetadata, activeVideo, viewMode]
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

  // View mode controls
  const ViewModeToggle = () => (
    <div className="bg-gray-800 rounded-lg p-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-400">Videos:</span>
        <label className="flex items-center gap-2">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideo1Select}
            className="hidden"
            id="video1-input"
          />
          <label
            htmlFor="video1-input"
            className={`px-3 py-1 rounded text-sm cursor-pointer transition-colors ${
              video1File 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Video 1 {video1File ? '✓' : '+'}
          </label>
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideo2Select}
            className="hidden"
            id="video2-input"
          />
          <label
            htmlFor="video2-input"
            className={`px-3 py-1 rounded text-sm cursor-pointer transition-colors ${
              video2File 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Video 2 {video2File ? '✓' : '+'}
          </label>
        </label>
      </div>

      {(video1File || video2File) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">View:</span>
          {video1File && (
            <button
              onClick={() => {
                setViewMode('video1');
                setActiveVideo(1);
                if (video1Meta) setMetadata(video1Meta);
              }}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'video1' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Video 1
            </button>
          )}
          {video2File && (
            <button
              onClick={() => {
                setViewMode('video2');
                setActiveVideo(2);
                if (video2Meta) setMetadata(video2Meta);
              }}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'video2' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Video 2
            </button>
          )}
          {video1File && video2File && (
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'split' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Split View
            </button>
          )}
        </div>
      )}
    </div>
  );

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

  return (
    <div className={className}>
      <div ref={containerRef} style={{ 
        width: '1280px', 
        height: '720px',
        minWidth: '1280px',
        maxWidth: '1280px', 
        minHeight: '720px',
        maxHeight: '720px',
        flexShrink: 0
      }} className="relative bg-black rounded-lg overflow-hidden">
          {viewMode === 'video1' && video1File && (
            <>
              <VideoViewport
                ref={viewport1Ref}
                src={video1Url}
                onLoadedMetadata={handleVideo1Metadata}
                onTimeUpdate={(e) => {
                  handleTimeUpdate(e);
                  if (e && e.currentTarget) {
                    const currentTime = e.currentTarget.currentTime;
                    setVideo1State(prev => ({
                      isPlaying: prev?.isPlaying ?? false,
                      currentTime: currentTime,
                      duration: prev?.duration ?? 0
                    }));
                  }
                }}
                onPlay={() => {
                  play();
                  setVideo1State(prev => ({ 
                    isPlaying: true,
                    currentTime: prev?.currentTime ?? 0,
                    duration: prev?.duration ?? 0
                  }));
                }}
                onPause={() => {
                  pause();
                  setVideo1State(prev => ({ 
                    isPlaying: false,
                    currentTime: prev?.currentTime ?? 0,
                    duration: prev?.duration ?? 0
                  }));
                }}
                onEnded={() => {
                  pause();
                  setVideo1State(prev => ({ 
                    isPlaying: false,
                    currentTime: prev?.currentTime ?? 0,
                    duration: prev?.duration ?? 0
                  }));
                }}
              />
              {video1Meta && (
                <SimpleDrawingCanvas videoElement={viewport1Ref.current?.video || null} />
              )}
            </>
          )}

          {viewMode === 'video2' && video2File && (
            <>
              <VideoViewport
                ref={viewport2Ref}
                src={video2Url}
                onLoadedMetadata={handleVideo2Metadata}
                onTimeUpdate={(e) => {
                  handleTimeUpdate(e);
                  if (e && e.currentTarget) {
                    const currentTime = e.currentTarget.currentTime;
                    setVideo2State(prev => ({
                      isPlaying: prev?.isPlaying ?? false,
                      currentTime: currentTime,
                      duration: prev?.duration ?? 0
                    }));
                  }
                }}
                onPlay={() => {
                  play();
                  setVideo2State(prev => ({ 
                    isPlaying: true,
                    currentTime: prev?.currentTime ?? 0,
                    duration: prev?.duration ?? 0
                  }));
                }}
                onPause={() => {
                  pause();
                  setVideo2State(prev => ({ 
                    isPlaying: false,
                    currentTime: prev?.currentTime ?? 0,
                    duration: prev?.duration ?? 0
                  }));
                }}
                onEnded={() => {
                  pause();
                  setVideo2State(prev => ({ 
                    isPlaying: false,
                    currentTime: prev?.currentTime ?? 0,
                    duration: prev?.duration ?? 0
                  }));
                }}
              />
              {video2Meta && (
                <SimpleDrawingCanvas videoElement={viewport2Ref.current?.video || null} />
              )}
            </>
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