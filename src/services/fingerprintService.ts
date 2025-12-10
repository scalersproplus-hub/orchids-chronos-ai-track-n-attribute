/**
 * Browser Fingerprinting Service
 * Creates a stable device identifier without cookies
 * 
 * IMPORTANT: This runs in the browser context (client-side)
 * Deploy this as part of your tracking pixel/tag
 */

export class FingerprintService {
    /**
     * Generate a browser fingerprint based on device characteristics
     */
    async generateFingerprint(): Promise<string> {
        const components: string[] = [];

        // 1. Canvas Fingerprinting
        components.push(await this.getCanvasFingerprint());

        // 2. WebGL Fingerprinting
        components.push(await this.getWebGLFingerprint());

        // 3. Audio Fingerprinting
        components.push(await this.getAudioFingerprint());

        // 4. Screen & Device Info
        components.push(this.getScreenInfo());
        components.push(this.getDeviceInfo());

        // 5. Browser Features
        components.push(this.getBrowserFeatures());

        // 6. Timezone & Language
        components.push(this.getTimezoneInfo());
        components.push(this.getLanguageInfo());

        // 7. Fonts Detection
        components.push(await this.getFontsFingerprint());

        // 8. Advanced: Battery API
        components.push(await this.getBatteryFingerprint());

        // 9. Advanced: Media Devices
        components.push(await this.getMediaDevicesFingerprint());

        // 10. Advanced: Hardware Memory
        components.push(this.getHardwareFingerprint());

        // 11. Advanced: Permissions State
        components.push(await this.getPermissionsFingerprint());

        // Combine all components and hash
        const combined = components.join('|');
        const fingerprint = await this.sha256(combined);
        
        return `fp_${fingerprint.substring(0, 32)}`;
    }

    /**
     * Canvas Fingerprinting
     */
    private async getCanvasFingerprint(): Promise<string> {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 50;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) return 'no-canvas';

