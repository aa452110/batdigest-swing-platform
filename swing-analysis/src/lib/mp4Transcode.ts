// Lightweight wrapper around ffmpeg.wasm to transcode WebM (VP8/Opus) to MP4 (H.264/AAC)
// - Lazily loads FFmpeg core files from /ffmpeg/* (place core files in public/ffmpeg)
// - Exposes progress 0..100
// - Returns an MP4 Blob suitable for preview and upload

export type TranscodeProgressCb = (percent: number) => void;

let ffmpegLoaded = false as boolean;
let FFmpegCtor: any = null;
let ffmpegInstance: any = null;

async function ensureFfmpegLoaded() {
  if (ffmpegLoaded) return;
  // Dynamic import to keep initial bundle lean
  const [{ FFmpeg }, util] = await Promise.all([
    import('@ffmpeg/ffmpeg'),
    import('@ffmpeg/util'),
  ]);
  FFmpegCtor = FFmpeg;

  // Load from CDN to avoid Cloudflare Pages 25MB limit
  // Use the official dist paths (no umd subfolder)
  let coreURL: string;
  let wasmURL: string;
  let workerURL: string;
  // Try known-good UMD paths for single-thread core v0.12.10 (no worker required)
  try {
    const cdnBase = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/';
    coreURL = await util.toBlobURL(cdnBase + 'ffmpeg-core.js', 'text/javascript');
    wasmURL = await util.toBlobURL(cdnBase + 'ffmpeg-core.wasm', 'application/wasm');
    workerURL = '';
  } catch {
    // Fallback to jsDelivr UMD path
    const cdnBase = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/';
    coreURL = await util.toBlobURL(cdnBase + 'ffmpeg-core.js', 'text/javascript');
    wasmURL = await util.toBlobURL(cdnBase + 'ffmpeg-core.wasm', 'application/wasm');
    workerURL = '';
  }

  ffmpegInstance = new FFmpegCtor();
  const loadOpts: any = { coreURL, wasmURL };
  if (workerURL) loadOpts.workerURL = workerURL;
  await ffmpegInstance.load(loadOpts);
  ffmpegLoaded = true;
}

export async function transcodeWebmToMp4(
  source: Blob,
  onProgress?: TranscodeProgressCb
): Promise<Blob> {
  await ensureFfmpegLoaded();

  // Hook progress
  ffmpegInstance.on('progress', ({ progress }: { progress: number }) => {
    if (onProgress) onProgress(Math.max(0, Math.min(100, Math.round(progress * 100))));
  });

  // Write input
  const { fetchFile } = await import('@ffmpeg/util');
  const inputData = await fetchFile(source);
  const inputName = 'input.webm';
  const outputName = 'output.mp4';
  await ffmpegInstance.writeFile(inputName, inputData);

  // Run transcode: H.264/AAC, fast start, yuv420p for broad compatibility
  const args = [
    '-i', inputName,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    outputName,
  ];

  await ffmpegInstance.exec(args);

  // Read result
  const outData = await ffmpegInstance.readFile(outputName);
  const mp4Blob = new Blob([outData as Uint8Array], { type: 'video/mp4' });

  // Cleanup (best-effort)
  try { await ffmpegInstance.deleteFile(inputName); } catch {}
  try { await ffmpegInstance.deleteFile(outputName); } catch {}

  return mp4Blob;
}
