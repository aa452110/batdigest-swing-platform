# Working State Notes - Swing Analysis Project

## Last Working Commit
- **Date**: 2025-08-20
- **Commit Hash**: 8f3f617
- **Branch**: main

## Current Features Working

### Video Player
✅ Dual video loading (Video 1 and Video 2)
✅ Three view modes: Video 1 only, Video 2 only, Split view
✅ Independent controls for each video in split view
✅ Frame-by-frame stepping with visual feedback
✅ Frame number display under timeline
✅ Videos locked at 1280x720 pixels (no resizing)
✅ **Split view annotations** - Single canvas over both videos for comparisons
✅ **Zoom in split view** - Click video to focus, then scroll or use +/- keys

### Recording
✅ Selectable area recording with green box overlay
✅ Draggable and resizable selection area
✅ Microphone audio capture working
✅ Canvas-based cropping to selected area
✅ WebM output with proper file sizes (not 0kb)
❌ System audio from videos (Chrome limitation - requires tab sharing)

### Layout
✅ Left sidebar (225px): Recording controls, reference videos, drill videos
✅ Right sidebar (225px): Video controls with independent play/pause/frame controls
✅ Bottom bar: Annotation toolbar (appears when video loaded)
✅ Video player centered at exactly 1280x720

### Controls
✅ Play/pause buttons work independently for each video
✅ Frame step forward/backward buttons
✅ Timeline scrubber for each video
✅ Frame counter display showing current frame number

## Known Issues/Limitations

1. **System Audio**: Cannot capture audio from playing videos due to Chrome's security model
   - Screen sharing mode: No system audio available
   - Tab sharing mode: Would have system audio but app has no tabs
   - Workaround: Use microphone for narration

2. **Retina Display**: Recording area correctly accounts for 2x pixel ratio

## File Structure
```
src/
├── app/
│   └── LoadVideoPage.tsx (main layout with sidebars)
├── modules/
│   ├── recording/
│   │   ├── SelectableRecorder.tsx (working recorder with mic audio)
│   │   └── SelectableRecorderWithVideoAudio.tsx (experimental - causes 0kb files)
│   └── video/
│       ├── ComparisonVideoPlayer.tsx (dual video player component)
│       ├── VideoControlsSidebar.tsx (right sidebar controls)
│       └── player/
│           └── VideoViewport.tsx (fixed 1280x720 dimensions)
```

## Important Notes
- DO NOT modify the recording audio setup - it's fragile
- The SelectableRecorder works but without system audio
- The SelectableRecorderWithVideoAudio attempts direct video element capture but creates 0kb files
- Frame stepping works by assuming 30fps