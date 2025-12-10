import React, { useState } from 'react';
import { Copy, Check, Activity, MousePointerClick, Code, Shield, AlertTriangle, Zap, Eye, Bot, Globe, Fingerprint } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

declare global {
  interface Window { 
    fbq: any;
    _fbq: any;
    chronos: any;
  }
}

export const BrowserPixelTab = () => {
    const { currentAccount, updateAccount } = useApp();
    const [copied, setCopied] = useState(false);
    const [pixelStatus, setPixelStatus] = useState<'unloaded' | 'loaded'>('unloaded');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [enableSessionReplay, setEnableSessionReplay] = useState(false);
    const [enableDebug, setEnableDebug] = useState(false);
    
    const pixelId = currentAccount.id || 'YOUR_PIXEL_ID';
    const apiBase = currentAccount.trackingDomain || window.location.origin;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(generateInstallCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const injectPixel = () => {
        if (window.chronos) return;
        
        const script = document.createElement('script');
        script.async = true;
        script.src = '/chronos-pixel.js';
        script.setAttribute('data-pixel-id', pixelId);
        script.setAttribute('data-api', apiBase);
        if (enableSessionReplay) script.setAttribute('data-session-replay', 'true');
        if (enableDebug) script.setAttribute('data-debug', 'true');
        document.head.appendChild(script);
        
        script.onload = () => {
            setPixelStatus('loaded');
        };
    };

    const fireTestEvent = (eventName: string) => {
        if (window.chronos) {
            window.chronos.track(eventName, { test: true, timestamp: Date.now() });
            console.log(`[Chronos Test] Event '${eventName}' fired`);
        } else {
            console.warn('Chronos Pixel not loaded. Click "Inject Pixel" first.');
        }
    };

    const generateInstallCode = () => {
        const replayAttr = enableSessionReplay ? '\n  data-session-replay="true"' : '';
        const debugAttr = enableDebug ? '\n  data-debug="true"' : '';
        
        return `<!-- Chronos Hyper-Pixel v2.0 -->
<script
  async
  src="${apiBase}/chronos-pixel.js"
  data-pixel-id="${pixelId}"${replayAttr}${debugAttr}
></script>
<noscript>
  <img
    alt=""
    height="1"
    width="1"
    style="display:none"
    src="${apiBase}/api/pixel/events?pixel_id=${pixelId}&ev=PageView&noscript=1"
  />
</noscript>
<!-- End Chronos Hyper-Pixel -->`;
    };

    const features = [
        { icon: Shield, label: '100% First-Party', desc: 'No third-party domains' },
        { icon: Bot, label: 'Ad-Blocker Resistant', desc: 'Bypasses common blockers' },
        { icon: Fingerprint, label: 'Cookieless Tracking', desc: '11+ fingerprint signals' },
        { icon: Eye, label: 'Session Replay', desc: 'User interaction recording' },
        { icon: Globe, label: 'Cross-Domain', desc: 'Track across your domains' },
        { icon: Zap, label: 'Real-Time', desc: 'Instant event processing' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-chronos-900 to-chronos-950 border border-chronos-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-chronos-500/20 rounded-lg">
                        <Code className="w-6 h-6 text-chronos-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Chronos Hyper-Pixel Installation Code</h2>
                        <p className="text-gray-400 text-sm">Install this code once on your website to enable event tracking</p>
                    </div>
                </div>
            </div>

            <div className="bg-chronos-950/80 border border-chronos-800 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-chronos-800">
                    <h3 className="text-white font-semibold mb-3">Implementation Steps</h3>
                    <ol className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                            <span className="bg-chronos-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                            Copy the Chronos Pixel code snippet below
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-chronos-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                            Paste it into your website's HTML, ideally before the closing <code className="bg-chronos-800 px-1 rounded">&lt;/head&gt;</code> tag
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-chronos-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                            This only needs to be installed once per website
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-chronos-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                            After installation, you can use <code className="bg-chronos-800 px-1 rounded">chronos.track()</code> for custom events
                        </li>
                    </ol>
                </div>

                <div className="relative">
                    <div className="flex items-center justify-between px-4 py-2 bg-chronos-900 border-b border-chronos-800">
                        <span className="text-xs text-gray-500 font-mono">HTML</span>
                        <button 
                            onClick={handleCopy} 
                            className="flex items-center gap-1.5 text-xs bg-chronos-800 hover:bg-chronos-700 text-white px-3 py-1.5 rounded-md transition-colors"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied!' : 'Copy Code'}
                        </button>
                    </div>
                    <div className="p-4 bg-[#0d1117] overflow-x-auto">
                        <pre className="text-sm font-mono text-blue-300 whitespace-pre">{generateInstallCode()}</pre>
                    </div>
                </div>

                <div className="p-4 border-t border-chronos-800 bg-chronos-900/50">
                    <p className="text-xs text-gray-500">
                        <strong className="text-gray-400">Note:</strong> This pixel is uniquely tied to your account. 
                        Keep your Pixel ID (<code className="text-chronos-400">{pixelId}</code>) secure.
                    </p>
                </div>
            </div>

            <div className="bg-chronos-950/50 border border-chronos-800 rounded-xl p-5">
                <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h3 className="text-white font-semibold">Advanced Options</h3>
                    <span className="text-gray-500 text-sm">{showAdvanced ? 'Hide' : 'Show'}</span>
                </button>
                
                {showAdvanced && (
                    <div className="mt-4 space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enableSessionReplay}
                                onChange={(e) => setEnableSessionReplay(e.target.checked)}
                                className="w-4 h-4 rounded border-chronos-700 bg-chronos-900 text-chronos-500 focus:ring-chronos-500"
                            />
                            <div>
                                <span className="text-white text-sm font-medium">Enable Session Replay</span>
                                <p className="text-gray-500 text-xs">Record user clicks, scrolls, and interactions</p>
                            </div>
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enableDebug}
                                onChange={(e) => setEnableDebug(e.target.checked)}
                                className="w-4 h-4 rounded border-chronos-700 bg-chronos-900 text-chronos-500 focus:ring-chronos-500"
                            />
                            <div>
                                <span className="text-white text-sm font-medium">Enable Debug Mode</span>
                                <p className="text-gray-500 text-xs">Log all events to browser console</p>
                            </div>
                        </label>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {features.map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="bg-chronos-950/50 border border-chronos-800 rounded-lg p-3">
                        <Icon className="w-5 h-5 text-chronos-400 mb-2" />
                        <p className="text-white text-sm font-medium">{label}</p>
                        <p className="text-gray-500 text-xs">{desc}</p>
                    </div>
                ))}
            </div>

            <div className="bg-chronos-950 border border-chronos-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-chronos-400" />
                        Test Pixel Events
                    </h3>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Status:</span>
                        {pixelStatus === 'loaded' ? (
                            <span className="text-green-400 font-medium flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Active
                            </span>
                        ) : (
                            <span className="text-gray-500">Not loaded</span>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button 
                        onClick={injectPixel} 
                        disabled={pixelStatus === 'loaded'}
                        className="px-4 py-2.5 bg-chronos-900 hover:bg-chronos-800 disabled:opacity-50 disabled:cursor-not-allowed border border-chronos-700 rounded-lg text-sm text-white font-medium transition-all"
                    >
                        Inject Pixel
                    </button>
                    <button 
                        onClick={() => fireTestEvent('PageView')}
                        className="px-4 py-2.5 bg-chronos-500 hover:bg-chronos-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <MousePointerClick className="w-4 h-4" />
                        PageView
                    </button>
                    <button 
                        onClick={() => fireTestEvent('Lead')}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all"
                    >
                        Lead
                    </button>
                    <button 
                        onClick={() => fireTestEvent('Purchase')}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all"
                    >
                        Purchase
                    </button>
                </div>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-amber-300 font-medium text-sm">Event Tracking Methods</p>
                        <div className="mt-2 space-y-1 text-xs text-amber-200/80 font-mono">
                            <p><code>chronos.track('EventName', {`{data}`})</code> - Custom event</p>
                            <p><code>chronos.purchase({`{value: 99.99, currency: 'USD'}`})</code> - Purchase</p>
                            <p><code>chronos.lead({`{email: 'user@example.com'}`})</code> - Lead</p>
                            <p><code>chronos.identify({`{email, phone, name}`})</code> - User ID</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};