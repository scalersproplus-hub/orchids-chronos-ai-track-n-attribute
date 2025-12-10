import { LayoutDashboard, Compass, Users, UploadCloud, Package, Settings, BarChart, BookOpen, Brain, Shield, DollarSign, Play, Cog, TrendingUp } from 'lucide-react';

export const NAV_ITEMS = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'journey', icon: Compass, label: 'Customer Journeys' },
    { id: 'identity', icon: Users, label: 'AI Identity Graph' },
    { id: 'attribution', icon: BarChart, label: 'Attribution Models' },
    { id: 'offline', icon: UploadCloud, label: 'Offline Conversions' },
    { id: 'datasources', icon: Package, label: 'Data Sources' },
];

export const AI_NAV_ITEMS = [
    { id: 'predictions', icon: Brain, label: 'Predictive Insights', badge: 'AI' },
    { id: 'fraud', icon: Shield, label: 'Fraud Detection', badge: 'AI' },
    { id: 'budget', icon: DollarSign, label: 'Budget Optimizer', badge: 'AI' },
    { id: 'forecast', icon: TrendingUp, label: 'Conversion Forecast', badge: 'NEW' },
    { id: 'replay', icon: Play, label: 'Session Replay', badge: 'NEW' },
    { id: 'rules', icon: Cog, label: 'Rules Engine', badge: 'NEW' },
];

// Settings & Setup
export const SETTINGS_NAV_ITEMS = [
    { id: 'setup', icon: BookOpen, label: 'Setup Guide' },
    { id: 'settings', icon: Settings, label: 'Settings' },
];

export const API_ENDPOINTS = {
    META_CAPI: (pixelId: string) => `https://graph.facebook.com/v19.0/${pixelId}/events`,
    GOOGLE_OCI: (customerId: string) => `https://googleads.googleapis.com/v15/customers/${customerId}/clickConversions:upload`,
    CHRONOS_TAG_INGEST: 'https://ingest.chronos-demo.io/v1/events'
};