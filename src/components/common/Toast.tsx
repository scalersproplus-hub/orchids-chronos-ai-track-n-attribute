import React from 'react';
import { ToastNotification } from '../../types';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ToastProps {
  notifications: ToastNotification[];
}

const ICONS = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
};

export const Toast: React.FC<ToastProps> = ({ notifications }) => {
    const { dispatch } = useApp();
    
    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 z-[100] space-y-3">
            {notifications.map(toast => (
                <div 
                    key={toast.id}
                    className="w-80 bg-chronos-900 border border-chronos-800 rounded-lg shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-bottom"
                >
                    <div className="flex-shrink-0">{ICONS[toast.type]}</div>
                    <p className="flex-1 text-sm text-gray-200">{toast.message}</p>
                    <button onClick={() => dispatch({type: 'REMOVE_TOAST', payload: toast.id})} className="text-gray-500 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};
