import React, { createContext, useContext, useEffect, useReducer, ReactNode, Dispatch } from 'react';
import { AccountProfile, ToastNotification, UserProfile } from '../types';
import { DEFAULT_ACCOUNT } from '../services/mockData';

interface AppState {
    accounts: AccountProfile[];
    currentAccount: AccountProfile;
    currentView: string;
    toasts: ToastNotification[];
    cmdkOpen: boolean;
    aiModalOpen: boolean;
    user: UserProfile;
}

type Action =
    | { type: 'SWITCH_ACCOUNT'; payload: string }
    | { type: 'ADD_ACCOUNT'; payload: AccountProfile }
    | { type: 'UPDATE_ACCOUNT'; payload: AccountProfile }
    | { type: 'UPDATE_SUPABASE_CONFIG'; payload: { url: string; key: string } }
    | { type: 'MARK_SETUP_COMPLETE'; payload: string }
    | { type: 'SET_CURRENT_VIEW'; payload: string }
    | { type: 'ADD_TOAST'; payload: Omit<ToastNotification, 'id'> }
    | { type: 'REMOVE_TOAST'; payload: string }
    | { type: 'SET_CMDK_OPEN'; payload: boolean }
    | { type: 'SET_AI_MODAL_OPEN'; payload: boolean };

const defaultAccounts = [DEFAULT_ACCOUNT];

const initialState: AppState = {
    accounts: defaultAccounts,
    currentAccount: defaultAccounts[0],
    currentView: 'dashboard',
    toasts: [],
    cmdkOpen: false,
    aiModalOpen: false,
    user: { name: '', email: '', avatarUrl: '' },
};

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SWITCH_ACCOUNT':
            return { ...state, currentAccount: state.accounts.find(a => a.id === action.payload) || state.currentAccount };
        case 'ADD_ACCOUNT':
            return { ...state, accounts: [...state.accounts, action.payload] };
        case 'UPDATE_ACCOUNT':
            const newAccounts = state.accounts.map(a => a.id === action.payload.id ? action.payload : a);
            return { 
                ...state, 
                accounts: newAccounts, 
                currentAccount: state.currentAccount.id === action.payload.id ? action.payload : state.currentAccount 
            };
        case 'UPDATE_SUPABASE_CONFIG':
            const updatedAccount = {
                ...state.currentAccount,
                supabaseConfig: action.payload
            };
            return {
                ...state,
                currentAccount: updatedAccount,
                accounts: state.accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a)
            };
        case 'MARK_SETUP_COMPLETE':
            const completedAccounts = state.accounts.map(a => a.id === action.payload ? { ...a, setupComplete: true } : a);
            return { 
                ...state, 
                accounts: completedAccounts, 
                currentAccount: state.currentAccount.id === action.payload 
                    ? { ...state.currentAccount, setupComplete: true } 
                    : state.currentAccount 
            };
        case 'SET_CURRENT_VIEW':
            return { ...state, currentView: action.payload };
        case 'ADD_TOAST':
            return { ...state, toasts: [...state.toasts, { id: `toast_${Date.now()}`, ...action.payload }] };
        case 'REMOVE_TOAST':
            return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
        case 'SET_CMDK_OPEN':
            return { ...state, cmdkOpen: action.payload };
        case 'SET_AI_MODAL_OPEN':
            return { ...state, aiModalOpen: action.payload };
        default:
            return state;
    }
};

interface AppContextType {
    state: AppState;
    dispatch: Dispatch<Action>;
    // Direct accessors for convenience
    currentAccount: AccountProfile;
    supabaseConfig: { url: string; key: string };
    // Action creators
    switchAccount: (id: string) => void;
    addAccount: () => string;
    updateAccount: (acc: AccountProfile) => void;
    updateSupabaseConfig: (config: { url: string; key: string }) => void;
    markSetupComplete: (id: string) => void;
    setCurrentView: (view: string) => void;
    addToast: (toast: Omit<ToastNotification, 'id'>) => void;
    setCmdkOpen: (isOpen: boolean) => void;
    setAiModalOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    // Load from localStorage or use defaults
    const getStoredData = () => {
        try {
            const stored = localStorage.getItem('chronos_app_state');
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    accounts: parsed.accounts || defaultAccounts,
                    lastAccountId: parsed.lastAccountId || defaultAccounts[0].id
                };
            }
        } catch (e) {
            console.error('Error loading stored data:', e);
        }
        return { accounts: defaultAccounts, lastAccountId: defaultAccounts[0].id };
    };

    const storedData = getStoredData();
    
    const [state, dispatch] = useReducer(appReducer, {
        ...initialState,
        accounts: storedData.accounts,
        currentAccount: storedData.accounts.find((a: AccountProfile) => a.id === storedData.lastAccountId) || storedData.accounts[0],
    });

    // Persist to localStorage on state changes
    useEffect(() => {
        try {
            localStorage.setItem('chronos_app_state', JSON.stringify({
                accounts: state.accounts,
                lastAccountId: state.currentAccount.id
            }));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }, [state.accounts, state.currentAccount.id]);

    // Action creators
    const switchAccount = (id: string) => dispatch({ type: 'SWITCH_ACCOUNT', payload: id });
    
    const addAccount = () => {
        const newAccount: AccountProfile = {
            id: `act_${Date.now()}`,
            name: 'New Client Account',
            websiteUrl: '',
            currency: 'USD',
            timezone: 'UTC',
            setupComplete: false,
            metaPixelId: '',
            metaCapiToken: '',
            metaTestCode: '',
            supabaseConfig: { url: '', key: '' }
        };
        dispatch({ type: 'ADD_ACCOUNT', payload: newAccount });
        return newAccount.id;
    };
    
    const updateAccount = (acc: AccountProfile) => dispatch({ type: 'UPDATE_ACCOUNT', payload: acc });
    const updateSupabaseConfig = (config: { url: string; key: string }) => dispatch({ type: 'UPDATE_SUPABASE_CONFIG', payload: config });
    const markSetupComplete = (id: string) => dispatch({ type: 'MARK_SETUP_COMPLETE', payload: id });
    const setCurrentView = (view: string) => dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
    const addToast = (toast: Omit<ToastNotification, 'id'>) => dispatch({ type: 'ADD_TOAST', payload: toast });
    const setCmdkOpen = (isOpen: boolean) => dispatch({ type: 'SET_CMDK_OPEN', payload: isOpen });
    const setAiModalOpen = (isOpen: boolean) => dispatch({ type: 'SET_AI_MODAL_OPEN', payload: isOpen });

    // Auto-remove toasts after 5 seconds
    useEffect(() => {
        if (state.toasts.length > 0) {
            const timer = setTimeout(() => {
                dispatch({ type: 'REMOVE_TOAST', payload: state.toasts[0].id });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [state.toasts]);

    const value: AppContextType = {
        state,
        dispatch,
        currentAccount: state.currentAccount,
        supabaseConfig: state.currentAccount.supabaseConfig,
        switchAccount,
        addAccount,
        updateAccount,
        updateSupabaseConfig,
        markSetupComplete,
        setCurrentView,
        addToast,
        setCmdkOpen,
        setAiModalOpen
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useApp must be used within an AppProvider');
    return context;
};