import React from 'react';

type Props = {
  cropPreset: { w: number; h: number };
  offsetNorm: { x: number; y: number };
  showAreaPreview: boolean;
  onIncreaseCrop: () => void;
  onDecreaseCrop: () => void;
  onOffsetUp: () => void;
  onOffsetDown: () => void;
  onOffsetLeft: () => void;
  onOffsetRight: () => void;
  onOffsetReset: () => void;
  onTogglePreview: (v: boolean) => void;
  onApply: () => void;
  onCancel: () => void;
};

const CropEditorPanel: React.FC<Props> = ({
  cropPreset,
  offsetNorm,
  showAreaPreview,
  onIncreaseCrop,
  onDecreaseCrop,
  onOffsetUp,
  onOffsetDown,
  onOffsetLeft,
  onOffsetRight,
  onOffsetReset,
  onTogglePreview,
  onApply,
  onCancel,
}) => {
  return (
    <div style={{ position: 'relative' }}>
      <div className="text-[11px] text-gray-400 mt-1">Editing: {cropPreset.w}×{cropPreset.h} → output native</div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[11px] text-gray-300">Size:</span>
        <button onClick={onDecreaseCrop} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded" title="Decrease crop (−25px height)">−</button>
        <button onClick={onIncreaseCrop} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded" title="Increase crop (+25px height)">+</button>
      </div>
      <div className="mt-2 p-2 bg-gray-800/60 rounded border border-gray-700 w-max">
        <div className="text-[11px] text-gray-300 mb-2">Position (offset within center crop)</div>
        <div className="flex items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-2">
            <button onClick={onOffsetUp} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded" title="Move Up">▲</button>
            <div className="flex items-center gap-2">
              <button onClick={onOffsetLeft} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded" title="Move Left">◀</button>
              <button onClick={onOffsetReset} className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded" title="Reset Position">Reset</button>
              <button onClick={onOffsetRight} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded" title="Move Right">▶</button>
            </div>
            <button onClick={onOffsetDown} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded" title="Move Down">▼</button>
          </div>
          <div className="text-[11px] text-gray-400">X: {(offsetNorm.x * 100).toFixed(0)}%<br/>Y: {(offsetNorm.y * 100).toFixed(0)}%</div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input id="preview-toggle" type="checkbox" checked={showAreaPreview} onChange={(e) => onTogglePreview(e.target.checked)} />
        <label htmlFor="preview-toggle" className="text-xs text-gray-300">Show Area Preview (center)</label>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={onApply} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded">SET Screen Size</button>
        <button onClick={onCancel} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded">Cancel</button>
      </div>
    </div>
  );
};

export default CropEditorPanel;
