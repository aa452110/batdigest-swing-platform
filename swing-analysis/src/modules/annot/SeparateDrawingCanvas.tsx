import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useVideoStore, useAnnotationStore } from '../../state/store';
import type { Annotation } from './types';

interface SeparateDrawingCanvasProps {
  videoElement: HTMLVideoElement | null;
  canvasId: 'video1' | 'video2';
}

// Separate annotation stores for each video
const annotationStores: Record<string, Annotation[]> = {
  video1: [],
  video2: []
};

const SeparateDrawingCanvas: React.FC<SeparateDrawingCanvasProps> = ({ videoElement, canvasId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  const { playback } = useVideoStore();
  // Get tool and style from the global annotation store
  const { currentTool, currentStyle } = useAnnotationStore();

  // Load annotations for this specific canvas
  useEffect(() => {
    setAnnotations(annotationStores[canvasId] || []);
  }, [canvasId]);

  // Get mouse position relative to canvas
  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // Draw line
  const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, style: any) => {
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.thickness;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  // Draw dot
  const drawDot = (ctx: CanvasRenderingContext2D, x: number, y: number, style: any) => {
    ctx.fillStyle = style.color;
    ctx.beginPath();
    ctx.arc(x, y, style.thickness * 2, 0, Math.PI * 2);
    ctx.fill();
  };

  // Draw arrow
  const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, style: any) => {
    const headLength = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    // Draw line
    drawLine(ctx, x1, y1, x2, y2, style);
    
    // Draw arrowhead
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.thickness;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  // Draw box
  const drawBox = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, style: any) => {
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.thickness;
    ctx.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
  };

  // Add annotation to this canvas's store
  const addAnnotation = (annotation: Omit<Annotation, 'id'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `${canvasId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    annotationStores[canvasId] = [...(annotationStores[canvasId] || []), newAnnotation];
    setAnnotations(annotationStores[canvasId]);
  };

  // Get annotations at current time for this canvas
  const getAnnotationsAtTime = (time: number) => {
    return annotationStores[canvasId]?.filter(ann => 
      time >= ann.startTime && time <= ann.endTime
    ) || [];
  };

  // Render all visible annotations
  const renderAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get annotations at current time
    const visibleAnnotations = getAnnotationsAtTime(playback.currentTime);

    // Draw each annotation
    visibleAnnotations.forEach(ann => {
      const { x: x1, y: y1 } = ann.startPoint;
      const { x: x2, y: y2 } = ann.endPoint;

      switch (ann.type) {
        case 'line':
          drawLine(ctx, x1, y1, x2, y2, ann.style);
          break;
        case 'arrow':
          drawArrow(ctx, x1, y1, x2, y2, ann.style);
          break;
        case 'box':
          drawBox(ctx, x1, y1, x2, y2, ann.style);
          break;
        case 'dot':
          drawDot(ctx, x1, y1, ann.style);
          break;
      }
    });
  }, [playback.currentTime]);

  // Re-render when time changes
  useEffect(() => {
    renderAnnotations();
  }, [playback.currentTime, renderAnnotations]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!videoElement) return;

    const pos = getMousePos(e);
    setStartPoint(pos);
    setIsDrawing(true);

    if (currentTool === 'dot') {
      // For dots, add immediately
      addAnnotation({
        type: 'dot',
        startPoint: pos,
        endPoint: pos,
        startTime: playback.currentTime,
        endTime: playback.currentTime + 5, // Show for 5 seconds
        style: currentStyle,
      });
      setIsDrawing(false);
    }
  }, [videoElement, currentTool, currentStyle, playback.currentTime, getMousePos]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || currentTool === 'dot') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getMousePos(e);

    // Clear and redraw all annotations plus preview
    renderAnnotations();

    // Draw preview
    switch (currentTool) {
      case 'line':
        drawLine(ctx, startPoint.x, startPoint.y, currentPos.x, currentPos.y, currentStyle);
        break;
      case 'arrow':
        drawArrow(ctx, startPoint.x, startPoint.y, currentPos.x, currentPos.y, currentStyle);
        break;
      case 'box':
        drawBox(ctx, startPoint.x, startPoint.y, currentPos.x, currentPos.y, currentStyle);
        break;
    }
  }, [isDrawing, startPoint, currentTool, currentStyle, getMousePos, renderAnnotations]);

  // Handle mouse up
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || currentTool === 'dot') return;

    const endPos = getMousePos(e);

    // Add annotation
    addAnnotation({
      type: currentTool as 'line' | 'arrow' | 'box',
      startPoint,
      endPoint: endPos,
      startTime: playback.currentTime,
      endTime: playback.currentTime + 5, // Show for 5 seconds
      style: currentStyle,
    });

    setIsDrawing(false);
    setStartPoint(null);
    renderAnnotations();
  }, [isDrawing, startPoint, currentTool, currentStyle, playback.currentTime, getMousePos, renderAnnotations]);

  // Update canvas size to match video
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !videoElement) return;

    const updateCanvasSize = () => {
      const rect = videoElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      renderAnnotations();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [videoElement, renderAnnotations]);


  if (!videoElement) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto z-10"
      style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDrawing(false);
        setStartPoint(null);
        renderAnnotations();
      }}
    />
  );
};

export default SeparateDrawingCanvas;