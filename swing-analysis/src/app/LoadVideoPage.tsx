import React, { useState } from 'react';
import ComparisonVideoPlayer from '../modules/video/ComparisonVideoPlayer';
import AnalysisRecorder from '../modules/recording/AnalysisRecorder';
import ReferenceVideos from '../modules/video/ReferenceVideos';

const LoadVideoPage: React.FC = () => {
  const [setVideo2, setSetVideo2] = useState<((file: File) => void) | null>(null);
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Swing Analysis Comparison</h1>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main video player with comparison - takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <ComparisonVideoPlayer 
                className="w-full" 
                onVideo2Change={setSetVideo2}
              />
            </div>
            
            {/* Recording controls sidebar - 1 column */}
            <div className="space-y-6">
              <AnalysisRecorder />
              {setVideo2 && (
                <ReferenceVideos 
                  onSelectVideo={(file) => {
                    setVideo2(file);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadVideoPage;
