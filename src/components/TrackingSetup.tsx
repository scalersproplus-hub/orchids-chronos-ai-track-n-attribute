import React, { useState } from 'react';
import { Globe, Server, Megaphone, FileText, Database, Zap, PlayCircle, BookOpen, Save } from 'lucide-react';

// Import the new modular tab components
import { SimulatorTab } from './tracking/SimulatorTab';
import { BrowserPixelTab } from './tracking/BrowserPixelTab';
import { MetaCapiTab } from './tracking/MetaCapiTab';
import { GoogleAdsTab } from './tracking/GoogleAdsTab';
import { InstantFormsTab } from './tracking/InstantFormsTab';
import { DbSchemaTab } from './tracking/DbSchemaTab';
import { FunnelCloseTab } from './tracking/FunnelCloseTab';
import { SetupGuideTab } from './tracking/SetupGuideTab';
import { useApp } from '../contexts/AppContext';


type ActiveTab = 'guide' | 'simulator' | 'client' | 'server' | 'google' | 'forms' | 'database' | 'offline';

export const TrackingSetup: React.FC = () => {
  const { currentAccount, updateAccount } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('guide');

  const [accountName, setAccountName] = useState(currentAccount.name);
  const [websiteUrl, setWebsiteUrl] = useState(currentAccount.websiteUrl);

  const saveAccountChanges = () => {
      updateAccount({
          ...currentAccount,
          name: accountName,
          websiteUrl: websiteUrl,
      });
  };

  const TABS = [
      { id: 'guide', label: 'Setup Guide', icon: BookOpen },
      { id: 'simulator', label: 'E2E Simulator', icon: PlayCircle },
      { id: 'client', label: 'Browser Pixel', icon: Globe },
      { id: 'server', label: 'Meta CAPI', icon: Server },
      { id: 'google', label: 'Google Ads', icon: Megaphone },
      { id: 'forms', label: 'Instant Forms', icon: FileText },
      { id: 'database', label: 'DB Schema', icon: Database },
      { id: 'offline', label: 'Funnel Close', icon: Zap },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'guide': return <SetupGuideTab />;
      case 'simulator': return <SimulatorTab />;
      case 'client': return <BrowserPixelTab />;
      case 'server': return <MetaCapiTab />;
      case 'google': return <GoogleAdsTab />;
      case 'forms': return <InstantFormsTab />;
      case 'database': return <DbSchemaTab />;
      case 'offline': return <FunnelCloseTab />;
      default: return null;
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-chronos-500/10 rounded-lg">
                  <Globe className="w-6 h-6 text-chronos-500" />
              </div>
              <div>
                  <input 
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    onBlur={saveAccountChanges}
                    className="text-2xl font-bold text-white bg-transparent border-none focus:ring-0 p-0 m-0"
                  />
                  <p className="text-gray-400">Manage tracking pixels, server-side events, and database connections.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-chronos-950 p-2 rounded-lg border border-chronos-800">
                <Globe className="w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    onBlur={saveAccountChanges}
                    placeholder="https://your-domain.com"
                    className="bg-transparent border-none text-sm text-white focus:ring-0 focus:outline-none w-48"
                />
                <button onClick={saveAccountChanges} className="p-1 hover:text-green-400 text-gray-500 transition-colors">
                    <Save className="w-3 h-3" />
                </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-chronos-950 p-1.5 rounded-lg border border-chronos-800 mb-8 w-full overflow-x-auto">
          {TABS.map(tab => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-chronos-800 text-white shadow-sm ring-1 ring-chronos-700' : 'text-gray-400 hover:text-white hover:bg-chronos-900'}`}
            >
                <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div>
          {renderActiveTab()}
        </div>

      </div>
    </div>
  );
};