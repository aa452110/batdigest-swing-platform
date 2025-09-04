import React from 'react';

type Props = {
  width: number;
  height: number;
  onStart: () => void;
  onReselect: () => void;
};

const PostSelectionPanel: React.FC<Props> = ({ width, height, onStart, onReselect }) => {
  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-400">Area selected: {Math.round(width)} × {Math.round(height)}</div>
      <div className="text-xs text-yellow-400 text-center bg-yellow-900/30 px-2 py-1 rounded">⏱️ 5-minute recording limit</div>
      <button onClick={onStart} className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full" />
        Start Recording
      </button>
      <button onClick={onReselect} className="w-full px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-sm">
        Reselect Area
      </button>
    </div>
  );
};

export default PostSelectionPanel;

