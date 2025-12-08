import { useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';

export const useKeyboardShortcuts = () => {
  const { setCmdkOpen, setAiModalOpen, setCurrentView, state } = useApp();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow Escape in inputs
      if (e.key !== 'Escape') return;
    }

    // Command/Ctrl + K - Open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCmdkOpen(true);
    }

    // Command/Ctrl + Shift + A - Open AI assistant
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      setAiModalOpen(true);
    }

    // Escape - Close modals
    if (e.key === 'Escape') {
      if (state.cmdkOpen) setCmdkOpen(false);
      if (state.aiModalOpen) setAiModalOpen(false);
    }

    // Number shortcuts for navigation (1-8)
    if (!e.metaKey && !e.ctrlKey && !e.altKey && !state.cmdkOpen && !state.aiModalOpen) {
      const views = ['dashboard', 'journey', 'identity', 'attribution', 'offline', 'datasources', 'setup', 'settings'];
      const num = parseInt(e.key);
      if (num >= 1 && num <= views.length) {
        e.preventDefault();
        setCurrentView(views[num - 1]);
      }
    }

    // G + D - Go to Dashboard
    // G + J - Go to Journey
    // G + S - Go to Settings
    // etc.
  }, [setCmdkOpen, setAiModalOpen, setCurrentView, state.cmdkOpen, state.aiModalOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export const KEYBOARD_SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Open command palette' },
  { keys: ['⌘', '⇧', 'A'], description: 'Open AI assistant' },
  { keys: ['Esc'], description: 'Close modal' },
  { keys: ['1-8'], description: 'Quick navigation' },
];
