import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAnnotationStore } from '../../state/annotationStore';
import { useVideoStore } from '../../state/videoStore';
import type { Point, Annotation, AnnotationStyle, ToolType } from '../../types/annotation';

interface AnnotationCanvasProps {
  width: number;
  height: number;
}

const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempPoints, setTempPoints] = useState<Point[]>([]);
  const [drawStartTime, setDrawStartTime] = useState<number>(0);

  const { currentTime, isPlaying } = useVideoStore();
  const {
    currentTool,
    currentStyle,
    selectedAnnotationId,
    addAnnotation,
    deleteAnnotation,
    selectAnnotation,
    getAnnotationsAtTime,
  } = useAnnotationStore();

  // Get canvas coordinates from mouse event
  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Draw functions for different tools
  const drawLine = (ctx: CanvasRenderingContext2D, points: Point[], style: AnnotationStyle) => {
    if (points.length < 2) return;

    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.thickness;
    ctx.globalAlpha = style.opacity || 1;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, points: Point[], style: AnnotationStyle) => {
    if (points.length < 2) return;

    const [start, end] = points;
    const headLength = 15;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.thickness;
    ctx.globalAlpha = style.opacity || 1;

    // Draw line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const drawBox = (ctx: CanvasRenderingContext2D, points: Point[], style: AnnotationStyle) => {
    if (points.length < 2) return;

    const [start, end] = points;
    const width = end.x - start.x;
    const height = end.y - start.y;

    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.thickness;
    ctx.globalAlpha = style.opacity || 1;

    ctx.strokeRect(start.x, start.y, width, height);
  };

  // Render all annotations
  const renderAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get annotations for current time
    const visibleAnnotations = getAnnotationsAtTime(currentTime);

    // Draw each annotation
    visibleAnnotations.forEach((annotation) => {
      ctx.save();

      // Highlight selected annotation
      if (annotation.id === selectedAnnotationId) {
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
        ctx.shadowBlur = 10;
      }

      switch (annotation.tool) {
        case 'line':
          drawLine(ctx, annotation.points, annotation.style);
          break;
        case 'arrow':
          drawArrow(ctx, annotation.points, annotation.style);
          break;
        case 'box':
          drawBox(ctx, annotation.points, annotation.style);
          break;
      }

      ctx.restore();
    });

    // Draw temp shape while drawing
    if (isDrawing && tempPoints.length > 0) {
      ctx.save();

      switch (currentTool) {
        case 'line':
          drawLine(ctx, tempPoints, currentStyle);
          break;
        case 'arrow':
          drawArrow(ctx, tempPoints, currentStyle);
          break;
        case 'box':
          drawBox(ctx, tempPoints, currentStyle);
          break;
      }

      ctx.restore();
    }
  }, [
    currentTime,
    getAnnotationsAtTime,
    selectedAnnotationId,
    isDrawing,
    tempPoints,
    currentTool,
    currentStyle,
  ]);

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'select') {
      // Handle selection
      const point = getCanvasPoint(e);
      const visibleAnnotations = getAnnotationsAtTime(currentTime);

      // Simple hit test (can be improved)
      const clicked = visibleAnnotations.find((ann) => {
        if (ann.points.length < 2) return false;
        const [p1, p2] = ann.points;
        const minX = Math.min(p1.x, p2.x) - 10;
        const maxX = Math.max(p1.x, p2.x) + 10;
        const minY = Math.min(p1.y, p2.y) - 10;
        const maxY = Math.max(p1.y, p2.y) + 10;
        return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
      });

      selectAnnotation(clicked?.id || null);
    } else {
      // Start drawing
      setIsDrawing(true);
      setDrawStartTime(currentTime);
      const point = getCanvasPoint(e);

      setTempPoints([point, point]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getCanvasPoint(e);

    setTempPoints((prev) => [prev[0], point]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || tempPoints.length < 2) {
      setIsDrawing(false);
      setTempPoints([]);
      return;
    }

    // Create annotation
    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      tool: currentTool as ToolType,
      points: [...tempPoints],
      style: { ...currentStyle },
      tStart: drawStartTime,
      tEnd: isPlaying ? currentTime : drawStartTime + 5, // If paused, show for 5 seconds
    };

    addAnnotation(annotation);

    setIsDrawing(false);
    setTempPoints([]);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedAnnotationId) {
        deleteAnnotation(selectedAnnotationId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotationId, deleteAnnotation]);

  // Render on every frame
  useEffect(() => {
    renderAnnotations();
  }, [renderAnnotations]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 w-full h-full cursor-crosshair"
      style={{ pointerEvents: 'auto' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default AnnotationCanvas;
