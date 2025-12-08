import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

export const useCommandK = () => {
    const { setCmdkOpen } = useApp();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCmdkOpen(true);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [setCmdkOpen]);
};
