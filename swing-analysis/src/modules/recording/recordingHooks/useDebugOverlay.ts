import { useEffect } from 'react';

type Dims = { vw: number | null; vh: number | null };

export function useDebugOverlay(params: {
  enabled?: boolean;
  isConfigMode: boolean;
  cropPreset: { w: number; h: number };
  appliedCrop: { w: number; h: number; x: number; y: number };
  offsetNorm: { x: number; y: number };
  showAreaPreview: boolean;
  getDims: () => Dims;
  getDisplaySurface: () => string;
  lastCaptureDims: { vw: number; vh: number } | null;
}) {
  const { enabled = false, isConfigMode, cropPreset, appliedCrop, offsetNorm, showAreaPreview, getDims, getDisplaySurface, lastCaptureDims } = params;

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      try {
        const { vw, vh } = getDims();
        const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;
        const useW = isConfigMode ? cropPreset.w : appliedCrop.w;
        const useH = isConfigMode ? cropPreset.h : appliedCrop.h;
        const useX = isConfigMode ? offsetNorm.x : appliedCrop.x;
        const useY = isConfigMode ? offsetNorm.y : appliedCrop.y;
        const desiredW = vw ? Math.min(vw, Math.round(useW * dpr)) : Math.round(useW);
        const desiredH = vh ? Math.min(vh, Math.round(useH * dpr)) : Math.round(useH);
        const marginX = vw ? Math.max(0, (vw - desiredW) / 2) : null;
        const marginY = vh ? Math.max(0, (vh - desiredH) / 2) : null;
        const sx = marginX !== null && vw ? Math.max(0, Math.min(vw - desiredW, Math.floor(marginX + useX * marginX))) : null;
        const sy = marginY !== null && vh ? Math.max(0, Math.min(vh - desiredH, Math.floor(marginY + useY * marginY))) : null;

        const preview = (() => {
          const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1280;
          const viewportH = typeof window !== 'undefined' ? window.innerHeight : 720;
          const baseW = Math.min(viewportW, (viewportH * 16) / 9);
          const baseH = (baseW * 9) / 16;
          const dprPrev = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;
          const basisW = lastCaptureDims?.vw || 1920;
          const basisWcss = basisW / dprPrev;
          const factor = Math.max(0.3, Math.min(1, useW / basisWcss));
          const rectW = baseW * factor;
          const rectH = baseH * factor;
          const centerLeft = (viewportW - rectW) / 2;
          const centerTop = (viewportH - rectH) / 2;
          const travelX = centerLeft;
          const travelY = centerTop;
          const left = centerLeft + useX * travelX;
          const top = centerTop + useY * travelY;
          return { left: Math.round(left), top: Math.round(top), w: Math.round(rectW), h: Math.round(rectH) };
        })();

        const payload = {
          capture: vw && vh ? { vw, vh, dpr, displaySurface: getDisplaySurface() } : 'no-capture',
          applied: { w: useW, h: useH, x: useX, y: useY },
          desired: { w: desiredW, h: desiredH },
          margins: marginX !== null && marginY !== null ? { x: Math.round(marginX), y: Math.round(marginY) } : 'unknown',
          cropTL: sx !== null && sy !== null ? { sx, sy } : 'unknown',
          output: { w: 1280, h: 720 },
          previewRect: showAreaPreview ? preview : 'preview-off',
          note: 'periodic',
        };
        (window as any).__SWING_DEBUG = payload;
        window.dispatchEvent(new CustomEvent('swing:debug', { detail: payload }));
      } catch {}
    }, 500);
    return () => window.clearInterval(id);
  }, [enabled, isConfigMode, cropPreset, appliedCrop, offsetNorm, showAreaPreview, getDims, getDisplaySurface, lastCaptureDims]);
}
