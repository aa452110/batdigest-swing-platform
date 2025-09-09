import React, { useState, useRef } from 'react';
import { useSimpleRecording } from '../modules/recording/recordingHooks/useSimpleRecording';

const TestAudioPage: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to test');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordingUrl, setRecordingUrl] = useState<string>('');
  
  // Add simple recording hook
  const {
    isRecording: isSimpleRecording,
    recordingUrl: simpleRecordingUrl,
    startSimpleRecording,
    stopSimpleRecording
  } = useSimpleRecording();

  const testMicrophone = async () => {
    try {
      setStatus('Requesting microphone...');
      
      // Simple microphone request
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      
      const audioTrack = stream.getAudioTracks()[0];
      setStatus(`Got microphone: ${audioTrack.label}`);
      console.log('Audio track settings:', audioTrack.getSettings());
      
      // Set up audio level monitoring
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.round(average));
      };
      
      const interval = setInterval(checkLevel, 100);
      
      // Clean up after 5 seconds
      setTimeout(() => {
        clearInterval(interval);
        stream.getTracks().forEach(t => t.stop());
        audioContext.close();
        setStatus('Microphone test complete');
        setAudioLevel(0);
      }, 5000);
      
    } catch (error) {
      setStatus(`Error: ${error}`);
      console.error('Microphone test failed:', error);
    }
  };

  const testRecording = async () => {
    try {
      setStatus('Starting recording test...');
      chunksRef.current = [];
      
      // Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setStatus('Got microphone, creating MediaRecorder...');
      
      // Test different mime types
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      }
      
      console.log('Using mimeType:', mimeType);
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log('Chunk received:', e.data.size, 'bytes');
        }
      };
      
      recorder.onstop = () => {
        console.log('Recording stopped, chunks:', chunksRef.current.length);
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        setStatus(`Recording complete! Size: ${blob.size} bytes`);
        
        // Test playback
        const audio = new Audio(url);
        audio.volume = 0.5;
        audio.play().catch(e => console.error('Playback failed:', e));
      };
      
      recorder.start(100); // Get chunks every 100ms
      setStatus('Recording for 3 seconds... Speak now!');
      
      // Stop after 3 seconds
      setTimeout(() => {
        recorder.stop();
        stream.getTracks().forEach(t => t.stop());
      }, 3000);
      
    } catch (error) {
      setStatus(`Recording error: ${error}`);
      console.error('Recording test failed:', error);
    }
  };

  const testVideoWithAudio = async () => {
    try {
      setStatus('Creating video+audio stream...');
      
      // Create a simple canvas stream for video
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d')!;
      
      // Draw something
      ctx.fillStyle = 'blue';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.fillText('Audio Test', 200, 240);
      
      const videoStream = canvas.captureStream(30);
      
      // Get microphone
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Combine streams
      const combinedStream = new MediaStream();
      videoStream.getVideoTracks().forEach(t => combinedStream.addTrack(t));
      audioStream.getAudioTracks().forEach(t => combinedStream.addTrack(t));
      
      console.log('Combined stream:');
      console.log('  Video tracks:', combinedStream.getVideoTracks().length);
      console.log('  Audio tracks:', combinedStream.getAudioTracks().length);
      
      // Record
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(combinedStream, { 
        mimeType: 'video/webm;codecs=vp9,opus' 
      });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        setStatus(`Video+Audio recording complete! Size: ${blob.size} bytes`);
      };
      
      recorder.start(100);
      setStatus('Recording video+audio for 3 seconds...');
      
      setTimeout(() => {
        recorder.stop();
        combinedStream.getTracks().forEach(t => t.stop());
      }, 3000);
      
    } catch (error) {
      setStatus(`Video+Audio error: ${error}`);
      console.error('Video+Audio test failed:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Audio Capture Debug Tool</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Status</h2>
          <p className="text-green-400 font-mono">{status}</p>
          {audioLevel > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-400">Audio Level: {audioLevel}</p>
              <div className="w-full bg-gray-700 h-4 rounded">
                <div 
                  className="bg-green-500 h-4 rounded transition-all"
                  style={{ width: `${Math.min(100, audioLevel)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={testMicrophone}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Test 1: Basic Microphone Access (5 seconds)
          </button>

          <button
            onClick={testRecording}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
          >
            Test 2: Audio Recording (3 seconds)
          </button>

          <button
            onClick={testVideoWithAudio}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Test 3: Video + Audio Recording (3 seconds)
          </button>

          <button
            onClick={isSimpleRecording ? stopSimpleRecording : startSimpleRecording}
            className={`w-full ${isSimpleRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'} text-white py-2 px-4 rounded`}
          >
            Test 4: {isSimpleRecording ? 'Stop' : 'Start'} Simple Display + Mic Recording (no canvas)
          </button>
        </div>

        {(recordingUrl || simpleRecordingUrl) && (
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Playback</h2>
            <video 
              src={recordingUrl || simpleRecordingUrl} 
              controls 
              className="w-full"
              style={{ maxHeight: '300px' }}
            />
            <audio 
              src={recordingUrl || simpleRecordingUrl} 
              controls 
              className="w-full mt-2"
            />
          </div>
        )}

        <div className="bg-yellow-900 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click Test 1 to verify microphone permission</li>
            <li>Speak during the test - you should see audio levels</li>
            <li>Click Test 2 to record pure audio</li>
            <li>Click Test 3 to record video+audio like the main app</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestAudioPage;