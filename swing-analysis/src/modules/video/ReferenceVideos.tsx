import React from 'react';

// For now, we'll define the videos here. When you add actual videos,
// we'll import them properly
const referenceVideos = [
  { name: 'Proper Stance', file: 'stance.mp4' },
  { name: 'Load Phase', file: 'load.mp4' },
  { name: 'Contact Point', file: 'contact.mp4' },
  { name: 'Follow Through', file: 'follow-through.mp4' },
  { name: 'Full Swing - Front', file: 'full-swing-front.mp4' },
  { name: 'Full Swing - Side', file: 'full-swing-side.mp4' },
];

interface ReferenceVideosProps {
  onSelectVideo: (file: File) => void;
}

const ReferenceVideos: React.FC<ReferenceVideosProps> = ({ onSelectVideo }) => {
  const handleVideoClick = async (videoPath: string) => {
    try {
      // Fetch the video file from the assets
      const response = await fetch(`/src/assets/hitting-models/${videoPath}`);
      const blob = await response.blob();
      const file = new File([blob], videoPath, { type: 'video/mp4' });
      onSelectVideo(file);
    } catch (error) {
      console.error('Error loading reference video:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Reference Videos</h3>
      <div className="space-y-1">
        {referenceVideos.map((video) => (
          <button
            key={video.file}
            onClick={() => handleVideoClick(video.file)}
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white rounded transition-colors"
          >
            {video.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReferenceVideos;