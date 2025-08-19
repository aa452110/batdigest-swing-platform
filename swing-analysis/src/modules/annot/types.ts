export type ToolType = 'line' | 'arrow' | 'box' | 'select';

export interface Point {
  x: number;
  y: number;
}

export interface AnnotationStyle {
  color: string;
  thickness: number;
  opacity?: number;
}

export interface Annotation {
  id: string;
  tool: ToolType;
  points: Point[];
  style: AnnotationStyle;
  tStart: number; // Start time in seconds
  tEnd: number; // End time in seconds
}

export interface DrawingState {
  isDrawing: boolean;
  currentTool: ToolType;
  currentStyle: AnnotationStyle;
  tempPoints: Point[];
}
