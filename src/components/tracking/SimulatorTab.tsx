import React, { useState } from 'react';
import { PlayCircle, Terminal, Database, Activity, Check, AlertCircle, Save, MousePointer2, Globe, Clock, CreditCard, Search, Server, Fingerprint } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { MOCK_JOURNEYS } from '../../services/mockData';
import { createSupabaseService } from '../../services/supabaseService';
import { createMetaCapiService } from '../../services/metaCapiService';

export const SimulatorTab = () => {
    const { currentAccount, supabaseConfig, updateSupabaseConfig } = useApp();
    
    // Simulator State
    const [simStep, setSimStep] = useState(0);
    const [simLogs, setSimLogs] = useState<{time: string, msg: string, type: string, payload?: any}[]>([]);
    const [dbConnectionStatus, setDbConnectionStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
    const [isEditingDb, setIsEditingDb] = useState(false);
    const [tempDbConfig, setTempDbConfig] = useState(supabaseConfig);
    const [testCode, setTestCode] = useState(currentAccount.metaTestCode || '');

    const addSimLog = (msg: string, type: 'info' | 'success' | 'data' | 'error' = 'info', payload?: any) => {
        setSimLogs(prev => [...prev, { time: new Date().toLocaleTimeString().split(' ')[0], msg, type, payload }]);
    };
    
    const checkSupabaseConnection = async () => {
        setDbConnectionStatus('checking');
        addSimLog('Testing Supabase connection...', 'info');
        
        const supabase = createSupabaseService(supabaseConfig);
        const result = await supabase.testConnection();
        
        if (result.success) {
            setDbConnectionStatus('success');
            addSimLog('✅ Database connected successfully!', 'success');
            
            // Try to insert a test lead
            const testResult = await supabase.insertLead({
                email: `test_${Date.now()}@chronos.ai`,
                first_name: 'Test',
                last_name: 'User',
                city: 'San Francisco',
                state: 'CA',
                country: 'US'
            });
            
            if (testResult.success) {
                addSimLog('✅ Test lead inserted successfully!', 'success');
            } else {
                addSimLog(`⚠️ Insert test failed: ${testResult.error}`, 'error');
            }
        } else {
            setDbConnectionStatus('error');
            addSimLog(`❌ Connection failed: ${result.error}`, 'error');
        }
    };

    const handleSaveDbConfig = () => {
        updateSupabaseConfig(tempDbConfig);
        setIsEditingDb(false);
        addSimLog('Database config saved', 'success');
    };
  
    const runSimulation = async () => {
        setSimStep(0);
        setSimLogs([]);
        addSimLog(`🚀 Initializing Full Funnel Simulator...`, 'info');
        
        const profile = MOCK_JOURNEYS.find(j => j.customerName === 'Alex Rivera') || MOCK_JOURNEYS[0];
        
        // Step 1
        setTimeout(() => {
            setSimStep(1);
            addSimLog('📱 User clicks Ad on Mobile', 'info');
        }, 500);
        
        // Step 2
        setTimeout(() => {
            setSimStep(2);
            addSimLog('🌐 Browser Pixel Fires: PageView (No Cookies)', 'success');
        }, 1500);
        
        // Step 3
        setTimeout(() => {
            setSimStep(3);
            addSimLog(`🔐 Server generates Fingerprint ID: ${profile.chronosFingerprintId.slice(0, 20)}...`, 'info');
        }, 2500);
        
        // Step 4
        setTimeout(() => {
            setSimStep(4);
            addSimLog('⏰ --- 14 DAYS LATER (on Desktop) ---', 'info');
        }, 4000);
        
        // Step 5
        setTimeout(() => {
            setSimStep(5);
            addSimLog('💳 Offline Event: "Purchase" ($75.50)', 'info');
        }, 5000);
        
        // Step 6
        setTimeout(() => {
            setSimStep(6);
            addSimLog('🧠 MATCHED: AI Identity Graph links Mobile & Desktop via Fingerprint!', 'success');
        }, 6500);
        
        // Step 7 - REAL API CALL
        setTimeout(async () => {
            setSimStep(7);
            addSimLog(`📤 Sending REAL CAPI Event to Meta (Test Code: ${testCode || 'none'})...`, 'info');
            
            // Create Meta CAPI service
            const metaService = createMetaCapiService({
                pixelId: currentAccount.metaPixelId,
                accessToken: currentAccount.metaCapiToken,
                testEventCode: testCode
            });
            
            // Send real event
            const result = await metaService.sendEvent({
                eventName: 'Purchase',
                userData: {
                    email: profile.email,
                    phone: profile.phone,
                    ipAddress: profile.ipAddress,
                    userAgent: profile.userAgent,
                    fbc: profile.fbc,
                    fbp: profile.fbp,
                    externalId: profile.id
                },
                customData: {
                    value: 75.50,
                    currency: 'USD'
                },
                eventSourceUrl: currentAccount.websiteUrl || 'https://chronos-demo.io'
            });
            
            if (result.success) {
                addSimLog(`✅ Meta Accepted Event!`, 'success', result.data);
                if (result.data?.events_received) {
                    addSimLog(`📊 Events Received: ${result.data.events_received}`, 'success');
                }
                if (result.data?.fbtrace_id) {
                    addSimLog(`🔍 FB Trace ID: ${result.data.fbtrace_id}`, 'success');
                }
            } else {
                addSimLog(`❌ Meta Rejected: ${result.error}`, 'error', result);
            }
        }, 8000);
    };
  
    return (
        <div className="animate-fade-in space-y-8">
            {/* Database Config Section */}
            <div className="bg-chronos-900 border border-chronos-800 rounded-lg p-5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                    <Database className="w-4 h-4 text-purple-400" /> Real Database Check
                </h4>
                <p className="text-xs text-gray-400 mb-4">
                    This tool will attempt to INSERT a test lead into your connected Supabase project.
                </p>
                
                {isEditingDb ? (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500">Supabase URL</label>
                            <input 
                                type="text"
                                value={tempDbConfig.url}
                                onChange={(e) => setTempDbConfig({...tempDbConfig, url: e.target.value})}
                                className="w-full bg-chronos-950 border border-chronos-800 rounded px-3 py-2 text-sm text-white font-mono"
                                placeholder="https://xxxxx.supabase.co"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Supabase Anon Key</label>
                            <input 
                                type="password"
                                value={tempDbConfig.key}
                                onChange={(e) => setTempDbConfig({...tempDbConfig, key: e.target.value})}
                                className="w-full bg-chronos-950 border border-chronos-800 rounded px-3 py-2 text-sm text-white font-mono"
                                placeholder="eyJhbGc..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleSaveDbConfig}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded flex items-center gap-2"
                            >
                                <Save className="w-3 h-3"/> Save Config
                            </button>
                            <button 
                                onClick={() => setIsEditingDb(false)}
                                className="px-4 py-2 bg-chronos-800 hover:bg-chronos-700 text-white text-xs rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={checkSupabaseConnection} 
                            disabled={dbConnectionStatus === 'checking'} 
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-chronos-800 disabled:text-gray-500 text-white text-xs font-bold rounded transition-colors flex items-center gap-2"
                        >
                            {dbConnectionStatus === 'checking' ? <Activity className="w-3 h-3 animate-spin"/> : 'Test Permissions'}
                        </button>
                        <button 
                            onClick={() => setIsEditingDb(true)}
                            className="px-4 py-2 bg-chronos-800 hover:bg-chronos-700 text-white text-xs rounded"
                        >
                            Edit Config
                        </button>
                        {dbConnectionStatus === 'success' && (
                            <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                                <Check className="w-3 h-3"/> Connected & Writable
                            </span>
                        )}
                        {dbConnectionStatus === 'error' && (
                            <span className="text-red-400 text-xs font-bold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3"/> Connection Failed
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Timeline */}
                <div className="bg-chronos-900 border border-chronos-800 rounded-lg p-6 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h3 className="text-lg font-bold text-white">Cross-Device Funnel</h3>
                        <div className="flex items-center gap-2">
                             <input 
                                type="text" 
                                value={testCode} 
                                onChange={(e) => setTestCode(e.target.value)} 
                                placeholder="TESTxxxxx" 
                                className="w-28 bg-chronos-900 border border-chronos-800 rounded px-2 py-2 text-xs text-white font-mono focus:border-chronos-500 focus:outline-none" 
                            />
                             <button 
                                onClick={runSimulation} 
                                className="px-4 py-2 bg-chronos-500 hover:bg-chronos-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
                            >
                                 <PlayCircle className="w-4 h-4 fill-current" /> Run Simulation
                             </button>
                        </div>
                    </div>

                    <div className="space-y-6 relative pl-4">
                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-chronos-800 z-0"></div>
                        <TimelineStep step={1} current={simStep} icon={MousePointer2} title="Ad Click & Visit (Mobile)" desc="Capture IP, User Agent" />
                        <TimelineStep step={2} current={simStep} icon={Globe} title="Pixel Fire (Browser)" desc="Standard PageView event" />
                        <TimelineStep step={3} current={simStep} icon={Fingerprint} title="Server-Side Fingerprinting" desc="Generate stable device ID" />
                        <TimelineStep step={4} current={simStep} icon={Clock} title="Time Decay (14 Days)" desc="User goes offline, switches device" />
                        <TimelineStep step={5} current={simStep} icon={CreditCard} title="Purchase (Desktop)" desc="User converts on a new device" />
                        <TimelineStep step={6} current={simStep} icon={Search} title="AI Attribution Match" desc="Identity Graph links Fingerprints" />
                        <TimelineStep step={7} current={simStep} icon={Server} title="CAPI Conversion Sent" desc="Send unified data to Meta" />
                    </div>
                </div>

                {/* Logs */}
                <div className="space-y-6">
                    <div className="bg-black/80 border border-chronos-800 rounded-lg p-4 font-mono text-xs h-[500px] overflow-y-auto flex flex-col-reverse shadow-inner">
                        {simLogs.length === 0 ? (
                            <div className="text-gray-600 flex flex-col items-center justify-center h-full">
                                <Terminal className="w-8 h-8 mb-2 opacity-50" />
                                <span>Waiting to start...</span>
                            </div>
                        ) : 
                            simLogs.map((log, i) => (
                                <div key={i} className={`mb-1.5 pb-1.5 border-b border-gray-900 last:border-0 ${
                                    log.type === 'success' ? 'text-green-400' : 
                                    log.type === 'data' ? 'text-blue-300' : 
                                    log.type === 'error' ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                    <div className="flex items-start justify-between">
                                        <span>
                                            <span className="text-gray-600 mr-2">[{log.time}]</span>
                                            {log.msg}
                                        </span>
                                    </div>
                                    {log.payload && (
                                        <details className="mt-1">
                                            <summary className="cursor-pointer text-gray-500 hover:text-white text-[10px]">
                                                View Payload
                                            </summary>
                                            <pre className="mt-2 p-2 bg-gray-900 rounded text-[9px] text-green-300 overflow-x-auto whitespace-pre-wrap border border-gray-800">
                                                {JSON.stringify(log.payload, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
};

const TimelineStep = ({ step, current, icon: Icon, title, desc }: any) => {
    const isPast = current > step;
    const isCurrent = current === step;
    
    return (
        <div className={`flex items-start gap-4 relative z-10 transition-all duration-300 ${current < step ? 'opacity-30 grayscale' : 'opacity-100'}`}>
            <div className={`w-14 h-14 rounded-xl border flex items-center justify-center shadow-xl transition-all duration-500 ${
                isCurrent ? 'bg-chronos-500 border-white text-white scale-110 shadow-chronos-500/50' : 
                isPast ? 'bg-chronos-900 border-green-500 text-green-500' : 'bg-chronos-950 border-chronos-800 text-gray-600'
            }`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="pt-2">
                <h4 className={`font-bold ${isCurrent ? 'text-white' : 'text-gray-400'}`}>{title}</h4>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
        </div>
    );
};