            // Draw text with various styles
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Chronos AI', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Chronos AI', 4, 17);

            return canvas.toDataURL();
        } catch (e) {
            return 'canvas-error';
        }
    }

    /**
     * WebGL Fingerprinting
     */
    private async getWebGLFingerprint(): Promise<string> {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
            
            if (!gl) return 'no-webgl';

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (!debugInfo) return 'no-debug-info';

            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

            return `${vendor}|${renderer}`;
        } catch (e) {
            return 'webgl-error';
        }
    }

    /**
     * Audio Fingerprinting
     */
    private async getAudioFingerprint(): Promise<string> {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return 'no-audio';

            const context = new AudioContext();
            const oscillator = context.createOscillator();
            const analyser = context.createAnalyser();
            const gainNode = context.createGain();
            const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

            gainNode.gain.value = 0; // Mute
            oscillator.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.start(0);

            return new Promise((resolve) => {
                scriptProcessor.addEventListener('audioprocess', function(event) {
                    const output = event.outputBuffer.getChannelData(0);
                    const sum = output.reduce((acc, val) => acc + Math.abs(val), 0);
                    oscillator.disconnect();
                    scriptProcessor.disconnect();
                    analyser.disconnect();
                    gainNode.disconnect();
                    context.close();
                    resolve(sum.toString());
                });
            });
        } catch (e) {
            return 'audio-error';
        }
    }

    /**
     * Screen Information
     */
    private getScreenInfo(): string {
        return [
            screen.width,
            screen.height,
            screen.colorDepth,
            screen.pixelDepth,
            window.devicePixelRatio || 1
        ].join('|');
    }

    /**
     * Device Information
     */
    private getDeviceInfo(): string {
        return [
            navigator.userAgent,
            navigator.platform,
            navigator.hardwareConcurrency || 'unknown',
            navigator.maxTouchPoints || 0
        ].join('|');
    }

    /**
     * Browser Features
     */
    private getBrowserFeatures(): string {
        const features = [
            'localStorage' in window,
            'sessionStorage' in window,
            'indexedDB' in window,
            'WebAssembly' in window,
            'Worker' in window,
            'SharedWorker' in window,
            'ServiceWorker' in navigator,
            'PushManager' in window,
            'Notification' in window
        ];
        return features.map(f => f ? '1' : '0').join('');
    }

    /**
     * Timezone Information
     */
    private getTimezoneInfo(): string {
        return [
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            new Date().getTimezoneOffset()
        ].join('|');
    }

    /**
     * Language Information
     */
    private getLanguageInfo(): string {
        return [
            navigator.language,
            navigator.languages?.join(',') || ''
        ].join('|');
    }

    /**
     * Font Detection Fingerprinting
     */
    private async getFontsFingerprint(): Promise<string> {
        try {
            const baseFonts = ['monospace', 'sans-serif', 'serif'];
            const testFonts = [
                'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
                'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
                'Impact', 'Lucida Console'
            ];

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return 'no-canvas';

            const testString = 'mmmmmmmmmmlli';
            const textSize = '72px';

            // Measure baseline fonts
            const baselines: { [key: string]: { width: number; height: number } } = {};
            for (const baseFont of baseFonts) {
                ctx.font = `${textSize} ${baseFont}`;
                const metrics = ctx.measureText(testString);
                baselines[baseFont] = {
                    width: metrics.width,
                    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
                };
            }

            // Test fonts
            const detectedFonts: string[] = [];
            for (const testFont of testFonts) {
                for (const baseFont of baseFonts) {
                    ctx.font = `${textSize} ${testFont}, ${baseFont}`;
                    const metrics = ctx.measureText(testString);
                    const width = metrics.width;
                    const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

                    if (width !== baselines[baseFont].width || height !== baselines[baseFont].height) {
                        detectedFonts.push(testFont);
                        break;
                    }
                }
            }

            return detectedFonts.join(',');
        } catch (e) {
            return 'fonts-error';
        }
    }

    private async getBatteryFingerprint(): Promise<string> {
        try {
            const battery = await (navigator as any).getBattery();
            return [
                battery.level,
                battery.charging,
                battery.chargingTime,
                battery.dischargingTime
            ].join('|');
        } catch {
            return 'no-battery-api';
        }
    }

    private async getMediaDevicesFingerprint(): Promise<string> {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const counts = {
                audioinput: devices.filter(d => d.kind === 'audioinput').length,
                videoinput: devices.filter(d => d.kind === 'videoinput').length,
                audiooutput: devices.filter(d => d.kind === 'audiooutput').length
            };
            return `audio:${counts.audioinput}|video:${counts.videoinput}|speakers:${counts.audiooutput}`;
        } catch {
            return 'no-media-devices';
        }
    }

    private getHardwareFingerprint(): string {
        const memory = (performance as any).memory;
        return [
            navigator.hardwareConcurrency || 'unknown',
            memory ? memory.jsHeapSizeLimit : 'unknown',
            memory ? memory.totalJSHeapSize : 'unknown'
        ].join('|');
    }

    private async getPermissionsFingerprint(): Promise<string> {
        const perms = ['geolocation', 'notifications', 'camera', 'microphone'];
        const results = await Promise.all(
            perms.map(async (name) => {
                try {
                    const result = await navigator.permissions.query({ name: name as PermissionName });
                    return `${name}:${result.state}`;
                } catch {
                    return `${name}:unsupported`;
                }
            })
        );
        return results.join('|');
    }

    /**
     * SHA-256 hash function
     */
    private async sha256(message: string): Promise<string> {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Get or create a persistent fingerprint (stores in localStorage as backup)
     */
    async getOrCreateFingerprint(): Promise<string> {
        try {
            // Try to get from localStorage first
            const stored = localStorage.getItem('chronos_fingerprint');
            if (stored) {
                return stored;
            }
        } catch (e) {
            // localStorage might be blocked
        }

        // Generate new fingerprint
        const fingerprint = await this.generateFingerprint();

        try {
            // Try to store for faster future lookups
            localStorage.setItem('chronos_fingerprint', fingerprint);
        } catch (e) {
            // Ignore if localStorage is blocked
        }

        return fingerprint;
    }
}

