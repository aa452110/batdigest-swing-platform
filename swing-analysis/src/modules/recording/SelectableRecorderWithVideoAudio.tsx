import React, { useRef, useState, useCallback, useEffect } from 'react';

const SelectableRecorderWithVideoAudio: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedSegments, setRecordedSegments] = useState<any[]>([]);
  
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
  };

  const startRecording = useCallback(async () => {
    try {
      // Get screen capture (video only)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: false,  // We'll get audio from video elements directly
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

      // Create combined stream with video
      const combinedStream = new MediaStream();
      
      // Add video track from canvas
      canvasStream.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track);
      });
      
      // CAPTURE AUDIO FROM VIDEO ELEMENTS DIRECTLY
      try {
        // Find all video elements on the page
        const videoElements = document.querySelectorAll('video');
        const audioContext = new AudioContext();
        const audioDestination = audioContext.createMediaStreamDestination();
        
        videoElements.forEach(videoEl => {
          if (videoEl !== video && !videoEl.muted && !videoEl.paused) {
            try {
              const source = audioContext.createMediaElementSource(videoEl);
              source.connect(audioDestination);
              source.connect(audioContext.destination); // Also play through speakers
              console.log('Connected audio from video element');
            } catch (e) {
              console.log('Video element already connected or no audio');
            }
          }
        });
        
        // Add the mixed audio to our recording
        const audioTracks = audioDestination.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          audioTracks.forEach(track => {
            combinedStream.addTrack(track);
          });
          console.log('Video audio captured directly from elements');
        }
      } catch (audioError) {
        console.warn('Could not capture video audio:', audioError);
      }

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

      // Handle display stream ending
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
      setIsRecording(false);
      stopDrawing();
    }
  }, [selectionBox, recordingDuration, startDrawing, stopDrawing]);

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
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Recording (Video Audio)</h3>
        
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
    </>
  );
};

export default SelectableRecorderWithVideoAudio;