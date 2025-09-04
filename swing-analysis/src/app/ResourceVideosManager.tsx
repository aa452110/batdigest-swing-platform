import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface VideoReference {
  id: string;
  name: string;
  file: File | null;
  url: string;
  type: 'reference' | 'drill';
  size: number;
  addedAt: string;
}

export default function ResourceVideosManager() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoReference[]>([]);
  const [activeTab, setActiveTab] = useState<'reference' | 'drill'>('reference');
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [newVideoName, setNewVideoName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load videos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('coachVideos');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setVideos(parsed);
      } catch (e) {
        console.error('Failed to load stored videos:', e);
      }
    }
  }, []);

  // Save videos to localStorage whenever they change
  useEffect(() => {
    // Store without the File objects (just metadata)
    const toStore = videos.map(v => ({
      ...v,
      file: null // Don't store File objects
    }));
    localStorage.setItem('coachVideos', JSON.stringify(toStore));
  }, [videos]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name from filename if empty
      if (!newVideoName) {
        const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewVideoName(name);
      }
    }
  };

  const handleAddVideo = async () => {
    if (!selectedFile || !newVideoName.trim()) {
      alert('Please select a file and enter a name');
      return;
    }

    // Create object URL for the file
    const url = URL.createObjectURL(selectedFile);
    
    const newVideo: VideoReference = {
      id: Date.now().toString(),
      name: newVideoName.trim(),
      file: selectedFile,
      url: url,
      type: activeTab,
      size: selectedFile.size,
      addedAt: new Date().toISOString()
    };

    setVideos(prev => [...prev, newVideo]);
    setIsAddingVideo(false);
    setNewVideoName('');
    setSelectedFile(null);
  };

  const handleDeleteVideo = (id: string) => {
    const video = videos.find(v => v.id === id);
    if (video && confirm(`Delete "${video.name}"?`)) {
      // Revoke the object URL to free memory
      if (video.url.startsWith('blob:')) {
        URL.revokeObjectURL(video.url);
      }
      setVideos(prev => prev.filter(v => v.id !== id));
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const filteredVideos = videos.filter(v => v.type === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Resource Videos Manager</h1>
                <p className="text-gray-400 mt-1">Manage reference and drill videos for analysis</p>
              </div>
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              <button
                onClick={() => setActiveTab('reference')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'reference'
                    ? 'bg-white text-cyan-600 border-b-2 border-cyan-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Reference Videos ({videos.filter(v => v.type === 'reference').length})
              </button>
              <button
                onClick={() => setActiveTab('drill')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'drill'
                    ? 'bg-white text-cyan-600 border-b-2 border-cyan-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Drill Videos ({videos.filter(v => v.type === 'drill').length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Add Video Button/Form */}
            {!isAddingVideo ? (
              <button
                onClick={() => setIsAddingVideo(true)}
                className="mb-6 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add {activeTab === 'reference' ? 'Reference' : 'Drill'} Video
              </button>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Add New {activeTab === 'reference' ? 'Reference' : 'Drill'} Video</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video Name
                    </label>
                    <input
                      type="text"
                      value={newVideoName}
                      onChange={(e) => setNewVideoName(e.target.value)}
                      placeholder="e.g., Aaron Judge Swing"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Video File
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {selectedFile && (
                      <p className="mt-1 text-sm text-gray-600">
                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddVideo}
                      disabled={!selectedFile || !newVideoName.trim()}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Add Video
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingVideo(false);
                        setNewVideoName('');
                        setSelectedFile(null);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Videos List */}
            <div className="space-y-2">
              {filteredVideos.length > 0 ? (
                filteredVideos.map(video => (
                  <div key={video.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{video.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(video.size)} • Added {new Date(video.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <p>No {activeTab} videos added yet</p>
                  <p className="text-sm mt-2">Click "Add {activeTab === 'reference' ? 'Reference' : 'Drill'} Video" to get started</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Videos are stored as pointing to local files on your computer</li>
                <li>• They will appear in the analyzer sidebar for quick access</li>
                <li>• Reference Videos: are for swing comparison videos</li>
                <li>• Drill Videos: are for showing corrective exercises and techniques</li>
                <li>• Videos are saved to your browser and persist between sessions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}