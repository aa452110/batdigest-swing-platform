import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useMicMonitor } from './recordingHooks/useMicMonitor';
import { useCropConfig } from './recordingHooks/useCropConfig';
import { useUpload } from './recordingHooks/useUpload';
import { useDebugOverlay } from './recordingHooks/useDebugOverlay';
import { useRecordingEngine } from './recordingHooks/useRecordingEngine';
// Area preview and crop editor not used with Region Capture
// import AreaPreviewOverlay from './recordingComponents/AreaPreviewOverlay';
// import CropEditorPanel from './recordingComponents/CropEditorPanel';
import PreRecordActions from './recordingComponents/PreRecordActions';
// Selection overlay removed in favor of center-crop editor
import RecordingControls from './recordingComponents/RecordingControls';
import SegmentsList from './recordingComponents/SegmentsList';
import UploadOverlay from './recordingComponents/UploadOverlay';
import { createDrawFrame } from './recordingFunctions/drawFrame';
import { createAnimator } from './recordingFunctions/animation';
import { stopAllResources } from './recordingFunctions/teardown';
import { captureElementRegion } from './recordingFunctions/regionCapture';
import { isExtensionAvailable, captureWithExtension } from './recordingFunctions/extensionCapture';
import { CropCommunicator, type CropCoordinates } from './recordingFunctions/cropCommunication';

export interface SelectableRecorderProps {
  onAnalysisSaved?: () => void;
}

