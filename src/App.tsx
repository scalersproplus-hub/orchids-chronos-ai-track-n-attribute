import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { MobileNav } from './components/common/MobileNav';
import { AnimatedBackground, PageTransition } from './components/common/AnimatedBackground';
import { ConversationalAI } from './components/ai/ConversationalAI';
import { PredictiveInsights } from './components/ai/PredictiveInsights';
import { FraudDetection } from './components/ai/FraudDetection';
import { BudgetOptimizer } from './components/ai/BudgetOptimizer';
import { NAV_ITEMS, AI_NAV_ITEMS, SETTINGS_NAV_ITEMS } from './constants';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { BrainCircuit, Command, Keyboard, X, ChevronRight, RefreshCw, Sparkles, Zap } from 'lucide-react';
import './index.css';

const KeyboardShortcutsHelp: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div 
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
    <motion.div 
      className="glass relative max-w-md w-full shadow-2xl"
      style={{ 
        borderRadius: '1.5rem',
        border: '1px solid hsl(270 91% 65% / 0.2)' 
      }}
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div className="flex items-center justify-between p-5 border-b border-[hsl(270_91%_65%_/_0.1)]">
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-2 rounded-xl bg-gradient-to-br from-[hsl(270_91%_65%)] to-[hsl(320_80%_60%)]"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Keyboard className="w-5 h-5 text-white" />
          </motion.div>
          <h3 className="font-bold text-white heading text-lg">Keyboard Shortcuts</h3>
        </div>
        <motion.button 
          onClick={onClose} 
          className="p-2 hover:bg-[hsl(270_91%_65%_/_0.1)] rounded-xl transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4 text-gray-400" />
        </motion.button>
      </div>
      <div className="p-5 space-y-3">
        {KEYBOARD_SHORTCUTS.map((shortcut, i) => (
          <motion.div 
            key={i} 
            className="flex items-center justify-between p-3 rounded-xl glass"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            style={{ border: '1px solid hsl(230 20% 15%)' }}
          >
            <span className="text-sm text-gray-300">{shortcut.description}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, j) => (
                <kbd 
                  key={j} 
                  className="px-2.5 py-1.5 text-xs rounded-lg font-mono font-medium"
                  style={{
                    background: 'linear-gradient(135deg, hsl(230 20% 15%), hsl(230 20% 12%))',
                    border: '1px solid hsl(270 91% 65% / 0.2)',
                    color: 'hsl(270 91% 75%)',
                  }}
                >
                  {key}
                </kbd>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="p-5 border-t border-[hsl(270_91%_65%_/_0.1)] bg-[hsl(230_25%_5%)] rounded-b-3xl">
        <p className="text-xs text-gray-500 text-center">
          Press <kbd className="px-2 py-1 mx-1 bg-[hsl(230_20%_12%)] rounded-lg text-[hsl(270_91%_75%)] font-mono">?</kbd> anytime to view shortcuts
        </p>
      </div>
    </motion.div>
  </motion.div>
);

const Breadcrumbs: React.FC<{ currentView: string }> = ({ currentView }) => {
  const allNavItems = [...NAV_ITEMS, ...AI_NAV_ITEMS, ...SETTINGS_NAV_ITEMS];
  const currentPage = allNavItems.find(item => item.id === currentView);
  
  let category = 'Analytics';
  if (AI_NAV_ITEMS.find(item => item.id === currentView)) category = 'AI Features';
  if (SETTINGS_NAV_ITEMS.find(item => item.id === currentView)) category = 'Configuration';
  
  return (
    <motion.nav 
      className="hidden sm:flex items-center gap-2 text-sm text-gray-500 mb-1"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <span className="hover:text-[hsl(270_91%_75%)] cursor-pointer transition-colors">{category}</span>
      <ChevronRight className="w-3 h-3" />
      <span className="text-[hsl(170_80%_50%)] font-medium">{currentPage?.label || 'Dashboard'}</span>
    </motion.nav>
  );
};

const LastUpdatedIndicator: React.FC<{ lastUpdated: Date | null; onRefresh: () => void; isRefreshing: boolean }> = ({ 
  lastUpdated, onRefresh, isRefreshing 
}) => {
  const [, forceUpdate] = useState({});
  
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
        <span className="hidden sm:inline">Updated {getRelativeTime(lastUpdated)}</span>
      )}
      <motion.button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="p-2 glass glass-hover rounded-xl transition-colors disabled:opacity-50"
        title="Refresh data"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
        >
          <RefreshCw className="w-4 h-4" />
        </motion.div>
      </motion.button>
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

  useKeyboardShortcuts();

  useEffect(() => {
    const handleStorage = () => {
      const collapsed = localStorage.getItem('sidebar_collapsed') === 'true';
      setSidebarCollapsed(collapsed);
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

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
      case 'predictions': return <PredictiveInsights />;
      case 'fraud': return <FraudDetection />;
      case 'budget': return <BudgetOptimizer />;
      default: return <Dashboard campaigns={MOCK_CAMPAIGNS} />;
    }
  };

  const allNavItems = [...NAV_ITEMS, ...AI_NAV_ITEMS, ...SETTINGS_NAV_ITEMS];
  const currentPage = allNavItems.find(item => item.id === currentView) || NAV_ITEMS[0];

  return (
    <>
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={handleSidebarCollapse} />
      </div>

      <MobileNav currentPageLabel={currentPage.label} />

      <motion.main 
        className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 pt-28 lg:pt-8 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.header 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <Breadcrumbs currentView={currentView} />
            <motion.h1 
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight heading gradient-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={currentPage.label}
            >
              {currentPage.label}
            </motion.h1>
            <p className="text-sm text-gray-500 mt-1 hidden sm:flex items-center gap-2">
              <Zap className="w-3 h-3 text-[hsl(170_80%_50%)]" />
              Active Profile: <span className="text-[hsl(270_91%_75%)] font-medium">{currentAccount.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <LastUpdatedIndicator 
              lastUpdated={lastUpdated} 
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
            <div className="hidden sm:block w-px h-6 bg-[hsl(270_91%_65%_/_0.2)]" />
            <motion.button 
              onClick={() => setShowShortcuts(true)}
              className="hidden sm:block p-2.5 glass glass-hover rounded-xl transition-all"
              title="Keyboard Shortcuts"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Keyboard className="w-4 h-4 text-gray-400" />
            </motion.button>
            <motion.button 
              onClick={() => setCmdkOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 glass glass-hover rounded-xl text-sm font-medium text-gray-400"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Command className="w-4 h-4" /> 
              <span>Search</span>
              <kbd className="ml-2 px-2 py-1 text-[10px] rounded-lg font-mono"
                style={{
                  background: 'linear-gradient(135deg, hsl(230 20% 15%), hsl(230 20% 12%))',
                  border: '1px solid hsl(270 91% 65% / 0.2)',
                  color: 'hsl(270 91% 75%)',
                }}
              >
                ⌘K
              </kbd>
            </motion.button>
            <motion.button 
              onClick={() => setAiModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.15), hsl(320 80% 60% / 0.1))',
                border: '1px solid hsl(270 91% 65% / 0.3)',
                color: 'hsl(270 91% 75%)',
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 0 30px hsl(270 91% 65% / 0.2)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <span className="hidden sm:inline">Ask Chronos</span>
            </motion.button>
            <UserProfile />
          </div>
        </motion.header>
        
        <PageTransition key={currentView}>
          {renderContent()}
        </PageTransition>
      </motion.main>
      
      <AnimatePresence>
        {showShortcuts && <KeyboardShortcutsHelp onClose={() => setShowShortcuts(false)} />}
      </AnimatePresence>
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
      <div className="flex items-center justify-center h-screen bg-[hsl(230_25%_5%)] text-gray-400">
        <AnimatedBackground />
        <motion.div 
          className="text-center relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))',
              boxShadow: '0 0 40px hsl(270 91% 65% / 0.4)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <BrainCircuit className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-lg font-medium heading gradient-text">Loading workspace...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-gray-200 relative">
      <AnimatedBackground />
      <div className="relative z-10 flex w-full">
        {currentAccount.setupComplete ? <AppContent /> : <OnboardingWizard />}
      </div>
      
      <Toast notifications={toasts} />
      <AnimatePresence>
        {cmdkOpen && <CommandPalette />}
        {aiModalOpen && <ConversationalAI campaigns={MOCK_CAMPAIGNS} />}
      </AnimatePresence>
    </div>
  );
};

export default App;
