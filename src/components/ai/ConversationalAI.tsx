import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Campaign } from '../../types';
import { getConversationalAnswer } from '../../services/geminiService';
import { BrainCircuit, X, Send, Sparkles } from 'lucide-react';

interface ConversationalAIProps {
  campaigns: Campaign[];
}

export const ConversationalAI: React.FC<ConversationalAIProps> = ({ campaigns }) => {
    const { setAiModalOpen } = useApp();
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState<{type: 'user' | 'ai', text: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;
        
        const userMessage = { type: 'user' as const, text: query };
        setHistory(prev => [...prev, userMessage]);
        setQuery('');
        setIsLoading(true);

        const aiResponse = await getConversationalAnswer(query, campaigns);
        
        const aiMessage = { type: 'ai' as const, text: aiResponse };
        setHistory(prev => [...prev, userMessage, aiMessage]);
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center" onClick={() => setAiModalOpen(false)}>
            <div className="w-full max-w-2xl bg-chronos-900 border border-chronos-800 rounded-xl shadow-2xl flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-chronos-800">
                    <h2 className="flex items-center gap-2 font-bold text-white"><BrainCircuit className="w-5 h-5 text-chronos-accent"/> Ask Chronos</h2>
                    <button onClick={() => setAiModalOpen(false)} className="text-gray-500 hover:text-white"><X/></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {history.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                           {msg.type === 'ai' && <div className="w-8 h-8 rounded-full bg-chronos-accent/20 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4 text-chronos-accent"/></div>}
                           <div className={`max-w-md p-3 rounded-lg ${msg.type === 'user' ? 'bg-chronos-500 text-white' : 'bg-chronos-800 text-gray-200'}`}>
                               {msg.text}
                           </div>
                        </div>
                    ))}
                     {isLoading && <div className="text-center text-gray-500 animate-pulse">Chronos is thinking...</div>}
                </div>
                <form onSubmit={handleSubmit} className="p-4 border-t border-chronos-800">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., Which campaign had the highest ROAS last month?"
                            className="w-full bg-chronos-800 border border-chronos-700 rounded-lg p-3 pr-12 text-white placeholder:text-gray-500"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-chronos-400 hover:text-white disabled:opacity-50" disabled={isLoading}>
                            <Send className="w-5 h-5"/>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
