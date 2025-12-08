import React, { useState } from 'react';
import { FileText, Terminal, Zap, Activity } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const InstantFormsTab = () => {
    const { currentAccount } = useApp();
    const [leadId, setLeadId] = useState('456921098231');
    const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'success'>('idle');
    const [testLog, setTestLog] = useState<string[]>([]);

    const addLog = (msg: string) => setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const handleInstantFormTrigger = async () => {
        setLeadStatus('sending');
        setTestLog([]);
        addLog('Initializing Instant Forms Lead Event...');
        setTimeout(() => {
            addLog(`Processing Webhook for Lead ID: ${leadId}`);
            addLog('Searching for matches in DB...');
            addLog(`SUCCESS: Lead Event Sent to Meta (Trace: trace_form_${Date.now()})`);
            setLeadStatus('success');
        }, 1200);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg flex gap-3">
                 <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                 <div>
                     <h4 className="text-sm font-bold text-blue-400">Meta Instant Forms (Lead Ads)</h4>
                     <p className="text-xs text-blue-200/70 mt-1">These events happen on Facebook/Instagram. The key identifier is <code>lead_id</code>.</p>
                 </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Simulate CRM Webhook Payload</label>
                    <div className="bg-chronos-950 border border-chronos-800 rounded-lg p-4 font-mono text-xs text-gray-300">
                        <div className="flex gap-2 mb-2"><span className="text-purple-400">"lead_id":</span><input type="text" value={leadId} onChange={(e) => setLeadId(e.target.value)} className="bg-transparent border-b border-gray-700 focus:border-chronos-500 focus:outline-none w-32 text-white" /></div>
                        <div className="flex gap-2 mb-2"><span className="text-purple-400">"form_id":</span><span className="text-green-400">"73829102"</span></div>
                    </div>
                    <button onClick={handleInstantFormTrigger} disabled={leadStatus === 'sending'} className="w-full bg-chronos-500 hover:bg-chronos-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                        {leadStatus === 'sending' ? <Activity className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                        Process CRM Lead Event
                    </button>
                </div>
                <div className="bg-black/50 border border-chronos-800 rounded-lg p-4 font-mono text-xs h-64 overflow-y-auto">
                    {testLog.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-600"><Terminal className="w-8 h-8 opacity-20 mb-2" /><p>Waiting for webhook simulation...</p></div> : 
                    <div className="space-y-1.5">{testLog.map((log, i) => <div key={i} className="text-gray-400 border-l-2 border-chronos-800 pl-2">{log}</div>)}</div>}
                </div>
            </div>
        </div>
    )
}
