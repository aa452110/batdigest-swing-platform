import React from 'react';
import { useComparisonStore } from '../../state/store';

interface ViewModeControlsProps {
  video1File: File | null;
  video2File: File | null;
  onVideo1Select: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideo2Select: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ViewModeControls: React.FC<ViewModeControlsProps> = ({
  video1File,
  video2File,
  onVideo1Select,
  onVideo2Select
}) => {
  const { viewMode, setViewMode } = useComparisonStore();

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Video Controls</h3>
      
      <div className="space-y-3">
        {/* Load Videos */}
        <div className="space-y-2">
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
              className={`w-full px-3 py-2 rounded text-sm cursor-pointer transition-colors text-center ${
                video1File 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {video1File ? '✓ Video 1 Loaded' : '+ Load Video 1'}
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
              className={`w-full px-3 py-2 rounded text-sm cursor-pointer transition-colors text-center ${
                video2File 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {video2File ? '✓ Video 2 Loaded' : '+ Load Video 2'}
            </label>
          </label>
        </div>

        {/* View Mode Selection */}
        {(video1File || video2File) && (
          <div className="space-y-2 pt-2 border-t border-gray-700">
            <span className="text-xs text-gray-400">View Mode:</span>
            <div className="flex flex-col gap-1">
              {video1File && (
                <button
                  onClick={() => setViewMode('video1')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'video1' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Video 1 Only
                </button>
              )}
              {video2File && (
                <button
                  onClick={() => setViewMode('video2')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'video2' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Video 2 Only
                </button>
              )}
              {video1File && video2File && (
                <button
                  onClick={() => setViewMode('split')}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewModeControls;