# Reference Videos Directory

This directory contains reference hitting model videos for comparison analysis.

## Folder Structure:
- `mlb/` - Professional MLB player swings
- `college/` - College level swings  
- `youth/` - Youth player examples

## Recommended Video Format:
- **Container:** MP4
- **Codec:** H.264 (AVC)
- **Resolution:** 720p or 1080p
- **Duration:** 0.5-2 seconds
- **Frame rate:** 30 or 60 fps
- **Bitrate:** 2-5 Mbps

## Adding Videos:
1. Drop your .mp4 files into the appropriate subfolder
2. Update `/src/modules/video/ReferenceVideos.tsx` with the video filenames
3. Videos will appear in the Reference Videos list in the app

## Example Naming Convention:
- `trout-swing-front.mp4`
- `judge-swing-side.mp4`
- `proper-stance.mp4`
- `load-phase.mp4`
- `contact-point.mp4`