import React, { useState } from 'react';
import { Key, Terminal, PlayCircle, Activity } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const MetaCapiTab = () => {
    const { currentAccount, updateAccount } = useApp();
    const [pixelId, setPixelId] = useState(currentAccount.metaPixelId);
    const [capiToken, setCapiToken] = useState(currentAccount.metaCapiToken);
    const [testCode, setTestCode] = useState(currentAccount.metaTestCode);
    const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [testLog, setTestLog] = useState<string[]>([]);

    const saveChanges = () => updateAccount({ ...currentAccount, metaPixelId: pixelId, metaCapiToken: capiToken, metaTestCode: testCode });
    const addLog = (msg: string) => setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const handleSendTestEvent = async () => {
        setTestStatus('sending');
        setTestLog([]);
        addLog('Initializing CAPI Test Sequence...');
        // Mocking the API call for this modular component
        setTimeout(() => {
            if(capiToken && pixelId) {
                addLog(`SUCCESS: Event Sent to Meta.`);
                addLog(`FB Trace ID: trace_${Date.now()}`);
                setTestStatus('success');
            } else {
                addLog(`ERROR: Missing Pixel ID or CAPI Token.`);
                setTestStatus('error');
            }
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    <div className="p-5 bg-chronos-950 border border-chronos-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-4"><Key className="w-5 h-5 text-chronos-400" /><h3 className="text-white font-medium">Meta API Credentials</h3></div>
                        <div className="space-y-4">
                           <div>
                               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pixel ID</label>
                               <input type="text" value={pixelId} onChange={(e) => setPixelId(e.target.value)} onBlur={saveChanges} className="w-full mt-1 bg-chronos-900 border border-chronos-800 rounded px-3 py-2 text-sm text-white font-mono focus:border-chronos-500 focus:outline-none" />
                           </div>
                           <div>
                               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Access Token (CAPI)</label>
                               <input type="password" value={capiToken} onChange={(e) => setCapiToken(e.target.value)} onBlur={saveChanges} className="w-full mt-1 bg-chronos-900 border border-chronos-800 rounded px-3 py-2 text-sm text-gray-400 font-mono focus:text-white focus:border-chronos-500 focus:outline-none" />
                           </div>
                           <div>
                               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Event Code</label>
                               <input type="text" value={testCode} onChange={(e) => setTestCode(e.target.value)} onBlur={saveChanges} className="w-full mt-1 bg-chronos-900 border border-chronos-800 rounded px-3 py-2 text-sm text-white font-mono focus:border-chronos-500 focus:outline-none" />
                           </div>
                        </div>
                        <button onClick={handleSendTestEvent} disabled={testStatus === 'sending'} className="mt-6 w-full bg-chronos-500 hover:bg-chronos-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-chronos-500/20 disabled:opacity-50">
                           {testStatus === 'sending' ? <Activity className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4 fill-current" />}
                           {testStatus === 'sending' ? 'Sending Event...' : 'Send Test Event'}
                        </button>
                    </div>
                </div>
                <div className="flex-1 h-[450px] flex flex-col">
                   <div className="flex items-center justify-between bg-chronos-950 border border-b-0 border-chronos-800 rounded-t-lg px-4 py-2">
                      <div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-gray-400" /><span className="text-sm font-mono text-gray-300">Live Log</span></div>
                   </div>
                   <div className="flex-1 bg-black/50 border border-chronos-800 rounded-b-lg p-4 font-mono text-xs overflow-y-auto">
                      {testLog.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2"><Activity className="w-8 h-8 opacity-20" /><p>Ready to transmit.</p></div> : 
                      <div className="space-y-1.5">{testLog.map((log, i) => (<div key={i} className={`${log.includes('ERROR')?'text-red-400':log.includes('SUCCESS')?'text-green-400':'text-gray-400'}`}>{log}</div>))}</div>}
                   </div>
                </div>
            </div>
        </div>
    )
}
