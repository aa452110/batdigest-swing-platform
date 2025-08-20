import React from 'react';

const referenceVideos: { name: string; file: string }[] = [
  { name: 'Aaron Judge', file: 'Aaron_Judge.MP4' },
  { name: 'Albert Pujols', file: 'Albert_Puljos.MP4' },
  { name: 'Bryce Harper', file: 'Bryce_Harper.MP4' },
  { name: 'Gunnar Henderson', file: 'Gunnar_Henderson.MP4' },
  { name: 'Miguel Cabrera', file: 'Miguel_Cabrera.MP4' },
  { name: 'Shohei Ohtani', file: 'Shohei_Ohtani.MP4' },
  { name: 'Stephen Kwan', file: 'Stephen_Kwan.MP4' },
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
        {referenceVideos.length > 0 ? (
          referenceVideos.map((video) => (
            <button
              key={video.file}
              onClick={() => handleVideoClick(video.file)}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white rounded transition-colors"
            >
              {video.name}
            </button>
          ))
        ) : (
          <p className="text-xs text-gray-500 italic">No reference videos added yet</p>
        )}
      </div>
    </div>
  );
};

export default ReferenceVideos;