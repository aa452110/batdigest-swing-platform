import { useCallback, useState } from 'react';

export function useUpload(onAnalysisSaved?: () => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const uploadAnalysis = useCallback(async (segment: any, workoutPackage?: any) => {
    if (!segment?.blob) return;
    try {
      setIsUploading(true);
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
        blobSize: segment.blob.size,
        submission: submission,
        workoutPackage: workoutPackage
      });

      const uploadEndpoint = 'https://swing-platform.brianduryea.workers.dev/api/analysis/upload-to-stream';
      const requestBody = {
        fileName,
        contentType: 'video/webm',
        submissionId,
        duration: segment.duration,
        workoutPackage: workoutPackage ? {
          title: workoutPackage.title,
          description: workoutPackage.description,
          monday: workoutPackage.monday,
          tuesday: workoutPackage.tuesday,
          wednesday: workoutPackage.wednesday,
          thursday: workoutPackage.thursday,
          friday: workoutPackage.friday,
          saturday: workoutPackage.saturday,
          sunday: workoutPackage.sunday
        } : null
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

      const videoFile = new File([segment.blob], fileName, {
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
