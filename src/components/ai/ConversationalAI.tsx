import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { Campaign } from '../../types';
import { getConversationalAnswer } from '../../services/geminiService';
import { BrainCircuit, X, Send, Sparkles, AlertCircle, Lightbulb, TrendingUp, Target, DollarSign } from 'lucide-react';

interface ConversationalAIProps {
  campaigns: Campaign[];
}

const SUGGESTED_QUESTIONS = [
  { text: "Which campaign has the highest ROAS?", icon: TrendingUp },
  { text: "What's my total ad spend this month?", icon: DollarSign },
  { text: "Show me the best performing ads", icon: Target },
  { text: "Which campaign should I scale?", icon: Lightbulb },
];

export const ConversationalAI: React.FC<ConversationalAIProps> = ({ campaigns }) => {
    const { setAiModalOpen } = useApp();
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState<{type: 'user' | 'ai', text: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [aiAvailable, setAiAvailable] = useState(false);

    useEffect(() => {
        setAiAvailable(!!import.meta.env.VITE_GEMINI_API_KEY);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;
        
        const userMessage = { type: 'user' as const, text: query };
        setHistory(prev => [...prev, userMessage]);
        setQuery('');
        setIsLoading(true);

        const aiResponse = await getConversationalAnswer(query, campaigns);
        
        setHistory(prev => [...prev, { type: 'ai' as const, text: aiResponse }]);
        setIsLoading(false);
    };

    const handleSuggestionClick = (question: string) => {
        setQuery(question);
    };

    return (
        <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" 
            onClick={() => setAiModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="w-full max-w-2xl glass rounded-2xl shadow-2xl flex flex-col h-[70vh] overflow-hidden"
                style={{ border: '1px solid hsl(270 91% 65% / 0.2)' }}
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-[hsl(270_91%_65%_/_0.1)]">
                    <div className="flex items-center gap-3">
                        <motion.div 
                            className="p-2.5 rounded-xl"
                            style={{ background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))' }}
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <BrainCircuit className="w-5 h-5 text-white"/>
                        </motion.div>
                        <div>
                            <h2 className="font-bold text-white text-lg">Ask Chronos</h2>
                            <p className="text-xs text-gray-500">
                                {aiAvailable ? 'AI-powered insights' : 'Demo mode - sample responses'}
                            </p>
                        </div>
                    </div>
                    <motion.button 
                        onClick={() => setAiModalOpen(false)} 
                        className="p-2 rounded-xl hover:bg-[hsl(270_91%_65%_/_0.1)] text-gray-500 hover:text-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <X className="w-5 h-5"/>
                    </motion.button>
                </div>

                {/* AI Status Banner */}
                {!aiAvailable && (
                    <div className="mx-5 mt-4 p-3 rounded-xl flex items-center gap-3"
                        style={{ 
                            background: 'linear-gradient(135deg, hsl(40 95% 55% / 0.1), transparent)',
                            border: '1px solid hsl(40 95% 55% / 0.2)'
                        }}
                    >
                        <AlertCircle className="w-4 h-4 text-[hsl(40_95%_55%)] flex-shrink-0" />
                        <p className="text-xs text-gray-300">
                            <span className="font-medium text-[hsl(40_95%_60%)]">Demo Mode:</span> Responses are simulated. 
                            Add a Gemini API key in Settings for full AI capabilities.
                        </p>
                    </div>
                )}

                {/* Chat Area */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                    {history.length === 0 && (
                        <div className="text-center py-8">
                            <motion.div 
                                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.2), transparent)' }}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Sparkles className="w-8 h-8 text-[hsl(270_91%_75%)]" />
                            </motion.div>
                            <h3 className="text-white font-semibold mb-2">How can I help?</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                                Ask me anything about your campaigns, ROAS, conversions, or ad performance.
                            </p>
                            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                                {SUGGESTED_QUESTIONS.map((q, i) => (
                                    <motion.button
                                        key={i}
                                        onClick={() => handleSuggestionClick(q.text)}
                                        className="text-left p-3 rounded-xl glass text-sm text-gray-300 hover:text-white transition-all flex items-start gap-2"
                                        style={{ border: '1px solid hsl(230 20% 15%)' }}
                                        whileHover={{ x: 4, borderColor: 'hsl(270 91% 65% / 0.3)' }}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <q.icon className="w-4 h-4 text-[hsl(270_91%_70%)] mt-0.5 flex-shrink-0" />
                                        <span>{q.text}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <AnimatePresence mode="popLayout">
                        {history.map((msg, i) => (
                            <motion.div 
                                key={i} 
                                className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                               {msg.type === 'ai' && (
                                   <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                       style={{ background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.2), transparent)' }}
                                   >
                                       <Sparkles className="w-4 h-4 text-[hsl(270_91%_75%)]"/>
                                   </div>
                               )}
                               <div className={`max-w-md p-3 rounded-xl ${
                                   msg.type === 'user' 
                                       ? 'text-white' 
                                       : 'glass text-gray-200'
                               }`}
                               style={msg.type === 'user' ? {
                                   background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))'
                               } : {
                                   border: '1px solid hsl(230 20% 15%)'
                               }}
                               >
                                   {msg.text}
                               </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {isLoading && (
                        <motion.div 
                            className="flex gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.2), transparent)' }}
                            >
                                <Sparkles className="w-4 h-4 text-[hsl(270_91%_75%)]"/>
                            </div>
                            <div className="glass p-3 rounded-xl" style={{ border: '1px solid hsl(230 20% 15%)' }}>
                                <motion.div 
                                    className="flex gap-1"
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <span className="w-2 h-2 rounded-full bg-[hsl(270_91%_65%)]"></span>
                                    <span className="w-2 h-2 rounded-full bg-[hsl(270_91%_65%)]"></span>
                                    <span className="w-2 h-2 rounded-full bg-[hsl(270_91%_65%)]"></span>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-5 border-t border-[hsl(270_91%_65%_/_0.1)]">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask about your campaigns..."
                            className="w-full bg-[hsl(230_20%_10%)] border border-[hsl(270_91%_65%_/_0.2)] rounded-xl p-4 pr-14 text-white placeholder:text-gray-500 focus:border-[hsl(270_91%_65%_/_0.5)] focus:ring-1 focus:ring-[hsl(270_91%_65%_/_0.3)] transition-all"
                        />
                        <motion.button 
                            type="submit" 
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg disabled:opacity-50 transition-all"
                            style={{
                                background: query.trim() ? 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))' : 'transparent',
                                color: query.trim() ? 'white' : 'hsl(270 91% 65%)',
                            }}
                            disabled={isLoading || !query.trim()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Send className="w-5 h-5"/>
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};