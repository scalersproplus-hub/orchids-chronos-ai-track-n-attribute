import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { EXAMPLE_VALUES } from '../services/mockData';
import { 
  BookOpen, Code, Copy, Check, Database, Zap, Globe, 
  Facebook, Chrome, ExternalLink, ChevronDown, ChevronRight,
  Terminal, FileCode, CheckCircle, AlertCircle, Shield, Server,
  Smartphone, Monitor, RefreshCw, Eye, Lock
} from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const SetupGuide: React.FC = () => {
  const { state, addToast } = useApp();
  const { currentAccount } = state;
  const [expandedSection, setExpandedSection] = useState<string | null>('tracking');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    addToast({ type: 'info', message: 'Copied to clipboard!' });
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
      id: 'tracking', 
      title: 'Install Tracking Tag', 
      description: 'Add the universal tag to your website',
      completed: false // User needs to manually verify
    },
    { 
      id: 'cname', 
      title: 'Setup First-Party Domain (Optional)', 
      description: 'Bypass ad blockers with CNAME tracking',
      completed: !!currentAccount.trackingDomain
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

      {/* Why Chronos is Different */}
      <div className="bg-gradient-to-r from-purple-900/20 to-chronos-900 border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Why Chronos Beats Hyros & Aimerce
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard 
            icon={Shield}
            title="Cookieless Tracking"
            description="Browser fingerprinting works even when cookies are blocked"
          />
          <FeatureCard 
            icon={RefreshCw}
            title="Cross-Device Identity"
            description="Links mobile, desktop, and tablet sessions to one user"
          />
          <FeatureCard 
            icon={Eye}
            title="Ad Blocker Bypass"
            description="First-party CNAME domain defeats DNS-level blockers"
          />
        </div>
      </div>

      {/* Setup Steps */}
      <div className="space-y-4">
        
        {/* Step 1: Install Tracking Tag */}
        <SetupSection
          id="tracking"
          icon={Code}
          title="1. Install the Universal Tracking Tag"
          description="Add one script to capture everything"
          completed={false}
          expanded={expandedSection === 'tracking'}
          onToggle={() => toggleSection('tracking')}
        >
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Cookieless & Privacy-First
              </h4>
              <p className="text-sm text-green-200/70">
                This tag uses browser fingerprinting to identify users without cookies. 
                It captures canvas, WebGL, screen info, and dozens of other signals to create a unique ID 
                that persists across sessions, even in Safari with ITP enabled.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Quick Install (CDN)</h4>
              <p className="text-sm text-gray-400 mb-3">
                Add this script to the <code className="bg-chronos-800 px-1.5 py-0.5 rounded text-chronos-300">&lt;head&gt;</code> section of every page:
              </p>
              <CodeBlock
                id="tracking-tag-cdn"
                language="html"
                code={`<script async 
  src="https://cdn.chronos-ai.io/tag.js" 
  data-chronos-id="${currentAccount.id}"
  data-debug="false">
</script>`}
                onCopy={handleCopy}
                copied={copiedItem === 'tracking-tag-cdn'}
              />
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Self-Hosted (Recommended for Bypassing Ad Blockers)</h4>
              <p className="text-sm text-gray-400 mb-3">
                Host the script on your own domain to avoid ad blocker detection:
              </p>
              <CodeBlock
                id="tracking-tag-self"
                language="html"
                code={`<!-- Option 1: Self-hosted -->
<script async 
  src="https://yourdomain.com/scripts/analytics.js" 
  data-chronos-id="${currentAccount.id}">
</script>

<!-- Option 2: With CNAME domain (best) -->
<script async 
  src="https://${currentAccount.trackingDomain || 'track.yourdomain.com'}/tag.js" 
  data-chronos-id="${currentAccount.id}">
</script>`}
                onCopy={handleCopy}
                copied={copiedItem === 'tracking-tag-self'}
              />
            </div>

            <div className="border-t border-chronos-800 pt-6">
              <h4 className="font-semibold text-white mb-3">Track Custom Events</h4>
              <p className="text-sm text-gray-400 mb-3">
                Use the global <code className="bg-chronos-800 px-1.5 py-0.5 rounded text-chronos-300">chronos</code> object:
              </p>
              <CodeBlock
                id="track-events"
                language="javascript"
                code={`// Track a purchase (sends to Meta CAPI & Google OCI)
chronos.purchase({
  value: 99.99,
  currency: 'USD',
  order_id: 'ORDER-123',
  content_ids: ['PROD-001', 'PROD-002']
});

// Track a lead
chronos.lead({
  value: 50,
  content_name: 'Free Consultation'
});

// Identify a user (links all sessions to this identity)
chronos.identify({
  email: 'customer@example.com',
  phone: '+15551234567',
  first_name: 'John',
  last_name: 'Doe'
});

// Track page view (automatic, but can be called manually)
chronos.pageView();

// Track add to cart
chronos.addToCart({
  content_id: 'PROD-001',
  content_name: 'Premium Widget',
  value: 49.99
});

// Custom event
chronos.track('webinar_signup', {
  webinar_name: 'Growth Masterclass',
  date: '2024-01-15'
});`}
                onCopy={handleCopy}
                copied={copiedItem === 'track-events'}
              />
            </div>

            <div className="border-t border-chronos-800 pt-6">
              <h4 className="font-semibold text-white mb-3">Platform-Specific Installation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlatformCard 
                  name="Shopify"
                  instruction="Add to theme.liquid before </head>"
                  link="https://help.shopify.com/en/manual/online-store/themes"
                />
                <PlatformCard 
                  name="WordPress"
                  instruction="Use Insert Headers and Footers plugin"
                  link="https://wordpress.org/plugins/insert-headers-and-footers/"
                />
                <PlatformCard 
                  name="Webflow"
                  instruction="Project Settings → Custom Code → Head"
                  link="https://university.webflow.com/lesson/custom-code-in-the-head-and-body-tags"
                />
                <PlatformCard 
                  name="Next.js / React"
                  instruction="Add to _document.js or layout.tsx"
                  link="https://nextjs.org/docs/pages/building-your-application/optimizing/scripts"
                />
              </div>
            </div>
          </div>
        </SetupSection>

        {/* Step 2: CNAME Domain Setup */}
        <SetupSection
          id="cname"
          icon={Globe}
          title="2. Setup First-Party Domain (CNAME Tracking)"
          description="Bypass ad blockers and Safari ITP restrictions"
          completed={!!currentAccount.trackingDomain}
          expanded={expandedSection === 'cname'}
          onToggle={() => toggleSection('cname')}
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-900/30 to-chronos-900 border border-green-500/30 rounded-lg p-5">
              <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Why CNAME Tracking? (+20-40% More Conversions)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="text-green-200">✓ <strong>Bypass uBlock Origin, AdBlock Plus</strong></p>
                  <p className="text-green-200/70">Requests come from your domain, not a known tracker</p>
                </div>
                <div className="space-y-2">
                  <p className="text-green-200">✓ <strong>Bypass Safari ITP 2.3+</strong></p>
                  <p className="text-green-200/70">First-party cookies last 7 days vs 24 hours</p>
                </div>
                <div className="space-y-2">
                  <p className="text-green-200">✓ <strong>Bypass Brave Browser Shields</strong></p>
                  <p className="text-green-200/70">Looks like legitimate first-party traffic</p>
                </div>
                <div className="space-y-2">
                  <p className="text-green-200">✓ <strong>Higher Match Rates</strong></p>
                  <p className="text-green-200/70">Meta CAPI sees 20-40% more attributed conversions</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Step-by-Step DNS Setup</h4>
              <ol className="space-y-5">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-chronos-500 flex items-center justify-center text-white font-bold text-sm">1</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">Choose a subdomain</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Pick something that looks like a legitimate first-party service:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <code className="bg-chronos-800 px-2 py-1 rounded text-green-300 text-sm">t.yourdomain.com</code>
                      <code className="bg-chronos-800 px-2 py-1 rounded text-green-300 text-sm">track.yourdomain.com</code>
                      <code className="bg-chronos-800 px-2 py-1 rounded text-green-300 text-sm">data.yourdomain.com</code>
                      <code className="bg-chronos-800 px-2 py-1 rounded text-green-300 text-sm">api.yourdomain.com</code>
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-chronos-500 flex items-center justify-center text-white font-bold text-sm">2</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">Add a CNAME record in your DNS provider</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Go to your DNS settings (Cloudflare, GoDaddy, Namecheap, etc.) and add:
                    </p>
                    <div className="mt-3 bg-black/50 border border-chronos-700 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-4 gap-4 p-3 text-xs text-gray-500 border-b border-chronos-800 font-medium">
                        <span>Type</span>
                        <span>Name/Host</span>
                        <span>Value/Points to</span>
                        <span>TTL</span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 p-3 font-mono text-sm text-green-300">
                        <span>CNAME</span>
                        <span>track</span>
                        <span>ingest.chronos-ai.io</span>
                        <span>Auto</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ If using Cloudflare, enable "Proxy" (orange cloud) for SSL
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-chronos-500 flex items-center justify-center text-white font-bold text-sm">3</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">Enter your tracking domain in Settings</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Go to <strong>Settings → Tracking Domain</strong> and enter your subdomain. 
                      We'll verify DNS and provision an SSL certificate automatically.
                    </p>
                    {currentAccount.trackingDomain ? (
                      <div className="mt-3 flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Configured: {currentAccount.trackingDomain}</span>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-2 text-yellow-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Not configured yet - go to Settings</span>
                      </div>
                    )}
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-chronos-500 flex items-center justify-center text-white font-bold text-sm">4</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">Update your tracking tag</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Replace the CDN URL with your custom domain:
                    </p>
                    <CodeBlock
                      id="cname-final-tag"
                      language="html"
                      code={`<script async 
  src="https://${currentAccount.trackingDomain || 'track.yourdomain.com'}/tag.js" 
  data-chronos-id="${currentAccount.id}">
</script>`}
                      onCopy={handleCopy}
                      copied={copiedItem === 'cname-final-tag'}
                    />
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">DNS Provider Guides</h4>
              <div className="flex flex-wrap gap-2">
                <a href="https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/" target="_blank" className="text-sm text-blue-300 hover:text-blue-200 underline">Cloudflare</a>
                <span className="text-gray-600">•</span>
                <a href="https://www.godaddy.com/help/add-a-cname-record-19236" target="_blank" className="text-sm text-blue-300 hover:text-blue-200 underline">GoDaddy</a>
                <span className="text-gray-600">•</span>
                <a href="https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain/" target="_blank" className="text-sm text-blue-300 hover:text-blue-200 underline">Namecheap</a>
                <span className="text-gray-600">•</span>
                <a href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html" target="_blank" className="text-sm text-blue-300 hover:text-blue-200 underline">Route 53</a>
              </div>
            </div>
          </div>
        </SetupSection>

        {/* Step 3: Supabase */}
        <SetupSection
          id="supabase"
          icon={Database}
          title="3. Connect Supabase Database"
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
                <li>• Run the SQL schema in the SQL Editor</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Step 1: Run the SQL Schema</h4>
              <p className="text-sm text-gray-400 mb-3">
                Download the schema file and paste it in Supabase SQL Editor:
              </p>
              <a 
                href="/supabase-schema.sql" 
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-chronos-700 hover:bg-chronos-600 rounded-lg text-white transition-colors"
              >
                <FileCode className="w-4 h-4" /> Download SQL Schema
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <p className="text-xs text-gray-500 mt-2">
                Note: RLS is disabled for maximum compatibility. The schema includes all tables: visitors, events, conversions, identity_graph, and more.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Step 2: Get Your API Keys</h4>
              <p className="text-sm text-gray-400 mb-3">
                Go to <strong>Project Settings → API</strong> in your Supabase dashboard
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-chronos-800/50 p-3 rounded-lg">
                  <label className="text-xs font-medium text-gray-500 uppercase">Project URL</label>
                  <p className="text-sm text-gray-300 mt-1 font-mono truncate">
                    {currentAccount.supabaseConfig?.url || <span className="text-gray-600">{EXAMPLE_VALUES.supabase.url}</span>}
                  </p>
                </div>
                <div className="bg-chronos-800/50 p-3 rounded-lg">
                  <label className="text-xs font-medium text-gray-500 uppercase">Anon Key</label>
                  <p className="text-sm text-gray-300 mt-1 font-mono">
                    {currentAccount.supabaseConfig?.key ? '••••••••' + currentAccount.supabaseConfig.key.slice(-8) : <span className="text-gray-600">Not configured</span>}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Configure these in <strong>Settings → Integrations</strong>
              </p>
            </div>
          </div>
        </SetupSection>

        {/* Step 4: Meta */}
        <SetupSection
          id="meta"
          icon={Facebook}
          title="4. Setup Meta (Facebook) Conversions API"
          description="Server-side tracking that bypasses ad blockers"
          completed={steps[3].completed}
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
                <li className="flex gap-2">
                  <span className="text-chronos-400">1.</span>
                  Go to <a href="https://business.facebook.com/events_manager" target="_blank" className="text-chronos-400 hover:underline">Meta Events Manager</a>
                </li>
                <li className="flex gap-2">
                  <span className="text-chronos-400">2.</span>
                  Select your Pixel → Settings tab
                </li>
                <li className="flex gap-2">
                  <span className="text-chronos-400">3.</span>
                  Scroll to "Conversions API" section
                </li>
                <li className="flex gap-2">
                  <span className="text-chronos-400">4.</span>
                  Click "Generate Access Token"
                </li>
                <li className="flex gap-2">
                  <span className="text-chronos-400">5.</span>
                  Copy and paste it in Settings → Integrations
                </li>
              </ol>
            </div>
          </div>
        </SetupSection>

        {/* Step 5: Google Ads */}
        <SetupSection
          id="google"
          icon={Chrome}
          title="5. Setup Google Ads Offline Conversions"
          description="Upload offline sales back to Google Ads"
          completed={steps[4].completed}
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
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-gray-500 w-32">Customer ID:</span>
                  <span className="text-gray-300">Account icon (top right) → Your 10-digit ID (123-456-7890)</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 w-32">Conversion ID:</span>
                  <span className="text-gray-300">Tools → Conversions → Select action → ID in URL (AW-123456789)</span>
                </div>
              </div>
            </div>
          </div>
        </SetupSection>
      </div>

      {/* Completion Message */}
      {completedCount >= 3 && (
        <div className="bg-gradient-to-r from-green-900/20 to-chronos-900 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-lg font-bold text-white">You're Ready to Track! 🎉</h3>
              <p className="text-gray-400">
                Your core setup is complete. Head to the Dashboard to see your data flowing in.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{ icon: React.FC<any>; title: string; description: string }> = ({ icon: Icon, title, description }) => (
  <div className="bg-chronos-800/50 rounded-lg p-4">
    <Icon className="w-6 h-6 text-purple-400 mb-2" />
    <h3 className="font-semibold text-white text-sm">{title}</h3>
    <p className="text-xs text-gray-400 mt-1">{description}</p>
  </div>
);

// Platform Card Component
const PlatformCard: React.FC<{ name: string; instruction: string; link: string }> = ({ name, instruction, link }) => (
  <a href={link} target="_blank" className="block bg-chronos-800/50 hover:bg-chronos-800 rounded-lg p-3 transition-colors">
    <h4 className="font-medium text-white text-sm">{name}</h4>
    <p className="text-xs text-gray-400 mt-1">{instruction}</p>
  </a>
);

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