import React from 'react';

type Props = {
  micStatus: 'idle' | 'active' | 'denied' | 'error';
  showMicTest: boolean;
  audioLevel: number; // 0..100
  onTestClick: () => void;
};

const MicStatusPanel: React.FC<Props> = ({ micStatus, showMicTest, audioLevel, onTestClick }) => {
  return (
    <div className="bg-gray-700 rounded p-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-300">Microphone Status</span>
        {micStatus === 'idle' && (
          <button onClick={onTestClick} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded">Test Mic</button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-lg ${micStatus === 'active' ? 'animate-pulse' : ''}`}>
          {micStatus === 'active' ? '🎤' : micStatus === 'denied' ? '🚫' : micStatus === 'error' ? '⚠️' : '🎤'}
        </span>
        {(showMicTest || micStatus === 'active') && (
          <div className="flex-1 flex items-center gap-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-sm transition-all ${
                  audioLevel > i * 10
                    ? audioLevel > 70
                      ? 'bg-red-500'
                      : audioLevel > 40
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}
        {micStatus === 'denied' && <span className="text-xs text-red-400">Permission denied</span>}
        {micStatus === 'error' && <span className="text-xs text-yellow-400">Error detected</span>}
        {showMicTest && <span className="text-xs text-green-400">Speak now...</span>}
      </div>
      {micStatus === 'denied' && (
        <div className="text-xs text-gray-400">Click your browser's address bar and allow microphone access</div>
      )}
    </div>
  );
};

export default MicStatusPanel;

