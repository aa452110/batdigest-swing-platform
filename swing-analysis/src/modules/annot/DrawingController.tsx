import React, { useState, useCallback } from 'react';
import type { Annotation, AnnotationStyle, ToolType } from './types';
import { startStroke, updateStroke, commitStroke, hitTest, pixelToNorm, type Pt, type DraftAnnotation } from './engine';

interface DrawingControllerProps {
  currentTool: ToolType;
  currentStyle: AnnotationStyle;
  currentTime: number;
  isPlaying: boolean;
  onAnnotationComplete: (annotation: Annotation) => void;
  onAnnotationSelect: (id: string | null) => void;
  annotations: Annotation[];
  children: (props: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    tempAnnotation: Partial<Annotation> | undefined;
    isDrawing: boolean;
  }) => React.ReactNode;
}

const DrawingController: React.FC<DrawingControllerProps> = ({
  currentTool,
  currentStyle,
  currentTime,
  isPlaying,
  onAnnotationComplete,
  onAnnotationSelect,
  annotations,
  children,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [draft, setDraft] = useState<DraftAnnotation | null>(null);

  const getPoint = useCallback((e: React.MouseEvent): Pt => {
    // Get the event target which should be our container div
    const container = e.currentTarget as HTMLElement;
    
    // Find the canvas element which should match the video dimensions
    const canvas = container.querySelector('canvas');
    
    if (canvas) {
      // Use canvas dimensions and position
      const canvasRect = canvas.getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;
      
      // Normalize based on canvas display size
      return {
        x: Math.max(0, Math.min(1, x / canvasRect.width)),
        y: Math.max(0, Math.min(1, y / canvasRect.height)),
      };
    }
    
    // Fallback: use container
    const rect = container.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const point = getPoint(e);

      if (currentTool === 'select') {
        // Use pure hit test function
        const clickedId = hitTest(annotations, point);
        onAnnotationSelect(clickedId);
      } else {
        // Start drawing with normalized coordinates
        const newDraft = startStroke(currentTool, point, currentTime, currentStyle);
        setDraft(newDraft);
        setIsDrawing(true);
      }
    },
    [currentTool, currentTime, annotations, getPoint, onAnnotationSelect, currentStyle]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || !draft) return;
      const point = getPoint(e);
      const updatedDraft = updateStroke(draft, point);
      setDraft(updatedDraft);
    },
    [isDrawing, draft, getPoint]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !draft) {
      setIsDrawing(false);
      setDraft(null);
      return;
    }

    // Commit the stroke with normalized coordinates
    const endTime = isPlaying ? currentTime : draft.startTime + 5; // Default 5 second duration if paused
    const annotation = commitStroke(draft, endTime);
    
    onAnnotationComplete(annotation as Annotation);

    setIsDrawing(false);
    setDraft(null);
  }, [isDrawing, draft, currentTime, isPlaying, onAnnotationComplete]);

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setDraft(null);
    }
  }, [isDrawing]);

  const tempAnnotation = isDrawing && draft
    ? {
        tool: draft.tool,
        points: draft.points,
        style: draft.style,
      }
    : undefined;

  return (
    <>
      {children({
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseLeave,
        tempAnnotation,
        isDrawing,
      })}
    </>
  );
};

export default DrawingController;