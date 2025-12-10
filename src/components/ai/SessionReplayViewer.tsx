import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, MousePointer, MousePointerClick, ScrollText, Eye, EyeOff, AlertTriangle, Clock, User, Monitor, RefreshCw } from 'lucide-react';
import { SessionEvent } from '../../services/sessionReplayService';

interface Session {
    sessionId: string;
    events: SessionEvent[];
    url: string;
    timestamp: number;
    userAgent: string;
    screenSize: string;
}

const MOCK_SESSIONS: Session[] = [
    {
        sessionId: 'session_1749741234567_abc123',
        events: [
            { type: 'mousemove', x: 100, y: 200, timestamp: 1000 },
            { type: 'mousemove', x: 150, y: 220, timestamp: 1100 },
            { type: 'click', x: 200, y: 300, target: 'button.cta-primary', timestamp: 2000 },
            { type: 'scroll', scrollY: 150, timestamp: 3000 },
            { type: 'mousemove', x: 300, y: 400, timestamp: 3500 },
            { type: 'click', x: 350, y: 420, target: 'a.nav-link', timestamp: 4000 },
            { type: 'rage_click', x: 400, y: 200, target: 'div.loading-spinner', count: 5, timestamp: 5000 },
            { type: 'visibility', hidden: true, timestamp: 6000 },
            { type: 'visibility', hidden: false, timestamp: 8000 },
            { type: 'scroll', scrollY: 500, timestamp: 9000 },
            { type: 'click', x: 250, y: 600, target: '#checkout-btn', timestamp: 10000 },
        ],
        url: 'https://example.com/product/123',
        timestamp: Date.now() - 3600000,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
        screenSize: '1920x1080'
    },
    {
        sessionId: 'session_1749741234568_def456',
        events: [
            { type: 'mousemove', x: 50, y: 100, timestamp: 1000 },
            { type: 'click', x: 100, y: 150, target: 'nav.menu', timestamp: 1500 },
            { type: 'scroll', scrollY: 300, timestamp: 2500 },
            { type: 'rage_click', x: 200, y: 300, target: 'button.submit', count: 4, timestamp: 3500 },
        ],
        url: 'https://example.com/checkout',
        timestamp: Date.now() - 7200000,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/605.1.15',
        screenSize: '390x844'
    }
];

const EventIcon: React.FC<{ type: SessionEvent['type'] }> = ({ type }) => {
    const icons: Record<SessionEvent['type'], React.ReactNode> = {
        mousemove: <MousePointer className="w-3 h-3 text-gray-400" />,
        click: <MousePointerClick className="w-3 h-3 text-[hsl(170_80%_50%)]" />,
        scroll: <ScrollText className="w-3 h-3 text-[hsl(220_80%_60%)]" />,
        visibility: <Eye className="w-3 h-3 text-[hsl(40_95%_55%)]" />,
        rage_click: <AlertTriangle className="w-3 h-3 text-[hsl(0_80%_55%)]" />,
        input: <Monitor className="w-3 h-3 text-[hsl(270_91%_65%)]" />,
        resize: <Monitor className="w-3 h-3 text-gray-400" />
    };
    return <>{icons[type]}</>;
};

