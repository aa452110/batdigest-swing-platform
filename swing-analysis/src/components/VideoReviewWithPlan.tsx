import React, { useState, useRef, useEffect } from 'react';
import HittingPlanBuilder from './HittingPlanBuilder';

interface RecordedSegment {
  id: string;
  blob: Blob;
  duration: number;
  url: string;
}

interface VideoReviewWithPlanProps {
  segment: RecordedSegment;
  submission: any;
  onApprove: (segment: RecordedSegment, hittingPlan: any) => void;
  onCancel: () => void;
  isUploading: boolean;
}

export default function VideoReviewWithPlan({ 
  segment, 
  submission,
  onApprove, 
  onCancel,
  isUploading 
}: VideoReviewWithPlanProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hittingPlan, setHittingPlan] = useState<any>(null);
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);

  useEffect(() => {
    // Create object URL for video preview
    if (videoRef.current) {
      videoRef.current.src = segment.url;
    }
  }, [segment.url]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlanComplete = (plan: any) => {
    setHittingPlan(plan);
    setShowPlanBuilder(false);
  };

  const handleApprove = () => {
    onApprove(segment, hittingPlan);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-800 p-4 rounded-t-lg border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Review Analysis</h2>
              <p className="text-sm text-gray-400 mt-1">
                Athlete: {submission?.playerName || 'Unknown'} • Duration: {formatTime(segment.duration)}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Video Preview Section */}
          <div className="mb-6">
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                className="w-full max-h-[400px] object-contain"
                onTimeUpdate={handleTimeUpdate}
                controls={false}
              />
            </div>
            
            {/* Video Controls */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayPause}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Play
                    </>
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-600 h-full transition-all"
                        style={{ width: `${(currentTime / segment.duration) * 100}%` }}
                      />
                    </div>
                    <span>{formatTime(segment.duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hitting Plan Section */}
          <div className="mb-6">
            {!showPlanBuilder && !hittingPlan ? (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">7-Day Hitting Plan</h3>
                <p className="text-gray-400 mb-4">Create a personalized training plan for this athlete</p>
                <button
                  onClick={() => setShowPlanBuilder(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Build Hitting Plan
                </button>
              </div>
            ) : showPlanBuilder ? (
              <div>
                <HittingPlanBuilder onPlanComplete={handlePlanComplete} />
                <button
                  onClick={() => setShowPlanBuilder(false)}
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel Plan
                </button>
              </div>
            ) : hittingPlan ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">7-Day Hitting Plan ✓</h3>
                  <button
                    onClick={() => setShowPlanBuilder(true)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Edit Plan
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {hittingPlan.map((day: any) => (
                    <div key={day.day} className="bg-gray-900 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">{day.dayName}</div>
                      <div className="text-white font-bold">{day.drills.length}</div>
                      <div className="text-xs text-gray-500">drills</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-gray-400">
                  Total: {hittingPlan.reduce((sum: number, day: any) => sum + day.drills.length, 0)} drills across 7 days
                </div>
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400">
              {!hittingPlan && (
                <span className="text-yellow-400">⚠️ No hitting plan created yet</span>
              )}
              {hittingPlan && (
                <span className="text-green-400">✓ Hitting plan ready</span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isUploading}
                className={`px-6 py-2 ${
                  isUploading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white rounded-lg transition-colors flex items-center gap-2`}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve & Send to Player
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}