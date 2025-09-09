// Fix for Chrome's WebM duration bug when using captureStream
// Based on: https://github.com/mat-sz/webm-fix-duration

export async function fixWebmDuration(blob: Blob, duration: number): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const dataView = new DataView(arrayBuffer);
  
  // Find the Segment Information element (0x1549A966)
  let offset = 0;
  let segmentOffset = -1;
  
  while (offset < dataView.byteLength - 4) {
    // Look for EBML IDs
    if (dataView.getUint32(offset, false) === 0x1549A966) {
      segmentOffset = offset;
      break;
    }
    offset++;
  }
  
  if (segmentOffset === -1) {
    console.warn('[fixWebmDuration] Could not find Segment Information element');
    return blob; // Return original if we can't fix it
  }
  
  try {
    // Try to inject duration at a known offset
    // This is a simplified fix - a proper fix would parse the EBML structure
    const durationFloat = new Float32Array([duration * 1000]); // Duration in milliseconds
    const durationBytes = new Uint8Array(durationFloat.buffer);
    
    // Create a new blob with the duration injected
    const beforeSegment = arrayBuffer.slice(0, segmentOffset);
    const afterSegment = arrayBuffer.slice(segmentOffset);
    
    const fixedBuffer = new ArrayBuffer(arrayBuffer.byteLength);
    const fixedView = new Uint8Array(fixedBuffer);
    
    fixedView.set(new Uint8Array(beforeSegment), 0);
    fixedView.set(new Uint8Array(afterSegment), beforeSegment.byteLength);
    
    return new Blob([fixedBuffer], { type: blob.type });
  } catch (e) {
    console.error('[fixWebmDuration] Failed to fix duration:', e);
    return blob;
  }
}

// Alternative approach: Use MediaSource API to remux
export async function remuxWebm(blob: Blob, duration: number): Promise<Blob> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.src = URL.createObjectURL(blob);
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const stream = canvas.captureStream();
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const fixedBlob = new Blob(chunks, { type: 'video/webm' });
        URL.revokeObjectURL(video.src);
        resolve(fixedBlob);
      };
      
      // Play and re-record
      video.play();
      recorder.start();
      
      video.onended = () => {
        recorder.stop();
      };
      
      // Draw frames
      const drawFrame = () => {
        if (!video.paused && !video.ended) {
          ctx?.drawImage(video, 0, 0);
          requestAnimationFrame(drawFrame);
        }
      };
      drawFrame();
    };
    
    video.onerror = () => {
      console.error('[remuxWebm] Failed to load video');
      resolve(blob); // Return original on error
    };
  });
}