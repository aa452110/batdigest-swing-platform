import React, { useRef } from 'react';
import { formatFileSize } from '../../lib/video';

const MAX_FILE_SIZE = 1.5 * 1024 * 1024 * 1024; // 1.5 GB
const WARN_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

interface VideoFileInputProps {
  onFileSelect?: (file: File | null) => void;
  currentFile?: File | null;
}

const VideoFileInput: React.FC<VideoFileInputProps> = ({ onFileSelect, currentFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert(
        `File is too large. Maximum size is 1.5 GB. Your file is ${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB. Please trim the video before uploading.`
      );
      return;
    }

    // Warn for files over 1 GB
    if (file.size > WARN_FILE_SIZE) {
      if (
        !confirm(
          `This file is ${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB. Large files may affect performance. Consider trimming the video. Continue anyway?`
        )
      ) {
        return;
      }
    }

    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (
      validTypes.includes(file.type) ||
      ['mp4', 'mov', 'webm', 'm4v'].includes(fileExtension || '')
    ) {
      // Check codec support for .mov files
      if (fileExtension === 'mov' || file.type === 'video/quicktime') {
        const video = document.createElement('video');
        const canPlay = video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
        if (!canPlay) {
          alert(
            'This .mov file may not be compatible with Chrome. Consider converting to .mp4 for best compatibility.'
          );
        }
      }

      // Call the callback with the selected file
      if (onFileSelect) {
        onFileSelect(file);
      }
    } else {
      alert('Please select a valid video file (.mp4, .mov, .webm, or .m4v)');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearVideo = () => {
    if (onFileSelect) {
      onFileSelect(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <div className="flex flex-col items-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.mov,.webm,.m4v,video/mp4,video/quicktime,video/webm,video/x-m4v"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!currentFile ? (
        <button
          onClick={handleButtonClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Load Video
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-300">
            Loaded: <span className="font-medium">{currentFile.name}</span>
          </p>
          {currentFile.size && (
            <p className="text-sm text-gray-400">Size: {formatFileSize(currentFile.size)}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleButtonClick}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
            >
              Change Video
            </button>
            <button
              onClick={handleClearVideo}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFileInput;
