import React, { useState, useEffect } from 'react';
import { Menu, X, BrainCircuit, ChevronDown, Check, PlusCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { NAV_ITEMS, AI_NAV_ITEMS, SETTINGS_NAV_ITEMS } from '../../constants';

interface MobileNavProps {
  currentPageLabel: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPageLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const { state, setCurrentView, switchAccount, addAccount } = useApp();
  const { currentView, currentAccount, accounts } = state;

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [currentView]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setIsOpen(false);
  };

  const handleAddAccount = () => {
    const newId = addAccount();
    switchAccount(newId);
    setShowAccountSwitcher(false);
    setIsOpen(false);
  };

  const NavSection = ({ title, items, showAIBadge = false }: { 
    title: string; 
    items: typeof NAV_ITEMS;
    showAIBadge?: boolean;
  }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 px-4 mb-2">
        {showAIBadge && <Sparkles className="w-3 h-3 text-purple-400" />}
        <span className={`text-[10px] font-bold uppercase tracking-wider ${showAIBadge ? 'text-purple-400' : 'text-gray-600'}`}>
          {title}
        </span>
      </div>
      <div className="space-y-1">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
              currentView === item.id
                ? 'bg-chronos-800 text-chronos-400 border-l-2 border-chronos-500'
                : 'text-gray-400 hover:bg-chronos-800/50 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            {(item as any).badge && (
              <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-400 rounded">
                {(item as any).badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-chronos-950 border-b border-chronos-800">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-chronos-500 to-chronos-accent rounded-lg flex items-center justify-center">
              <BrainCircuit className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-white">CHRONOS</span>
          </div>

          <div className="w-10" /> {/* Spacer for balance */}
        </div>
        
        {/* Current page indicator */}
        <div className="px-4 py-2 bg-chronos-900/50 border-t border-chronos-800">
          <span className="text-xs text-gray-500">
            {currentAccount?.name} / <span className="text-chronos-400">{currentPageLabel}</span>
          </span>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-[60]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-chronos-950 z-[70] transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-chronos-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-chronos-500 to-chronos-accent rounded-lg flex items-center justify-center">
              <BrainCircuit className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">CHRONOS</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Switcher */}
        <div className="p-4 border-b border-chronos-800">
          <button
            onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
            className="w-full flex items-center justify-between p-3 bg-chronos-900 rounded-lg border border-chronos-800"
          >
            <div className="text-left">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Workspace</div>
              <div className="text-sm font-medium text-white truncate">{currentAccount?.name}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showAccountSwitcher ? 'rotate-180' : ''}`} />
          </button>

          {showAccountSwitcher && (
            <div className="mt-2 bg-chronos-900 border border-chronos-800 rounded-lg overflow-hidden">
              <div className="max-h-40 overflow-y-auto">
                {accounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      switchAccount(acc.id);
                      setShowAccountSwitcher(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-chronos-800"
                  >
                    <span className={acc.id === currentAccount?.id ? 'text-white' : 'text-gray-400'}>
                      {acc.name}
                    </span>
                    {acc.id === currentAccount?.id && <Check className="w-4 h-4 text-chronos-500" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-chronos-800 p-2">
                <button
                  onClick={handleAddAccount}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs text-chronos-400 hover:text-white"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add New Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <NavSection title="Analytics" items={NAV_ITEMS} />
          <NavSection title="AI Features" items={AI_NAV_ITEMS} showAIBadge />
          <NavSection title="Configuration" items={SETTINGS_NAV_ITEMS} />
        </div>

        {/* Pro Badge */}
        <div className="p-4 border-t border-chronos-800">
          <div className="p-3 bg-gradient-to-r from-purple-900/20 to-chronos-900/20 border border-purple-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-white">Pro Features</span>
            </div>
            <p className="text-[10px] text-gray-400">AI-powered insights enabled</p>
          </div>
        </div>
      </div>
    </>
  );
};
