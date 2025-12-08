import React, { useState } from 'react';
import { Search, Database, ShieldCheck, Globe, Check, Activity, Server, Zap } from 'lucide-react';
import { MOCK_JOURNEYS } from '../../services/mockData';

export const FunnelCloseTab = () => {
    const [offlineEmail, setOfflineEmail] = useState('');
    const [offlineEvent, setOfflineEvent] = useState('Purchase');
    const [offlineValue, setOfflineValue] = useState('997.00');
    const [simulationStep, setSimulationStep] = useState<'idle' | 'searching' | 'hashing' | 'sending' | 'success'>('idle');
    const [matchedProfile, setMatchedProfile] = useState<any>(null);

    const handleOfflineTrigger = () => {
        setSimulationStep('searching');
        setTimeout(() => {
            const profile = MOCK_JOURNEYS.find(j => j.email.toLowerCase() === offlineEmail.toLowerCase());
            if (profile) {
                setMatchedProfile(profile);
                setSimulationStep('hashing');
                setTimeout(() => setSimulationStep('sending'), 1000);
                setTimeout(() => setSimulationStep('success'), 2500);
            } else {
                alert('No profile found with that email.');
                setSimulationStep('idle');
            }
        }, 1000);
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Offline Event Trigger</h3>
                        <p className="text-sm text-gray-400">Manually fire an event for a user by Email ID for sales closed offline.</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Customer Email</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                <input type="email" placeholder="e.g. s.jenkins@example.com" value={offlineEmail} onChange={(e) => setOfflineEmail(e.target.value)} className="w-full bg-chronos-950 border border-chronos-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-chronos-500 focus:outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Event Type</label>
                                <select value={offlineEvent} onChange={(e) => setOfflineEvent(e.target.value)} className="w-full bg-chronos-950 border border-chronos-800 rounded-lg p-2.5 text-white focus:border-chronos-500 focus:outline-none">
                                    <option>Purchase</option><option>Lead</option><option>Schedule</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Value (USD)</label>
                                <input type="number" value={offlineValue} onChange={(e) => setOfflineValue(e.target.value)} className="w-full bg-chronos-950 border border-chronos-800 rounded-lg p-2.5 text-white focus:border-chronos-500 focus:outline-none" />
                            </div>
                        </div>
                        <button onClick={handleOfflineTrigger} disabled={simulationStep !== 'idle' && simulationStep !== 'success'} className="w-full bg-chronos-500 hover:bg-chronos-600 disabled:bg-chronos-800 disabled:text-gray-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                           {simulationStep !== 'idle' && simulationStep !== 'success' ? <><Activity className="w-4 h-4 animate-spin" /> Processing...</> : <><Zap className="w-4 h-4 fill-current" /> Trigger Server Event</>}
                        </button>
                    </div>
                </div>
                <div className="w-full md:w-1/2">
                    <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-6 h-full relative overflow-hidden">
                        {simulationStep === 'idle' ? <div className="h-full flex flex-col items-center justify-center text-center opacity-40"><Server className="w-16 h-16 text-gray-600 mb-4" /><p className="text-sm text-gray-400">Waiting for input...</p></div> : 
                        <div className="space-y-6">
                            <StepItem status={simulationStep === 'searching' ? 'active' : 'complete'} icon={Database} title="Profile Enrichment" desc={matchedProfile ? `Found: ${matchedProfile.id}` : "Querying User DB..."} />
                            <StepItem status={simulationStep === 'searching' ? 'pending' : simulationStep === 'hashing' ? 'active' : 'complete'} icon={ShieldCheck} title="Parameter Hashing" desc="Hashing em, ph, fn, ln..." />
                            <StepItem status={simulationStep === 'success' || simulationStep === 'sending' ? (simulationStep === 'sending' ? 'active' : 'complete') : 'pending'} icon={Globe} title="Sending to Meta CAPI" desc="Including unhashed fbp, fbc, ip, ua" />
                            {simulationStep === 'success' && <div className="mt-6 p-4 bg-green-900/10 border border-green-500/30 rounded-lg animate-in fade-in"><div className="flex items-center gap-2 text-green-400 font-bold text-sm"><Check className="w-4 h-4" /> Event Sent Successfully</div></div>}
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}

const StepItem = ({ status, icon: Icon, title, desc }: any) => {
    const isPending = status === 'pending', isActive = status === 'active', isComplete = status === 'complete';
    return (
        <div className={`flex gap-4 ${isPending ? 'opacity-30' : 'opacity-100'} transition-opacity`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isActive ? 'border-chronos-500 bg-chronos-500/20 text-chronos-400' : isComplete ? 'border-green-500 bg-green-500 text-white' : 'border-gray-700 bg-gray-800 text-gray-500'}`}><Icon className="w-4 h-4" /></div>
            <div className="flex-1 pt-1"><h4 className={`text-xs font-bold uppercase ${isActive ? 'text-chronos-400' : 'text-gray-300'}`}>{title}</h4><p className="text-xs text-gray-500 mt-1">{desc}</p></div>
        </div>
    );
};
