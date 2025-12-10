import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastNotification } from '../../types';
import { CheckCircle, XCircle, Info, X, Undo2, Loader2, Sparkles } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ToastProps {
  notifications: ToastNotification[];
}

const ICONS = {
    success: <CheckCircle className="w-5 h-5 text-[hsl(150_80%_50%)]" />,
    error: <XCircle className="w-5 h-5 text-[hsl(0_80%_60%)]" />,
    info: <Info className="w-5 h-5 text-[hsl(270_91%_75%)]" />,
    loading: <Loader2 className="w-5 h-5 text-[hsl(170_80%_50%)] animate-spin" />,
};

const STYLES = {
    success: {
        border: 'hsl(150 80% 45% / 0.3)',
        glow: 'hsl(150 80% 45% / 0.2)',
        progress: 'hsl(150 80% 50%)',
    },
    error: {
        border: 'hsl(0 80% 55% / 0.3)',
        glow: 'hsl(0 80% 55% / 0.2)',
        progress: 'hsl(0 80% 55%)',
    },
    info: {
        border: 'hsl(270 91% 65% / 0.3)',
        glow: 'hsl(270 91% 65% / 0.2)',
        progress: 'hsl(270 91% 65%)',
    },
    loading: {
        border: 'hsl(170 80% 50% / 0.3)',
        glow: 'hsl(170 80% 50% / 0.2)',
        progress: 'hsl(170 80% 50%)',
    },
};

const ToastItem: React.FC<{ toast: ToastNotification & { onUndo?: () => void; duration?: number } }> = ({ toast }) => {
    const { dispatch } = useApp();
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);
    
    const duration = toast.duration || 5000;
    const showProgress = toast.type !== 'loading';
    const style = STYLES[toast.type] || STYLES.info;

    useEffect(() => {
        if (isPaused || !showProgress) return;
        
        const startTime = Date.now();
        const initialProgress = progress;
        
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = initialProgress - ((elapsed / duration) * 100);
            
            if (remaining <= 0) {
                clearInterval(timer);
                dispatch({ type: 'REMOVE_TOAST', payload: toast.id });
            } else {
                setProgress(remaining);
            }
        }, 50);
        
        return () => clearInterval(timer);
    }, [isPaused, toast.id, dispatch, duration, progress, showProgress]);

    const handleUndo = () => {
        if ((toast as any).onUndo) {
            (toast as any).onUndo();
        }
        dispatch({ type: 'REMOVE_TOAST', payload: toast.id });
    };

    return (
        <motion.div 
            className="w-80 glass overflow-hidden"
            style={{ 
                borderRadius: '1rem',
                border: `1px solid ${style.border}`,
                boxShadow: `0 10px 40px ${style.glow}`,
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            initial={{ x: 100, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            whileHover={{ scale: 1.02 }}
            layout
        >
            <div className="p-4 flex items-start gap-3">
                <motion.div 
                    className="flex-shrink-0 p-1"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1 }}
                >
                    {ICONS[toast.type] || ICONS.info}
                </motion.div>
                <div className="flex-1 min-w-0">
                    {toast.title && (
                        <motion.p 
                            className="text-sm font-semibold text-white mb-0.5"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {toast.title}
                        </motion.p>
                    )}
                    <motion.p 
                        className="text-sm text-gray-300"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        {toast.message}
                    </motion.p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {(toast as any).onUndo && (
                        <motion.button 
                            onClick={handleUndo}
                            className="p-1.5 text-[hsl(170_80%_50%)] hover:text-white hover:bg-[hsl(170_80%_50%_/_0.1)] rounded-lg transition-colors"
                            title="Undo"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Undo2 className="w-4 h-4" />
                        </motion.button>
                    )}
                    <motion.button 
                        onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })} 
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-[hsl(270_91%_65%_/_0.1)] rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <X className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
            
            {showProgress && (
                <div className="h-1 bg-[hsl(230_20%_12%)]">
                    <motion.div 
                        className="h-full"
                        style={{ 
                            background: `linear-gradient(90deg, ${style.progress}, ${style.progress}80)`,
                            width: `${progress}%` 
                        }}
                        initial={{ width: '100%' }}
                        transition={{ duration: 0.1 }}
                    />
                </div>
            )}
        </motion.div>
    );
};

export const Toast: React.FC<ToastProps> = ({ notifications }) => {
    return (
        <div className="fixed bottom-5 right-5 z-[100] space-y-3">
            <AnimatePresence mode="popLayout">
                {notifications.map(toast => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </AnimatePresence>
        </div>
    );
};
