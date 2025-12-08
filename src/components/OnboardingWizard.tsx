import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Check, ArrowRight, BrainCircuit, Globe, Package, Link } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
    const { state, updateAccount, markSetupComplete, addToast } = useApp();
    const { currentAccount } = state;
    const [step, setStep] = useState(1);
    const [localAccount, setLocalAccount] = useState(currentAccount);

    const handleNext = () => {
        updateAccount(localAccount); // Save progress
        if (step < 3) {
            setStep(s => s + 1);
        } else {
            // Finish
            markSetupComplete(currentAccount.id);
            addToast({ type: 'success', message: `Setup complete! Welcome to Chronos AI.` });
        }
    };

    const STEPS = [
        { id: 1, title: "Welcome to Chronos", icon: BrainCircuit },
        { id: 2, title: "Install Your Tag", icon: Package },
        { id: 3, title: "Connect Platforms", icon: Link },
    ];

    return (
        <div className="w-full flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-2xl bg-chronos-900 border border-chronos-800 rounded-xl shadow-2xl">
                <div className="p-6 border-b border-chronos-800">
                    <div className="flex items-center gap-3 mb-4">
                        <BrainCircuit className="w-8 h-8 text-chronos-accent" />
                        <h1 className="text-2xl font-bold text-white">Chronos AI Setup</h1>
                    </div>
                    <div className="flex justify-between items-center">
                        {STEPS.map((s, i) => (
                            <React.Fragment key={s.id}>
                                <div className={`flex items-center gap-2 ${step >= s.id ? 'text-chronos-400' : 'text-gray-600'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step > s.id ? 'bg-green-500 border-green-500 text-white' : step === s.id ? 'border-chronos-500' : 'border-gray-700'}`}>
                                        {step > s.id ? <Check className="w-4 h-4"/> : s.id}
                                    </div>
                                    <span className="hidden md:inline">{s.title}</span>
                                </div>
                                {i < STEPS.length - 1 && <div className={`flex-grow h-0.5 mx-4 ${step > i+1 ? 'bg-green-500' : 'bg-chronos-800'}`}></div>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="p-8">
                    {step === 1 && <Step1 localAccount={localAccount} setLocalAccount={setLocalAccount} />}
                    {step === 2 && <Step2 websiteUrl={localAccount.websiteUrl} />}
                    {step === 3 && <Step3 localAccount={localAccount} setLocalAccount={setLocalAccount} />}
                </div>

                <div className="p-6 bg-chronos-950 rounded-b-xl flex justify-end">
                    <button onClick={handleNext} className="px-6 py-2 bg-chronos-500 hover:bg-chronos-600 text-white font-bold rounded-lg flex items-center gap-2">
                        {step === 3 ? 'Finish Setup' : 'Continue'} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Wizard Steps ---

const Step1 = ({ localAccount, setLocalAccount }: any) => (
    <div className="animate-fade-in">
        <h2 className="text-xl font-bold text-white mb-2">Configure Your Workspace</h2>
        <p className="text-gray-400 mb-6">Let's start with the basics. This helps us tailor the tracking to your business.</p>
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium">Account Name</label>
                <input value={localAccount.name} onChange={e => setLocalAccount({...localAccount, name: e.target.value})} className="w-full mt-2 bg-chronos-800 p-2 border border-chronos-700 rounded" />
            </div>
            <div>
                <label className="text-sm font-medium">Primary Website URL</label>
                <input value={localAccount.websiteUrl} onChange={e => setLocalAccount({...localAccount, websiteUrl: e.target.value})} placeholder="https://yourwebsite.com" className="w-full mt-2 bg-chronos-800 p-2 border border-chronos-700 rounded" />
            </div>
        </div>
    </div>
);

const Step2 = ({ websiteUrl }: any) => (
     <div className="animate-fade-in">
        <h2 className="text-xl font-bold text-white mb-2">Install the Chronos Universal Tag</h2>
        <p className="text-gray-400 mb-6">Place this single snippet in the `<head>` of your website. This is the only code you'll ever need.</p>
        <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-300 border border-chronos-800">
            {`<script async src="https://cdn.chronos.ai/tag.js" data-chronos-id="act_12345"></script>`}
        </div>
        <div className="mt-4 p-4 bg-chronos-800/50 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-sm text-gray-300">Once installed, we'll listen for events on <strong>{websiteUrl}</strong>. You can verify this in the "Data Sources" view later.</p>
        </div>
    </div>
);

const Step3 = ({ localAccount, setLocalAccount }: any) => (
    <div className="animate-fade-in">
        <h2 className="text-xl font-bold text-white mb-2">Connect Your Ad Platforms</h2>
        <p className="text-gray-400 mb-6">Provide API credentials to enable server-side tracking and attribute offline sales.</p>
        <div className="space-y-4">
             <div>
                <label className="text-sm font-medium">Meta (Facebook) CAPI Token</label>
                <input type="password" value={localAccount.metaCapiToken} onChange={e => setLocalAccount({...localAccount, metaCapiToken: e.target.value})} className="w-full mt-2 bg-chronos-800 p-2 border border-chronos-700 rounded" />
            </div>
             <div>
                <label className="text-sm font-medium">Google Ads Conversion ID</label>
                <input value={localAccount.googleConversionId} onChange={e => setLocalAccount({...localAccount, googleConversionId: e.target.value})} className="w-full mt-2 bg-chronos-800 p-2 border border-chronos-700 rounded" />
            </div>
        </div>
    </div>
);
