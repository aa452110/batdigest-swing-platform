export function createAnimator(draw: () => void) {
  let frameId: number | null = null;

  const tick = () => {
    draw();
    frameId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (frameId != null) return;
    tick();
  };

  const stop = () => {
    if (frameId != null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  return { start, stop };
}

