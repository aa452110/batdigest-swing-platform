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
    // Don't run if we've alreadpy loaded the video
    if (videoLoaded) return;
    
    const selectedVideo = sessionStorage.getItem('selectedVideo');
    const selectedSubmission = sessionStorage.getItem('selectedSubmission');
    
    console.log('Queue video check:', {
      selectedVideo,
      selectedSubmission,
      setVideo1Available: !!setVideo1
    });
    
    if (selectedVideo && setVideo1) {
      console.log('Loading video from queue:', selectedVideo);
      setVideoLoaded(true); // Mark as loaded to prevent re-runs
      
      // Load the video from the queue
      fetch(selectedVideo)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch video: ${res.status}`);
          return res.blob();
        })
        .then(blob => {
          console.log('Video blob loaded, size:', blob.size);
          const file = new File([blob], selectedVideo.split('/').pop() || 'video.mov', {
            type: 'video/quicktime'
          });
          console.log('Setting video1 with file:', file.name);
          setVideo1(file);
          
          // Clear session storage after successful loading
          sessionStorage.removeItem('selectedVideo');
          sessionStorage.removeItem('selectedSubmission');
        })
        .catch(err => {
          console.error('Error loading video:', err);
          setVideoLoaded(false); // Reset on error so we can retry
        });
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
              if (setVideo2) {
                setVideo2(file);
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
