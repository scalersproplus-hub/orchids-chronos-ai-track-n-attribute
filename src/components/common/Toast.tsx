import React, { useEffect, useState } from 'react';
import { ToastNotification } from '../../types';
import { CheckCircle, XCircle, Info, X, Undo2, Loader2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ToastProps {
  notifications: ToastNotification[];
}

const ICONS = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    loading: <Loader2 className="w-5 h-5 text-chronos-400 animate-spin" />,
};

const COLORS = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    info: 'border-blue-500/30',
    loading: 'border-chronos-500/30',
};

const ToastItem: React.FC<{ toast: ToastNotification & { onUndo?: () => void; duration?: number } }> = ({ toast }) => {
    const { dispatch } = useApp();
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);
    
    const duration = toast.duration || 5000;
    const showProgress = toast.type !== 'loading';

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
        <div 
            className={`w-80 bg-chronos-900 border ${COLORS[toast.type] || COLORS.info} rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-right-full duration-300`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="p-4 flex items-start gap-3">
                <div className="flex-shrink-0">{ICONS[toast.type] || ICONS.info}</div>
                <div className="flex-1 min-w-0">
                    {toast.title && (
                        <p className="text-sm font-medium text-white mb-0.5">{toast.title}</p>
                    )}
                    <p className="text-sm text-gray-300">{toast.message}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {(toast as any).onUndo && (
                        <button 
                            onClick={handleUndo}
                            className="p-1 text-chronos-400 hover:text-white hover:bg-chronos-800 rounded transition-colors"
                            title="Undo"
                        >
                            <Undo2 className="w-4 h-4" />
                        </button>
                    )}
                    <button 
                        onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })} 
                        className="p-1 text-gray-500 hover:text-white hover:bg-chronos-800 rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {/* Progress bar */}
            {showProgress && (
                <div className="h-0.5 bg-chronos-800">
                    <div 
                        className={`h-full transition-all duration-75 ${
                            toast.type === 'success' ? 'bg-green-500' :
                            toast.type === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

export const Toast: React.FC<ToastProps> = ({ notifications }) => {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 z-[100] space-y-3">
            {notifications.map(toast => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
};