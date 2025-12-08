import React, { useState } from 'react';
import { ChevronDown, PlusCircle, Check, BrainCircuit } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { NAV_ITEMS } from '../../constants';

interface SidebarProps {}

export const Sidebar: React.FC<SidebarProps> = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { state, switchAccount, addAccount, setCurrentView } = useApp();
  const { accounts, currentAccount, currentView } = state;

  if (!currentAccount) {
    return null; // or a loading skeleton
  }

  const handleAddAccount = () => {
    const newId = addAccount();
    switchAccount(newId);
    // Onboarding wizard will handle the view
    setIsDropdownOpen(false); 
  };
  
  const handleSwitchView = (view: string) => {
    setCurrentView(view);
  };

  return (
    <div className="w-64 bg-chronos-950 border-r border-chronos-800 flex flex-col h-full fixed left-0 top-0 z-50">
      {/* Brand & Account Switcher */}
      <div className="p-4 border-b border-chronos-800 space-y-4">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-gradient-to-br from-chronos-500 to-chronos-accent rounded-lg flex items-center justify-center">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">CHRONOS</span>
        </div>

        {/* Account Dropdown */}
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
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSwitchView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === item.id
                ? 'bg-chronos-900 text-chronos-400 border border-chronos-800'
                : 'text-gray-400 hover:text-white hover:bg-chronos-900/50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-chronos-800">
         {/* User Profile Component can be placed here in the future */}
      </div>
    </div>
  );
};