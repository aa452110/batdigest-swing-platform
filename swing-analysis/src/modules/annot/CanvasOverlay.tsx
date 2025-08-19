import React, { useRef, useEffect, useCallback } from 'react';
import type { Annotation, AnnotationStyle } from './types';
import { normToPixel, type Pt } from './engine';

interface CanvasOverlayProps {
  width: number;
  height: number;
  annotations: Annotation[];
  tempAnnotation?: Partial<Annotation>;
  selectedId?: string | null;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

const CanvasOverlay: React.FC<CanvasOverlayProps> = ({
  width,
  height,
  annotations,
  tempAnnotation,
  selectedId,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Drawing utilities - convert normalized to pixels
  const drawLine = useCallback(
    (ctx: CanvasRenderingContext2D, points: Pt[], style: AnnotationStyle) => {
      if (points.length < 2) return;

      const p1 = normToPixel(points[0], width, height);
      const p2 = normToPixel(points[1], width, height);

      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.thickness;
      ctx.globalAlpha = style.opacity || 1;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    },
    [width, height]
  );

  const drawArrow = useCallback(
    (ctx: CanvasRenderingContext2D, points: Pt[], style: AnnotationStyle) => {
      if (points.length < 2) return;

      const start = normToPixel(points[0], width, height);
      const end = normToPixel(points[1], width, height);
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
    },
    [width, height]
  );

  const drawBox = useCallback(
    (ctx: CanvasRenderingContext2D, points: Pt[], style: AnnotationStyle) => {
      if (points.length < 2) return;

      const start = normToPixel(points[0], width, height);
      const end = normToPixel(points[1], width, height);
      const boxWidth = end.x - start.x;
      const boxHeight = end.y - start.y;

      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.thickness;
      ctx.globalAlpha = style.opacity || 1;

      ctx.strokeRect(start.x, start.y, boxWidth, boxHeight);
    },
    [width, height]
  );

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas (account for device pixel ratio)
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Draw each annotation
    annotations.forEach((annotation) => {
      ctx.save();

      // Highlight selected annotation
      if (annotation.id === selectedId) {
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

    // Draw temp annotation (while drawing)
    if (tempAnnotation?.points && tempAnnotation.points.length >= 2 && tempAnnotation.style) {
      ctx.save();
      ctx.globalAlpha = 0.7; // Slightly transparent while drawing

      switch (tempAnnotation.tool) {
        case 'line':
          drawLine(ctx, tempAnnotation.points, tempAnnotation.style);
          break;
        case 'arrow':
          drawArrow(ctx, tempAnnotation.points, tempAnnotation.style);
          break;
        case 'box':
          drawBox(ctx, tempAnnotation.points, tempAnnotation.style);
          break;
      }

      ctx.restore();
    }
  }, [annotations, tempAnnotation, selectedId, drawLine, drawArrow, drawBox]);

  // Notify parent when canvas is ready
  useEffect(() => {
    if (canvasRef.current && onCanvasReady) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  // Re-render when props change
  useEffect(() => {
    render();
  }, [render]);

  // Handle resize with devicePixelRatio for crisp rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    
    // Set actual canvas size accounting for device pixel ratio
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Scale canvas back down using CSS
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Scale drawing context to match device pixel ratio
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Re-render with new dimensions
    render();
  }, [width, height, render]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full"
      data-annotation-canvas="true"
    />
  );
};

export default CanvasOverlay;