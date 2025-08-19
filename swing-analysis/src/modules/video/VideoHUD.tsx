import React from 'react';
import { useVideoStore } from '../../state/store';
import { formatTimecode, secondsToTimecode } from '../../lib/time';

const VideoHUD: React.FC = () => {
  const { playback, metadata } = useVideoStore();
  const { currentTime, playbackRate } = playback;
  const duration = metadata?.duration || 0;
  const frameRate = metadata?.frameRate || 30;

  const formatTimecodeDisplay = (seconds: number): string => {
    const timecode = secondsToTimecode(seconds, frameRate);
    return formatTimecode(timecode);
  };

  const currentFrame = Math.floor(currentTime * frameRate);
  const totalFrames = Math.floor(duration * frameRate);

  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white rounded-lg p-3 font-mono text-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Time:</span>
          <span className="text-xl font-bold">{formatTimecodeDisplay(currentTime)}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Frame:</span>
          <span>
            {currentFrame} / {totalFrames}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Speed:</span>
          <span>{playbackRate}×</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">FPS:</span>
          <span>{frameRate.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoHUD;
