import type React from 'react';

type Params = {
  displayStreamRef: React.MutableRefObject<MediaStream | null>;
  audioStreamRef: React.MutableRefObject<MediaStream | null>;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  videoRef?: React.MutableRefObject<HTMLVideoElement | null>;
};

export function stopAllResources({ displayStreamRef, audioStreamRef, mediaRecorderRef, videoRef }: Params) {
  try {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  } catch {}

  try {
    if (displayStreamRef.current) {
      displayStreamRef.current.getTracks().forEach((t) => t.stop());
      displayStreamRef.current = null;
    }
  } catch {}

  try {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
  } catch {}

  try {
    if (videoRef?.current) videoRef.current.srcObject = null as any;
  } catch {}
}
