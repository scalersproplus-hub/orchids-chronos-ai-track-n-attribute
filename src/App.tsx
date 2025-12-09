import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { JourneyMap } from './components/JourneyMap';
import { Settings } from './components/Settings';
import { MOCK_CAMPAIGNS, MOCK_JOURNEYS } from './services/mockData';
import { useApp } from './contexts/AppContext';
import { AttributionModeler } from './components/AttributionModeler';
import { IdentityGraph } from './components/IdentityGraph';
import { OfflineConversionsHub } from './components/OfflineConversionsHub';
import { OnboardingWizard } from './components/OnboardingWizard';
import { DataSources } from './components/DataSources';
import { SetupGuide } from './components/SetupGuide';
import { Toast } from './components/common/Toast';
import { CommandPalette } from './components/common/CommandPalette';
import { UserProfile } from './components/common/UserProfile';
import { ConversationalAI } from './components/ai/ConversationalAI';
import { PredictiveInsights } from './components/ai/PredictiveInsights';
import { FraudDetection } from './components/ai/FraudDetection';
import { BudgetOptimizer } from './components/ai/BudgetOptimizer';
import { NAV_ITEMS, AI_NAV_ITEMS, SETTINGS_NAV_ITEMS } from './constants';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { BrainCircuit, Command, Keyboard, X, ChevronRight, RefreshCw } from 'lucide-react';
import './index.css';

const KeyboardShortcutsHelp: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-chronos-900 border border-chronos-800 rounded-xl shadow-2xl max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between p-4 border-b border-chronos-800">
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-chronos-400" />
          <h3 className="font-semibold text-white">Keyboard Shortcuts</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-chronos-800 rounded transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {KEYBOARD_SHORTCUTS.map((shortcut, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{shortcut.description}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, j) => (
                <kbd key={j} className="px-2 py-1 text-xs bg-chronos-800 border border-chronos-700 rounded text-gray-300 font-mono">
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-chronos-800 bg-chronos-950 rounded-b-xl">
        <p className="text-xs text-gray-500 text-center">Press <kbd className="px-1.5 py-0.5 bg-chronos-800 rounded text-gray-400">?</kbd> anytime to view shortcuts</p>
      </div>
    </div>
  </div>
);

// Breadcrumbs component
const Breadcrumbs: React.FC<{ currentView: string }> = ({ currentView }) => {
  const allNavItems = [...NAV_ITEMS, ...AI_NAV_ITEMS, ...SETTINGS_NAV_ITEMS];
  const currentPage = allNavItems.find(item => item.id === currentView);
  
  // Determine parent category
  let category = 'Analytics';
  if (AI_NAV_ITEMS.find(item => item.id === currentView)) category = 'AI Features';
  if (SETTINGS_NAV_ITEMS.find(item => item.id === currentView)) category = 'Configuration';
  
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-1">
      <span className="hover:text-gray-300 cursor-pointer">{category}</span>
      <ChevronRight className="w-3 h-3" />
      <span className="text-chronos-400">{currentPage?.label || 'Dashboard'}</span>
    </nav>
  );
};

// Last updated indicator
const LastUpdatedIndicator: React.FC<{ lastUpdated: Date | null; onRefresh: () => void; isRefreshing: boolean }> = ({ 
  lastUpdated, onRefresh, isRefreshing 
}) => {
  const [, forceUpdate] = useState({});
  
  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => forceUpdate({}), 60000);
    return () => clearInterval(interval);
  }, []);

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      {lastUpdated && (
        <span>Updated {getRelativeTime(lastUpdated)}</span>
      )}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="p-1.5 hover:bg-chronos-800 rounded-lg transition-colors disabled:opacity-50"
        title="Refresh data"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { state, setCmdkOpen, setAiModalOpen } = useApp();
  const { currentView, currentAccount } = state;
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Sync sidebar collapsed state
  useEffect(() => {
    const handleStorage = () => {
      const collapsed = localStorage.getItem('sidebar_collapsed') === 'true';
      setSidebarCollapsed(collapsed);
    };
    window.addEventListener('storage', handleStorage);
    
    // Also listen for direct changes
    const observer = new MutationObserver(() => {
      const collapsed = localStorage.getItem('sidebar_collapsed') === 'true';
      setSidebarCollapsed(collapsed);
    });
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      observer.disconnect();
    };
  }, []);

  // Listen for ? key to show shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !state.cmdkOpen && !state.aiModalOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          setShowShortcuts(true);
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [state.cmdkOpen, state.aiModalOpen]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard campaigns={MOCK_CAMPAIGNS} />;
      case 'journey': return <JourneyMap journeys={MOCK_JOURNEYS} />;
      case 'identity': return <IdentityGraph journeys={MOCK_JOURNEYS} />;
      case 'offline': return <OfflineConversionsHub />;
      case 'attribution': return <AttributionModeler campaigns={MOCK_CAMPAIGNS} journeys={MOCK_JOURNEYS} />;
      case 'datasources': return <DataSources />;
      case 'setup': return <SetupGuide />;
      case 'settings': return <Settings />;
      // AI Features
      case 'predictions': return <PredictiveInsights />;
      case 'fraud': return <FraudDetection />;
      case 'budget': return <BudgetOptimizer />;
      default: return <Dashboard campaigns={MOCK_CAMPAIGNS} />;
    }
  };

  // Combine all nav items to find current page label
  const allNavItems = [...NAV_ITEMS, ...AI_NAV_ITEMS, ...SETTINGS_NAV_ITEMS];
  const currentPage = allNavItems.find(item => item.id === currentView) || NAV_ITEMS[0];

  return (
    <>
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={handleSidebarCollapse} />
      <main className={`flex-1 p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <header className="flex justify-between items-start mb-8">
          <div>
            <Breadcrumbs currentView={currentView} />
            <h1 className="text-2xl font-bold text-white tracking-tight">{currentPage.label}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Active Profile: <span className="text-chronos-400 font-medium">{currentAccount.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
             <LastUpdatedIndicator 
               lastUpdated={lastUpdated} 
               onRefresh={handleRefresh}
               isRefreshing={isRefreshing}
             />
             <div className="w-px h-6 bg-chronos-800" />
             <button 
                onClick={() => setShowShortcuts(true)}
                className="p-2 text-gray-500 hover:text-white hover:bg-chronos-800 rounded-lg transition-all"
                title="Keyboard Shortcuts"
             >
                <Keyboard className="w-4 h-4" />
            </button>
             <button 
                onClick={() => setCmdkOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-chronos-900 border border-chronos-800 rounded-lg text-sm font-medium text-gray-400 hover:border-chronos-600 hover:text-white transition-all"
             >
                <Command className="w-4 h-4" /> 
                <span>Search</span>
                <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-chronos-800 rounded">⌘K</kbd>
            </button>
            <button 
                onClick={() => setAiModalOpen(true)}
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
      {showShortcuts && <KeyboardShortcutsHelp onClose={() => setShowShortcuts(false)} />}
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
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-chronos-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading workspace...</p>
        </div>
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