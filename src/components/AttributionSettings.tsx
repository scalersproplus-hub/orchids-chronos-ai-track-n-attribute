import React, { useState, useEffect } from 'react';
import { Database, Save, Check, Facebook, Code, Settings, TestTube2, Loader2, CheckCircle, XCircle, Zap, Globe, Key, RefreshCw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface ConnectionStatus {
  meta: 'idle' | 'testing' | 'success' | 'error';
  google: 'idle' | 'testing' | 'success' | 'error';
  supabase: 'idle' | 'testing' | 'success' | 'error';
}

export const AttributionSettings: React.FC = () => {
  const { state, updateAccount, addToast } = useApp();
  const { currentAccount } = state;
  const [localAccount, setLocalAccount] = useState(currentAccount);
  const [saved, setSaved] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    meta: 'idle',
    google: 'idle',
    supabase: 'idle'
  });

  useEffect(() => {
    setLocalAccount(currentAccount);
  }, [currentAccount]);

  const handleSave = () => {
    updateAccount(localAccount);
    setSaved(true);
    addToast({ type: 'success', message: 'Settings saved successfully!' });
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

  const testConnection = async (platform: 'meta' | 'google' | 'supabase') => {
    setConnectionStatus(prev => ({ ...prev, [platform]: 'testing' }));
    
    // Simulate API test - in production, this would make actual API calls
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if credentials are provided
    let success = false;
    if (platform === 'meta') {
      success = !!(localAccount.metaPixelId && localAccount.metaCapiToken);
    } else if (platform === 'google') {
      success = !!(localAccount.googleConversionId && localAccount.googleDeveloperToken);
    } else if (platform === 'supabase') {
      success = !!(localAccount.supabaseConfig?.url && localAccount.supabaseConfig?.key);
    }
    
    setConnectionStatus(prev => ({ ...prev, [platform]: success ? 'success' : 'error' }));
    
    if (success) {
      addToast({ type: 'success', message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} connection successful!` });
    } else {
      addToast({ type: 'error', message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} connection failed. Please check your credentials.` });
    }
    
    // Reset status after 5 seconds
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, [platform]: 'idle' }));
    }, 5000);
  };

  const getStatusIcon = (status: 'idle' | 'testing' | 'success' | 'error') => {
    switch (status) {
      case 'testing': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <TestTube2 className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: 'idle' | 'testing' | 'success' | 'error') => {
    switch (status) {
      case 'testing': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'success': return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'error': return 'bg-red-500/10 border-red-500/30 text-red-400';
      default: return 'bg-chronos-800 border-chronos-700 text-gray-300 hover:bg-chronos-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard 
          title="Meta Ads" 
          icon={Facebook} 
          color="blue"
          connected={!!(localAccount.metaPixelId && localAccount.metaCapiToken)}
          pixelId={localAccount.metaPixelId}
        />
        <StatusCard 
          title="Google Ads" 
          icon={Code} 
          color="red"
          connected={!!(localAccount.googleConversionId)}
          pixelId={localAccount.googleConversionId}
        />
        <StatusCard 
          title="Supabase" 
          icon={Database} 
          color="purple"
          connected={!!(localAccount.supabaseConfig?.url)}
          pixelId={localAccount.supabaseConfig?.url ? 'Connected' : undefined}
        />
      </div>

      <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-8">
         <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-chronos-500 to-chronos-accent rounded-lg"><Settings className="w-6 h-6 text-white" /></div>
            <div>
              <h2 className="text-2xl font-bold text-white">Integrations & Settings</h2>
              <p className="text-sm text-gray-400">Manage all your external connections and account preferences here.</p>
            </div>
        </div>

        {/* Meta (Facebook) Settings */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Facebook className="w-5 h-5 text-blue-400"/>Meta (Facebook) Ads</h3>
              <button 
                onClick={() => testConnection('meta')}
                disabled={connectionStatus.meta === 'testing'}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${getStatusColor(connectionStatus.meta)}`}
              >
                {getStatusIcon(connectionStatus.meta)}
                {connectionStatus.meta === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-chronos-950 rounded-lg border border-chronos-800">
                <div>
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" /> Pixel ID
                    </label>
                    <input name="metaPixelId" value={localAccount.metaPixelId} onChange={handleInputChange} placeholder="e.g., 1234567890123456" className="w-full mt-2 bg-chronos-900 p-3 border border-chronos-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"/>
                    <p className="text-xs text-gray-500 mt-1">Found in Meta Events Manager</p>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-500" /> Conversions API (CAPI) Token
                    </label>
                    <input name="metaCapiToken" type="password" value={localAccount.metaCapiToken} onChange={handleInputChange} placeholder="Your CAPI access token" className="w-full mt-2 bg-chronos-900 p-3 border border-chronos-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"/>
                    <p className="text-xs text-gray-500 mt-1">System User access token with ads_management permission</p>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <TestTube2 className="w-4 h-4 text-gray-500" /> Test Event Code (Optional)
                    </label>
                    <input name="metaTestCode" value={localAccount.metaTestCode} onChange={handleInputChange} placeholder="TEST12345" className="w-full mt-2 bg-chronos-900 p-3 border border-chronos-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"/>
                    <p className="text-xs text-gray-500 mt-1">For testing events before going live</p>
                </div>
            </div>
        </div>

        {/* Google Ads Settings */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Code className="w-5 h-5 text-red-400"/>Google Ads</h3>
              <button 
                onClick={() => testConnection('google')}
                disabled={connectionStatus.google === 'testing'}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${getStatusColor(connectionStatus.google)}`}
              >
                {getStatusIcon(connectionStatus.google)}
                {connectionStatus.google === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-chronos-950 rounded-lg border border-chronos-800">
                <div>
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" /> Conversion ID
                    </label>
                    <input name="googleConversionId" value={localAccount.googleConversionId} onChange={handleInputChange} placeholder="AW-XXXXXXXXX" className="w-full mt-2 bg-chronos-900 p-3 border border-chronos-700 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"/>
                    <p className="text-xs text-gray-500 mt-1">Your Google Ads conversion tracking ID</p>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gray-500" /> Conversion Label
                    </label>
                    <input name="googleConversionLabel" value={localAccount.googleConversionLabel} onChange={handleInputChange} placeholder="AbCdEfGh123" className="w-full mt-2 bg-chronos-900 p-3 border border-chronos-700 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"/>
                    <p className="text-xs text-gray-500 mt-1">Specific conversion action label</p>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-500" /> Developer Token
                    </label>
                    <input name="googleDeveloperToken" type="password" value={localAccount.googleDeveloperToken} onChange={handleInputChange} placeholder="Your developer token" className="w-full mt-2 bg-chronos-900 p-3 border border-chronos-700 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"/>
                    <p className="text-xs text-gray-500 mt-1">From Google Ads API Center</p>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" /> Customer ID
                    </label>
                    <input name="googleCustomerId" value={localAccount.googleCustomerId} onChange={handleInputChange} placeholder="123-456-7890" className="w-full mt-2 bg-chronos-900 p-3 border border-chronos-700 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"/>
                    <p className="text-xs text-gray-500 mt-1">Your Google Ads account ID (without dashes)</p>
                </div>
            </div>
        </div>

        {/* Database Settings */}
        <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Database className="w-5 h-5 text-purple-400"/>Supabase Database</h3>
              <button 
                onClick={() => testConnection('supabase')}
                disabled={connectionStatus.supabase === 'testing'}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${getStatusColor(connectionStatus.supabase)}`}
              >
                {getStatusIcon(connectionStatus.supabase)}
                {connectionStatus.supabase === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-chronos-950 rounded-lg border border-chronos-800">
                 <div>
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" /> Project URL
                    </label>
                    <input name="url" value={localAccount.supabaseConfig.url} onChange={(e) => handleInputChange(e, 'supabase')} placeholder="https://xxxxx.supabase.co" className="w-full mt-2 bg-chronos-900 p-3 border border-chronos-700 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"/>
                    <p className="text-xs text-gray-500 mt-1">Your Supabase project URL</p>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-500" /> Anon Key
                    </label>
                    <input name="key" type="password" value={localAccount.supabaseConfig.key} onChange={(e) => handleInputChange(e, 'supabase')} placeholder="Your anon/public key" className="w-full mt-2 bg-chronos-900 p-3 border border-chronos-700 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"/>
                    <p className="text-xs text-gray-500 mt-1">Found in Project Settings → API</p>
                </div>
            </div>
        </div>

        <div className="pt-8 flex justify-between items-center">
            <button 
              onClick={() => {
                setConnectionStatus({ meta: 'idle', google: 'idle', supabase: 'idle' });
                setLocalAccount(currentAccount);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-chronos-800 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Reset Changes
            </button>
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-chronos-500 hover:bg-chronos-400 text-white shadow-lg shadow-chronos-500/20'}`}
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Settings Saved' : 'Save All Settings'}
            </button>
        </div>
      </div>
    </div>
  );
};

// Status Card Component
const StatusCard = ({ title, icon: Icon, color, connected, pixelId }: { 
  title: string; 
  icon: React.ElementType; 
  color: 'blue' | 'red' | 'purple';
  connected: boolean;
  pixelId?: string;
}) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30'
  };

  const iconColors = {
    blue: 'text-blue-400',
    red: 'text-red-400',
    purple: 'text-purple-400'
  };

  return (
    <div className={`p-4 rounded-xl border bg-gradient-to-br ${colorClasses[color]} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${iconColors[color]}`} />
          <span className="font-medium text-white">{title}</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
      </div>
      <p className="text-xs text-gray-400 mt-2 truncate">
        {connected ? (pixelId || 'Configured') : 'Not configured'}
      </p>
    </div>
  );
};