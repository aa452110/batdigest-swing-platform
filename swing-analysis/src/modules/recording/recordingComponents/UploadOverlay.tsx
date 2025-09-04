import React from 'react';

type Props = {
  isUploading: boolean;
  status: string;
};

const UploadOverlay: React.FC<Props> = ({ isUploading, status }) => {
  if (!isUploading || !status) return null;
  const progressWidth = (() => {
    const match = status.match(/(\d+)%/);
    if (match) return `${match[1]}%`;
    if (status.includes('Getting upload URL')) return '5%';
    if (status.includes('Processing')) return '100%';
    return '0%';
  })();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Uploading Analysis</h2>
        <div className="text-yellow-400 font-semibold mb-4">{status}</div>
        {status.includes('⏳') && (
          <div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div className="bg-blue-500 h-3 rounded-full transition-all duration-300" style={{ width: progressWidth }} />
            </div>
            <p className="text-sm text-gray-400 text-center">Uploading directly to our servers. Please wait...</p>
          </div>
        )}
        {status.includes('✅') && (
          <p className="text-sm text-green-400 text-center">Analysis sent successfully!</p>
        )}
      </div>
    </div>
  );
};

export default UploadOverlay;

