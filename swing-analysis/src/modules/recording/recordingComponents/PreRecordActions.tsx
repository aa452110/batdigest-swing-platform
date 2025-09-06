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
          {micStatus === 'idle' && (
            <button onClick={onTestMic} className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
              🎤 Mic Test
            </button>
          )}
          {(micStatus === 'active' || showMicTest) && (
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-700 rounded">
              <span className="text-sm animate-pulse">🎤</span>
              <span className="text-xs text-green-400">Ready</span>
              <div className="flex-1 flex items-center gap-px ml-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-1.5 w-1 rounded-sm transition-all ${audioLevel > i * 20 ? 'bg-green-500' : 'bg-gray-600'}`} />
                ))}
              </div>
            </div>
          )}
          {micStatus === 'denied' && (
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-700 rounded">
              <span className="text-sm">🚫</span>
              <span className="text-xs text-red-400">Microphone access denied</span>
            </div>
          )}
          {micStatus === 'error' && (
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-700 rounded">
              <span className="text-sm">⚠️</span>
              <span className="text-xs text-yellow-400">Microphone error</span>
            </div>
          )}
          <button 
            onClick={onStart} 
            disabled={micStatus === 'idle'}
            className={`w-full px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
              micStatus === 'idle' 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
            title={micStatus === 'idle' ? 'Please test your microphone first' : 'Start recording'}
          >
            {micStatus === 'idle' ? 'Test Mic First' : 'Start Recording'}
          </button>
          <div className="text-[11px] text-gray-400 mt-1">
            Using Chrome extension - click the extension icon when prompted
          </div>
        </>
      )}
    </>
  );
};

export default PreRecordActions;
