import React, { useState } from 'react';
import { Copy, Check, Activity, MousePointerClick, Code, Shield, AlertTriangle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

declare global {
  interface Window { 
    fbq: any;
    _fbq: any;
    chronos: any;
  }
}

export const BrowserPixelTab = () => {
    const { currentAccount, updateAccount, setCurrentView } = useApp();
    const [pixelId, setPixelId] = useState(currentAccount.metaPixelId);
    const [copied, setCopied] = useState(false);
    const [pixelStatus, setPixelStatus] = useState<'unloaded' | 'loaded'>('unloaded');
    
    const hasFirstPartyDomain = !!currentAccount.trackingDomain;
    
    const saveChanges = () => updateAccount({ ...currentAccount, metaPixelId: pixelId });
    
    const handleCopy = () => {
        navigator.clipboard.writeText(generateScript(pixelId));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const injectPixel = () => {
        if (window.fbq) return;
        
        if (hasFirstPartyDomain) {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://${currentAccount.trackingDomain}/chronos.js?id=${currentAccount.id}`;
            document.head.appendChild(script);
            
            window.chronos = window.chronos || function(...args: any[]) {
                (window.chronos.q = window.chronos.q || []).push(args);
            };
            window.chronos('init', currentAccount.id, {
                domain: currentAccount.trackingDomain,
                pixelId: pixelId,
                firstParty: true
            });
            setPixelStatus('loaded');
        } else {
            (function(f: any,b: any,e: any,v: any,n?: any,t?: any,s?: any){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})
            (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
            window.fbq('init', pixelId);
            window.fbq('track', 'PageView');
            setPixelStatus('loaded');
        }
    };

    const fireBrowserEvent = (eventName: string) => {
        if (hasFirstPartyDomain && window.chronos) {
            window.chronos('track', eventName);
            alert(`Event '${eventName}' fired via first-party domain!`);
        } else if (window.fbq) {
            window.fbq('track', eventName);
            alert(`Event '${eventName}' fired! Check Meta Pixel Helper.`);
        } else {
            alert('Pixel not loaded. Click "Inject Pixel" first.');
        }
    };

    const generateScript = (id: string) => {
        if (hasFirstPartyDomain) {
            return `<!-- Chronos First-Party Tracking -->
<script>
(function(w,d,s,l,i){
  w[l]=w[l]||[];
  var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s);
  j.async=true;
  j.src='https://${currentAccount.trackingDomain}/chronos.js?id='+i;
  j.setAttribute('data-domain','${currentAccount.trackingDomain}');
  f.parentNode.insertBefore(j,f);
  w.chronos=w.chronos||function(){(w.chronos.q=w.chronos.q||[]).push(arguments)};
  w.chronos('init', i, {
    domain: '${currentAccount.trackingDomain}',
    pixelId: '${id}',
    firstParty: true
  });
})(window,document,'script','chronosLayer','${currentAccount.id}');
</script>`;
        }
        
        return `<!-- Chronos AI Universal Pixel (CDN) -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1"/></noscript>`;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {!hasFirstPartyDomain && (
                <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-amber-300 font-medium text-sm">CDN-based tracking is less reliable</p>
                        <p className="text-amber-200/70 text-xs mt-1">
                            Ad blockers can block connect.facebook.net. Set up a first-party domain for better tracking.
                        </p>
                        <button 
                            onClick={() => setCurrentView && (window as any).__setTrackingTab?.('domain')}
                            className="mt-2 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                            <Shield className="w-3 h-3" />
                            Configure First-Party Domain
                        </button>
                    </div>
                </div>
            )}
            
            {hasFirstPartyDomain && (
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-emerald-300 font-medium text-sm">First-Party Domain Active</p>
                        <p className="text-emerald-200/70 text-xs mt-1">
                            Tracking via <span className="font-mono">{currentAccount.trackingDomain}</span> - bypasses ad blockers
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-chronos-950 border border-chronos-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-chronos-400" /> Test Browser Events
                    </h3>
                    <div className="text-xs flex items-center gap-2">
                        <span className="text-gray-500">Status:</span>
                        {pixelStatus === 'loaded' ? <span className="text-green-400 font-bold flex items-center gap-1"><Check className="w-3 h-3"/> Pixel Initialized</span> : <span className="text-gray-500 font-bold">Unloaded</span>}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button onClick={injectPixel} disabled={pixelStatus === 'loaded'} className="px-4 py-3 bg-chronos-900 hover:bg-chronos-800 disabled:opacity-50 border border-chronos-700 rounded-lg text-sm text-white font-medium transition-all">1. Inject Pixel</button>
                     <button onClick={() => fireBrowserEvent('PageView')} className="px-4 py-3 bg-chronos-500 hover:bg-chronos-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-chronos-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"><MousePointerClick className="w-4 h-4" /> Fire PageView</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Chronos Pixel ID</label>
                    <input type="text" value={pixelId} onChange={(e) => setPixelId(e.target.value)} onBlur={saveChanges} className="w-full bg-chronos-950 border border-chronos-800 rounded-lg p-3 text-white font-mono focus:border-chronos-500 focus:outline-none transition-colors" />
                </div>
                <div className="bg-chronos-950/50 rounded-lg p-4 border border-chronos-800">
                     <div className="flex justify-between items-center px-4 py-3 bg-chronos-900 border-b border-chronos-800 rounded-t-lg">
                        <span className="text-xs text-gray-400 font-mono flex items-center gap-2">
                            <Code className="w-3 h-3" /> 
                            {hasFirstPartyDomain ? 'First-Party Script' : 'CDN Script'}
                        </span>
                        <button onClick={handleCopy} className="text-xs flex items-center gap-1.5 bg-chronos-800 hover:bg-chronos-700 px-3 py-1.5 rounded transition-all text-gray-200">{copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}</button>
                    </div>
                    <div className="p-5 overflow-x-auto bg-black rounded-b-lg">
                        <pre className={`text-xs font-mono whitespace-pre ${hasFirstPartyDomain ? 'text-emerald-400' : 'text-blue-300'}`}>{generateScript(pixelId)}</pre>
                    </div>
                </div>
            </div>
        </div>
    )
}