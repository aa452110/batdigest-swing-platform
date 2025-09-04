import { create } from 'zustand';
import type { Annotation, ToolType, AnnotationStyle } from '../types/annotation';

interface AnnotationState {
  annotations: Annotation[];
  selectedAnnotationId: string | null;
  currentTool: ToolType;
  currentStyle: AnnotationStyle;
  undoStack: Annotation[][];
  redoStack: Annotation[][];

  // Actions
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  selectAnnotation: (id: string | null) => void;
  setCurrentTool: (tool: ToolType) => void;
  setCurrentStyle: (style: Partial<AnnotationStyle>) => void;

  // Timeline
  getAnnotationsAtTime: (time: number) => Annotation[];

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  pushToUndoStack: () => void;

  // Clear
  clearAnnotations: () => void;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: [],
  selectedAnnotationId: null,
  currentTool: 'line',
  currentStyle: {
    color: '#3b82f6',
    thickness: 2,
    opacity: 1,
  },
  undoStack: [],
  redoStack: [],

  addAnnotation: (annotation) => {
    const { pushToUndoStack } = get();
    pushToUndoStack();
    set((state) => ({
      annotations: [...state.annotations, annotation],
      redoStack: [], // Clear redo stack on new action
    }));
  },

  updateAnnotation: (id, updates) => {
    const { pushToUndoStack } = get();
    pushToUndoStack();
    set((state) => ({
      annotations: state.annotations.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann)),
      redoStack: [],
    }));
  },

  deleteAnnotation: (id) => {
    const { pushToUndoStack } = get();
    pushToUndoStack();
    set((state) => ({
      annotations: state.annotations.filter((ann) => ann.id !== id),
      selectedAnnotationId: state.selectedAnnotationId === id ? null : state.selectedAnnotationId,
      redoStack: [],
    }));
  },

  selectAnnotation: (id) => {
    set({ selectedAnnotationId: id });
  },

  setCurrentTool: (tool) => {
    set({ currentTool: tool, selectedAnnotationId: null });
  },

  setCurrentStyle: (style) => {
    set((state) => ({
      currentStyle: { ...state.currentStyle, ...style },
    }));
  },

  getAnnotationsAtTime: (time) => {
    const { annotations } = get();
    return annotations.filter((ann) => time >= ann.tStart && time <= ann.tEnd);
  },

  pushToUndoStack: () => {
    const { annotations, undoStack } = get();
    const newStack = [...undoStack, [...annotations]];
    // Limit stack size to prevent memory issues
    if (newStack.length > 50) {
      newStack.shift();
    }
    set({ undoStack: newStack });
  },

  undo: () => {
    const { undoStack, annotations } = get();
    if (undoStack.length === 0) return;

    const newUndoStack = [...undoStack];
    const previousState = newUndoStack.pop();

    if (previousState) {
      set((state) => ({
        annotations: previousState,
        undoStack: newUndoStack,
        redoStack: [...state.redoStack, annotations],
        selectedAnnotationId: null,
      }));
    }
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return;

    const { pushToUndoStack } = get();
    pushToUndoStack();

    const newRedoStack = [...redoStack];
    const nextState = newRedoStack.pop();

    if (nextState) {
      set({
        annotations: nextState,
        redoStack: newRedoStack,
        selectedAnnotationId: null,
      });
    }
  },

  clearAnnotations: () => {
    const { pushToUndoStack } = get();
    pushToUndoStack();
    set({
      annotations: [],
      selectedAnnotationId: null,
      redoStack: [],
    });
  },
}));
