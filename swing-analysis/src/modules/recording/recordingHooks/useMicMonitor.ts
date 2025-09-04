import { useCallback, useRef, useState } from 'react';

export type MicStatus = 'idle' | 'active' | 'denied' | 'error';

export function useMicMonitor() {
  const [micStatus, setMicStatus] = useState<MicStatus>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [showMicTest, setShowMicTest] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micMonitorIntervalRef = useRef<number | null>(null);

  const setupAudioMonitoring = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const monitorAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalizedLevel = Math.min(100, Math.floor((average / 128) * 100));
        setAudioLevel(normalizedLevel);
        if (normalizedLevel > 5) setMicStatus('active');
      };
      const interval = setInterval(monitorAudio, 100);
      micMonitorIntervalRef.current = interval as unknown as number;
    } catch (error) {
      console.error('Failed to setup audio monitoring:', error);
      setMicStatus('error');
    }
  }, []);

  const stopAudioMonitoring = useCallback(() => {
    if (micMonitorIntervalRef.current) {
      clearInterval(micMonitorIntervalRef.current);
      micMonitorIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    setMicStatus('idle');
  }, []);

  const testMicrophone = useCallback(async () => {
    try {
      setShowMicTest(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      setMicStatus('active');
      setupAudioMonitoring(stream);
      setTimeout(() => {
        stream.getTracks().forEach((t) => t.stop());
        stopAudioMonitoring();
        setShowMicTest(false);
      }, 5000);
    } catch (error) {
      console.error('Mic test failed:', error);
      setMicStatus('denied');
    }
  }, [setupAudioMonitoring, stopAudioMonitoring]);

  return {
    micStatus,
    audioLevel,
    showMicTest,
    setShowMicTest,
    setMicStatus,
    setupAudioMonitoring,
    stopAudioMonitoring,
    testMicrophone,
  };
}
