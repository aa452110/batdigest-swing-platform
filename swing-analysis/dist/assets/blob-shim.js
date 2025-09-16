// Blob fetch shim to avoid CSP connect-src blocking blob: URLs
// - Captures blob URLs created via URL.createObjectURL
// - Intercepts fetch(blob:...) and returns a synthetic Response from the original Blob
// - Cleans up entries on URL.revokeObjectURL
(function(){
  try {
    const blobMap = new Map();
    const origCreate = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    URL.createObjectURL = function(obj){
      const url = origCreate.call(URL, obj);
      try { blobMap.set(url, obj); } catch {}
      return url;
    };
    URL.revokeObjectURL = function(url){
      try { blobMap.delete(url); } catch {}
      return origRevoke.call(URL, url);
    };
    const origFetch = window.fetch;
    window.fetch = function(resource, init){
      try {
        const url = typeof resource === 'string' ? resource : (resource && resource.url);
        if (typeof url === 'string' && url.startsWith('blob:')) {
          const blob = blobMap.get(url);
          if (blob) {
            return Promise.resolve(new Response(blob));
          }
        }
      } catch {}
      return origFetch.apply(this, arguments);
    };
  } catch {}
})();

