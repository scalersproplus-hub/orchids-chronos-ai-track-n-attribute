import React, { useState } from 'react';
import { Megaphone, UploadCloud, Activity } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { MOCK_JOURNEYS } from '../../services/mockData';

export const GoogleAdsTab = () => {
    const { currentAccount, updateAccount } = useApp();
    const [googleConvId, setGoogleConvId] = useState(currentAccount.googleConversionId || '');
    const [googleConvLabel, setGoogleConvLabel] = useState(currentAccount.googleConversionLabel || '');
    const [googleEmail, setGoogleEmail] = useState('');
    const [googleGclid, setGoogleGclid] = useState('');
    const [googleStatus, setGoogleStatus] = useState<'idle' | 'searching' | 'uploading' | 'success'>('idle');
    const [googleLog, setGoogleLog] = useState<any>(null);

    const saveChanges = () => updateAccount({ ...currentAccount, googleConversionId: googleConvId, googleConversionLabel: googleConvLabel });
    
    const handleGoogleLookup = () => {
        setGoogleStatus('searching');
        setTimeout(() => {
            const found = MOCK_JOURNEYS.find(j => j.email.toLowerCase() === googleEmail.toLowerCase());
            if (found && found.gclid) { setGoogleGclid(found.gclid); setGoogleStatus('idle'); } 
            else { alert('No GCLID found for this user.'); setGoogleStatus('idle'); }
        }, 800);
    };

    const handleGoogleUpload = () => {
        setGoogleStatus('uploading');
        const payload = { "conversions": [{ "gclid": googleGclid, "conversion_action": `customers/.../${googleConvId}`, "conversion_value": 497.00 }] };
        setGoogleLog(payload);
        setTimeout(() => setGoogleStatus('success'), 1500);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg flex gap-3">
                 <Megaphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                 <div>
                     <h4 className="text-sm font-bold text-blue-400">Google Ads Offline Conversions</h4>
                     <p className="text-xs text-blue-200/70 mt-1">Use the Google Click ID (gclid) to attribute sales that happen offline.</p>
                 </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="p-5 bg-chronos-950 border border-chronos-800 rounded-lg space-y-4">
                        <h4 className="text-sm font-bold text-white mb-2">1. Configuration</h4>
                        <div>
                           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversion Action ID</label>
                           <input type="text" value={googleConvId} onChange={(e) => setGoogleConvId(e.target.value)} onBlur={saveChanges} placeholder="e.g. 123456789" className="w-full mt-1 bg-chronos-900 border border-chronos-800 rounded px-3 py-2 text-sm text-white font-mono focus:border-chronos-500 focus:outline-none" />
                        </div>
                        <div>
                           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversion Label</label>
                           <input type="text" value={googleConvLabel} onChange={(e) => setGoogleConvLabel(e.target.value)} onBlur={saveChanges} placeholder="e.g. AbC_DeFgHiJkLmNoP" className="w-full mt-1 bg-chronos-900 border border-chronos-800 rounded px-3 py-2 text-sm text-white font-mono focus:border-chronos-500 focus:outline-none" />
                        </div>
                    </div>
                </div>
                <div className="bg-chronos-950 border border-chronos-800 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4"><UploadCloud className="w-5 h-5 text-chronos-400" /><h4 className="font-bold text-white">Manual Conversion Upload</h4></div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Customer Email</label>
                            <div className="flex gap-2">
                                <input type="email" placeholder="s.jenkins@example.com" value={googleEmail} onChange={(e) => setGoogleEmail(e.target.value)} className="flex-1 bg-chronos-900 border border-chronos-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-chronos-500" />
                                <button onClick={handleGoogleLookup} className="px-3 py-2 bg-chronos-800 hover:bg-chronos-700 text-white text-xs rounded transition-colors">{googleStatus === 'searching' ? <Activity className="w-4 h-4 animate-spin"/> : 'Lookup'}</button>
                            </div>
                        </div>
                        {googleGclid && <div className="bg-green-900/10 border border-green-500/20 p-3 rounded"><p className="text-xs text-green-400 font-bold mb-1">GCLID Found:</p><p className="text-[10px] text-green-300 font-mono break-all">{googleGclid}</p></div>}
                        <button onClick={handleGoogleUpload} disabled={!googleGclid || googleStatus === 'uploading' || googleStatus === 'success'} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3 rounded-lg transition-all">{googleStatus === 'uploading' ? 'Uploading...' : 'Upload to Google Ads'}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
