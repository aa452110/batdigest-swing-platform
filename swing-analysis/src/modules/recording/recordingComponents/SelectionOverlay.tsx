import React from 'react';

export type SelectionBox = { x: number; y: number; width: number; height: number };

type Props = {
  isSelecting: boolean;
  selectionBox: SelectionBox;
  onChange: (updater: (prev: SelectionBox) => SelectionBox) => void;
  onConfirm: () => void;
};

const SelectionOverlay: React.FC<Props> = ({ isSelecting, selectionBox, onChange, onConfirm }) => {
  if (!isSelecting) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483000,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: `${selectionBox.x}px`,
          top: `${selectionBox.y}px`,
          width: `${selectionBox.width}px`,
          height: `${selectionBox.height}px`,
          border: '3px solid #00ff00',
          boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
          zIndex: 2147483001,
          pointerEvents: 'auto',
          cursor: 'move',
        }}
        onMouseDown={(e) => {
          const startX = e.clientX - selectionBox.x;
          const startY = e.clientY - selectionBox.y;
          const handleMouseMove = (e: MouseEvent) => {
            onChange((prev) => ({ ...prev, x: e.clientX - startX, y: e.clientY - startY }));
          };
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -5,
            bottom: -5,
            width: 20,
            height: 20,
            backgroundColor: '#00ff00',
            cursor: 'nwse-resize',
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startWidth = selectionBox.width;
            const handleMouseMove = (e: MouseEvent) => {
              const newWidth = startWidth + (e.clientX - startX);
              const aspectRatio = 16 / 9;
              const adjustedHeight = newWidth / aspectRatio;
              onChange((prev) => ({
                ...prev,
                width: Math.max(320, newWidth),
                height: Math.max(180, adjustedHeight),
              }));
            };
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -30,
            left: 0,
            backgroundColor: 'rgba(0, 255, 0, 0.9)',
            color: 'black',
            padding: '2px 8px',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '4px',
          }}
        >
          {Math.round(selectionBox.width)} × {Math.round(selectionBox.height)}
        </div>
        <button
          onClick={onConfirm}
          style={{
            position: 'fixed',
            left: `${selectionBox.x}px`,
            top: `${selectionBox.y + selectionBox.height + 10}px`,
            padding: '8px 16px',
            backgroundColor: '#00ff00',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 2147483002,
            pointerEvents: 'auto',
          }}
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
};

export default SelectionOverlay;
