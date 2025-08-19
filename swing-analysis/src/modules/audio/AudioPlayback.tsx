import React, { useRef, useEffect, useState } from 'react';
import { useRecordingStore, useVideoStore, useStore } from '../../state/store';

const AudioPlayback: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { recordings, currentRecording, deleteRecording, clearAllRecordings } = useRecordingStore();
  const { playback } = useVideoStore();

  // Sync audio playback with video
  useEffect(() => {
    if (!audioRef.current || !currentRecording) return;

    const audio = audioRef.current;
    const videoTime = playback.currentTime;
    const audioStartTime = currentRecording.startTime;
    
    // Calculate where we should be in the audio
    const audioTime = videoTime - audioStartTime;

    // If video is playing and we're within the audio recording timeframe
    if (playback.isPlaying && audioTime >= 0 && audioTime <= currentRecording.duration) {
      // Sync audio position
      if (Math.abs(audio.currentTime - audioTime) > 0.1) {
        audio.currentTime = audioTime;
      }
      
      // Start audio if not playing
      if (audio.paused) {
        audio.play().catch(console.error);
        setIsPlaying(true);
      }
    } else {
      // Pause audio if outside timeframe or video is paused
      if (!audio.paused) {
        audio.pause();
        setIsPlaying(false);
      }
    }
  }, [playback.currentTime, playback.isPlaying, currentRecording]);

  // Update playback rate to match video
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playback.playbackRate;
    }
  }, [playback.playbackRate]);

  const handleSelectRecording = (recording: typeof recordings[0]) => {
    // Update the current recording in the store
    useStore.setState({ currentRecording: recording });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (recordings.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Audio Recordings</h3>
        <p className="text-gray-400 text-sm">No recordings yet. Start recording to add voiceover.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white">Audio Recordings</h3>
      
      {/* Current recording audio element - VISIBLE FOR DEBUGGING */}
      {currentRecording && (
        <div className="bg-gray-700 p-2 rounded">
          <p className="text-xs text-gray-400 mb-1">Current Audio:</p>
          <audio
            ref={audioRef}
            src={currentRecording.url}
            preload="auto"
            controls
            className="w-full"
          />
        </div>
      )}

      {/* Recordings list */}
      <div className="space-y-2">
        {recordings.map((recording) => {
          const isSelected = currentRecording?.id === recording.id;
          
          return (
            <div
              key={recording.id}
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-blue-900 border-blue-600'
                  : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }`}
              onClick={() => handleSelectRecording(recording)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Play indicator */}
                  {isSelected && isPlaying && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                  
                  <div>
                    <div className="text-sm text-white font-medium">
                      Recording {recording.id.slice(-8)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Start: {formatTime(recording.startTime)} | Duration: {recording.duration.toFixed(1)}s | Size: {(recording.blob.size / 1024).toFixed(1)}KB
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Test playback button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const audio = new Audio(recording.url);
                      audio.play();
                      console.log('Playing test audio:', recording);
                    }}
                    className="p-1 text-green-400 hover:text-green-300 transition-colors"
                    title="Test playback"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRecording(recording.id);
                    }}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete recording"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear all button */}
      {recordings.length > 0 && (
        <button
          onClick={() => {
            if (confirm('Delete all recordings?')) {
              clearAllRecordings();
            }
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
        >
          Clear All Recordings
        </button>
      )}
    </div>
  );
};

export default AudioPlayback;