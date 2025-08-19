import React, { useRef, useCallback, useEffect, useState } from 'react';
import VideoViewport, { type VideoViewportRef } from './player/VideoViewport';
import Controls from './player/Controls';
import SimpleDrawingCanvas from '../annot/SimpleDrawingCanvas';
import AnnotationToolbar from '../annot/AnnotationToolbar';
import VideoHUD from './VideoHUD';
import { useVideoStore, useAnnotationStore, useUIStore, useComparisonStore } from '../../state/store';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { useHotkeys } from '../../lib/useHotkeys';

interface ComparisonVideoPlayerProps {
  className?: string;
}

// Split view component with independent controls
const SplitVideoView: React.FC<{
  video1File: File;
  video2File: File;
  video1Url: string | null;
  video2Url: string | null;
}> = ({ video1File, video2File, video1Url, video2Url }) => {
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

  const viewport1Ref = useRef<VideoViewportRef>(null);
  const viewport2Ref = useRef<VideoViewportRef>(null);

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
    <div className="grid grid-cols-2 gap-4">
      {/* Video 1 */}
      <div className="space-y-2">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div className="absolute top-2 left-2 z-10 bg-black/75 px-2 py-1 rounded text-xs text-white">
            Video 1
          </div>
          <VideoViewport
            ref={viewport1Ref}
            src={video1Url}
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
        </div>
        
        {/* Video 1 Controls */}
        <div className="bg-gray-800 rounded p-2 space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleVideo1PlayPause}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
            >
              {video1State.isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={() => handleVideo1FrameStep(-1)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            >
              [
            </button>
            <button
              onClick={() => handleVideo1FrameStep(1)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            >
              ]
            </button>
            <span className="text-xs text-gray-400">
              {formatTime(video1State.currentTime)} / {formatTime(video1State.duration)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={video1State.duration || 0}
            step={0.01}
            value={video1State.currentTime}
            onChange={(e) => handleVideo1Seek(parseFloat(e.target.value))}
            className="w-full h-1"
          />
        </div>
      </div>

      {/* Video 2 */}
      <div className="space-y-2">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div className="absolute top-2 left-2 z-10 bg-black/75 px-2 py-1 rounded text-xs text-white">
            Video 2
          </div>
          <VideoViewport
            ref={viewport2Ref}
            src={video2Url}
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
        </div>
        
        {/* Video 2 Controls */}
        <div className="bg-gray-800 rounded p-2 space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleVideo2PlayPause}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
            >
              {video2State.isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={() => handleVideo2FrameStep(-1)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            >
              [
            </button>
            <button
              onClick={() => handleVideo2FrameStep(1)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            >
              ]
            </button>
            <span className="text-xs text-gray-400">
              {formatTime(video2State.currentTime)} / {formatTime(video2State.duration)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={video2State.duration || 0}
            step={0.01}
            value={video2State.currentTime}
            onChange={(e) => handleVideo2Seek(parseFloat(e.target.value))}
            className="w-full h-1"
          />
        </div>
      </div>
    </div>
  );
};

const ComparisonVideoPlayer: React.FC<ComparisonVideoPlayerProps> = ({ className = '' }) => {
  const [video1File, setVideo1File] = useState<File | null>(null);
  const [video2File, setVideo2File] = useState<File | null>(null);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
  
  // Track metadata for each video separately
  const [video1Meta, setVideo1Meta] = useState<any>(null);
  const [video2Meta, setVideo2Meta] = useState<any>(null);
  
  const viewport1Ref = useRef<VideoViewportRef>(null);
  const viewport2Ref = useRef<VideoViewportRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const video1Url = useObjectUrl(video1File);
  const video2Url = useObjectUrl(video2File);

  const { viewMode, setViewMode } = useComparisonStore();
  const [showAnnotations, setShowAnnotations] = useState(true);

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

  const { showStats, setShowStats } = useUIStore();

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
    <div className="bg-gray-800 rounded-lg p-2 mb-4">
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
    <div className={`space-y-4 ${className}`}>
      <ViewModeToggle />
      
      <div className="relative bg-black rounded-lg overflow-hidden">
        {showAnnotations && viewMode !== 'split' && <AnnotationToolbar />}

        <div className="absolute top-2 right-2 z-10 flex gap-2">
          {viewMode !== 'split' && (
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              title="Toggle Annotations (A)"
            >
              Annotations: {showAnnotations ? 'ON' : 'OFF'}
            </button>
          )}
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
            title="Toggle HUD (H)"
          >
            HUD: {showStats ? 'ON' : 'OFF'}
          </button>
        </div>

        <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
          {viewMode === 'video1' && video1File && (
            <>
              <VideoViewport
                ref={viewport1Ref}
                src={video1Url}
                onLoadedMetadata={handleVideo1Metadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={play}
                onPause={pause}
                onEnded={pause}
              />
              {showAnnotations && video1Meta && (
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
                onTimeUpdate={handleTimeUpdate}
                onPlay={play}
                onPause={pause}
                onEnded={pause}
              />
              {showAnnotations && video2Meta && (
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
            />
          )}

          {!video1File && !video2File && (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Load videos above to begin
            </div>
          )}

          {showStats && <VideoHUD />}
        </div>
      </div>

      <Controls
        isPlaying={playback.isPlaying}
        currentTime={playback.currentTime}
        duration={metadata?.duration || 0}
        playbackRate={playback.playbackRate}
        frameRate={metadata?.frameRate || 30}
        isReady={!!metadata}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onSeekByFrames={handleSeekByFrames}
        onSeekBySeconds={handleSeekBySeconds}
        onPlaybackRateChange={handlePlaybackRateChange}
      />

      {/* Keyboard shortcuts hint */}
      <div className="text-center text-xs text-gray-500">
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mr-2">1</span> Video 1
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mx-2">2</span> Video 2
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mx-2">3</span> Split View
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mx-2">Space</span> Play/Pause
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mx-2">←/→</span> Frame Step
      </div>
    </div>
  );
};

export default ComparisonVideoPlayer;