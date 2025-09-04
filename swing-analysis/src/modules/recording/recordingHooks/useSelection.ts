import { useCallback, useState } from 'react';
import { getDisplayMediaWithCursor } from '../recordingFunctions/media';

export type SelectionBox = { x: number; y: number; width: number; height: number };

export function useSelection() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox>({
    x: window.innerWidth / 2 - 640,
    y: window.innerHeight / 2 - 360,
    width: 1280,
    height: 720,
  });

  const startSelecting = useCallback(async (displayStreamRef: React.MutableRefObject<MediaStream | null>, videoRef: React.MutableRefObject<HTMLVideoElement | null>) => {
    try {
      if (!displayStreamRef.current) {
        const displayStream = await getDisplayMediaWithCursor({ audio: false });
        displayStreamRef.current = displayStream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = displayStreamRef.current;
          await new Promise((resolve) => {
            (video as HTMLVideoElement).onloadedmetadata = () => resolve(true);
          });
          await (video as HTMLVideoElement).play();
        }
      }
      setHasSelected(false);
      setIsSelecting(true);
    } catch (err) {
      console.error('Failed to start screen capture for selection:', err);
      alert('Screen capture permission is required to select an area.');
    }
  }, []);

  const confirmSelection = useCallback((videoRef: React.MutableRefObject<HTMLVideoElement | null>) => {
    const video = videoRef.current;
    if (!video) return { cropRect: null as null | { x: number; y: number; w: number; h: number }, offsets: { x: 0, y: 0 } };
    const vw = Math.max(1, (video as HTMLVideoElement).videoWidth);
    const vh = Math.max(1, (video as HTMLVideoElement).videoHeight);
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const scale = Math.min(viewportW / vw, viewportH / vh);
    const dispW = vw * scale;
    const dispH = vh * scale;
    const offX = (viewportW - dispW) / 2;
    const offY = (viewportH - dispH) / 2;

    const selX1 = selectionBox.x;
    const selY1 = selectionBox.y;
    const selX2 = selectionBox.x + selectionBox.width;
    const selY2 = selectionBox.y + selectionBox.height;
    const vidX1 = offX;
    const vidY1 = offY;
    const vidX2 = offX + dispW;
    const vidY2 = offY + dispH;
    const clipX1 = Math.max(selX1, vidX1);
    const clipY1 = Math.max(selY1, vidY1);
    const clipX2 = Math.min(selX2, vidX2);
    const clipY2 = Math.min(selY2, vidY2);
    const clipW = clipX2 - clipX1;
    const clipH = clipY2 - clipY1;
    if (clipW <= 0 || clipH <= 0) {
      alert('Selection is outside the captured video. Please move the box over the video.');
      return { cropRect: null, offsets: { x: 0, y: 0 } };
    }
    const cropX = (clipX1 - offX) / scale;
    const cropY = (clipY1 - offY) / scale;
    const cropW = clipW / scale;
    const cropH = clipH / scale;
    setIsSelecting(false);
    setHasSelected(true);
    return { cropRect: { x: cropX, y: cropY, w: cropW, h: cropH }, offsets: { x: 0, y: 0 } };
  }, [selectionBox]);

  return {
    isSelecting,
    hasSelected,
    selectionBox,
    setSelectionBox,
    setHasSelected,
    startSelecting,
    confirmSelection,
  };
}
