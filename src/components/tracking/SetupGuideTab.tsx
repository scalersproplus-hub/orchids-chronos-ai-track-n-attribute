import React from 'react';
import { BookOpen, ExternalLink, Database, Server, Code, Activity, UploadCloud } from 'lucide-react';

export const SetupGuideTab = () => {
    return (
        <div className="animate-fade-in space-y-8 max-w-4xl mx-auto pb-10">
            <div className="bg-chronos-900 border border-chronos-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="w-6 h-6 text-chronos-400" />
                    <h2 className="text-2xl font-bold text-white">Chronos AI Attribution - Complete Setup Guide</h2>
                </div>
                <p className="text-gray-400">
                    This guide will walk you through setting up <strong>one fully functional workspace</strong> with Meta CAPI, Google Ads, and Supabase integration.
                </p>
            </div>

            <Section title="1. Supabase Database Setup" icon={Database}>
                <ol className="list-decimal list-inside space-y-3 text-gray-300 text-sm">
                    <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-chronos-400 hover:underline">supabase.com</a> and create a new project called <code>chronos-attribution</code>.</li>
                    <li>Go to the <strong>SQL Editor</strong> in the sidebar.</li>
                    <li>Copy the SQL script from the <strong>DB Schema</strong> tab in this app.</li>
                    <li>Paste and run the script to create all tables and triggers.</li>
                    <li>Go to <strong>Settings → API</strong> and copy your <strong>Project URL</strong> and <strong>anon public key</strong>.</li>
                    <li>Paste these credentials into the <strong>Integrations & Settings</strong> page of this app.</li>
                </ol>
            </Section>

            <Section title="2. Meta (Facebook) Ads Configuration" icon={Server}>
                 <ol className="list-decimal list-inside space-y-3 text-gray-300 text-sm">
                    <li>Go to <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="text-chronos-400 hover:underline">Meta Events Manager</a>.</li>
                    <li>Copy your <strong>Pixel ID</strong> from the overview page.</li>
                    <li>Go to <strong>Settings → Conversions API</strong> and click "Generate Access Token".</li>
                    <li>Copy the token (starts with <code>EAA...</code>).</li>
                    <li>(Optional) Go to the <strong>Test Events</strong> tab and copy the test code (e.g., <code>TEST12345</code>).</li>
                    <li>Enter these values in the <strong>Integrations & Settings</strong> page.</li>
                </ol>
            </Section>

             <Section title="3. Google Ads Configuration" icon={Code}>
                 <ol className="list-decimal list-inside space-y-3 text-gray-300 text-sm">
                    <li>Go to <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer" className="text-chronos-400 hover:underline">Google Ads</a> → Tools → Conversions.</li>
                    <li>Select a conversion action and find the <strong>Conversion ID</strong> and <strong>Label</strong> in the tag setup.</li>
                    <li>Find your <strong>Customer ID</strong> in the top right corner of the Google Ads dashboard.</li>
                    <li>Enter these values in the <strong>Integrations & Settings</strong> page.</li>
                </ol>
            </Section>

            <Section title="4. Install Tracking Tag" icon={Activity}>
                 <ol className="list-decimal list-inside space-y-3 text-gray-300 text-sm">
                    <li>Go to the <strong>Data Sources</strong> page in this app.</li>
                    <li>Copy the <strong>Universal Tracking Tag</strong> snippet.</li>
                    <li>Paste it into the <code>&lt;head&gt;</code> of your website (Shopify, WordPress, etc.).</li>
                    <li>Verify installation using the "Live Event Debugger" on the Data Sources page.</li>
                </ol>
            </Section>

             <Section title="5. Offline Conversion Workflow" icon={UploadCloud}>
                 <ol className="list-decimal list-inside space-y-3 text-gray-300 text-sm">
                    <li>Go to the <strong>Offline Conversions Hub</strong>.</li>
                    <li>Use <strong>Bulk CSV Upload</strong> or <strong>Manual Entry</strong> to upload sales data.</li>
                    <li>The system will automatically match users, hash PII, and send conversions to Meta and Google.</li>
                    <li>Check the <strong>Upload History</strong> to confirm successful API transmissions.</li>
                </ol>
            </Section>
        </div>
    );
};

const Section = ({ title, icon: Icon, children }: any) => (
    <div className="bg-chronos-950/50 border border-chronos-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Icon className="w-5 h-5 text-chronos-400" /> {title}
        </h3>
        {children}
    </div>
);