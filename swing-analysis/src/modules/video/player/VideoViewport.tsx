import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';
import type { AspectRatio } from '../../../types/media';

export interface VideoViewportRef {
  video: HTMLVideoElement | null;
  container: HTMLDivElement | null;
  play: () => Promise<void>;
  pause: () => void;
  seekTo: (time: number) => void;
}

interface VideoViewportProps {
  src: string | null;
  aspectRatio?: AspectRatio;
  onLoadedMetadata?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

const VideoViewport = forwardRef<VideoViewportRef, VideoViewportProps>(
  (
    {
      src,
      aspectRatio = '16:9',
      onLoadedMetadata,
      onTimeUpdate,
      onPlay,
      onPause,
      onEnded,
      onError,
      className = '',
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    useImperativeHandle(ref, () => ({
      video: videoRef.current,
      container: containerRef.current,
      play: async () => {
        if (videoRef.current) {
          try {
            await videoRef.current.play();
            onPlay?.();
          } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Failed to play video');
          }
        }
      },
      pause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
          onPause?.();
        }
      },
      seekTo: (time: number) => {
        if (videoRef.current && !isNaN(time) && isFinite(time)) {
          const duration = videoRef.current.duration;
          if (!isNaN(duration) && isFinite(duration)) {
            videoRef.current.currentTime = Math.max(0, Math.min(time, duration));
          }
        }
      },
    }));

    // Handle zoom with scroll wheel
    const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
      // Can't prevent default in React wheel events due to passive listener
      // e.preventDefault();
      e.stopPropagation();
      
      // Much smaller increments for finer control
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newZoom = Math.min(Math.max(zoom + delta, 1), 5); // Limit zoom between 1x and 5x
      
      if (newZoom === 1) {
        // Reset pan when zooming out to 1x
        setPan({ x: 0, y: 0 });
      }
      
      setZoom(newZoom);
    }, [zoom]);

    // Handle keyboard zoom
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      // Plus key (= key without shift, or + with shift)
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        const newZoom = Math.min(zoom + 0.25, 5);
        setZoom(newZoom);
      }
      // Minus key
      else if (e.key === '-') {
        e.preventDefault();
        const newZoom = Math.max(zoom - 0.25, 1);
        if (newZoom === 1) {
          setPan({ x: 0, y: 0 });
        }
        setZoom(newZoom);
      }
      // 0 key to reset
      else if (e.key === '0') {
        e.preventDefault();
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    }, [zoom]);

    // Handle panning when zoomed
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      if (zoom <= 1 || !e.buttons) return; // Only pan when zoomed in and mouse is pressed
      
      const container = containerRef.current;
      if (!container) return;
      
      // Calculate pan limits based on how much the image extends beyond viewport when zoomed
      // At 2x zoom, image is 2x size, so we can pan 25% in each direction (50% total)
      // At 5x zoom, image is 5x size, so we can pan 40% in each direction (80% total)
      const maxPanPercent = ((zoom - 1) / zoom) * 100 / 2;
      
      // Convert mouse movement to percentage of container size - reduced by 1/3
      const rect = container.getBoundingClientRect();
      const moveXPercent = (e.movementX / rect.width) * 100 * 0.3; // Reduced to 30% speed
      const moveYPercent = (e.movementY / rect.height) * 100 * 0.3; // Reduced to 30% speed
      
      setPan(prev => ({
        x: Math.max(-maxPanPercent, Math.min(maxPanPercent, prev.x + moveXPercent)),
        y: Math.max(-maxPanPercent, Math.min(maxPanPercent, prev.y + moveYPercent)),
      }));
    }, [zoom]);

    // Reset zoom on double click
    const handleDoubleClick = useCallback(() => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }, []);

    const getAspectRatioClass = () => {
      // Always use 16:9 widescreen aspect ratio for recording
      return 'aspect-[16/9]'; // 16:9 widescreen ratio
    };

    if (!src) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No video loaded</p>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-hidden"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{ 
          cursor: zoom > 1 ? 'move' : 'default',
          width: '1280px',
          height: '720px',
          minWidth: '1280px',
          maxWidth: '1280px',
          minHeight: '720px',
          maxHeight: '720px'
        }}
      >
        {/* Zoom indicator */}
        {zoom > 1 && (
          <div className="absolute top-2 left-2 z-20 bg-black/75 px-2 py-1 rounded text-xs text-white">
            {zoom.toFixed(1)}x
          </div>
        )}
        
        <div 
          className="relative w-full h-full bg-black" 
          data-video-container="true"
        >
          <video
            ref={videoRef}
            src={src}
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`,
              transformOrigin: 'center',
              transition: 'transform 0.1s ease-out',
            }}
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            muted={false}
            controls={false}
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={onTimeUpdate}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onError={(e) => {
              const video = e.currentTarget;
              const error = video.error;
              if (error) {
                onError?.(`Video error: ${error.message}`);
              }
            }}
          />
        </div>
        
        {/* Zoom hint */}
        {zoom === 1 && (
          <div className="absolute bottom-2 right-2 z-20 bg-black/50 px-2 py-1 rounded text-xs text-gray-400">
            Scroll or +/- to zoom • 0 or double-click to reset
          </div>
        )}
      </div>
    );
  }
);

VideoViewport.displayName = 'VideoViewport';

export default VideoViewport;