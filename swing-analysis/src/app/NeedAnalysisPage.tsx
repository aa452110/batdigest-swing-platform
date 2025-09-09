import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { resolveAnalyzedDownloadUrl } from '../lib/video';
import type { VideoSubmission as ApiSubmission } from '../services/api';
import { SwingShopHeader } from '../components/SwingShopHeader';

interface VideoSubmission {
  id: string;
  submissionId: string;
  playerName: string;
  teamName: string;
  submittedAt: Date;
  videoPath: string;
  r2Key: string;
  status: 'pending' | 'uploading' | 'analyzing' | 'completed';
  notes: string;
  videoSize: number;
  coachCode?: string;
  analysisResult?: string;
  analyzedAt?: string;
  downloadUrl?: string;
}

const NeedAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
    // No auto-refresh - only on page load
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await api.getAllSubmissions();
      
      // Transform API data to our format
      const transformed: VideoSubmission[] = data.map((sub: ApiSubmission) => ({
        id: sub.id.toString(),
        submissionId: sub.submissionId,
        playerName: sub.athleteName || 'Unknown Athlete',
        teamName: `User ${sub.userId}`, // We'll enhance this later
        submittedAt: new Date(sub.createdAt),
        videoPath: sub.r2Key,
        r2Key: sub.r2Key,
        status: sub.status as 'pending' | 'uploading' | 'analyzing' | 'completed',
        notes: sub.notes || 'No notes provided',
        videoSize: sub.videoSize || 0,
        coachCode: sub.coachCode,
        analysisResult: sub.analysisResult,
        analyzedAt: sub.analyzedAt,
        // Prefer explicit API field if present; fall back to common variants
        downloadUrl: (sub as any).downloadUrl || (sub as any).analysisUrl || (sub as any).analysis_url,
      }));

      // Sort by status priority (pending first, then uploading, then analyzing, then completed), 
      // then by oldest first within each status
      const sorted = transformed.sort((a, b) => {
        // Status priority: pending = 0, uploading = 1, analyzing = 2, completed = 3
        const statusPriority = { pending: 0, uploading: 1, analyzing: 2, completed: 3 };
        const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // If same status, sort by submission time (oldest first)
        return a.submittedAt.getTime() - b.submittedAt.getTime();
      });
      
      setSubmissions(sorted);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setError('Failed to load video submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWaitTime = (submittedAt: Date) => {
    const now = new Date();
    const diff = now.getTime() - submittedAt.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h`;
  };

  const formatVideoSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown';
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return `${mb} MB`;
  };

  const handleDownloadAnalysis = async (submission: VideoSubmission) => {
    const url = resolveAnalyzedDownloadUrl(submission as any);
    if (!url) {
      alert('No analysis video available for this submission');
      return;
    }
    window.open(url, '_blank');
  };

  const handleDelete = async (submission: VideoSubmission) => {
    if (!confirm(`Are you sure you want to delete ${submission.playerName}'s video submission?\n\nThis will permanently remove the video from the system and cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`https://swing-platform.brianduryea.workers.dev/api/submission/${submission.submissionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Submission deleted successfully');
        // Refresh the list
        fetchSubmissions();
      } else {
        const error = await response.json();
        alert(`Failed to delete submission: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission. Please try again.');
    }
  };

  const handleAnalyze = async (submission: VideoSubmission) => {
    // Status update endpoint not implemented in worker yet - skip for now
    
    // Store the submission data to pass to analyzer
    console.log('Storing submission for analysis:', submission);
    // Use the Worker streaming endpoint - using r2Key instead of submissionId for the stream
    const videoUrl = `https://swing-platform.brianduryea.workers.dev/api/video/stream/${submission.r2Key}`;
    sessionStorage.setItem('selectedVideo', videoUrl);
    sessionStorage.setItem('selectedSubmission', JSON.stringify(submission));
    console.log('Navigating to analyzer with video URL:', videoUrl);
    navigate('/admin/analyzer');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SwingShopHeader />
      
      {/* Admin Navigation Bar */}
      <nav className="bg-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/admin')}
                className="hover:text-cyan-300"
              >
                Admin Dashboard
              </button>
              <button
                onClick={() => navigate('/admin/queue')}
                className="text-cyan-300 font-semibold"
              >
                Video Queue
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Stats Section */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-3xl font-bold text-gray-700">
                  {submissions.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-500">Pending Analysis</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-3xl font-bold text-amber-600">
                  {submissions.filter(s => s.status === 'uploading').length}
                </div>
                <div className="text-sm text-gray-500">Processing</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-3xl font-bold text-gray-700">
                  {submissions.filter(s => s.status === 'analyzing').length}
                </div>
                <div className="text-sm text-gray-500">Analyzing Now</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-3xl font-bold text-gray-700">
                  {submissions.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-3xl font-bold text-gray-700">
                  {submissions.length}
                </div>
                <div className="text-sm text-gray-500">Total Videos</div>
              </div>
            </div>
            
            {/* Refresh Button */}
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => fetchSubmissions()}
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Refreshing...' : 'Refresh Queue'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="p-6">
          {loading && !submissions.length ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
              Loading submissions from Cloudflare D1...
            </div>
          ) : submissions.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
              No pending video submissions at this time.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151' }}>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: '#9ca3af',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Wait Time
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: '#9ca3af',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Account Holder
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: '#9ca3af',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Video Size
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: '#9ca3af',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Coach
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: '#9ca3af',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Submitted
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    color: '#9ca3af',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Notes
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Action
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => (
                  <tr 
                    key={submission.id}
                    style={{ 
                      borderBottom: index < submissions.length - 1 ? '1px solid #374151' : 'none',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px', color: '#ffffff' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        backgroundColor: index === 0 ? '#dc2626' : index === 1 ? '#f59e0b' : '#374151',
                      }}>
                        {getWaitTime(submission.submittedAt)}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <p style={{ color: '#ffffff', margin: 0, fontWeight: '500' }}>
                          {submission.playerName}
                        </p>
                        <p style={{ color: '#6b7280', margin: 0, fontSize: '12px' }}>
                          ID: {submission.submissionId.slice(0, 8)}...
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#d1d5db' }}>
                      {formatVideoSize(submission.videoSize)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {submission.coachCode && submission.coachCode !== '000000' ? (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: '#1e40af',
                          color: '#ffffff'
                        }}>
                          {submission.coachCode}
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          General
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: '#9ca3af', fontSize: '14px' }}>
                      {submission.submittedAt.toLocaleDateString()} {submission.submittedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '16px', color: '#9ca3af', fontSize: '14px' }}>
                      <span style={{ 
                        display: 'block',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {submission.notes}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {(() => {
                        // Check if video is assigned to a coach and within 72-hour window
                        const isCoachAssigned = submission.coachCode && submission.coachCode !== '000000';
                        const hoursSinceSubmission = (Date.now() - submission.submittedAt.getTime()) / (1000 * 60 * 60);
                        const isWithinCoachWindow = isCoachAssigned && hoursSinceSubmission < 72;
                        const hoursRemaining = isWithinCoachWindow ? Math.ceil(72 - hoursSinceSubmission) : 0;

                        if (isWithinCoachWindow) {
                          return (
                            <div>
                              <button
                                disabled
                                style={{
                                  padding: '8px 20px',
                                  backgroundColor: '#4b5563',
                                  color: '#9ca3af',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'not-allowed',
                                  fontWeight: '500',
                                  fontSize: '14px',
                                  opacity: 0.5
                                }}
                                title={`Coach exclusive period - ${hoursRemaining}h remaining`}
                              >
                                Locked
                              </button>
                              <p style={{ 
                                color: '#9ca3af', 
                                fontSize: '11px', 
                                margin: '4px 0 0 0' 
                              }}>
                                {hoursRemaining}h left
                              </p>
                            </div>
                          );
                        }

                        // Handle different submission statuses
                        if (submission.status === 'completed') {
                          return (
                            <button
                              onClick={() => handleDownloadAnalysis(submission)}
                              style={{
                                padding: '8px 20px',
                                backgroundColor: '#3b82f6',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '14px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#3b82f6';
                              }}
                              title="Download analyzed video"
                            >
                              Download ↓
                            </button>
                          );
                        }

                        if (submission.status === 'uploading') {
                          return (
                            <button
                              disabled
                              style={{
                                padding: '8px 20px',
                                backgroundColor: '#fbbf24',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'not-allowed',
                                fontWeight: '500',
                                fontSize: '14px',
                                opacity: '0.7'
                              }}
                            >
                              ⏳ Processing...
                            </button>
                          );
                        }

                        return (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              onClick={() => handleAnalyze(submission)}
                              style={{
                                padding: '8px 20px',
                                backgroundColor: submission.status === 'analyzing' ? '#f59e0b' : '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '14px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = submission.status === 'analyzing' ? '#d97706' : '#059669';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = submission.status === 'analyzing' ? '#f59e0b' : '#10b981';
                              }}
                            >
                              {submission.status === 'analyzing' ? 'Continue →' : 'Analyze →'}
                            </button>
                            {submission.r2Key && (
                              <button
                                onClick={() => {
                                  const videoUrl = `https://swing-platform.brianduryea.workers.dev/api/video/stream/${submission.r2Key}`;
                                  const link = document.createElement('a');
                                  link.href = videoUrl;
                                  link.download = `${submission.playerName}-${submission.submissionId}.mp4`;
                                  link.target = '_blank';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: '#6b7280',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#4b5563';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#6b7280';
                                }}
                                title="Download original video"
                              >
                                ⬇
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(submission)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          border: '1px solid #ef4444',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef4444';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        title="Delete this submission"
                      >
                        Delete
                      </button>
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
};

export default NeedAnalysisPage;
