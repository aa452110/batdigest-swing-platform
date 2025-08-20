import React from 'react';

interface PlayerCommentProps {
  comment?: string;
  playerName?: string;
  submittedAt?: string;
}

const PlayerComment: React.FC<PlayerCommentProps> = ({ comment, playerName, submittedAt }) => {
  if (!comment) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-300">Player's Comment</h3>
        {submittedAt && (
          <span className="text-xs text-gray-500">{submittedAt}</span>
        )}
      </div>
      <div className="bg-gray-900 rounded p-3">
        <p className="text-sm text-gray-300 leading-relaxed">
          {comment}
        </p>
        {playerName && (
          <p className="text-xs text-gray-500 mt-2">— {playerName}</p>
        )}
      </div>
    </div>
  );
};

export default PlayerComment;