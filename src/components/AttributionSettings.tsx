import React, { useState, useEffect } from 'react';
import { Database, Save, Check, Facebook, Code, Settings } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const AttributionSettings: React.FC = () => {
  const { state, updateAccount } = useApp();
  const { currentAccount } = state;
  const [localAccount, setLocalAccount] = useState(currentAccount);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalAccount(currentAccount);
  }, [currentAccount]);

  const handleSave = () => {
    updateAccount(localAccount);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, section?: string) => {
    const { name, value } = e.target;
    if (section === 'supabase') {
        setLocalAccount(prev => ({ ...prev, supabaseConfig: { ...prev.supabaseConfig, [name]: value } }));
    } else {
        setLocalAccount(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-8">
         <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-chronos-800 rounded-lg"><Settings className="w-6 h-6 text-gray-300" /></div>
            <div>
              <h2 className="text-2xl font-bold text-white">Integrations & Settings</h2>
              <p className="text-sm text-gray-400">Manage all your external connections and account preferences here.</p>
            </div>
        </div>

        {/* Meta (Facebook) Settings */}
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><Facebook className="w-5 h-5 text-blue-400"/>Meta (Facebook) Ads</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-chronos-950 rounded-lg border border-chronos-800">
                <div>
                    <label className="text-sm font-medium text-gray-300">Pixel ID</label>
                    <input name="metaPixelId" value={localAccount.metaPixelId} onChange={handleInputChange} className="w-full mt-2 bg-chronos-900 p-2 border border-chronos-700 rounded"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300">Conversions API (CAPI) Token</label>
                    <input name="metaCapiToken" type="password" value={localAccount.metaCapiToken} onChange={handleInputChange} className="w-full mt-2 bg-chronos-900 p-2 border border-chronos-700 rounded"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300">Test Event Code</label>
                    <input name="metaTestCode" value={localAccount.metaTestCode} onChange={handleInputChange} className="w-full mt-2 bg-chronos-900 p-2 border border-chronos-700 rounded"/>
                </div>
            </div>
        </div>

        {/* Google Ads Settings */}
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><Code className="w-5 h-5 text-red-400"/>Google Ads</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-chronos-950 rounded-lg border border-chronos-800">
                <div>
                    <label className="text-sm font-medium text-gray-300">Conversion ID</label>
                    <input name="googleConversionId" value={localAccount.googleConversionId} onChange={handleInputChange} className="w-full mt-2 bg-chronos-900 p-2 border border-chronos-700 rounded"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300">Conversion Label</label>
                    <input name="googleConversionLabel" value={localAccount.googleConversionLabel} onChange={handleInputChange} className="w-full mt-2 bg-chronos-900 p-2 border border-chronos-700 rounded"/>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-300">Developer Token</label>
                    <input name="googleDeveloperToken" type="password" value={localAccount.googleDeveloperToken} onChange={handleInputChange} className="w-full mt-2 bg-chronos-900 p-2 border border-chronos-700 rounded"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300">Customer ID</label>
                    <input name="googleCustomerId" value={localAccount.googleCustomerId} onChange={handleInputChange} className="w-full mt-2 bg-chronos-900 p-2 border border-chronos-700 rounded"/>
                </div>
            </div>
        </div>

        {/* Database Settings */}
        <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><Database className="w-5 h-5 text-purple-400"/>Database Connection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-chronos-950 rounded-lg border border-chronos-800">
                 <div>
                    <label className="text-sm font-medium text-gray-300">Supabase Project URL</label>
                    <input name="url" value={localAccount.supabaseConfig.url} onChange={(e) => handleInputChange(e, 'supabase')} className="w-full mt-2 bg-chronos-900 p-2 border border-chronos-700 rounded"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300">Supabase Anon Key</label>
                    <input name="key" type="password" value={localAccount.supabaseConfig.key} onChange={(e) => handleInputChange(e, 'supabase')} className="w-full mt-2 bg-chronos-900 p-2 border border-chronos-700 rounded"/>
                </div>
            </div>
        </div>

        <div className="pt-8 flex justify-end">
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${saved ? 'bg-green-500/20 text-green-400' : 'bg-chronos-500 hover:bg-chronos-600 text-white'}`}
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Settings Saved' : 'Save All Settings'}
            </button>
        </div>
      </div>
    </div>
  );
};
