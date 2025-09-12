import React from 'react';

type Props = {
  isPaused: boolean;
  recordingDuration: number; // seconds
  recordingWarning: string;
  micStatus: 'idle' | 'active' | 'denied' | 'error';
  audioLevel: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  // Show correct cap on the UI (defaults to 5 minutes if not provided)
  maxDurationSec?: number;
};

const RecordingControls: React.FC<Props> = ({
  isPaused,
  recordingDuration,
  recordingWarning,
  micStatus,
  audioLevel,
  onPause,
  onResume,
  onStop,
  maxDurationSec = 300,
}) => {
  const capMin = Math.floor(maxDurationSec / 60);
  const capSec = (maxDurationSec % 60).toString().padStart(2, '0');
  const pct = Math.min((recordingDuration / maxDurationSec) * 100, 100);
  const warn30 = Math.max(0, maxDurationSec - 30);
  const warn60 = Math.max(0, maxDurationSec - 60);
  const isRed = recordingDuration >= warn30;
  const isYellow = !isRed && recordingDuration >= warn60;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'} rounded-full`} />
          <span className="text-sm text-white">
            {isPaused ? 'Paused' : 'Recording'}: {Math.floor(recordingDuration / 60)}:
            {(recordingDuration % 60).toString().padStart(2, '0')} / {capMin}:{capSec}
          </span>
        </div>
      </div>

      {/* Live mic indicator during recording */}
      {micStatus === 'active' && !isPaused && (
        <div className="flex items-center gap-2 bg-gray-700 rounded px-2 py-1">
          <span className="text-xs">🎤</span>
          <div className="flex-1 flex items-center gap-0.5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-sm transition-all ${
                  audioLevel > i * 12.5 ? 'bg-green-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {micStatus === 'denied' && (
        <div className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
          ⚠️ Recording without audio - mic permission denied
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${isRed ? 'bg-red-500' : isYellow ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Warning message */}
      {recordingWarning && (
        <div
          className={`text-xs text-center font-semibold ${isRed ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}
        >
          {recordingWarning}
        </div>
      )}

      <div className="flex gap-2">
        {!isPaused ? (
          <button
            onClick={onPause}
            className="flex-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors text-sm"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={onResume}
            className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm"
          >
            Resume
          </button>
        )}

        <button
          onClick={onStop}
          className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
        >
          Stop
        </button>
      </div>

      {isPaused && (
        <div className="text-xs text-yellow-400 text-center">
          Recording paused - load videos, make changes, then resume
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
