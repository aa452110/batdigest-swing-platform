import React, { useState, useRef, useCallback } from 'react';
import { useVideoStore, useRecordingStore } from '../../state/store';

interface RecordedAnalysis {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  startTime: number;
  createdAt: number;
}

const AnalysisRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAnalyses, setRecordedAnalyses] = useState<RecordedAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef<number>(0);

  const { playback } = useVideoStore();
  const { audioStream } = useRecordingStore();

  const startAnalysisRecording = async () => {
    setError(null);
    setIsPreparing(true);

    try {
      // 1. Get microphone access first if not already enabled
      let micStream: MediaStream | null = audioStream;
      
      if (!micStream) {
        try {
          console.log('Requesting microphone access...');
          micStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            } 
          });
          console.log('Microphone access granted');
        } catch (err) {
          console.warn('Microphone access denied, recording without audio');
        }
      }
      
      // 2. Get screen/tab capture
      console.log('Requesting screen capture...');
      
      // Try to get display media - Chrome may not show tab option on localhost
      let displayStream: MediaStream;
      let hasTabAudio = false;
      
      try {
        displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'browser', // Prefer browser tab but fallback to any
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 30 },
          },
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        
        hasTabAudio = displayStream.getAudioTracks().length > 0;
        console.log('Display stream obtained, has audio:', hasTabAudio);
        
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          throw new Error('Screen recording permission denied');
        }
        throw err;
      }

      console.log('Screen capture granted');

      // Combine video from display and audio from microphone
      let combinedStream = new MediaStream();
      
      // Add video tracks from screen capture
      displayStream.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track);
        console.log('Added video track:', track.label);
      });
      
      // Add microphone audio if we have it
      if (micStream && micStream.getAudioTracks().length > 0) {
        micStream.getAudioTracks().forEach(track => {
          combinedStream.addTrack(track);
          console.log('Added microphone audio track:', track.label);
        });
      } else {
        console.log('No microphone audio - recording video only');
      }
      
      // Also add any tab audio if available
      if (hasTabAudio) {
        displayStream.getAudioTracks().forEach(track => {
          combinedStream.addTrack(track);
          console.log('Added tab audio track:', track.label);
        });
      }

      console.log('Combined stream tracks:', {
        video: combinedStream.getVideoTracks().length,
        audio: combinedStream.getAudioTracks().length,
      });

      // 7. Create MediaRecorder
      // Check available codecs - try simpler ones first for better compatibility
      const codecs = [
        'video/webm',
        'video/webm;codecs=vp8',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
      ];
      
      let mimeType = 'video/webm';
      for (const codec of codecs) {
        if (MediaRecorder.isTypeSupported(codec)) {
          mimeType = codec;
          console.log('Using codec:', codec);
          break;
        }
      }
      
      // Create recorder with lower bitrate for better compatibility
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 1000000, // 1 Mbps (reduced for better compatibility)
      });
      
      console.log('MediaRecorder created with mimeType:', recorder.mimeType);
      console.log('MediaRecorder stream active:', combinedStream.active);
      console.log('MediaRecorder stream tracks:', {
        video: combinedStream.getVideoTracks().map(t => ({
          id: t.id,
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted,
        })),
        audio: combinedStream.getAudioTracks().map(t => ({
          id: t.id,
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted,
        })),
      });

      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        console.log('Data available event - size:', e.data?.size || 0);
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log(`Chunk #${chunksRef.current.length}: ${e.data.size} bytes`);
        } else {
          console.warn('Empty data chunk received');
        }
      };
      
      recorder.onerror = (e: any) => {
        console.error('MediaRecorder error:', e);
        setError('Recording error: ' + (e.error?.message || e.toString()));
      };
      
      recorder.onstart = () => {
        console.log('MediaRecorder started successfully');
        chunksRef.current = []; // Clear any old chunks
      };


      recorder.onerror = (e) => {
        console.error('Recording error:', e);
        setError('Recording failed: ' + e);
        setIsRecording(false);
      };

      // Handle display stream ending (user stops sharing)
      displayStream.getVideoTracks()[0].onended = () => {
        console.log('Screen sharing stopped by user');
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopAnalysisRecording();
        }
      };

      // Start recording
      mediaRecorderRef.current = recorder;
      
      // Log recorder state
      console.log('MediaRecorder state before start:', recorder.state);
      console.log('MediaRecorder stream:', combinedStream);
      console.log('Stream tracks:', {
        video: combinedStream.getVideoTracks().map(t => ({ 
          label: t.label, 
          enabled: t.enabled, 
          muted: t.muted,
          readyState: t.readyState 
        })),
        audio: combinedStream.getAudioTracks().map(t => ({ 
          label: t.label, 
          enabled: t.enabled, 
          muted: t.muted,
          readyState: t.readyState 
        })),
      });
      
      // Try to start recording
      try {
        // Start with a timeslice to force regular data delivery
        recorder.start(1000); // Get data every 1 second
        startTimeRef.current = Date.now();
        console.log('MediaRecorder started with 1s timeslice, state:', recorder.state);
        
        // Handle recording stop
        recorder.onstop = () => {
          console.log('Recording stopped, processing...');
          console.log('Total chunks collected:', chunksRef.current.length);
          console.log('Chunk sizes:', chunksRef.current.map(c => c.size));
          
          if (chunksRef.current.length === 0) {
            console.error('No data chunks collected!');
            setError('Recording failed - no data captured');
            setIsRecording(false);
            setRecordingDuration(0);
            return;
          }
          
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const duration = (Date.now() - startTimeRef.current) / 1000;

          const analysis: RecordedAnalysis = {
            id: `analysis-${Date.now()}`,
            blob,
            url,
            duration,
            startTime: playback.currentTime,
            createdAt: Date.now(),
          };

          console.log('Analysis recording complete:', {
            size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
            duration: duration.toFixed(1) + 's',
            chunks: chunksRef.current.length,
          });

          setRecordedAnalyses(prev => [...prev, analysis]);
          
          // Clean up
          displayStream.getTracks().forEach(track => track.stop());
          
          // Stop duration counter
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
          }
          
          setIsRecording(false);
          setRecordingDuration(0);
        };
        
        // Check recording status after 3 seconds
        setTimeout(() => {
          if (chunksRef.current.length === 0 && recorder.state === 'recording') {
            console.warn('No data received after 3 seconds - check browser console for errors');
            console.log('Stream active:', combinedStream.active);
            console.log('Tracks:', combinedStream.getTracks().map(t => ({
              kind: t.kind,
              label: t.label,
              enabled: t.enabled,
              readyState: t.readyState
            })));
          } else if (chunksRef.current.length > 0) {
            console.log(`Recording working! ${chunksRef.current.length} chunks received`);
          }
        }, 3000);
      } catch (err: any) {
        console.error('Failed to start MediaRecorder:', err);
        throw new Error('Failed to start recording: ' + err.message);
      }
      
      // Start duration counter
      setRecordingDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1);
      }, 100);

      setIsRecording(true);
      setIsPreparing(false);
      console.log('Analysis recording started');

    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setError(err.message || 'Failed to start screen recording');
      setIsPreparing(false);
    }
  };

  const stopAnalysisRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('Stopping analysis recording...');
    }
  };

  const deleteAnalysis = (id: string) => {
    setRecordedAnalyses(prev => {
      const analysis = prev.find(a => a.id === id);
      if (analysis) {
        URL.revokeObjectURL(analysis.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Record Analysis</h3>
          {error && (
            <span className="text-red-500 text-sm">{error}</span>
          )}
        </div>

        <div className="space-y-3">
          {!isRecording ? (
            <button
              onClick={startAnalysisRecording}
              disabled={isPreparing}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <div className="w-3 h-3 bg-white rounded-full" />
              {isPreparing ? 'Preparing...' : 'Start Recording Analysis'}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={stopAnalysisRecording}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <div className="w-3 h-3 bg-white" />
                Stop Recording
              </button>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-gray-300">Recording Analysis</span>
                </div>
                <span className="text-gray-400">
                  {recordingDuration.toFixed(1)}s
                </span>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400 space-y-1">
            <div className="bg-blue-900 text-blue-200 p-2 rounded mb-2">
              <p className="font-semibold">📹 Recording will capture:</p>
              <ul className="text-xs ml-2 mt-1">
                <li>• Your screen (video analysis)</li>
                <li>• Your microphone (voice narration)</li>
                <li>• All annotations and scrubbing</li>
              </ul>
              <p className="text-xs mt-2 text-yellow-300">💡 Tip: No need to enable mic separately - it's automatic!</p>
            </div>
            <p className="text-gray-500">When prompted, select "Entire Screen" or "Window"</p>
          </div>
        </div>
      </div>

      {/* Recorded Analyses */}
      {recordedAnalyses.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="text-md font-semibold text-white">Recorded Analyses</h4>
          
          {recordedAnalyses.map(analysis => (
            <div key={analysis.id} className="bg-gray-700 rounded-lg p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-white font-medium">
                      Analysis {analysis.id.slice(-8)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Duration: {formatDuration(analysis.duration)} | 
                      Size: {(analysis.blob.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAnalysis(analysis.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {/* Video Preview - Simple playback without seeking */}
                <video
                  src={analysis.url}
                  controls
                  controlsList="nodownload nofullscreen noremoteplayback"
                  className="w-full rounded"
                  style={{ maxHeight: '200px' }}
                  preload="metadata"
                  onSeeking={(e) => {
                    // Prevent seeking by resetting to current time
                    const video = e.currentTarget;
                    if (video.duration && !isNaN(video.duration)) {
                      video.currentTime = video.currentTime;
                    }
                  }}
                />
                <div className="bg-blue-900 text-blue-200 p-2 rounded text-xs">
                  <p className="font-semibold">📹 Preview Info:</p>
                  <p>• Use play/pause to review</p>
                  <p>• Download for full editing capabilities</p>
                  <p>• WebM format (ready for video editors)</p>
                </div>
                
                {/* Download Button */}
                <a
                  href={analysis.url}
                  download={`analysis-${analysis.id}.webm`}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysisRecorder;