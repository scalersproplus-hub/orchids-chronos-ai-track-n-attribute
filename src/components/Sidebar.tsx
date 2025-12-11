import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, PlusCircle, Check, Sparkles, ChevronLeft, Zap, Layers, Crown, Activity } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { NAV_ITEMS, AI_NAV_ITEMS, SETTINGS_NAV_ITEMS } from '../constants';

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const AnimatedLogo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <motion.div 
    className={`flex items-center gap-4 ${collapsed ? 'justify-center' : 'px-1'}`}
    whileHover={{ scale: 1.01 }}
  >
    <motion.div 
      className="relative w-11 h-11 flex-shrink-0"
      whileHover={{ rotate: 180 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, hsl(252 87% 64%), hsl(330 80% 58%), hsl(165 82% 51%))',
          backgroundSize: '200% 200%',
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-[2px] rounded-[10px] bg-[hsl(225_15%_6%)] flex items-center justify-center">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.path
            d="M2 17L12 22L22 17"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          />
          <motion.path
            d="M2 12L12 17L22 12"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="logoGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(252 87% 72%)" />
              <stop offset="0.5" stopColor="hsl(165 82% 58%)" />
              <stop offset="1" stopColor="hsl(330 80% 62%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-[hsl(252_87%_64%)] to-[hsl(165_82%_51%)] opacity-15 blur-xl pointer-events-none" />
    </motion.div>
    <AnimatePresence>
      {!collapsed && (
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-xl font-bold tracking-tight gradient-text-animated heading">
            CHRONOS
          </span>
          <span className="text-[10px] text-[hsl(225_12%_45%)] font-medium tracking-[0.2em] uppercase">
            Intelligence
          </span>
        </motion.div>
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

  const NavItem = ({ item, isAI = false }: { item: typeof NAV_ITEMS[0] & { badge?: string }; isAI?: boolean }) => {
    const isActive = currentView === item.id;
    
    return (
      <motion.button
        key={item.id}
        onClick={() => handleSwitchView(item.id)}
        title={collapsed ? item.label : undefined}
        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-400 group relative overflow-hidden ${
          isActive
            ? 'text-white'
            : 'text-[hsl(225_12%_50%)] hover:text-white'
        } ${collapsed ? 'justify-center px-3' : ''}`}
        whileHover={{ x: collapsed ? 0 : 4 }}
        whileTap={{ scale: 0.98 }}
      >
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            layoutId="activeNav"
            style={{
              background: isAI 
                ? 'linear-gradient(135deg, hsl(252 87% 64% / 0.08) 0%, hsl(330 80% 60% / 0.05) 100%)'
                : 'linear-gradient(135deg, hsl(252 87% 64% / 0.06) 0%, hsl(165 82% 51% / 0.04) 100%)',
              border: `1px solid ${isAI ? 'hsl(252 87% 64% / 0.15)' : 'hsl(252 87% 64% / 0.12)'}`,
            }}
            transition={{ type: "spring", bounce: 0.12, duration: 0.5 }}
          />
        )}
        
        <motion.div
          className={`relative z-10 p-2 rounded-lg transition-all duration-400 ${
            isActive 
              ? '' 
              : 'bg-[hsl(225_15%_11%)] group-hover:bg-[hsl(225_15%_14%)]'
          }`}
          style={{
            background: isActive 
              ? isAI 
                ? 'linear-gradient(135deg, hsl(252 87% 60%), hsl(330 80% 55%))'
                : 'linear-gradient(135deg, hsl(252 87% 60%), hsl(165 82% 48%))'
              : undefined,
            boxShadow: isActive ? `0 4px 16px ${isAI ? 'hsl(252 87% 50% / 0.3)' : 'hsl(252 87% 50% / 0.25)'}` : 'none',
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[hsl(225_12%_50%)] group-hover:text-white'}`} />
        </motion.div>
        
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="flex items-center gap-2 flex-1 relative z-10"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="font-medium text-[13px] text-left truncate">{item.label}</span>
              {(item as any).badge && (
                <motion.span 
                  className="px-2 py-0.5 text-[8px] font-bold rounded-md"
                  style={{
                    background: 'linear-gradient(135deg, hsl(252 87% 64% / 0.15), hsl(330 80% 60% / 0.1))',
                    color: 'hsl(252 92% 78%)',
                    border: '1px solid hsl(252 87% 64% / 0.18)',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  {(item as any).badge}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="absolute left-full ml-4 px-3 py-2.5 bg-[hsl(225_15%_10%)] border border-[hsl(225_15%_18%)] rounded-xl text-[13px] text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] shadow-2xl">
            <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-3 h-3 bg-[hsl(225_15%_10%)] border-l border-b border-[hsl(225_15%_18%)] rotate-45" />
            {item.label}
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div 
      className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-500 ${collapsed ? 'w-20' : 'w-[280px]'}`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'linear-gradient(180deg, hsl(225 15% 7% / 0.98) 0%, hsl(225 15% 5% / 0.99) 100%)',
        backdropFilter: 'blur(48px) saturate(180%)',
        borderRight: '1px solid hsl(225 15% 14% / 0.5)',
        boxShadow: '6px 0 48px -24px hsl(252 50% 20% / 0.15)',
      }}
    >
      <div className="p-5 border-b border-[hsl(225_15%_14%_/_0.5)] space-y-5">
        <AnimatedLogo collapsed={collapsed} />

        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <motion.button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl transition-all group"
                style={{
                  background: 'linear-gradient(145deg, hsl(225 15% 9% / 0.95) 0%, hsl(225 15% 7% / 0.98) 100%)',
                  border: '1px solid hsl(225 15% 16% / 0.6)',
                }}
                whileHover={{ 
                  scale: 1.01,
                  borderColor: 'hsl(252 87% 64% / 0.12)',
                }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3 truncate">
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, hsl(252 87% 64% / 0.1), hsl(165 82% 51% / 0.05))',
                      border: '1px solid hsl(252 87% 64% / 0.12)',
                    }}
                  >
                    <Layers className="w-4 h-4 text-[hsl(252_92%_78%)]" />
                  </div>
                  <div className="flex flex-col items-start truncate">
                    <span className="text-[9px] text-[hsl(165_82%_55%)] font-semibold uppercase tracking-[0.15em] flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5" /> Workspace
                    </span>
                    <span className="text-[13px] font-semibold text-white truncate max-w-[140px]">{currentAccount.name}</span>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown className="w-4 h-4 text-[hsl(225_12%_45%)] group-hover:text-white" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    className="absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl z-50 overflow-hidden"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ 
                      background: 'hsl(225 15% 8%)',
                      border: '1px solid hsl(225 15% 16% / 0.7)',
                      boxShadow: '0 24px 64px -20px hsl(225 15% 0% / 0.5)',
                    }}
                  >
                    <div className="max-h-48 overflow-y-auto py-2">
                      {accounts.map((acc, i) => (
                        <motion.button
                          key={acc.id}
                          onClick={() => { switchAccount(acc.id); setIsDropdownOpen(false); }}
                          className="w-full flex items-center justify-between px-4 py-3 text-[13px] text-left hover:bg-[hsl(252_87%_64%_/_0.04)] transition-colors"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          whileHover={{ x: 4 }}
                        >
                          <span className={`${acc.id === currentAccount.id ? 'text-white font-medium' : 'text-[hsl(225_12%_55%)]'}`}>
                            {acc.name}
                          </span>
                          {acc.id === currentAccount.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-md flex items-center justify-center"
                              style={{ 
                                background: 'linear-gradient(135deg, hsl(252 87% 60%), hsl(165 82% 48%))',
                                boxShadow: '0 2px 8px hsl(252 87% 50% / 0.25)'
                              }}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                    <div className="border-t border-[hsl(225_15%_14%_/_0.5)] p-2">
                      <motion.button 
                        onClick={handleAddAccount}
                        className="w-full flex items-center gap-2 text-[12px] text-[hsl(165_82%_55%)] hover:text-white justify-center py-2.5 rounded-lg hover:bg-[hsl(165_82%_51%_/_0.08)] transition-colors font-medium"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <PlusCircle className="w-4 h-4" /> New Workspace
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 p-4 space-y-8 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {!collapsed && (
            <motion.span 
              className="text-[10px] font-semibold text-[hsl(225_12%_40%)] uppercase tracking-[0.15em] px-4 flex items-center gap-2 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-1 h-1 rounded-full bg-[hsl(252_87%_64%)]" />
              Analytics
            </motion.span>
          )}
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <motion.div 
              className="flex items-center gap-2 px-4 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-[hsl(252_92%_78%)]" />
              </motion.div>
              <span className="text-[10px] font-semibold text-[hsl(252_92%_78%)] uppercase tracking-[0.15em]">AI Features</span>
              <span className="px-1.5 py-0.5 text-[7px] font-bold rounded bg-[hsl(252_87%_64%_/_0.1)] text-[hsl(252_92%_78%)] border border-[hsl(252_87%_64%_/_0.15)]">PRO</span>
            </motion.div>
          )}
          {collapsed && (
            <div className="flex justify-center py-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-[hsl(252_92%_78%)]" />
              </motion.div>
            </div>
          )}
          <div className="space-y-1">
            {AI_NAV_ITEMS.map((item) => (
              <NavItem key={item.id} item={item} isAI />
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <motion.span 
              className="text-[10px] font-semibold text-[hsl(225_12%_40%)] uppercase tracking-[0.15em] px-4 flex items-center gap-2 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-1 h-1 rounded-full bg-[hsl(165_82%_51%)]" />
              Configuration
            </motion.span>
          )}
          <div className="space-y-1">
            {SETTINGS_NAV_ITEMS.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {!collapsed && (
          <motion.div 
            className="p-4 border-t border-[hsl(225_15%_14%_/_0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="p-4 rounded-xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, hsl(252 87% 64% / 0.05) 0%, hsl(165 82% 51% / 0.02) 100%)',
                border: '1px solid hsl(252 87% 64% / 0.08)',
              }}
              whileHover={{ 
                scale: 1.01,
                boxShadow: '0 8px 32px hsl(252 87% 50% / 0.1)',
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[hsl(252_87%_64%_/_0.1)] to-transparent rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-2 relative">
                <motion.div
                  className="p-2 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, hsl(252 87% 64% / 0.15), hsl(330 80% 60% / 0.1))',
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                >
                  <Crown className="w-4 h-4 text-[hsl(252_92%_78%)]" />
                </motion.div>
                <span className="text-[13px] font-semibold text-white heading">Pro Active</span>
              </div>
              <p className="text-[11px] text-[hsl(225_12%_50%)] relative leading-relaxed">Full AI intelligence enabled for your workspace.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleCollapsed}
        className="absolute -right-3.5 top-24 w-7 h-7 rounded-full flex items-center justify-center text-[hsl(225_12%_50%)] hover:text-white transition-all z-50"
        style={{
          background: 'linear-gradient(145deg, hsl(225 15% 12%), hsl(225 15% 8%))',
          border: '1px solid hsl(225 15% 18% / 0.7)',
          boxShadow: '0 4px 16px hsl(225 15% 0% / 0.3)',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        whileHover={{ 
          scale: 1.1, 
          boxShadow: '0 0 24px hsl(252 87% 64% / 0.15)',
          borderColor: 'hsl(252 87% 64% / 0.25)',
        }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
};