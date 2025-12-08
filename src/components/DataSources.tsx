import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Code, Copy, Check, Terminal, Activity, Server, Globe, MousePointerClick } from 'lucide-react';

export const DataSources: React.FC = () => {
    const { state } = useApp();
    const { currentAccount } = state;
    const [copied, setCopied] = useState(false);
    const [liveEvents, setLiveEvents] = useState<any[]>([]);
    const [isListening, setIsListening] = useState(true);

    const tagSnippet = `<script async src="https://cdn.chronos.ai/tag.js" data-chronos-id="${currentAccount.id}"></script>`;

    useEffect(() => {
        // Simulate receiving live events from a websocket
        if (!isListening) return;
        const interval = setInterval(() => {
            const event = {
                type: Math.random() > 0.3 ? 'PageView' : 'Click',
                url: `${currentAccount.websiteUrl}/${Math.random().toString(36).substring(7)}`,
                time: new Date().toLocaleTimeString()
            };
            setLiveEvents(prev => [event, ...prev.slice(0, 100)]);
        }, 3000 * (Math.random() + 0.5));

        return () => clearInterval(interval);
    }, [isListening, currentAccount]);


    const handleCopy = () => {
        navigator.clipboard.writeText(tagSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-8">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-chronos-800 rounded-lg"><Server className="w-6 h-6 text-gray-300" /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Data Sources</h2>
                        <p className="text-gray-400">Install the universal tag to start collecting first-party data.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-white">1. Install Your Universal Tag</h3>
                        <p className="text-sm text-gray-400">
                            Place this single snippet in the {'<head>'} of every page on <strong>{currentAccount.websiteUrl}</strong>.
                        </p>
                        <div className="bg-black/50 rounded-lg border border-chronos-800">
                             <div className="flex justify-between items-center px-4 py-2 bg-chronos-950/50">
                                <span className="text-xs text-gray-400 font-mono flex items-center gap-2"><Code className="w-4 h-4" /> HTML Head</span>
                                <button onClick={handleCopy} className="text-xs flex items-center gap-1.5 bg-chronos-800 hover:bg-chronos-700 px-3 py-1.5 rounded">
                                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                            <div className="p-4 overflow-x-auto">
                                <pre className="text-xs font-mono text-green-300 whitespace-pre">{tagSnippet}</pre>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-[400px]">
                        <h3 className="font-semibold text-white mb-4">2. Verify Installation</h3>
                         <div className="flex justify-between items-center bg-chronos-950 border border-b-0 border-chronos-800 rounded-t-lg px-4 py-2">
                            <div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-gray-400" /><span className="text-sm font-mono text-gray-300">Live Event Debugger</span></div>
                            <button onClick={() => setIsListening(!isListening)} className={`text-xs flex items-center gap-1 ${isListening ? 'text-green-400' : 'text-red-400'}`}>
                                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                {isListening ? 'Listening' : 'Paused'}
                            </button>
                         </div>
                         <div className="flex-1 bg-black/50 border border-chronos-800 rounded-b-lg p-4 font-mono text-xs overflow-y-auto space-y-2">
                             {liveEvents.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-600"><Activity className="w-8 h-8 opacity-20 mb-2" /><p>Waiting for first event...</p></div> : 
                             liveEvents.map((event, i) => (
                                 <div key={i} className="flex items-start gap-3">
                                     <span className="text-gray-700">{event.time}</span>
                                     <div className={`flex items-center gap-1.5 ${event.type === 'PageView' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                        {event.type === 'PageView' ? <Globe className="w-3 h-3" /> : <MousePointerClick className="w-3 h-3"/>}
                                        {event.type}
                                     </div>
                                     <span className="text-gray-400 truncate">{event.url}</span>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};