/**
 * Create a fingerprint service instance
 */
export const createFingerprintService = (): FingerprintService => {
    return new FingerprintService();
};

// Singleton instance for convenience
let fingerprintServiceInstance: FingerprintService | null = null;

export const getFingerprintService = (): FingerprintService => {
    if (!fingerprintServiceInstance) {
        fingerprintServiceInstance = new FingerprintService();
    }
    return fingerprintServiceInstance;
};

/**
 * Hash email for privacy-safe matching (SHA-256)
 */
export const hashEmail = async (email: string): Promise<string> => {
    const normalized = email.toLowerCase().trim();
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash phone number for privacy-safe matching
 */
export const hashPhone = async (phone: string): Promise<string> => {
    // Remove all non-numeric characters except +
    const normalized = phone.replace(/[^\d+]/g, '');
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate a deduplication event ID
 */
export const generateEventId = (eventName: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${eventName}_${timestamp}_${random}`;
};

/**
 * Collect device and browser information
 */
export const collectDeviceInfo = (): {
    deviceType: 'mobile' | 'desktop' | 'tablet';
    browser: string;
    os: string;
    userAgent: string;
    screenResolution: string;
    language: string;
    timezone: string;
} => {
    const ua = navigator.userAgent;
    
    // Detect device type
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    
    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Trident')) browser = 'Internet Explorer';
    else if (ua.includes('Edge')) browser = 'Edge Legacy';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    
    // Detect OS
    let os = 'Unknown';
    if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
    else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
    else if (ua.includes('Windows NT 6.2')) os = 'Windows 8';
    else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';
    
    return {
        deviceType,
        browser,
        os,
        userAgent: ua,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
};

/**
 * Parse URL parameters to extract ad tracking IDs
 */
export const extractTrackingParams = (): {
    gclid?: string;
    gbraid?: string;
    wbraid?: string;
    fbclid?: string;
    fbc?: string;
    fbp?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
} => {
    const params = new URLSearchParams(window.location.search);
    const result: Record<string, string> = {};
    
    // Google Click IDs
    const gclid = params.get('gclid');
    const gbraid = params.get('gbraid');
    const wbraid = params.get('wbraid');
    
    // Facebook Click ID
    const fbclid = params.get('fbclid');
    
    // UTM parameters
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    
    if (gclid) result.gclid = gclid;
    if (gbraid) result.gbraid = gbraid;
    if (wbraid) result.wbraid = wbraid;
    if (fbclid) result.fbclid = fbclid;
    
    utmParams.forEach(param => {
        const value = params.get(param);
        if (value) result[param] = value;
    });
    
    // Try to get Facebook cookies
    try {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {} as Record<string, string>);
        
        if (cookies._fbc) result.fbc = cookies._fbc;
        if (cookies._fbp) result.fbp = cookies._fbp;
    } catch (e) {
        // Cookies might be blocked
    }
    
    // Store click IDs in localStorage for persistence
    try {
        if (gclid) localStorage.setItem('chronos_gclid', gclid);
        if (gbraid) localStorage.setItem('chronos_gbraid', gbraid);
        if (wbraid) localStorage.setItem('chronos_wbraid', wbraid);
        if (fbclid) localStorage.setItem('chronos_fbclid', fbclid);
        
        // Check localStorage for previously stored click IDs
        if (!result.gclid) {
            const storedGclid = localStorage.getItem('chronos_gclid');
            if (storedGclid) result.gclid = storedGclid;
        }
        if (!result.gbraid) {
            const storedGbraid = localStorage.getItem('chronos_gbraid');
            if (storedGbraid) result.gbraid = storedGbraid;
        }
        if (!result.wbraid) {
            const storedWbraid = localStorage.getItem('chronos_wbraid');
            if (storedWbraid) result.wbraid = storedWbraid;
        }
        if (!result.fbclid) {
            const storedFbclid = localStorage.getItem('chronos_fbclid');
            if (storedFbclid) result.fbclid = storedFbclid;
        }
    } catch (e) {
        // localStorage might be blocked
    }
    
    return result;
};