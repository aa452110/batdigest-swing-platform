import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ComparisonVideoPlayer from '../modules/video/ComparisonVideoPlayer';
import SelectableRecorder from '../modules/recording/SelectableRecorder';
import ReferenceVideos from '../modules/video/ReferenceVideos';
import DrillVideos from '../modules/video/DrillVideos';
import VideoControlsSidebar from '../modules/video/VideoControlsSidebar';
import AnnotationToolbar from '../modules/annot/AnnotationToolbar';

const LoadVideoPage: React.FC = () => {
  const navigate = useNavigate();
  const [setVideo2, setSetVideo2] = useState<((file: File) => void) | null>(null);
  const [setVideo1, setSetVideo1] = useState<((file: File) => void) | null>(null);
  const [videoState, setVideoState] = useState<any>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Memoize callbacks to prevent infinite loops
  const handleVideo1Change = useCallback((fn: (file: File) => void) => {
    console.log('Received setVideo1 function from ComparisonVideoPlayer');
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
    
    console.log('Queue video check:', {
      selectedVideo,
      selectedSubmission,
      setVideo1Available: !!setVideo1
    });
    
    // Log all sessionStorage keys for debugging
    console.log('All sessionStorage keys:', Object.keys(sessionStorage));
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      console.log(`sessionStorage['${key}']:`, sessionStorage.getItem(key));
    }
    
    if (selectedVideo && setVideo1) {
      console.log('Loading video from queue:', selectedVideo);
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
          console.log('Video blob loaded, size:', blob.size);
          const file = new File([blob], selectedVideo.split('/').pop() || 'video.mov', {
            type: 'video/quicktime'
          });
          console.log('Setting video1 with file:', file.name);
          setVideo1(file);
          setLoadingVideo(false);
          setLoadingProgress(100);
          
          // DON'T clear session storage - we need it for the upload later!
          console.log('Keeping submission data in sessionStorage for later upload');
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
    <div style={{
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
      {/* Logo Header */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 100,
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid #374151'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            backgroundColor: '#374151',
            color: '#9ca3af',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Queue
        </button>
        <img 
          src="/500-swing-icon.png" 
          alt="$500 Swing" 
          style={{ 
            width: '32px', 
            height: '32px',
            objectFit: 'contain'
          }} 
        />
        <span style={{ 
          color: '#10b981', 
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          $500 Swing Analysis
        </span>
      </div>
      {/* Video player - DEAD CENTER */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <ComparisonVideoPlayer 
          onVideo1Change={handleVideo1Change}
          onVideo2Change={handleVideo2Change}
          onStateChange={handleStateChange}
        />
        
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
        <div className="space-y-4">
          <SelectableRecorder />
          <ReferenceVideos 
            onSelectVideo={(file) => {
              console.log('ReferenceVideos onSelectVideo called, setVideo2:', !!setVideo2);
              if (setVideo2) {
                console.log('Setting video2 with file:', file.name);
                setVideo2(file);
                // Show helpful message about viewing the reference video
                setTimeout(() => {
                  if (videoState && videoState.video1File) {
                    alert('Reference video loaded! Click "Split View" or "Video 2" button above the video to see it.');
                  } else {
                    alert('Reference video loaded! Click "Video 2" button above the video to see it.');
                  }
                }, 500);
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
          padding: '10px',
          borderTop: '1px solid #374151'
        }}>
          <AnnotationToolbar />
        </div>
      )}
    </div>
  );
};

export default LoadVideoPage;
