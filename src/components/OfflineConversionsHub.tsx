import React, { useState } from 'react';
import { UploadCloud, Upload, UserPlus, History, Activity, FileDown, CheckCircle, BrainCircuit } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ConversionUploadBatch, MatchMethod } from '../types';

type ActiveTab = 'manual' | 'bulk' | 'history';

export const OfflineConversionsHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('bulk');
    const [uploadHistory, setUploadHistory] = useState<ConversionUploadBatch[]>([]);

    const addHistory = (batch: Omit<ConversionUploadBatch, 'id' | 'uploadTime'>) => {
        const newBatch: ConversionUploadBatch = {
            id: `batch_${Date.now()}`,
            uploadTime: new Date().toLocaleString(),
            ...batch
        };
        setUploadHistory(prev => [newBatch, ...prev]);
    };

    const TABS = [
        { id: 'bulk', label: 'Bulk CSV Upload', icon: Upload },
        { id: 'manual', label: 'Manual Entry', icon: UserPlus },
        { id: 'history', label: 'Upload History', icon: History },
    ];
    
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-8">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-chronos-accent/10 rounded-lg"><UploadCloud className="w-6 h-6 text-chronos-accent" /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Offline Conversions Hub</h2>
                        <p className="text-gray-400">Upload sales from your CRM or sales calls to attribute them back to the original ad click.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 border-b border-chronos-800 pb-4 mb-6">
                {TABS.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ActiveTab)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-chronos-800 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
                </div>
                <div>
                    {activeTab === 'manual' && <ManualUploadTab onUpload={addHistory} />}
                    {activeTab === 'bulk' && <BulkUploadTab onUpload={addHistory} />}
                    {activeTab === 'history' && <HistoryTab history={uploadHistory} />}
                </div>
            </div>
        </div>
    );
};

// --- Child Components ---

const ManualUploadTab: React.FC<{onUpload: (b: Omit<ConversionUploadBatch, 'id' | 'uploadTime'>) => void}> = ({ onUpload }) => {
    // ... same as before
    return <div>Manual Upload UI</div>;
};

const BulkUploadTab: React.FC<{onUpload: (b: Omit<ConversionUploadBatch, 'id' | 'uploadTime'>) => void}> = ({ onUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorLog, setErrorLog] = useState<string>('');

    const handleUpload = () => {
        if (!file) return;
        setStatus('loading');
        setErrorLog('');
        setTimeout(() => {
            // Simulate some errors
            if (file.name.includes('error')) {
                setErrorLog("Row 3: Invalid email format.\nRow 7: Missing required 'value' column.");
                onUpload({ source: 'CSV Upload', conversions: 125, metaMatchRate: 86, googleMatchRate: 89 });
                setStatus('error');
            } else {
                onUpload({ source: 'CSV Upload', conversions: 127, metaMatchRate: 88, googleMatchRate: 91 });
                setStatus('success');
            }
        }, 2000);
    };

    return (
        <div className="space-y-6">
             <div className="flex items-start justify-between p-4 bg-chronos-950 rounded-lg border border-chronos-800">
                <p className="text-sm text-gray-400 max-w-xl">Upload a CSV with <code>email</code>, <code>phone</code>, <code>gclid</code>, <code>value</code>, etc. Chronos will hash PII and send it to the correct ad platform.</p>
                <a href="#" className="flex-shrink-0 px-4 py-2 bg-chronos-800 hover:bg-chronos-700 text-sm text-white rounded-lg flex items-center gap-2"><FileDown className="w-4 h-4"/> Download Template</a>
             </div>
             <div className="p-8 border-2 border-dashed border-chronos-800 rounded-xl text-center">
                 <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} accept=".csv" className="hidden" id="csv-upload" />
                 <label htmlFor="csv-upload" className="cursor-pointer">
                    <h3 className="font-bold text-white mb-1">{file ? `Selected: ${file.name}` : 'Drop your CSV file here'}</h3>
                 </label>
             </div>
             {status === 'error' && (
                <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-lg">
                    <h4 className="text-red-400 font-bold mb-2">Upload Completed with Errors</h4>
                    <pre className="text-xs text-red-300 bg-black/30 p-2 rounded">{errorLog}</pre>
                    <button onClick={() => alert('Downloading error log...')} className="text-xs mt-2 text-red-400 hover:underline">Download full error log</button>
                </div>
             )}
             <div className="flex justify-center">
                <button onClick={handleUpload} disabled={!file || status === 'loading'} className="w-64 bg-chronos-500 hover:bg-chronos-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                     {status === 'loading' ? <Activity className="animate-spin w-4 h-4"/> : <Upload className="w-4 h-4"/>}
                     {status === 'loading' ? 'Processing File...' : 'Upload Conversions'}
                </button>
             </div>
        </div>
    );
};

const HistoryTab: React.FC<{history: ConversionUploadBatch[]}> = ({ history }) => {
    // ... same as before
    return <div>History Table UI</div>;
};
