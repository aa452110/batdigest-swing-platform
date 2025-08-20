import React, { useState } from 'react';
import ComparisonVideoPlayer from '../modules/video/ComparisonVideoPlayer';
import SelectableRecorder from '../modules/recording/SelectableRecorder';
import ReferenceVideos from '../modules/video/ReferenceVideos';
import DrillVideos from '../modules/video/DrillVideos';
import VideoControlsSidebar from '../modules/video/VideoControlsSidebar';
import AnnotationToolbar from '../modules/annot/AnnotationToolbar';

const LoadVideoPage: React.FC = () => {
  const [setVideo2, setSetVideo2] = useState<((file: File) => void) | null>(null);
  const [setVideo1, setSetVideo1] = useState<((file: File) => void) | null>(null);
  const [videoState, setVideoState] = useState<any>(null);
  
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
      {/* Video player - DEAD CENTER */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <ComparisonVideoPlayer 
          onVideo1Change={setSetVideo1}
          onVideo2Change={setSetVideo2}
          onStateChange={setVideoState}
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
