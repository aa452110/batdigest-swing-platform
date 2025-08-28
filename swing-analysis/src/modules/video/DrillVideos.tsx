import React, { useState, useEffect } from 'react';

interface DrillVideosProps {
  onSelectVideo: (file: File) => void;
}

const DrillVideos: React.FC<DrillVideosProps> = ({ onSelectVideo }) => {
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [drillVideos, setDrillVideos] = useState<{ name: string; url: string }[]>([]);

  // Load videos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('coachVideos');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filter for drill type videos
        const drills = parsed
          .filter((v: any) => v.type === 'drill')
          .map((v: any) => ({
            name: v.name,
            url: v.url // Use the stored blob URL
          }));
        
        setDrillVideos(drills);
      } catch (e) {
        console.error('Failed to load stored drill videos:', e);
      }
    }
  }, []);

  const handleVideoClick = async (video: { name: string; url: string }) => {
    try {
      setLoadingVideo(video.name);
      
      // Use stored blob URL from localStorage
      console.log(`Loading drill video from blob URL: ${video.url}`);
      const response = await fetch(video.url);
      if (!response.ok) {
        throw new Error(`Failed to load video from blob URL: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log(`Video blob size: ${blob.size} bytes`);
      
      const file = new File([blob], `${video.name}.mp4`, { type: 'video/mp4' });
      onSelectVideo(file);
      console.log(`Successfully loaded drill video: ${video.name}`);
      
      setLoadingVideo(null);
    } catch (error) {
      console.error('Error loading drill video:', error);
      alert(`Failed to load ${video.name}. Error: ${error}`);
      setLoadingVideo(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Drill Videos</h3>
      <div className="space-y-1">
        {drillVideos.length > 0 ? (
          drillVideos.map((video, index) => (
            <button
              key={video.name + index}
              onClick={() => handleVideoClick(video)}
              disabled={loadingVideo !== null}
              className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                loadingVideo === video.name 
                  ? 'bg-cyan-700 text-white cursor-wait' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {loadingVideo === video.name ? 'Loading...' : video.name}
            </button>
          ))
        ) : (
          <div className="text-xs text-gray-500 italic space-y-2">
            <p>No drill videos added yet</p>
            <a 
              href="/admin/resource-videos" 
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Add videos →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrillVideos;