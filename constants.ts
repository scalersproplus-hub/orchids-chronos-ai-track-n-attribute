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