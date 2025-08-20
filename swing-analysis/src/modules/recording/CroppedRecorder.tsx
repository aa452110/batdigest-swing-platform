import React, { useRef, useState, useCallback, useEffect } from 'react';

const CroppedRecorder: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedSegments, setRecordedSegments] = useState<any[]>([]);

  // Function to draw cropped area to canvas
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.readyState < 2) return;

    // Hard target dimensions for output
    const cw = 1280;
    const ch = 720;
    if (canvas.width !== cw) canvas.width = cw;
    if (canvas.height !== ch) canvas.height = ch;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Actual captured pixels
    const vw = Math.max(1, video.videoWidth || 1920);
    const vh = Math.max(1, video.videoHeight || 1080);

    // RETINA ADJUSTMENT: On Mac Retina displays, screen capture gets 2x pixels
    // So to capture what appears as 1280x720 CSS pixels, we need to capture 2560x1440 actual pixels
    const devicePixelRatio = window.devicePixelRatio || 1;
    const captureWidth = cw * devicePixelRatio;  // 1280 * 2 = 2560 on Retina
    const captureHeight = ch * devicePixelRatio; // 720 * 2 = 1440 on Retina

    // If capture is big enough, do a true center crop
    if (vw >= captureWidth && vh >= captureHeight) {
      const sx = (vw - captureWidth) / 2;
      const sy = (vh - captureHeight) / 2;
      
      if (!window.cropLogged) {
        console.log('Screen capture resolution:', vw, 'x', vh);
        console.log('Device pixel ratio:', devicePixelRatio);
        console.log('Capturing area:', captureWidth, 'x', captureHeight, 'pixels');
        console.log('From position:', sx, sy);
        console.log('Output canvas:', cw, 'x', ch);
        window.cropLogged = true;
      }
      
      // Draw the Retina-sized capture area to the normal-sized canvas
      ctx.drawImage(video, sx, sy, captureWidth, captureHeight, 0, 0, cw, ch);
    } else {
      // Scale-to-cover if source is smaller
      const scale = Math.max(cw / vw, ch / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      
      if (!window.cropLogged) {
        console.log('Screen:', vw, 'x', vh, '(smaller than target)');
        console.log('Scaling to cover 1280x720');
        window.cropLogged = true;
      }
      
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(video, 0, 0, vw, vh, dx, dy, dw, dh);
    }
  }, []);

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

  const startRecording = useCallback(async () => {
    try {
      // Get screen capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
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

      // Set canvas size to target dimensions
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not initialized');
      
      canvas.width = 1280;
      canvas.height = 720;

      // Start drawing cropped frames to canvas after a small delay
      setTimeout(() => {
        startDrawing();
      }, 100);

      // Get canvas stream (THIS is the cropped video)
      const canvasStream = canvas.captureStream(30);
      console.log('Canvas stream tracks:', canvasStream.getTracks().length);

      // Try to get microphone audio
      let combinedStream = canvasStream;
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          } 
        });
        audioStreamRef.current = audioStream;

        // Combine canvas video with microphone audio
        combinedStream = new MediaStream();
        canvasStream.getVideoTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
        audioStream.getAudioTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      } catch (audioError) {
        console.warn('No microphone, recording video only');
      }

      // Create MediaRecorder - IMPORTANT: This should use combinedStream (from canvas), NOT displayStream!
      console.log('Recording from stream with', combinedStream.getTracks().length, 'tracks');
      console.log('Video tracks:', combinedStream.getVideoTracks().length);
      
      // Use best available codec
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm;codecs=vp8';
      
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6000000, // 6 Mbps for better quality
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
        
        setRecordedSegments(prev => [...prev, {
          id: Date.now().toString(),
          url,
          blob,
          duration: recordingDuration,
        }]);

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

      // Handle display stream ending (user stops sharing)
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

      mediaRecorder.start(1000);
      setIsRecording(true);
      
      // Start duration timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
          clearInterval(timer);
          return;
        }
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

    } catch (error: any) {
      console.error('Failed to start recording:', error);
      if (error.name === 'NotAllowedError') {
        alert('Screen recording permission denied.');
      } else {
        alert('Failed to start recording. Please try again.');
      }
      setIsRecording(false);
      stopDrawing();
      
      // Cleanup
      if (displayStreamRef.current) {
        displayStreamRef.current.getTracks().forEach(track => track.stop());
        displayStreamRef.current = null;
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
    }
  }, [recordingDuration, startDrawing, stopDrawing]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Analysis Recording (1280x720)</h3>
      
      {/* Hidden video to receive screen capture */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        muted
        playsInline
      />
      
      {/* Single canvas - show preview when recording, hide when not */}
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
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <div className="w-2 h-2 bg-white rounded-full" />
            Start Recording
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-white">Recording: {recordingDuration}s</span>
              </div>
            </div>
            
            <button
              onClick={stopRecording}
              className="w-full px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-sm"
            >
              Stop
            </button>
          </div>
        )}
        
        {isRecording && (
          <div className="text-xs text-green-400">
            ✓ Recording center 1280x720 area
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
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = segment.url;
                      link.download = `analysis-${segment.id}.webm`;
                      link.click();
                    }}
                    className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex-1"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(segment.url);
                      setRecordedSegments(prev => prev.filter(s => s.id !== segment.id));
                    }}
                    className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CroppedRecorder;