// Cross-browser helper to request display media with cursor shown,
// while avoiding strict lib.dom typing issues in TS.
export type DisplayMediaVideoOptions = MediaTrackConstraints & {
  // Not always present in older lib.dom typings
  cursor?: 'always' | 'motion' | 'never';
};

export async function getDisplayMediaWithCursor(options?: { audio?: boolean }) {
  const audio = options?.audio ?? false;
  const constraints = {
    video: { cursor: 'always' } as DisplayMediaVideoOptions,
    audio,
  } as any; // cast to any to appease stricter TS lib.dom
  return navigator.mediaDevices.getDisplayMedia(constraints);
}

