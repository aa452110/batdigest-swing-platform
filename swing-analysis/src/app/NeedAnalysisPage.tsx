import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { VideoSubmission as ApiSubmission } from '../services/api';

interface VideoSubmission {
  id: string;
  submissionId: string;
  playerName: string;
  teamName: string;
  submittedAt: Date;
  videoPath: string;
  r2Key: string;
  status: 'pending' | 'analyzing' | 'completed';
  notes: string;
  videoSize: number;
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
      const data = await api.getPendingSubmissions();
      
      // Transform API data to our format
      const transformed: VideoSubmission[] = data.map((sub: ApiSubmission) => ({
        id: sub.id.toString(),
        submissionId: sub.submissionId,
        playerName: sub.athleteName || 'Unknown Athlete',
        teamName: `User ${sub.userId}`, // We'll enhance this later
        submittedAt: new Date(sub.createdAt),
        videoPath: sub.r2Key,
        r2Key: sub.r2Key,
        status: sub.status === 'pending' ? 'pending' : 
                sub.status === 'analyzing' ? 'analyzing' : 'completed',
        notes: sub.notes || 'No notes provided',
        videoSize: sub.videoSize || 0,
      }));

      // Sort by oldest first (longest waiting)
      const sorted = transformed.sort((a, b) => 
        a.submittedAt.getTime() - b.submittedAt.getTime()
      );
      
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

  const handleAnalyze = async (submission: VideoSubmission) => {
    // Try to update status to analyzing (Worker endpoint doesn't exist yet, so this will fail but that's OK)
    try {
      await api.updateSubmissionStatus(submission.submissionId, 'analyzing');
    } catch (error) {
      console.log('Status update failed (expected - endpoint not implemented):', error);
    }
    
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#111827',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#1f2937',
        borderBottom: '1px solid #374151',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/500-swing-icon.png" 
            alt="$500 Swing" 
            style={{ width: '40px', height: '40px' }} 
          />
          <div>
            <h1 style={{ 
              color: '#10b981', 
              fontSize: '24px', 
              fontWeight: 'bold',
              margin: 0 
            }}>
              $500 Swing Analysis Queue
            </h1>
            <p style={{ 
              color: '#9ca3af', 
              fontSize: '14px',
              margin: 0 
            }}>
              {loading ? 'Loading...' : 
               error ? 'Error loading submissions' :
               `${submissions.filter(s => s.status === 'pending').length} videos awaiting analysis`}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>
            Coach Mode - Live Data
          </span>
          <button 
            style={{
              padding: '8px 16px',
              backgroundColor: '#374151',
              color: '#d1d5db',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onClick={() => fetchSubmissions()}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Queue'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px',
          marginBottom: '32px' 
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
              PENDING ANALYSIS
            </p>
            <p style={{ color: '#10b981', fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>
              {submissions.filter(s => s.status === 'pending').length}
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
              TOTAL VIDEOS
            </p>
            <p style={{ color: '#f59e0b', fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>
              {submissions.length}
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
              ANALYZING NOW
            </p>
            <p style={{ color: '#3b82f6', fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>
              {submissions.filter(s => s.status === 'analyzing').length}
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
              LONGEST WAIT
            </p>
            <p style={{ color: '#ef4444', fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>
              {submissions.length > 0 ? getWaitTime(submissions[0].submittedAt) : '0h'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
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
                    Athlete
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default NeedAnalysisPage;