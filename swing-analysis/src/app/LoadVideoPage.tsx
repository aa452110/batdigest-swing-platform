import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ComparisonVideoPlayer from '../modules/video/ComparisonVideoPlayer';
import SelectableRecorder from '../modules/recording/SelectableRecorder';
import ReferenceVideos from '../modules/video/ReferenceVideos';
import DrillVideos from '../modules/video/DrillVideos';
import VideoControlsSidebar from '../modules/video/VideoControlsSidebar';
import VideoControlsBottom from '../modules/video/VideoControlsBottom';
import AnnotationToolbar from '../modules/annot/AnnotationToolbar';
import { CropCommunicator } from '../modules/recording/recordingFunctions/cropCommunication';

const LoadVideoPage: React.FC = () => {
  const navigate = useNavigate();
  const [setVideo2, setSetVideo2] = useState<((file: File) => void) | null>(null);
  const [setVideo1, setSetVideo1] = useState<((file: File) => void) | null>(null);
  const [videoState, setVideoState] = useState<any>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [submissionInfo, setSubmissionInfo] = useState<any>(null);
  const [analysisSaved, setAnalysisSaved] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number>(window.innerWidth);
  const cropCommunicatorRef = useRef<CropCommunicator | null>(null);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Start crop communication when video loads
  useEffect(() => {
    if (videoLoaded) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const videoPlayerElement = document.getElementById('video-container-actual');
        if (videoPlayerElement) {
          if (!cropCommunicatorRef.current) {
            // Use a fixed session ID so analyzer and recorder connect to same channel
            cropCommunicatorRef.current = new CropCommunicator('analyzer-session');
          }
          cropCommunicatorRef.current.startSending(videoPlayerElement);
          console.log('[LoadVideoPage] Started crop communication for video-container-actual');
        } else {
          console.log('[LoadVideoPage] video-container-actual not found yet');
        }
      }, 100);
    }
    
    return () => {
      if (cropCommunicatorRef.current) {
        cropCommunicatorRef.current.stop();
      }
    };
  }, [videoLoaded]);

  // TEMPORARILY DISABLED - No scaling for testing
  const centerScale = 1; // Always 100% scale
  
  // Move video up higher on the page (35% from top instead of 50%)
  const topPosition = '35%';
  
  // Add warning for page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning if we have videos loaded AND analysis hasn't been saved
      if (videoState && (videoState.video1File || videoState.video2File) && !analysisSaved) {
        e.preventDefault();
        e.returnValue = 'You will lose all your progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [videoState, analysisSaved]);
  
  // Memoize callbacks to prevent infinite loops
  const handleVideo1Change = useCallback((fn: (file: File) => void) => {
    // REMOVED LOG - console.log('Received setVideo1 function from ComparisonVideoPlayer');
    setSetVideo1(() => fn);
  }, []);
  
  const handleVideo2Change = useCallback((fn: (file: File) => void) => {
    setSetVideo2(() => fn);
  }, []);
  
  const handleStateChange = useCallback((state: any) => {
    setVideoState(state);
  }, []);
  
  // Check if we have a video from the queue and load it when setVideo1 becomes available
  useEffect(() => {
    // Don't run if we've already loaded the video
    if (videoLoaded) return;
    
    const selectedVideo = sessionStorage.getItem('selectedVideo');
    const selectedSubmission = sessionStorage.getItem('selectedSubmission');
    
    // Parse submission info
    if (selectedSubmission && !submissionInfo) {
      try {
        const parsed = JSON.parse(selectedSubmission);
        setSubmissionInfo(parsed);
        // REMOVED LOG - console.log('Parsed submission info:', parsed);
      } catch (e) {
        console.error('Failed to parse submission info:', e);
      }
    }
    
    // REMOVED LOG - console.log('Queue video check:', {
    //   selectedVideo,
    //   selectedSubmission,
    //   setVideo1Available: !!setVideo1
    // });
    
    // REMOVED LOG - Log all sessionStorage keys for debugging
    // REMOVED LOG - console.log('All sessionStorage keys:', Object.keys(sessionStorage));
    // REMOVED LOG - for (let i = 0; i < sessionStorage.length; i++) {
    //   const key = sessionStorage.key(i);
    //   if (key) {
    //     console.log(`sessionStorage['${key}']:`, sessionStorage.getItem(key));
    //   }
    // }
    
    if (selectedVideo && setVideo1) {
      // REMOVED LOG - console.log('Loading video from queue:', selectedVideo);
      setVideoLoaded(true); // Mark as loaded to prevent re-runs
      setLoadingVideo(true);
      setLoadingProgress(0);
      
      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setLoadingProgress(Math.round(percentComplete));
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response;
          // REMOVED LOG - console.log('Video blob loaded, size:', blob.size);
          const file = new File([blob], selectedVideo.split('/').pop() || 'video.mov', {
            type: 'video/quicktime'
          });
          // REMOVED LOG - console.log('Setting video1 with file:', file.name);
          setVideo1(file);
          setLoadingVideo(false);
          setLoadingProgress(100);
          
          // DON'T clear session storage - we need it for the upload later!
          // REMOVED LOG - console.log('Keeping submission data in sessionStorage for later upload');
        } else {
          console.error('Failed to load video:', xhr.status);
          setLoadingVideo(false);
          setVideoLoaded(false); // Reset on error so we can retry
        }
      };
      
      xhr.onerror = () => {
        console.error('Error loading video');
        setLoadingVideo(false);
        setVideoLoaded(false); // Reset on error so we can retry
      };
      
      xhr.open('GET', selectedVideo);
      xhr.responseType = 'blob';
      xhr.send();
    }
  }, [setVideo1, videoLoaded]);
  
  return (
    <div id="analysis-root" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#111827',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Video player - responsive positioning */}
      <div 
        id="video-player-wrapper"
        style={{
          position: 'absolute',
          left: '50%',
          top: topPosition,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div 
          id="video-player-scaled"
          style={{ transform: `scale(${centerScale})`, transformOrigin: 'top center' }}
        >
          <ComparisonVideoPlayer 
            onVideo1Change={handleVideo1Change}
            onVideo2Change={handleVideo2Change}
            onStateChange={handleStateChange}
          />
        </div>
        
        {/* Loading Overlay */}
        {loadingVideo && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            borderRadius: '8px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '40px'
            }}>
              {/* Spinner */}
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #374151',
                borderTop: '4px solid #10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              
              {/* Loading Text */}
              <h3 style={{
                color: '#10b981',
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                Loading Video
              </h3>
              
              {/* Progress Percentage */}
              <div style={{
                color: '#9ca3af',
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                {loadingProgress}%
              </div>
              
              {/* Progress Bar */}
              <div style={{
                width: '300px',
                height: '8px',
                backgroundColor: '#374151',
                borderRadius: '4px',
                overflow: 'hidden',
                margin: '0 auto'
              }}>
                <div style={{
                  width: `${loadingProgress}%`,
                  height: '100%',
                  backgroundColor: '#10b981',
                  transition: 'width 0.3s ease',
                  borderRadius: '4px'
                }}></div>
              </div>
              
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                marginTop: '15px'
              }}>
                Please wait while we load your video...
              </p>
            </div>
            
            {/* CSS for spinner animation */}
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>
      
      {/* Sidebar - fixed to left, 225px wide */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '225px',
        height: '100vh',
        backgroundColor: '#1f2937',
        overflowY: 'auto',
        padding: '10px'
      }}>
        {/* Logo at top of left sidebar */}
        <div style={{
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #374151'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="/swing-shop-icon.png" 
              alt="Swing Shop" 
              style={{ width: '32px', height: '32px' }}
            />
            <div>
              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}>
                Swing Shop
              </div>
              <div style={{ color: '#6b7280', fontSize: '10px' }}>
                A BatDigest.com Initiative
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <SelectableRecorder onAnalysisSaved={() => setAnalysisSaved(true)} />
          
          {/* VIDEO 2 Header */}
          <div className="px-4">
            <h2 className="text-lg font-bold text-cyan-400 mb-2">ADD VIDEO 2</h2>
          </div>
          
          <ReferenceVideos 
            onSelectVideo={(file) => {
              // REMOVED LOG - console.log('ReferenceVideos onSelectVideo called, setVideo2:', !!setVideo2);
              if (setVideo2) {
                // REMOVED LOG - console.log('Setting video2 with file:', file.name);
                setVideo2(file);
              } else {
                console.warn('setVideo2 is null - video comparison not ready yet');
                alert('Please wait for the video player to initialize before loading reference videos.');
              }
            }}
          />
          <DrillVideos 
            onSelectVideo={(file) => {
              if (setVideo2) {
                setVideo2(file);
              }
            }}
          />
          
        </div>
      </div>
      
      {/* Right Sidebar - Video Controls - 225px wide */}
      <div style={{
        position: 'fixed',
        right: 0,
        top: 0,
        width: '225px',
        height: '100vh',
        backgroundColor: '#1f2937',
        overflowY: 'auto',
        borderLeft: '1px solid #374151'
      }}>
        {/* Back to Queue button at top of right sidebar */}
        <div style={{
          padding: '10px',
          borderBottom: '1px solid #374151'
        }}>
          <button
            onClick={() => {
              // Only show warning if analysis hasn't been saved
              if (!analysisSaved && videoState && (videoState.video1File || videoState.video2File)) {
                const confirmLeave = window.confirm('You will lose all your progress. Are you sure you want to go back to the queue?');
                if (!confirmLeave) {
                  return;
                }
              }
              
              // Route back based on current path
              const currentPath = window.location.pathname;
              if (currentPath.includes('/coach/')) {
                navigate('/coach/queue');
              } else if (currentPath.includes('/admin/')) {
                navigate('/admin/queue');
              } else {
                // Fallback - check for coach token
                const coachToken = localStorage.getItem('coachToken');
                navigate(coachToken ? '/coach/queue' : '/admin/queue');
              }
            }}
            style={{
              width: '100%',
              padding: '8px 16px',
              backgroundColor: '#374151',
              color: '#9ca3af',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563';
              e.currentTarget.style.color = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            ← Back to Queue
          </button>
        </div>
        
        {videoState && (
          <VideoControlsSidebar 
            video1File={videoState.video1File}
            video2File={videoState.video2File}
            onVideo1Select={videoState.handleVideo1Select}
            onVideo2Select={videoState.handleVideo2Select}
            playback={videoState.playback}
            metadata={videoState.metadata}
            onPlayPause={videoState.handlePlayPause}
            onSeek={videoState.handleSeek}
            onSeekByFrames={videoState.handleSeekByFrames}
            onPlaybackRateChange={videoState.handlePlaybackRateChange}
            viewMode={videoState.viewMode}
            video1Controls={videoState.video1Controls}
            video2Controls={videoState.video2Controls}
            submissionInfo={submissionInfo}
          />
        )}
      </div>
      
      {/* Annotation Toolbar - fixed to bottom, between sidebars */}
      {videoState && (videoState.video1File || videoState.video2File) && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '225px',
          right: '225px',
          backgroundColor: '#1f2937',
          borderTop: '1px solid #374151'
        }}>
          <VideoControlsBottom
            video1File={videoState.video1File}
            video2File={videoState.video2File}
            video1Controls={videoState.video1Controls}
            video2Controls={videoState.video2Controls}
            viewMode={videoState.viewMode}
          />
          <div style={{ padding: '10px' }}>
            <AnnotationToolbar />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadVideoPage;
