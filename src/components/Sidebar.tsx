import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, PlusCircle, Check, Sparkles, ChevronLeft, Zap, Layers, Crown } from 'lucide-react';
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
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, hsl(258 89% 66%), hsl(328 85% 60%), hsl(168 84% 52%))',
          backgroundSize: '200% 200%',
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-[2px] rounded-[14px] bg-[hsl(222_47%_4%)] flex items-center justify-center">
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
              <stop stopColor="hsl(258 89% 75%)" />
              <stop offset="0.5" stopColor="hsl(168 84% 60%)" />
              <stop offset="1" stopColor="hsl(328 85% 65%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-[hsl(258_89%_66%)] to-[hsl(168_84%_52%)] opacity-20 blur-xl pointer-events-none" />
    </motion.div>
    <AnimatePresence>
      {!collapsed && (
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-xl font-bold tracking-tight gradient-text-animated heading">
            CHRONOS
          </span>
          <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
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
        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
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
              background: isAI 
                ? 'linear-gradient(135deg, hsl(258 89% 66% / 0.12) 0%, hsl(328 85% 60% / 0.08) 100%)'
                : 'linear-gradient(135deg, hsl(258 89% 66% / 0.1) 0%, hsl(168 84% 52% / 0.06) 100%)',
              border: `1px solid ${isAI ? 'hsl(258 89% 66% / 0.25)' : 'hsl(258 89% 66% / 0.2)'}`,
            }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
          />
        )}
        
        <motion.div
          className={`relative z-10 p-2 rounded-lg transition-all duration-300 ${
            isActive 
              ? isAI 
                ? 'bg-gradient-to-br from-[hsl(258_89%_66%)] to-[hsl(328_85%_60%)]' 
                : 'bg-gradient-to-br from-[hsl(258_89%_66%)] to-[hsl(168_84%_52%)]'
              : 'bg-[hsl(222_30%_10%)] group-hover:bg-[hsl(222_25%_14%)]'
          }`}
          style={{
            boxShadow: isActive ? '0 4px 12px hsl(258 89% 50% / 0.25)' : 'none',
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
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
              transition={{ duration: 0.2 }}
            >
              <span className="font-medium text-sm text-left truncate">{item.label}</span>
              {(item as any).badge && (
                <motion.span 
                  className="px-2 py-0.5 text-[9px] font-bold rounded-md"
                  style={{
                    background: 'linear-gradient(135deg, hsl(258 89% 66% / 0.2), hsl(328 85% 60% / 0.15))',
                    color: 'hsl(258 95% 80%)',
                    border: '1px solid hsl(258 89% 66% / 0.25)',
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
          <div className="absolute left-full ml-4 px-3 py-2.5 bg-[hsl(222_47%_8%)] border border-[hsl(258_89%_66%_/_0.15)] rounded-xl text-sm text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] shadow-xl">
            <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-3 h-3 bg-[hsl(222_47%_8%)] border-l border-b border-[hsl(258_89%_66%_/_0.15)] rotate-45" />
            {item.label}
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div 
      className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-400 ${collapsed ? 'w-20' : 'w-[280px]'}`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'linear-gradient(180deg, hsl(222 47% 5% / 0.98) 0%, hsl(222 47% 4% / 0.99) 100%)',
        backdropFilter: 'blur(40px) saturate(200%)',
        borderRight: '1px solid hsl(258 89% 66% / 0.06)',
        boxShadow: '4px 0 40px -20px hsl(258 89% 40% / 0.2)',
      }}
    >
      <div className="p-5 border-b border-[hsl(258_89%_66%_/_0.06)] space-y-5">
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
                  background: 'linear-gradient(135deg, hsl(222 47% 7% / 0.9) 0%, hsl(222 47% 6% / 0.95) 100%)',
                  border: '1px solid hsl(258 89% 66% / 0.08)',
                }}
                whileHover={{ 
                  scale: 1.01,
                  borderColor: 'hsl(258 89% 66% / 0.15)',
                }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3 truncate">
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, hsl(258 89% 66% / 0.15), hsl(168 84% 52% / 0.08))',
                      border: '1px solid hsl(258 89% 66% / 0.15)',
                    }}
                  >
                    <Layers className="w-4 h-4 text-[hsl(258_95%_80%)]" />
                  </div>
                  <div className="flex flex-col items-start truncate">
                    <span className="text-[9px] text-[hsl(168_84%_60%)] font-bold uppercase tracking-widest flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" /> Workspace
                    </span>
                    <span className="text-sm font-semibold text-white truncate max-w-[140px]">{currentAccount.name}</span>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    className="absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl z-50 overflow-hidden"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{ 
                      background: 'hsl(222 47% 6%)',
                      border: '1px solid hsl(258 89% 66% / 0.12)',
                      boxShadow: '0 20px 60px -20px hsl(258 89% 40% / 0.4)',
                    }}
                  >
                    <div className="max-h-48 overflow-y-auto py-2">
                      {accounts.map((acc, i) => (
                        <motion.button
                          key={acc.id}
                          onClick={() => { switchAccount(acc.id); setIsDropdownOpen(false); }}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-[hsl(258_89%_66%_/_0.06)] transition-colors"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          whileHover={{ x: 4 }}
                        >
                          <span className={`${acc.id === currentAccount.id ? 'text-white font-medium' : 'text-gray-400'}`}>
                            {acc.name}
                          </span>
                          {acc.id === currentAccount.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-md bg-gradient-to-br from-[hsl(258_89%_66%)] to-[hsl(168_84%_52%)] flex items-center justify-center"
                              style={{ boxShadow: '0 2px 8px hsl(258 89% 50% / 0.3)' }}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                    <div className="border-t border-[hsl(258_89%_66%_/_0.08)] p-2">
                      <motion.button 
                        onClick={handleAddAccount}
                        className="w-full flex items-center gap-2 text-xs text-[hsl(168_84%_60%)] hover:text-white justify-center py-2.5 rounded-lg hover:bg-[hsl(168_84%_52%_/_0.1)] transition-colors font-medium"
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
              className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 flex items-center gap-2 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-1 h-1 rounded-full bg-[hsl(258_89%_66%)]" />
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
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-[hsl(258_95%_80%)]" />
              </motion.div>
              <span className="text-[10px] font-bold text-[hsl(258_95%_80%)] uppercase tracking-widest">AI Features</span>
              <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-[hsl(258_89%_66%_/_0.15)] text-[hsl(258_95%_80%)] border border-[hsl(258_89%_66%_/_0.2)]">PRO</span>
            </motion.div>
          )}
          {collapsed && (
            <div className="flex justify-center py-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-[hsl(258_95%_80%)]" />
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
              className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 flex items-center gap-2 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-1 h-1 rounded-full bg-[hsl(168_84%_52%)]" />
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
            className="p-4 border-t border-[hsl(258_89%_66%_/_0.06)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="p-4 rounded-2xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(258 89% 66% / 0.08) 0%, hsl(168 84% 52% / 0.04) 100%)',
                border: '1px solid hsl(258 89% 66% / 0.12)',
              }}
              whileHover={{ 
                scale: 1.01,
                boxShadow: '0 8px 32px hsl(258 89% 50% / 0.15)',
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[hsl(258_89%_66%_/_0.15)] to-transparent rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-2 relative">
                <motion.div
                  className="p-2 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, hsl(258 89% 66% / 0.2), hsl(328 85% 60% / 0.15))',
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <Crown className="w-4 h-4 text-[hsl(258_95%_80%)]" />
                </motion.div>
                <span className="text-sm font-bold text-white heading">Pro Active</span>
              </div>
              <p className="text-[11px] text-gray-400 relative leading-relaxed">Full AI intelligence enabled for your workspace.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleCollapsed}
        className="absolute -right-3.5 top-24 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all z-50"
        style={{
          background: 'linear-gradient(135deg, hsl(222 47% 10%), hsl(222 47% 6%))',
          border: '1px solid hsl(258 89% 66% / 0.2)',
          boxShadow: '0 4px 16px hsl(222 47% 0% / 0.4)',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        whileHover={{ 
          scale: 1.1, 
          boxShadow: '0 0 24px hsl(258 89% 66% / 0.25)',
          borderColor: 'hsl(258 89% 66% / 0.4)',
        }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
};