import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useMicMonitor } from './recordingHooks/useMicMonitor';
import { useCropConfig } from './recordingHooks/useCropConfig';
import { useUpload } from './recordingHooks/useUpload';
import { useDebugOverlay } from './recordingHooks/useDebugOverlay';
import { useRecordingEngine } from './recordingHooks/useRecordingEngine';
import AreaPreviewOverlay from './recordingComponents/AreaPreviewOverlay';
import CropEditorPanel from './recordingComponents/CropEditorPanel';
import PreRecordActions from './recordingComponents/PreRecordActions';
// Selection overlay removed in favor of center-crop editor
import RecordingControls from './recordingComponents/RecordingControls';
import SegmentsList from './recordingComponents/SegmentsList';
import UploadOverlay from './recordingComponents/UploadOverlay';
import { createDrawFrame } from './recordingFunctions/drawFrame';
import { createAnimator } from './recordingFunctions/animation';
import { stopAllResources } from './recordingFunctions/teardown';
import { captureElementRegion } from './recordingFunctions/regionCapture';

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
  const [debugMode] = useState(false);
    const lastDebugUpdateRef = useRef<number>(0);
  
  const { micStatus, audioLevel, showMicTest, setMicStatus, setupAudioMonitoring, stopAudioMonitoring, testMicrophone } = useMicMonitor();

  


  useDebugOverlay({
    enabled: debugMode,
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

  // Function to draw cropped area to canvas
  const drawFrame = useCallback(
    createDrawFrame({
      canvasRef,
      videoRef,
      displayStreamRef,
      appliedCrop,
      lockedRect,
      debugMode,
      lastDebugUpdateRef,
    }),
    [appliedCrop, lockedRect, debugMode]
  );

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
      const el = (document.getElementById('analysis-root') || document.body) as HTMLElement;
      return await captureElementRegion(el, { audio: false });
    },
  });

  // Bind crop apply to current capture dimensions
  const applyScreenSizeBound = useCallback(() => {
    return applyScreenSize(() => ({
      vw: videoRef.current?.videoWidth || lastCaptureDimsRef.current?.vw || null,
      vh: videoRef.current?.videoHeight || lastCaptureDimsRef.current?.vh || null,
    }));
  }, [applyScreenSize]);

  // Auto-stop when time limit reached
  useEffect(() => {
    if (shouldStopRecording) {
      stopRecording();
      setShouldStopRecording(false);
    }
  }, [shouldStopRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDrawing();
      stopAudioMonitoring();
      stopAllResources({ displayStreamRef, audioStreamRef, mediaRecorderRef, videoRef });
    };
  }, [stopDrawing]);

  // Review modal handlers removed

  // No selection confirmation; center-crop applies via CropEditorPanel

  return (
    <>
      <AreaPreviewOverlay
        show={showAreaPreview}
        isRecording={isRecording}
        cropWidth={cropPreset.w}
        basisCssWidth={(lastCaptureDimsRef.current?.vw || null) && ((lastCaptureDimsRef.current!.vw) / ((typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1)) as number | null}
        offsetX={offsetNorm.x}
        offsetY={offsetNorm.y}
      />

      {/* Selection overlay removed */}

      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Recording</h3>
        
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
          {!isRecording && !isConfigMode && (
            <>
              <button
                onClick={() => {
                  setIsConfigMode(true);
                  setShowAreaPreview(true);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors font-semibold"
              >
                Set Recording Area
              </button>
              <div className="text-[11px] text-gray-400">Current: {appliedCrop.w}×{appliedCrop.h} | Offsets: {(appliedCrop.x*100).toFixed(0)}%, {(appliedCrop.y*100).toFixed(0)}%</div>
              <PreRecordActions
                hasAppliedCrop={hasAppliedCrop}
                micStatus={micStatus}
                showMicTest={showMicTest}
                audioLevel={audioLevel}
                onTestMic={testMicrophone}
                onStart={startRecording}
                onResetArea={resetScreenSize}
              />
            </>
          )}

          {!isRecording && isConfigMode && (
            <CropEditorPanel
              cropPreset={cropPreset}
              offsetNorm={offsetNorm}
              showAreaPreview={showAreaPreview}
              onIncreaseCrop={increaseCrop}
              onDecreaseCrop={decreaseCrop}
              onOffsetUp={() => setOffsetNorm(v => ({ ...v, y: Math.max(-1, v.y - 0.1) }))}
              onOffsetDown={() => setOffsetNorm(v => ({ ...v, y: Math.min(1, v.y + 0.1) }))}
              onOffsetLeft={() => setOffsetNorm(v => ({ ...v, x: Math.max(-1, v.x - 0.1) }))}
              onOffsetRight={() => setOffsetNorm(v => ({ ...v, x: Math.min(1, v.x + 0.1) }))}
              onOffsetReset={() => setOffsetNorm({ x: 0, y: 0 })}
              onTogglePreview={setShowAreaPreview}
              onApply={applyScreenSizeBound}
              onCancel={() => { setIsConfigMode(false); setShowAreaPreview(false); }}
            />
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
