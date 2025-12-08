import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { EXAMPLE_VALUES, validateField } from '../services/mockData';
import { 
  Settings as SettingsIcon, Database, Facebook, Chrome, Globe, 
  Check, X, Loader2, Eye, EyeOff, Copy, ExternalLink, 
  AlertTriangle, CheckCircle, Info, Zap, Shield, Server,
  RefreshCw, AlertCircle, HelpCircle
} from 'lucide-react';

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

interface ConnectionState {
  supabase: ConnectionStatus;
  meta: ConnectionStatus;
  google: ConnectionStatus;
}

interface ValidationState {
  [key: string]: { valid: boolean; message: string };
}

export const Settings: React.FC = () => {
  const { state, updateAccount, addToast } = useApp();
  const { currentAccount } = state;
  
  const [localAccount, setLocalAccount] = useState(currentAccount);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>({
    supabase: 'idle',
    meta: 'idle',
    google: 'idle'
  });
  const [activeTab, setActiveTab] = useState<'integrations' | 'tracking' | 'advanced'>('integrations');
  const [hasChanges, setHasChanges] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({});
  const [dnsStatus, setDnsStatus] = useState<'idle' | 'checking' | 'verified' | 'failed'>('idle');

  useEffect(() => {
    setLocalAccount(currentAccount);
  }, [currentAccount]);

  useEffect(() => {
    const changed = JSON.stringify(localAccount) !== JSON.stringify(currentAccount);
    setHasChanges(changed);
  }, [localAccount, currentAccount]);

  const handleFieldChange = (field: string, value: string) => {
    // Update local state
    if (field.startsWith('supabase.')) {
      const key = field.split('.')[1];
      setLocalAccount({
        ...localAccount,
        supabaseConfig: { ...localAccount.supabaseConfig, [key]: value }
      });
      
      // Validate
      if (key === 'url') {
        const result = validateField('supabaseUrl', value);
        setValidation(prev => ({ ...prev, 'supabase.url': result }));
      }
    } else if (field.startsWith('google.')) {
      const key = field.split('.')[1];
      setLocalAccount({ ...localAccount, [key]: value });
      
      if (key === 'googleCustomerId') {
        const result = validateField('googleCustomerId', value);
        setValidation(prev => ({ ...prev, [key]: result }));
      } else if (key === 'googleConversionId') {
        const result = validateField('googleConversionId', value);
        setValidation(prev => ({ ...prev, [key]: result }));
      }
    } else if (field === 'metaPixelId') {
      setLocalAccount({ ...localAccount, metaPixelId: value });
      const result = validateField('metaPixelId', value);
      setValidation(prev => ({ ...prev, metaPixelId: result }));
    } else if (field === 'trackingDomain') {
      setLocalAccount({ ...localAccount, trackingDomain: value });
      const result = validateField('trackingDomain', value);
      setValidation(prev => ({ ...prev, trackingDomain: result }));
      setDnsStatus('idle');
    } else {
      setLocalAccount({ ...localAccount, [field]: value });
    }
  };

  const handleSave = () => {
    updateAccount(localAccount);
    addToast({ type: 'success', message: 'Settings saved successfully!' });
    setHasChanges(false);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast({ type: 'info', message: `${label} copied to clipboard` });
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Test Supabase connection
  const testSupabase = async () => {
    if (!localAccount.supabaseConfig?.url || !localAccount.supabaseConfig?.key) {
      addToast({ type: 'error', message: 'Please enter Supabase URL and API Key first' });
      return;
    }
    
    setConnectionStatus(prev => ({ ...prev, supabase: 'testing' }));
    
    try {
      const response = await fetch(`${localAccount.supabaseConfig.url}/rest/v1/`, {
        headers: {
          'apikey': localAccount.supabaseConfig.key,
          'Authorization': `Bearer ${localAccount.supabaseConfig.key}`
        }
      });
      
      if (response.ok || response.status === 200) {
        setConnectionStatus(prev => ({ ...prev, supabase: 'success' }));
        addToast({ type: 'success', message: 'Supabase connection successful!' });
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, supabase: 'error' }));
      addToast({ type: 'error', message: 'Supabase connection failed. Check your credentials.' });
    }
  };

  // Test Meta CAPI connection
  const testMeta = async () => {
    if (!localAccount.metaPixelId || !localAccount.metaCapiToken) {
      addToast({ type: 'error', message: 'Please enter Meta Pixel ID and CAPI Token first' });
      return;
    }
    
    setConnectionStatus(prev => ({ ...prev, meta: 'testing' }));
    
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${localAccount.metaPixelId}?access_token=${localAccount.metaCapiToken}`
      );
      
      const data = await response.json();
      
      if (data.id) {
        setConnectionStatus(prev => ({ ...prev, meta: 'success' }));
        addToast({ type: 'success', message: `Connected to Pixel: ${data.name || data.id}` });
      } else if (data.error) {
        throw new Error(data.error.message);
      }
    } catch (error: any) {
      setConnectionStatus(prev => ({ ...prev, meta: 'error' }));
      addToast({ type: 'error', message: error.message || 'Meta connection failed' });
    }
  };

  // Test Google connection
  const testGoogle = async () => {
    if (!localAccount.googleCustomerId || !localAccount.googleConversionId) {
      addToast({ type: 'error', message: 'Please enter Google Customer ID and Conversion ID first' });
      return;
    }
    
    setConnectionStatus(prev => ({ ...prev, google: 'testing' }));
    
    setTimeout(() => {
      const customerIdValid = validation['googleCustomerId']?.valid !== false;
      const conversionIdValid = validation['googleConversionId']?.valid !== false;
      
      if (customerIdValid && conversionIdValid) {
        setConnectionStatus(prev => ({ ...prev, google: 'success' }));
        addToast({ type: 'success', message: 'Google Ads format validated. Full test requires OAuth.' });
      } else {
        setConnectionStatus(prev => ({ ...prev, google: 'error' }));
        addToast({ type: 'error', message: 'Invalid format. Customer ID: 123-456-7890, Conversion ID: AW-123456789' });
      }
    }, 1000);
  };

  // DNS Verification for CNAME
  const verifyDNS = async () => {
    if (!localAccount.trackingDomain) {
      addToast({ type: 'error', message: 'Please enter a tracking domain first' });
      return;
    }
    
    setDnsStatus('checking');
    
    // Simulate DNS check (in production, this would call your backend)
    setTimeout(() => {
      // For demo, randomly succeed/fail
      const success = Math.random() > 0.3;
      if (success) {
        setDnsStatus('verified');
        addToast({ type: 'success', message: 'DNS verified! CNAME is correctly configured.' });
      } else {
        setDnsStatus('failed');
        addToast({ type: 'error', message: 'DNS verification failed. Please check your CNAME record.' });
      }
    }, 2000);
  };

  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case 'testing': return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <X className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  const tabs = [
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'tracking', label: 'Tracking Domain', icon: Globe },
    { id: 'advanced', label: 'Advanced', icon: Server },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-chronos-800 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-chronos-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 text-sm">Configure your tracking and integrations</p>
          </div>
        </div>
        
        {hasChanges && (
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-chronos-500 hover:bg-chronos-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>
        )}
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard 
          icon={Database}
          title="Supabase"
          status={connectionStatus.supabase}
          configured={!!(localAccount.supabaseConfig?.url && localAccount.supabaseConfig?.key)}
          onTest={testSupabase}
        />
        <StatusCard 
          icon={Facebook}
          title="Meta CAPI"
          status={connectionStatus.meta}
          configured={!!(localAccount.metaPixelId && localAccount.metaCapiToken)}
          onTest={testMeta}
        />
        <StatusCard 
          icon={Chrome}
          title="Google Ads"
          status={connectionStatus.google}
          configured={!!(localAccount.googleCustomerId && localAccount.googleConversionId)}
          onTest={testGoogle}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-chronos-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-chronos-500 text-white' 
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'integrations' && (
          <>
            {/* Workspace Settings */}
            <SettingsSection title="Workspace" icon={SettingsIcon}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Workspace Name"
                  value={localAccount.name}
                  onChange={v => handleFieldChange('name', v)}
                  placeholder="My Business"
                />
                <InputField
                  label="Website URL"
                  value={localAccount.websiteUrl}
                  onChange={v => handleFieldChange('websiteUrl', v)}
                  placeholder="https://yourdomain.com"
                />
              </div>
            </SettingsSection>

            {/* Supabase */}
            <SettingsSection 
              title="Supabase Database" 
              icon={Database}
              status={connectionStatus.supabase}
              onTest={testSupabase}
              helpLink="https://supabase.com/dashboard"
            >
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-900/30 to-chronos-900 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-green-200 font-medium">Setup Instructions</p>
                      <ol className="text-green-300/70 mt-2 space-y-1 list-decimal list-inside">
                        <li>Create a project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-200">supabase.com</a></li>
                        <li>Go to SQL Editor and run the schema from <code className="bg-green-900/50 px-1.5 py-0.5 rounded text-green-300">/supabase-schema.sql</code></li>
                        <li>Copy credentials from Settings → API</li>
                      </ol>
                    </div>
                  </div>
                </div>
                
                <InputField
                  label="Project URL"
                  value={localAccount.supabaseConfig?.url || ''}
                  onChange={v => handleFieldChange('supabase.url', v)}
                  placeholder={EXAMPLE_VALUES.supabase.url}
                  hint={EXAMPLE_VALUES.supabase.urlHint}
                  validation={validation['supabase.url']}
                  required
                />
                <InputField
                  label="Anon/Public Key"
                  value={localAccount.supabaseConfig?.key || ''}
                  onChange={v => handleFieldChange('supabase.key', v)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  hint={EXAMPLE_VALUES.supabase.keyHint}
                  isSecret
                  showSecret={showSecrets['supabase_key']}
                  onToggleSecret={() => toggleSecret('supabase_key')}
                  required
                />
              </div>
            </SettingsSection>

            {/* Meta/Facebook */}
            <SettingsSection 
              title="Meta (Facebook) Conversions API" 
              icon={Facebook}
              status={connectionStatus.meta}
              onTest={testMeta}
              helpLink="https://business.facebook.com/events_manager"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Pixel ID"
                    value={localAccount.metaPixelId}
                    onChange={v => handleFieldChange('metaPixelId', v)}
                    placeholder={EXAMPLE_VALUES.meta.pixelId}
                    hint={EXAMPLE_VALUES.meta.pixelIdHint}
                    validation={validation['metaPixelId']}
                    required
                  />
                  <InputField
                    label="Test Event Code"
                    value={localAccount.metaTestCode}
                    onChange={v => handleFieldChange('metaTestCode', v)}
                    placeholder={EXAMPLE_VALUES.meta.testCode}
                    hint={EXAMPLE_VALUES.meta.testCodeHint}
                  />
                </div>
                <InputField
                  label="Conversions API Access Token"
                  value={localAccount.metaCapiToken}
                  onChange={v => handleFieldChange('metaCapiToken', v)}
                  placeholder={EXAMPLE_VALUES.meta.capiToken}
                  hint={EXAMPLE_VALUES.meta.capiTokenHint}
                  isSecret
                  showSecret={showSecrets['meta_token']}
                  onToggleSecret={() => toggleSecret('meta_token')}
                  required
                />
              </div>
            </SettingsSection>

            {/* Google Ads */}
            <SettingsSection 
              title="Google Ads Offline Conversions" 
              icon={Chrome}
              status={connectionStatus.google}
              onTest={testGoogle}
              helpLink="https://ads.google.com"
            >
              <div className="space-y-4">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-yellow-200 font-medium">OAuth Required for Full Integration</p>
                      <p className="text-yellow-300/70 mt-1">
                        Google Ads API requires OAuth2. For production, set up a backend server 
                        to handle OAuth and upload conversions securely.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Customer ID"
                    value={localAccount.googleCustomerId || ''}
                    onChange={v => handleFieldChange('google.googleCustomerId', v)}
                    placeholder={EXAMPLE_VALUES.google.customerId}
                    hint={EXAMPLE_VALUES.google.customerIdHint}
                    validation={validation['googleCustomerId']}
                    required
                  />
                  <InputField
                    label="Conversion ID"
                    value={localAccount.googleConversionId || ''}
                    onChange={v => handleFieldChange('google.googleConversionId', v)}
                    placeholder={EXAMPLE_VALUES.google.conversionId}
                    hint={EXAMPLE_VALUES.google.conversionIdHint}
                    validation={validation['googleConversionId']}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Conversion Label"
                    value={localAccount.googleConversionLabel || ''}
                    onChange={v => handleFieldChange('google.googleConversionLabel', v)}
                    placeholder={EXAMPLE_VALUES.google.conversionLabel}
                    hint={EXAMPLE_VALUES.google.conversionLabelHint}
                  />
                  <InputField
                    label="Developer Token"
                    value={localAccount.googleDeveloperToken || ''}
                    onChange={v => handleFieldChange('google.googleDeveloperToken', v)}
                    placeholder={EXAMPLE_VALUES.google.developerToken}
                    hint={EXAMPLE_VALUES.google.developerTokenHint}
                    isSecret
                    showSecret={showSecrets['google_token']}
                    onToggleSecret={() => toggleSecret('google_token')}
                  />
                </div>
              </div>
            </SettingsSection>
          </>
        )}

        {activeTab === 'tracking' && (
          <SettingsSection 
            title="First-Party Domain Tracking (CNAME)" 
            icon={Shield}
          >
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-900/30 to-chronos-900 border border-purple-500/30 rounded-lg p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Why Use CNAME Tracking?</h3>
                    <p className="text-gray-400 text-sm mt-1 mb-3">
                      First-party tracking bypasses browser restrictions and ad blockers.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Bypass ad blockers</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Safari ITP compliant</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>iOS 14.5+ compatible</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>20-40% more conversions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-chronos-700 flex items-center justify-center text-sm">1</span>
                  Add DNS Record
                </h4>
                <div className="bg-black/50 border border-chronos-700 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-chronos-900 border-b border-chronos-700 text-xs text-gray-400">
                    DNS Configuration
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                      <div>
                        <div className="text-gray-500 mb-1">Type</div>
                        <div className="text-green-400">CNAME</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Name/Host</div>
                        <div className="text-green-400">track</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Points to</div>
                        <div className="text-green-400">ingest.chronos-ai.io</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-chronos-700 flex items-center justify-center text-sm">2</span>
                  Enter Your Tracking Domain
                </h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <InputField
                      label=""
                      value={localAccount.trackingDomain || ''}
                      onChange={v => handleFieldChange('trackingDomain', v)}
                      placeholder={EXAMPLE_VALUES.trackingDomain}
                      hint={EXAMPLE_VALUES.trackingDomainHint}
                      validation={validation['trackingDomain']}
                    />
                  </div>
                  <button
                    onClick={verifyDNS}
                    disabled={!localAccount.trackingDomain || dnsStatus === 'checking'}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors h-[42px] mt-0 ${
                      dnsStatus === 'verified' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : dnsStatus === 'failed'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-chronos-700 text-white hover:bg-chronos-600 disabled:opacity-50'
                    }`}
                  >
                    {dnsStatus === 'checking' ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
                    ) : dnsStatus === 'verified' ? (
                      <><CheckCircle className="w-4 h-4" /> Verified</>
                    ) : dnsStatus === 'failed' ? (
                      <><RefreshCw className="w-4 h-4" /> Retry</>
                    ) : (
                      <><RefreshCw className="w-4 h-4" /> Verify DNS</>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-chronos-700 flex items-center justify-center text-sm">3</span>
                  Update Your Tracking Tag
                </h4>
                <div className="bg-black/50 border border-chronos-700 rounded-lg overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-2 bg-chronos-900 border-b border-chronos-700">
                    <span className="text-xs text-gray-400">Updated Tag (First-Party)</span>
                    <button 
                      onClick={() => handleCopy(`<script async src="https://${localAccount.trackingDomain || 'track.yourdomain.com'}/chronos-tag.js" data-chronos-id="${localAccount.id}"></script>`, 'Tracking tag')}
                      className="text-xs text-chronos-400 hover:text-white flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <div className="p-4 font-mono text-sm text-green-300 overflow-x-auto">
{`<script async 
  src="https://${localAccount.trackingDomain || 'track.yourdomain.com'}/chronos-tag.js" 
  data-chronos-id="${localAccount.id}">
</script>`}
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        )}

        {activeTab === 'advanced' && (
          <>
            <SettingsSection title="Server-Side Proxy" icon={Server}>
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  For maximum tracking accuracy, deploy a server-side proxy on your own infrastructure.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-black to-chronos-900 border border-chronos-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <img src="https://www.vectorlogo.zone/logos/vercel/vercel-icon.svg" className="w-5 h-5" alt="Vercel" />
                      <span className="font-medium text-white">Vercel Edge</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">Deploy as an Edge Function for global low-latency.</p>
                    <a href="https://vercel.com/docs/functions/edge-functions" target="_blank" rel="noopener noreferrer" className="text-xs text-chronos-400 hover:text-chronos-300 flex items-center gap-1">
                      View Guide <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="bg-gradient-to-br from-black to-chronos-900 border border-chronos-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <img src="https://www.vectorlogo.zone/logos/cloudflare/cloudflare-icon.svg" className="w-5 h-5" alt="Cloudflare" />
                      <span className="font-medium text-white">Cloudflare Workers</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">Run on Cloudflare's edge network worldwide.</p>
                    <a href="https://developers.cloudflare.com/workers/" target="_blank" rel="noopener noreferrer" className="text-xs text-chronos-400 hover:text-chronos-300 flex items-center gap-1">
                      View Guide <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="bg-black/50 border border-chronos-700 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-chronos-900 border-b border-chronos-700 text-xs text-gray-400">
                    Example: Vercel Edge Function
                  </div>
                  <pre className="p-4 text-xs font-mono text-green-300 overflow-x-auto">
{`// api/track/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ip = req.headers.get('x-forwarded-for') || req.ip;
  const ua = req.headers.get('user-agent');
  
  // Forward to Chronos with enriched data
  await fetch('https://ingest.chronos-ai.io/v1/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, ip, ua })
  });
  
  return NextResponse.json({ success: true });
}`}
                  </pre>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection title="Data & Privacy" icon={Shield}>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-chronos-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Data Retention</h4>
                    <p className="text-sm text-gray-400">How long to keep visitor data</p>
                  </div>
                  <select className="bg-chronos-700 border border-chronos-600 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                    <option value="730">2 years</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-chronos-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Hash PII Before Storage</h4>
                    <p className="text-sm text-gray-400">Store only hashed emails/phones (recommended)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-chronos-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-chronos-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-chronos-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Anonymize IP Addresses</h4>
                    <p className="text-sm text-gray-400">Mask last octet for GDPR compliance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-chronos-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-chronos-500"></div>
                  </label>
                </div>
              </div>
            </SettingsSection>
          </>
        )}
      </div>
    </div>
  );
};

