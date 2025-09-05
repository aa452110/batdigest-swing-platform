import React, { useEffect } from 'react';
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();
      
      switch(key) {
        // Tool selection
        case 'a':
          setCurrentTool('select');
          break;
        case 's':
          setCurrentTool('pen');
          break;
        case 'd':
          setCurrentTool('line');
          break;
        case 'f':
          setCurrentTool('dot');
          break;
        case 'g':
          setCurrentTool('box');
          break;
        
        // Color selection
        case 'b':
          setCurrentStyle({ color: '#000000' }); // Black
          break;
        case 'r':
          setCurrentStyle({ color: '#ef4444' }); // Red
          break;
        case 'w':
          setCurrentStyle({ color: '#ffffff' }); // White
          break;
        
        // Brush size
        case '5':
          setCurrentStyle({ thickness: 5 });
          break;
        case '8':
          setCurrentStyle({ thickness: 8 });
          break;
        case '0':
          setCurrentStyle({ thickness: 10 });
          break;
        
        // Undo/Redo
        case 'z':
          undo();
          break;
        case 'x':
          redo();
          break;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Clear on ESC
      if (e.key === 'Escape') {
        clearAnnotations();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setCurrentTool, setCurrentStyle, undo, redo, clearAnnotations]);

  // REMOVED LOG - console.log('AnnotationToolbar rendering - Version 2.0 with PEN TOOL');
  
  const tools: { type: ToolType; icon: JSX.Element; label: string; shortcut: string; description: string }[] = [
    {
      type: 'select',
      label: 'Select',
      shortcut: 'A',
      description: 'Select and move annotations',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.414l.707-.707zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      type: 'pen',
      label: 'Draw',
      shortcut: 'S',
      description: 'Freehand drawing tool',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
    },
    {
      type: 'line',
      label: 'Line',
      shortcut: 'D',
      description: 'Draw straight lines',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20l16-16" />
        </svg>
      ),
    },
    {
      type: 'dot',
      label: 'Dot',
      shortcut: 'F',
      description: 'Place dots/points on the video',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
    },
    {
      type: 'box',
      label: 'Square',
      shortcut: 'G',
      description: 'Draw rectangles and squares',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" strokeWidth={2} />
        </svg>
      ),
    },
  ];
  
  // REMOVED LOG - console.log('Tools array:', tools);
  // REMOVED LOG - console.log('Tools count:', tools.length);
  // REMOVED LOG - console.log('Tool types:', tools.map(t => t.type));

  const colors = [
    { color: '#000000', name: 'Black', shortcut: 'B' },
    { color: '#ef4444', name: 'Red', shortcut: 'R' },
    { color: '#ffffff', name: 'White', shortcut: 'W' },
  ];

  const thicknesses = [5, 8, 10];

  return (
    <div className="w-full bg-gray-800 rounded-lg p-3">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Tools */}
        <div className="flex gap-1">
          {tools.map((tool) => (
            <div key={tool.type} className="flex flex-col items-center">
              <button
                onClick={() => setCurrentTool(tool.type)}
                className={`p-2 rounded transition-colors ${
                  currentTool === tool.type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={`${tool.description} (Press ${tool.shortcut})`}
              >
                {tool.icon}
              </button>
              <span className="text-xs text-gray-500 mt-0.5">{tool.shortcut}</span>
            </div>
          ))}
        </div>

        <div className="h-8 w-px bg-gray-600" /> {/* Divider */}

        {/* Color Picker */}
        <div className="flex gap-1 items-center">
          <span className="text-xs text-gray-400 mr-1">Color:</span>
          {colors.map((colorOption) => (
            <div key={colorOption.color} className="relative">
              <button
                onClick={() => setCurrentStyle({ color: colorOption.color })}
                className={`w-7 h-7 rounded border-2 ${
                  currentStyle.color === colorOption.color ? 'border-blue-400' : 'border-gray-600'
                }`}
                style={{ backgroundColor: colorOption.color }}
                title={`${colorOption.name} (Press ${colorOption.shortcut})`}
              />
              <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                {colorOption.shortcut}
              </span>
            </div>
          ))}
        </div>

        <div className="h-8 w-px bg-gray-600" /> {/* Divider */}

        {/* Thickness */}
        <div className="flex gap-1 items-center">
          <span className="text-xs text-gray-400 mr-1">Size:</span>
          {thicknesses.map((thickness, index) => (
            <button
              key={thickness}
              onClick={() => setCurrentStyle({ thickness })}
              className={`rounded ${
                currentStyle.thickness === thickness
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              style={{
                padding: `${2 + index * 2}px ${6 + index * 2}px`,
                fontSize: `${10 + index * 2}px`
              }}
              title={`Line thickness: ${thickness}px (Press ${thickness === 10 ? '0' : thickness})`}
            >
              {thickness}
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-gray-600" /> {/* Divider */}

        {/* Actions */}
        <div className="flex gap-1 items-start">
          <div className="flex flex-col items-center">
            <button
              onClick={undo}
              className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded transition-colors"
              title="Undo last annotation (Press Z)"
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
            <span className="text-xs text-gray-500 mt-0.5">Z</span>
          </div>
          <div className="flex flex-col items-center">
            <button
              onClick={redo}
              className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded transition-colors"
              title="Redo last undone annotation (Press X)"
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
            <span className="text-xs text-gray-500 mt-0.5">X</span>
          </div>
          <div className="flex flex-col items-center">
            <button
              onClick={clearAnnotations}
              className="px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded transition-colors flex items-center gap-1"
              title="Clear All Annotations - Remove all drawings from the screen (Press ESC)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-xs">Clear</span>
            </button>
            <span className="text-xs text-gray-500 mt-0.5">ESC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationToolbar;
// Cache bust: 1756398445
