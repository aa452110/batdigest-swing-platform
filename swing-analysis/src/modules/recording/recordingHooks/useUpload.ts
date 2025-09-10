import { useCallback, useState } from 'react';
import { compressVideo, needsCompression, formatFileSize } from '../recordingFunctions/videoCompression';

export function useUpload(onAnalysisSaved?: () => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const uploadAnalysis = useCallback(async (segment: any) => {
    if (!segment?.blob) return;
    
    let videoToUpload = segment.blob;
    let compressionApplied = false;
    
    try {
      setIsUploading(true);
      
      // Check if compression is needed
      if (needsCompression(segment.blob)) {
        const originalSize = formatFileSize(segment.blob.size);
        console.log(`[Upload] Video needs compression: ${originalSize}`);
        setUploadStatus(`🎬 Compressing video (${originalSize})...`);
        
        try {
          // Compress with progress updates
          videoToUpload = await compressVideo(segment.blob, {
            targetSizeMB: 175, // Conservative target as recommended
            maxWidth: 1920,
            maxHeight: 1080
          }, (progress) => {
            const progressText = progress.stage === 'Complete' 
              ? '✅ Compression complete'
              : `🎬 Compressing video (${progress.percent.toFixed(0)}%)...`;
            setUploadStatus(progressText);
          });
          
          compressionApplied = true;
          const compressedSize = formatFileSize(videoToUpload.size);
          console.log(`[Upload] Compression complete: ${compressedSize}`);
          setUploadStatus('✅ Compression complete, uploading...');
          
        } catch (compressionError: any) {
          // Compression failed - provide helpful feedback
          console.error('[Upload] Compression failed:', compressionError);
          
          if (compressionError.message.includes('shorter video')) {
            setUploadStatus('');
            setIsUploading(false);
            alert('Video is too large to upload. Please record a shorter video (under 3 minutes recommended) or use lower resolution.');
            return;
          }
          
          // Try to proceed with original if compression had an unexpected error
          console.log('[Upload] Attempting upload with original video');
          setUploadStatus('⚠️ Compression failed, attempting original upload...');
        }
      }
      
      setUploadStatus('⏳ Requesting upload URL...');

      const submissionRaw = sessionStorage.getItem('selectedSubmission');
      const submission = submissionRaw ? JSON.parse(submissionRaw) : null;
      // Handle both formats: submission.submissionId (from CoachQueue) or submission.submission_id (from NeedAnalysis)
      const submissionId = submission?.submissionId || submission?.submission_id || submission?.id || 'unknown';
      const fileName = `analysis-${submissionId}-${Date.now()}.webm`;

      // Debug logging
      console.log('[UPLOAD DEBUG] Starting upload with:', {
        submissionId,
        fileName,
        duration: segment.duration,
        originalSize: formatFileSize(segment.blob.size),
        uploadSize: formatFileSize(videoToUpload.size),
        compressionApplied,
        submission: submission
      });

      const uploadEndpoint = 'https://swing-platform.brianduryea.workers.dev/api/analysis/upload-to-stream';
      const requestBody = {
        fileName,
        contentType: 'video/webm',
        submissionId,
        duration: segment.duration,
      };
      
      console.log('[UPLOAD DEBUG] Calling endpoint:', uploadEndpoint);
      console.log('[UPLOAD DEBUG] Request body:', requestBody);

      // Call worker to create Stream direct-upload URL
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log('[UPLOAD DEBUG] Response status:', response.status);
      console.log('[UPLOAD DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Try to get response text first to see what we're actually getting
      const responseText = await response.text();
      console.log('[UPLOAD DEBUG] Response text:', responseText);
      
      let uploadResponse;
      try {
        uploadResponse = JSON.parse(responseText);
      } catch (e) {
        console.error('[UPLOAD DEBUG] Failed to parse response as JSON:', e);
        console.error('[UPLOAD DEBUG] Raw response was:', responseText);
        throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 200)}`);
      }

      const { uploadUrl } = uploadResponse;
      setUploadStatus('⏳ Uploading video... 0%');

      // Use the compressed video if compression was applied
      const videoFile = new File([videoToUpload], fileName, {
        type: 'video/webm',
        lastModified: Date.now(),
      });

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadStatus(`⏳ Uploading video... ${percentComplete}%`);
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            setUploadStatus('✅ Upload complete!');
            resolve(true);
          } else {
            const error = `Upload failed: ${xhr.status} ${xhr.responseText}`;
            setUploadStatus(`❌ ${error}`);
            reject(new Error(error));
          }
        };
        xhr.onerror = () => {
          const error = 'Upload failed: Network error';
          setUploadStatus(`❌ ${error}`);
          reject(new Error(error));
        };
        const formData = new FormData();
        formData.append('file', videoFile, fileName);
        xhr.open('POST', uploadUrl);
        xhr.send(formData);
      });

      setUploadStatus('✅ Upload complete! Video is processing...');
      if (onAnalysisSaved) onAnalysisSaved();

      setTimeout(() => {
        setUploadStatus('✅ Analysis sent! Player will receive it shortly.');
      }, 1000);
      setTimeout(() => {
        sessionStorage.removeItem('selectedVideo');
        sessionStorage.removeItem('selectedSubmission');
        const isCoach = window.location.pathname.includes('/coach/');
        window.location.href = isCoach ? '/coach/queue' : '/admin/queue';
      }, 2000);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadStatus(`❌ Upload failed: ${error?.message || 'Unknown error'}`);
      setIsUploading(false);
    }
  }, [onAnalysisSaved]);

  return { isUploading, uploadStatus, uploadAnalysis, setIsUploading, setUploadStatus };
}
