// Attempts to capture the current tab and crop to a specific DOM element
// using the Region Capture API (Chromium-based browsers).
// Falls back by returning null if unsupported or if the user does not pick the tab.

export async function captureElementRegion(element: HTMLElement, opts?: { audio?: boolean }): Promise<MediaStream | null> {
  try {
    const audio = !!opts?.audio;
    // Ensure this tab is foreground
    try { window.focus(); } catch {}
    // Ask for current tab explicitly
    const displayConstraints: any = {
      video: {
        displaySurface: 'browser',
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        cursor: 'always',
      },
      audio: audio, // capture tab audio if requested
    };
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
      console.log('[RegionCapture] displaySurface:', settings.displaySurface, 'width:', settings.width, 'height:', settings.height);
    } catch {}

    return stream;
  } catch {
    return null;
  }
}
