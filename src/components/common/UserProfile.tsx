import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { ChevronDown, User, LogOut, Settings, Sparkles } from 'lucide-react';

export const UserProfile: React.FC = () => {
    const { state } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="relative">
            <motion.button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-[hsl(270_91%_65%_/_0.1)] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <motion.div 
                    className="relative w-10 h-10 rounded-xl overflow-hidden"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                >
                    <div 
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%), hsl(170 80% 50%))',
                        }}
                    />
                    <div className="absolute inset-[2px] rounded-[10px] bg-chronos-950 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                            {state.user.name.charAt(0)}
                        </span>
                    </div>
                </motion.div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.div>
            </motion.button>
            
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div 
                            className="absolute top-full right-0 mt-2 w-56 glass shadow-2xl z-50 overflow-hidden"
                            style={{ 
                                borderRadius: '1rem',
                                border: '1px solid hsl(270 91% 65% / 0.2)' 
                            }}
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="p-4 border-b border-[hsl(270_91%_65%_/_0.1)]">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{
                                            background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))',
                                        }}
                                    >
                                        <span className="text-lg font-bold text-white">
                                            {state.user.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-white heading">{state.user.name}</div>
                                        <div className="text-xs text-gray-400">{state.user.email}</div>
                                    </div>
                                </div>
                                <div 
                                    className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2 text-xs"
                                    style={{
                                        background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.1), hsl(170 80% 50% / 0.05))',
                                        border: '1px solid hsl(270 91% 65% / 0.2)',
                                    }}
                                >
                                    <Sparkles className="w-3 h-3 text-[hsl(270_91%_75%)]" />
                                    <span className="text-[hsl(270_91%_75%)] font-medium">Pro Plan Active</span>
                                </div>
                            </div>
                            <div className="p-2">
                                <motion.button 
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm text-gray-300 hover:bg-[hsl(270_91%_65%_/_0.1)] hover:text-white transition-colors"
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="p-1.5 rounded-lg bg-[hsl(230_20%_15%)]">
                                        <User className="w-4 h-4 text-gray-500" />
                                    </div>
                                    Profile Settings
                                </motion.button>
                                <motion.button 
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm text-gray-300 hover:bg-[hsl(270_91%_65%_/_0.1)] hover:text-white transition-colors"
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="p-1.5 rounded-lg bg-[hsl(230_20%_15%)]">
                                        <Settings className="w-4 h-4 text-gray-500" />
                                    </div>
                                    Preferences
                                </motion.button>
                                <div className="border-t border-[hsl(270_91%_65%_/_0.1)] my-2" />
                                <motion.button 
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm text-[hsl(0_80%_60%)] hover:bg-[hsl(0_80%_55%_/_0.1)] transition-colors"
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="p-1.5 rounded-lg bg-[hsl(0_80%_55%_/_0.1)]">
                                        <LogOut className="w-4 h-4" />
                                    </div>
                                    Log Out
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
