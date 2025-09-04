// Attempts to capture the current tab and crop to a specific DOM element
// using the Region Capture API (Chromium-based browsers).
// Falls back by returning null if unsupported or if the user does not pick the tab.

export async function captureElementRegion(element: HTMLElement, opts?: { audio?: boolean }): Promise<MediaStream | null> {
  try {
    const audio = !!opts?.audio;
    // Ask for current tab if possible
    const displayConstraints: any = {
      video: {
        displaySurface: 'browser',
        preferCurrentTab: true,
      },
      audio: false,
    };
    const stream: MediaStream = await navigator.mediaDevices.getDisplayMedia(displayConstraints);
    const track = stream.getVideoTracks?.()[0];
    if (!track) return null;

    // @ts-expect-error: Region Capture is experimental
    const CropTarget = (window as any).CropTarget;
    // @ts-expect-error: cropTo is experimental on MediaStreamTrack
    const canCrop = !!(track as any).cropTo && !!CropTarget?.fromElement;
    if (!canCrop) {
      // Region capture not available
      return stream;
    }

    // Build a crop target from the element
    // @ts-expect-error: experimental API
    const target = await CropTarget.fromElement(element);
    if (!target) return stream;
    // @ts-expect-error: experimental API
    await (track as any).cropTo(target);

    if (audio) {
      try {
        const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        mic.getAudioTracks().forEach((t) => stream.addTrack(t));
      } catch {
        // ignore mic failures
      }
    }

    return stream;
  } catch {
    return null;
  }
}

