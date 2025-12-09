import React, { useState, useEffect } from 'react';
import { ChevronDown, PlusCircle, Check, BrainCircuit, Sparkles, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { NAV_ITEMS, AI_NAV_ITEMS, SETTINGS_NAV_ITEMS } from '../constants';

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

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

  // Persist collapsed state
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

  const NavItem = ({ item, badge }: { item: typeof NAV_ITEMS[0] & { badge?: string }, badge?: string }) => (
    <button
      key={item.id}
      onClick={() => handleSwitchView(item.id)}
      title={collapsed ? item.label : undefined}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${
        currentView === item.id
          ? 'bg-chronos-900 text-chronos-400 border border-chronos-800'
          : 'text-gray-400 hover:text-white hover:bg-chronos-900/50'
      } ${collapsed ? 'justify-center px-2' : ''}`}
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="font-medium text-sm flex-1 text-left truncate">{item.label}</span>
          {(item as any).badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500/20 to-chronos-500/20 text-purple-400 rounded border border-purple-500/30">
              {(item as any).badge}
            </span>
          )}
        </>
      )}
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-chronos-800 border border-chronos-700 rounded text-xs text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
          {item.label}
          {(item as any).badge && (
            <span className="ml-1 px-1 py-0.5 text-[9px] font-bold bg-purple-500/20 text-purple-400 rounded">
              {(item as any).badge}
            </span>
          )}
        </div>
      )}
    </button>
  );

  return (
    <div className={`bg-chronos-950 border-r border-chronos-800 flex flex-col h-full fixed left-0 top-0 z-50 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Brand & Account Switcher */}
      <div className="p-4 border-b border-chronos-800 space-y-4">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : 'px-2'}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-chronos-500 to-chronos-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          {!collapsed && <span className="text-xl font-bold tracking-tight text-white">CHRONOS</span>}
        </div>

        {/* Account Dropdown - Hidden when collapsed */}
        {!collapsed && (
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-chronos-900 border border-chronos-800 hover:border-chronos-600 transition-all group"
            >
               <div className="flex flex-col items-start truncate">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Workspace</span>
                  <span className="text-sm font-medium text-white truncate w-36 text-left">{currentAccount.name}</span>
               </div>
               <ChevronDown className={`w-4 h-4 text-gray-500 group-hover:text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-chronos-900 border border-chronos-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                 <div className="max-h-48 overflow-y-auto">
                   {accounts.map(acc => (
                     <button
                       key={acc.id}
                       onClick={() => { switchAccount(acc.id); setIsDropdownOpen(false); }}
                       className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-chronos-800 transition-colors"
                     >
                       <span className={`${acc.id === currentAccount.id ? 'text-white' : 'text-gray-400'}`}>
                         {acc.name}
                       </span>
                       {acc.id === currentAccount.id && <Check className="w-3 h-3 text-chronos-500" />}
                     </button>
                   ))}
                 </div>
                 <div className="border-t border-chronos-800 p-2">
                   <button 
                    onClick={handleAddAccount}
                    className="w-full flex items-center gap-2 text-xs text-chronos-400 hover:text-white justify-center py-1"
                   >
                      <PlusCircle className="w-3 h-3" /> Add New Account
                   </button>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {!collapsed && <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider px-4">Analytics</span>}
          <div className="space-y-1 mt-2">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* AI Features */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="flex items-center gap-2 px-4">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">AI Features</span>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center py-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
            </div>
          )}
          <div className="space-y-1 mt-2">
            {AI_NAV_ITEMS.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-1">
          {!collapsed && <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider px-4">Configuration</span>}
          <div className="space-y-1 mt-2">
            {SETTINGS_NAV_ITEMS.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Pro Features Badge - Simplified when collapsed */}
      {!collapsed && (
        <div className="p-4 border-t border-chronos-800">
          <div className="p-3 bg-gradient-to-r from-purple-900/20 to-chronos-900/20 border border-purple-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-white">Pro Features</span>
            </div>
            <p className="text-[10px] text-gray-400">AI-powered insights enabled</p>
          </div>
        </div>
      )}

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-20 w-6 h-6 bg-chronos-800 border border-chronos-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-chronos-700 transition-all shadow-lg"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </div>
  );
};