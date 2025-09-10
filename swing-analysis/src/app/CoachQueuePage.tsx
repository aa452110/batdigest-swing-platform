import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoachNavigation } from '../components/CoachNavigation';
import { resolveAnalyzedDownloadUrl } from '../lib/video';
import { API_BASE } from '../services/api';

interface Submission {
  id: number;
  submissionId: string;
  r2Key: string;
  athleteName: string;
  videoSize: number;
  cameraAngle: string;
  notes: string;
  createdAt: string;
  status: string;
  coachCode?: string;
  wantsBatAdvice: boolean;
  wantsDrills: boolean;
  wantsMechanics: boolean;
}

export function CoachQueuePage() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    uploading: 0,
    analyzing: 0,
    longestWait: 0,
    activePlayers: 0
  });

  // Get coach data from localStorage
  const coachData = JSON.parse(localStorage.getItem('coachData') || '{}');
  const coachToken = localStorage.getItem('coachToken');

  useEffect(() => {
    if (!coachToken) {
      navigate('/coach/login');
      return;
    }
    loadSubmissions();
  }, [coachToken]);

  const loadSubmissions = async () => {
    try {
      // Get fresh coach data from localStorage
      const storedCoachData = JSON.parse(localStorage.getItem('coachData') || '{}');
      const coachCode = storedCoachData.inviteCode || '000000'; // Default to general pool
      
      console.log('Loading submissions for coach code:', coachCode);
      
      // Fetch submissions for this coach's code
      const response = await fetch(`${API_BASE}/api/coach/submissions?coachCode=${coachCode}`, {
        headers: {
          'Authorization': `Bearer ${coachToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('coachToken');
          localStorage.removeItem('coachData');
          navigate('/coach/login');
          return;
        }
        throw new Error('Failed to load submissions');
      }

      const data = await response.json();
      console.log('Received submissions:', data.submissions?.length || 0, 'videos');
      console.log('Submissions data:', data.submissions);
      setSubmissions(data.submissions || []);
      
      // Calculate stats
      const pending = data.submissions?.filter((s: Submission) => s.status === 'pending').length || 0;
      const uploading = data.submissions?.filter((s: Submission) => s.status === 'uploading').length || 0;
      const analyzing = data.submissions?.filter((s: Submission) => s.status === 'analyzing').length || 0;
      
      // Calculate unique active players
      const uniquePlayers = new Set(data.submissions?.map((s: Submission) => s.athleteName) || []);
      const activePlayers = uniquePlayers.size;
      
      // Calculate longest wait time
      let longestWait = 0;
      data.submissions?.forEach((s: Submission) => {
        if (s.status === 'pending') {
          const waitTime = Date.now() - new Date(s.createdAt).getTime();
          const waitHours = Math.floor(waitTime / (1000 * 60 * 60));
          if (waitHours > longestWait) longestWait = waitHours;
        }
      });

      setStats({ pending, uploading, analyzing, longestWait, activePlayers });
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = (submission: Submission) => {
    // Store submission data in session storage for analyzer
    sessionStorage.setItem('selectedVideo', 
      `${API_BASE}/api/video/stream/${submission.r2Key}`
    );
    sessionStorage.setItem('selectedSubmission', JSON.stringify({
      submissionId: submission.submissionId,
      playerName: submission.athleteName,
      notes: submission.notes,
      wantsBatAdvice: submission.wantsBatAdvice,
      wantsDrills: submission.wantsDrills,
      wantsMechanics: submission.wantsMechanics
    }));
    
    navigate('/coach/analyzer');
  };

  const formatVideoSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getWaitTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 24) {
      const days = Math.floor(diffHrs / 24);
      return `${days}d ${diffHrs % 24}h`;
    }
    return `${diffHrs}h ${diffMins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading your queue...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Video Queue</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-teal-800 px-3 py-1 rounded">
                Coach: {coachData.fullName || 'Coach'}
              </span>
              <span className="bg-teal-800 px-3 py-1 rounded">
                Code: {coachData.inviteCode || 'Loading...'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50 border-b">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl font-bold text-blue-600">{stats.activePlayers}</div>
              <div className="text-sm text-gray-600">Active Players</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl font-bold text-teal-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Analysis</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl font-bold text-amber-600">{stats.uploading}</div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl font-bold text-yellow-600">{stats.analyzing}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl font-bold text-red-600">{stats.longestWait}h</div>
              <div className="text-sm text-gray-600">Longest Wait</div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="p-6">
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl mb-4">No submissions yet</p>
                <p className="text-sm">Share your coach code <span className="font-bold">{coachData.inviteCode}</span> with your players</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3">Account Holder</th>
                    <th className="text-left p-3">Video</th>
                    <th className="text-left p-3">Wait Time</th>
                    <th className="text-left p-3">Preferences</th>
                    <th className="text-left p-3">Notes</th>
                    <th className="text-left p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(submission => (
                    <tr key={submission.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-semibold">{submission.athleteName}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {formatVideoSize(submission.videoSize)}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          getWaitTime(submission.createdAt).includes('d') 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getWaitTime(submission.createdAt)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {submission.wantsDrills && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Drills</span>
                          )}
                          {submission.wantsBatAdvice && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Bat</span>
                          )}
                          {submission.wantsMechanics && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Mechanics</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                        {submission.notes || '-'}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {submission.status === 'uploading' ? (
                            <button
                              disabled
                              className="px-4 py-2 bg-amber-500 text-white rounded cursor-not-allowed opacity-75"
                            >
                              ⏳ Processing...
                            </button>
                          ) : submission.status === 'analyzing' ? (
                            <button
                              onClick={() => handleAnalyze(submission)}
                              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                            >
                              Continue →
                            </button>
                          ) : submission.status === 'completed' ? (
                            <>
                              <button
                                onClick={() => handleAnalyze(submission)}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                View Analysis
                              </button>
                              {(() => {
                                const analyzedUrl = resolveAnalyzedDownloadUrl(submission as any);
                                return analyzedUrl ? (
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = analyzedUrl;
                                    link.download = `${submission.athleteName}-analyzed-${submission.submissionId}.mp4`;
                                    link.target = '_blank';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  title="Download analyzed video"
                                >
                                  ⬇ Analyzed
                                </button>
                                ) : null;
                              })()}
                            </>
                          ) : (
                            <button
                              onClick={() => handleAnalyze(submission)}
                              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                            >
                              Analyze →
                            </button>
                          )}
                          {submission.status !== 'uploading' && submission.r2Key && (
                            <button
                              onClick={() => {
                                const videoUrl = `${API_BASE}/api/video/stream/${submission.r2Key}`;
                                const link = document.createElement('a');
                                link.href = videoUrl;
                                link.download = `${submission.athleteName}-${submission.submissionId}.mp4`;
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                              title="Download original video"
                            >
                              ⬇ Original
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
