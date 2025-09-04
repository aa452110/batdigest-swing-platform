export interface AudioDevice {
  deviceId: string;
  label: string;
  groupId: string;
}

export interface AudioRecording {
  id: string;
  blob: Blob;
  url: string;
  startTime: number; // Video timestamp when recording started
  duration: number;
  createdAt: number;
}

export interface AudioLevel {
  current: number; // 0-100
  peak: number; // 0-100
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  startTime: number | null;
  duration: number;
  audioLevel: AudioLevel;
}

export interface AudioSettings {
  selectedDeviceId: string | null;
  isMuted: boolean;
  gain: number; // 0-2 (0.5 = -6dB, 1 = 0dB, 2 = +6dB)
  echoCancellation: boolean;
  noiseSuppression: boolean;
}