import React, { useRef, useState, useCallback, useEffect } from 'react';
import VideoReviewWithPlan from '../../components/VideoReviewWithPlan';

const SelectableRecorder: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedSegments, setRecordedSegments] = useState<any[]>([]);
  const [reviewingSegment, setReviewingSegment] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  
  // Selection box position and size
  const [selectionBox, setSelectionBox] = useState({
    x: window.innerWidth / 2 - 640,
    y: window.innerHeight / 2 - 360,
    width: 1280,
    height: 720
  });

  // Function to draw cropped area to canvas
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.readyState < 2) return;

    // Output dimensions
    const cw = 1280;
    const ch = 720;
    if (canvas.width !== cw) canvas.width = cw;
    if (canvas.height !== ch) canvas.height = ch;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get actual screen dimensions
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    
    // Calculate scale factor between screen capture and actual display
    // Account for device pixel ratio on retina displays
    const devicePixelRatio = window.devicePixelRatio || 1;
    const scaleX = vw / (window.innerWidth * devicePixelRatio);
    const scaleY = vh / (window.innerHeight * devicePixelRatio);
    
    // Log this info once
    if (!window.scaleLogged) {
      console.log('Screen capture:', vw, 'x', vh);
      console.log('Window inner:', window.innerWidth, 'x', window.innerHeight);
      console.log('Device pixel ratio:', devicePixelRatio);
      console.log('Scale factors:', scaleX, scaleY);
      console.log('Selection box CSS pixels:', selectionBox.width, 'x', selectionBox.height);
      console.log('Selection box position:', selectionBox.x, selectionBox.y);
      window.scaleLogged = true;
    }
    
    // Convert selection box coordinates to video coordinates
    const sx = selectionBox.x * scaleX * devicePixelRatio;
    const sy = selectionBox.y * scaleY * devicePixelRatio;
    const sw = selectionBox.width * scaleX * devicePixelRatio;
    const sh = selectionBox.height * scaleY * devicePixelRatio;
    
    // Draw the selected area to canvas, scaled to output size
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
  }, [selectionBox]);

  // Animation loop
  const startDrawing = useCallback(() => {
    const draw = () => {
      drawFrame();
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, [drawFrame]);

  const stopDrawing = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const startSelecting = () => {
    setIsSelecting(true);
  };

  const confirmSelection = () => {
    setIsSelecting(false);
    setHasSelected(true);
    console.log('Recording area selected:', selectionBox);
  };

  const uploadAnalysis = async (segment: any, hittingPlan: any = null) => {
    try {
      setIsUploading(true);
      setUploadStatus('Preparing upload...');
      
      // Get submission info from session storage
      const submissionData = sessionStorage.getItem('selectedSubmission');
      console.log('Submission data from storage:', submissionData);
      
      // If no submission data, create a default one for testing
      let submission;
      if (!submissionData) {
        console.warn('No submission data found in sessionStorage, using fallback');
        // Try to extract submission ID from the video URL if it exists
        const videoUrl = sessionStorage.getItem('selectedVideo');
        if (videoUrl && videoUrl.includes('/api/video/stream/')) {
          const submissionId = videoUrl.split('/').pop();
          submission = { 
            submissionId,
            playerName: 'Unknown Player'
          };
        } else {
          throw new Error('No submission data found and cannot extract from video URL');
        }
      } else {
        submission = JSON.parse(submissionData);
      }
      
      console.log('Using submission:', submission);
      console.log('Hitting plan:', hittingPlan);
      
      // Generate unique ID for analysis video
      const analysisId = `analysis-${submission.submissionId}-${Date.now()}`;
      const fileName = `${analysisId}.webm`;
      
      // Step 1: Create FormData for Stream upload
      setUploadStatus('Preparing video for upload...');
      const formData = new FormData();
      formData.append('video', new Blob([segment.blob], { type: 'video/webm' }), fileName);
      formData.append('submissionId', submission.submissionId);
      formData.append('athleteName', submission.playerName || 'Unknown Athlete');
      
      // Add hitting plan if provided
      if (hittingPlan) {
        formData.append('hittingPlan', JSON.stringify(hittingPlan));
      }
      
      // Step 2: Upload to Cloudflare Stream via Worker
      setUploadStatus('Uploading to Cloudflare Stream for iPhone compatibility...');
      const uploadResponse = await fetch('https://swing-platform.brianduryea.workers.dev/api/analysis/upload-to-stream', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Stream upload failed:', errorText);
        throw new Error('Failed to upload video to Stream');
      }
      
      const streamResponse = await uploadResponse.json();
      console.log('Stream upload successful:', streamResponse);
      const { streamUID, mp4Url, downloadUrl } = streamResponse;
      
      // The Worker will handle the Stream API call and return the Stream ID
      // Stream will convert WebM to MP4 automatically
      
      // Step 3: Update submission with analysis
      setUploadStatus('Updating submission...');
      const updateResponse = await fetch('https://swing-platform.brianduryea.workers.dev/api/submission/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.submissionId,
          analysisVideoKey: streamUID,  // Using Stream UID as the key
          analysisDuration: segment.duration,
          coachNotes: 'Analysis completed via Cloudflare Stream'
        })
      });
      
      if (!updateResponse.ok) throw new Error('Failed to update submission');
      
      setUploadStatus('✅ Analysis uploaded! Converting to MP4 for iPhone...');
      
      // Clear session and redirect after success
      setTimeout(() => {
        sessionStorage.removeItem('selectedVideo');
        sessionStorage.removeItem('selectedSubmission');
        window.location.href = '/';
      }, 2000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus(`❌ Upload failed: ${error.message}`);
      setIsUploading(false);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      // Get screen capture (no audio - Chrome limitation)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: false  // Can't get system audio when screen sharing
      });

      displayStreamRef.current = displayStream;

      // Set up video element to receive screen
      const video = videoRef.current;
      if (!video) throw new Error('Video element not found');
      
      video.srcObject = displayStream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          console.log('Screen capture ready:', video.videoWidth, 'x', video.videoHeight);
          resolve(true);
        };
      });
      
      await video.play();

      // Set canvas size
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not initialized');
      
      canvas.width = 1280;
      canvas.height = 720;

      // Start drawing cropped frames to canvas
      setTimeout(() => {
        startDrawing();
      }, 100);

      // Get canvas stream
      const canvasStream = canvas.captureStream(30);

      // Create combined stream with video and audio
      const combinedStream = new MediaStream();
      
      // Add video track from canvas
      canvasStream.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track);
      });
      
      // No system audio available when screen sharing (Chrome limitation)
      console.log('System audio not available when screen sharing');

      // Try to get microphone audio and add it too
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          } 
        });
        audioStreamRef.current = audioStream;
        
        // Add microphone audio tracks
        audioStream.getAudioTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
        console.log('Microphone audio captured');
      } catch (audioError) {
        console.warn('No microphone available:', audioError);
      }

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm;codecs=vp8';
      
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6000000,
      });

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Instead of immediately adding to segments, show review modal
        const segment = {
          id: Date.now().toString(),
          url,
          blob,
          duration: recordingDuration,
        };
        
        setReviewingSegment(segment);
        setShowReview(true);

        // Cleanup
        stopDrawing();
        
        if (displayStreamRef.current) {
          displayStreamRef.current.getTracks().forEach(track => track.stop());
          displayStreamRef.current = null;
        }
        
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        }
        
        if (video) {
          video.srcObject = null;
        }
      };

      // Handle display stream ending
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      
      // Start duration timer
      recordingStartTimeRef.current = Date.now();
      pausedDurationRef.current = 0;
      
      const timer = setInterval(() => {
        const recorder = mediaRecorderRef.current;
        if (!recorder) {
          clearInterval(timer);
          return;
        }
        
        // Only update timer if actively recording (not paused)
        if (recorder.state === 'recording') {
          const elapsed = Date.now() - recordingStartTimeRef.current - pausedDurationRef.current;
          setRecordingDuration(Math.floor(elapsed / 1000));
        }
      }, 1000);
      
      recordingTimerRef.current = timer;

    } catch (error: any) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      stopDrawing();
    }
  }, [selectionBox, recordingDuration, startDrawing, stopDrawing]);

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.pause();
      setIsPaused(true);
      
      // Track when we paused to calculate pause duration
      pausedDurationRef.current = Date.now() - recordingStartTimeRef.current - (recordingDuration * 1000);
      
      // Also pause the drawing to save resources
      stopDrawing();
      
      console.log('Recording paused at', recordingDuration, 'seconds');
    }
  }, [recordingDuration, stopDrawing]);

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'paused') {
      recorder.resume();
      setIsPaused(false);
      
      // Calculate how long we were paused and add to total pause time
      const pauseDuration = Date.now() - recordingStartTimeRef.current - (recordingDuration * 1000);
      pausedDurationRef.current = pauseDuration;
      
      // Resume drawing
      startDrawing();
      
      console.log('Recording resumed after pause');
    }
  }, [recordingDuration, startDrawing]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDrawing();
      if (displayStreamRef.current) {
        displayStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopDrawing]);

  // Handle review approval
  const handleReviewApprove = (segment: any, hittingPlan: any) => {
    setShowReview(false);
    setReviewingSegment(null);
    
    // Add to recorded segments for now, but we'll upload directly
    setRecordedSegments(prev => [...prev, segment]);
    
    // Upload with hitting plan
    uploadAnalysis(segment, hittingPlan);
  };

  // Handle review cancel
  const handleReviewCancel = () => {
    if (reviewingSegment) {
      URL.revokeObjectURL(reviewingSegment.url);
    }
    setShowReview(false);
    setReviewingSegment(null);
  };

  return (
    <>
      {/* Selection overlay */}
      {isSelecting && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              pointerEvents: 'none'
            }}
          >
            {/* Selection box */}
            <div
            style={{
              position: 'absolute',
              left: `${selectionBox.x}px`,
              top: `${selectionBox.y}px`,
              width: `${selectionBox.width}px`,
              height: `${selectionBox.height}px`,
              border: '3px solid #00ff00',
              boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
              pointerEvents: 'auto',
              cursor: 'move'
            }}
            onMouseDown={(e) => {
              const startX = e.clientX - selectionBox.x;
              const startY = e.clientY - selectionBox.y;
              
              const handleMouseMove = (e: MouseEvent) => {
                setSelectionBox(prev => ({
                  ...prev,
                  x: e.clientX - startX,
                  y: e.clientY - startY
                }));
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            {/* Resize handle */}
            <div
              style={{
                position: 'absolute',
                right: -5,
                bottom: -5,
                width: 20,
                height: 20,
                backgroundColor: '#00ff00',
                cursor: 'nwse-resize'
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = selectionBox.width;
                const startHeight = selectionBox.height;
                
                const handleMouseMove = (e: MouseEvent) => {
                  const newWidth = startWidth + (e.clientX - startX);
                  const newHeight = startHeight + (e.clientY - startY);
                  
                  // Maintain aspect ratio (16:9)
                  const aspectRatio = 16 / 9;
                  const adjustedHeight = newWidth / aspectRatio;
                  
                  setSelectionBox(prev => ({
                    ...prev,
                    width: Math.max(320, newWidth),
                    height: Math.max(180, adjustedHeight)
                  }));
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
            
            {/* Info display */}
            <div
              style={{
                position: 'absolute',
                top: -30,
                left: 0,
                backgroundColor: 'rgba(0, 255, 0, 0.9)',
                color: 'black',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '4px'
              }}
            >
              {Math.round(selectionBox.width)} × {Math.round(selectionBox.height)}
            </div>
          </div>
        </div>
        
        {/* Confirm button - outside the no-pointer div */}
        <button
          onClick={confirmSelection}
          style={{
            position: 'fixed',
            left: `${selectionBox.x}px`,
            top: `${selectionBox.y + selectionBox.height + 10}px`,
            padding: '8px 16px',
            backgroundColor: '#00ff00',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 10000
          }}
        >
          Confirm Selection
        </button>
      </>
      )}

      {/* Recording controls in sidebar */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Selectable Recording</h3>
        
        {/* Hidden video */}
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          muted
          playsInline
        />
        
        {/* Canvas preview */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          style={{ 
            display: isRecording ? 'block' : 'none',
            width: '200px',
            height: '112.5px',
            border: '2px solid green',
            borderRadius: '4px',
            marginBottom: isRecording ? '8px' : '0'
          }}
        />
        
        <div className="space-y-3">
          {!isRecording && !isSelecting && !hasSelected && (
            <button
              onClick={startSelecting}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Select Recording Area
            </button>
          )}
          
          {!isRecording && isSelecting && (
            <div className="text-sm text-green-400">
              Drag the green box to position it over the area you want to record
            </div>
          )}
          
          {!isRecording && hasSelected && (
            <>
              <div className="text-xs text-gray-400">
                Area selected: {Math.round(selectionBox.width)} × {Math.round(selectionBox.height)}
              </div>
              <button
                onClick={startRecording}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
                Start Recording
              </button>
              <button
                onClick={() => {
                  setHasSelected(false);
                  setIsSelecting(true);
                }}
                className="w-full px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-sm"
              >
                Reselect Area
              </button>
            </>
          )}
          
          {isRecording && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'} rounded-full`} />
                  <span className="text-sm text-white">
                    {isPaused ? 'Paused' : 'Recording'}: {recordingDuration}s
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {!isPaused ? (
                  <button
                    onClick={pauseRecording}
                    className="flex-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors text-sm"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm"
                  >
                    Resume
                  </button>
                )}
                
                <button
                  onClick={stopRecording}
                  className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                >
                  Stop
                </button>
              </div>
              
              {isPaused && (
                <div className="text-xs text-yellow-400 text-center">
                  Recording paused - load videos, make changes, then resume
                </div>
              )}
            </div>
          )}
          
          {/* Show recorded segments */}
          {recordedSegments.length > 0 && (
            <div className="space-y-2 mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">Recorded Segments:</p>
              {recordedSegments.map((segment, index) => (
                <div key={segment.id} className="bg-gray-700 p-2 rounded space-y-2">
                  <span className="text-xs text-white block">Recording {index + 1} ({segment.duration}s)</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => uploadAnalysis(segment)}
                      disabled={isUploading}
                      className={`text-xs px-2 py-1 ${
                        isUploading 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white rounded transition-colors flex-1`}
                    >
                      {isUploading ? 'Uploading...' : 'Approve & Send to Player'}
                    </button>
                    <button
                      onClick={() => {
                        URL.revokeObjectURL(segment.url);
                        setRecordedSegments(prev => prev.filter(s => s.id !== segment.id));
                      }}
                      disabled={isUploading}
                      className={`text-xs px-2 py-1 ${
                        isUploading
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700'
                      } text-white rounded transition-colors flex-1`}
                    >
                      Delete
                    </button>
                  </div>
                  {uploadStatus && (
                    <div className="text-xs text-center mt-2 text-yellow-400">
                      {uploadStatus}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Review Modal */}
      {showReview && reviewingSegment && (
        <VideoReviewWithPlan
          segment={reviewingSegment}
          submission={JSON.parse(sessionStorage.getItem('selectedSubmission') || '{}')}
          onApprove={handleReviewApprove}
          onCancel={handleReviewCancel}
          isUploading={isUploading}
        />
      )}
    </>
  );
};

export default SelectableRecorder;