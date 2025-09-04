import React, { forwardRef } from 'react';
import VideoViewport, { type VideoViewportRef } from '../player/VideoViewport';
import SimpleDrawingCanvas from '../../annot/SimpleDrawingCanvas';

interface VideoDisplayProps {
  videoUrl: string | null;
  videoMeta: any;
  onLoadedMetadata: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onTimeUpdate: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
}

const VideoDisplay = forwardRef<VideoViewportRef, VideoDisplayProps>(({
  videoUrl,
  videoMeta,
  onLoadedMetadata,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded
}, ref) => {
  if (!videoUrl) return null;

  return (
    <>
      <VideoViewport
        ref={ref}
        src={videoUrl}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
      />
      {videoMeta && ref && 'current' in ref && (
        <SimpleDrawingCanvas videoElement={ref.current?.video || null} />
      )}
    </>
  );
});

VideoDisplay.displayName = 'VideoDisplay';

export default VideoDisplay;