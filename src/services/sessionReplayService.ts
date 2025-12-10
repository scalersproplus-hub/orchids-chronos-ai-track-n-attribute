export interface SessionEvent {
    type: 'mousemove' | 'click' | 'scroll' | 'visibility' | 'rage_click' | 'input' | 'resize';
    x?: number;
    y?: number;
    scrollY?: number;
    target?: string;
    hidden?: boolean;
    count?: number;
    value?: string;
    width?: number;
    height?: number;
    timestamp: number;
}

export interface SessionPayload {
    sessionId: string;
    events: SessionEvent[];
    url: string;
    timestamp: number;
    userAgent: string;
    screenSize: string;
}

export class SessionReplayService {
    private events: SessionEvent[] = [];
    private sessionId: string;
    private isRecording = false;
    private sendInterval: NodeJS.Timeout | null = null;
    private mouseMoveThrottle = 50;
    private lastMouseMove = 0;
    private maxEventsBeforeSend = 100;

    constructor() {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    startRecording() {
        if (this.isRecording) return;
        this.isRecording = true;

        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('click', this.handleClick);
        document.addEventListener('scroll', this.handleScroll);
        document.addEventListener('visibilitychange', this.handleVisibility);
        document.addEventListener('input', this.handleInput, true);
        window.addEventListener('resize', this.handleResize);

        this.detectRageClicks();

        this.sendInterval = setInterval(() => {
            this.sendToServer();
        }, 10000);
    }

    stopRecording() {
        if (!this.isRecording) return;
        this.isRecording = false;

        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('visibilitychange', this.handleVisibility);
        document.removeEventListener('input', this.handleInput, true);
        window.removeEventListener('resize', this.handleResize);

        if (this.sendInterval) {
            clearInterval(this.sendInterval);
            this.sendInterval = null;
        }

        this.sendToServer();
    }

    private handleMouseMove = (e: MouseEvent) => {
        const now = Date.now();
        if (now - this.lastMouseMove < this.mouseMoveThrottle) return;
        this.lastMouseMove = now;

        this.events.push({
            type: 'mousemove',
            x: e.clientX,
            y: e.clientY,
            timestamp: now
        });
        this.checkBufferSize();
    };

    private handleClick = (e: MouseEvent) => {
        this.events.push({
            type: 'click',
            x: e.clientX,
            y: e.clientY,
            target: this.getElementSelector(e.target as HTMLElement),
            timestamp: Date.now()
        });
        this.checkBufferSize();
    };

    private handleScroll = () => {
        this.events.push({
            type: 'scroll',
            scrollY: window.scrollY,
            timestamp: Date.now()
        });
        this.checkBufferSize();
    };

    private handleVisibility = () => {
        this.events.push({
            type: 'visibility',
            hidden: document.hidden,
            timestamp: Date.now()
        });
        this.checkBufferSize();
    };

    private handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.type === 'password') return;

        this.events.push({
            type: 'input',
            target: this.getElementSelector(target),
            value: target.value?.length > 50 ? `${target.value.substring(0, 50)}...` : target.value,
            timestamp: Date.now()
        });
        this.checkBufferSize();
    };

    private handleResize = () => {
        this.events.push({
            type: 'resize',
            width: window.innerWidth,
            height: window.innerHeight,
            timestamp: Date.now()
        });
        this.checkBufferSize();
    };

    private rageClickCount = 0;
    private lastClickTime = 0;
    private lastClickTarget: string | null = null;

    private detectRageClicks() {
        document.addEventListener('click', (e) => {
            const now = Date.now();
            const target = this.getElementSelector(e.target as HTMLElement);

            if (now - this.lastClickTime < 500 && target === this.lastClickTarget) {
                this.rageClickCount++;
                if (this.rageClickCount >= 3) {
                    this.events.push({
                        type: 'rage_click',
                        x: e.clientX,
                        y: e.clientY,
                        target,
                        count: this.rageClickCount,
                        timestamp: now
                    });
                }
            } else {
                this.rageClickCount = 1;
            }
            this.lastClickTime = now;
            this.lastClickTarget = target;
        });
    }

    private getElementSelector(el: HTMLElement | null): string {
        if (!el) return 'unknown';
        const parts: string[] = [];
        
        if (el.id) {
            parts.push(`#${el.id}`);
        } else {
            parts.push(el.tagName.toLowerCase());
            if (el.className && typeof el.className === 'string') {
                const classes = el.className.split(' ').slice(0, 2).join('.');
                if (classes) parts.push(`.${classes}`);
            }
        }
        
        return parts.join('');
    }

    private checkBufferSize() {
        if (this.events.length >= this.maxEventsBeforeSend) {
            this.sendToServer();
        }
    }

    async sendToServer() {
        if (this.events.length === 0) return;

        const payload: SessionPayload = {
            sessionId: this.sessionId,
            events: [...this.events],
            url: window.location.href,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`
        };

        this.events = [];

        try {
            await fetch('/api/session-replay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Session replay send failed:', error);
        }
    }

    getSessionId(): string {
        return this.sessionId;
    }

    getEvents(): SessionEvent[] {
        return [...this.events];
    }
}

let sessionReplayInstance: SessionReplayService | null = null;

export const getSessionReplayService = (): SessionReplayService => {
    if (!sessionReplayInstance) {
        sessionReplayInstance = new SessionReplayService();
    }
    return sessionReplayInstance;
};
