import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { SwingShopHeader } from '../components/SwingShopHeader';
import { useAuthStore } from '../stores/authStore';

interface AnalysisData {
  submissionId: string;
  athleteName: string;
  createdAt: string;
  analyzedAt: string;
  notes: string;
  analysisResult?: string;
  downloadUrl?: string;
  hlsUrl?: string;
  videoKey?: string;
}

export default function AccountAnalysisView() {
  const { submissionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Try to get submission data from navigation state first
    if (location.state?.submission) {
      const sub = location.state.submission;
      setAnalysis(sub);
      resolveVideoUrl(sub);
      setLoading(false);
    } else {
      // TODO: Fetch from API if no state
      setLoading(false);
    }
  }, [submissionId, location.state, isAuthenticated, navigate]);

  const resolveVideoUrl = (submission: AnalysisData) => {
    // Priority: downloadUrl > hlsUrl > construct from videoKey
    if (submission.downloadUrl) {
      setVideoUrl(submission.downloadUrl);
    } else if (submission.hlsUrl) {
      setVideoUrl(submission.hlsUrl);
    } else if (submission.videoKey) {
      // Construct Stream URL from video key
      const streamUrl = `https://customer-f3n1j6hz39koqhxz.cloudflarestream.com/${submission.videoKey}/manifest/video.m3u8`;
      setVideoUrl(streamUrl);
    }
  };

  const handleDownload = () => {
    if (!analysis) return;
    
    const downloadUrl = analysis.downloadUrl || 
      (analysis.videoKey ? `https://customer-f3n1j6hz39koqhxz.cloudflarestream.com/${analysis.videoKey}/downloads/default.mp4` : '');
    
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${analysis.athleteName}-analysis-${analysis.submissionId}.mp4`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Download URL not available');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div>
        <SwingShopHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div>Loading analysis...</div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div>
        <SwingShopHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Analysis not found</p>
            <button
              onClick={() => navigate('/account/dashboard')}
              className="text-teal-600 hover:underline"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SwingShopHeader />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/account/dashboard')}
            className="mb-6 text-teal-600 hover:underline flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>

          {/* Analysis Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Swing Analysis</h1>
                <p className="text-gray-600">{analysis.athleteName}</p>
                <p className="text-sm text-gray-500">Submitted: {formatDate(analysis.createdAt)}</p>
                {analysis.analyzedAt && (
                  <p className="text-sm text-green-600">Analyzed: {formatDate(analysis.analyzedAt)}</p>
                )}
              </div>
              <button
                onClick={handleDownload}
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
              >
                Download Video
              </button>
            </div>
          </div>

          {/* Video Player */}
          {videoUrl && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Analysis Video</h2>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full"
                  src={videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Tip: Click the fullscreen button or rotate your device for a better view
              </p>
            </div>
          )}

          {/* Coach Notes */}
          {analysis.analysisResult && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Coach's Analysis</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{analysis.analysisResult}</p>
              </div>
            </div>
          )}

          {/* Original Notes */}
          {analysis.notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Your Notes</h2>
              <p className="text-gray-700">{analysis.notes}</p>
            </div>
          )}

          {/* Expiration Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Analysis videos are available for 30 days. 
              Please download the video if you'd like to keep it permanently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}