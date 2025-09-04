import { useCallback, useRef, useState } from 'react';
import { getDisplayMediaWithCursor } from '../recordingFunctions/media';

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
    try {
      setRecordingWarning('');
      if (!displayStreamRef.current) {
        const displayStream = await getDisplayMediaWithCursor({ audio: false });
        displayStreamRef.current = displayStream;
      }
      const video = videoRef.current;
      if (!video) throw new Error('Video element not found');
      video.srcObject = displayStreamRef.current as MediaStream;
      await new Promise((resolve) => { video.onloadedmetadata = () => resolve(true); });
      await video.play();

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not initialized');
      canvas.width = 1280;
      canvas.height = 720;

      startDrawing();

      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream();
      canvasStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        audioStreamRef.current = audioStream;
        audioStream.getAudioTracks().forEach((t) => combinedStream.addTrack(t));
        setMicStatus('active');
        setupAudioMonitoring(audioStream);
      } catch (e) {
        setMicStatus('denied');
        setRecordingWarning('⚠️ No microphone detected - recording without audio');
        setTimeout(() => setRecordingWarning(''), 5000);
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm;codecs=vp8';
      const rec = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 6000000 });
      mediaRecorderRef.current = rec;
      recordedChunksRef.current = [];

      rec.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        onSegmentReady({ id: Date.now().toString(), url, blob, duration: recordingDuration });
        stopDrawing();
        if (displayStreamRef.current) { displayStreamRef.current.getTracks().forEach((t) => t.stop()); displayStreamRef.current = null; }
        if (audioStreamRef.current) { audioStreamRef.current.getTracks().forEach((t) => t.stop()); audioStreamRef.current = null; }
        if (videoRef.current) videoRef.current.srcObject = null;
      };

      displayStreamRef.current.getVideoTracks()[0].addEventListener('ended', () => stopRecording());

      rec.start(1000);
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
      rec.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
      stopAudioMonitoring();
    }
  }, [mediaRecorderRef, stopAudioMonitoring]);

  return { isRecording, isPaused, recordingDuration, recordingWarning, shouldStopRecording, setShouldStopRecording, startRecording, pauseRecording, resumeRecording, stopRecording };
}
