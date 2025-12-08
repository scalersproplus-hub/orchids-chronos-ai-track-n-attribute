import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Code, Copy, Check, Server, Fingerprint, Shield, Zap, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { LiveEventsPreview } from './tracking/LiveEventsPreview';

export const DataSources: React.FC = () => {
    const { state, addToast } = useApp();
    const { currentAccount } = state;
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'install' | 'verify' | 'advanced'>('install');

    const tagSnippet = `<script async src="https://cdn.chronos.ai/tag.js" data-chronos-id="${currentAccount.id}"></script>`;

    const advancedSnippet = `<!-- Chronos AI Universal Tag -->
<script>
  (function(w,d,s,l,i){
    w[l]=w[l]||[];
    w[l].push({'chronos.start': new Date().getTime(), event:'chronos.js'});
    var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='chronosLayer'?'&l='+l:'';
    j.async=true;
    j.src='https://cdn.chronos.ai/tag.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','chronosLayer','${currentAccount.id}');
</script>
<!-- End Chronos AI -->`;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        addToast({ type: 'success', message: 'Copied to clipboard!' });
        setTimeout(() => setCopied(false), 2000);
    };

    const FEATURES = [
        { icon: Fingerprint, title: 'Device Fingerprinting', desc: 'Track users across sessions without cookies' },
        { icon: Shield, title: 'Ad Blocker Bypass', desc: 'First-party domain ensures reliable tracking' },
        { icon: Zap, title: 'Real-time Events', desc: 'Sub-second event capture and processing' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-chronos-900 to-chronos-900/50 border border-chronos-800 rounded-xl p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-chronos-500 to-chronos-accent rounded-xl">
                            <Server className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Data Sources & Tracking</h2>
                            <p className="text-gray-400 mt-1">Install the universal tag to capture cookieless, first-party data</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-green-400 font-medium">Tag Active</span>
                    </div>
                </div>

                {/* Feature Pills */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {FEATURES.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-chronos-950/50 rounded-lg border border-chronos-800">
                            <feature.icon className="w-5 h-5 text-chronos-400" />
                            <div>
                                <div className="text-sm font-medium text-white">{feature.title}</div>
                                <div className="text-xs text-gray-500">{feature.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Installation Panel */}
                <div className="bg-chronos-900 border border-chronos-800 rounded-xl overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-chronos-800">
                        {[
                            { id: 'install', label: 'Quick Install' },
                            { id: 'advanced', label: 'Advanced' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'text-chronos-400 border-b-2 border-chronos-500 bg-chronos-950'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {activeTab === 'install' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-chronos-500 text-white text-xs flex items-center justify-center font-bold">1</div>
                                    <h3 className="font-semibold text-white">Add to your website</h3>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Place this snippet in the <code className="px-1.5 py-0.5 bg-chronos-800 rounded text-chronos-400">&lt;head&gt;</code> of every page on <strong className="text-white">{currentAccount.websiteUrl || 'your website'}</strong>.
                                </p>
                                <div className="bg-black/50 rounded-lg border border-chronos-800 overflow-hidden">
                                    <div className="flex justify-between items-center px-4 py-2 bg-chronos-950/50 border-b border-chronos-800">
                                        <span className="text-xs text-gray-400 font-mono flex items-center gap-2">
                                            <Code className="w-4 h-4" /> HTML Head
                                        </span>
                                        <button 
                                            onClick={() => handleCopy(tagSnippet)} 
                                            className="text-xs flex items-center gap-1.5 bg-chronos-700 hover:bg-chronos-600 px-3 py-1.5 rounded transition-all"
                                        >
                                            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} 
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="p-4 overflow-x-auto">
                                        <pre className="text-sm font-mono text-green-300 whitespace-pre-wrap">{tagSnippet}</pre>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4">
                                    <div className="w-6 h-6 rounded-full bg-chronos-500 text-white text-xs flex items-center justify-center font-bold">2</div>
                                    <h3 className="font-semibold text-white">Verify installation</h3>
                                </div>
                                <p className="text-sm text-gray-400">
                                    After adding the tag, events will appear in the live stream. Visit your website to test.
                                </p>

                                <div className="p-4 bg-chronos-950 rounded-lg border border-chronos-800 mt-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                                        <div>
                                            <div className="font-medium text-white">What gets tracked automatically</div>
                                            <ul className="text-sm text-gray-400 mt-2 space-y-1">
                                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Page views & scroll depth</li>
                                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Button clicks & form submissions</li>
                                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> E-commerce events (add to cart, purchase)</li>
                                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Device fingerprint for cross-session identity</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'advanced' && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-white">Advanced Installation</h3>
                                <p className="text-sm text-gray-400">
                                    Use this snippet for more control over data layer events and custom integrations.
                                </p>
                                <div className="bg-black/50 rounded-lg border border-chronos-800 overflow-hidden">
                                    <div className="flex justify-between items-center px-4 py-2 bg-chronos-950/50 border-b border-chronos-800">
                                        <span className="text-xs text-gray-400 font-mono flex items-center gap-2">
                                            <Code className="w-4 h-4" /> Advanced Tag
                                        </span>
                                        <button 
                                            onClick={() => handleCopy(advancedSnippet)} 
                                            className="text-xs flex items-center gap-1.5 bg-chronos-700 hover:bg-chronos-600 px-3 py-1.5 rounded transition-all"
                                        >
                                            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} 
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="p-4 overflow-x-auto max-h-64">
                                        <pre className="text-xs font-mono text-green-300 whitespace-pre">{advancedSnippet}</pre>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                                    <div className="flex items-start gap-3">
                                        <ExternalLink className="w-5 h-5 text-blue-400 mt-0.5" />
                                        <div>
                                            <div className="font-medium text-white">Custom Event Tracking</div>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Push custom events using: <code className="px-1.5 py-0.5 bg-chronos-800 rounded text-chronos-400 text-xs">chronosLayer.push({'{"event": "custom_event"}'});</code>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Events Preview */}
                <LiveEventsPreview />
            </div>
        </div>
    );
};