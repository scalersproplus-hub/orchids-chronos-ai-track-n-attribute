/**
 * Chronos AI Universal Tracking Tag
 * 
 * Install this script in the <head> of your website:
 * <script async src="https://YOUR_DOMAIN/chronos-tag.js" data-chronos-id="YOUR_ACCOUNT_ID"></script>
 * 
 * This script provides:
 * - Cookieless fingerprinting for cross-device tracking
 * - Automatic UTM & click ID capture (gclid, fbclid, etc.)
 * - Server-side event tracking via CAPI
 * - Identity resolution across sessions
 */

(function() {
  'use strict';

  // Configuration
  const SCRIPT_TAG = document.currentScript || document.querySelector('script[data-chronos-id]');
  const CHRONOS_ID = SCRIPT_TAG?.getAttribute('data-chronos-id');
  const API_ENDPOINT = SCRIPT_TAG?.getAttribute('data-api') || 'https://ingest.chronos-ai.io/v1';
  const DEBUG = SCRIPT_TAG?.getAttribute('data-debug') === 'true';

  if (!CHRONOS_ID) {
    console.warn('[Chronos] Missing data-chronos-id attribute');
    return;
  }

  // Debug logger
  const log = (...args) => DEBUG && console.log('[Chronos]', ...args);

  // Storage helpers with fallbacks
  const storage = {
    set: (key, value) => {
      try {
        localStorage.setItem(`chronos_${key}`, JSON.stringify(value));
        return true;
      } catch (e) {
        try {
          sessionStorage.setItem(`chronos_${key}`, JSON.stringify(value));
          return true;
        } catch (e2) {
          return false;
        }
      }
    },
    get: (key) => {
      try {
        const val = localStorage.getItem(`chronos_${key}`) || sessionStorage.getItem(`chronos_${key}`);
        return val ? JSON.parse(val) : null;
      } catch (e) {
        return null;
      }
    },
    remove: (key) => {
      try {
        localStorage.removeItem(`chronos_${key}`);
        sessionStorage.removeItem(`chronos_${key}`);
      } catch (e) {}
    }
  };

  // ===========================================
  // FINGERPRINTING MODULE
  // ===========================================
  
  const Fingerprint = {
    async generate() {
      const components = [];
      
      // Canvas fingerprint
      components.push(await this.getCanvasFingerprint());
      
      // WebGL fingerprint
      components.push(this.getWebGLFingerprint());
      
      // Screen info
      components.push(this.getScreenInfo());
      
      // Device info
      components.push(this.getDeviceInfo());
      
      // Browser features
      components.push(this.getBrowserFeatures());
      
      // Timezone & language
      components.push(this.getTimezoneInfo());
      
      // Combine and hash
      const combined = components.filter(Boolean).join('|');
      const hash = await this.sha256(combined);
      
      return `fp_${hash.substring(0, 32)}`;
    },

    async getCanvasFingerprint() {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'nc';

        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('ChronosAI', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('ChronosAI', 4, 17);

        return canvas.toDataURL().slice(-50);
      } catch (e) {
        return 'ce';
      }
    },

    getWebGLFingerprint() {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'nw';

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return 'nd';

        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return `${vendor}~${renderer}`.substring(0, 100);
      } catch (e) {
        return 'we';
      }
    },

    getScreenInfo() {
      return [
        screen.width,
        screen.height,
        screen.colorDepth,
        window.devicePixelRatio || 1
      ].join('x');
    },

    getDeviceInfo() {
      return [
        navigator.platform || 'unknown',
        navigator.hardwareConcurrency || 0,
        navigator.maxTouchPoints || 0
      ].join('~');
    },

    getBrowserFeatures() {
      return [
        'localStorage' in window ? 1 : 0,
        'indexedDB' in window ? 1 : 0,
        'WebAssembly' in window ? 1 : 0,
        'Worker' in window ? 1 : 0
      ].join('');
    },

    getTimezoneInfo() {
      return Intl.DateTimeFormat().resolvedOptions().timeZone + '~' + new Date().getTimezoneOffset();
    },

    async sha256(message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async getOrCreate() {
      let fp = storage.get('fingerprint');
      if (!fp) {
        fp = await this.generate();
        storage.set('fingerprint', fp);
      }
      return fp;
    }
  };

  // ===========================================
  // TRACKING PARAMS MODULE
  // ===========================================
  
  const TrackingParams = {
    extract() {
      const params = new URLSearchParams(window.location.search);
      const result = {};
      
      // Click IDs
      ['gclid', 'gbraid', 'wbraid', 'fbclid', 'ttclid', 'msclkid'].forEach(id => {
        const val = params.get(id);
        if (val) {
          result[id] = val;
          storage.set(id, val);
        } else {
          const stored = storage.get(id);
          if (stored) result[id] = stored;
        }
      });
      
      // UTM params
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(p => {
        const val = params.get(p);
        if (val) result[p] = val;
      });
      
      // Facebook cookies
      try {
        const cookies = document.cookie.split(';').reduce((acc, c) => {
          const [k, v] = c.trim().split('=');
          acc[k] = v;
          return acc;
        }, {});
        if (cookies._fbc) result.fbc = cookies._fbc;
        if (cookies._fbp) result.fbp = cookies._fbp;
      } catch (e) {}
      
      return result;
    }
  };

  // ===========================================
  // DEVICE INFO MODULE
  // ===========================================
  
  const DeviceInfo = {
    collect() {
      const ua = navigator.userAgent;
      
      // Device type
      const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
      const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
      
      // Browser
      let browser = 'Unknown';
      if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('SamsungBrowser')) browser = 'Samsung';
      else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
      else if (ua.includes('Edg')) browser = 'Edge';
      else if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Safari')) browser = 'Safari';
      
      // OS
      let os = 'Unknown';
      if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Mac OS')) os = 'macOS';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
      else if (ua.includes('Linux')) os = 'Linux';
      
      return { deviceType, browser, os, userAgent: ua };
    }
  };

  // ===========================================
  // EVENT TRACKING MODULE
  // ===========================================
  
  const EventTracker = {
    queue: [],
    processing: false,

    async track(eventName, eventData = {}) {
      const fingerprint = await Fingerprint.getOrCreate();
      const trackingParams = TrackingParams.extract();
      const deviceInfo = DeviceInfo.collect();
      
      const event = {
        account_id: CHRONOS_ID,
        event_name: eventName,
        event_id: `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        fingerprint_id: fingerprint,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer,
        ...trackingParams,
        ...deviceInfo,
        ...eventData
      };
      
      this.queue.push(event);
      log('Event queued:', eventName, event);
      
      this.flush();
    },

    async flush() {
      if (this.processing || this.queue.length === 0) return;
      this.processing = true;
      
      const events = [...this.queue];
      this.queue = [];
      
      try {
        // Try to send via beacon (works even on page unload)
        const payload = JSON.stringify({ events });
        
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          const sent = navigator.sendBeacon(`${API_ENDPOINT}/events`, blob);
          if (!sent) throw new Error('Beacon failed');
        } else {
          // Fallback to fetch
          await fetch(`${API_ENDPOINT}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
          });
        }
        
        log('Events sent:', events.length);
      } catch (e) {
        log('Failed to send events:', e);
        // Re-queue failed events
        this.queue.unshift(...events);
      }
      
      this.processing = false;
    },

    // Standard e-commerce events
    pageView(data = {}) {
      return this.track('PageView', data);
    },

    viewContent(data = {}) {
      return this.track('ViewContent', data);
    },

    addToCart(data = {}) {
      return this.track('AddToCart', data);
    },

    initiateCheckout(data = {}) {
      return this.track('InitiateCheckout', data);
    },

    purchase(data = {}) {
      return this.track('Purchase', data);
    },

    lead(data = {}) {
      return this.track('Lead', data);
    },

    completeRegistration(data = {}) {
      return this.track('CompleteRegistration', data);
    },

    search(data = {}) {
      return this.track('Search', data);
    },

    // Identity resolution
    identify(userData = {}) {
      storage.set('user_data', userData);
      return this.track('Identify', { user_data: userData });
    }
  };

  // ===========================================
  // INITIALIZATION
  // ===========================================
  
  // Auto-track page views
  const trackPageView = () => {
    EventTracker.pageView();
  };

  // Track on initial load
  if (document.readyState === 'complete') {
    trackPageView();
  } else {
    window.addEventListener('load', trackPageView);
  }

  // Track on SPA navigation (pushState/replaceState)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    setTimeout(trackPageView, 0);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    setTimeout(trackPageView, 0);
  };
  
  window.addEventListener('popstate', trackPageView);

  // Flush events before page unload
  window.addEventListener('beforeunload', () => {
    EventTracker.flush();
  });

  // Expose global API
  window.chronos = {
    track: EventTracker.track.bind(EventTracker),
    pageView: EventTracker.pageView.bind(EventTracker),
    viewContent: EventTracker.viewContent.bind(EventTracker),
    addToCart: EventTracker.addToCart.bind(EventTracker),
    initiateCheckout: EventTracker.initiateCheckout.bind(EventTracker),
    purchase: EventTracker.purchase.bind(EventTracker),
    lead: EventTracker.lead.bind(EventTracker),
    completeRegistration: EventTracker.completeRegistration.bind(EventTracker),
    search: EventTracker.search.bind(EventTracker),
    identify: EventTracker.identify.bind(EventTracker),
    getFingerprint: Fingerprint.getOrCreate.bind(Fingerprint),
    _debug: DEBUG
  };

  log('Initialized with account:', CHRONOS_ID);

})();
