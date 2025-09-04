import React from 'react';

interface ViewModeToggleProps {
  video1File: File | null;
  video2File: File | null;
  viewMode: string;
  onVideo1Select: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideo2Select: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onViewModeChange: (mode: string, activeVideo?: 1 | 2) => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  video1File,
  video2File,
  viewMode,
  onVideo1Select,
  onVideo2Select,
  onViewModeChange,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-2">
      {(video1File || video2File) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">View:</span>
          {video1File && (
            <button
              onClick={() => onViewModeChange('video1', 1)}
              className={`px-3 py-1 rounded text-sm transition-colors relative ${
                viewMode === 'video1' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Press 1 for Video 1"
            >
              Video 1
              <span className="absolute -top-1 -right-1 text-xs bg-gray-600 text-white px-1 rounded">1</span>
            </button>
          )}
          {video2File && (
            <button
              onClick={() => onViewModeChange('video2', 2)}
              className={`px-3 py-1 rounded text-sm transition-colors relative ${
                viewMode === 'video2' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Press 2 for Video 2"
            >
              Video 2
              <span className="absolute -top-1 -right-1 text-xs bg-gray-600 text-white px-1 rounded">2</span>
            </button>
          )}
          {video1File && video2File && (
            <button
              onClick={() => onViewModeChange('split')}
              className={`px-3 py-1 rounded text-sm transition-colors relative ${
                viewMode === 'split' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Press 3 for Split View"
            >
              Split View
              <span className="absolute -top-1 -right-1 text-xs bg-gray-600 text-white px-1 rounded">3</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewModeToggle;