import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  BookOpen, Code, Copy, Check, Database, Zap, Globe, 
  Facebook, Chrome, ExternalLink, ChevronDown, ChevronRight,
  Terminal, FileCode, CheckCircle, AlertCircle
} from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const SetupGuide: React.FC = () => {
  const { state } = useApp();
  const { currentAccount } = state;
  const [expandedSection, setExpandedSection] = useState<string | null>('supabase');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Check completion status
  const steps: SetupStep[] = [
    { 
      id: 'supabase', 
      title: 'Connect Database', 
      description: 'Configure Supabase for data storage',
      completed: !!(currentAccount.supabaseConfig?.url && currentAccount.supabaseConfig?.key)
    },
    { 
      id: 'meta', 
      title: 'Setup Meta (Facebook)', 
      description: 'Connect Meta Pixel & Conversions API',
      completed: !!(currentAccount.metaPixelId && currentAccount.metaCapiToken)
    },
    { 
      id: 'google', 
      title: 'Setup Google Ads', 
      description: 'Configure Google Offline Conversions',
      completed: !!(currentAccount.googleConversionId && currentAccount.googleCustomerId)
    },
    { 
      id: 'tag', 
      title: 'Install Tracking Tag', 
      description: 'Add the universal tag to your website',
      completed: currentAccount.setupComplete
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-chronos-900 to-chronos-900/50 border border-chronos-800 rounded-xl p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-chronos-500/20 rounded-xl">
              <BookOpen className="w-8 h-8 text-chronos-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Setup Guide</h1>
              <p className="text-gray-400 mt-1">Complete these steps to start tracking conversions</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-chronos-400">{completedCount}/{steps.length}</div>
            <p className="text-sm text-gray-500">Steps completed</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-2 bg-chronos-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-chronos-500 to-chronos-accent transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="space-y-4">
        {/* Step 1: Supabase */}
        <SetupSection
          id="supabase"
          icon={Database}
          title="1. Connect Supabase Database"
          description="Store visitor data, events, and conversions"
          completed={steps[0].completed}
          expanded={expandedSection === 'supabase'}
          onToggle={() => toggleSection('supabase')}
        >
          <div className="space-y-6">
            <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">Prerequisites</h4>
              <ul className="text-sm text-blue-200/70 space-y-1">
                <li>• Create a free Supabase account at <a href="https://supabase.com" target="_blank" className="text-blue-400 hover:underline">supabase.com</a></li>
                <li>• Create a new project</li>
                <li>• Run the SQL schema in the SQL Editor (see below)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Step 1: Create Database Tables</h4>
              <p className="text-sm text-gray-400 mb-3">
                Copy the SQL schema and run it in your Supabase SQL Editor:
              </p>
              <CodeBlock
                id="sql-schema"
                language="sql"
                code={`-- Download the full schema from:
-- /supabase-schema.sql

-- Quick start: Create the visitors table
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fingerprint_id VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255),
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- See full schema file for all tables`}
                onCopy={handleCopy}
                copied={copiedItem === 'sql-schema'}
              />
              <a 
                href="/supabase-schema.sql" 
                target="_blank"
                className="inline-flex items-center gap-2 mt-3 text-sm text-chronos-400 hover:text-chronos-300"
              >
                <FileCode className="w-4 h-4" /> Download Full SQL Schema
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Step 2: Get Your API Keys</h4>
              <p className="text-sm text-gray-400 mb-3">
                Go to Project Settings → API in your Supabase dashboard
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Project URL</label>
                  <p className="text-sm text-gray-300 mt-1 font-mono bg-chronos-800 p-2 rounded">
                    {currentAccount.supabaseConfig?.url || 'Not configured'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Anon Key</label>
                  <p className="text-sm text-gray-300 mt-1 font-mono bg-chronos-800 p-2 rounded truncate">
                    {currentAccount.supabaseConfig?.key ? '••••••••' + currentAccount.supabaseConfig.key.slice(-8) : 'Not configured'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Configure these in Settings → Integrations & Settings
              </p>
            </div>
          </div>
        </SetupSection>

        {/* Step 2: Meta */}
        <SetupSection
          id="meta"
          icon={Facebook}
          title="2. Setup Meta (Facebook) Conversions API"
          description="Server-side tracking that bypasses ad blockers"
          completed={steps[1].completed}
          expanded={expandedSection === 'meta'}
          onToggle={() => toggleSection('meta')}
        >
          <div className="space-y-6">
            <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">What You'll Need</h4>
              <ul className="text-sm text-blue-200/70 space-y-1">
                <li>• Meta Business Manager access</li>
                <li>• Facebook Pixel ID</li>
                <li>• Conversions API Access Token</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">How to Get Your CAPI Token</h4>
              <ol className="text-sm text-gray-400 space-y-2">
                <li>1. Go to <a href="https://business.facebook.com/events_manager" target="_blank" className="text-chronos-400 hover:underline">Meta Events Manager</a></li>
                <li>2. Select your Pixel → Settings</li>
                <li>3. Scroll to "Conversions API" section</li>
                <li>4. Click "Generate Access Token"</li>
                <li>5. Copy and paste it in Settings</li>
              </ol>

              <div className="mt-4 p-4 bg-chronos-800/50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Current Configuration:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pixel ID:</span>
                    <span className="font-mono text-white">{currentAccount.metaPixelId || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CAPI Token:</span>
                    <span className="font-mono text-white">
                      {currentAccount.metaCapiToken ? '••••••••' + currentAccount.metaCapiToken.slice(-8) : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Test Event Code:</span>
                    <span className="font-mono text-white">{currentAccount.metaTestCode || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SetupSection>

        {/* Step 3: Google Ads */}
        <SetupSection
          id="google"
          icon={Chrome}
          title="3. Setup Google Ads Offline Conversions"
          description="Upload offline sales back to Google Ads"
          completed={steps[2].completed}
          expanded={expandedSection === 'google'}
          onToggle={() => toggleSection('google')}
        >
          <div className="space-y-6">
            <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Important Note</h4>
              <p className="text-sm text-yellow-200/70">
                Google Ads API requires OAuth2 authentication and a Developer Token. 
                For production use, you'll need to set up a backend proxy to handle 
                API authentication securely.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Required Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Customer ID</label>
                  <p className="text-sm text-gray-300 mt-1">
                    Find this in Google Ads → Account icon (top right) → Your 10-digit ID
                  </p>
                  <p className="font-mono text-white mt-1 bg-chronos-800 p-2 rounded">
                    {currentAccount.googleCustomerId || 'Not configured'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Conversion Action ID</label>
                  <p className="text-sm text-gray-300 mt-1">
                    Go to Tools → Conversions → Select your conversion → Find ID in URL
                  </p>
                  <p className="font-mono text-white mt-1 bg-chronos-800 p-2 rounded">
                    {currentAccount.googleConversionId || 'Not configured'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SetupSection>

        {/* Step 4: Install Tag */}
        <SetupSection
          id="tag"
          icon={Code}
          title="4. Install the Universal Tracking Tag"
          description="Add one script to track everything"
          completed={steps[3].completed}
          expanded={expandedSection === 'tag'}
          onToggle={() => toggleSection('tag')}
        >
          <div className="space-y-6">
            <div className="bg-green-900/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">✨ Cookieless Tracking</h4>
              <p className="text-sm text-green-200/70">
                This tag uses browser fingerprinting to track users across sessions 
                without relying on cookies. It works even with ad blockers and 
                in Safari's ITP.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Add to Your Website</h4>
              <p className="text-sm text-gray-400 mb-3">
                Place this script in the <code className="bg-chronos-800 px-1 rounded">&lt;head&gt;</code> of every page:
              </p>
              <CodeBlock
                id="tracking-tag"
                language="html"
                code={`<script async 
  src="https://YOUR_DOMAIN/chronos-tag.js" 
  data-chronos-id="${currentAccount.id}"
  data-debug="true">
</script>`}
                onCopy={handleCopy}
                copied={copiedItem === 'tracking-tag'}
              />
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Track Custom Events</h4>
              <p className="text-sm text-gray-400 mb-3">
                Use the global <code className="bg-chronos-800 px-1 rounded">chronos</code> object to track events:
              </p>
              <CodeBlock
                id="track-events"
                language="javascript"
                code={`// Track a purchase
chronos.purchase({
  value: 99.99,
  currency: 'USD',
  order_id: 'ORDER-123',
  content_ids: ['PROD-001']
});

// Track a lead
chronos.lead({
  value: 50,
  content_name: 'Contact Form'
});

// Identify a user (links sessions)
chronos.identify({
  email: 'user@example.com',
  phone: '+15551234567'
});`}
                onCopy={handleCopy}
                copied={copiedItem === 'track-events'}
              />
            </div>
          </div>
        </SetupSection>
      </div>

      {/* Next Steps */}
      {completedCount === steps.length && (
        <div className="bg-gradient-to-r from-green-900/20 to-chronos-900 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Setup Complete! 🎉</h3>
              <p className="text-gray-400">
                You're ready to start tracking. Head to the Dashboard to see your data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Setup Section Component
interface SetupSectionProps {
  id: string;
  icon: React.FC<any>;
  title: string;
  description: string;
  completed: boolean;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const SetupSection: React.FC<SetupSectionProps> = ({
  id,
  icon: Icon,
  title,
  description,
  completed,
  expanded,
  onToggle,
  children
}) => (
  <div className={`bg-chronos-900 border rounded-xl overflow-hidden transition-all ${
    completed ? 'border-green-500/30' : 'border-chronos-800'
  }`}>
    <button
      onClick={onToggle}
      className="w-full p-5 flex items-center justify-between hover:bg-chronos-800/30 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${
          completed ? 'bg-green-500/20' : 'bg-chronos-800'
        }`}>
          {completed ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <Icon className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="text-left">
          <h3 className={`font-semibold ${completed ? 'text-green-400' : 'text-white'}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {expanded ? (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-400" />
      )}
    </button>
    {expanded && (
      <div className="px-5 pb-5 pt-2 border-t border-chronos-800 animate-fade-in">
        {children}
      </div>
    )}
  </div>
);

// Code Block Component
interface CodeBlockProps {
  id: string;
  language: string;
  code: string;
  onCopy: (text: string, id: string) => void;
  copied: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ id, language, code, onCopy, copied }) => (
  <div className="relative">
    <div className="absolute top-2 right-2 flex items-center gap-2">
      <span className="text-[10px] text-gray-500 uppercase font-mono">{language}</span>
      <button
        onClick={() => onCopy(code, id)}
        className="p-1.5 bg-chronos-700 hover:bg-chronos-600 rounded text-gray-300 hover:text-white transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
    <pre className="bg-black/50 border border-chronos-800 rounded-lg p-4 overflow-x-auto">
      <code className="text-sm font-mono text-green-300 whitespace-pre">
        {code}
      </code>
    </pre>
  </div>
);

export default SetupGuide;
