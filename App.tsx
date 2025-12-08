import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { JourneyMap } from './components/JourneyMap';
import { AttributionSettings } from './components/AttributionSettings';
import { MOCK_CAMPAIGNS, MOCK_JOURNEYS } from './services/mockData';
import { useApp } from './contexts/AppContext';
import { AttributionModeler } from './components/AttributionModeler';
import { IdentityGraph } from './components/IdentityGraph';
import { OfflineConversionsHub } from './components/OfflineConversionsHub';
import { OnboardingWizard } from './components/OnboardingWizard';
import { DataSources } from './components/DataSources';
import { Toast } from './components/common/Toast';
import { CommandPalette } from './components/common/CommandPalette';
import { UserProfile } from './components/common/UserProfile';
import { ConversationalAI } from './components/ai/ConversationalAI';
import { NAV_ITEMS } from './constants';
import { BrainCircuit, Command } from 'lucide-react';

const AppContent: React.FC = () => {
  const { state } = useApp();
  const { currentView, currentAccount } = state;

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard campaigns={MOCK_CAMPAIGNS} />;
      case 'journey': return <JourneyMap journeys={MOCK_JOURNEYS} />;
      case 'identity': return <IdentityGraph journeys={MOCK_JOURNEYS} />;
      case 'offline': return <OfflineConversionsHub />;
      case 'attribution': return <AttributionModeler campaigns={MOCK_CAMPAIGNS} journeys={MOCK_JOURNEYS} />;
      case 'datasources': return <DataSources />;
      case 'settings': return <AttributionSettings />;
      default: return <Dashboard campaigns={MOCK_CAMPAIGNS} />;
    }
  };

  const currentPage = NAV_ITEMS.find(item => item.id === currentView) || NAV_ITEMS[0];

  return (
    <>
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{currentPage.label}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Active Profile: <span className="text-chronos-400 font-medium">{currentAccount.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => useApp().setCmdkOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-chronos-900 border border-chronos-800 rounded-lg text-sm font-medium text-gray-400 hover:border-chronos-600 hover:text-white transition-all"
             >
                <Command className="w-4 h-4" /> Quick Search
            </button>
            <button 
                onClick={() => useApp().setAiModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-chronos-accent/10 border border-chronos-accent/30 rounded-lg text-sm font-medium text-chronos-accent hover:bg-chronos-accent/20 transition-all"
            >
              <BrainCircuit className="w-4 h-4" /> Ask Chronos
            </button>
            <UserProfile />
          </div>
        </header>
        <div>
          {renderContent()}
        </div>
      </main>
    </>
  );
};

const App: React.FC = () => {
  const { state } = useApp();
  const { currentAccount, toasts, cmdkOpen, aiModalOpen } = state;

  useEffect(() => {
    if (currentAccount) {
      document.title = `Chronos AI | ${currentAccount.name}`;
    }
  }, [currentAccount]);

  if (!currentAccount) {
    return (
      <div className="flex items-center justify-center h-screen bg-chronos-950 text-gray-400">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-chronos-950 text-gray-200">
      {currentAccount.setupComplete ? <AppContent /> : <OnboardingWizard />}
      
      {/* Global Portal Components */}
      <Toast notifications={toasts} />
      {cmdkOpen && <CommandPalette />}
      {aiModalOpen && <ConversationalAI campaigns={MOCK_CAMPAIGNS} />}
    </div>
  );
};

export default App;
