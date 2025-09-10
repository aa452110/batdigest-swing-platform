/**
 * Video compression utility for reducing file sizes before upload
 * Uses browser's built-in video processing capabilities
 * Implements duration-based bitrate calculation as recommended
 */

export interface CompressionOptions {
  targetSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  audioKbps?: number;
  minVideoBitrate?: number;
}

export interface CompressionProgress {
  percent: number;
  currentSize: number;
  estimatedFinalSize?: number;
  stage?: string;
}

/**
 * Get video duration from blob
 */
export async function getVideoDuration(videoBlob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const videoUrl = URL.createObjectURL(videoBlob);
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(videoUrl);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = videoUrl;
    video.load();
  });
}

/**
 * Calculate optimal bitrate based on target size and duration
 */
function calculateOptimalBitrate(
  targetSizeBytes: number,
  durationSeconds: number,
  audioKbps: number = 128
): number {
  // Calculate available bits for video after accounting for audio
  const totalBits = targetSizeBytes * 8;
  const audioBits = audioKbps * 1000 * durationSeconds;
  const videoBits = totalBits - audioBits;
  
  // Calculate video bitrate in bps
  const videoBitrate = Math.floor(videoBits / durationSeconds);
  
  // Enforce minimum bitrate of 700kbps for quality
  const minBitrate = 700000;
  
  return Math.max(minBitrate, videoBitrate);
}

/**
 * Compress a video blob to reduce file size
 * @param videoBlob - The original video blob
 * @param options - Compression options
 * @param onProgress - Progress callback
 * @returns Compressed video blob
 */
