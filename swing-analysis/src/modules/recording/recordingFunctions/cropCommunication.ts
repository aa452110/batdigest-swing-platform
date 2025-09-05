// Communication between analyzer and recorder for crop coordinates

export interface CropCoordinates {
  left: number;
  top: number;
  width: number;
  height: number;
  viewportW: number;
  viewportH: number;
  timestamp: number;
}

export class CropCommunicator {
  private channel: BroadcastChannel | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private element: HTMLElement | null = null;
  private sessionId: string;
  
  constructor(sessionId?: string) {
    this.sessionId = sessionId || `crop-${Date.now()}`;
  }
  
  // Used by analyzer to send crop coordinates
  startSending(element: HTMLElement) {
    if (this.channel) this.channel.close();
    
    this.element = element;
    this.channel = new BroadcastChannel(`bc-crop-${this.sessionId}`);
    
    // Send initial coordinates
    this.sendCoordinates();
    
    // Watch for resize
    this.resizeObserver = new ResizeObserver(() => {
      this.sendCoordinates();
    });
    this.resizeObserver.observe(element);
    
    // Also watch viewport resize
    window.addEventListener('resize', this.sendCoordinates);
    
    // REMOVED LOG - console.log(`[CropCommunicator] Started sending on channel bc-crop-${this.sessionId}`);
  }
  
  private sendCoordinates = () => {
    if (!this.element || !this.channel) return;
    
    const rect = this.element.getBoundingClientRect();
    
    // Debug: also check the wrapper element
    const wrapper = document.getElementById('video-player-wrapper');
    const wrapperRect = wrapper?.getBoundingClientRect();
    
    const coords: CropCoordinates = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      timestamp: Date.now()
    };
    
    this.channel.postMessage(coords);
    // REMOVED LOG - Only log initially, not every update
    if (!(window as any).__CROP_LOGGED) {
      // REMOVED LOG - console.log('[CropCommunicator] Element positions:', {
      //   scaledElement: { 
      //     top: rect.top, 
      //     left: rect.left, 
      //     width: rect.width, 
      //     height: rect.height,
      //     bottom: rect.bottom
      //   },
      //   wrapperElement: wrapperRect ? {
      //     top: wrapperRect.top,
      //     left: wrapperRect.left,
      //     width: wrapperRect.width,
      //     height: wrapperRect.height,
      //     bottom: wrapperRect.bottom
      //   } : 'not found',
      //   viewport: { 
      //     width: window.innerWidth, 
      //     height: window.innerHeight,
      //     scrollY: window.scrollY,
      //     scrollX: window.scrollX
      //   },
      //   visualCheck: `Element appears ${rect.top < 0 ? 'ABOVE' : 'BELOW'} viewport top`
      // });
      (window as any).__CROP_LOGGED = true;
    }
  }
  
  // Used by recorder to receive crop coordinates
  startReceiving(callback: (coords: CropCoordinates) => void) {
    if (this.channel) this.channel.close();
    
    this.channel = new BroadcastChannel(`bc-crop-${this.sessionId}`);
    this.channel.onmessage = (event) => {
      // REMOVED LOG - console.log('[CropCommunicator] Received coordinates:', event.data);
      callback(event.data);
    };
    
    // REMOVED LOG - console.log(`[CropCommunicator] Started receiving on channel bc-crop-${this.sessionId}`);
  }
  
  stop() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    
    window.removeEventListener('resize', this.sendCoordinates);
    
    // REMOVED LOG - console.log('[CropCommunicator] Stopped');
  }
}