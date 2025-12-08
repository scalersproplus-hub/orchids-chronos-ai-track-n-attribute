import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Search } from 'lucide-react';
import { MOCK_JOURNEYS } from '../../services/mockData';
import { NAV_ITEMS } from '@/constants';

export const CommandPalette: React.FC = () => {
    const { setCmdkOpen, setCurrentView } = useApp();
    const [query, setQuery] = useState('');

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setCmdkOpen(false);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [setCmdkOpen]);

    const handleSelect = (view: string) => {
        setCurrentView(view);
        setCmdkOpen(false);
    }
    
    const filteredNav = NAV_ITEMS.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));
    const filteredCustomers = MOCK_JOURNEYS.filter(j => j.customerName.toLowerCase().includes(query.toLowerCase()) || j.email.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20" onClick={() => setCmdkOpen(false)}>
            <div className="w-full max-w-lg bg-chronos-900 border border-chronos-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
                    <input 
                        type="text"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for pages or customers..."
                        className="w-full bg-transparent border-b border-chronos-800 p-4 pl-12 text-white placeholder:text-gray-500 focus:outline-none"
                    />
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                    {filteredNav.length > 0 && <div className="px-2 py-1 text-xs text-gray-500 font-semibold">Navigation</div>}
                    {filteredNav.map(item => (
                        <button key={item.id} onClick={() => handleSelect(item.id)} className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-300 hover:bg-chronos-800 hover:text-white">
                            <item.icon className="w-4 h-4" /> {item.label}
                        </button>
                    ))}
                    {filteredCustomers.length > 0 && <div className="px-2 py-1 mt-2 text-xs text-gray-500 font-semibold">Customers</div>}
                    {filteredCustomers.map(customer => (
                        <button key={customer.id} onClick={() => handleSelect('journey')} className="w-full flex flex-col items-start p-2 rounded-lg text-gray-300 hover:bg-chronos-800 hover:text-white">
                            <div>{customer.customerName}</div>
                            <div className="text-xs text-gray-500">{customer.email}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};