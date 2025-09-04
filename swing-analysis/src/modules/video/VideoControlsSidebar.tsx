import React from 'react';
import { useComparisonStore } from '../../state/store';

interface VideoControlsSidebarProps {
  video1File: File | null;
  video2File: File | null;
  onVideo1Select: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideo2Select: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playback?: any;
  metadata?: any;
  onPlayPause?: () => void;
  onSeek?: (time: number) => void;
  onSeekByFrames?: (frames: number) => void;
  onPlaybackRateChange?: (rate: number) => void;
  viewMode?: string;
  video1Controls?: any;
  video2Controls?: any;
  submissionInfo?: any;
}

const VideoControlsSidebar: React.FC<VideoControlsSidebarProps> = ({
  video1File,
  video2File,
  onVideo1Select,
  onVideo2Select,
  playback,
  metadata,
  onPlayPause,
  onSeek,
  onSeekByFrames,
  onPlaybackRateChange,
  viewMode,
  video1Controls,
  video2Controls,
  submissionInfo
}) => {
  const { viewMode: storeViewMode, setViewMode } = useComparisonStore();
  const currentViewMode = viewMode || storeViewMode;

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentFrame = (currentTime: number, fps: number = 30): number => {
    return Math.floor(currentTime * fps);
  };

  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-y-auto">
      {/* Submission Info */}
      {submissionInfo && (
        <div className="bg-gray-800 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Submission Details</h3>
          
          {(submissionInfo.athleteName || submissionInfo.playerName) && (
            <div className="mb-2">
              <div className="text-xs text-gray-500">Account Holder</div>
              <div className="text-sm text-white">{submissionInfo.athleteName || submissionInfo.playerName}</div>
            </div>
          )}
          
          {(submissionInfo.userName || submissionInfo.submissionId) && (
            <div className="mb-2">
              <div className="text-xs text-gray-500">{submissionInfo.userName ? 'Submitted by' : 'Submission ID'}</div>
              <div className="text-sm text-white">{submissionInfo.userName || submissionInfo.submissionId}</div>
            </div>
          )}
          
          {(submissionInfo.createdAt || submissionInfo.submittedAt) && (
            <div className="mb-2">
              <div className="text-xs text-gray-500">Date</div>
              <div className="text-sm text-white">
                {new Date(submissionInfo.createdAt || submissionInfo.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
          
          {submissionInfo.coachCode && (
            <div className="mb-2">
              <div className="text-xs text-gray-500">Coach Code</div>
              <div className="text-sm text-white">{submissionInfo.coachCode}</div>
            </div>
          )}
          
          {submissionInfo.videoSize && (
            <div className="mb-2">
              <div className="text-xs text-gray-500">Video Size</div>
              <div className="text-sm text-white">{(submissionInfo.videoSize / (1024 * 1024)).toFixed(1)} MB</div>
            </div>
          )}
          
          {submissionInfo.cameraAngle && (
            <div className="mb-2">
              <div className="text-xs text-gray-500">Camera Angle</div>
              <div className="text-sm text-white">{submissionInfo.cameraAngle}</div>
            </div>
          )}
          
          {submissionInfo.notes && (
            <div className="mb-2">
              <div className="text-xs text-gray-500">Notes</div>
              <div className="text-sm text-gray-300">{submissionInfo.notes}</div>
            </div>
          )}
          
          {/* What they're looking for */}
          {(submissionInfo.wantsBatAdvice || submissionInfo.wantsDrills || submissionInfo.wantsMechanics) && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">Looking for</div>
              <div className="space-y-1">
                {submissionInfo.wantsMechanics && (
                  <div className="text-xs text-cyan-400">✓ Mechanics feedback</div>
                )}
                {submissionInfo.wantsDrills && (
                  <div className="text-xs text-cyan-400">✓ Drill recommendations</div>
                )}
                {submissionInfo.wantsBatAdvice && (
                  <div className="text-xs text-cyan-400">✓ Bat recommendations</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Video Info */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Video Files</h3>
        {video1File && (
          <div className="mb-2">
            <div className="text-xs text-gray-400 mb-1">
              Video 1: {video1File.name}
            </div>
            {submissionInfo?.submissionId && (
              <button
                onClick={() => {
                  // Get the original video URL from sessionStorage
                  const selectedVideo = sessionStorage.getItem('selectedVideo');
                  if (selectedVideo) {
                    // Create a download link
                    const link = document.createElement('a');
                    link.href = selectedVideo;
                    link.download = video1File.name || `submission-${submissionInfo.submissionId}.mp4`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                title="Download original submitted video"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Download Original
              </button>
            )}
          </div>
        )}
        {video2File && (
          <div className="text-xs text-gray-400">
            Video 2: {video2File.name}
          </div>
        )}
        {!video1File && !video2File && (
          <div className="text-xs text-gray-500">
            No videos loaded
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoControlsSidebar;