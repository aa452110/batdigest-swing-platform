import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { API_BASE } from '../services/api';
import { SwingShopHeader } from '../components/SwingShopHeader';

interface Submission {
  id: string;
  submissionId: string;
  athleteName: string;
  createdAt: string;
  status: 'pending' | 'uploading' | 'analyzing' | 'completed';
  notes: string;
  videoSize: number;
  analysisResult?: string;
  analyzedAt?: string;
  downloadUrl?: string;
  hlsUrl?: string;
  videoKey?: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export default function AccountDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [canUpload, setCanUpload] = useState(false);
  const [nextUploadDate, setNextUploadDate] = useState<Date | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null
  });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadSubmissions();
  }, [isAuthenticated, navigate]);

  const loadSubmissions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/submissions?user_id=${user.id}`);
      const data = await response.json();
      
      const userSubmissions = data.submissions || [];
      setSubmissions(userSubmissions);
      
      // Calculate upload eligibility
      checkUploadEligibility(userSubmissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUploadEligibility = (subs: Submission[]) => {
    if (!user) return;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get submissions from last 30 days
    const recentSubmissions = subs.filter(sub => 
      new Date(sub.createdAt) > thirtyDaysAgo
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const monthlyLimit = user.planType === 'performance' ? 4 : 2;
    const spacingDays = user.planType === 'performance' ? 7 : 14;
    
    if (recentSubmissions.length >= monthlyLimit) {
      setCanUpload(false);
      // Find oldest submission in the window to calculate when next upload is available
      const oldestRecent = recentSubmissions[recentSubmissions.length - 1];
      const nextDate = new Date(oldestRecent.createdAt);
      nextDate.setDate(nextDate.getDate() + 30);
      setNextUploadDate(nextDate);
      return;
    }
    
    if (recentSubmissions.length > 0) {
      const lastSubmission = recentSubmissions[0];
      const daysSinceLastUpload = (now.getTime() - new Date(lastSubmission.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastUpload < spacingDays) {
        setCanUpload(false);
        const nextDate = new Date(lastSubmission.createdAt);
        nextDate.setDate(nextDate.getDate() + spacingDays);
        setNextUploadDate(nextDate);
      } else {
        setCanUpload(true);
        setNextUploadDate(null);
      }
    } else {
      setCanUpload(true);
      setNextUploadDate(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|m4v|webm)$/i)) {
      setUploadState(prev => ({ ...prev, error: 'Please select a valid video file (.mp4, .mov, .m4v, or .webm)' }));
      return;
    }
    
    // Check file size (2GB max for Cloudflare)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setUploadState(prev => ({ ...prev, error: 'Video file must be less than 2GB' }));
      return;
    }
    
    setSelectedFile(file);
    setUploadState(prev => ({ ...prev, error: null }));
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    
    try {
      setUploadState({ isUploading: true, progress: 0, error: null });
      
      // Step 1: Create submission record
      const createResponse = await fetch(`${API_BASE}/api/submission/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteName: `${user.firstName} ${user.lastName}`,
          userId: user.id,
          notes: uploadNotes || 'Uploaded from web interface',
          cameraAngle: 'Unknown',
          videoSize: selectedFile.size,
          fileName: selectedFile.name
        })
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create submission');
      }
      
      const { submissionId } = await createResponse.json();
      
      // Step 2: Upload video to R2
      const r2Key = `videos/${new Date().getFullYear()}/${submissionId}.mp4`;
      const uploadUrl = `${API_BASE}/api/video/upload/${submissionId}?key=${r2Key}`;
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadState(prev => ({ ...prev, progress: percentComplete }));
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setUploadState({ isUploading: false, progress: 100, error: null });
          setShowUploadForm(false);
          setSelectedFile(null);
          setUploadNotes('');
          loadSubmissions(); // Refresh list
          alert('Video uploaded successfully! You will receive an email when analysis is complete (typically within 72 hours).');
        } else {
          throw new Error('Upload failed');
        }
      });
      
      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });
      
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', selectedFile.type || 'video/mp4');
      xhr.send(selectedFile);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState({ 
        isUploading: false, 
        progress: 0, 
        error: 'Failed to upload video. Please try again.' 
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return `${mb} MB`;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      uploading: 'bg-blue-100 text-blue-800',
      analyzing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const viewAnalysis = (submission: Submission) => {
    if (submission.downloadUrl || submission.hlsUrl || submission.videoKey) {
      navigate(`/account/analysis/${submission.submissionId}`, { state: { submission } });
    }
  };

  if (loading) {
    return (
      <div>
        <SwingShopHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SwingShopHeader />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Account Dashboard</h1>
            <div className="text-sm text-gray-600">
              <p>Welcome back, {user?.firstName} {user?.lastName}</p>
              <p>Plan: {user?.planType === 'performance' ? 'Performance (4/month)' : 'Starter (2/month)'}</p>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Upload New Video</h2>
              {canUpload ? (
                <button
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                >
                  {showUploadForm ? 'Cancel' : 'Upload Video'}
                </button>
              ) : (
                <div className="text-sm text-red-600">
                  Next upload available: {nextUploadDate ? formatDate(nextUploadDate.toISOString()) : 'N/A'}
                </div>
              )}
            </div>

            {showUploadForm && canUpload && (
              <div className="border-t pt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Video File
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/x-m4v,.mp4,.mov,.m4v,.webm"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-1">
                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={uploadNotes}
                      onChange={(e) => setUploadNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Any specific areas you'd like the coach to focus on?"
                    />
                  </div>

                  {uploadState.error && (
                    <div className="text-red-600 text-sm">{uploadState.error}</div>
                  )}

                  {uploadState.isUploading && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadState.progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadState.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadState.isUploading}
                    className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {uploadState.isUploading ? 'Uploading...' : 'Submit for Analysis'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submissions List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">My Submissions</h2>
            {submissions.length === 0 ? (
              <p className="text-gray-500">No submissions yet. Upload your first video to get started!</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.submissionId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{submission.athleteName}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(submission.status)}`}>
                            {submission.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Submitted: {formatDate(submission.createdAt)}</p>
                        {submission.notes && (
                          <p className="text-sm text-gray-600 mt-1">Notes: {submission.notes}</p>
                        )}
                        {submission.analyzedAt && (
                          <p className="text-sm text-green-600 mt-1">Analyzed: {formatDate(submission.analyzedAt)}</p>
                        )}
                      </div>
                      {submission.status === 'completed' && (
                        <button
                          onClick={() => viewAnalysis(submission)}
                          className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700"
                        >
                          View Analysis
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}