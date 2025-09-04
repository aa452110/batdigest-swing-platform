import React, { useRef, useCallback, useEffect, useState } from 'react';
import VideoViewport, { type VideoViewportRef } from '../video/player/VideoViewport';
import { useComparisonStore } from '../../state/store';
import { useObjectUrl } from '../../hooks/useObjectUrl';

interface VideoInputProps {
  videoId: 1 | 2;
  file: File | null;
  onFileSelect: (file: File) => void;
}

const VideoInput: React.FC<VideoInputProps> = ({ videoId, file, onFileSelect }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-400">Video {videoId}:</label>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="text-sm text-white file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />
      {file && (
        <span className="text-xs text-gray-500">{file.name}</span>
      )}
    </div>
  );
};

const DualVideoComparison: React.FC = () => {
  const viewport1Ref = useRef<VideoViewportRef>(null);
  const viewport2Ref = useRef<VideoViewportRef>(null);
  
  const {
    video1,
    video2,
    viewMode,
    loadComparisonVideo,
    setComparisonMetadata,
    setComparisonPlayback,
    playComparison,
    pauseComparison,
    seekComparison,
    setViewMode,
    syncVideos,
  } = useComparisonStore();

  const video1Url = useObjectUrl(video1.file);
  const video2Url = useObjectUrl(video2.file);

  // Handle file selection
  const handleFileSelect = (file: File, videoId: 1 | 2) => {
    const url = URL.createObjectURL(file);
    loadComparisonVideo(file, url, videoId);
  };

  // Video 1 event handlers
  const handleVideo1Metadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setComparisonMetadata({
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      frameRate: 30,
      aspectRatio: `${video.videoWidth}:${video.videoHeight}`,
    }, 1);
  }, [setComparisonMetadata]);

  const handleVideo1TimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setComparisonPlayback({ currentTime: video.currentTime }, 1);
  }, [setComparisonPlayback]);

  // Video 2 event handlers
  const handleVideo2Metadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setComparisonMetadata({
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      frameRate: 30,
      aspectRatio: `${video.videoWidth}:${video.videoHeight}`,
    }, 2);
  }, [setComparisonMetadata]);

  const handleVideo2TimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setComparisonPlayback({ currentTime: video.currentTime }, 2);
  }, [setComparisonPlayback]);

  // Playback controls
  const handlePlayPause = (videoId: 1 | 2) => async () => {
    const viewport = videoId === 1 ? viewport1Ref.current : viewport2Ref.current;
    const video = videoId === 1 ? video1 : video2;
    
    if (!viewport) return;

    if (video.playback.isPlaying) {
      viewport.pause();
      pauseComparison(videoId);
    } else {
      await viewport.play();
      playComparison(videoId);
    }
  };

  const handleSeek = (videoId: 1 | 2) => (time: number) => {
    const viewport = videoId === 1 ? viewport1Ref.current : viewport2Ref.current;
    if (!viewport) return;
    
    viewport.seekTo(time);
    seekComparison(time, videoId);
  };

  const handleFrameStep = (videoId: 1 | 2, direction: 1 | -1) => () => {
    const video = videoId === 1 ? video1 : video2;
    const viewport = videoId === 1 ? viewport1Ref.current : viewport2Ref.current;
    
    if (!viewport || !video.metadata) return;
    
    const frameDuration = 1 / video.metadata.frameRate;
    const newTime = video.playback.currentTime + (frameDuration * direction);
    const clampedTime = Math.max(0, Math.min(newTime, video.metadata.duration));
    
    viewport.seekTo(clampedTime);
    seekComparison(clampedTime, videoId);
  };

  // View mode toggle buttons
  const ViewModeToggle = () => (
    <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-2">
      <span className="text-sm text-gray-400">View:</span>
      <button
        onClick={() => setViewMode('video1')}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          viewMode === 'video1' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        Video 1
      </button>
      <button
        onClick={() => setViewMode('video2')}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          viewMode === 'video2' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        disabled={!video2.file}
      >
        Video 2
      </button>
      <button
        onClick={() => setViewMode('split')}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          viewMode === 'split' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        disabled={!video1.file || !video2.file}
      >
        Split View
      </button>
      {viewMode === 'split' && (
        <button
          onClick={syncVideos}
          className="ml-2 px-3 py-1 rounded text-sm bg-green-600 text-white hover:bg-green-700"
          title="Sync both videos to same time"
        >
          Sync
        </button>
      )}
    </div>
  );

  // Mini controls for each video
  const MiniControls: React.FC<{ videoId: 1 | 2 }> = ({ videoId }) => {
    const video = videoId === 1 ? video1 : video2;
    
    if (!video.metadata) return null;

    return (
      <div className="absolute bottom-2 left-2 right-2 bg-black/75 rounded p-2 flex items-center gap-2">
        <button
          onClick={handlePlayPause(videoId)}
          className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
        >
          {video.playback.isPlaying ? '⏸' : '▶'}
        </button>
        
        <button
          onClick={handleFrameStep(videoId, -1)}
          className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
        >
          ←
        </button>
        
        <button
          onClick={handleFrameStep(videoId, 1)}
          className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
        >
          →
        </button>
        
        <input
          type="range"
          min={0}
          max={video.metadata.duration}
          step={0.01}
          value={video.playback.currentTime}
          onChange={(e) => handleSeek(videoId)(parseFloat(e.target.value))}
          className="flex-1 h-1"
        />
        
        <span className="text-xs text-white">
          {formatTime(video.playback.currentTime)} / {formatTime(video.metadata.duration)}
        </span>
      </div>
    );
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* File inputs */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-2">
        <VideoInput videoId={1} file={video1.file} onFileSelect={(f) => handleFileSelect(f, 1)} />
        <VideoInput videoId={2} file={video2.file} onFileSelect={(f) => handleFileSelect(f, 2)} />
      </div>

      {/* View mode toggle */}
      <ViewModeToggle />

      {/* Video display area */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        {viewMode === 'video1' && video1.file && (
          <div className="relative">
            <VideoViewport
              ref={viewport1Ref}
              src={video1Url}
              onLoadedMetadata={handleVideo1Metadata}
              onTimeUpdate={handleVideo1TimeUpdate}
              onPlay={() => playComparison(1)}
              onPause={() => pauseComparison(1)}
            />
            <MiniControls videoId={1} />
          </div>
        )}

        {viewMode === 'video2' && video2.file && (
          <div className="relative">
            <VideoViewport
              ref={viewport2Ref}
              src={video2Url}
              onLoadedMetadata={handleVideo2Metadata}
              onTimeUpdate={handleVideo2TimeUpdate}
              onPlay={() => playComparison(2)}
              onPause={() => pauseComparison(2)}
            />
            <MiniControls videoId={2} />
          </div>
        )}

        {viewMode === 'split' && video1.file && video2.file && (
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <div className="absolute top-2 left-2 z-10 bg-black/75 px-2 py-1 rounded text-xs text-white">
                Video 1
              </div>
              <VideoViewport
                ref={viewport1Ref}
                src={video1Url}
                onLoadedMetadata={handleVideo1Metadata}
                onTimeUpdate={handleVideo1TimeUpdate}
                onPlay={() => playComparison(1)}
                onPause={() => pauseComparison(1)}
              />
              <MiniControls videoId={1} />
            </div>
            
            <div className="relative">
              <div className="absolute top-2 left-2 z-10 bg-black/75 px-2 py-1 rounded text-xs text-white">
                Video 2
              </div>
              <VideoViewport
                ref={viewport2Ref}
                src={video2Url}
                onLoadedMetadata={handleVideo2Metadata}
                onTimeUpdate={handleVideo2TimeUpdate}
                onPlay={() => playComparison(2)}
                onPause={() => pauseComparison(2)}
              />
              <MiniControls videoId={2} />
            </div>
          </div>
        )}

        {!video1.file && !video2.file && (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Load videos above to compare
          </div>
        )}
      </div>
    </div>
  );
};

export default DualVideoComparison;