export const SessionReplayViewer: React.FC = () => {
    const [sessions] = useState<Session[]>(MOCK_SESSIONS);
    const [selectedSession, setSelectedSession] = useState<Session | null>(MOCK_SESSIONS[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [scrollPosition, setScrollPosition] = useState(0);
    const [speed, setSpeed] = useState(1);
    const canvasRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isPlaying && selectedSession && currentEventIndex < selectedSession.events.length) {
            const currentEvent = selectedSession.events[currentEventIndex];
            
            if (currentEvent.type === 'mousemove' || currentEvent.type === 'click' || currentEvent.type === 'rage_click') {
                setCursorPosition({ x: currentEvent.x || 0, y: currentEvent.y || 0 });
            }
            if (currentEvent.type === 'scroll') {
                setScrollPosition(currentEvent.scrollY || 0);
            }

            intervalRef.current = setTimeout(() => {
                setCurrentEventIndex(prev => prev + 1);
            }, 200 / speed);
        } else if (currentEventIndex >= (selectedSession?.events.length || 0)) {
            setIsPlaying(false);
        }

        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        };
    }, [isPlaying, currentEventIndex, selectedSession, speed]);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const resetPlayback = () => {
        setIsPlaying(false);
        setCurrentEventIndex(0);
        setCursorPosition({ x: 0, y: 0 });
        setScrollPosition(0);
    };

    const skipToEvent = (index: number) => {
        setCurrentEventIndex(index);
        const event = selectedSession?.events[index];
        if (event && (event.type === 'mousemove' || event.type === 'click' || event.type === 'rage_click')) {
            setCursorPosition({ x: event.x || 0, y: event.y || 0 });
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const getRageClicks = (events: SessionEvent[]) => {
        return events.filter(e => e.type === 'rage_click').length;
    };

    return (
        <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ border: '1px solid hsl(270 91% 65% / 0.1)' }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(0_80%_55%)] to-[hsl(25_95%_55%)] flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Session Replay</h3>
                        <p className="text-xs text-gray-400">Watch user interactions</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Speed:</span>
                    {[0.5, 1, 2].map(s => (
                        <motion.button
                            key={s}
                            onClick={() => setSpeed(s)}
                            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                                speed === s
                                    ? 'bg-[hsl(270_91%_65%)] text-white'
                                    : 'glass text-gray-400 hover:text-white'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {s}x
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Sessions ({sessions.length})
                    </h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {sessions.map(session => (
                            <motion.div
                                key={session.sessionId}
                                onClick={() => {
                                    setSelectedSession(session);
                                    resetPlayback();
                                }}
                                className={`p-3 rounded-xl cursor-pointer transition-all ${
                                    selectedSession?.sessionId === session.sessionId
                                        ? 'glass'
                                        : 'hover:bg-[hsl(230_20%_12%)]'
                                }`}
                                style={{
                                    border: selectedSession?.sessionId === session.sessionId
                                        ? '1px solid hsl(270 91% 65% / 0.3)'
                                        : '1px solid transparent'
                                }}
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-mono text-gray-400">
                                        {session.sessionId.substring(0, 20)}...
                                    </span>
                                    {getRageClicks(session.events) > 0 && (
                                        <span className="px-2 py-0.5 text-[10px] bg-[hsl(0_80%_55%_/_0.2)] text-[hsl(0_80%_60%)] rounded-full">
                                            {getRageClicks(session.events)} rage clicks
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(session.timestamp)}
                                    </span>
                                    <span>{session.events.length} events</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {selectedSession ? (
                        <>
                            <div
                                ref={canvasRef}
                                className="relative w-full h-64 glass rounded-xl mb-4 overflow-hidden"
                                style={{ border: '1px solid hsl(230 20% 15%)' }}
                            >
                                <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-10">
                                    {Array.from({ length: 72 }).map((_, i) => (
                                        <div key={i} className="border border-gray-700" />
                                    ))}
                                </div>

                                <motion.div
                                    className="absolute w-4 h-4"
                                    animate={{
                                        left: (cursorPosition.x / 1920) * 100 + '%',
                                        top: (cursorPosition.y / 1080) * 100 + '%'
                                    }}
                                    transition={{ duration: 0.1 }}
                                >
                                    <MousePointer className="w-4 h-4 text-[hsl(270_91%_65%)]" />
                                </motion.div>

                                {selectedSession.events
                                    .filter(e => e.type === 'click')
                                    .slice(0, currentEventIndex + 1)
                                    .map((event, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-3 h-3 rounded-full bg-[hsl(170_80%_50%_/_0.5)]"
                                            style={{
                                                left: ((event.x || 0) / 1920) * 100 + '%',
                                                top: ((event.y || 0) / 1080) * 100 + '%'
                                            }}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        />
                                    ))}

                                {selectedSession.events
                                    .filter(e => e.type === 'rage_click')
                                    .slice(0, currentEventIndex + 1)
                                    .map((event, i) => (
                                        <motion.div
                                            key={`rage-${i}`}
                                            className="absolute w-6 h-6 rounded-full border-2 border-[hsl(0_80%_55%)]"
                                            style={{
                                                left: ((event.x || 0) / 1920) * 100 + '%',
                                                top: ((event.y || 0) / 1080) * 100 + '%'
                                            }}
                                            initial={{ scale: 0, opacity: 1 }}
                                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        />
                                    ))}

                                <div className="absolute bottom-2 left-2 px-2 py-1 glass rounded text-xs text-gray-400">
                                    Scroll: {scrollPosition}px
                                </div>
                                <div className="absolute bottom-2 right-2 px-2 py-1 glass rounded text-xs text-gray-400">
                                    Event: {currentEventIndex + 1}/{selectedSession.events.length}
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4 mb-4">
                                <motion.button
                                    onClick={resetPlayback}
                                    className="p-2 glass rounded-lg text-gray-400 hover:text-white"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <SkipBack className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                    onClick={togglePlay}
                                    className="p-3 rounded-xl bg-gradient-to-r from-[hsl(270_91%_65%)] to-[hsl(320_80%_60%)] text-white"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </motion.button>
                                <motion.button
                                    onClick={() => skipToEvent(Math.min(currentEventIndex + 5, selectedSession.events.length - 1))}
                                    className="p-2 glass rounded-lg text-gray-400 hover:text-white"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <SkipForward className="w-5 h-5" />
                                </motion.button>
                            </div>

                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                <h4 className="text-xs font-medium text-gray-400 mb-2">Event Timeline</h4>
                                <div className="flex flex-wrap gap-1">
                                    {selectedSession.events.map((event, i) => (
                                        <motion.div
                                            key={i}
                                            onClick={() => skipToEvent(i)}
                                            className={`p-1.5 rounded cursor-pointer transition-colors ${
                                                i <= currentEventIndex
                                                    ? 'glass'
                                                    : 'bg-[hsl(230_20%_10%)]'
                                            } ${i === currentEventIndex ? 'ring-1 ring-[hsl(270_91%_65%)]' : ''}`}
                                            whileHover={{ scale: 1.1 }}
                                            title={`${event.type} at ${event.timestamp}ms`}
                                        >
                                            <EventIcon type={event.type} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            Select a session to view replay
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