export async function compressVideo(
  videoBlob: Blob,
  options: CompressionOptions = {},
  onProgress?: (progress: CompressionProgress) => void
): Promise<Blob> {
  const {
    targetSizeMB = 175, // Conservative target (leaves headroom for container overhead)
    maxWidth = 1920,
    maxHeight = 1080,
    audioKbps = 128,
    minVideoBitrate = 700000
  } = options;

  // Check if video needs compression
  const sizeMB = videoBlob.size / (1024 * 1024);
  console.log(`[Compression] Original size: ${sizeMB.toFixed(2)}MB`);
  
  if (sizeMB <= targetSizeMB) {
    console.log('[Compression] Video already under size limit, skipping compression');
    return videoBlob;
  }

  // Get video duration for bitrate calculation
  const duration = await getVideoDuration(videoBlob);
  console.log(`[Compression] Video duration: ${duration.toFixed(2)} seconds`);
  
  // Calculate optimal bitrate based on duration
  const targetSizeBytes = targetSizeMB * 1024 * 1024;
  const videoBitrate = calculateOptimalBitrate(targetSizeBytes, duration, audioKbps);
  
  console.log(`[Compression] Calculated video bitrate: ${(videoBitrate / 1000000).toFixed(2)} Mbps`);
  
  // If calculated bitrate is too low, we need to reduce resolution
  let targetWidth = maxWidth;
  let targetHeight = maxHeight;
  
  if (videoBitrate < minVideoBitrate * 1.5) {
    // Drop to 720p for better quality at lower bitrate
    targetWidth = 1280;
    targetHeight = 720;
    console.log('[Compression] Reducing to 720p for better quality at low bitrate');
  }

  // Create video element to load the video
  const video = document.createElement('video');
  const videoUrl = URL.createObjectURL(videoBlob);
  
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = async () => {
      try {
        const { videoWidth, videoHeight, duration } = video;
        
        // Calculate scaling to fit within max dimensions
        let scale = 1;
        if (videoWidth > maxWidth || videoHeight > maxHeight) {
          scale = Math.min(maxWidth / videoWidth, maxHeight / videoHeight);
        }
        
        const outputWidth = Math.floor(videoWidth * scale);
        const outputHeight = Math.floor(videoHeight * scale);
        
        console.log(`[Compression] Scaling from ${videoWidth}x${videoHeight} to ${outputWidth}x${outputHeight}`);
        
        // Create canvas for frame extraction
        const canvas = document.createElement('canvas');
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Set up MediaRecorder for re-encoding with audio
        const canvasStream = canvas.captureStream(30); // 30 fps
        
        // Extract audio from the original video to preserve it
        let combinedStream: MediaStream;
        try {
          // Create an audio context to capture audio from the video element
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContext.createMediaElementSource(video);
          const destination = audioContext.createMediaStreamDestination();
          source.connect(destination);
          source.connect(audioContext.destination); // Also play audio during processing
          
          // Combine video from canvas and audio from original
          combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...destination.stream.getAudioTracks()
          ]);
          
          console.log('[Compression] Audio tracks included:', destination.stream.getAudioTracks().length);
        } catch (audioError) {
          console.warn('[Compression] Could not extract audio, proceeding with video only:', audioError);
          combinedStream = canvasStream;
        }
        
        // Calculate bitrate based on target size
        const targetSizeBytes = maxSizeMB * 1024 * 1024;
        const calculatedBitrate = Math.min(
          targetBitrate,
          Math.floor((targetSizeBytes * 8) / duration) // bits = bytes * 8
        );
        
        console.log(`[Compression] Using bitrate: ${(calculatedBitrate / 1000000).toFixed(2)} Mbps`);
        
        const mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: 'video/webm;codecs=vp9,opus',  // Include opus for audio
          videoBitsPerSecond: calculatedBitrate,
          audioBitsPerSecond: audioKbps * 1000  // Add audio bitrate
        });
        
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
            
            // Calculate progress
            if (onProgress) {
              const currentSize = chunks.reduce((acc, chunk) => acc + chunk.size, 0);
              const percent = Math.min((video.currentTime / duration) * 100, 100);
              onProgress({
                percent,
                currentSize,
                estimatedFinalSize: (currentSize / video.currentTime) * duration
              });
            }
          }
        };
        
        mediaRecorder.onstop = async () => {
          const compressedBlob = new Blob(chunks, { type: 'video/webm' });
          const compressedSizeMB = compressedBlob.size / (1024 * 1024);
          
          console.log(`[Compression] Compressed size: ${compressedSizeMB.toFixed(2)}MB`);
          console.log(`[Compression] Reduction: ${((1 - compressedSizeMB / sizeMB) * 100).toFixed(1)}%`);
          
          URL.revokeObjectURL(videoUrl);
          
          // Verify output is under limit
          if (compressedSizeMB > 190) {
            // If still too large after compression, try again at 720p if we haven't already
            if (targetWidth > 1280) {
              console.log('[Compression] Output still too large, retrying at 720p');
              const retryOptions = { ...options, maxWidth: 1280, maxHeight: 720 };
              try {
                const recompressed = await compressVideo(videoBlob, retryOptions, onProgress);
                resolve(recompressed);
              } catch (retryError) {
                reject(new Error('Video too large even after compression. Please use a shorter video.'));
              }
            } else {
              reject(new Error('Unable to compress video below 190MB. Please use a shorter video (under 3 minutes recommended).'));
            }
          } else {
            if (onProgress) {
              onProgress({ percent: 100, currentSize: compressedBlob.size, stage: 'Complete' });
            }
            resolve(compressedBlob);
          }
        };
        
        mediaRecorder.onerror = (e) => {
          URL.revokeObjectURL(videoUrl);
          reject(new Error(`MediaRecorder error: ${e}`));
        };
        
        // Start recording
        mediaRecorder.start();
        
        // Process video frame by frame
        const fps = 30;
        let frameCount = 0;
        const totalFrames = Math.floor(duration * fps);
        
        const processFrame = () => {
          if (video.paused || video.ended) {
            mediaRecorder.stop();
            return;
          }
          
          // Draw current frame to canvas (with scaling)
          ctx.drawImage(video, 0, 0, outputWidth, outputHeight);
          
          // Update progress
          frameCount++;
          if (onProgress && frameCount % 10 === 0) {
            const percent = (frameCount / totalFrames) * 100;
            onProgress({
              percent: Math.min(percent, 99), // Don't show 100% until done
              currentSize: chunks.reduce((acc, chunk) => acc + chunk.size, 0),
              stage: 'Compressing'
            });
          }
          
          // Schedule next frame
          requestAnimationFrame(processFrame);
        };
        
        // Start video playback with higher speed for faster processing
        video.currentTime = 0;
        video.muted = true; // Mute to avoid audio feedback during processing
        video.playbackRate = 2.0; // Process at 2x speed
        await video.play();
        processFrame();
        
      } catch (error) {
        URL.revokeObjectURL(videoUrl);
        reject(error);
      }
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Failed to load video'));
    };
    
    video.src = videoUrl;
    video.load();
  });
}

/**
 * Quick check if a video needs compression
 * Using 190MB threshold as recommended (under 200MB limit with headroom)
 */
export function needsCompression(blob: Blob): boolean {
  const thresholdMB = 190; // Conservative threshold
  const sizeMB = blob.size / (1024 * 1024);
  return sizeMB > thresholdMB;
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}