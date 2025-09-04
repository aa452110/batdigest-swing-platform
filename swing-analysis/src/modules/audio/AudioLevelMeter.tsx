import React from 'react';

interface AudioLevelMeterProps {
  level: number; // 0-100
  peak: number; // 0-100
  isMuted: boolean;
}

const AudioLevelMeter: React.FC<AudioLevelMeterProps> = ({ level, peak, isMuted }) => {
  // Calculate number of segments to light up
  const totalSegments = 20;
  const activeSegments = Math.round((level / 100) * totalSegments);
  const peakSegment = Math.round((peak / 100) * totalSegments);

  // Generate segments
  const segments = Array.from({ length: totalSegments }, (_, i) => {
    const isActive = i < activeSegments;
    const isPeak = i === peakSegment - 1;
    const segmentIndex = totalSegments - i - 1; // Reverse order for bottom-up

    // Color based on level
    let color = 'bg-gray-700';
    if (isActive || isPeak) {
      if (segmentIndex < 12) {
        color = 'bg-green-500';
      } else if (segmentIndex < 16) {
        color = 'bg-yellow-500';
      } else {
        color = 'bg-red-500';
      }
    }

    if (isPeak && !isActive) {
      color = color.replace('500', '300'); // Dimmer peak indicator
    }

    return (
      <div
        key={i}
        className={`h-1 rounded-sm transition-all duration-75 ${
          isMuted ? 'bg-gray-700' : color
        }`}
      />
    );
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Audio Level</span>
        {isMuted && <span className="text-red-500">MUTED</span>}
      </div>
      <div className="flex flex-col gap-0.5">
        {segments}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>-48dB</span>
        <span>-24dB</span>
        <span>-12dB</span>
        <span>0dB</span>
      </div>
    </div>
  );
};

export default AudioLevelMeter;