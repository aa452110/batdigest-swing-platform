import React from 'react';
import { useAnnotationStore } from '../../state/store';
import type { ToolType } from './types';

const AnnotationToolbar: React.FC = () => {
  const {
    currentTool,
    currentStyle,
    setCurrentTool,
    setCurrentStyle,
    undo,
    redo,
    clearAnnotations,
  } = useAnnotationStore();

  const tools: { type: ToolType; icon: JSX.Element; label: string }[] = [
    {
      type: 'select',
      label: 'Select',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 15l-2 5L9 9l11 4-5 2z"
          />
        </svg>
      ),
    },
    {
      type: 'line',
      label: 'Line',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20l16-16" />
        </svg>
      ),
    },
    {
      type: 'arrow',
      label: 'Arrow',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      ),
    },
    {
      type: 'box',
      label: 'Box',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" strokeWidth={2} />
        </svg>
      ),
    },
  ];

  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#ffffff', // white
    '#000000', // black
  ];

  const thicknesses = [1, 2, 3, 5, 8];

  return (
    <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-90 rounded-lg p-3 space-y-3 z-20">
      {/* Tools */}
      <div className="flex gap-1">
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => setCurrentTool(tool.type)}
            className={`p-2 rounded transition-colors ${
              currentTool === tool.type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Color Picker */}
      <div className="flex gap-1 flex-wrap max-w-[240px]">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setCurrentStyle({ color })}
            className={`w-7 h-7 rounded border-2 ${
              currentStyle.color === color ? 'border-blue-400' : 'border-gray-600'
            }`}
            style={{ backgroundColor: color }}
            title={`Color: ${color}`}
          />
        ))}
      </div>

      {/* Thickness */}
      <div className="flex gap-1 items-center">
        <span className="text-xs text-gray-400 mr-2">Size:</span>
        {thicknesses.map((thickness) => (
          <button
            key={thickness}
            onClick={() => setCurrentStyle({ thickness })}
            className={`px-2 py-1 rounded text-xs ${
              currentStyle.thickness === thickness
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {thickness}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-1 pt-2 border-t border-gray-700">
        <button
          onClick={undo}
          className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        </button>
        <button
          onClick={redo}
          className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
            />
          </svg>
        </button>
        <button
          onClick={clearAnnotations}
          className="p-2 bg-red-600 text-white hover:bg-red-700 rounded transition-colors ml-2"
          title="Clear All"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AnnotationToolbar;
