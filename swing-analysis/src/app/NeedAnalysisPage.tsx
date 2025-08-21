import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface VideoSubmission {
  id: string;
  playerName: string;
  teamName: string;
  submittedAt: Date;
  videoPath: string;
  status: 'pending' | 'in-progress' | 'completed';
  notes: string;
}

const NeedAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<VideoSubmission[]>([]);

  useEffect(() => {
    // Mock data for now - will be replaced with DB fetch
    const mockSubmissions: VideoSubmission[] = [
      {
        id: '1',
        playerName: 'Johnny Martinez',
        teamName: 'Eagles U14',
        submittedAt: new Date('2025-08-19T10:30:00'),
        videoPath: '/user_videos/IMG_1224.mov',
        status: 'pending',
        notes: 'Check stance and follow through'
      },
      {
        id: '2',
        playerName: 'Mike Thompson',
        teamName: 'Tigers Travel',
        submittedAt: new Date('2025-08-19T14:15:00'),
        videoPath: '/user_videos/test.mov',
        status: 'pending',
        notes: 'Parents concerned about hip rotation'
      },
      {
        id: '3',
        playerName: 'Alex Rodriguez Jr.',
        teamName: 'Wildcats Elite',
        submittedAt: new Date('2025-08-20T08:00:00'),
        videoPath: '/user_videos/IMG_1224.mov',
        status: 'pending',
        notes: 'Exit velo dropped 5mph last month'
      },
      {
        id: '4',
        playerName: 'Tommy Chen',
        teamName: 'Eagles U14',
        submittedAt: new Date('2025-08-20T09:45:00'),
        videoPath: '/user_videos/test.mov',
        status: 'pending',
        notes: 'Struggling with inside pitches'
      },
      {
        id: '5',
        playerName: 'Carlos Santana',
        teamName: 'Storm 16U',
        submittedAt: new Date('2025-08-20T11:20:00'),
        videoPath: '/user_videos/IMG_1224.mov',
        status: 'pending',
        notes: 'College scout requested analysis'
      }
    ];

    // Sort by oldest first (longest waiting)
    const sorted = mockSubmissions.sort((a, b) => 
      a.submittedAt.getTime() - b.submittedAt.getTime()
    );
    
    setSubmissions(sorted);
  }, []);

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

  const handleAnalyze = (submission: VideoSubmission) => {
    // Store the video path in sessionStorage to pass to analyzer
    console.log('Storing video for analysis:', submission.videoPath);
    sessionStorage.setItem('selectedVideo', submission.videoPath);
    sessionStorage.setItem('selectedSubmission', JSON.stringify(submission));
    console.log('Navigating to analyzer...');
    navigate('/analyzer');
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
              {submissions.filter(s => s.status === 'pending').length} videos awaiting analysis
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>
            Coach Mode
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
            onClick={() => window.location.reload()}
          >
            Refresh Queue
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
              AVG WAIT TIME
            </p>
            <p style={{ color: '#f59e0b', fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>
              2.4h
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
              COMPLETED TODAY
            </p>
            <p style={{ color: '#3b82f6', fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>
              12
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

        {/* Table */}
        <div style={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
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
                  Player
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left',
                  color: '#9ca3af',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  Team
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
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#d1d5db' }}>
                    {submission.teamName}
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
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#10b981';
                      }}
                    >
                      Analyze →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NeedAnalysisPage;