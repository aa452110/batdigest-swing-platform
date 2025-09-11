// Lightweight wrapper around ffmpeg.wasm to transcode WebM (VP8/Opus) to MP4 (H.264/AAC)
// - Lazily loads FFmpeg core files from /ffmpeg/* (place core files in public/ffmpeg)
// - Exposes progress 0..100
// - Returns an MP4 Blob suitable for preview and upload

export type TranscodeProgressCb = (percent: number) => void;
export type FfmpegStatusCb = (message: string) => void;

let ffmpegLoaded = false as boolean;
let FFmpegCtor: any = null;
let ffmpegInstance: any = null;

export function isFfmpegLoaded() {
  return ffmpegLoaded;
}

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
  // Load core via Worker proxy (single-thread core; no worker/COEP required)
  const proxyBase = 'https://swing-platform.brianduryea.workers.dev/api/ffmpeg-core/';
  // Pass direct HTTPS URLs so the worker's importScripts grabs script bytes directly
  coreURL = proxyBase + 'ffmpeg-core.js';
  wasmURL = proxyBase + 'ffmpeg-core.wasm';
  workerURL = '';

  ffmpegInstance = new FFmpegCtor();
  const loadOpts: any = { coreURL, wasmURL };
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

  // Run transcode from the original recorded WebM: map both streams explicitly
  const args = [
    '-i', inputName,
    '-map', '0:v:0',
    '-map', '0:a:0',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'veryfast',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ac', '2',
    '-ar', '48000',
    '-movflags', '+faststart',
    '-shortest',
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

// Preload FFmpeg core files with progress so UI can indicate status before the first transcode
export async function preloadFfmpeg(onStatus?: FfmpegStatusCb, onDownloadProgress?: (overallPct: number) => void) {
  if (ffmpegLoaded) return;

  const coreBase = 'https://swing-platform.brianduryea.workers.dev/api/ffmpeg-core/';
  const files = [
    { url: coreBase + 'ffmpeg-core.js', label: 'core.js' },
    { url: coreBase + 'ffmpeg-core.wasm', label: 'core.wasm' },
  ];

  let totalKnown = 0;
  let totalReceived = 0;

  // Fetch with streaming progress so the browser caches them
  for (const f of files) {
    onStatus?.(`Loading FFmpeg (${f.label})…`);
    const res = await fetch(f.url, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${f.label}: ${res.status}`);
    const lenHeader = res.headers.get('content-length');
    const fileTotal = lenHeader ? parseInt(lenHeader, 10) : 0;
    if (fileTotal) totalKnown += fileTotal;
    const reader = res.body?.getReader();
    if (!reader) {
      // Fallback: consume without progress
      await res.arrayBuffer();
      continue;
    }
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      totalReceived += value?.length || 0;
      if (onDownloadProgress && totalKnown) {
        const pct = Math.max(0, Math.min(100, Math.round((totalReceived / totalKnown) * 100)));
        onDownloadProgress(pct);
      }
    }
  }

  onStatus?.('Initializing FFmpeg…');
  await ensureFfmpegLoaded();
  onStatus?.('Ready');
}
