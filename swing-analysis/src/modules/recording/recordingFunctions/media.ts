// Cross-browser helper to request display media with cursor shown,
// while avoiding strict lib.dom typing issues in TS.
export type DisplayMediaVideoOptions = MediaTrackConstraints & {
  // Not always present in older lib.dom typings
  cursor?: 'always' | 'motion' | 'never';
};

export async function getDisplayMediaWithCursor(options?: { audio?: boolean }) {
  const audio = options?.audio ?? false;
  const constraints = {
    video: { 
      cursor: 'always',
      // Add 720p resolution constraints
      width: { ideal: 1280, max: 1280 },
      height: { ideal: 720, max: 720 },
    } as DisplayMediaVideoOptions,
    audio,
  } as any; // cast to any to appease stricter TS lib.dom
  return navigator.mediaDevices.getDisplayMedia(constraints);
}

export async function probeDisplayDims(): Promise<{ vw: number; vh: number; displaySurface?: string } | null> {
  try {
    const stream = await getDisplayMediaWithCursor({ audio: false });
    const track = stream.getVideoTracks?.()[0];
    const settings: any = track?.getSettings?.() || {};
    const vw = settings.width || null;
    const vh = settings.height || null;
    const displaySurface = settings.displaySurface;
    // stop immediately; this is a probe only
    stream.getTracks().forEach((t) => t.stop());
    if (vw && vh) return { vw, vh, displaySurface } as any;
    return null;
  } catch {
    return null;
  }
}
