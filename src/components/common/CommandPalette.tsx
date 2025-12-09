import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Search, Clock, ArrowRight, CornerDownLeft, ArrowUp, ArrowDown, X } from 'lucide-react';
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

    // Load recent searches
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

    // Save recent search
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

    // Close on escape
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setCmdkOpen(false);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [setCmdkOpen]);

    // Build search results
    const allNavItems = [...NAV_ITEMS, ...AI_NAV_ITEMS, ...SETTINGS_NAV_ITEMS];
    
    const getResults = (): SearchResult[] => {
        const results: SearchResult[] = [];
        const q = query.toLowerCase();

        // Navigation items
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

        // Customers
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

        // Quick actions
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

    // Reset selected index when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current) {
            const selectedItem = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    // Keyboard navigation
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20" onClick={() => setCmdkOpen(false)}>
            <div 
                className="w-full max-w-lg bg-chronos-900 border border-chronos-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden" 
                onClick={e => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                {/* Search Input */}
                <div className="relative border-b border-chronos-800">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
                    <input 
                        ref={inputRef}
                        type="text"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search pages, customers, or actions..."
                        className="w-full bg-transparent p-4 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none"
                    />
                    {query && (
                        <button 
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white hover:bg-chronos-800 rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Results */}
                <div ref={resultsRef} className="max-h-80 overflow-y-auto p-2">
                    {/* Recent Searches (when no query) */}
                    {query.length === 0 && recentSearches.length > 0 && (
                        <div className="mb-2">
                            <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Recent Searches
                                </span>
                                <button 
                                    onClick={clearRecentSearches}
                                    className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                            {recentSearches.map((search, i) => (
                                <button 
                                    key={i}
                                    onClick={() => handleRecentSearchClick(search)}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:bg-chronos-800 hover:text-white text-left"
                                >
                                    <Clock className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm">{search}</span>
                                </button>
                            ))}
                            <div className="border-t border-chronos-800 my-2" />
                        </div>
                    )}

                    {/* Search Results */}
                    {results.length > 0 ? (
                        <>
                            {/* Group by type */}
                            {['navigation', 'customer', 'action'].map(type => {
                                const typeResults = results.filter(r => r.type === type);
                                if (typeResults.length === 0) return null;
                                
                                return (
                                    <div key={type} className="mb-2">
                                        <div className="px-2 py-1 text-xs text-gray-500 font-semibold capitalize">
                                            {type === 'navigation' ? 'Pages' : type === 'customer' ? 'Customers' : 'Quick Actions'}
                                        </div>
                                        {typeResults.map(result => {
                                            const index = results.indexOf(result);
                                            return (
                                                <button 
                                                    key={result.id}
                                                    data-index={index}
                                                    onClick={result.action}
                                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                                        selectedIndex === index 
                                                            ? 'bg-chronos-800 text-white' 
                                                            : 'text-gray-300 hover:bg-chronos-800/50 hover:text-white'
                                                    }`}
                                                >
                                                    {result.icon ? (
                                                        <result.icon className="w-4 h-4 text-gray-500" />
                                                    ) : (
                                                        <ArrowRight className="w-4 h-4 text-gray-500" />
                                                    )}
                                                    <div className="flex-1 text-left">
                                                        <div className="text-sm">{result.title}</div>
                                                        {result.subtitle && (
                                                            <div className="text-xs text-gray-500">{result.subtitle}</div>
                                                        )}
                                                    </div>
                                                    {selectedIndex === index && (
                                                        <CornerDownLeft className="w-4 h-4 text-gray-500" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </>
                    ) : query.length > 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p className="text-sm">No results found for "{query}"</p>
                            <p className="text-xs mt-1">Try searching for pages or customer names</p>
                        </div>
                    ) : null}
                </div>

                {/* Footer with keyboard hints */}
                <div className="border-t border-chronos-800 p-3 bg-chronos-950 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-chronos-800 rounded border border-chronos-700">
                                <ArrowUp className="w-3 h-3 inline" />
                            </kbd>
                            <kbd className="px-1.5 py-0.5 bg-chronos-800 rounded border border-chronos-700">
                                <ArrowDown className="w-3 h-3 inline" />
                            </kbd>
                            <span className="ml-1">Navigate</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-chronos-800 rounded border border-chronos-700">↵</kbd>
                            <span className="ml-1">Select</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-chronos-800 rounded border border-chronos-700">Esc</kbd>
                            <span className="ml-1">Close</span>
                        </span>
                    </div>
                    <span className="text-gray-600">{results.length} results</span>
                </div>
            </div>
        </div>
    );
};