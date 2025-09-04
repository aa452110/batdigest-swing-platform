import React, { useRef, useCallback, useState } from 'react';
import VideoViewport, { type VideoViewportRef } from './player/VideoViewport';
import SimpleDrawingCanvas from '../annot/SimpleDrawingCanvas';
import { useObjectUrl } from '../../hooks/useObjectUrl';

interface SingleVideoProps {
  videoNumber: 1 | 2;
}

const SingleVideo: React.FC<SingleVideoProps> = ({ videoNumber }) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [playback, setPlayback] = useState({
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1,
  });
  const [showAnnotations, setShowAnnotations] = useState(true);
  
  const viewportRef = useRef<VideoViewportRef>(null);
  const videoUrl = useObjectUrl(file);

  // File selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPlayback({
        isPlaying: false,
        currentTime: 0,
        playbackRate: 1,
      });
    }
  };

  // Video event handlers
  const handleLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setMetadata({
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      frameRate: 30,
    });
  }, []);

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setPlayback(prev => ({ ...prev, currentTime: video.currentTime }));
  }, []);

  // Playback controls
  const handlePlayPause = async () => {
    if (!viewportRef.current) return;
    
    if (playback.isPlaying) {
      viewportRef.current.pause();
      setPlayback(prev => ({ ...prev, isPlaying: false }));
    } else {
      await viewportRef.current.play();
      setPlayback(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleSeek = (time: number) => {
    if (!viewportRef.current || !metadata) return;
    const clampedTime = Math.max(0, Math.min(time, metadata.duration));
    viewportRef.current.seekTo(clampedTime);
    setPlayback(prev => ({ ...prev, currentTime: clampedTime }));
  };

  const handleFrameStep = (direction: 1 | -1) => {
    if (!viewportRef.current || !metadata) return;
    const frameDuration = 1 / metadata.frameRate;
    const newTime = playback.currentTime + (frameDuration * direction);
    const clampedTime = Math.max(0, Math.min(newTime, metadata.duration));
    viewportRef.current.seekTo(clampedTime);
    setPlayback(prev => ({ ...prev, currentTime: clampedTime }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* File input */}
      <div className="bg-gray-800 rounded-lg p-2">
        <label className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Video {videoNumber}:</span>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="text-xs text-white file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        </label>
        {file && (
          <div className="text-xs text-gray-500 mt-1 truncate">{file.name}</div>
        )}
      </div>

      {/* Video player */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        {file ? (
          <>
            <VideoViewport
              ref={viewportRef}
              src={videoUrl}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setPlayback(prev => ({ ...prev, isPlaying: true }))}
              onPause={() => setPlayback(prev => ({ ...prev, isPlaying: false }))}
              onEnded={() => setPlayback(prev => ({ ...prev, isPlaying: false }))}
            />
            
            {showAnnotations && metadata && (
              <SimpleDrawingCanvas videoElement={viewportRef.current?.video || null} />
            )}

            {/* Annotations toggle */}
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className="absolute top-2 right-2 z-10 bg-gray-800 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
            >
              {showAnnotations ? '✏️' : '👁'}
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
            Load Video {videoNumber}
          </div>
        )}
      </div>

      {/* Controls */}
      {file && metadata && (
        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
          {/* Play controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              {playback.isPlaying ? '⏸' : '▶'}
            </button>
            
            <button
              onClick={() => handleFrameStep(-1)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              title="Previous frame"
            >
              [
            </button>
            
            <button
              onClick={() => handleFrameStep(1)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              title="Next frame"
            >
              ]
            </button>

            <span className="text-xs text-gray-400 ml-2">
              {formatTime(playback.currentTime)} / {formatTime(metadata.duration)}
            </span>
          </div>

          {/* Seek bar */}
          <input
            type="range"
            min={0}
            max={metadata.duration || 0}
            step={0.01}
            value={playback.currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

interface DualVideoPlayerProps {
  className?: string;
}

const DualVideoPlayer: React.FC<DualVideoPlayerProps> = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      <SingleVideo videoNumber={1} />
      <SingleVideo videoNumber={2} />
    </div>
  );
};

export default DualVideoPlayer;