import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { Search, Clock, ArrowRight, CornerDownLeft, ArrowUp, ArrowDown, X, Sparkles, Zap } from 'lucide-react';
import { MOCK_JOURNEYS } from '../../services/mockData';
import { NAV_ITEMS, AI_NAV_ITEMS, SETTINGS_NAV_ITEMS } from '../../constants';

const RECENT_SEARCHES_KEY = 'chronos_recent_searches';
const MAX_RECENT_SEARCHES = 5;

type SearchResult = {
    id: string;
    type: 'navigation' | 'customer' | 'action';
    title: string;
    subtitle?: string;
    icon?: React.ComponentType<any>;
    action: () => void;
};

export const CommandPalette: React.FC = () => {
    const { setCmdkOpen, setCurrentView, setAiModalOpen, addToast } = useApp();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
            try {
                setRecentSearches(JSON.parse(stored));
            } catch (e) {
                console.error('Error loading recent searches:', e);
            }
        }
    }, []);

    const saveRecentSearch = useCallback((search: string) => {
        if (!search.trim()) return;
        
        setRecentSearches(prev => {
            const updated = [search, ...prev.filter(s => s !== search)].slice(0, MAX_RECENT_SEARCHES);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
        addToast({ type: 'info', message: 'Recent searches cleared' });
    };

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setCmdkOpen(false);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [setCmdkOpen]);

    const allNavItems = [...NAV_ITEMS, ...AI_NAV_ITEMS, ...SETTINGS_NAV_ITEMS];
    
    const getResults = (): SearchResult[] => {
        const results: SearchResult[] = [];
        const q = query.toLowerCase();

        const filteredNav = allNavItems.filter(item => 
            item.label.toLowerCase().includes(q)
        );
        filteredNav.forEach(item => {
            results.push({
                id: `nav-${item.id}`,
                type: 'navigation',
                title: item.label,
                subtitle: 'Navigate to page',
                icon: item.icon,
                action: () => {
                    setCurrentView(item.id);
                    setCmdkOpen(false);
                    saveRecentSearch(item.label);
                }
            });
        });

        const filteredCustomers = MOCK_JOURNEYS.filter(j => 
            j.customerName.toLowerCase().includes(q) || 
            j.email.toLowerCase().includes(q)
        ).slice(0, 5);
        
        filteredCustomers.forEach(customer => {
            results.push({
                id: `customer-${customer.id}`,
                type: 'customer',
                title: customer.customerName,
                subtitle: customer.email,
                action: () => {
                    setCurrentView('journey');
                    setCmdkOpen(false);
                    saveRecentSearch(customer.customerName);
                }
            });
        });

        if (query.length === 0 || 'ask ai'.includes(q) || 'chronos'.includes(q)) {
            results.push({
                id: 'action-ai',
                type: 'action',
                title: 'Ask Chronos AI',
                subtitle: 'Open AI assistant',
                action: () => {
                    setAiModalOpen(true);
                    setCmdkOpen(false);
                }
            });
        }

        if (query.length === 0 || 'refresh'.includes(q) || 'reload'.includes(q)) {
            results.push({
                id: 'action-refresh',
                type: 'action',
                title: 'Refresh Data',
                subtitle: 'Reload dashboard data',
                action: () => {
                    addToast({ type: 'info', message: 'Refreshing data...' });
                    setCmdkOpen(false);
                }
            });
        }

        return results;
    };

    const results = getResults();

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        if (resultsRef.current) {
            const selectedItem = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (results[selectedIndex]) {
                    results[selectedIndex].action();
                }
                break;
        }
    };

    const handleRecentSearchClick = (search: string) => {
        setQuery(search);
        inputRef.current?.focus();
    };

    return (
        <motion.div 
            className="fixed inset-0 z-50 flex items-start justify-center pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setCmdkOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            />
            <motion.div 
                className="w-full max-w-lg glass shadow-2xl overflow-hidden relative"
                style={{ 
                    borderRadius: '1.25rem',
                    border: '1px solid hsl(270 91% 65% / 0.2)' 
                }}
                onClick={e => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                initial={{ scale: 0.95, y: -20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: -20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                <div className="relative border-b border-[hsl(270_91%_65%_/_0.1)]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(270_91%_75%)]"/>
                    <input 
                        ref={inputRef}
                        type="text"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search pages, customers, or actions..."
                        className="w-full bg-transparent p-5 pl-14 pr-12 text-white placeholder:text-gray-500 focus:outline-none text-base"
                    />
                    <AnimatePresence>
                        {query && (
                            <motion.button 
                                onClick={() => setQuery('')}
                                className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-white hover:bg-[hsl(270_91%_65%_/_0.1)] rounded-lg transition-colors"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X className="w-4 h-4" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                <div ref={resultsRef} className="max-h-80 overflow-y-auto p-3">
                    {query.length === 0 && recentSearches.length > 0 && (
                        <motion.div 
                            className="mb-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="flex items-center justify-between px-3 py-2">
                                <span className="text-xs text-gray-500 font-semibold flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-[hsl(270_91%_75%)]" /> Recent Searches
                                </span>
                                <motion.button 
                                    onClick={clearRecentSearches}
                                    className="text-xs text-gray-600 hover:text-[hsl(270_91%_75%)] transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Clear
                                </motion.button>
                            </div>
                            {recentSearches.map((search, i) => (
                                <motion.button 
                                    key={i}
                                    onClick={() => handleRecentSearchClick(search)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-[hsl(270_91%_65%_/_0.1)] hover:text-white text-left transition-colors"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ x: 4 }}
                                >
                                    <Clock className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm">{search}</span>
                                </motion.button>
                            ))}
                            <div className="border-t border-[hsl(270_91%_65%_/_0.1)] my-3" />
                        </motion.div>
                    )}

                    {results.length > 0 ? (
                        <>
                            {['navigation', 'customer', 'action'].map(type => {
                                const typeResults = results.filter(r => r.type === type);
                                if (typeResults.length === 0) return null;
                                
                                return (
                                    <div key={type} className="mb-3">
                                        <div className="px-3 py-2 text-xs text-gray-500 font-semibold flex items-center gap-2">
                                            {type === 'navigation' ? (
                                                <Zap className="w-3 h-3 text-[hsl(170_80%_50%)]" />
                                            ) : type === 'action' ? (
                                                <Sparkles className="w-3 h-3 text-[hsl(270_91%_75%)]" />
                                            ) : null}
                                            {type === 'navigation' ? 'Pages' : type === 'customer' ? 'Customers' : 'Quick Actions'}
                                        </div>
                                        {typeResults.map((result, i) => {
                                            const index = results.indexOf(result);
                                            return (
                                                <motion.button 
                                                    key={result.id}
                                                    data-index={index}
                                                    onClick={result.action}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                                                        selectedIndex === index 
                                                            ? 'text-white' 
                                                            : 'text-gray-300 hover:text-white'
                                                    }`}
                                                    style={{
                                                        background: selectedIndex === index 
                                                            ? 'linear-gradient(135deg, hsl(270 91% 65% / 0.15), hsl(170 80% 50% / 0.1))'
                                                            : 'transparent',
                                                        border: selectedIndex === index 
                                                            ? '1px solid hsl(270 91% 65% / 0.3)'
                                                            : '1px solid transparent',
                                                    }}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    whileHover={{ x: 4 }}
                                                >
                                                    <motion.div 
                                                        className={`p-2 rounded-lg ${
                                                            selectedIndex === index 
                                                                ? 'bg-gradient-to-br from-[hsl(270_91%_65%)] to-[hsl(170_80%_50%)]' 
                                                                : 'bg-[hsl(230_20%_15%)]'
                                                        }`}
                                                        whileHover={{ rotate: [0, -5, 5, 0] }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        {result.icon ? (
                                                            <result.icon className={`w-4 h-4 ${selectedIndex === index ? 'text-white' : 'text-gray-500'}`} />
                                                        ) : (
                                                            <ArrowRight className={`w-4 h-4 ${selectedIndex === index ? 'text-white' : 'text-gray-500'}`} />
                                                        )}
                                                    </motion.div>
                                                    <div className="flex-1 text-left">
                                                        <div className="text-sm font-medium">{result.title}</div>
                                                        {result.subtitle && (
                                                            <div className="text-xs text-gray-500">{result.subtitle}</div>
                                                        )}
                                                    </div>
                                                    {selectedIndex === index && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                        >
                                                            <CornerDownLeft className="w-4 h-4 text-[hsl(270_91%_75%)]" />
                                                        </motion.div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </>
                    ) : query.length > 0 ? (
                        <motion.div 
                            className="p-8 text-center text-gray-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <p className="text-sm">No results found for "{query}"</p>
                            <p className="text-xs mt-1 text-gray-600">Try searching for pages or customer names</p>
                        </motion.div>
                    ) : null}
                </div>

                <div className="border-t border-[hsl(270_91%_65%_/_0.1)] p-4 bg-[hsl(230_25%_5%)] flex items-center justify-between text-xs text-gray-500 rounded-b-xl">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-2 py-1 rounded-lg font-mono"
                                style={{
                                    background: 'linear-gradient(135deg, hsl(230 20% 15%), hsl(230 20% 12%))',
                                    border: '1px solid hsl(270 91% 65% / 0.2)',
                                    color: 'hsl(270 91% 75%)',
                                }}
                            >
                                <ArrowUp className="w-3 h-3 inline" />
                            </kbd>
                            <kbd className="px-2 py-1 rounded-lg font-mono"
                                style={{
                                    background: 'linear-gradient(135deg, hsl(230 20% 15%), hsl(230 20% 12%))',
                                    border: '1px solid hsl(270 91% 65% / 0.2)',
                                    color: 'hsl(270 91% 75%)',
                                }}
                            >
                                <ArrowDown className="w-3 h-3 inline" />
                            </kbd>
                            <span className="text-gray-500">Navigate</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-2 py-1 rounded-lg font-mono"
                                style={{
                                    background: 'linear-gradient(135deg, hsl(230 20% 15%), hsl(230 20% 12%))',
                                    border: '1px solid hsl(270 91% 65% / 0.2)',
                                    color: 'hsl(270 91% 75%)',
                                }}
                            >↵</kbd>
                            <span className="text-gray-500">Select</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-2 py-1 rounded-lg font-mono"
                                style={{
                                    background: 'linear-gradient(135deg, hsl(230 20% 15%), hsl(230 20% 12%))',
                                    border: '1px solid hsl(270 91% 65% / 0.2)',
                                    color: 'hsl(270 91% 75%)',
                                }}
                            >Esc</kbd>
                            <span className="text-gray-500">Close</span>
                        </span>
                    </div>
                    <span className="text-[hsl(170_80%_50%)]">{results.length} results</span>
                </div>
            </motion.div>
        </motion.div>
    );
};
