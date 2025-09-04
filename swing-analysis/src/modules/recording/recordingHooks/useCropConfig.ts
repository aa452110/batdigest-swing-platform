import { useCallback, useRef, useState } from 'react';

export type CropPreset = { w: number; h: number };
export type AppliedCrop = { w: number; h: number; x: number; y: number };
export type LockedRect = { sx: number; sy: number; w: number; h: number } | null;

export function useCropConfig() {
  const [cropPreset, setCropPreset] = useState<CropPreset>({ w: 1280, h: 720 });
  const [appliedCrop, setAppliedCrop] = useState<AppliedCrop>({ w: 1280, h: 720, x: 0, y: 0 });
  const [offsetNorm, setOffsetNorm] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasAppliedCrop, setHasAppliedCrop] = useState(false);
  const [isConfigMode, setIsConfigMode] = useState(false);
  const [showAreaPreview, setShowAreaPreview] = useState(false);
  const [lockedRect, setLockedRect] = useState<LockedRect>(null);
  const lastCaptureDimsRef = useRef<{ vw: number; vh: number } | null>(null);

  const increaseCrop = useCallback((stepPx = 25) => {
    const baseH = Number.isFinite(cropPreset.h) ? cropPreset.h : 720;
    const newH = Math.max(180, baseH + stepPx);
    const newW = Math.round(newH * (16 / 9));
    setCropPreset({ w: newW, h: newH });
  }, [cropPreset.h]);

  const decreaseCrop = useCallback((stepPx = 25) => {
    const baseH = Number.isFinite(cropPreset.h) ? cropPreset.h : 720;
    const newH = Math.max(180, baseH - stepPx);
    const newW = Math.round(newH * (16 / 9));
    setCropPreset({ w: newW, h: newH });
  }, [cropPreset.h]);

  const applyScreenSize = useCallback((getDims: () => { vw: number | null; vh: number | null }) => {
    setAppliedCrop({ w: cropPreset.w, h: cropPreset.h, x: offsetNorm.x, y: offsetNorm.y });
    setHasAppliedCrop(true);
    setIsConfigMode(false);
    setShowAreaPreview(false);
    try {
      sessionStorage.setItem('swingAppliedCrop', JSON.stringify({ w: cropPreset.w, h: cropPreset.h, x: offsetNorm.x, y: offsetNorm.y }));
      sessionStorage.setItem('swingHasAppliedCrop', 'true');
    } catch {}

    try {
      const { vw, vh } = getDims();
      const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;
      if (vw && vh) {
        const desiredW = Math.min(vw, Math.round(cropPreset.w * dpr));
        const desiredH = Math.min(vh, Math.round(cropPreset.h * dpr));
        const marginX = Math.max(0, (vw - desiredW) / 2);
        const marginY = Math.max(0, (vh - desiredH) / 2);
        const sx = Math.max(0, Math.min(vw - desiredW, Math.floor(marginX + offsetNorm.x * marginX)));
        const sy = Math.max(0, Math.min(vh - desiredH, Math.floor(marginY + offsetNorm.y * marginY)));
        setLockedRect({ sx, sy, w: desiredW, h: desiredH });
      } else {
        setLockedRect(null);
      }
    } catch {}
  }, [cropPreset.w, cropPreset.h, offsetNorm.x, offsetNorm.y]);

  const resetScreenSize = useCallback(() => {
    setCropPreset({ w: 1280, h: 720 });
    setOffsetNorm({ x: 0, y: 0 });
    setIsConfigMode(true);
    setShowAreaPreview(true);
    setHasAppliedCrop(false);
    setLockedRect(null);
    try {
      sessionStorage.removeItem('swingAppliedCrop');
      sessionStorage.removeItem('swingHasAppliedCrop');
    } catch {}
  }, []);

  return {
    cropPreset,
    setCropPreset,
    appliedCrop,
    setAppliedCrop,
    offsetNorm,
    setOffsetNorm,
    hasAppliedCrop,
    setHasAppliedCrop,
    isConfigMode,
    setIsConfigMode,
    showAreaPreview,
    setShowAreaPreview,
    increaseCrop,
    decreaseCrop,
    applyScreenSize,
    resetScreenSize,
    lockedRect,
    setLockedRect,
    lastCaptureDimsRef,
  };
}
