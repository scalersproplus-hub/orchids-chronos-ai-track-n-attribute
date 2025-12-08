import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ChevronDown, User, LogOut } from 'lucide-react';

export const UserProfile: React.FC = () => {
    const { state } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-chronos-500 to-purple-500 border-2 border-chronos-950 shadow-lg"></div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-chronos-900 border border-chronos-800 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95">
                    <div className="p-2 border-b border-chronos-800">
                        <div className="font-bold text-white">{state.user.name}</div>
                        <div className="text-xs text-gray-400">{state.user.email}</div>
                    </div>
                    <div className="p-1">
                        <button className="w-full flex items-center gap-2 p-2 rounded text-sm text-gray-300 hover:bg-chronos-800">
                            <User className="w-4 h-4" /> Profile
                        </button>
                        <button className="w-full flex items-center gap-2 p-2 rounded text-sm text-red-400 hover:bg-chronos-800">
                            <LogOut className="w-4 h-4" /> Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
