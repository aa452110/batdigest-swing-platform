import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useRecordingStore, useVideoStore } from '../../state/store';
import AudioLevelMeter from './AudioLevelMeter';
import DeviceSelector from './DeviceSelector';
import type { AudioRecording } from '../../types/audio';

const VoiceRecorder: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [hasMicStream, setHasMicStream] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    recordingState,
    audioSettings,
    availableDevices,
    mediaRecorder,
    audioStream,
    setAvailableDevices,
    selectAudioDevice,
    setAudioSettings,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    setAudioLevel,
    setMediaRecorder,
    setAudioStream,
  } = useRecordingStore();

  const { playback } = useVideoStore();

  // Initialize audio devices
  const initializeDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          groupId: device.groupId,
        }));
      
      setAvailableDevices(audioInputs);
      
      // Select default device if none selected
      if (!audioSettings.selectedDeviceId && audioInputs.length > 0) {
        selectAudioDevice(audioInputs[0].deviceId);
      }
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
    }
  }, [setAvailableDevices, selectAudioDevice, audioSettings.selectedDeviceId]);

  // Initialize audio stream
  const initializeAudioStream = useCallback(async () => {
    if (isInitializing) return;
    setIsInitializing(true);

    try {
      // Request permission and get stream
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: audioSettings.selectedDeviceId ? { exact: audioSettings.selectedDeviceId } : undefined,
          echoCancellation: audioSettings.echoCancellation,
          noiseSuppression: audioSettings.noiseSuppression,
          autoGainControl: false, // We'll handle gain ourselves
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setAudioStream(stream);
      setPermissionStatus('granted');
      setHasMicStream(true);

      // Set up audio context and analyser
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      // Create gain node
      const gainNode = audioContext.createGain();
      gainNode.gain.value = audioSettings.gain;

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(analyser);

      analyserRef.current = analyser;

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000,
      });

      setMediaRecorder(mediaRecorder);

      // Start monitoring audio levels
      monitorAudioLevel();
    } catch (error: any) {
      console.error('Failed to initialize audio:', error);
      if (error.name === 'NotAllowedError') {
        setPermissionStatus('denied');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [
    audioSettings,
    setAudioStream,
    setMediaRecorder,
    isInitializing,
  ]);

  // Monitor audio level
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate RMS
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const level = Math.min(100, (rms / 255) * 100 * 2); // Scale to 0-100

      setAudioLevel(level);

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, [setAudioLevel]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeDevices();
  }, [initializeDevices]);

  // Handle device change
  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', initializeDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', initializeDevices);
    };
  }, [initializeDevices]);

  const handleStartRecording = async () => {
    if (!recordingState.isRecording) {
      // Initialize stream if not already done
      if (!hasMicStream || permissionStatus !== 'granted') {
        await initializeAudioStream();
        // If we just initialized, don't start recording yet - user needs to click again
        return;
      }

      // Get mediaRecorder from the hook state
      const recorder = mediaRecorder;
      if (recorder && recorder.state === 'inactive') {
        // Start recording
        startRecording(playback.currentTime);
        recorder.start(1000); // Get data every second
        console.log('Recording started at video time:', playback.currentTime);
        
        // Start duration counter
        setRecordingDuration(0);
        durationIntervalRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 0.1);
        }, 100);
      }
    }
  };

  const handleStopRecording = async () => {
    console.log('Stopping recording...');
    
    // Stop duration counter
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setRecordingDuration(0);
    
    // Stop the media recorder and wait for the recording
    const recording = await stopRecording();
    if (recording) {
      console.log('Recording saved to store:', recording);
      // Force update the UI
      window.location.hash = '#recording-complete';
      window.location.hash = '';
    } else {
      console.error('No recording returned from stopRecording');
    }
  };

  const handleToggleMute = () => {
    if (audioStream) {
      const audioTrack = audioStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = audioSettings.isMuted;
        setAudioSettings({ isMuted: !audioSettings.isMuted });
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Voice Recording</h3>
        {permissionStatus === 'denied' && (
          <span className="text-red-500 text-sm">Microphone access denied</span>
        )}
      </div>

      {/* Device Selector */}
      <DeviceSelector
        devices={availableDevices}
        selectedDeviceId={audioSettings.selectedDeviceId}
        onSelectDevice={selectAudioDevice}
        disabled={recordingState.isRecording}
      />

      {/* Audio Level Meter - only show when mic is enabled */}
      {hasMicStream && (
        <AudioLevelMeter
          level={recordingState.audioLevel.current}
          peak={recordingState.audioLevel.peak}
          isMuted={audioSettings.isMuted}
        />
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Enable Mic / Record / Stop Button */}
        {!recordingState.isRecording ? (
          <button
            onClick={handleStartRecording}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            disabled={isInitializing}
          >
            {permissionStatus === 'granted' ? (
              <>
                <div className="w-3 h-3 bg-white rounded-full" />
                {isInitializing ? 'Initializing...' : 'Start Recording'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                {isInitializing ? 'Requesting Access...' : 'Enable Microphone'}
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={handleStopRecording}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <div className="w-3 h-3 bg-white" />
              Stop
            </button>
            {recordingState.isPaused ? (
              <button
                onClick={resumeRecording}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Resume
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Pause
              </button>
            )}
          </>
        )}

        {/* Mute Button */}
        <button
          onClick={handleToggleMute}
          className={`p-2 rounded-lg transition-colors ${
            audioSettings.isMuted
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
          title={audioSettings.isMuted ? 'Unmute' : 'Mute'}
        >
          {audioSettings.isMuted ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.086 7.5l-1.429-1.429a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Recording Status */}
      {recordingState.isRecording && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${recordingState.isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-gray-300">
              {recordingState.isPaused ? 'Paused' : 'Recording'} - {recordingDuration.toFixed(1)}s
            </span>
          </div>
          <span className="text-gray-400">
            Video time: {recordingState.startTime?.toFixed(2)}s
          </span>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;