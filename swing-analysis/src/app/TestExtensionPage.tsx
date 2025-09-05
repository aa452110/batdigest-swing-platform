import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    SwingCaptureExtension?: {
      isInstalled: boolean;
      version: string;
      startCapture: () => Promise<{
        success: boolean;
        streamId: string;
        stream?: MediaStream;
        hasVideo?: boolean;
        hasAudio?: boolean;
        error?: string;
      }>;
      stopCapture: (streamId: string) => Promise<void>;
      getStream: (streamId: string) => MediaStream | undefined;
      check: () => Promise<boolean>;
    };
  }
}

const TestExtensionPage: React.FC = () => {
  const [extensionDetected, setExtensionDetected] = useState(false);
  const [captureResult, setCaptureResult] = useState<any>(null);
  const [status, setStatus] = useState('Checking for extension...');
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);

  useEffect(() => {
    // Check for extension
    const checkExtension = async () => {
      // Wait a bit for extension to inject
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (window.SwingCaptureExtension) {
        setExtensionDetected(true);
        setStatus('✅ Extension detected! Version: ' + window.SwingCaptureExtension.version);
        
        // Double-check it's working
        const isWorking = await window.SwingCaptureExtension.check();
        if (isWorking) {
          setStatus('✅ Extension is fully operational!');
        } else {
          setStatus('⚠️ Extension detected but not responding');
        }
      } else {
        setExtensionDetected(false);
        setStatus('❌ Extension not detected. Please install and refresh.');
      }
    };

    checkExtension();

    // Also listen for the ready event
    const handleReady = () => {
      console.log('Extension ready event received!');
      checkExtension();
    };
    
    window.addEventListener('SwingCaptureExtension-Ready', handleReady);
    return () => window.removeEventListener('SwingCaptureExtension-Ready', handleReady);
  }, []);

  const startCapture = async () => {
    if (!window.SwingCaptureExtension) {
      setStatus('❌ Extension not available');
      return;
    }

    try {
      setStatus('📹 Starting capture...');
      console.log('Calling SwingCaptureExtension.startCapture()...');
      
      const result = await window.SwingCaptureExtension.startCapture();
      console.log('Capture result:', result);
      
      setCaptureResult(result);
      setActiveStreamId(result.streamId);
      
      if (result.success && result.stream) {
        setStatus(`✅ Capture started! Stream ID: ${result.streamId}`);
        
        // The extension already gave us the stream!
        const stream = result.stream;
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack?.getSettings() as any;
        
        console.log('Got stream from extension:', {
          displaySurface: settings?.displaySurface || 'tab',
          width: settings?.width,
          height: settings?.height,
          hasVideo: result.hasVideo,
          hasAudio: result.hasAudio
        });
        
        // Display in video element
        const video = document.getElementById('test-video') as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
        }
        
        setStatus(`✅ Streaming tab! No picker dialog!`);
      } else if (result.success) {
        setStatus(`✅ Capture started but no stream returned`);
      } else {
        setStatus(`❌ Capture failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Capture error:', error);
      setStatus(`❌ Error: ${error.message}`);
      setCaptureResult({ error: error.message });
    }
  };

  const stopCapture = async () => {
    if (!window.SwingCaptureExtension || !activeStreamId) {
      return;
    }

    try {
      setStatus('⏹️ Stopping capture...');
      await window.SwingCaptureExtension.stopCapture(activeStreamId);
      setStatus('✅ Capture stopped');
      setActiveStreamId(null);
      setCaptureResult(null);
      
      // Stop video display
      const video = document.getElementById('test-video') as HTMLVideoElement;
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
    } catch (error: any) {
      console.error('Stop error:', error);
      setStatus(`❌ Stop error: ${error.message}`);
    }
  };

  return (
    <div style={{
      padding: '40px',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      minHeight: '100vh',
      fontFamily: 'monospace'
    }}>
      <h1>Extension Integration Test</h1>
      
      <div style={{
        padding: '20px',
        backgroundColor: extensionDetected ? '#0f7938' : '#8b0000',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Status: {status}</h2>
        {extensionDetected && (
          <p>The extension is installed and ready to use!</p>
        )}
      </div>

      {captureResult && (
        <div style={{
          padding: '20px',
          backgroundColor: '#1e3a8a',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>Capture Result:</h3>
          <pre>{JSON.stringify(captureResult, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={startCapture}
          disabled={!extensionDetected || !!activeStreamId}
          style={{
            padding: '15px 30px',
            backgroundColor: !extensionDetected || activeStreamId ? '#666' : '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: !extensionDetected || activeStreamId ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔴 Start Extension Capture
        </button>

        {activeStreamId && (
          <button
            onClick={stopCapture}
            style={{
              padding: '15px 30px',
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ⏹️ Stop Capture
          </button>
        )}
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>Video Preview:</h3>
        <video
          id="test-video"
          autoPlay
          playsInline
          muted
          style={{
            width: '640px',
            height: '360px',
            backgroundColor: '#000',
            border: '2px solid #444',
            borderRadius: '8px'
          }}
        />
      </div>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#2a2a2a',
        borderRadius: '8px'
      }}>
        <h3>How this works:</h3>
        <ol>
          <li>Extension captures the current tab using chrome.tabCapture</li>
          <li>No picker dialog is shown!</li>
          <li>Stream is available for recording</li>
          <li>Can be cropped to specific elements using Region Capture</li>
        </ol>
        
        <h3 style={{ marginTop: '20px' }}>Console API:</h3>
        <p>Try in console: <code>window.SwingCaptureExtension</code></p>
      </div>
    </div>
  );
};

export default TestExtensionPage;