import React from 'react';

// Videos will be added here when you have them
// Example: { name: 'Tee Work', file: 'tee-work-drill.mp4' }
const drillVideos: { name: string; file: string }[] = [];

interface DrillVideosProps {
  onSelectVideo: (file: File) => void;
}

const DrillVideos: React.FC<DrillVideosProps> = ({ onSelectVideo }) => {
  const handleVideoClick = async (videoPath: string) => {
    try {
      // Fetch the video file from the assets
      const response = await fetch(`/src/assets/drills/${videoPath}`);
      const blob = await response.blob();
      const file = new File([blob], videoPath, { type: 'video/mp4' });
      onSelectVideo(file);
    } catch (error) {
      console.error('Error loading drill video:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Drill Videos</h3>
      <div className="space-y-1">
        {drillVideos.length > 0 ? (
          drillVideos.map((video) => (
            <button
              key={video.file}
              onClick={() => handleVideoClick(video.file)}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white rounded transition-colors"
            >
              {video.name}
            </button>
          ))
        ) : (
          <p className="text-xs text-gray-500 italic">No drill videos added yet</p>
        )}
      </div>
    </div>
  );
};

export default DrillVideos;