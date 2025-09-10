import { useCallback, useRef, useState } from 'react';
// import { getDisplayMediaWithCursor } from '../recordingFunctions/media';

type Params = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  displayStreamRef: React.MutableRefObject<MediaStream | null>;
  audioStreamRef: React.MutableRefObject<MediaStream | null>;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  recordedChunksRef: React.MutableRefObject<Blob[]>;
  startDrawing: () => void;
  stopDrawing: () => void;
  setupAudioMonitoring: (stream: MediaStream) => void;
  stopAudioMonitoring: () => void;
  setMicStatus: (s: 'idle' | 'active' | 'denied' | 'error') => void;
  onSegmentReady: (segment: { id: string; url: string; blob: Blob; duration: number }) => void;
  maxDurationSec?: number;
  getCaptureStream?: () => Promise<MediaStream | null>;
};

export function useRecordingEngine(params: Params) {
  const {
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
    maxDurationSec = 300,
    getCaptureStream,
  } = params;

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingWarning, setRecordingWarning] = useState('');
  const [shouldStopRecording, setShouldStopRecording] = useState(false);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    // REMOVED LOG - console.log('[RecordingEngine] startRecording called');
    try {
      setRecordingWarning('');
      if (!displayStreamRef.current) {
        console.log('[RecordingEngine] No existing display stream, need to capture...');
        let displayStream: MediaStream | null = null;
        if (getCaptureStream) {
          try { 
            console.log('[RecordingEngine] Calling getCaptureStream...');
            displayStream = await getCaptureStream(); 
            console.log('[RecordingEngine] getCaptureStream returned:', displayStream ? 'MediaStream' : 'null');
          } catch (e) {
            console.error('[RecordingEngine] getCaptureStream threw:', e);
          }
        }
        if (!displayStream) {
          console.error('[RecordingEngine] Failed to get display stream!');
          setRecordingWarning('Region Capture is required. Select "This Tab" and ensure Chrome supports Region Capture.');
          return; // Do not fall back to generic screen capture
        }
        displayStreamRef.current = displayStream;
        console.log('[RecordingEngine] Display stream set successfully');
      } else {
        console.log('[RecordingEngine] Using existing display stream');
      }
      const video = videoRef.current;
      if (!video) throw new Error('Video element not found');
      
      console.log('[RecordingEngine] Setting video srcObject...');
      video.srcObject = displayStreamRef.current as MediaStream;
      
      console.log('[RecordingEngine] Waiting for metadata...');
      await new Promise((resolve) => { 
        video.onloadedmetadata = () => {
          console.log('[RecordingEngine] Metadata loaded, video dimensions:', video.videoWidth, 'x', video.videoHeight);
          resolve(true);
        };
      });
      
      console.log('[RecordingEngine] Playing video...');
      await video.play();
      
      // Verify video is actually ready
      if (video.readyState < 2) {
        console.error('[RecordingEngine] Video not ready after play, readyState:', video.readyState);
        throw new Error('Video element not ready for playback');
      }
      
      console.log('[RecordingEngine] Video ready, readyState:', video.readyState);

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not initialized');
      
      // Get actual video dimensions from the stream
      const videoTrack = displayStreamRef.current?.getVideoTracks()[0];
      const settings = videoTrack?.getSettings() as any;
      
      // Set a temporary canvas size so captureStream works
      // drawFrame will resize it to the actual crop dimensions on first frame
      if (canvas.width === 0) canvas.width = 1;
      if (canvas.height === 0) canvas.height = 1;
      
      // Only start drawing loop after we've confirmed video is ready
      console.log('🎬 [Recording Engine] Video readyState=' + video.readyState + ', now starting drawing loop...');
      startDrawing();

      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream();
      // Video from canvas compositor
      canvasStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));
      console.log('[AUDIO DEBUG] Video tracks added:', canvasStream.getVideoTracks().length);

      // Build EXACTLY ONE audio track using WebAudio mixdown
      // - Mix tab audio (if any) + microphone into a single destination
      // - Many players and Chrome's MediaRecorder behave poorly with multiple audio tracks
      // - A single, mixed track avoids the "Duration: Infinity" and silent playback issues
      let audioContext: AudioContext | null = null;
      let mixedDestination: MediaStreamAudioDestinationNode | null = null;
      let disconnectFns: Array<() => void> = [];

      try {
        // Request microphone first so we can monitor and include it in the mix
        console.log('[AUDIO DEBUG] Requesting microphone...');
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        audioStreamRef.current = micStream;
        const micTrack = micStream.getAudioTracks()[0] || null;
        console.log('[AUDIO DEBUG] Microphone tracks obtained:', micTrack ? 1 : 0);

        // Prepare WebAudio graph
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        mixedDestination = audioContext.createMediaStreamDestination();

        // Helper to add a MediaStreamTrack to the mix
        const addTrackToMix = (track: MediaStreamTrack, label: string) => {
          if (!audioContext || !mixedDestination) return;
          const stream = new MediaStream([track]);
          const source = audioContext.createMediaStreamSource(stream);
          const gain = audioContext.createGain();
          gain.gain.value = 1.0;
          source.connect(gain).connect(mixedDestination);
          disconnectFns.push(() => {
            try { source.disconnect(); } catch {}
            try { gain.disconnect(); } catch {}
          });
          console.log('[AUDIO DEBUG] Added source to mix:', label, track.label);
        };

        // Add tab audio if available from the display capture
        let tabAudioTrack: MediaStreamTrack | null = null;
        try {
          const tabAudioTracks = displayStreamRef.current?.getAudioTracks?.() || [];
          console.log('[AUDIO DEBUG] Tab audio tracks available:', tabAudioTracks.length);
          tabAudioTrack = tabAudioTracks[0] || null;
        } catch (e) {
          console.log('[AUDIO DEBUG] Tab audio inspection error:', e);
        }

        if (tabAudioTrack) addTrackToMix(tabAudioTrack, 'tab');
        if (micTrack) addTrackToMix(micTrack, 'mic');

        if ((mixedDestination?.stream.getAudioTracks().length || 0) > 0) {
          combinedStream.addTrack(mixedDestination!.stream.getAudioTracks()[0]);
          setMicStatus('active');
          setupAudioMonitoring(micStream);
        } else {
          console.warn('[AUDIO DEBUG] No audio tracks available for mix; recording will be silent');
          setRecordingWarning('⚠️ No microphone detected - recording without audio');
          setTimeout(() => setRecordingWarning(''), 5000);
        }
      } catch (e) {
        console.error('[AUDIO DEBUG] Audio mix setup error:', e);
        setMicStatus('denied');
        setRecordingWarning('⚠️ No microphone detected - recording without audio');
        setTimeout(() => setRecordingWarning(''), 5000);
      }

      // Debug: Check what's actually in the combined stream
      console.log('[AUDIO DEBUG] Combined stream summary:');
      console.log('  - Video tracks:', combinedStream.getVideoTracks().length);
      console.log('  - Audio tracks:', combinedStream.getAudioTracks().length);
      combinedStream.getAudioTracks().forEach((t, i) => {
        console.log(`  - Audio track ${i}:`, t.label, 'enabled:', t.enabled, 'settings:', t.getSettings());
      });

      // Prefer formats that explicitly include an audio codec so microphone/tab audio is muxed
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
        console.log('[AUDIO DEBUG] Using mimeType with opus audio:', mimeType);
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
        console.log('[AUDIO DEBUG] Using mimeType with opus audio:', mimeType);
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
        console.log('[AUDIO DEBUG] WARNING: Using mimeType WITHOUT explicit audio codec:', mimeType);
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8';
        console.log('[AUDIO DEBUG] WARNING: Using mimeType WITHOUT explicit audio codec:', mimeType);
      }
      
      console.log('[AUDIO DEBUG] Creating MediaRecorder with:');
      console.log('  - Stream has', combinedStream.getAudioTracks().length, 'audio tracks');
      console.log('  - Stream has', combinedStream.getVideoTracks().length, 'video tracks');
      console.log('  - MimeType:', mimeType);
      
      const rec = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 6000000 });
      mediaRecorderRef.current = rec;
      recordedChunksRef.current = [];
      
      console.log('[AUDIO DEBUG] MediaRecorder created, state:', rec.state);
      console.log('[AUDIO DEBUG] MediaRecorder audio tracks:', rec.stream.getAudioTracks().length);

      rec.ondataavailable = (e) => { 
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
          console.log('[AUDIO DEBUG] Data chunk received, size:', e.data.size);
        }
      };
      rec.onstop = () => {
        console.log('[AUDIO DEBUG] Recording stopped, total chunks:', recordedChunksRef.current.length);
        // Use the same mimeType we recorded with for the blob
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        console.log('[AUDIO DEBUG] Final blob size:', blob.size, 'bytes, type:', mimeType);
        
        // Test if the blob has audio - create test video element
        const testUrl = URL.createObjectURL(blob);
        const testVideo = document.createElement('video');
        testVideo.muted = false; // Ensure not muted
        testVideo.volume = 0.5;
        testVideo.src = testUrl;
        
        // Also create an audio element to double-check
        const testAudio = document.createElement('audio');
        testAudio.src = testUrl;
        
        testVideo.onloadedmetadata = () => {
          console.log('[AUDIO DEBUG] Recording metadata:');
          console.log('  - Duration:', testVideo.duration, 'seconds');
          console.log('  - Video tracks:', testVideo.videoTracks?.length || 'unknown');
          console.log('  - Audio tracks:', testVideo.audioTracks?.length || 'unknown');
          
          // Try multiple ways to detect audio
          const hasAudioMoz = !!(testVideo as any).mozHasAudio;
          const hasAudioWebkit = !!((testVideo as any).webkitAudioDecodedByteCount > 0);
          const hasAudioTracks = !!(testVideo as any).audioTracks?.length > 0;
          
          console.log('  - Has audio (mozHasAudio):', hasAudioMoz);
          console.log('  - Has audio (webkit):', hasAudioWebkit);
          console.log('  - Has audio (tracks):', hasAudioTracks);
          
          // Try to play a bit to check audio
          testVideo.currentTime = 1; // Skip ahead a bit
          testVideo.play().then(() => {
            console.log('[AUDIO DEBUG] Test playback started successfully');
            setTimeout(() => {
              const decodedBytes = (testVideo as any).webkitAudioDecodedByteCount;
              console.log('[AUDIO DEBUG] Audio bytes decoded after play:', decodedBytes || 0);
              testVideo.pause();
            }, 500);
          }).catch(e => {
            console.log('[AUDIO DEBUG] Test playback failed:', e);
          });
        };
        
        testAudio.onloadedmetadata = () => {
          console.log('[AUDIO DEBUG] Audio element loaded, duration:', testAudio.duration);
        };
        
        const url = URL.createObjectURL(blob);
        onSegmentReady({ id: Date.now().toString(), url, blob, duration: recordingDuration });
        stopDrawing();
        if (displayStreamRef.current) { displayStreamRef.current.getTracks().forEach((t) => t.stop()); displayStreamRef.current = null; }
        if (audioStreamRef.current) { audioStreamRef.current.getTracks().forEach((t) => t.stop()); audioStreamRef.current = null; }
        // Tear down mix graph
        try { disconnectFns.forEach(fn => fn()); } catch {}
        try { mixedDestination?.disconnect(); } catch {}
        try { audioContext?.close(); } catch {}
        if (videoRef.current) videoRef.current.srcObject = null;
      };

      displayStreamRef.current.getVideoTracks()[0].addEventListener('ended', () => stopRecording());

      // Start recording without timeslice for cleaner WebM timing/metadata
      rec.start();
      setIsRecording(true);
      setIsPaused(false);
      recordingStartTimeRef.current = Date.now();
      pausedDurationRef.current = 0;
      const timer = window.setInterval(() => {
        if (rec.state === 'recording') {
          const elapsed = Date.now() - recordingStartTimeRef.current - pausedDurationRef.current;
          const dur = Math.floor(elapsed / 1000);
          setRecordingDuration(dur);
          if (dur >= maxDurationSec) { setRecordingWarning('Recording stopped - 5 minute limit reached'); setShouldStopRecording(true); }
          else if (dur >= 270) setRecordingWarning('30 seconds remaining!');
          else if (dur >= 240) setRecordingWarning('1 minute remaining');
          else if (dur >= 180) setRecordingWarning('2 minutes remaining');
          else setRecordingWarning('');
        }
      }, 1000) as unknown as number;
      recordingTimerRef.current = timer;
    } catch (e) {
      console.error('Failed to start recording:', e);
      setIsRecording(false);
      stopDrawing();
    }
  }, [canvasRef, videoRef, displayStreamRef, audioStreamRef, mediaRecorderRef, recordedChunksRef, startDrawing, stopDrawing, setupAudioMonitoring, maxDurationSec, recordingDuration]);

  const pauseRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === 'recording') {
      rec.pause();
      setIsPaused(true);
      pausedDurationRef.current = Date.now() - recordingStartTimeRef.current - recordingDuration * 1000;
      stopDrawing();
    }
  }, [mediaRecorderRef, stopDrawing, recordingDuration]);

  const resumeRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === 'paused') {
      rec.resume();
      setIsPaused(false);
      pausedDurationRef.current = Date.now() - recordingStartTimeRef.current - recordingDuration * 1000;
      startDrawing();
    }
  }, [mediaRecorderRef, startDrawing, recordingDuration]);

  const stopRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      // Request final data before stopping to ensure proper finalization
      if (rec.state === 'recording') {
        rec.requestData();
      }
      rec.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
      stopAudioMonitoring();
    }
  }, [mediaRecorderRef, stopAudioMonitoring]);

  return { isRecording, isPaused, recordingDuration, recordingWarning, shouldStopRecording, setShouldStopRecording, startRecording, pauseRecording, resumeRecording, stopRecording };
}
