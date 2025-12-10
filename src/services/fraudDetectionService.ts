export interface FraudRiskResult {
    isBot: boolean;
    riskScore: number;
    factors: string[];
    timestamp: number;
}

export class FraudDetector {
    private mouseMovements: number[] = [];
    private keyPressTimings: number[] = [];

    async analyze(): Promise<FraudRiskResult> {
        const factors: string[] = [];
        let score = 0;

        if (this.detectWebDriver()) {
            score += 40;
            factors.push('WebDriver detected');
        }

        if (this.detectAutomation()) {
            score += 30;
            factors.push('Automation tools detected');
        }

        if (this.detectBotUserAgent()) {
            score += 35;
            factors.push('Bot user-agent pattern');
        }

        if (this.detectHeadless()) {
            score += 30;
            factors.push('Headless browser detected');
        }

        if (this.detectSuspiciousResolution()) {
            score += 15;
            factors.push('Suspicious screen resolution');
        }

        if (this.isSuspiciousTimezone()) {
            score += 10;
            factors.push('Suspicious timezone');
        }

        if (this.hasNoReferrer() && this.isDirectTraffic()) {
            score += 5;
            factors.push('No referrer on direct traffic');
        }

        if (this.hasDisabledCookies()) {
            score += 10;
            factors.push('Cookies disabled');
        }

        if (this.detectInconsistentPlatform()) {
            score += 20;
            factors.push('Platform inconsistency');
        }

        if (!this.hasNormalBrowserFeatures()) {
            score += 15;
            factors.push('Missing browser features');
        }

        const hasHumanBehavior = await this.detectHumanBehavior();
        if (!hasHumanBehavior) {
            score += 25;
            factors.push('No human-like behavior');
        }

        return {
            isBot: score >= 50,
            riskScore: Math.min(score, 100),
            factors,
            timestamp: Date.now()
        };
    }

    private detectWebDriver(): boolean {
        const nav = navigator as any;
        return !!(
            nav.webdriver ||
            nav.__webdriver_script_fn ||
            nav.__webdriver_script_func ||
            nav.__webdriver_evaluate ||
            nav.__selenium_evaluate ||
            nav.__fxdriver_evaluate ||
            nav.__driver_unwrapped ||
            nav.__webdriver_unwrapped ||
            nav.__driver_evaluate ||
            nav.__selenium_unwrapped ||
            nav.__fxdriver_unwrapped
        );
    }

    private detectAutomation(): boolean {
        const win = window as any;
        return !!(
            win.phantom ||
            win._phantom ||
            win.__nightmare ||
            win.callPhantom ||
            win._WEBDRIVER_ELEM_CACHE ||
            win.domAutomation ||
            win.domAutomationController ||
            (document as any).__selenium_unwrapped ||
            (document as any).__webdriver_evaluate ||
            (document as any).__driver_evaluate
        );
    }

    private detectBotUserAgent(): boolean {
        const botPatterns = /bot|crawler|spider|scraper|headless|phantom|selenium|puppeteer|playwright|webdriver|chrome-lighthouse|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver/i;
        return botPatterns.test(navigator.userAgent);
    }

    private detectHeadless(): boolean {
        const win = window as any;
        const nav = navigator as any;

        if (nav.plugins?.length === 0) return true;
        if (!nav.languages || nav.languages.length === 0) return true;
        if (win.chrome && !win.chrome.runtime) return true;

        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                if (renderer.includes('SwiftShader') || renderer.includes('llvmpipe')) {
                    return true;
                }
            }
        }

        return false;
    }

    private detectSuspiciousResolution(): boolean {
        const suspiciousResolutions = [
            '800x600', '1024x768', '1x1', '0x0'
        ];
        const currentRes = `${screen.width}x${screen.height}`;
        return suspiciousResolutions.includes(currentRes) || screen.width < 100 || screen.height < 100;
    }

    private isSuspiciousTimezone(): boolean {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const suspiciousTz = ['UTC', 'Etc/UTC', 'Etc/GMT'];
            return suspiciousTz.includes(tz);
        } catch {
            return true;
        }
    }

    private hasNoReferrer(): boolean {
        return document.referrer === '';
    }

    private isDirectTraffic(): boolean {
        const params = new URLSearchParams(window.location.search);
        return !params.has('utm_source') && !params.has('gclid') && !params.has('fbclid');
    }

    private hasDisabledCookies(): boolean {
        return !navigator.cookieEnabled;
    }

    private detectInconsistentPlatform(): boolean {
        const ua = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();

        if (ua.includes('mac') && !platform.includes('mac')) return true;
        if (ua.includes('windows') && !platform.includes('win')) return true;
        if (ua.includes('linux') && !platform.includes('linux') && !ua.includes('android')) return true;

        return false;
    }

    private hasNormalBrowserFeatures(): boolean {
        return !!(
            'localStorage' in window &&
            'sessionStorage' in window &&
            'fetch' in window &&
            'Promise' in window &&
            navigator.cookieEnabled
        );
    }

    private detectHumanBehavior(): Promise<boolean> {
        return new Promise((resolve) => {
            let hasMoved = false;
            let hasScrolled = false;

            const moveHandler = () => {
                hasMoved = true;
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('touchmove', moveHandler);
            };

            const scrollHandler = () => {
                hasScrolled = true;
                document.removeEventListener('scroll', scrollHandler);
            };

            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('touchmove', moveHandler);
            document.addEventListener('scroll', scrollHandler);

            setTimeout(() => {
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('touchmove', moveHandler);
                document.removeEventListener('scroll', scrollHandler);
                resolve(hasMoved || hasScrolled);
            }, 3000);
        });
    }

    trackMouseMovement() {
        document.addEventListener('mousemove', () => {
            this.mouseMovements.push(Date.now());
            if (this.mouseMovements.length > 100) {
                this.mouseMovements.shift();
            }
        });
    }

    trackKeyPresses() {
        document.addEventListener('keydown', () => {
            this.keyPressTimings.push(Date.now());
            if (this.keyPressTimings.length > 50) {
                this.keyPressTimings.shift();
            }
        });
    }

    getInteractionPatterns(): { mouseMovementVariance: number; keyPressVariance: number } {
        const calcVariance = (arr: number[]): number => {
            if (arr.length < 2) return 0;
            const deltas = arr.slice(1).map((t, i) => t - arr[i]);
            const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
            const variance = deltas.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / deltas.length;
            return Math.sqrt(variance);
        };

        return {
            mouseMovementVariance: calcVariance(this.mouseMovements),
            keyPressVariance: calcVariance(this.keyPressTimings)
        };
    }
}

let fraudDetectorInstance: FraudDetector | null = null;

export const getFraudDetector = (): FraudDetector => {
    if (!fraudDetectorInstance) {
        fraudDetectorInstance = new FraudDetector();
    }
    return fraudDetectorInstance;
};
