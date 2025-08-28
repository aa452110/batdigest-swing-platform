import React, { useState, useEffect } from 'react';

// Default videos (legacy - will be removed once coaches add their own)
const defaultReferenceVideos: { name: string; file: string }[] = [
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
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [referenceVideos, setReferenceVideos] = useState<{ name: string; file?: string; url?: string }[]>([]);

  // Load videos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('coachVideos');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filter for reference type videos
        const refVideos = parsed
          .filter((v: any) => v.type === 'reference')
          .map((v: any) => ({
            name: v.name,
            url: v.url // Use the stored blob URL
          }));
        
        if (refVideos.length > 0) {
          setReferenceVideos(refVideos);
        } else {
          // Use default videos if no custom ones added
          setReferenceVideos(defaultReferenceVideos);
        }
      } catch (e) {
        console.error('Failed to load stored videos:', e);
        setReferenceVideos(defaultReferenceVideos);
      }
    } else {
      setReferenceVideos(defaultReferenceVideos);
    }
  }, []);

  const handleVideoClick = async (video: { name: string; file?: string; url?: string }) => {
    try {
      setLoadingVideo(video.name);
      
      let blob: Blob;
      
      if (video.url) {
        // Use stored blob URL from localStorage
        console.log(`Loading reference video from blob URL: ${video.url}`);
        const response = await fetch(video.url);
        if (!response.ok) {
          throw new Error(`Failed to load video from blob URL: ${response.status}`);
        }
        blob = await response.blob();
      } else if (video.file) {
        // Use default videos from public folder
        console.log(`Loading reference video: ${video.file} from /reference-videos/`);
        const response = await fetch(`/reference-videos/${video.file}`);
        if (!response.ok) {
          throw new Error(`Failed to load video: ${response.status}`);
        }
        blob = await response.blob();
      } else {
        throw new Error('No video source available');
      }
      
      console.log(`Video blob size: ${blob.size} bytes`);
      
      const fileName = video.file || `${video.name}.mp4`;
      const file = new File([blob], fileName, { type: 'video/mp4' });
      onSelectVideo(file);
      console.log(`Successfully loaded reference video: ${video.name}`);
      
      setLoadingVideo(null);
    } catch (error) {
      console.error('Error loading reference video:', error);
      alert(`Failed to load ${video.name}. Error: ${error}`);
      setLoadingVideo(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Reference Videos</h3>
      <div className="space-y-1">
        {referenceVideos.length > 0 ? (
          referenceVideos.map((video, index) => (
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
            <p>No reference videos added yet</p>
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

export default ReferenceVideos;