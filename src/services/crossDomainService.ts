export class CrossDomainTracker {
    private baseDomain: string;

    constructor(baseDomain?: string) {
        this.baseDomain = baseDomain || this.extractBaseDomain(window.location.hostname);
    }

    private extractBaseDomain(hostname: string): string {
        const parts = hostname.split('.');
        if (parts.length > 2) {
            return parts.slice(-2).join('.');
        }
        return hostname;
    }

    linkDomains(targetUrl: string): string {
        const url = new URL(targetUrl);

        const chronosId = this.safeGetLocalStorage('chronos_fingerprint');
        const fbp = this.getCookie('_fbp');
        const fbc = this.getCookie('_fbc');
        const gclid = new URLSearchParams(window.location.search).get('gclid');
        const gbraid = new URLSearchParams(window.location.search).get('gbraid');
        const wbraid = new URLSearchParams(window.location.search).get('wbraid');
        const sessionId = this.safeGetLocalStorage('chronos_session_id');

        if (chronosId) url.searchParams.set('_chronos_id', chronosId);
        if (sessionId) url.searchParams.set('_chronos_session', sessionId);
        if (fbp) url.searchParams.set('_fbp', fbp);
        if (fbc) url.searchParams.set('_fbc', fbc);
        if (gclid) url.searchParams.set('gclid', gclid);
        if (gbraid) url.searchParams.set('gbraid', gbraid);
        if (wbraid) url.searchParams.set('wbraid', wbraid);

        const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
        const currentParams = new URLSearchParams(window.location.search);
        utmParams.forEach(param => {
            const value = currentParams.get(param);
            if (value) url.searchParams.set(param, value);
        });

        return url.toString();
    }

    receiveFromDomain(): void {
        const params = new URLSearchParams(window.location.search);

        const chronosId = params.get('_chronos_id');
        const sessionId = params.get('_chronos_session');
        const fbp = params.get('_fbp');
        const fbc = params.get('_fbc');

        if (chronosId) this.safeSetLocalStorage('chronos_fingerprint', chronosId);
        if (sessionId) this.safeSetLocalStorage('chronos_session_id', sessionId);
        if (fbp) this.setCookie('_fbp', fbp, 90);
        if (fbc) this.setCookie('_fbc', fbc, 90);

        const gclid = params.get('gclid');
        const gbraid = params.get('gbraid');
        const wbraid = params.get('wbraid');

        if (gclid) this.safeSetLocalStorage('chronos_gclid', gclid);
        if (gbraid) this.safeSetLocalStorage('chronos_gbraid', gbraid);
        if (wbraid) this.safeSetLocalStorage('chronos_wbraid', wbraid);
    }

    getCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    setCookie(name: string, value: string, days: number): void {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; domain=.${this.baseDomain}; SameSite=Lax`;
    }

    private safeGetLocalStorage(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    private safeSetLocalStorage(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch {
            // localStorage blocked
        }
    }

    decorateAllLinks(): void {
        document.querySelectorAll('a[href]').forEach((link) => {
            const anchor = link as HTMLAnchorElement;
            try {
                const url = new URL(anchor.href);
                if (url.hostname !== window.location.hostname && url.hostname.endsWith(this.baseDomain)) {
                    anchor.href = this.linkDomains(anchor.href);
                }
            } catch {
                // Invalid URL
            }
        });
    }

    setupFormTracking(): void {
        document.querySelectorAll('form').forEach((form) => {
            form.addEventListener('submit', () => {
                const action = form.action;
                if (action) {
                    try {
                        const url = new URL(action);
                        if (url.hostname !== window.location.hostname) {
                            form.action = this.linkDomains(action);
                        }
                    } catch {
                        // Invalid URL
                    }
                }
            });
        });
    }
}

let crossDomainInstance: CrossDomainTracker | null = null;

export const getCrossDomainTracker = (baseDomain?: string): CrossDomainTracker => {
    if (!crossDomainInstance) {
        crossDomainInstance = new CrossDomainTracker(baseDomain);
    }
    return crossDomainInstance;
};
