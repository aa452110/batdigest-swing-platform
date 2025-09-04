import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoachNavigation } from '../components/CoachNavigation';

interface VideoReference {
  id: string;
  name: string;
  file: File | null;
  url: string;
  type: 'reference' | 'drill';
  size: number;
  addedAt: string;
}

export function CoachResourceVideosManager() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoReference[]>([]);
  const [activeTab, setActiveTab] = useState<'reference' | 'drill'>('reference');
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [newVideoName, setNewVideoName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Check if coach is logged in
  useEffect(() => {
    const coachToken = localStorage.getItem('coachToken');
    if (!coachToken) {
      navigate('/coach/login');
    }
  }, [navigate]);

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
    <div className="min-h-screen bg-gray-50">
      <CoachNavigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Resource Videos Manager</h1>
                <p className="text-teal-100 mt-1">Manage reference and drill videos for analysis</p>
              </div>
              <button
                onClick={() => navigate('/coach/analyzer')}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors"
              >
                ← Back to Analyzer
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
                    ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Reference Videos ({videos.filter(v => v.type === 'reference').length})
              </button>
              <button
                onClick={() => setActiveTab('drill')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'drill'
                    ? 'bg-white text-teal-600 border-b-2 border-teal-600'
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
                className="mb-6 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
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
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
            {filteredVideos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl mb-2">No {activeTab} videos yet</p>
                <p className="text-sm">Click the button above to add your first video</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredVideos.map(video => (
                  <div key={video.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{video.name}</h4>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(video.size)} • Added {new Date(video.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Play video in a new window for preview
                          window.open(video.url, '_blank', 'width=800,height=600');
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ About Resource Videos</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Reference Videos:</strong> Pro swings and technique examples to compare with players</li>
                <li>• <strong>Drill Videos:</strong> Training exercises and drills to share with players</li>
                <li>• Videos are stored locally in your browser and persist between sessions</li>
                <li>• These videos will be available in the analyzer for side-by-side comparison</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}