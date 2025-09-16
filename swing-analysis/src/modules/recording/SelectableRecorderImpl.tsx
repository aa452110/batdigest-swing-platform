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
  const [previewSegment, setPreviewSegment] = useState<{ id: string; url: string; blob: Blob; duration: number } | null>(null);
  const [isTranscoding, setIsTranscoding] = useState(false);
  const [transcodeProgress, setTranscodeProgress] = useState(0);
  const [transcodeStatus, setTranscodeStatus] = useState<string>('');
  // FFmpeg preloading UI state
  const [isCoreLoading, setIsCoreLoading] = useState<boolean>(false);
  const [coreStatus, setCoreStatus] = useState<string>('');
  const [corePct, setCorePct] = useState<number>(0);
  
  
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
    // Open modal with the latest segment for immediate review
    setPreviewSegment(segment);
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
    maxDurationSec: 600,
    getCaptureStream: async () => {
      const captureElement = document.getElementById('video-container-actual');
      if (!captureElement) {
        console.error('[SelectableRecorder] ❌ video-container-actual NOT FOUND!');
        return null;
      }
      console.log('[SelectableRecorder] ✅ Found video-container-actual element');

      // Lock coordinates for UI/debug; capture path is via extension
      const rect = captureElement.getBoundingClientRect();
      lockedCropRef.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        viewportW: window.innerWidth,
        viewportH: window.innerHeight,
        timestamp: Date.now(),
      };
      console.log(`ELEMENT X,Y: (${rect.left}, ${rect.top})`);

      const extensionAvailable = await isExtensionAvailable();
      if (!extensionAvailable) {
        console.error('[SelectableRecorder] Extension not detected');
        return null; // do not fall back
      }
      const stream = await captureWithExtension(captureElement);
      return stream;
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

  // Preload FFmpeg core as soon as analyzer loads so user sees progress and avoids initial stall
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ext = (window as any).SwingCaptureExtension;
        if (ext?.isInstalled) {
          if (!cancelled) {
            setCoreStatus('Ready (Extension)');
            setCorePct(100);
          }
        } else {
          if (!cancelled) {
            setCoreStatus('Extension required (Swing Analyzer Screen Capture)');
            setCorePct(0);
          }
        }
      } catch (e) {
        console.warn('[Analyzer] FFmpeg preload failed:', e);
        setCoreStatus('FFmpeg preload failed');
      } finally {
        if (!cancelled) setIsCoreLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Close preview on ESC
  useEffect(() => {
    if (!previewSegment) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewSegment(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewSegment]);

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
          {isCoreLoading && (
            <div className="p-2 rounded bg-gray-700 text-gray-200 text-sm flex items-center gap-2">
              <span className="inline-block animate-spin w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full" />
              <span>{coreStatus || 'Loading FFmpeg…'}{corePct ? ` ${corePct}%` : ''}</span>
            </div>
          )}
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
              maxDurationSec={600}
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

      {/* Top-positioned preview modal for last recording */}
      {previewSegment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center pt-8 overflow-y-auto"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setPreviewSegment(null)}
          />
          {/* Modal content - smaller and at top */}
          <div className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-3xl w-[85vw]">
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <div className="text-sm text-gray-300">Preview • {previewSegment.duration}s</div>
              <button
                onClick={() => setPreviewSegment(null)}
                className="text-gray-400 hover:text-white"
                aria-label="Close preview"
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              {!isTranscoding ? (
                <>
                  <video
                    src={previewSegment.url}
                    controls
                    autoPlay
                    muted={false}
                    className="w-full max-h-[60vh] bg-black rounded"
                    style={{ objectFit: 'contain' }}
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      console.log('[PREVIEW] Video loaded - has audio:', (video as any).webkitAudioDecodedByteCount > 0 || (video as any).mozHasAudio);
                      video.volume = 1.0;
                      video.muted = false;
                    }}
                  />
                  <div className="mt-2 bg-yellow-900 p-2 rounded text-sm">
                    ⚠️ If no audio: Click video, then unmute using controls. Chrome may auto-mute.
                  </div>
                </>
              ) : (
                <div className="p-6 bg-gray-800 rounded text-center">
                  <div className="text-sm text-gray-300 mb-2">Transcoding to MP4 (H.264/AAC)…</div>
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div className="bg-blue-500 h-3 rounded-full transition-all duration-300" style={{ width: `${transcodeProgress}%` }} />
                  </div>
                  <div className="text-xs text-gray-400">{transcodeStatus || `${transcodeProgress}%`}</div>
                </div>
              )}
            </div>
            <div className="flex gap-2 p-3 border-t border-gray-700">
              <button
                onClick={async () => {
                  try {
                    setIsTranscoding(true);
                    setTranscodeProgress(0);
                    setTranscodeStatus('Initializing…');
                    // Use the R2-based FFmpeg for transcoding
                    const { transcodeWebMToMP4 } = await import('./recordingFunctions/mp4Transcode');
                    setTranscodeStatus('Transcoding via FFmpeg…');
                    const mp4Blob: Blob = await transcodeWebMToMP4(previewSegment!.blob, (progress) => {
                      setTranscodeProgress(progress);
                    });
                    const mp4Url = URL.createObjectURL(mp4Blob);
                    const updated = { ...previewSegment!, blob: mp4Blob, url: mp4Url };
                    setPreviewSegment(updated);
                    setRecordedSegments(prev => prev.map(s => s.id === updated.id ? updated : s));
                    setTranscodeStatus('Complete');
                  } catch (e: any) {
                    console.error('[MP4] Transcode failed:', e);
                    setTranscodeStatus('Failed: ' + (e?.message || 'Unknown error'));
                  } finally {
                    setTimeout(() => { setIsTranscoding(false); }, 300);
                  }
                }}
                disabled={isTranscoding || isUploading}
                className={`px-3 py-1 ${isTranscoding ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded transition-colors`}
              >
                {isTranscoding ? `Transcoding… ${transcodeProgress}%` : 'Transcode to MP4 (H.264/AAC)'}
              </button>
              <button
                onClick={() => {
                  runUpload(previewSegment);
                  setPreviewSegment(null);
                }}
                disabled={isUploading || isTranscoding}
                className={`px-3 py-1 ${isUploading || isTranscoding ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white rounded transition-colors`}
              >
                {isUploading ? 'Uploading…' : 'Approve & Send to Player'}
              </button>
              <button
                onClick={() => setPreviewSegment(null)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Close
              </button>
              <div className="ml-auto flex items-center text-xs text-gray-400">
                Tip: Click outside or press ESC to dismiss
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SelectableRecorder;
