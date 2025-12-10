import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, PlusCircle, Check, Sparkles, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { NAV_ITEMS, AI_NAV_ITEMS, SETTINGS_NAV_ITEMS } from '../constants';

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const AnimatedLogo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <motion.div 
    className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2'}`}
    whileHover={{ scale: 1.02 }}
  >
    <motion.div 
      className="relative w-10 h-10 flex-shrink-0"
      whileHover={{ rotate: 180 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(270_91%_65%)] via-[hsl(320_80%_60%)] to-[hsl(170_80%_50%)] animate-gradient" 
        style={{ backgroundSize: '200% 200%' }}
      />
      <div className="absolute inset-[2px] rounded-[10px] bg-chronos-950 flex items-center justify-center">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M2 17L12 22L22 17"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
          />
          <motion.path
            d="M2 12L12 17L22 12"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="logoGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(270 91% 65%)" />
              <stop offset="0.5" stopColor="hsl(170 80% 50%)" />
              <stop offset="1" stopColor="hsl(320 80% 60%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-[hsl(270_91%_65%)] to-[hsl(170_80%_50%)] opacity-30 blur-lg" />
    </motion.div>
    <AnimatePresence>
      {!collapsed && (
        <motion.span 
          className="text-xl font-bold tracking-tight gradient-text-animated heading"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          CHRONOS
        </motion.span>
      )}
    </AnimatePresence>
  </motion.div>
);

