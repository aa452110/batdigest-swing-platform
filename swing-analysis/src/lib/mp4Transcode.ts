// Lightweight wrapper around ffmpeg.wasm to transcode WebM (VP8/Opus) to MP4 (H.264/AAC)
// - Lazily loads FFmpeg core files from /ffmpeg/* (place core files in public/ffmpeg)
// - Exposes progress 0..100
// - Returns an MP4 Blob suitable for preview and upload

export type TranscodeProgressCb = (percent: number) => void;
export type FfmpegStatusCb = (message: string) => void;

let ffmpegLoaded = false as boolean;
let FFmpegCtor: any = null;
let ffmpegInstance: any = null;

// Helper: simple timeout wrapper for promises
async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let t: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    t = window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    if (t) clearTimeout(t);
  }
}

function getSameOriginCoreBase() {
  // Prefer same-origin proxy to avoid cross-origin worker/cors quirks
  // Pages Function proxies /api/* to the platform worker
  return `${location.origin}/api/ffmpeg-core/`;
}

function getWorkerCoreBase() {
  // Direct worker URL (kept as fallback)
  return 'https://swing-platform.brianduryea.workers.dev/api/ffmpeg-core/';
}

function getCdnCoreBase() {
  // Official CDN fallback (UMD paths) matching @ffmpeg/core 0.12.x
  return 'https://unpkg.com/@ffmpeg/core@0.12.9/dist/umd/';
}

function isLocalhost(): boolean {
  try {
    const h = location.hostname;
    return (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h === '::1' ||
      // Common local dev hostnames
      h.endsWith('.local')
    );
  } catch {
    return false;
  }
}

export function isFfmpegLoaded() {
  return ffmpegLoaded;
}

async function ensureFfmpegLoaded() {
  if (ffmpegLoaded) return;
  // Dynamic import to keep initial bundle lean
  const [{ FFmpeg }] = await Promise.all([
    import('@ffmpeg/ffmpeg'),
  ]);
  FFmpegCtor = FFmpeg;

  // Choose one source that works: CDN for localhost, Worker for prod
  const primaryBase = isLocalhost() ? getCdnCoreBase() : getWorkerCoreBase();
  const fallbackBase = primaryBase === getCdnCoreBase() ? getWorkerCoreBase() : getCdnCoreBase();

  const tryLoad = async (base: string, timeoutMs: number) => {
    const coreURL = base + 'ffmpeg-core.js';
    const wasmURL = base + 'ffmpeg-core.wasm';
    const inst = new FFmpegCtor();
    const loadOpts: any = { coreURL, wasmURL };
    await withTimeout(inst.load(loadOpts), timeoutMs, `FFmpeg load from ${base}`);
    return inst;
  };

  try {
    const inst = await tryLoad(primaryBase, primaryBase === getCdnCoreBase() ? 20000 : 15000);
    ffmpegInstance = inst;
    ffmpegLoaded = true;
    return;
  } catch (e1) {
    // Quick fallback to the other source
    try {
      const inst = await tryLoad(fallbackBase, fallbackBase === getCdnCoreBase() ? 20000 : 15000);
      ffmpegInstance = inst;
      ffmpegLoaded = true;
      return;
    } catch (e2) {
      throw e2 || e1 || new Error('FFmpeg initialization failed');
    }
  }
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

  // Pin to one working source: CDN for localhost, Worker for prod
  const base = isLocalhost() ? getCdnCoreBase() : getWorkerCoreBase();
  let files: { url: string; label: string }[] = [
    { url: base + 'ffmpeg-core.js', label: 'core.js' },
    { url: base + 'ffmpeg-core.wasm', label: 'core.wasm' },
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
