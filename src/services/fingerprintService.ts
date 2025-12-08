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