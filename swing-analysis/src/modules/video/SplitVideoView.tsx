import React, { useState, useEffect } from 'react';
import VideoViewport, { type VideoViewportRef } from './player/VideoViewport';
import SimpleDrawingCanvas from '../annot/SimpleDrawingCanvas';

interface SplitVideoViewProps {
  video1File: File;
  video2File: File;
  video1Url: string | null;
  video2Url: string | null;
  viewport1Ref: React.RefObject<VideoViewportRef>;
  viewport2Ref: React.RefObject<VideoViewportRef>;
  onVideo1StateChange: (state: any) => void;
  onVideo2StateChange: (state: any) => void;
  onSetActiveVideo?: (videoId: 1 | 2) => void;
}

const SplitVideoView: React.FC<SplitVideoViewProps> = ({ 
  video1File, 
  video2File, 
  video1Url, 
  video2Url, 
  viewport1Ref, 
  viewport2Ref, 
  onVideo1StateChange, 
  onVideo2StateChange,
  onSetActiveVideo,
}) => {
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
    const newTime = Math.max(0, video1State.currentTime + (direction / 30)); // Assuming 30fps
    viewport1Ref.current.seekTo(newTime);
    // Update state immediately so UI reflects the change when paused
    setVideo1State(prev => ({ ...prev, currentTime: newTime }));
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
    const newTime = Math.max(0, video2State.currentTime + (direction / 30)); // Assuming 30fps
    viewport2Ref.current.seekTo(newTime);
    // Update state immediately so UI reflects the change when paused
    setVideo2State(prev => ({ ...prev, currentTime: newTime }));
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
      <div
        style={{
          // Inherit size from parent container (ComparisonVideoPlayer)
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
        className="bg-black rounded-lg flex gap-2 p-2"
        data-video-container="true"
      >
        {/* Video 1 */}
        <div 
          className="flex-1 relative bg-gray-900 rounded overflow-hidden flex items-center justify-center"
          onClick={(e) => {
            // Only focus if the canvas isn't handling the event
            if ((e.target as HTMLElement).tagName !== 'CANVAS') {
              viewport1Ref.current?.container?.focus();
            }
            onSetActiveVideo && onSetActiveVideo(1);
          }}
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
        </div>

        {/* Video 2 */}
        <div 
          className="flex-1 relative bg-gray-900 rounded overflow-hidden flex items-center justify-center"
          onClick={(e) => {
            // Only focus if the canvas isn't handling the event
            if ((e.target as HTMLElement).tagName !== 'CANVAS') {
              viewport2Ref.current?.container?.focus();
            }
            onSetActiveVideo && onSetActiveVideo(2);
          }}
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
        </div>
        
        {/* Single annotation canvas over entire split view */}
        <SimpleDrawingCanvas videoElement={viewport1Ref.current?.video || viewport2Ref.current?.video || null} />
      </div>
      
      {/* Controls BELOW the video container */}
      <div className="flex gap-2 mt-2" style={{ width: '100%' }}>
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

export default SplitVideoView;
