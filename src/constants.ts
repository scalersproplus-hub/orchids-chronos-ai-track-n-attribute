import { LayoutDashboard, Compass, Users, UploadCloud, Package, Settings, BarChart, BookOpen } from 'lucide-react';

export const NAV_ITEMS = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'journey', icon: Compass, label: 'Customer Journeys' },
    { id: 'identity', icon: Users, label: 'AI Identity Graph' },
    { id: 'attribution', icon: BarChart, label: 'Attribution Models' },
    { id: 'offline', icon: UploadCloud, label: 'Offline Conversions' },
    { id: 'datasources', icon: Package, label: 'Data Sources' },
    { id: 'setup', icon: BookOpen, label: 'Setup Guide' },
    { id: 'settings', icon: Settings, label: 'Settings' },
];

export const API_ENDPOINTS = {
    META_CAPI: (pixelId: string) => `https://graph.facebook.com/v19.0/${pixelId}/events`,
    GOOGLE_OCI: (customerId: string) => `https://googleads.googleapis.com/v15/customers/${customerId}/clickConversions:upload`,
    CHRONOS_TAG_INGEST: 'https://ingest.chronos-demo.io/v1/events'
};

// Environment variable keys
export const ENV_KEYS = {
    SUPABASE_URL: 'VITE_SUPABASE_URL',
    SUPABASE_ANON_KEY: 'VITE_SUPABASE_ANON_KEY',
    META_PIXEL_ID: 'VITE_META_PIXEL_ID',
    META_CAPI_TOKEN: 'VITE_META_CAPI_TOKEN',
    GOOGLE_CUSTOMER_ID: 'VITE_GOOGLE_CUSTOMER_ID',
    GOOGLE_CONVERSION_ID: 'VITE_GOOGLE_CONVERSION_ID',
    GEMINI_API_KEY: 'GEMINI_API_KEY',
};

// Default tracking events
export const TRACKING_EVENTS = {
    PAGE_VIEW: 'PageView',
    VIEW_CONTENT: 'ViewContent',
    ADD_TO_CART: 'AddToCart',
    INITIATE_CHECKOUT: 'InitiateCheckout',
    PURCHASE: 'Purchase',
    LEAD: 'Lead',
    COMPLETE_REGISTRATION: 'CompleteRegistration',
    CONTACT: 'Contact',
    CUSTOM: 'Custom',
};