const SelectableRecorder: React.FC<SelectableRecorderProps> = ({ onAnalysisSaved }) => {
  const { isUploading, uploadStatus, uploadAnalysis: runUpload } = useUpload(onAnalysisSaved);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  // animation handled via createAnimator
  const recordedChunksRef = useRef<Blob[]>([]);
  const cropCommunicatorRef = useRef<CropCommunicator | null>(null);
  const cropCoordinatesRef = useRef<CropCoordinates | null>(null);
  const lockedCropRef = useRef<CropCoordinates | null>(null); // The ACTUAL coordinates we use for recording
  
  const [recordedSegments, setRecordedSegments] = useState<any[]>([]);
  
  
  const { 
    cropPreset,
    appliedCrop,
    offsetNorm, setOffsetNorm,
    hasAppliedCrop,
    isConfigMode, setIsConfigMode,
    showAreaPreview, setShowAreaPreview,
    increaseCrop, decreaseCrop,
    applyScreenSize, resetScreenSize,
    lockedRect,
    lastCaptureDimsRef,
  } = useCropConfig();
  
  // Debug (disabled by default)
  const [debugMode] = useState(false); // Debug off
  const lastDebugUpdateRef = useRef<number>(0);
  
  const { micStatus, audioLevel, showMicTest, setMicStatus, setupAudioMonitoring, stopAudioMonitoring, testMicrophone } = useMicMonitor();

  


  useDebugOverlay({
    enabled: false,
    isConfigMode,
    cropPreset,
    appliedCrop,
    offsetNorm,
    showAreaPreview,
    getDims: () => ({ vw: videoRef.current?.videoWidth || lastCaptureDimsRef.current?.vw || null, vh: videoRef.current?.videoHeight || lastCaptureDimsRef.current?.vh || null }),
    getDisplaySurface: () => (displayStreamRef.current?.getVideoTracks?.()[0]?.getSettings?.()?.displaySurface || 'unknown'),
    lastCaptureDims: lastCaptureDimsRef.current,
  });

  
  // Selection overlay removed; using center-crop controls

  // Handle finished recording segments
  const onSegmentReady = useCallback((segment: { id: string; url: string; blob: Blob; duration: number }) => {
    setRecordedSegments(prev => [...prev, segment]);
  }, []);

  // Function to draw cropped area to canvas - create it directly each time
  // The function closure will capture the current refs
  const drawFrame = useCallback(() => {
    const drawFn = createDrawFrame({
      canvasRef,
      videoRef,
      displayStreamRef,
      appliedCrop,
      lockedRect,
      debugMode,
      lastDebugUpdateRef,
      cropCoordinatesRef: lockedCropRef, // USE THE LOCKED COORDINATES!
    });
    drawFn();
  }, []); // Empty deps because we're using refs which are stable

  // Animation loop (extracted)
  const animator = React.useMemo(() => createAnimator(drawFrame), [drawFrame]);
  const startDrawing = animator.start;
  const stopDrawing = animator.stop;

  const {
    isRecording,
    isPaused,
    recordingDuration,
    recordingWarning,
    shouldStopRecording,
    setShouldStopRecording,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useRecordingEngine({
    canvasRef,
    videoRef,
    displayStreamRef,
    audioStreamRef,
    mediaRecorderRef,
    recordedChunksRef,
    startDrawing,
    stopDrawing,
    setupAudioMonitoring,
    stopAudioMonitoring,
    setMicStatus,
    onSegmentReady,
    maxDurationSec: 300,
    getCaptureStream: async () => {
      // Target the actual video container (1280x720), not the wrapper with controls
      const captureElement = document.getElementById('video-container-actual');
      
      if (!captureElement) {
        console.error('[SelectableRecorder] ❌ video-container-actual NOT FOUND!');
        // Don't fall back - just fail
        return null;
      }
      
      console.log('[SelectableRecorder] ✅ Found video-container-actual element');
      
      // REMOVED LOG - console.log('[SelectableRecorder] ✅ Found video-player-scaled element');
      
      // LOCK THE COORDINATES NOW - GET THEM FRESH AND NEVER CHANGE THEM
      const rect = captureElement.getBoundingClientRect();
      
      // Just use the rect as-is! getBoundingClientRect() already accounts for transforms
      lockedCropRef.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        viewportW: window.innerWidth,
        viewportH: window.innerHeight,
        timestamp: Date.now()
      };
      
      console.log(`ELEMENT X,Y: (${rect.left}, ${rect.top})`);
      
      // Try extension first if available
      const extensionAvailable = await isExtensionAvailable();
      // REMOVED LOG - console.log('[SelectableRecorder] Extension available:', extensionAvailable);
      
      if (extensionAvailable) {
        // REMOVED LOG - console.log('[SelectableRecorder] Using extension for capture');
        const stream = await captureWithExtension(captureElement);
        if (stream) return stream;
      }
      
      // Fall back to regular capture
      // REMOVED LOG - console.log('[SelectableRecorder] Falling back to regular capture');
      return await captureElementRegion(captureElement, { audio: true });
    },
  });

  // Bind crop apply to current capture dimensions
  const applyScreenSizeBound = useCallback(() => {
    return applyScreenSize(() => ({
      vw: videoRef.current?.videoWidth || lastCaptureDimsRef.current?.vw || null,
      vh: videoRef.current?.videoHeight || lastCaptureDimsRef.current?.vh || null,
    }));
  }, [applyScreenSize]);

  // We don't need this BroadcastChannel crap anymore - we get coordinates on button click!

  // Auto-stop when time limit reached
  useEffect(() => {
    if (shouldStopRecording) {
      stopRecording();
      setShouldStopRecording(false);
    }
  }, [shouldStopRecording, stopRecording]);

  // Cleanup on unmount ONLY
  useEffect(() => {
    return () => {
      // Use the animator directly to avoid dependency issues
      animator.stop();
      stopAudioMonitoring();
      stopAllResources({ displayStreamRef, audioStreamRef, mediaRecorderRef, videoRef });
    };
  }, []); // Empty deps - only run on unmount

  // Review modal handlers removed

  // No selection confirmation; center-crop applies via CropEditorPanel

  return (
    <>
      {/* Area preview disabled with Region Capture */}

      {/* Selection overlay removed */}

      <div className="bg-gray-800 rounded-lg p-4">
        
        {
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            style={{
              display: 'none',
            }}
          />
        }
        
        <canvas
          ref={canvasRef}
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
          {!isRecording && (
            <>
              <PreRecordActions
                hasAppliedCrop={true}
                micStatus={micStatus}
                showMicTest={showMicTest}
                audioLevel={audioLevel}
                onTestMic={testMicrophone}
                onStart={() => {
                  // REMOVED LOG - console.log('[Click Handler] Start button clicked');
                  // REMOVED LOG - console.log('[Click Handler] Document has focus:', document.hasFocus());
                  // REMOVED LOG - console.log('[Click Handler] Active element:', document.activeElement?.tagName);
                  
                  try { 
                    window.focus(); 
                    // REMOVED LOG - console.log('[Click Handler] Called window.focus()');
                  } catch (e) {
                    // REMOVED LOG - console.log('[Click Handler] window.focus() failed:', e);
                  }
                  
                  // Call startRecording immediately after focus to preserve user activation
                  // REMOVED LOG - console.log('[Click Handler] Calling startRecording() synchronously...');
                  startRecording();
                }}
                onResetArea={() => { /* disabled */ }}
              />
            </>
          )}
          
          {/* SelectionPanel removed */}
          
          {isRecording && (
            <RecordingControls
              isPaused={isPaused}
              recordingDuration={recordingDuration}
              recordingWarning={recordingWarning}
              micStatus={micStatus}
              audioLevel={audioLevel}
              onPause={pauseRecording}
              onResume={resumeRecording}
              onStop={stopRecording}
            />
          )}
          
          <SegmentsList
            segments={recordedSegments as any}
            isUploading={isUploading}
            uploadStatus={uploadStatus}
            onApprove={(segment) => runUpload(segment)}
            onDelete={(segment) => {
              URL.revokeObjectURL(segment.url);
              setRecordedSegments(prev => prev.filter(s => s.id !== segment.id));
            }}
          />
        </div>
      </div>

      <UploadOverlay isUploading={isUploading} status={uploadStatus} />
    </>
  );
};

export default SelectableRecorder;
