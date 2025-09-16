// Configure ffmpeg.wasm core base via external script (avoids inline CSP)
// This must load before the app bundle
(function(){
  try {
    self.FFMPEG_CORE_BASE = 'https://swing-platform.brianduryea.workers.dev/api/ffmpeg-core/';
  } catch (e) {}
})();

