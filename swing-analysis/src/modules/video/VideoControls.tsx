import React from 'react';
import { useVideoStore } from '../../state/store';

interface VideoControlsProps {
  isReady?: boolean;
}

const VideoControls: React.FC<VideoControlsProps> = ({ isReady = false }) => {
  const {
    playback,
    metadata,
    togglePlayPause,
    seek,
    seekByFrames,
    seekBySeconds,
    setPlaybackRate,
  } = useVideoStore();

  const { isPlaying, currentTime, playbackRate } = playback;
  const duration = metadata?.duration || 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaybackRate(parseFloat(e.target.value));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      {/* Time Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={duration}
          step="0.01"
          value={currentTime}
          onChange={handleSliderChange}
          className={`w-full h-2 bg-gray-700 rounded-lg appearance-none slider ${isReady ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!isReady}
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              (currentTime / duration) * 100
            }%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`,
          }}
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2">
        {/* Previous Frame */}
        <button
          onClick={() => seekByFrames(-1)}
          className={`p-2 rounded transition-colors ${isReady ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 opacity-50 cursor-not-allowed'}`}
          title="Previous Frame ([)"
          disabled={!isReady}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832L3 10l5.445 4.832z" />
            <rect x="11" y="5" width="2" height="10" />
          </svg>
        </button>

        {/* Back 0.25s */}
        <button
          onClick={() => seekBySeconds(-0.25)}
          className={`p-2 rounded transition-colors ${isReady ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 opacity-50 cursor-not-allowed'}`}
          title="Back 0.25s (←)"
          disabled={!isReady}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832L3 10l5.445 4.832z" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => togglePlayPause()}
          className={`p-3 rounded-lg transition-colors ${isReady ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 opacity-50 cursor-not-allowed'}`}
          title="Play/Pause (Space)"
          disabled={!isReady}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3l11 7-11 7V3z" />
            </svg>
          )}
        </button>

        {/* Forward 0.25s */}
        <button
          onClick={() => seekBySeconds(0.25)}
          className={`p-2 rounded transition-colors ${isReady ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 opacity-50 cursor-not-allowed'}`}
          title="Forward 0.25s (→)"
          disabled={!isReady}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832L17 10l-5.445-4.832z" />
          </svg>
        </button>

        {/* Next Frame */}
        <button
          onClick={() => seekByFrames(1)}
          className={`p-2 rounded transition-colors ${isReady ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 opacity-50 cursor-not-allowed'}`}
          title="Next Frame (])"
          disabled={!isReady}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832L17 10l-5.445-4.832z" />
            <rect x="7" y="5" width="2" height="10" />
          </svg>
        </button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center justify-center gap-2">
        <label className="text-sm text-gray-400">Speed:</label>
        <select
          value={playbackRate}
          onChange={handleSpeedChange}
          className={`text-white px-3 py-1 rounded text-sm ${isReady ? 'bg-gray-700' : 'bg-gray-800 opacity-50 cursor-not-allowed'}`}
          disabled={!isReady}
        >
          <option value="0.25">0.25×</option>
          <option value="0.5">0.5×</option>
          <option value="1">1×</option>
        </select>
      </div>
    </div>
  );
};

export default VideoControls;