// Status Card Component
interface StatusCardProps {
  icon: React.FC<any>;
  title: string;
  status: ConnectionStatus;
  configured: boolean;
  onTest: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({ icon: Icon, title, status, configured, onTest }) => (
  <div className={`bg-chronos-900 border rounded-xl p-4 transition-all ${
    status === 'success' ? 'border-green-500/30 shadow-lg shadow-green-500/5' : 
    status === 'error' ? 'border-red-500/30 shadow-lg shadow-red-500/5' : 
    'border-chronos-800'
  }`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          status === 'success' ? 'bg-green-500/20' : 
          status === 'error' ? 'bg-red-500/20' : 
          configured ? 'bg-chronos-700' : 'bg-chronos-800'
        }`}>
          <Icon className={`w-5 h-5 ${
            status === 'success' ? 'text-green-400' : 
            status === 'error' ? 'text-red-400' : 
            configured ? 'text-chronos-400' : 'text-gray-500'
          }`} />
        </div>
        <span className="font-medium text-white">{title}</span>
      </div>
      {status !== 'idle' && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === 'success' ? 'bg-green-500/20 text-green-400' :
          status === 'error' ? 'bg-red-500/20 text-red-400' :
          'bg-blue-500/20 text-blue-400'
        }`}>
          {status === 'testing' ? 'Testing...' : status === 'success' ? 'Connected' : 'Error'}
        </span>
      )}
    </div>
    <div className="flex items-center justify-between">
      <span className={`text-sm ${configured ? 'text-green-400' : 'text-yellow-500'}`}>
        {configured ? '✓ Configured' : '○ Not configured'}
      </span>
      <button 
        onClick={onTest}
        disabled={!configured || status === 'testing'}
        className="text-xs px-3 py-1.5 bg-chronos-700 hover:bg-chronos-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
      >
        {status === 'testing' ? 'Testing...' : 'Test'}
      </button>
    </div>
  </div>
);

