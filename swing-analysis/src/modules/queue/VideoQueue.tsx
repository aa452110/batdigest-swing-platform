import React from 'react';

// Mock data for now - will be replaced with database fetch
const mockQueuedVideos: any[] = [
  // Example structure:
  // {
  //   id: '1',
  //   playerId: 'player-1',
  //   playerName: 'Johnny Smith',
  //   parentEmail: 'parent@example.com',
  //   submittedAt: '2024-01-15 10:30 AM',
  //   duration: '2.8s',
  //   status: 'pending',
  //   comment: 'He's been working on keeping his hands back...'
  // }
];

interface VideoQueueProps {
  onSelectVideo?: (video: any) => void;
}

const VideoQueue: React.FC<VideoQueueProps> = ({ onSelectVideo }) => {
  const handleVideoSelect = (video: any) => {
    // TODO: Fetch actual video from database/storage
    console.log('Loading video:', video.id);
    if (onSelectVideo) {
      onSelectVideo(video);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Analysis Queue</h2>
        <span className="text-sm text-gray-400">
          {mockQueuedVideos.length} pending
        </span>
      </div>
      
      {mockQueuedVideos.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
                <th className="pb-2 pr-4">Player</th>
                <th className="pb-2 pr-4">Parent Email</th>
                <th className="pb-2 pr-4">Submitted</th>
                <th className="pb-2 pr-4">Duration</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockQueuedVideos.map((video) => (
                <tr key={video.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-3 pr-4 text-white font-medium">{video.playerName}</td>
                  <td className="py-3 pr-4 text-gray-400">{video.parentEmail}</td>
                  <td className="py-3 pr-4 text-gray-400">{video.submittedAt}</td>
                  <td className="py-3 pr-4 text-gray-400">{video.duration}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      video.status === 'pending' 
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : video.status === 'in-progress'
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-green-900/50 text-green-400'
                    }`}>
                      {video.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleVideoSelect(video)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Load to Video 1
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">No videos in queue</p>
          <p className="text-xs text-gray-500">
            Videos submitted through the BatDigest mobile app will appear here for analysis
          </p>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          <strong>Workflow:</strong> Parents sign up → Download app → Record/upload hitting video (3s max) → Videos appear here → Click to load into Video 1 for analysis
        </p>
      </div>
    </div>
  );
};

export default VideoQueue;