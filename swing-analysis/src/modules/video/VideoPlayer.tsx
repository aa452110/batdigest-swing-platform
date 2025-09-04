import React, { useRef, useCallback, useEffect, useState } from 'react';
import VideoViewport, { type VideoViewportRef } from './player/VideoViewport';
import Controls from './player/Controls';
import SimpleDrawingCanvas from '../annot/SimpleDrawingCanvas';
import AnnotationToolbar from '../annot/AnnotationToolbar';
import VideoHUD from './VideoHUD';
import { useVideoStore, useAnnotationStore, useUIStore } from '../../state/store';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { useHotkeys } from '../../lib/useHotkeys';

interface VideoPlayerProps {
  file: File | null;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ file, className = '' }) => {
  const viewportRef = useRef<VideoViewportRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 450 });
  const videoUrl = useObjectUrl(file);

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
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Event handlers
  const handleLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      setMetadata({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        frameRate: 30, // Default, could be extracted from metadata
        aspectRatio: `${video.videoWidth}:${video.videoHeight}`,
      });
      
      // Update canvas dimensions
      setCanvasDimensions({
        width: video.videoWidth,
        height: video.videoHeight,
      });
    },
    [setMetadata]
  );

  const handleTimeUpdate = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      setPlaybackState({ currentTime: video.currentTime });
    },
    [setPlaybackState]
  );

  const handlePlayPause = useCallback(async () => {
    if (!viewportRef.current) return;

    if (playback.isPlaying) {
      viewportRef.current.pause();
      pause();
    } else {
      await viewportRef.current.play();
      play();
    }
  }, [playback.isPlaying, play, pause]);

  const handleSeek = useCallback(
    (time: number) => {
      if (!viewportRef.current) return;
      viewportRef.current.seekTo(time);
      seek(time);
    },
    [seek]
  );

  const handleSeekByFrames = useCallback(
    (frames: number) => {
      if (!viewportRef.current || !metadata) return;
      const newTime = playback.currentTime + (frames / metadata.frameRate);
      viewportRef.current.seekTo(newTime);
      seekByFrames(frames);
    },
    [seekByFrames, playback.currentTime, metadata]
  );

  const handleSeekBySeconds = useCallback(
    (seconds: number) => {
      if (!viewportRef.current || !metadata) return;
      const newTime = playback.currentTime + seconds;
      viewportRef.current.seekTo(newTime);
      seekBySeconds(seconds);
    },
    [seekBySeconds, playback.currentTime, metadata]
  );

  const handlePlaybackRateChange = useCallback(
    (rate: number) => {
      if (!viewportRef.current?.video) return;
      viewportRef.current.video.playbackRate = rate;
      setPlaybackRate(rate);
    },
    [setPlaybackRate]
  );

  // Setup hotkeys
  useHotkeys([
    {
      key: ' ',
      handler: () => togglePlayPause(),
      preventDefault: true,
    },
    {
      key: '[',
      handler: () => handleSeekByFrames(-1),
      preventDefault: true,
    },
    {
      key: ']',
      handler: () => handleSeekByFrames(1),
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
      key: 'h',
      handler: () => setShowStats(!showStats),
      preventDefault: true,
    },
    {
      key: 'z',
      ctrl: true,
      handler: () => undo(),
      preventDefault: true,
    },
    {
      key: 'y',
      ctrl: true,
      handler: () => redo(),
      preventDefault: true,
    },
    {
      key: 'a',
      handler: () => setShowAnnotations(!showAnnotations),
      preventDefault: true,
    },
    {
      key: 'Delete',
      handler: () => {
        if (selectedAnnotationId) {
          deleteAnnotation(selectedAnnotationId);
        }
      },
      preventDefault: true,
    },
  ]);

  // Sync video element with store state
  useEffect(() => {
    if (!viewportRef.current?.video) return;
    const video = viewportRef.current.video;

    // Sync playback rate
    if (video.playbackRate !== playback.playbackRate) {
      video.playbackRate = playback.playbackRate;
    }
  }, [playback.playbackRate]);

  const visibleAnnotations = getAnnotationsAtTime(playback.currentTime);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative bg-black rounded-lg overflow-hidden">
        {showAnnotations && <AnnotationToolbar />}

        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
            title="Toggle Annotations (A)"
          >
            Annotations: {showAnnotations ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
            title="Toggle HUD (H)"
          >
            HUD: {showStats ? 'ON' : 'OFF'}
          </button>
        </div>

        <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
          <VideoViewport
            ref={viewportRef}
            src={videoUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={play}
            onPause={pause}
            onEnded={pause}
          />

          {showAnnotations && metadata && (
            <SimpleDrawingCanvas videoElement={viewportRef.current?.video || null} />
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
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mr-2">Space</span> Play/Pause
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mx-2">[ / ←</span> Prev Frame
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mx-2">] / →</span> Next Frame
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mx-2">H</span> Toggle HUD
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mx-2">A</span> Toggle Annotations
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mx-2">Ctrl+Z</span> Undo
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mx-2">Ctrl+Y</span> Redo
        <span className="inline-block px-2 py-1 bg-gray-800 rounded mx-2">Delete</span> Delete Selected
      </div>
    </div>
  );
};

export default VideoPlayer;
