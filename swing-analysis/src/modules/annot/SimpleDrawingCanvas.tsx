import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useAnnotationStore, useVideoStore } from '../../state/store';
import type { Annotation } from './types';

interface SimpleDrawingCanvasProps {
  videoElement: HTMLVideoElement | null;
}

const SimpleDrawingCanvas: React.FC<SimpleDrawingCanvasProps> = ({ videoElement }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  
  const { playback } = useVideoStore();
  const {
    annotations,
    currentTool,
    currentStyle,
    addAnnotation,
    getAnnotationsAtTime,
  } = useAnnotationStore();

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

  // Draw arrow
  const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, style: any) => {
    drawLine(ctx, x1, y1, x2, y2, style);
    
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = 15;
    
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  // Draw box
  const drawBox = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, style: any) => {
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.thickness;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  };

  // Redraw all annotations
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get current annotations
    const currentAnnotations = getAnnotationsAtTime(playback.currentTime);
    
    // Draw each annotation
    currentAnnotations.forEach(ann => {
      if (ann.points.length >= 2) {
        const p1 = ann.points[0];
        const p2 = ann.points[1];
        
        // Convert normalized coords to canvas pixels
        const x1 = p1.x * canvas.width;
        const y1 = p1.y * canvas.height;
        const x2 = p2.x * canvas.width;
        const y2 = p2.y * canvas.height;
        
        switch (ann.tool) {
          case 'line':
            drawLine(ctx, x1, y1, x2, y2, ann.style);
            break;
          case 'arrow':
            drawArrow(ctx, x1, y1, x2, y2, ann.style);
            break;
          case 'box':
            drawBox(ctx, x1, y1, x2, y2, ann.style);
            break;
        }
      }
    });
  }, [getAnnotationsAtTime, playback.currentTime]);

  // Update canvas size to match video
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !videoElement) return;
    
    const updateSize = () => {
      const rect = videoElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      redraw();
    };
    
    updateSize();
    
    // Update on video metadata load
    videoElement.addEventListener('loadedmetadata', updateSize);
    window.addEventListener('resize', updateSize);
    
    return () => {
      videoElement.removeEventListener('loadedmetadata', updateSize);
      window.removeEventListener('resize', updateSize);
    };
  }, [videoElement, redraw]);

  // Redraw when annotations or time changes
  useEffect(() => {
    redraw();
  }, [redraw, annotations, playback.currentTime]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'select') return;
    
    const pos = getMousePos(e);
    setStartPoint(pos);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentPos = getMousePos(e);
    
    // Redraw everything
    redraw();
    
    // Draw temporary shape
    ctx.save();
    ctx.globalAlpha = 0.7;
    
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
    
    ctx.restore();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const endPos = getMousePos(e);
    
    // Create annotation with normalized coordinates
    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      tool: currentTool as any,
      points: [
        { x: startPoint.x / canvas.width, y: startPoint.y / canvas.height },
        { x: endPos.x / canvas.width, y: endPos.y / canvas.height },
      ],
      style: { ...currentStyle },
      tStart: playback.currentTime,
      tEnd: playback.currentTime + 5,
    };
    
    addAnnotation(annotation);
    
    setIsDrawing(false);
    setStartPoint(null);
    redraw();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10"
      style={{ pointerEvents: currentTool !== 'select' ? 'auto' : 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDrawing(false);
        setStartPoint(null);
        redraw();
      }}
    />
  );
};

export default SimpleDrawingCanvas;