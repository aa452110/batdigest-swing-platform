export function createAnimator(draw: () => void) {
  let frameId: number | null = null;
  let frameCount = 0;

  const tick = () => {
    frameCount++;
    if (frameCount <= 3) {
      console.log(`🎞️ Frame ${frameCount} - calling draw()`);
    }
    draw();
    frameId = requestAnimationFrame(tick);
  };

  const start = () => {
    console.log('🏁 Animator.start() called, frameId:', frameId);
    if (frameId != null) {
      console.log('⚠️ Animator already running, skipping');
      return;
    }
    console.log('✅ Starting animation loop');
    tick();
  };

  const stop = () => {
    console.log('🛑 Animator.stop() called');
    if (frameId != null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  return { start, stop };
}

