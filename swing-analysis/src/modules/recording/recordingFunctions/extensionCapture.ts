// Extension-based capture for Chrome tabs
// Uses the Swing Analyzer Screen Capture extension to bypass picker dialog

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

export async function isExtensionAvailable(): Promise<boolean> {
  // Check if extension is installed
  if (!window.SwingCaptureExtension) {
    return false;
  }
  
  try {
    // Double-check it's working
    const isWorking = await window.SwingCaptureExtension.check();
    return isWorking;
  } catch {
    return false;
  }
}

export async function captureWithExtension(element?: HTMLElement): Promise<MediaStream | null> {
  try {
    // REMOVED LOG - console.log('[ExtensionCapture] Starting capture with extension...');
    
    if (!window.SwingCaptureExtension) {
      console.error('[ExtensionCapture] Extension not available');
      return null;
    }
    
    // Show status message to user
    showExtensionPrompt();
    
    // Start capture - this will prompt user to click extension icon
    const result = await window.SwingCaptureExtension.startCapture();
    
    hideExtensionPrompt();
    
    if (!result.success || !result.stream) {
      console.error('[ExtensionCapture] Failed to capture:', result.error);
      return null;
    }
    
    // REMOVED LOG - console.log('[ExtensionCapture] Successfully captured tab!', {
    //   hasVideo: result.hasVideo,
    //   hasAudio: result.hasAudio
    // });
    
    const stream = result.stream;
    
    // Try to crop to the video player area using Region Capture
    if ('CropTarget' in window) {
      try {
        const track = stream.getVideoTracks()[0];
        const CropTarget = (window as any).CropTarget;
        
        // REMOVED LOG - console.log('[ExtensionCapture] Region Capture check:', {
        //   hasCropTarget: !!CropTarget,
        //   hasFromElement: !!CropTarget?.fromElement,
        //   hasCropTo: !!(track as any).cropTo,
        //   trackType: track?.constructor?.name
        // });
        
        // Try method 1: cropTo with CropTarget.fromElement
        if ((track as any).cropTo && CropTarget?.fromElement) {
          // ONLY target the video-player-scaled element
          const scaledPlayer = document.getElementById('video-player-scaled');
          
          if (!scaledPlayer) {
            console.error('[ExtensionCapture] ❌ video-player-scaled element NOT FOUND!');
            // REMOVED LOG - console.log('[ExtensionCapture] Available IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
            return stream; // Return uncropped stream
          }
          
          // REMOVED LOG - console.log('[ExtensionCapture] ✅ Found video-player-scaled element:', {
          //   id: scaledPlayer.id,
          //   className: scaledPlayer.className,
          //   width: scaledPlayer.offsetWidth,
          //   height: scaledPlayer.offsetHeight,
          //   style: scaledPlayer.getAttribute('style')
          // });
          
          try {
            const target = await CropTarget.fromElement(scaledPlayer);
            if (!target) {
              console.error('[ExtensionCapture] ❌ CropTarget.fromElement returned null!');
              return stream;
            }
            
            // REMOVED LOG - console.log('[ExtensionCapture] ✅ Created CropTarget, attempting cropTo...');
            await (track as any).cropTo(target);
            // REMOVED LOG - console.log('[ExtensionCapture] ✅ cropTo() completed successfully!');
            
            // Verify the crop worked
            const settings = track.getSettings() as any;
            // REMOVED LOG - console.log('[ExtensionCapture] After crop - track settings:', {
            //   width: settings.width,
            //   height: settings.height,
            //   displaySurface: settings.displaySurface
            // });
          } catch (cropError) {
            console.error('[ExtensionCapture] ❌ Crop failed:', cropError);
          }
        } 
        // Try method 2: produceCropTarget (for same-origin elements)
        else if ((document as any).produceCropTarget && (track as any).cropTo) {
          // REMOVED LOG - console.log('[ExtensionCapture] Trying produceCropTarget method...');
          const scaledPlayer = document.getElementById('video-player-scaled');
          
          if (!scaledPlayer) {
            console.error('[ExtensionCapture] ❌ video-player-scaled element NOT FOUND!');
            return stream;
          }
          
          try {
            const target = await (scaledPlayer as any).produceCropTarget?.();
            if (target) {
              // REMOVED LOG - console.log('[ExtensionCapture] ✅ Got crop target via produceCropTarget');
              await (track as any).cropTo(target);
              // REMOVED LOG - console.log('[ExtensionCapture] ✅ cropTo() completed successfully!');
            } else {
              // REMOVED LOG - console.log('[ExtensionCapture] produceCropTarget not available on element');
            }
          } catch (e) {
            console.error('[ExtensionCapture] produceCropTarget failed:', e);
          }
        } else {
          // REMOVED LOG - console.log('[ExtensionCapture] Region Capture API not fully available');
        }
      } catch (e) {
        // REMOVED LOG - console.log('[ExtensionCapture] Could not crop to element:', e);
      }
    } else {
      // REMOVED LOG - console.log('[ExtensionCapture] CropTarget API not available');
    }
    
    return stream;
  } catch (error) {
    console.error('[ExtensionCapture] Error:', error);
    hideExtensionPrompt();
    return null;
  }
}

function showExtensionPrompt() {
  // Create overlay prompting user to click extension icon
  const overlay = document.createElement('div');
  overlay.id = 'extension-capture-prompt';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    backdrop-filter: blur(4px);
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: #1f2937;
    border: 2px solid #10b981;
    border-radius: 12px;
    padding: 32px;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  `;
  
  content.innerHTML = `
    <div style="margin-bottom: 20px;">
      <div style="
        width: 60px;
        height: 60px;
        margin: 0 auto 16px;
        background: #10b981;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
      ">
        <svg width="30" height="30" fill="white" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
        </svg>
      </div>
      <h2 style="color: #fff; margin: 0 0 8px; font-size: 24px; font-weight: bold;">
        Click Extension Icon
      </h2>
      <p style="color: #9ca3af; margin: 0; font-size: 16px;">
        Click the Swing Analyzer extension icon in your toolbar to start recording
      </p>
    </div>
    <div style="
      padding: 16px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 8px;
      margin-top: 20px;
    ">
      <p style="color: #10b981; margin: 0; font-size: 14px;">
        Look for the red "!" badge on the extension icon
      </p>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
    </style>
  `;
  
  overlay.appendChild(content);
  document.body.appendChild(overlay);
}

function hideExtensionPrompt() {
  const overlay = document.getElementById('extension-capture-prompt');
  if (overlay) {
    overlay.remove();
  }
}