export const Sidebar: React.FC<SidebarProps> = ({ collapsed: controlledCollapsed, onCollapsedChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });
  
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  
  const { state, switchAccount, addAccount, setCurrentView } = useApp();
  const { accounts, currentAccount, currentView } = state;

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  const toggleCollapsed = () => {
    const newState = !collapsed;
    if (onCollapsedChange) {
      onCollapsedChange(newState);
    } else {
      setInternalCollapsed(newState);
    }
  };

  if (!currentAccount) {
    return null;
  }

  const handleAddAccount = () => {
    const newId = addAccount();
    switchAccount(newId);
    setIsDropdownOpen(false); 
  };
  
  const handleSwitchView = (view: string) => {
    setCurrentView(view);
  };

  const NavItem = ({ item }: { item: typeof NAV_ITEMS[0] & { badge?: string } }) => {
    const isActive = currentView === item.id;
    
    return (
      <motion.button
        key={item.id}
        onClick={() => handleSwitchView(item.id)}
        title={collapsed ? item.label : undefined}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
          isActive
            ? 'text-white'
            : 'text-gray-400 hover:text-white'
        } ${collapsed ? 'justify-center px-3' : ''}`}
        whileHover={{ x: collapsed ? 0 : 4 }}
        whileTap={{ scale: 0.98 }}
      >
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            layoutId="activeNav"
            style={{
              background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.15) 0%, hsl(170 80% 50% / 0.1) 100%)',
              border: '1px solid hsl(270 91% 65% / 0.3)',
            }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        
        <motion.div
          className={`relative z-10 p-1.5 rounded-lg ${isActive ? 'bg-gradient-to-br from-[hsl(270_91%_65%)] to-[hsl(170_80%_50%)]' : 'bg-chronos-800 group-hover:bg-chronos-700'}`}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.4 }}
        >
          <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
        </motion.div>
        
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="flex items-center gap-2 flex-1 relative z-10"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <span className="font-medium text-sm text-left truncate">{item.label}</span>
              {(item as any).badge && (
                <motion.span 
                  className="px-2 py-0.5 text-[10px] font-bold rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.2), hsl(320 80% 60% / 0.2))',
                    color: 'hsl(270 91% 75%)',
                    border: '1px solid hsl(270 91% 65% / 0.3)',
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  {(item as any).badge}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="absolute left-full ml-3 px-3 py-2 bg-chronos-900 border border-chronos-700 rounded-xl text-sm text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] shadow-xl">
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-chronos-900 border-l border-b border-chronos-700 rotate-45" />
            {item.label}
            {(item as any).badge && (
              <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-[hsl(270_91%_65%_/_0.2)] text-[hsl(270_91%_75%)] rounded-full">
                {(item as any).badge}
              </span>
            )}
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div 
      className={`glass fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        borderRight: '1px solid hsl(270 91% 65% / 0.1)',
      }}
    >
      <div className="p-5 border-b border-[hsl(270_91%_65%_/_0.1)] space-y-5">
        <AnimatedLogo collapsed={collapsed} />

        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <motion.button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl glass glass-hover transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-start truncate">
                  <span className="text-[10px] text-[hsl(270_91%_75%)] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Workspace
                  </span>
                  <span className="text-sm font-semibold text-white truncate w-44 text-left">{currentAccount.name}</span>
                </div>
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    className="absolute top-full left-0 w-full mt-2 glass rounded-xl shadow-2xl z-50 overflow-hidden"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{ border: '1px solid hsl(270 91% 65% / 0.2)' }}
                  >
                    <div className="max-h-48 overflow-y-auto py-2">
                      {accounts.map((acc, i) => (
                        <motion.button
                          key={acc.id}
                          onClick={() => { switchAccount(acc.id); setIsDropdownOpen(false); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-[hsl(270_91%_65%_/_0.1)] transition-colors"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ x: 4 }}
                        >
                          <span className={`${acc.id === currentAccount.id ? 'text-white font-medium' : 'text-gray-400'}`}>
                            {acc.name}
                          </span>
                          {acc.id === currentAccount.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-gradient-to-br from-[hsl(270_91%_65%)] to-[hsl(170_80%_50%)] flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                    <div className="border-t border-[hsl(270_91%_65%_/_0.1)] p-2">
                      <motion.button 
                        onClick={handleAddAccount}
                        className="w-full flex items-center gap-2 text-xs text-[hsl(170_80%_50%)] hover:text-white justify-center py-2 rounded-lg hover:bg-[hsl(170_80%_50%_/_0.1)] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <PlusCircle className="w-4 h-4" /> Add New Workspace
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          {!collapsed && (
            <motion.span 
              className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-1 h-1 rounded-full bg-[hsl(270_91%_65%)]" />
              Analytics
            </motion.span>
          )}
          <div className="space-y-1 mt-3">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <motion.div 
              className="flex items-center gap-2 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Sparkles className="w-3 h-3 text-[hsl(270_91%_75%)]" />
              <span className="text-[10px] font-bold text-[hsl(270_91%_75%)] uppercase tracking-wider">AI Features</span>
            </motion.div>
          )}
          {collapsed && (
            <div className="flex justify-center py-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-[hsl(270_91%_75%)]" />
              </motion.div>
            </div>
          )}
          <div className="space-y-1 mt-3">
            {AI_NAV_ITEMS.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <motion.span 
              className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-1 h-1 rounded-full bg-[hsl(170_80%_50%)]" />
              Configuration
            </motion.span>
          )}
          <div className="space-y-1 mt-3">
            {SETTINGS_NAV_ITEMS.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {!collapsed && (
          <motion.div 
            className="p-4 border-t border-[hsl(270_91%_65%_/_0.1)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="p-4 rounded-xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.1) 0%, hsl(170 80% 50% / 0.05) 100%)',
                border: '1px solid hsl(270 91% 65% / 0.2)',
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[hsl(270_91%_65%_/_0.2)] to-transparent rounded-full blur-xl" />
              <div className="flex items-center gap-3 mb-2 relative">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-[hsl(270_91%_75%)]" />
                </motion.div>
                <span className="text-sm font-bold text-white heading">Pro Features</span>
              </div>
              <p className="text-[11px] text-gray-400 relative">AI-powered insights enabled for your workspace</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg z-50"
        style={{
          background: 'linear-gradient(135deg, hsl(230 25% 12%), hsl(230 25% 8%))',
          border: '1px solid hsl(270 91% 65% / 0.3)',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        whileHover={{ scale: 1.1, boxShadow: '0 0 20px hsl(270 91% 65% / 0.3)' }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft className="w-3 h-3" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
};
