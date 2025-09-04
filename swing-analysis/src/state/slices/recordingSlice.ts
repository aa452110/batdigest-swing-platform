import type { StateCreator } from 'zustand';
import type { AudioDevice, AudioRecording, RecordingState, AudioSettings } from '../../types/audio';

export interface RecordingSlice {
  // State
  recordings: AudioRecording[];
  currentRecording: AudioRecording | null;
  recordingState: RecordingState;
  audioSettings: AudioSettings;
  availableDevices: AudioDevice[];
  mediaRecorder: MediaRecorder | null;
  audioStream: MediaStream | null;

  // Actions
  setAvailableDevices: (devices: AudioDevice[]) => void;
  selectAudioDevice: (deviceId: string) => void;
  setAudioSettings: (settings: Partial<AudioSettings>) => void;
  startRecording: (videoTimestamp: number) => void;
  stopRecording: () => Promise<AudioRecording | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  deleteRecording: (id: string) => void;
  clearAllRecordings: () => void;
  setAudioLevel: (level: number) => void;
  setMediaRecorder: (recorder: MediaRecorder | null) => void;
  setAudioStream: (stream: MediaStream | null) => void;
}

export const createRecordingSlice: StateCreator<RecordingSlice> = (set, get) => ({
  // Initial state
  recordings: [],
  currentRecording: null,
  recordingState: {
    isRecording: false,
    isPaused: false,
    startTime: null,
    duration: 0,
    audioLevel: {
      current: 0,
      peak: 0,
    },
  },
  audioSettings: {
    selectedDeviceId: null,
    isMuted: false,
    gain: 1,
    echoCancellation: true,
    noiseSuppression: true,
  },
  availableDevices: [],
  mediaRecorder: null,
  audioStream: null,

  // Actions
  setAvailableDevices: (devices) => {
    set({ availableDevices: devices });
  },

  selectAudioDevice: (deviceId) => {
    set((state) => ({
      audioSettings: { ...state.audioSettings, selectedDeviceId: deviceId },
    }));
  },

  setAudioSettings: (settings) => {
    set((state) => ({
      audioSettings: { ...state.audioSettings, ...settings },
    }));
  },

  startRecording: (videoTimestamp) => {
    set({
      recordingState: {
        isRecording: true,
        isPaused: false,
        startTime: videoTimestamp,
        duration: 0,
        audioLevel: { current: 0, peak: 0 },
      },
    });
  },

  stopRecording: async () => {
    const { mediaRecorder, recordingState } = get();
    
    if (!mediaRecorder || !recordingState.isRecording) {
      console.error('Cannot stop - no active recording');
      return null;
    }

    console.log('Stopping MediaRecorder, state:', mediaRecorder.state);
    
    // Simply stop the recorder - handlers should already be set up
    if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    
    // Update state
    set((state) => ({
      recordingState: {
        ...state.recordingState,
        isRecording: false,
        isPaused: false,
      },
    }));
    
    // Return a placeholder - the actual recording will be handled by the ondataavailable/onstop handlers
    return null;
  },

  pauseRecording: () => {
    const { mediaRecorder } = get();
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      set((state) => ({
        recordingState: { ...state.recordingState, isPaused: true },
      }));
    }
  },

  resumeRecording: () => {
    const { mediaRecorder } = get();
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      set((state) => ({
        recordingState: { ...state.recordingState, isPaused: false },
      }));
    }
  },

  deleteRecording: (id) => {
    set((state) => {
      const recording = state.recordings.find((r) => r.id === id);
      if (recording) {
        URL.revokeObjectURL(recording.url);
      }
      return {
        recordings: state.recordings.filter((r) => r.id !== id),
        currentRecording: state.currentRecording?.id === id ? null : state.currentRecording,
      };
    });
  },

  clearAllRecordings: () => {
    const { recordings } = get();
    recordings.forEach((recording) => {
      URL.revokeObjectURL(recording.url);
    });
    set({
      recordings: [],
      currentRecording: null,
    });
  },

  setAudioLevel: (level) => {
    set((state) => ({
      recordingState: {
        ...state.recordingState,
        audioLevel: {
          current: level,
          peak: Math.max(level, state.recordingState.audioLevel.peak),
        },
      },
    }));
  },

  setMediaRecorder: (recorder) => {
    if (recorder) {
      const chunks: Blob[] = [];
      let startTime = 0;
      let recordingStartTimestamp = 0;
      
      // Set up handlers when recorder is created
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          console.log('Audio chunk received:', e.data.size, 'bytes');
        }
      };

      recorder.onstart = () => {
        console.log('MediaRecorder started');
        chunks.length = 0; // Clear any old chunks
        recordingStartTimestamp = Date.now();
        const state = get();
        startTime = state.recordingState.startTime || 0;
      };

      recorder.onstop = () => {
        console.log('MediaRecorder stopped, chunks:', chunks.length);
        
        if (chunks.length === 0) {
          console.error('No audio data recorded!');
          return;
        }
        
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        const url = URL.createObjectURL(blob);
        const duration = (Date.now() - recordingStartTimestamp) / 1000;
        
        const recording: AudioRecording = {
          id: `rec-${Date.now()}`,
          blob,
          url,
          startTime: startTime,
          duration: duration,
          createdAt: Date.now(),
        };

        console.log('Recording complete:', recording);
        console.log('Blob size:', blob.size, 'bytes');
        
        // Add to store
        set((state) => ({
          recordings: [...state.recordings, recording],
          currentRecording: recording,
        }));
        
        // Test playback
        const testAudio = new Audio(url);
        testAudio.volume = 0.3;
        testAudio.play().then(() => {
          console.log('Test playback successful');
          setTimeout(() => testAudio.pause(), 500);
        }).catch(err => {
          console.error('Test playback failed:', err);
        });
      };
    }
    
    set({ mediaRecorder: recorder });
  },

  setAudioStream: (stream) => {
    const { audioStream } = get();
    // Clean up old stream
    if (audioStream && audioStream !== stream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
    set({ audioStream: stream });
  },
});