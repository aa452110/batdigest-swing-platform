import React, { useState, useEffect } from 'react';

interface DrillVideosProps {
  onSelectVideo: (file: File) => void;
}

const DrillVideos: React.FC<DrillVideosProps> = ({ onSelectVideo }) => {
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [drillVideos, setDrillVideos] = useState<{ name: string; url: string }[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newVideoName, setNewVideoName] = useState('');
  const [videoType, setVideoType] = useState<'reference' | 'drill'>('drill'); // Default to drill

  // Clear localStorage on mount since blob URLs don't persist
  useEffect(() => {
    // Clear any stored drill videos since blob URLs are invalid after refresh
    localStorage.removeItem('coachVideos');
    // REMOVED LOG - console.log('Cleared stored drill video references - blob URLs do not persist between sessions');
    setDrillVideos([]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-generate a name from the filename if empty
      if (!newVideoName) {
        const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewVideoName(name);
      }
    }
  };

  const handleAddVideo = () => {
    if (!selectedFile || !newVideoName.trim()) {
      alert('Please select a file and enter a name');
      return;
    }

    // Create blob URL for the file
    const url = URL.createObjectURL(selectedFile);
    
    const newVideo = {
      name: newVideoName.trim(),
      url: url
    };

    // Add to current session only (don't save to localStorage since blob URLs don't persist)
    setDrillVideos(prev => [...prev, newVideo]);
    
    // Reset modal
    setShowAddModal(false);
    setSelectedFile(null);
    setNewVideoName('');
  };

  const handleDeleteVideo = (videoName: string) => {
    const video = drillVideos.find(v => v.name === videoName);
    if (video) {
      // Revoke the object URL if it's a blob
      if (video.url && video.url.startsWith('blob:')) {
        URL.revokeObjectURL(video.url);
      }
      
      // Remove from state
      const updatedVideos = drillVideos.filter(v => v.name !== videoName);
      setDrillVideos(updatedVideos);
      
      // Clear delete confirmation
      setDeleteConfirm(null);
    }
  };

  const handleVideoClick = async (video: { name: string; url: string }) => {
    try {
      setLoadingVideo(video.name);
      
      // Use stored blob URL from localStorage
      // REMOVED LOG - console.log(`Loading drill video from blob URL: ${video.url}`);
      const response = await fetch(video.url);
      if (!response.ok) {
        throw new Error(`Failed to load video from blob URL: ${response.status}`);
      }
      
      const blob = await response.blob();
      // REMOVED LOG - console.log(`Video blob size: ${blob.size} bytes`);
      
      const file = new File([blob], `${video.name}.mp4`, { type: 'video/mp4' });
      onSelectVideo(file);
      // REMOVED LOG - console.log(`Successfully loaded drill video: ${video.name}`);
      
      setLoadingVideo(null);
    } catch (error) {
      console.error('Error loading drill video:', error);
      alert(`Failed to load ${video.name}. Error: ${error}`);
      setLoadingVideo(null);
    }
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-300">Drill Videos</h3>
          <button 
            onClick={() => setShowAddModal(true)}
            className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1"
            title="Add videos"
          >
            + Add
          </button>
        </div>
      <div className="space-y-1">
        {drillVideos.length > 0 ? (
          drillVideos.map((video, index) => (
            <div key={video.name + index} className="flex items-center gap-1">
              <button
                onClick={() => handleVideoClick(video)}
                disabled={loadingVideo !== null}
                className={`flex-1 text-left px-3 py-2 text-sm rounded transition-colors ${
                  loadingVideo === video.name 
                    ? 'bg-cyan-700 text-white cursor-wait' 
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {loadingVideo === video.name ? 'Loading...' : video.name}
              </button>
              {deleteConfirm === video.name ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDeleteVideo(video.name)}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    title="Confirm delete"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                    title="Cancel"
                  >
                    ✗
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(video.name)}
                  className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded"
                  title="Delete video"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-xs text-gray-500 italic">
            <p>No drill videos added yet</p>
          </div>
        )}
      </div>
    </div>

    {/* Add Video Modal */}
    {showAddModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-white mb-4">Add Drill Video</h2>
          
          <div className="space-y-4">
            {/* Video Type Selector (pre-selected as drill) */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setVideoType('reference')}
                  className={`flex-1 py-2 px-4 rounded ${
                    videoType === 'reference' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Reference
                </button>
                <button
                  onClick={() => setVideoType('drill')}
                  className={`flex-1 py-2 px-4 rounded ${
                    videoType === 'drill' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Drill
                </button>
              </div>
            </div>

            {/* File Input */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Select Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
              />
              {selectedFile && (
                <p className="text-xs text-gray-400 mt-1">
                  Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
              )}
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Video Name</label>
              <input
                type="text"
                value={newVideoName}
                onChange={(e) => setNewVideoName(e.target.value)}
                placeholder="Enter a descriptive name"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddVideo}
                disabled={!selectedFile || !newVideoName.trim()}
                className={`flex-1 py-2 px-4 rounded font-semibold ${
                  selectedFile && newVideoName.trim()
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add Video
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedFile(null);
                  setNewVideoName('');
                }}
                className="flex-1 py-2 px-4 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default DrillVideos;