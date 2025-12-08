import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { EXAMPLE_VALUES } from '../services/mockData';
import { 
  Settings as SettingsIcon, Database, Facebook, Chrome, Globe, 
  Check, X, Loader2, Eye, EyeOff, Copy, ExternalLink, 
  AlertTriangle, CheckCircle, Info, Zap, Shield, Server
} from 'lucide-react';

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

interface ConnectionState {
  supabase: ConnectionStatus;
  meta: ConnectionStatus;
  google: ConnectionStatus;
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

  useEffect(() => {
    setLocalAccount(currentAccount);
  }, [currentAccount]);

  useEffect(() => {
    // Check if there are unsaved changes
    const changed = JSON.stringify(localAccount) !== JSON.stringify(currentAccount);
    setHasChanges(changed);
  }, [localAccount, currentAccount]);

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
      // Test with a simple API call to verify credentials
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

  // Test Google connection (limited without OAuth)
  const testGoogle = async () => {
    if (!localAccount.googleCustomerId || !localAccount.googleConversionId) {
      addToast({ type: 'error', message: 'Please enter Google Customer ID and Conversion ID first' });
      return;
    }
    
    setConnectionStatus(prev => ({ ...prev, google: 'testing' }));
    
    // Google API requires OAuth, so we just validate format
    setTimeout(() => {
      const customerIdFormat = /^\d{3}-\d{3}-\d{4}$/.test(localAccount.googleCustomerId || '');
      const conversionIdFormat = /^AW-\d+$/.test(localAccount.googleConversionId || '');
      
      if (customerIdFormat && conversionIdFormat) {
        setConnectionStatus(prev => ({ ...prev, google: 'success' }));
        addToast({ type: 'success', message: 'Google Ads format validated. Full test requires OAuth.' });
      } else {
        setConnectionStatus(prev => ({ ...prev, google: 'error' }));
        addToast({ type: 'error', message: 'Invalid format. Customer ID: 123-456-7890, Conversion ID: AW-123456789' });
      }
    }, 1000);
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
                  onChange={v => setLocalAccount({...localAccount, name: v})}
                  placeholder="My Business"
                />
                <InputField
                  label="Website URL"
                  value={localAccount.websiteUrl}
                  onChange={v => setLocalAccount({...localAccount, websiteUrl: v})}
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
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-blue-200 font-medium">First time setup?</p>
                      <p className="text-blue-300/70 mt-1">
                        1. Create a project at <a href="https://supabase.com" target="_blank" className="underline">supabase.com</a><br/>
                        2. Run the SQL schema from <code className="bg-blue-900/50 px-1 rounded">/supabase-schema.sql</code><br/>
                        3. Copy your Project URL and anon key from Settings → API
                      </p>
                    </div>
                  </div>
                </div>
                
                <InputField
                  label="Project URL"
                  value={localAccount.supabaseConfig?.url || ''}
                  onChange={v => setLocalAccount({
                    ...localAccount, 
                    supabaseConfig: {...localAccount.supabaseConfig, url: v}
                  })}
                  placeholder={EXAMPLE_VALUES.supabase.url}
                  example={EXAMPLE_VALUES.supabase.url}
                />
                <InputField
                  label="Anon/Public Key"
                  value={localAccount.supabaseConfig?.key || ''}
                  onChange={v => setLocalAccount({
                    ...localAccount, 
                    supabaseConfig: {...localAccount.supabaseConfig, key: v}
                  })}
                  placeholder={EXAMPLE_VALUES.supabase.key}
                  isSecret
                  showSecret={showSecrets['supabase_key']}
                  onToggleSecret={() => toggleSecret('supabase_key')}
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
                    onChange={v => setLocalAccount({...localAccount, metaPixelId: v})}
                    placeholder={EXAMPLE_VALUES.meta.pixelId}
                    example={EXAMPLE_VALUES.meta.pixelId}
                  />
                  <InputField
                    label="Test Event Code (Optional)"
                    value={localAccount.metaTestCode}
                    onChange={v => setLocalAccount({...localAccount, metaTestCode: v})}
                    placeholder={EXAMPLE_VALUES.meta.testCode}
                    example={EXAMPLE_VALUES.meta.testCode}
                    hint="For testing in Events Manager"
                  />
                </div>
                <InputField
                  label="Conversions API Access Token"
                  value={localAccount.metaCapiToken}
                  onChange={v => setLocalAccount({...localAccount, metaCapiToken: v})}
                  placeholder={EXAMPLE_VALUES.meta.capiToken}
                  isSecret
                  showSecret={showSecrets['meta_token']}
                  onToggleSecret={() => toggleSecret('meta_token')}
                  hint="Generate in Events Manager → Settings → Conversions API"
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
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-yellow-200 font-medium">OAuth Required for Full Integration</p>
                      <p className="text-yellow-300/70 mt-1">
                        Google Ads API requires OAuth2 authentication. For production, you'll need 
                        a backend server to handle the OAuth flow and upload conversions.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Customer ID"
                    value={localAccount.googleCustomerId || ''}
                    onChange={v => setLocalAccount({...localAccount, googleCustomerId: v})}
                    placeholder={EXAMPLE_VALUES.google.customerId}
                    example={EXAMPLE_VALUES.google.customerId}
                    hint="Format: 123-456-7890"
                  />
                  <InputField
                    label="Conversion ID"
                    value={localAccount.googleConversionId || ''}
                    onChange={v => setLocalAccount({...localAccount, googleConversionId: v})}
                    placeholder={EXAMPLE_VALUES.google.conversionId}
                    example={EXAMPLE_VALUES.google.conversionId}
                    hint="Format: AW-123456789"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Conversion Label"
                    value={localAccount.googleConversionLabel || ''}
                    onChange={v => setLocalAccount({...localAccount, googleConversionLabel: v})}
                    placeholder={EXAMPLE_VALUES.google.conversionLabel}
                    example={EXAMPLE_VALUES.google.conversionLabel}
                  />
                  <InputField
                    label="Developer Token"
                    value={localAccount.googleDeveloperToken || ''}
                    onChange={v => setLocalAccount({...localAccount, googleDeveloperToken: v})}
                    placeholder={EXAMPLE_VALUES.google.developerToken}
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
              <div className="bg-gradient-to-r from-green-900/20 to-chronos-900 border border-green-500/30 rounded-lg p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Why Use CNAME Tracking?</h3>
                    <ul className="mt-2 space-y-1 text-sm text-gray-300">
                      <li>✓ <strong>Bypass ad blockers</strong> - Requests come from your domain</li>
                      <li>✓ <strong>Bypass Safari ITP</strong> - First-party cookies last longer</li>
                      <li>✓ <strong>Bypass iOS restrictions</strong> - Not blocked by ATT</li>
                      <li>✓ <strong>Higher match rates</strong> - 20-40% more conversions tracked</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Setup Instructions</h4>
                <ol className="space-y-4 text-sm">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-chronos-700 flex items-center justify-center text-chronos-300 font-bold">1</span>
                    <div>
                      <p className="text-white font-medium">Choose a subdomain</p>
                      <p className="text-gray-400 mt-1">
                        Example: <code className="bg-chronos-800 px-2 py-0.5 rounded">track.yourdomain.com</code> or <code className="bg-chronos-800 px-2 py-0.5 rounded">t.yourdomain.com</code>
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-chronos-700 flex items-center justify-center text-chronos-300 font-bold">2</span>
                    <div>
                      <p className="text-white font-medium">Add a CNAME record in your DNS</p>
                      <div className="mt-2 bg-black/50 border border-chronos-800 rounded-lg p-4 font-mono text-xs">
                        <div className="grid grid-cols-3 gap-4 text-gray-500 mb-2">
                          <span>Type</span>
                          <span>Name</span>
                          <span>Value</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-green-300">
                          <span>CNAME</span>
                          <span>track</span>
                          <span>ingest.chronos-ai.io</span>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-chronos-700 flex items-center justify-center text-chronos-300 font-bold">3</span>
                    <div>
                      <p className="text-white font-medium">Enter your tracking domain below</p>
                      <p className="text-gray-400 mt-1">We'll verify the DNS and issue an SSL certificate automatically.</p>
                    </div>
                  </li>
                </ol>
              </div>

              <InputField
                label="Custom Tracking Domain"
                value={localAccount.trackingDomain || ''}
                onChange={v => setLocalAccount({...localAccount, trackingDomain: v})}
                placeholder={EXAMPLE_VALUES.trackingDomain}
                example={EXAMPLE_VALUES.trackingDomain}
                hint="Your CNAME subdomain for first-party tracking"
              />

              <div className="bg-chronos-800/50 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Updated Tracking Tag</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Once configured, update your tracking tag to use your custom domain:
                </p>
                <div className="bg-black/50 border border-chronos-700 rounded-lg p-4 font-mono text-xs text-green-300 overflow-x-auto">
                  {`<script async 
  src="https://${localAccount.trackingDomain || 'track.yourdomain.com'}/chronos-tag.js" 
  data-chronos-id="${localAccount.id}">
</script>`}
                </div>
              </div>
            </div>
          </SettingsSection>
        )}

        {activeTab === 'advanced' && (
          <>
            <SettingsSection title="Server-Side Proxy" icon={Server}>
              <div className="space-y-4">
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Server className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-purple-200 font-medium">Maximum Tracking Accuracy</p>
                      <p className="text-purple-300/70 mt-1">
                        For the highest accuracy, deploy a server-side proxy. This ensures 
                        all events are captured even with aggressive ad blockers.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-3">Proxy Endpoint Configuration</h4>
                  <div className="bg-black/50 border border-chronos-700 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <p className="text-gray-500 mb-2"># Example: Vercel Edge Function</p>
                    <pre className="text-green-300">{`// api/track/route.ts
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Forward to Chronos ingest
  const response = await fetch('https://ingest.chronos-ai.io/v1/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return Response.json({ success: true });
}`}</pre>
                  </div>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection title="Webhooks" icon={Zap}>
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Configure webhooks to receive real-time notifications when conversions happen.
                </p>
                
                <div className="bg-chronos-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Available Events</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" /> conversion.created
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" /> visitor.identified
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" /> upload.completed
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" /> anomaly.detected
                    </div>
                  </div>
                </div>

                <InputField
                  label="Webhook Endpoint"
                  value=""
                  onChange={() => {}}
                  placeholder="https://your-server.com/webhooks/chronos"
                  hint="We'll send POST requests to this URL"
                />
              </div>
            </SettingsSection>

            <SettingsSection title="Data & Privacy" icon={Shield}>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-chronos-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Data Retention</h4>
                    <p className="text-sm text-gray-400">How long to keep visitor data</p>
                  </div>
                  <select className="bg-chronos-700 border border-chronos-600 rounded-lg px-3 py-2 text-white">
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365" selected>1 year</option>
                    <option value="730">2 years</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-chronos-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Hash PII Before Storage</h4>
                    <p className="text-sm text-gray-400">Store only hashed emails/phones</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
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
  <div className={`bg-chronos-900 border rounded-xl p-4 ${
    status === 'success' ? 'border-green-500/30' : 
    status === 'error' ? 'border-red-500/30' : 
    'border-chronos-800'
  }`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          status === 'success' ? 'bg-green-500/20' : 
          status === 'error' ? 'bg-red-500/20' : 
          'bg-chronos-800'
        }`}>
          <Icon className={`w-5 h-5 ${
            status === 'success' ? 'text-green-400' : 
            status === 'error' ? 'text-red-400' : 
            'text-gray-400'
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
      <span className={`text-sm ${configured ? 'text-green-400' : 'text-gray-500'}`}>
        {configured ? 'Configured' : 'Not configured'}
      </span>
      <button 
        onClick={onTest}
        disabled={!configured || status === 'testing'}
        className="text-xs px-3 py-1 bg-chronos-700 hover:bg-chronos-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
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
        {status && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            status === 'success' ? 'bg-green-500/20 text-green-400' :
            status === 'error' ? 'bg-red-500/20 text-red-400' :
            status === 'testing' ? 'bg-blue-500/20 text-blue-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {status === 'success' ? 'Connected' : status === 'error' ? 'Error' : status === 'testing' ? 'Testing...' : 'Not tested'}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {helpLink && (
          <a 
            href={helpLink} 
            target="_blank" 
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
  example?: string;
  isSecret?: boolean;
  showSecret?: boolean;
  onToggleSecret?: () => void;
  hint?: string;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, value, onChange, placeholder, example, isSecret, showSecret, onToggleSecret, hint 
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {example && !value && (
        <span className="text-xs text-gray-600">e.g., {example}</span>
      )}
    </div>
    <div className="relative">
      <input
        type={isSecret && !showSecret ? 'password' : 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-chronos-800 border border-chronos-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-chronos-500 focus:ring-1 focus:ring-chronos-500 transition-colors pr-10"
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
    </div>
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

export default Settings;
