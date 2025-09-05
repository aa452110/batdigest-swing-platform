import React, { useState } from 'react';

const TestCapturePage: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to test');
  const [capturedSurface, setCapturedSurface] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Test with ONLY preferCurrentTab - no other constraints
  const testPreferCurrentOnly = () => {
    console.log('=== PREFER CURRENT TAB ONLY TEST ===');
    setStatus('Testing preferCurrentTab alone...');
    
    navigator.mediaDevices.getDisplayMedia({
      video: {
        preferCurrentTab: true
      }
    }).then(s => {
      const track = s.getVideoTracks()[0];
      const settings = track.getSettings() as any;
      console.log('preferCurrentTab only - settings:', settings);
      setStatus(`Got: ${settings.displaySurface || 'unknown'}`);
      setCapturedSurface(settings.displaySurface || 'unknown');
      s.getTracks().forEach(t => t.stop());
    }).catch((e: any) => {
      console.error('Failed:', e.message);
      setStatus(`Failed: ${e.message}`);
    });
  };

  // Test with systemAudio (older Chrome API)
  const testWithSystemAudio = () => {
    console.log('=== SYSTEM AUDIO TEST ===');
    setStatus('Testing with systemAudio...');
    
    navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: {
        autoGainControl: false,
        echoCancellation: false,
        noiseSuppression: false,
        sampleRate: 48000
      },
      systemAudio: 'include' // Older API
    } as any).then(s => {
      const track = s.getVideoTracks()[0];
      const settings = track.getSettings() as any;
      console.log('systemAudio test - settings:', settings);
      setStatus(`Got: ${settings.displaySurface || 'unknown'}`);
      setCapturedSurface(settings.displaySurface || 'unknown');
      s.getTracks().forEach(t => t.stop());
    }).catch((e: any) => {
      console.error('Failed:', e.message);
      setStatus(`Failed: ${e.message}`);
    });
  };

  // Test with preferCurrentTab BUT in a Promise chain
  const testDelayedCurrentTab = () => {
    console.log('=== DELAYED CURRENT TAB TEST ===');
    setStatus('Testing with delayed resolution...');
    
    // First, get basic capture
    navigator.mediaDevices.getDisplayMedia({
      video: true
    }).then(s => {
      const track = s.getVideoTracks()[0];
      const settings = track.getSettings() as any;
      console.log('Initial capture:', settings.displaySurface);
      
      // Stop this stream
      s.getTracks().forEach(t => t.stop());
      
      // Now try again with preferCurrentTab
      return navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          preferCurrentTab: true
        }
      });
    }).then(s => {
      const track = s.getVideoTracks()[0];
      const settings = track.getSettings() as any;
      console.log('Second capture:', settings.displaySurface);
      setStatus(`Second attempt: ${settings.displaySurface || 'unknown'}`);
      setCapturedSurface(settings.displaySurface || 'unknown');
      s.getTracks().forEach(t => t.stop());
    }).catch((e: any) => {
      console.error('Failed:', e.message);
      setStatus(`Failed: ${e.message}`);
    });
  };

  // Check what surfaces are theoretically available
  const checkCapabilities = async () => {
    console.log('=== CHECKING CAPABILITIES ===');
    setStatus('Checking capabilities...');
    
    try {
      // Get any stream first
      const tempStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = tempStream.getVideoTracks()[0];
      
      // Check capabilities
      const capabilities = (track as any).getCapabilities?.();
      const settings = track.getSettings() as any;
      
      console.log('Track capabilities:', capabilities);
      console.log('Track settings:', settings);
      console.log('Track label:', track.label);
      
      // Check if track supports applyConstraints
      if ((track as any).applyConstraints) {
        console.log('Track supports applyConstraints');
        try {
          await (track as any).applyConstraints({
            displaySurface: 'browser'
          });
          console.log('Applied browser constraint successfully');
        } catch (e) {
          console.log('Could not apply browser constraint:', e);
        }
      }
      
      tempStream.getTracks().forEach(t => t.stop());
      setStatus('Check console for capabilities');
    } catch (e: any) {
      console.error('Capabilities check failed:', e);
      setStatus('Capabilities check failed');
    }
  };

  // The most basic possible test
  const testAbsoluteMinimal = () => {
    console.log('=== ABSOLUTE MINIMAL TEST ===');
    console.log('Just calling getDisplayMedia({video: true})');
    setStatus('Testing absolute minimal...');
    
    navigator.mediaDevices.getDisplayMedia({ video: true })
      .then(s => {
        const track = s.getVideoTracks()[0];
        const settings = track.getSettings() as any;
        console.log('Minimal settings:', settings);
        console.log('Did you see the current tab in the picker?');
        setStatus(`Got: ${settings.displaySurface || 'unknown'} - Was current tab visible?`);
        setCapturedSurface(settings.displaySurface || 'unknown');
        s.getTracks().forEach(t => t.stop());
      })
      .catch((e: any) => {
        console.error('Even minimal failed:', e);
        setStatus(`Minimal failed: ${e.message}`);
      });
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
      setStatus('Stream stopped');
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
      <h1>Tab Capture Debug Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#222', borderRadius: '8px' }}>
        <h2>Critical Question:</h2>
        <p style={{ fontSize: '18px', color: '#ff9900' }}>
          When you click these buttons, do you SEE the Chrome picker dialog?
        </p>
        <p>
          If YES → The current tab is missing from the list (that's our bug)<br/>
          If NO → Chrome is blocking before showing picker (permission issue)
        </p>
      </div>

      <div style={{
        padding: '20px',
        backgroundColor: capturedSurface === 'browser' ? '#0f7938' : '#333',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Status: {status}</h2>
        {capturedSurface && <p>Captured surface type: {capturedSurface}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testAbsoluteMinimal}
          style={{
            padding: '15px',
            backgroundColor: '#ff0000',
            color: '#fff',
            border: '2px solid #ff6666',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          🔴 MINIMAL - Just {`{video: true}`}
        </button>

        <button 
          onClick={testPreferCurrentOnly}
          style={{
            padding: '15px',
            backgroundColor: '#ff6600',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          preferCurrentTab ONLY
        </button>

        <button 
          onClick={testWithSystemAudio}
          style={{
            padding: '15px',
            backgroundColor: '#6600ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          With systemAudio (old API)
        </button>

        <button 
          onClick={testDelayedCurrentTab}
          style={{
            padding: '15px',
            backgroundColor: '#00ff66',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Two-step capture
        </button>

        <button 
          onClick={checkCapabilities}
          style={{
            padding: '15px',
            backgroundColor: '#ff00ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Check Capabilities
        </button>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
        <h3>What we now know:</h3>
        <ul>
          <li>✅ You CAN see the picker dialog</li>
          <li>✅ You CAN select other tabs</li>
          <li>❌ The current tab is not in the list</li>
          <li>❌ "Permission denied" = you're canceling because the tab isn't there</li>
        </ul>
        
        <h3 style={{ marginTop: '20px', color: '#ff9900' }}>The Real Issue:</h3>
        <p>
          Chrome is hiding the current tab from the picker, even with selfBrowserSurface: 'include'.
          This might be a Chrome version issue or a flag that needs to be enabled.
        </p>
        
        <h3 style={{ marginTop: '20px' }}>Check these Chrome flags:</h3>
        <p style={{ fontFamily: 'monospace', backgroundColor: '#000', padding: '10px', borderRadius: '4px' }}>
          chrome://flags/#enable-experimental-web-platform-features<br/>
          chrome://flags/#getDisplayMediaSetAutoSelectAllScreens<br/>
          chrome://flags/#capture-handle
        </p>
      </div>
    </div>
  );
};

export default TestCapturePage;