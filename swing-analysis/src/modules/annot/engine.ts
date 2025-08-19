/**
 * Pure annotation engine - no UI dependencies
 */

export type Tool = 'line' | 'arrow' | 'box' | 'select';

// Normalized point (0-1 in video space)
export interface Pt {
  x: number; // 0..1
  y: number; // 0..1
}

export interface AnnotationStyle {
  color: string;
  width: number;
  opacity?: number;
}

export interface Annotation {
  id: string;
  tool: Tool;
  points: Pt[];
  tStart: number;
  tEnd: number;
  style: AnnotationStyle;
}

export interface DraftAnnotation {
  tool: Tool;
  points: Pt[];
  startTime: number;
  style: AnnotationStyle;
}

/**
 * Start a new stroke/annotation
 */
export function startStroke(tool: Tool, pt: Pt, t: number, style: AnnotationStyle): DraftAnnotation {
  return {
    tool,
    points: [pt, pt], // Start with two points for line/arrow/box
    startTime: t,
    style,
  };
}

/**
 * Update stroke with new point
 */
export function updateStroke(draft: DraftAnnotation, pt: Pt): DraftAnnotation {
  return {
    ...draft,
    points: [draft.points[0], pt], // Keep start, update end
  };
}

/**
 * Finalize draft into annotation
 */
export function commitStroke(draft: DraftAnnotation, endTime: number): Annotation {
  return {
    id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tool: draft.tool as Exclude<Tool, 'select'>,
    points: [...draft.points],
    tStart: draft.startTime,
    tEnd: endTime,
    style: { ...draft.style },
  };
}

/**
 * Hit test - find annotation at point
 */
export function hitTest(annos: Annotation[], pt: Pt, tolerance: number = 0.02): string | null {
  // Test in reverse order (top to bottom)
  for (let i = annos.length - 1; i >= 0; i--) {
    const ann = annos[i];
    if (ann.points.length < 2) continue;

    const [p1, p2] = ann.points;
    
    if (ann.tool === 'box') {
      // Box hit test
      const minX = Math.min(p1.x, p2.x) - tolerance;
      const maxX = Math.max(p1.x, p2.x) + tolerance;
      const minY = Math.min(p1.y, p2.y) - tolerance;
      const maxY = Math.max(p1.y, p2.y) + tolerance;
      
      if (pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY) {
        return ann.id;
      }
    } else {
      // Line/arrow hit test - distance to line segment
      const dist = distanceToLineSegment(pt, p1, p2);
      if (dist < tolerance) {
        return ann.id;
      }
    }
  }
  
  return null;
}

/**
 * Distance from point to line segment
 */
function distanceToLineSegment(pt: Pt, p1: Pt, p2: Pt): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSq = dx * dx + dy * dy;
  
  if (lengthSq === 0) {
    // Points are the same
    return Math.sqrt((pt.x - p1.x) ** 2 + (pt.y - p1.y) ** 2);
  }
  
  // Project point onto line
  let t = ((pt.x - p1.x) * dx + (pt.y - p1.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  
  const projX = p1.x + t * dx;
  const projY = p1.y + t * dy;
  
  return Math.sqrt((pt.x - projX) ** 2 + (pt.y - projY) ** 2);
}

/**
 * Convert normalized point to pixel coordinates
 */
export function normToPixel(pt: Pt, width: number, height: number): { x: number; y: number } {
  return {
    x: pt.x * width,
    y: pt.y * height,
  };
}

/**
 * Convert pixel coordinates to normalized point
 */
export function pixelToNorm(x: number, y: number, width: number, height: number): Pt {
  return {
    x: x / width,
    y: y / height,
  };
}

/**
 * Get annotations visible at time
 */
export function getAnnotationsAtTime(annotations: Annotation[], time: number): Annotation[] {
  return annotations.filter(ann => time >= ann.tStart && time <= ann.tEnd);
}

/**
 * Undo/Redo stack operations
 */
export interface HistoryStack<T> {
  past: T[];
  present: T;
  future: T[];
}

export function createHistory<T>(initial: T): HistoryStack<T> {
  return {
    past: [],
    present: initial,
    future: [],
  };
}

export function pushHistory<T>(stack: HistoryStack<T>, newState: T): HistoryStack<T> {
  return {
    past: [...stack.past, stack.present],
    present: newState,
    future: [], // Clear redo stack on new action
  };
}

export function undo<T>(stack: HistoryStack<T>): HistoryStack<T> {
  if (stack.past.length === 0) return stack;
  
  const previous = stack.past[stack.past.length - 1];
  return {
    past: stack.past.slice(0, -1),
    present: previous,
    future: [stack.present, ...stack.future],
  };
}

export function redo<T>(stack: HistoryStack<T>): HistoryStack<T> {
  if (stack.future.length === 0) return stack;
  
  const next = stack.future[0];
  return {
    past: [...stack.past, stack.present],
    present: next,
    future: stack.future.slice(1),
  };
}