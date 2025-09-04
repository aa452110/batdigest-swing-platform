import React from 'react';

type Props = {
  hasAppliedCrop: boolean;
  micStatus: 'idle' | 'active' | 'denied' | 'error';
  showMicTest: boolean;
  audioLevel: number;
  onTestMic: () => void;
  onStart: () => void;
  onResetArea: () => void;
};

const PreRecordActions: React.FC<Props> = ({ hasAppliedCrop, micStatus, showMicTest, audioLevel, onTestMic, onStart, onResetArea }) => {
  return (
    <>
      {hasAppliedCrop && (
        <>
          <div className="bg-gray-700 rounded p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Microphone Status</span>
              {micStatus === 'idle' && (
                <button onClick={onTestMic} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded">Test Mic</button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg ${micStatus === 'active' ? 'animate-pulse' : ''}`}>
                {micStatus === 'active' ? '🎤' : micStatus === 'denied' ? '🚫' : micStatus === 'error' ? '⚠️' : '🎤'}
              </span>
              {(showMicTest || micStatus === 'active') && (
                <div className="flex-1 flex items-center gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-sm transition-all ${audioLevel > i * 10 ? (audioLevel > 70 ? 'bg-red-500' : audioLevel > 40 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-600'}`} />
                  ))}
                </div>
              )}
              {micStatus === 'denied' && <span className="text-xs text-red-400">Permission denied</span>}
              {micStatus === 'error' && <span className="text-xs text-yellow-400">Error detected</span>}
              {showMicTest && <span className="text-xs text-green-400">Speak now...</span>}
            </div>
          </div>
          <button onClick={onStart} className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            Start Recording
          </button>
        </>
      )}
      <button onClick={onResetArea} className="w-full px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-sm">Reset Record Area</button>
    </>
  );
};

export default PreRecordActions;

