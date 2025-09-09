import { useCallback, useState } from 'react';

export function useUpload(onAnalysisSaved?: () => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const uploadAnalysis = useCallback(async (segment: any) => {
    if (!segment?.blob) return;
    try {
      setIsUploading(true);
      setUploadStatus('⏳ Requesting upload URL...');

      const submissionRaw = sessionStorage.getItem('selectedSubmission');
      const submission = submissionRaw ? JSON.parse(submissionRaw) : null;
      const submissionId = submission?.id || 'unknown'; // Fixed endpoint
      const fileName = `analysis-${submissionId}-${Date.now()}.webm`;

      // Call worker to create Stream direct-upload URL
      const uploadResponse = await fetch('/api/analysis/upload-to-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          contentType: 'video/webm',
          submissionId,
          duration: segment.duration,
        }),
      }).then((r) => r.json());

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
