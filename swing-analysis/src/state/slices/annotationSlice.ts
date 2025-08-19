import type { StateCreator } from 'zustand';
import type { Annotation, ToolType, AnnotationStyle } from '../../modules/annot/types';

export interface AnnotationSlice {
  // State
  annotations: Annotation[];
  currentTool: ToolType;
  currentStyle: AnnotationStyle;
  selectedAnnotationId: string | null;
  history: {
    past: Annotation[][];
    future: Annotation[][];
  };

  // Actions
  setCurrentTool: (tool: ToolType) => void;
  setCurrentStyle: (style: Partial<AnnotationStyle>) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  selectAnnotation: (id: string | null) => void;
  clearAnnotations: () => void;
  getAnnotationsAtTime: (time: number) => Annotation[];
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY_SIZE = 50;

export const createAnnotationSlice: StateCreator<AnnotationSlice> = (set, get) => ({
  // Initial state
  annotations: [],
  currentTool: 'select',
  currentStyle: {
    color: '#FF0000',
    thickness: 3,
    opacity: 1,
  },
  selectedAnnotationId: null,
  history: {
    past: [],
    future: [],
  },

  // Actions
  setCurrentTool: (tool) => {
    set({ currentTool: tool });
  },

  setCurrentStyle: (style) => {
    set((state) => ({
      currentStyle: { ...state.currentStyle, ...style },
    }));
  },

  addAnnotation: (annotation) => {
    set((state) => {
      const newAnnotations = [...state.annotations, annotation];
      const newPast = [...state.history.past, state.annotations].slice(-MAX_HISTORY_SIZE);
      
      return {
        annotations: newAnnotations,
        history: {
          past: newPast,
          future: [], // Clear redo stack on new action
        },
      };
    });
  },

  updateAnnotation: (id, updates) => {
    set((state) => {
      const newAnnotations = state.annotations.map((ann) =>
        ann.id === id ? { ...ann, ...updates } : ann
      );
      const newPast = [...state.history.past, state.annotations].slice(-MAX_HISTORY_SIZE);
      
      return {
        annotations: newAnnotations,
        history: {
          past: newPast,
          future: [],
        },
      };
    });
  },

  deleteAnnotation: (id) => {
    set((state) => {
      const newAnnotations = state.annotations.filter((ann) => ann.id !== id);
      const newPast = [...state.history.past, state.annotations].slice(-MAX_HISTORY_SIZE);
      
      return {
        annotations: newAnnotations,
        selectedAnnotationId: state.selectedAnnotationId === id ? null : state.selectedAnnotationId,
        history: {
          past: newPast,
          future: [],
        },
      };
    });
  },

  selectAnnotation: (id) => {
    set({ selectedAnnotationId: id });
  },

  clearAnnotations: () => {
    set((state) => {
      const newPast = [...state.history.past, state.annotations].slice(-MAX_HISTORY_SIZE);
      
      return {
        annotations: [],
        selectedAnnotationId: null,
        history: {
          past: newPast,
          future: [],
        },
      };
    });
  },

  getAnnotationsAtTime: (time) => {
    const { annotations } = get();
    return annotations.filter(
      (ann) => time >= ann.tStart && time <= ann.tEnd
    );
  },

  undo: () => {
    set((state) => {
      if (state.history.past.length === 0) return state;

      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      const newFuture = [state.annotations, ...state.history.future].slice(0, MAX_HISTORY_SIZE);

      return {
        annotations: previous,
        history: {
          past: newPast,
          future: newFuture,
        },
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.history.future.length === 0) return state;

      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      const newPast = [...state.history.past, state.annotations].slice(-MAX_HISTORY_SIZE);

      return {
        annotations: next,
        history: {
          past: newPast,
          future: newFuture,
        },
      };
    });
  },

  canUndo: () => {
    const { history } = get();
    return history.past.length > 0;
  },

  canRedo: () => {
    const { history } = get();
    return history.future.length > 0;
  },
});