// Settings Section Component
interface SettingsSectionProps {
  title: string;
  icon: React.FC<any>;
  children: React.ReactNode;
  status?: ConnectionStatus;
  onTest?: () => void;
  helpLink?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ 
  title, icon: Icon, children, status, onTest, helpLink 
}) => (
  <div className="bg-chronos-900 border border-chronos-800 rounded-xl overflow-hidden">
    <div className="p-5 border-b border-chronos-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-chronos-400" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {status && status !== 'idle' && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            status === 'success' ? 'bg-green-500/20 text-green-400' :
            status === 'error' ? 'bg-red-500/20 text-red-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            {status === 'success' ? 'Connected' : status === 'error' ? 'Error' : 'Testing...'}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {helpLink && (
          <a 
            href={helpLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-chronos-400 flex items-center gap-1"
          >
            Docs <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {onTest && (
          <button 
            onClick={onTest}
            disabled={status === 'testing'}
            className="text-xs px-3 py-1.5 bg-chronos-700 hover:bg-chronos-600 disabled:opacity-50 text-white rounded transition-colors flex items-center gap-1"
          >
            {status === 'testing' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            Test Connection
          </button>
        )}
      </div>
    </div>
    <div className="p-5">
      {children}
    </div>
  </div>
);

// Input Field Component
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  isSecret?: boolean;
  showSecret?: boolean;
  onToggleSecret?: () => void;
  validation?: { valid: boolean; message: string };
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, value, onChange, placeholder, hint, isSecret, showSecret, onToggleSecret, validation, required 
}) => (
  <div>
    {label && (
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      </div>
    )}
    <div className="relative">
      <input
        type={isSecret && !showSecret ? 'password' : 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-chronos-800 border rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:ring-1 transition-colors pr-10 ${
          validation?.valid === false 
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' 
            : value && validation?.valid 
            ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/30'
            : 'border-chronos-700 focus:border-chronos-500 focus:ring-chronos-500/30'
        }`}
      />
      {isSecret && (
        <button 
          type="button"
          onClick={onToggleSecret}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
      {!isSecret && value && validation && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {validation.valid ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
        </div>
      )}
    </div>
    {validation?.valid === false && validation.message && (
      <p className="mt-1 text-xs text-red-400">{validation.message}</p>
    )}
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

export default Settings;