import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<void> | null = null;

async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpegLoadPromise) {
    await ffmpegLoadPromise;
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();
  
  ffmpegLoadPromise = (async () => {
    try {
      // Load single-threaded FFmpeg (no SharedArrayBuffer required)
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      
      await ffmpeg!.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      });
      
      console.log('[MP4Transcode] FFmpeg loaded successfully');
    } catch (error) {
      console.error('[MP4Transcode] Failed to load FFmpeg:', error);
      throw error;
    }
  })();
  
  await ffmpegLoadPromise;
  return ffmpeg;
}

export async function transcodeWebMToMP4(
  webmBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  try {
    console.log('[MP4Transcode] Starting transcode, input size:', webmBlob.size);
    
    // Load FFmpeg if not already loaded
    const ffmpegInstance = await loadFFmpeg();
    
    // Set progress callback
    if (onProgress) {
      ffmpegInstance.on('progress', ({ progress }) => {
        const percentage = Math.round(progress * 100);
        console.log(`[MP4Transcode] Progress: ${percentage}%`);
        onProgress(percentage);
      });
    }
    
    // Write input file
    const inputFileName = 'input.webm';
    const outputFileName = 'output.mp4';
    
    await ffmpegInstance.writeFile(inputFileName, await fetchFile(webmBlob));
    console.log('[MP4Transcode] Input file written');
    
    // Transcode with proper settings for iOS compatibility
    await ffmpegInstance.exec([
      '-i', inputFileName,
      '-c:v', 'libx264',           // H.264 codec for iOS compatibility
      '-preset', 'fast',            // Fast encoding
      '-crf', '23',                 // Quality (lower = better, 23 is good balance)
      '-c:a', 'aac',                // AAC audio for iOS
      '-b:a', '128k',               // Audio bitrate
      '-movflags', '+faststart',    // Enable streaming
      '-pix_fmt', 'yuv420p',        // Pixel format for compatibility
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', // Ensure even dimensions
      outputFileName
    ]);
    
    console.log('[MP4Transcode] Transcode complete');
    
    // Read output file
    const data = await ffmpegInstance.readFile(outputFileName);
    const mp4Blob = new Blob([data], { type: 'video/mp4' });
    
    console.log('[MP4Transcode] Output MP4 size:', mp4Blob.size);
    
    // Clean up
    try {
      await ffmpegInstance.deleteFile(inputFileName);
      await ffmpegInstance.deleteFile(outputFileName);
    } catch (e) {
      console.warn('[MP4Transcode] Cleanup error:', e);
    }
    
    // Clear progress callback
    if (onProgress) {
      ffmpegInstance.off('progress');
    }
    
    return mp4Blob;
  } catch (error) {
    console.error('[MP4Transcode] Transcode failed:', error);
    throw new Error(`Failed to transcode video: ${error}`);
  }
}