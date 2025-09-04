import React from 'react';

interface PlayerDetailsProps {
  playerId?: string;
}

// Mock data - will be replaced with database fetch
const mockPlayerData = {
  name: 'Johnny Smith',
  age: 14,
  weight: '120 lbs',
  height: "5'6\"",
  batsThrows: 'R/R',
  team: 'Valley High School JV',
  videosSubmitted: 12,
  analysesCompleted: 8,
  recentAnalyses: [
    {
      id: '1',
      date: '2024-01-10',
      title: 'Stance and Load Analysis',
      videoUrl: '#'
    },
    {
      id: '2',
      date: '2024-01-05',
      title: 'Swing Path Correction',
      videoUrl: '#'
    }
  ]
};

const PlayerDetails: React.FC<PlayerDetailsProps> = ({ playerId }) => {
  if (!playerId) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Player Details</h3>
        <p className="text-xs text-gray-500 italic">
          Select a video from the queue to view player details
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-300">Player Details</h3>
      
      {/* Player Info */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Name:</span>
          <span className="text-white">{mockPlayerData.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Age:</span>
          <span className="text-white">{mockPlayerData.age}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Height/Weight:</span>
          <span className="text-white">{mockPlayerData.height} / {mockPlayerData.weight}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Bats/Throws:</span>
          <span className="text-white">{mockPlayerData.batsThrows}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Team:</span>
          <span className="text-white">{mockPlayerData.team}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Videos Submitted:</span>
          <span className="text-white">{mockPlayerData.videosSubmitted}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Analyses Completed:</span>
          <span className="text-white">{mockPlayerData.analysesCompleted}</span>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="pt-3 border-t border-gray-700">
        <h4 className="text-xs font-semibold text-gray-300 mb-2">Recent Analyses</h4>
        <div className="space-y-2">
          {mockPlayerData.recentAnalyses.map((analysis) => (
            <button
              key={analysis.id}
              className="w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              onClick={() => console.log('Load analysis:', analysis.id)}
            >
              <div className="text-xs text-white">{analysis.title}</div>
              <div className="text-xs text-gray-400">{analysis.date}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerDetails;