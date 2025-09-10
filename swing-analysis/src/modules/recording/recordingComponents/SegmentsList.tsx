import React, { useState } from 'react';
import WorkoutPackageSelector, { type WorkoutPackage } from './WorkoutPackageSelector';

export type RecordedSegment = {
  id: string;
  url: string;
  duration: number;
};

type Props = {
  segments: RecordedSegment[];
  isUploading: boolean;
  uploadStatus: string;
  onApprove: (segment: RecordedSegment, workoutPackage?: WorkoutPackage) => void;
  onDelete: (segment: RecordedSegment) => void;
};

const SegmentsList: React.FC<Props> = ({ segments, isUploading, uploadStatus, onApprove, onDelete }) => {
  const [previewSegment, setPreviewSegment] = useState<RecordedSegment | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<WorkoutPackage | null>(null);
  const [showPackageSelector, setShowPackageSelector] = useState(false);
  
  if (!segments.length) return null;

  // Show package selector after recording stops
  React.useEffect(() => {
    if (segments.length > 0 && !showPackageSelector) {
      setShowPackageSelector(true);
    }
  }, [segments.length]);
  
  return (
    <>
      <div className="space-y-2 mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-400">Recorded Segments:</p>
        
        {/* Workout Package Selector */}
        <WorkoutPackageSelector
          selectedPackage={selectedPackage}
          onSelectPackage={setSelectedPackage}
          isVisible={showPackageSelector}
        />
        
        {segments.map((segment, index) => (
          <div key={segment.id} className="bg-gray-700 p-2 rounded space-y-2">
            <span className="text-xs text-white block">Recording {index + 1} ({segment.duration}s)</span>
            
            {/* Video Preview */}
            <video
              src={segment.url}
              controls
              className="w-full rounded bg-black"
              style={{ maxHeight: '150px' }}
            />
            
            <div className="flex gap-1">
            <button
              onClick={() => {
                if (!selectedPackage) {
                  alert('Please select a workout package before sending to player');
                  return;
                }
                onApprove(segment, selectedPackage);
              }}
              disabled={isUploading || !selectedPackage}
              className={`text-xs px-2 py-1 ${
                isUploading || !selectedPackage 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white rounded transition-colors flex-1`}
            >
              {isUploading ? 'Uploading...' : !selectedPackage ? 'Choose Workout Package First' : 'Approve & Send to Player'}
            </button>
            <button
              onClick={() => onDelete(segment)}
              disabled={isUploading}
              className={`text-xs px-2 py-1 ${isUploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white rounded transition-colors flex-1`}
            >
              Delete
            </button>
          </div>
          {uploadStatus && (
            <div className="text-sm text-center mt-2 p-2 bg-gray-900 rounded">
              <div className="text-yellow-400 font-semibold">{uploadStatus}</div>
              {uploadStatus.includes('⏳') && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Please wait, do not close this window</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      </div>
    </>
  );
};

export default SegmentsList;

