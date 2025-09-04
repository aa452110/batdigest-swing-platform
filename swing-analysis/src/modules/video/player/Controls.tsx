import React from 'react';
import { formatTime } from '../../../lib/time';
import { getFrameDuration } from '../../../lib/video';

interface ControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  frameRate: number;
  isReady: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSeekByFrames: (frames: number) => void;
  onSeekBySeconds: (seconds: number) => void;
  onPlaybackRateChange: (rate: number) => void;
}

const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  frameRate,
  isReady,
  onPlayPause,
  onSeek,
  onSeekByFrames,
  onSeekBySeconds,
  onPlaybackRateChange,
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPlaybackRateChange(parseFloat(e.target.value));
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gray-900 rounded p-2">
      {/* Compact single row controls */}
      <div className="flex items-center gap-2">
        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          disabled={!isReady}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        {/* Frame controls */}
        <button
          onClick={() => onSeekByFrames(-1)}
          className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
          disabled={!isReady}
        >
          ◀
        </button>
        <button
          onClick={() => onSeekByFrames(1)}
          className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
          disabled={!isReady}
        >
          ▶
        </button>
        
        {/* Time display */}
        <span className="text-xs text-gray-400 mx-1">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        
        {/* Slider */}
        <input
          type="range"
          min="0"
          max={duration}
          step={getFrameDuration(frameRate)}
          value={currentTime}
          onChange={handleSliderChange}
          className="flex-1 h-1 appearance-none slider"
          disabled={!isReady}
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%)`,
          }}
        />
        
        {/* Speed control */}
        <select
          value={playbackRate}
          onChange={handleSpeedChange}
          className="px-1 py-0.5 bg-gray-700 text-xs rounded"
          disabled={!isReady}
        >
          <option value="0.25">0.25x</option>
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="2">2x</option>
        </select>
      </div>
    </div>
  );
};

export default Controls;