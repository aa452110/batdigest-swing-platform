import { useCallback, useRef, useState } from 'react';

export function useSimpleRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startSimpleRecording = useCallback(async () => {
    try {
      console.log('[SIMPLE] Getting display stream...');
      
      // Get the display stream directly (no canvas)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          preferCurrentTab: true,
        },
        audio: false // Tab audio doesn't work reliably
      });

      console.log('[SIMPLE] Getting microphone...');
      
      // Get microphone
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Combine streams
      const combinedStream = new MediaStream();
      displayStream.getVideoTracks().forEach(t => combinedStream.addTrack(t));
      audioStream.getAudioTracks().forEach(t => combinedStream.addTrack(t));

      console.log('[SIMPLE] Combined stream has:');
      console.log('  - Video tracks:', combinedStream.getVideoTracks().length);
      console.log('  - Audio tracks:', combinedStream.getAudioTracks().length);

      // Create recorder with explicit audio codec
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm;codecs=vp8,opus';
      
      console.log('[SIMPLE] Using mimeType:', mimeType);
      
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000
      });

      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log('[SIMPLE] Chunk received:', e.data.size);
        }
      };

      recorder.onstop = () => {
        console.log('[SIMPLE] Recording stopped, chunks:', chunksRef.current.length);
        
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        
        console.log('[SIMPLE] Created blob:', blob.size, 'bytes');
        
        // Test the recording
        const testVideo = document.createElement('video');
        testVideo.src = url;
        testVideo.onloadedmetadata = () => {
          console.log('[SIMPLE] Test video metadata:');
          console.log('  - Duration:', testVideo.duration);
          console.log('  - Has audio:', (testVideo as any).mozHasAudio || (testVideo as any).webkitAudioDecodedByteCount > 0);
        };
        
        // Cleanup
        displayStream.getTracks().forEach(t => t.stop());
        audioStream.getTracks().forEach(t => t.stop());
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      
      console.log('[SIMPLE] Recording started!');
      
    } catch (error) {
      console.error('[SIMPLE] Failed to start:', error);
    }
  }, []);

  const stopSimpleRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('[SIMPLE] Stop requested');
    }
  }, []);

  return {
    isRecording,
    recordingUrl,
    startSimpleRecording,
    stopSimpleRecording
  };
}