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
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-400">Videos:</span>
        <label className="flex items-center gap-2">
          <input
            type="file"
            accept="video/*"
            onChange={onVideo1Select}
            className="hidden"
            id="video1-input"
          />
          <label
            htmlFor="video1-input"
            className={`px-3 py-1 rounded text-sm cursor-pointer transition-colors ${
              video1File 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Video 1 {video1File ? '✓' : '+'}
          </label>
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="file"
            accept="video/*"
            onChange={onVideo2Select}
            className="hidden"
            id="video2-input"
          />
          <label
            htmlFor="video2-input"
            className={`px-3 py-1 rounded text-sm cursor-pointer transition-colors ${
              video2File 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Video 2 {video2File ? '✓' : '+'}
          </label>
        </label>
      </div>

      {(video1File || video2File) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">View:</span>
          {video1File && (
            <button
              onClick={() => onViewModeChange('video1', 1)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'video1' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Video 1
            </button>
          )}
          {video2File && (
            <button
              onClick={() => onViewModeChange('video2', 2)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'video2' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Video 2
            </button>
          )}
          {video1File && video2File && (
            <button
              onClick={() => onViewModeChange('split')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'split' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Split View
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewModeToggle;