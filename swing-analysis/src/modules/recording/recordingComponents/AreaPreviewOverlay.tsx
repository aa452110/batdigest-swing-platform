import React from 'react';

type Props = {
  show: boolean;
  isRecording: boolean;
  cropWidth: number; // CSS px (logical)
  basisCssWidth: number | null; // captureWidth / DPR if known
  offsetX: number; // normalized -1..1
  offsetY: number; // normalized -1..1
};

export const AreaPreviewOverlay: React.FC<Props> = ({ show, isRecording, cropWidth, basisCssWidth, offsetX, offsetY }) => {
  if (!show || isRecording) return null;

  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 720;
  const baseW = Math.min(viewportW, (viewportH * 16) / 9);
  const baseH = (baseW * 9) / 16;
  const basis = basisCssWidth && basisCssWidth > 0 ? basisCssWidth : 1920;
  const factor = Math.max(0.3, Math.min(1, cropWidth / basis));
  const rectW = baseW * factor;
  const rectH = baseH * factor;
  const centerLeft = (viewportW - rectW) / 2;
  const centerTop = (viewportH - rectH) / 2;
  const travelX = centerLeft;
  const travelY = centerTop;
  const left = centerLeft + offsetX * travelX;
  const top = centerTop + offsetY * travelY;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2147482000, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'fixed',
          left,
          top,
          width: rectW,
          height: rectH,
          border: '4px solid #22d3ee',
          borderRadius: 4,
        }}
      />
    </div>
  );
};

export default AreaPreviewOverlay;

