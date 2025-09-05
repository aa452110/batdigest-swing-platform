import type React from 'react';
import type { CropCoordinates } from './cropCommunication';

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
  cropCoordinatesRef?: React.MutableRefObject<CropCoordinates | null>;
};

export function createDrawFrame(deps: DrawFrameDeps) {
  const { canvasRef, videoRef, displayStreamRef, appliedCrop, lockedRect, debugMode, lastDebugUpdateRef, cropCoordinatesRef } = deps;

  return function drawFrame() {
    const canvas = canvasRef.current;
    const video = videoRef.current as HTMLVideoElement | null;
    
    // Silent bail-outs
    if (!canvas) return;
    if (!video) return;
    if (video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vw = Math.max(1, video.videoWidth || 1920);
    const vh = Math.max(1, video.videoHeight || 1080);
    const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;

    // Enable overlays in local dev to validate crop visually
    const overlayEnabled = false; // overlays off

    // Use broadcast crop coordinates if available
    if (cropCoordinatesRef?.current && !lockedRect) {
      const coords = cropCoordinatesRef.current;
      
      // Get the actual capture dimensions from the stream
      const track = displayStreamRef.current?.getVideoTracks()?.[0];
      const settings = track?.getSettings() as any;
      const captureWidth = Math.max(1, settings?.width || video.videoWidth);
      const captureHeight = Math.max(1, settings?.height || video.videoHeight);

      // Compute effective uniform scale used to fit the viewport into capture
      // This accounts for Chrome centering/letterboxing when capture resolution
      // doesn't exactly match viewport*dpr.
      const scaleFit = Math.min(
        captureWidth / Math.max(1, coords.viewportW),
        captureHeight / Math.max(1, coords.viewportH)
      );

      // Letterbox/pillarbox offsets (centered)
      const offsetX = Math.max(0, Math.floor((captureWidth - coords.viewportW * scaleFit) / 2));
      const offsetY = Math.max(0, Math.floor((captureHeight - coords.viewportH * scaleFit) / 2));

      // Top-left of the element in capture pixels
      let sx = Math.round(offsetX + coords.left * scaleFit);
      let sy = Math.round(offsetY + coords.top * scaleFit);

      // Element size -> capture pixels (use same uniform scale)
      const srcW = Math.max(1, Math.round(coords.width * scaleFit));
      const srcH = Math.max(1, Math.round(coords.height * scaleFit));

      // Clamp to capture bounds
      sx = Math.max(0, Math.min(captureWidth - srcW, sx));
      sy = Math.max(0, Math.min(captureHeight - srcH, sy));

      // Output canvas size matches the element rect in capture pixels
      if (canvas.width !== srcW || canvas.height !== srcH) {
        canvas.width = srcW;
        canvas.height = srcH;
      }

      // Draw full element region starting at top-left
      ctx.drawImage(video, sx, sy, srcW, srcH, 0, 0, srcW, srcH);
      
      if (overlayEnabled) {
        // Red outer border (exact crop bounds)
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 6;
        ctx.strokeRect(0, 0, srcW, srcH);

        // Green inner border for visual separation
        ctx.strokeStyle = 'limegreen';
        ctx.lineWidth = 2;
        const inset = 10;
        ctx.strokeRect(inset, inset, srcW - inset * 2, srcH - inset * 2);

        // Black dots at corners
        ctx.fillStyle = 'black';
        const r = 6;
        const corners = [
          { x: 0, y: 0 },
          { x: srcW, y: 0 },
          { x: 0, y: srcH },
          { x: srcW, y: srcH },
        ];
        for (const { x, y } of corners) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Blue crosshair + center dot
        const canvasCenterX = srcW / 2;
        const canvasCenterY = srcH / 2;
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(0, canvasCenterY);
        ctx.lineTo(srcW, canvasCenterY);
        ctx.stroke();
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(canvasCenterX, 0);
        ctx.lineTo(canvasCenterX, srcH);
        ctx.stroke();
        // Center dot
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(canvasCenterX, canvasCenterY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      // ENTIRE DEBUG BLOCK REMOVED
      // if (debugMode && !(window as any).__CROP_LOGGED_ONCE) {
      //   console.log('[DrawFrame] Crop configuration:', {
      //     cssRect: `${coords.left.toFixed(0)},${coords.top.toFixed(0)} ${coords.width.toFixed(0)}x${coords.height.toFixed(0)}`,
      //     capture: `${captureWidth}x${captureHeight}`,
      //     scale: scale.toFixed(2),
      //     cropRect: `${sx},${sy} ${sw}x${sh}`,
      //     canvasSize: `${sw}x${sh}`
      //   });
      //   (window as any).__CROP_LOGGED_ONCE = true;
      // }
      return;
    }

    // NO FALLBACK - if we don't have crop coordinates, we failed
    if (!cropCoordinatesRef?.current) {
      // Draw a red error message on the canvas
      if (canvas.width !== 640 || canvas.height !== 360) {
        canvas.width = 640;
        canvas.height = 360;
      }
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ERROR: No crop coordinates!', 320, 160);
      ctx.font = '16px monospace';
      ctx.fillText('Your coding sucks ass!', 320, 200);
      ctx.fillText('Fix the BroadcastChannel communication', 320, 240);
      
      if (debugMode && !(window as any).__ERROR_LOGGED) {
        console.error('[DrawFrame] FAILED: No crop coordinates received from analyzer!');
        (window as any).__ERROR_LOGGED = true;
      }
      return;
    }
  };
}
