// Attempts to capture the current tab and crop to a specific DOM element
// using the Region Capture API (Chromium-based browsers).
// Falls back by returning null if unsupported or if the user does not pick the tab.

export async function captureElementRegion(element: HTMLElement, opts?: { audio?: boolean }): Promise<MediaStream | null> {
  try {
    // Debug: Check browser support
    // REMOVED LOG - console.log('[RegionCapture] Browser info:', {
    //   userAgent: navigator.userAgent,
    //   hasCropTarget: 'CropTarget' in window,
    //   hasGetDisplayMedia: 'getDisplayMedia' in navigator.mediaDevices,
    //   documentHasFocus: document.hasFocus(),
    //   windowLocation: window.location.href,
    //   isSecureContext: window.isSecureContext,
    // });

    const audio = !!opts?.audio;
    // Ensure this tab is foreground
    try { 
      window.focus(); 
      // REMOVED LOG - console.log('[RegionCapture] Called window.focus()');
    } catch (e) {
      // REMOVED LOG - console.log('[RegionCapture] window.focus() failed:', e);
    }
    
    // Ask for current tab explicitly with 720p max resolution
    const displayConstraints: any = {
      video: {
        displaySurface: 'browser',
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        cursor: 'always',
        // Add resolution constraints for 720p capture
        width: { ideal: 1280, max: 1280 },
        height: { ideal: 720, max: 720 },
      },
      audio: audio, // capture tab audio if requested
    };
    
    // REMOVED LOG - console.log('[RegionCapture] Calling getDisplayMedia with constraints:', JSON.stringify(displayConstraints, null, 2));
    
    const stream: MediaStream = await navigator.mediaDevices.getDisplayMedia(displayConstraints);
    const track = stream.getVideoTracks?.()[0];
    if (!track) return null;

    // @ts-expect-error: Region Capture is experimental
    const CropTarget = (window as any).CropTarget;
    // @ts-expect-error: cropTo is experimental on MediaStreamTrack
    const canCrop = !!(track as any).cropTo && !!CropTarget?.fromElement;
    if (!canCrop) {
      // Region capture not available - return full tab stream (caller may decide)
      return stream;
    }

    // Build a crop target from the element
    // @ts-expect-error: experimental API
    const target = await CropTarget.fromElement(element);
    if (!target) return stream;
    // @ts-expect-error: experimental API
    await (track as any).cropTo(target);

    // Do not add mic here; mic is managed by recording engine to avoid duplicates

    // Debug: verify what we actually captured
    try {
      const settings: any = (track as any).getSettings?.() || {};
      const capabilities: any = (track as any).getCapabilities?.() || {};
      // REMOVED LOG - console.log('[RegionCapture] Capture successful!', {
      //   displaySurface: settings.displaySurface,
      //   width: settings.width,
      //   height: settings.height,
      //   frameRate: settings.frameRate,
      //   cursor: settings.cursor,
      //   logicalSurface: settings.logicalSurface,
      //   trackLabel: track.label,
      //   trackId: track.id,
      //   capabilities: capabilities,
      // });
      
      if (settings.displaySurface !== 'browser') {
        console.warn('[RegionCapture] ⚠️ Did NOT capture a browser tab! Got:', settings.displaySurface);
        console.warn('[RegionCapture] This means Region Capture will NOT work. User selected:', 
          settings.displaySurface === 'monitor' ? 'Entire Screen' : 
          settings.displaySurface === 'window' ? 'A Window' : 
          settings.displaySurface);
      } else {
        // REMOVED LOG - console.log('[RegionCapture] ✅ Successfully captured a browser tab!');
      }
    } catch (e) {
      console.error('[RegionCapture] Failed to get track settings:', e);
    }

    return stream;
  } catch (error) {
    console.error('[RegionCapture] Failed to capture:', error);
    if (error instanceof DOMException) {
      console.error('[RegionCapture] DOMException details:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
    }
    return null;
  }
}
