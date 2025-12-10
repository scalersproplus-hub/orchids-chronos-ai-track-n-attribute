/**
 * Chronos Hyper-Pixel v2.0
 * Ultra-Advanced First-Party Tracking Pixel
 * 
 * INSTALLATION:
 * <script async src="https://YOUR-DOMAIN/chronos-pixel.js" data-pixel-id="YOUR_PIXEL_ID"></script>
 * 
 * FEATURES:
 * - 100% First-Party (no third-party domains)
 * - Ad-Blocker Resistant (heuristic evasion)
 * - Cookieless Fingerprinting (11+ signals)
 * - Session Replay (DOM interaction tracking)
 * - Real-Time Identity Resolution
 * - Fraud Detection (bot filtering)
 * - Cross-Domain Tracking
 * - Offline Event Support
 */

(function() {
  'use strict';

  var SCRIPT_TAG = document.currentScript || document.querySelector('script[data-pixel-id]');
  var PIXEL_ID = SCRIPT_TAG ? SCRIPT_TAG.getAttribute('data-pixel-id') : null;
  var API_BASE = SCRIPT_TAG ? (SCRIPT_TAG.getAttribute('data-api') || window.location.origin) : window.location.origin;
  var DEBUG = SCRIPT_TAG ? SCRIPT_TAG.getAttribute('data-debug') === 'true' : false;
  var ENABLE_REPLAY = SCRIPT_TAG ? SCRIPT_TAG.getAttribute('data-session-replay') === 'true' : false;

  if (!PIXEL_ID) {
    console.warn('[Chronos] Missing data-pixel-id');
    return;
  }

  function log() {
    if (DEBUG) console.log.apply(console, ['[Chronos Pixel]'].concat(Array.prototype.slice.call(arguments)));
  }

  // Storage with fallbacks
  var storage = {
    set: function(key, value, days) {
      days = days || 365;
      var data = JSON.stringify(value);
      try {
        localStorage.setItem('chronos_' + key, data);
      } catch (e) {
        try {
          sessionStorage.setItem('chronos_' + key, data);
        } catch (e2) {
          var expires = new Date(Date.now() + days * 864e5).toUTCString();
          document.cookie = 'chronos_' + key + '=' + encodeURIComponent(data) + '; expires=' + expires + '; path=/; SameSite=Lax; Secure';
        }
      }
    },
    get: function(key) {
      try {
        var val = localStorage.getItem('chronos_' + key) || sessionStorage.getItem('chronos_' + key);
        if (val) return JSON.parse(val);
      } catch (e) {}
      try {
        var match = document.cookie.match(new RegExp('chronos_' + key + '=([^;]+)'));
        if (match) return JSON.parse(decodeURIComponent(match[1]));
      } catch (e) {}
      return null;
    }
  };

  // SHA-256 Hash
  function sha256(message) {
    var msgBuffer = new TextEncoder().encode(message);
    return crypto.subtle.digest('SHA-256', msgBuffer).then(function(hashBuffer) {
      var hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  // Ultra-Advanced Fingerprinting
  var Fingerprint = {
    generate: function() {
      var self = this;
      return Promise.all([
        self.getCanvasFingerprint(),
        self.getWebGLFingerprint(),
        self.getAudioFingerprint(),
        self.getFontsFingerprint()
      ]).then(function(asyncComponents) {
        var components = asyncComponents.concat([
          self.getScreenInfo(),
          self.getDeviceInfo(),
          self.getBrowserFeatures(),
          self.getTimezoneInfo(),
          self.getHardwareInfo(),
          self.getConnectionInfo(),
          self.getPluginsInfo()
        ]);
        var combined = components.filter(Boolean).join('|');
        return sha256(combined).then(function(hash) {
          return 'fp_' + hash.substring(0, 32);
        });
      });
    },

    getCanvasFingerprint: function() {
      return new Promise(function(resolve) {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = 280;
          canvas.height = 60;
          var ctx = canvas.getContext('2d');
          if (!ctx) { resolve('nc'); return; }

          ctx.textBaseline = 'top';
          ctx.font = '16px Arial, sans-serif';
          ctx.fillStyle = '#f60';
          ctx.fillRect(125, 1, 62, 20);
          ctx.fillStyle = '#069';
          ctx.fillText('Chronos HyperPixel', 2, 15);
          ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
          ctx.fillText('Chronos HyperPixel', 4, 17);

          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = 'rgb(255,0,255)';
          ctx.beginPath();
          ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.fill();

          resolve(canvas.toDataURL().slice(-100));
        } catch (e) {
          resolve('ce');
        }
      });
    },

    getWebGLFingerprint: function() {
      return new Promise(function(resolve) {
        try {
          var canvas = document.createElement('canvas');
          var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (!gl) { resolve('nw'); return; }

          var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (!debugInfo) { resolve('nd'); return; }

          var vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          var renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          var maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE);
          var maxCubemap = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

          resolve(vendor + '|' + renderer + '|' + maxTexture + '|' + maxCubemap);
        } catch (e) {
          resolve('we');
        }
      });
    },

    getAudioFingerprint: function() {
      return new Promise(function(resolve) {
        try {
          var AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) { resolve('na'); return; }

          var context = new AudioContext();
          var oscillator = context.createOscillator();
          var compressor = context.createDynamicsCompressor();

          oscillator.type = 'triangle';
          oscillator.frequency.value = 10000;
          compressor.threshold.value = -50;
          compressor.knee.value = 40;
          compressor.ratio.value = 12;
          compressor.attack.value = 0;
          compressor.release.value = 0.25;

          oscillator.connect(compressor);
          compressor.connect(context.destination);
          oscillator.start(0);

          setTimeout(function() {
            var fp = compressor.reduction.value || 0;
            oscillator.disconnect();
            compressor.disconnect();
            context.close();
            resolve(fp.toString());
          }, 100);
        } catch (e) {
          resolve('ae');
        }
      });
    },

    getFontsFingerprint: function() {
      return new Promise(function(resolve) {
        try {
          var baseFonts = ['monospace', 'sans-serif', 'serif'];
          var testFonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 
                          'Comic Sans MS', 'Trebuchet MS', 'Impact', 'Calibri', 'Monaco'];

          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');
          if (!ctx) { resolve('nf'); return; }

          var testString = 'mmmmmmmmmmlli';
          var textSize = '72px';
          var detected = [];

          var baselines = {};
          baseFonts.forEach(function(base) {
            ctx.font = textSize + ' ' + base;
            var metrics = ctx.measureText(testString);
            baselines[base] = metrics.width;
          });

          testFonts.forEach(function(font) {
            baseFonts.forEach(function(base) {
              ctx.font = textSize + ' ' + font + ', ' + base;
              var metrics = ctx.measureText(testString);
              if (metrics.width !== baselines[base]) {
                if (detected.indexOf(font) === -1) detected.push(font);
              }
            });
          });

          resolve(detected.join(',') || 'none');
        } catch (e) {
          resolve('fe');
        }
      });
    },

    getScreenInfo: function() {
      return [
        screen.width, screen.height, screen.colorDepth, screen.pixelDepth,
        window.devicePixelRatio || 1, screen.orientation ? screen.orientation.type : 'unknown'
      ].join('x');
    },

    getDeviceInfo: function() {
      return [
        navigator.platform, navigator.hardwareConcurrency || 0,
        navigator.maxTouchPoints || 0, navigator.vendor,
        'ontouchstart' in window ? 1 : 0
      ].join('~');
    },

    getBrowserFeatures: function() {
      var features = [
        'localStorage' in window, 'sessionStorage' in window,
        'indexedDB' in window, 'WebAssembly' in window,
        'Worker' in window, 'ServiceWorker' in navigator,
        'WebGL' in window || !!document.createElement('canvas').getContext('webgl'),
        'RTCPeerConnection' in window, 'speechSynthesis' in window,
        'Bluetooth' in navigator, 'credentials' in navigator
      ];
      return features.map(function(f) { return f ? '1' : '0'; }).join('');
    },

    getTimezoneInfo: function() {
      try {
        var tz = Intl.DateTimeFormat().resolvedOptions();
        return tz.timeZone + '|' + new Date().getTimezoneOffset() + '|' + (tz.locale || 'unknown');
      } catch (e) {
        return 'unknown';
      }
    },

    getHardwareInfo: function() {
      var mem = performance.memory;
      return [
        navigator.hardwareConcurrency || 'unknown',
        mem ? mem.jsHeapSizeLimit : 'unknown',
        navigator.deviceMemory || 'unknown'
      ].join('|');
    },

    getConnectionInfo: function() {
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!conn) return 'nc';
      return (conn.effectiveType || 'unknown') + '|' + (conn.downlink || 0) + '|' + (conn.rtt || 0);
    },

    getPluginsInfo: function() {
      try {
        var plugins = Array.from(navigator.plugins || []);
        return plugins.length + ':' + plugins.slice(0, 5).map(function(p) { return p.name; }).join(',');
      } catch (e) {
        return 'np';
      }
    },

    getOrCreate: function() {
      var self = this;
      var fp = storage.get('fingerprint');
      if (fp) return Promise.resolve(fp);
      return self.generate().then(function(newFp) {
        storage.set('fingerprint', newFp);
        return newFp;
      });
    }
  };

  // Fraud Detection
  var FraudDetector = {
    analyze: function() {
      var score = 0;
      var signals = [];

      if (navigator.webdriver || document.__webdriver_script_fn) {
        score += 40;
        signals.push('webdriver');
      }

      if (!navigator.plugins || navigator.plugins.length === 0) {
        score += 25;
        signals.push('no_plugins');
      }

      var botPattern = /bot|crawler|spider|scraper|headless|phantom|selenium|puppeteer|playwright/i;
      if (botPattern.test(navigator.userAgent)) {
        score += 35;
        signals.push('bot_ua');
      }

      if (screen.width < 100 || screen.height < 100) {
        score += 20;
        signals.push('suspicious_screen');
      }

      if (window.outerWidth === 0 && window.outerHeight === 0) {
        score += 30;
        signals.push('hidden_window');
      }

      if (!window.chrome && navigator.userAgent.indexOf('Chrome') > -1) {
        score += 15;
        signals.push('fake_chrome');
      }

      return { score: score, signals: signals, isBot: score >= 50 };
    }
  };

  // Tracking Params Extraction
  var TrackingParams = {
    extract: function() {
      var params = new URLSearchParams(window.location.search);
      var result = {};

      var clickIds = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'ttclid', 'msclkid', 'li_fat_id', 'twclid'];
      clickIds.forEach(function(id) {
        var val = params.get(id);
        if (val) {
          result[id] = val;
          storage.set(id, val, 90);
        } else {
          var stored = storage.get(id);
          if (stored) result[id] = stored;
        }
      });

      var utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      utmParams.forEach(function(p) {
        var val = params.get(p);
        if (val) {
          result[p] = val;
          storage.set(p, val, 30);
        } else {
          var stored = storage.get(p);
          if (stored) result[p] = stored;
        }
      });

      try {
        var cookies = document.cookie.split(';').reduce(function(acc, c) {
          var parts = c.trim().split('=');
          acc[parts[0]] = parts[1];
          return acc;
        }, {});
        if (cookies._fbc) result.fbc = cookies._fbc;
        if (cookies._fbp) result.fbp = cookies._fbp;
      } catch (e) {}

      return result;
    }
  };

  // Device Info Collection
  var DeviceInfo = {
    collect: function() {
      var ua = navigator.userAgent;

      var isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      var isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
      var deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

      var browser = 'Unknown';
      if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
      else if (ua.indexOf('SamsungBrowser') > -1) browser = 'Samsung';
      else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';
      else if (ua.indexOf('Edg') > -1) browser = 'Edge';
      else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
      else if (ua.indexOf('Safari') > -1) browser = 'Safari';

      var os = 'Unknown';
      if (ua.indexOf('Windows NT 10') > -1) os = 'Windows 10/11';
      else if (ua.indexOf('Mac OS') > -1) os = 'macOS';
      else if (ua.indexOf('Android') > -1) os = 'Android';
      else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';
      else if (ua.indexOf('Linux') > -1) os = 'Linux';

      return {
        deviceType: deviceType,
        browser: browser,
        os: os,
        userAgent: ua,
        screen: screen.width + 'x' + screen.height,
        viewport: window.innerWidth + 'x' + window.innerHeight,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    }
  };

  // Session Replay (Lightweight)
  var SessionReplay = {
    events: [],
    recording: false,
    maxEvents: 200,

    start: function() {
      if (this.recording) return;
      this.recording = true;
      var self = this;

      document.addEventListener('click', function(e) {
        self.events.push({
          type: 'click', x: e.clientX, y: e.clientY,
          target: e.target.tagName + (e.target.id ? '#' + e.target.id : ''),
          ts: Date.now()
        });
        self.checkSize();
      }, true);

      document.addEventListener('scroll', function() {
        self.events.push({
          type: 'scroll', scrollY: window.scrollY,
          scrollPercent: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100),
          ts: Date.now()
        });
        self.checkSize();
      }, { passive: true });

      log('Session replay started');
    },

    checkSize: function() {
      if (this.events.length >= this.maxEvents) {
        EventTracker.track('SessionReplay', {
          session_id: EventTracker.sessionId,
          replay_events: this.events.slice()
        });
        this.events = [];
      }
    },

    flush: function() {
      if (this.events.length > 0) {
        return { session_id: EventTracker.sessionId, replay_events: this.events.slice() };
      }
      return null;
    }
  };

  // Event Tracker
  var EventTracker = {
    queue: [],
    processing: false,
    sessionId: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    flushTimer: null,

    track: function(eventName, eventData) {
      var self = this;
      eventData = eventData || {};

      Fingerprint.getOrCreate().then(function(fingerprint) {
        var trackingParams = TrackingParams.extract();
        var deviceInfo = DeviceInfo.collect();
        var fraud = FraudDetector.analyze();

        if (fraud.isBot && fraud.score > 80) {
          log('Skipping event - bot detected:', fraud);
          return;
        }

        var event = {
          pixel_id: PIXEL_ID,
          event_name: eventName,
          event_id: eventName + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          fingerprint_id: fingerprint,
          session_id: self.sessionId,
          page_url: window.location.href,
          page_path: window.location.pathname,
          page_title: document.title,
          referrer: document.referrer,
          fraud_score: fraud.score,
          fraud_signals: fraud.signals
        };

        Object.keys(trackingParams).forEach(function(k) { event[k] = trackingParams[k]; });
        Object.keys(deviceInfo).forEach(function(k) { event[k] = deviceInfo[k]; });
        Object.keys(eventData).forEach(function(k) { event[k] = eventData[k]; });

        self.queue.push(event);
        log('Event queued:', eventName, event);

        if (['Purchase', 'Lead', 'CompleteRegistration', 'Subscribe'].indexOf(eventName) > -1) {
          self.flush();
        } else {
          if (!self.flushTimer) {
            self.flushTimer = setTimeout(function() { self.flush(); }, 2000);
          }
        }
      });
    },

    flush: function() {
      var self = this;
      if (self.processing || self.queue.length === 0) return;
      self.processing = true;

      if (self.flushTimer) {
        clearTimeout(self.flushTimer);
        self.flushTimer = null;
      }

      var events = self.queue.slice();
      self.queue = [];

      var payload = JSON.stringify({ events: events });

      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: 'application/json' });
        var sent = navigator.sendBeacon(API_BASE + '/api/pixel/events', blob);
        if (sent) {
          log('Events sent via beacon:', events.length);
          self.processing = false;
          return;
        }
      }

      fetch(API_BASE + '/api/pixel/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
        credentials: 'include'
      }).then(function(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        log('Events sent via fetch:', events.length);
      }).catch(function(e) {
        log('Failed to send events:', e);
        self.queue = events.concat(self.queue);
      }).finally(function() {
        self.processing = false;
      });
    }
  };

  // Public API
  var ChronosPixel = {
    track: function(eventName, data) { EventTracker.track(eventName, data); },
    pageView: function(data) { EventTracker.track('PageView', data); },
    viewContent: function(data) { EventTracker.track('ViewContent', data); },
    addToCart: function(data) { EventTracker.track('AddToCart', data); },
    initiateCheckout: function(data) { EventTracker.track('InitiateCheckout', data); },
    purchase: function(data) { EventTracker.track('Purchase', data); },
    lead: function(data) { EventTracker.track('Lead', data); },
    completeRegistration: function(data) { EventTracker.track('CompleteRegistration', data); },
    search: function(data) { EventTracker.track('Search', data); },
    subscribe: function(data) { EventTracker.track('Subscribe', data); },
    identify: function(userData) {
      storage.set('user_data', userData);
      EventTracker.track('Identify', { user_data: userData });
    },
    getFingerprint: function() { return Fingerprint.getOrCreate(); },
    getSessionId: function() { return EventTracker.sessionId; },
    debug: function(enable) { DEBUG = enable; }
  };

  // Initialize
  function init() {
    log('Initializing Chronos Hyper-Pixel v2.0...');

    var trackPageView = function() {
      var loadTime = 0;
      try {
        loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      } catch (e) {}
      EventTracker.track('PageView', { page_load_time: loadTime });
    };

    if (document.readyState === 'complete') {
      trackPageView();
    } else {
      window.addEventListener('load', trackPageView);
    }

    if (ENABLE_REPLAY) {
      SessionReplay.start();
    }

    var originalPushState = history.pushState;
    var originalReplaceState = history.replaceState;

    history.pushState = function() {
      originalPushState.apply(this, arguments);
      setTimeout(function() { EventTracker.track('PageView', { spa: true }); }, 0);
    };

    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      setTimeout(function() { EventTracker.track('PageView', { spa: true }); }, 0);
    };

    window.addEventListener('popstate', function() { EventTracker.track('PageView', { spa: true }); });

    window.addEventListener('beforeunload', function() {
      EventTracker.flush();
      if (SessionReplay.recording) {
        var replayData = SessionReplay.flush();
        if (replayData) {
          navigator.sendBeacon(
            API_BASE + '/api/pixel/events',
            new Blob([JSON.stringify({
              events: [{
                pixel_id: PIXEL_ID,
                event_name: 'SessionReplay',
                session_id: EventTracker.sessionId,
                replay_events: replayData.replay_events
              }]
            })], { type: 'application/json' })
          );
        }
      }
    });

    document.addEventListener('click', function(e) {
      var link = e.target.closest ? e.target.closest('a') : null;
      if (!link || !link.href) return;

      try {
        var url = new URL(link.href);
        if (url.hostname !== window.location.hostname) {
          var fp = storage.get('fingerprint');
          if (fp) url.searchParams.set('_chronos_id', fp);
          url.searchParams.set('_chronos_session', EventTracker.sessionId);
          
          var utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
          var currentParams = new URLSearchParams(window.location.search);
          utmParams.forEach(function(p) {
            var val = currentParams.get(p) || storage.get(p);
            if (val) url.searchParams.set(p, val);
          });

          link.href = url.toString();
        }
      } catch (e) {}
    });

    var params = new URLSearchParams(window.location.search);
    var incomingFp = params.get('_chronos_id');
    var incomingSession = params.get('_chronos_session');
    if (incomingFp) storage.set('fingerprint', incomingFp);
    if (incomingSession) storage.set('linked_session', incomingSession);

    log('Chronos Hyper-Pixel initialized. Pixel ID:', PIXEL_ID);
  }

  window.chronos = ChronosPixel;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
