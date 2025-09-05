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

    // Use broadcast crop coordinates if available
    if (cropCoordinatesRef?.current && !lockedRect) {
      const coords = cropCoordinatesRef.current;
      
      // Get the actual capture dimensions from the stream
      const track = displayStreamRef.current?.getVideoTracks()?.[0];
      const settings = track?.getSettings() as any;
      const captureWidth = settings?.width || video.videoWidth;
      const captureHeight = settings?.height || video.videoHeight;
      
      // Chrome centers the viewport in the capture
      // Calculate the offset from capture center to viewport top-left
      const captureCenter = { x: captureWidth / 2, y: captureHeight / 2 };
      const viewportOffset = {
        x: captureCenter.x - (coords.viewportW / 2),
        y: captureCenter.y - (coords.viewportH / 2)
      };
      
      // Add viewport offset to element coordinates to get capture coordinates
      const sx = Math.round(coords.left + viewportOffset.x);
      const sy = Math.round(coords.top + viewportOffset.y);
      const sw = Math.round(coords.width);
      const sh = Math.round(coords.height);
      
      // Log only once on first frame
      if (canvas.width !== sw || canvas.height !== sh) {
        console.log('CAPTURE:', captureWidth, 'x', captureHeight);
        console.log('VIEWPORT:', coords.viewportW, 'x', coords.viewportH);
        
        // Check if this is fullscreen or close to it
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const isNearFullscreen = coords.viewportW >= (screenWidth - 100);
        console.log('SCREEN:', screenWidth, 'x', screenHeight);
        console.log('IS NEAR FULLSCREEN:', isNearFullscreen);
        
        // Calculate aspect ratios
        const captureAspect = captureWidth / captureHeight;
        const viewportAspect = coords.viewportW / coords.viewportH;
        console.log('CAPTURE ASPECT:', captureAspect.toFixed(3));
        console.log('VIEWPORT ASPECT:', viewportAspect.toFixed(3));
        
        console.log('CAPTURE CENTER:', captureCenter);
        console.log('VIEWPORT OFFSET:', viewportOffset);
        console.log(`ELEMENT AT: (${coords.left}, ${coords.top}) ${coords.width}x${coords.height}`);
        console.log(`CROP AT: (${sx}, ${sy}) ${sw}x${sh}`);
        
        canvas.width = sw;
        canvas.height = sh;
      }
      
      // Draw only the cropped area
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
      
      // Draw blue markers ON TOP (last) to show where we think center is
      // This should align with the red dot if our math is correct
      const canvasCenterX = sw / 2;
      const canvasCenterY = sh / 2;
      
      // Blue crosshair lines through center
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 3;
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, canvasCenterY);
      ctx.lineTo(sw, canvasCenterY);
      ctx.stroke();
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(canvasCenterX, 0);
      ctx.lineTo(canvasCenterX, sh);
      ctx.stroke();
      
      // Blue dot at center
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.arc(canvasCenterX, canvasCenterY, 25, 0, Math.PI * 2);
      ctx.fill();
      
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
