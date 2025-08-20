import React from 'react';
import { useComparisonStore } from '../../state/store';

interface VideoControlsSidebarProps {
  video1File: File | null;
  video2File: File | null;
  onVideo1Select: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideo2Select: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playback?: any;
  metadata?: any;
  onPlayPause?: () => void;
  onSeek?: (time: number) => void;
  onSeekByFrames?: (frames: number) => void;
  onPlaybackRateChange?: (rate: number) => void;
  viewMode?: string;
  video1Controls?: any;
  video2Controls?: any;
}

const VideoControlsSidebar: React.FC<VideoControlsSidebarProps> = ({
  video1File,
  video2File,
  onVideo1Select,
  onVideo2Select,
  playback,
  metadata,
  onPlayPause,
  onSeek,
  onSeekByFrames,
  onPlaybackRateChange,
  viewMode,
  video1Controls,
  video2Controls
}) => {
  const { viewMode: storeViewMode, setViewMode } = useComparisonStore();
  const currentViewMode = viewMode || storeViewMode;

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentFrame = (currentTime: number, fps: number = 30): number => {
    return Math.floor(currentTime * fps);
  };

  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-y-auto">
      {/* View Mode Selection */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">View Mode</h3>
        <div className="flex flex-col gap-1">
          {video1File && (
            <button
              onClick={() => setViewMode('video1')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                currentViewMode === 'video1' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Video 1 Only
            </button>
          )}
          {video2File && (
            <button
              onClick={() => setViewMode('video2')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                currentViewMode === 'video2' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Video 2 Only
            </button>
          )}
          {video1File && video2File && (
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                currentViewMode === 'split' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Split View
            </button>
          )}
        </div>
      </div>

      {/* Video 1 Playback Controls */}
      {video1File && (currentViewMode === 'video1' || currentViewMode === 'split') && video1Controls && (
        <div className="bg-gray-800 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Video 1 Controls</h3>
          
          <div className="flex gap-1 mb-2">
            <button
              onClick={video1Controls.onPlayPause}
              className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
            >
              {video1Controls.state?.isPlaying ? '⏸' : '▶'}
            </button>
          </div>
          
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => video1Controls.onFrameStep?.(-1)}
              className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            >
              ← Fr
            </button>
            <button
              onClick={() => video1Controls.onFrameStep?.(1)}
              className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            >
              Fr →
            </button>
          </div>
          
          <div className="text-xs text-gray-400 text-center mb-2">
            {formatTime(video1Controls.state?.currentTime || 0)} / {formatTime(video1Controls.state?.duration || 0)}
          </div>
          
          <input
            type="range"
            min={0}
            max={video1Controls.state?.duration || 0}
            step={0.01}
            value={video1Controls.state?.currentTime || 0}
            onChange={(e) => video1Controls.onSeek?.(parseFloat(e.target.value))}
            className="w-full h-1"
          />
          
          <div className="text-xs text-gray-500 text-center mt-1">
            Frame: {getCurrentFrame(video1Controls.state?.currentTime || 0)}
          </div>
        </div>
      )}

      {/* Video 2 Playback Controls */}
      {video2File && (currentViewMode === 'video2' || currentViewMode === 'split') && video2Controls && (
        <div className="bg-gray-800 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Video 2 Controls</h3>
          
          <div className="flex gap-1 mb-2">
            <button
              onClick={video2Controls.onPlayPause}
              className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
            >
              {video2Controls.state?.isPlaying ? '⏸' : '▶'}
            </button>
          </div>
          
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => video2Controls.onFrameStep?.(-1)}
              className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            >
              ← Fr
            </button>
            <button
              onClick={() => video2Controls.onFrameStep?.(1)}
              className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            >
              Fr →
            </button>
          </div>
          
          <div className="text-xs text-gray-400 text-center mb-2">
            {formatTime(video2Controls.state?.currentTime || 0)} / {formatTime(video2Controls.state?.duration || 0)}
          </div>
          
          <input
            type="range"
            min={0}
            max={video2Controls.state?.duration || 0}
            step={0.01}
            value={video2Controls.state?.currentTime || 0}
            onChange={(e) => video2Controls.onSeek?.(parseFloat(e.target.value))}
            className="w-full h-1"
          />
          
          <div className="text-xs text-gray-500 text-center mt-1">
            Frame: {getCurrentFrame(video2Controls.state?.currentTime || 0)}
          </div>
        </div>
      )}

      {/* Video 1 Load */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Video 1</h3>
        <label className="block">
          <input
            type="file"
            accept="video/*"
            onChange={onVideo1Select}
            className="hidden"
            id="video1-sidebar-input"
          />
          <label
            htmlFor="video1-sidebar-input"
            className={`block w-full px-2 py-1 rounded text-xs cursor-pointer transition-colors text-center ${
              video1File 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {video1File ? '✓ Loaded' : '+ Load Video'}
          </label>
        </label>
        {video1File && (
          <div className="mt-2 text-xs text-gray-400 truncate">
            {video1File.name}
          </div>
        )}
      </div>

      {/* Video 2 Load */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Video 2</h3>
        <label className="block">
          <input
            type="file"
            accept="video/*"
            onChange={onVideo2Select}
            className="hidden"
            id="video2-sidebar-input"
          />
          <label
            htmlFor="video2-sidebar-input"
            className={`block w-full px-2 py-1 rounded text-xs cursor-pointer transition-colors text-center ${
              video2File 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {video2File ? '✓ Loaded' : '+ Load Video'}
          </label>
        </label>
        {video2File && (
          <div className="mt-2 text-xs text-gray-400 truncate">
            {video2File.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoControlsSidebar;