import type React from 'react';

export type LockedRect = { sx: number; sy: number; w: number; h: number } | null;
export type AppliedCrop = { w: number; h: number; x: number; y: number };

export type DrawFrameDeps = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  displayStreamRef: React.MutableRefObject<MediaStream | null>;
  appliedCrop: AppliedCrop;
  lockedRect: LockedRect;
  debugMode: boolean;
  lastDebugUpdateRef: React.MutableRefObject<number>;
};

export function createDrawFrame(deps: DrawFrameDeps) {
  const { canvasRef, videoRef, displayStreamRef, appliedCrop, lockedRect, debugMode, lastDebugUpdateRef } = deps;

  return function drawFrame() {
    const canvas = canvasRef.current;
    const video = videoRef.current as HTMLVideoElement | null;
    if (!canvas || !video || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vw = Math.max(1, video.videoWidth || 1920);
    const vh = Math.max(1, video.videoHeight || 1080);
    const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;

    if (lockedRect) {
      // Native-resolution output matching the selected crop (no upscaling)
      const { sx, sy, w, h } = lockedRect;
      const cw = w;
      const ch = h;
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
      ctx.drawImage(video, sx, sy, w, h, 0, 0, cw, ch);
      if (debugMode) {
        const now = Date.now();
        if (now - lastDebugUpdateRef.current > 200) {
          lastDebugUpdateRef.current = now;
          const track = displayStreamRef.current?.getVideoTracks?.()[0];
          const settings: any = track?.getSettings?.() || {};
          const payload = {
            capture: { vw, vh, dpr, displaySurface: settings.displaySurface || 'unknown' },
            applied: appliedCrop,
            lockedRect: { sx, sy, w, h },
            output: { w: cw, h: ch },
            source: 'applied',
          };
          (window as any).__SWING_DEBUG = payload;
          window.dispatchEvent(new CustomEvent('swing:debug', { detail: payload }));
        }
      }
      return;
    }

    const activeW = appliedCrop.w;
    const activeH = appliedCrop.h;
    const activeX = appliedCrop.x;
    const activeY = appliedCrop.y;
    const desiredW = Math.min(vw, Math.round(activeW * dpr));
    const desiredH = Math.min(vh, Math.round(activeH * dpr));

    if (debugMode && !(window as any).__SWING_CENTER_CROP_LOGGED) {
      console.log('[Recorder] capture:', vw, 'x', vh, 'dpr:', dpr, 'applied:', activeW, 'x', activeH, 'offset:', activeX, activeY);
      (window as any).__SWING_CENTER_CROP_LOGGED = true;
    }

    if (vw >= desiredW && vh >= desiredH) {
      const marginX = Math.max(0, (vw - desiredW) / 2);
      const marginY = Math.max(0, (vh - desiredH) / 2);
      const sx = Math.max(0, Math.min(vw - desiredW, Math.floor(marginX + activeX * marginX)));
      const sy = Math.max(0, Math.min(vh - desiredH, Math.floor(marginY + activeY * marginY)));
      // Native-resolution output: set canvas to crop size
      const cw = desiredW;
      const ch = desiredH;
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
      ctx.drawImage(video, sx, sy, desiredW, desiredH, 0, 0, cw, ch);
      if (debugMode) {
        const now = Date.now();
        if (now - lastDebugUpdateRef.current > 200) {
          lastDebugUpdateRef.current = now;
          const track = displayStreamRef.current?.getVideoTracks?.()[0];
          const settings: any = track?.getSettings?.() || {};
          const payload = {
            capture: { vw, vh, dpr, displaySurface: settings.displaySurface || 'unknown' },
            applied: { w: activeW, h: activeH, x: activeX, y: activeY },
            desired: { w: desiredW, h: desiredH },
            margins: { x: Math.round(marginX), y: Math.round(marginY) },
            cropTL: { sx: Math.round(sx), sy: Math.round(sy) },
            output: { w: cw, h: ch },
          };
          (window as any).__SWING_DEBUG = payload;
          window.dispatchEvent(new CustomEvent('swing:debug', { detail: payload }));
        }
      }
      return;
    } else {
      // Source is smaller than requested crop — avoid upscaling; record native source
      const cw = vw;
      const ch = vh;
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(video, 0, 0, vw, vh, 0, 0, cw, ch);
      if (debugMode) {
        const now = Date.now();
        if (now - lastDebugUpdateRef.current > 200) {
          lastDebugUpdateRef.current = now;
          const track = displayStreamRef.current?.getVideoTracks?.()[0];
          const settings: any = track?.getSettings?.() || {};
          const payload = {
            capture: { vw, vh, dpr, displaySurface: settings.displaySurface || 'unknown' },
            applied: { w: activeW, h: activeH, x: activeX, y: activeY },
            desired: { w: desiredW, h: desiredH },
            fallbackScale: { dx: Math.round(dx), dy: Math.round(dy), dw: Math.round(dw), dh: Math.round(dh) },
            output: { w: cw, h: ch },
          };
          (window as any).__SWING_DEBUG = payload;
          window.dispatchEvent(new CustomEvent('swing:debug', { detail: payload }));
        }
      }
      return;
    }
  };
}
