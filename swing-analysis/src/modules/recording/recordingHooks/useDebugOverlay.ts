import { useEffect } from 'react';

type Dims = { vw: number | null; vh: number | null };

export function useDebugOverlay(params: {
  isConfigMode: boolean;
  cropPreset: { w: number; h: number };
  appliedCrop: { w: number; h: number; x: number; y: number };
  offsetNorm: { x: number; y: number };
  showAreaPreview: boolean;
  getDims: () => Dims;
  getDisplaySurface: () => string;
  lastCaptureDims: { vw: number; vh: number } | null;
}) {
  const { isConfigMode, cropPreset, appliedCrop, offsetNorm, showAreaPreview, getDims, getDisplaySurface, lastCaptureDims } = params;

  useEffect(() => {
    const id = window.setInterval(() => {
      try {
        const { vw, vh } = getDims();
        const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;
        const useW = isConfigMode ? cropPreset.w : appliedCrop.w;
        const useH = isConfigMode ? cropPreset.h : appliedCrop.h;
        const useX = isConfigMode ? offsetNorm.x : appliedCrop.x;
        const useY = isConfigMode ? offsetNorm.y : appliedCrop.y;
        const desiredW = vw ? Math.min(vw, Math.round(useW * dpr)) : null;
        const desiredH = vh ? Math.min(vh, Math.round(useH * dpr)) : null;
        const marginX = desiredW && vw ? Math.max(0, (vw - desiredW) / 2) : null;
        const marginY = desiredH && vh ? Math.max(0, (vh - desiredH) / 2) : null;
        const sx = marginX !== null && vw ? Math.max(0, Math.min(vw - (desiredW || 0), Math.floor((marginX || 0) + useX * (marginX || 0)))) : null;
        const sy = marginY !== null && vh ? Math.max(0, Math.min(vh - (desiredH || 0), Math.floor((marginY || 0) + useY * (marginY || 0)))) : null;

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
          desired: desiredW && desiredH ? { w: desiredW, h: desiredH } : 'n/a',
          margins: marginX !== null && marginY !== null ? { x: Math.round(marginX), y: Math.round(marginY) } : 'n/a',
          cropTL: sx !== null && sy !== null ? { sx, sy } : 'n/a',
          output: { w: 1280, h: 720 },
          previewRect: showAreaPreview ? preview : 'preview-off',
          note: 'periodic',
        };
        (window as any).__SWING_DEBUG = payload;
        window.dispatchEvent(new CustomEvent('swing:debug', { detail: payload }));
      } catch {}
    }, 500);
    return () => window.clearInterval(id);
  }, [isConfigMode, cropPreset, appliedCrop, offsetNorm, showAreaPreview, getDims, getDisplaySurface, lastCaptureDims]);
}
