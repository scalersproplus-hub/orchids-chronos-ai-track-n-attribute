import React from 'react';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';

type DialogVariant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: DialogVariant;
    isLoading?: boolean;
}

const VARIANT_STYLES: Record<DialogVariant, { icon: React.ReactNode; buttonClass: string; iconBg: string }> = {
    danger: {
        icon: <Trash2 className="w-6 h-6 text-red-400" />,
        buttonClass: 'bg-red-500 hover:bg-red-600 text-white',
        iconBg: 'bg-red-500/20',
    },
    warning: {
        icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
        buttonClass: 'bg-yellow-500 hover:bg-yellow-600 text-black',
        iconBg: 'bg-yellow-500/20',
    },
    info: {
        icon: <Info className="w-6 h-6 text-blue-400" />,
        buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white',
        iconBg: 'bg-blue-500/20',
    },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false,
}) => {
    if (!isOpen) return null;

    const styles = VARIANT_STYLES[variant];

    const handleConfirm = () => {
        onConfirm();
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" 
            onClick={onClose}
        >
            <div 
                className="w-full max-w-md bg-chronos-900 border border-chronos-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start gap-4 p-6">
                    <div className={`p-3 rounded-full ${styles.iconBg}`}>
                        {styles.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{message}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 text-gray-500 hover:text-white hover:bg-chronos-800 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-chronos-800 bg-chronos-950 rounded-b-xl">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-chronos-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${styles.buttonClass}`}
                    >
                        {isLoading && (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Hook for easier usage
import { useState, useCallback } from 'react';

interface UseConfirmDialogOptions {
    title: string;
    message: string;
    confirmText?: string;
    variant?: DialogVariant;
}

export const useConfirmDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<UseConfirmDialogOptions | null>(null);
    const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: UseConfirmDialogOptions): Promise<boolean> => {
        setOptions(opts);
        setIsOpen(true);
        
        return new Promise((resolve) => {
            setResolveRef(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        resolveRef?.(true);
        setIsOpen(false);
    }, [resolveRef]);

    const handleClose = useCallback(() => {
        resolveRef?.(false);
        setIsOpen(false);
    }, [resolveRef]);

    const Dialog = options ? (
        <ConfirmDialog
            isOpen={isOpen}
            onClose={handleClose}
            onConfirm={handleConfirm}
            title={options.title}
            message={options.message}
            confirmText={options.confirmText}
            variant={options.variant}
        />
    ) : null;

    return { confirm, Dialog };
};
