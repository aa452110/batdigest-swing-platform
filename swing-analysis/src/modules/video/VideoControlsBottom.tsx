import React from 'react';

interface VideoControlsBottomProps {
  video1File: File | null;
  video2File: File | null;
  video1Controls: any;
  video2Controls: any;
  viewMode: string;
}

const VideoControlsBottom: React.FC<VideoControlsBottomProps> = ({
  video1File,
  video2File,
  video1Controls,
  video2Controls,
  viewMode
}) => {
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentFrame = (currentTime: number, fps: number = 30): number => {
    return Math.floor(currentTime * fps);
  };

  const showVideo1Controls = video1File && (viewMode === 'video1' || viewMode === 'split');
  const showVideo2Controls = video2File && (viewMode === 'video2' || viewMode === 'split');

  return (
    <div className="flex flex-col gap-2 bg-gray-900 p-3 border-t border-gray-700">
      {/* Video 1 Controls */}
      {video1File && (
        <div className={`flex items-center gap-3 ${!showVideo1Controls ? 'opacity-50' : ''}`}>
          <div className="text-xs text-gray-400 w-16">Video 1</div>
          
          <button
            onClick={video1Controls?.onPlayPause}
            disabled={!showVideo1Controls}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm"
            title="Play/Pause (Space)"
          >
            {video1Controls?.state?.isPlaying ? '⏸' : '▶'}
          </button>
          
          <button
            onClick={() => video1Controls?.onFrameStep?.(-1)}
            disabled={!showVideo1Controls}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded text-xs"
            title="Previous Frame (Left Arrow)"
          >
            ← Fr
          </button>
          
          <button
            onClick={() => video1Controls?.onFrameStep?.(1)}
            disabled={!showVideo1Controls}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded text-xs"
            title="Next Frame (Right Arrow)"
          >
            Fr →
          </button>
          
          <div className="text-xs text-gray-400">
            {formatTime(video1Controls?.state?.currentTime || 0)} / {formatTime(video1Controls?.state?.duration || 0)}
          </div>
          
          <input
            type="range"
            min={0}
            max={video1Controls?.state?.duration || 0}
            step={0.01}
            value={video1Controls?.state?.currentTime || 0}
            onChange={(e) => video1Controls?.onSeek?.(parseFloat(e.target.value))}
            disabled={!showVideo1Controls}
            className="flex-1 h-2"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((video1Controls?.state?.currentTime || 0) / (video1Controls?.state?.duration || 1)) * 100}%, #4b5563 ${((video1Controls?.state?.currentTime || 0) / (video1Controls?.state?.duration || 1)) * 100}%, #4b5563 100%)`
            }}
          />
          
          <div className="text-xs text-gray-500">
            Frame {getCurrentFrame(video1Controls?.state?.currentTime || 0)}
          </div>
        </div>
      )}

      {/* Video 2 Controls - Always visible but grayed out when not loaded */}
      <div className={`flex items-center gap-3 ${!video2File ? 'opacity-30' : !showVideo2Controls ? 'opacity-50' : ''}`}>
        <div className="text-xs text-gray-400 w-16">Video 2</div>
        
        <button
          onClick={video2Controls?.onPlayPause}
          disabled={!showVideo2Controls}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm"
          title="Play/Pause (Space)"
        >
          {video2Controls?.state?.isPlaying ? '⏸' : '▶'}
        </button>
        
        <button
          onClick={() => video2Controls?.onFrameStep?.(-1)}
          disabled={!showVideo2Controls}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded text-xs"
          title="Previous Frame (Left Arrow)"
        >
          ← Fr
        </button>
        
        <button
          onClick={() => video2Controls?.onFrameStep?.(1)}
          disabled={!showVideo2Controls}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded text-xs"
          title="Next Frame (Right Arrow)"
        >
          Fr →
        </button>
        
        <div className="text-xs text-gray-400">
          {video2File ? `${formatTime(video2Controls?.state?.currentTime || 0)} / ${formatTime(video2Controls?.state?.duration || 0)}` : '0:00 / 0:00'}
        </div>
        
        <input
          type="range"
          min={0}
          max={video2Controls?.state?.duration || 0}
          step={0.01}
          value={video2Controls?.state?.currentTime || 0}
          onChange={(e) => video2Controls?.onSeek?.(parseFloat(e.target.value))}
          disabled={!showVideo2Controls}
          className="flex-1 h-2"
          style={{
            background: video2File ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((video2Controls?.state?.currentTime || 0) / (video2Controls?.state?.duration || 1)) * 100}%, #4b5563 ${((video2Controls?.state?.currentTime || 0) / (video2Controls?.state?.duration || 1)) * 100}%, #4b5563 100%)` : '#4b5563'
          }}
        />
        
        <div className="text-xs text-gray-500">
          {video2File ? `Frame ${getCurrentFrame(video2Controls?.state?.currentTime || 0)}` : 'Frame 0'}
        </div>
      </div>
    </div>
  );
};

export default VideoControlsBottom;