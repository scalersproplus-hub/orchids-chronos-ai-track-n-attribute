import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Shield, CheckCircle2, AlertCircle, Copy, Check, 
  ExternalLink, RefreshCw, Server, Lock, Zap, Info,
  ChevronRight, ArrowRight, Code, Terminal
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

type DomainStatus = 'not_configured' | 'pending_dns' | 'verifying' | 'verified' | 'error';

interface DNSRecord {
  type: 'CNAME' | 'TXT';
  name: string;
  value: string;
  status: 'pending' | 'verified' | 'error';
}

export const FirstPartyDomainTab = () => {
  const { currentAccount, updateAccount, addToast } = useApp();
  const [subdomain, setSubdomain] = useState('t');
  const [rootDomain, setRootDomain] = useState(
    currentAccount.websiteUrl?.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || ''
  );
  const [domainStatus, setDomainStatus] = useState<DomainStatus>('not_configured');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fullDomain = `${subdomain}.${rootDomain}`;
  
  const dnsRecords: DNSRecord[] = [
    {
      type: 'CNAME',
      name: subdomain,
      value: 'tracking.chronos-proxy.com',
      status: domainStatus === 'verified' ? 'verified' : 'pending'
    }
  ];

  useEffect(() => {
    if (currentAccount.trackingDomain) {
      const parts = currentAccount.trackingDomain.split('.');
      if (parts.length >= 2) {
        setSubdomain(parts[0]);
        setRootDomain(parts.slice(1).join('.'));
        setDomainStatus('verified');
      }
    }
  }, [currentAccount.trackingDomain]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const verifyDomain = async () => {
    setIsVerifying(true);
    setDomainStatus('verifying');
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const isSuccess = Math.random() > 0.3;
    
    if (isSuccess) {
      setDomainStatus('verified');
      updateAccount({ ...currentAccount, trackingDomain: fullDomain });
      addToast({ type: 'success', message: `Domain ${fullDomain} verified successfully!` });
    } else {
      setDomainStatus('error');
      addToast({ type: 'error', message: 'CNAME record not found. Please check your DNS settings.' });
    }
    
    setIsVerifying(false);
  };

  const saveDomain = () => {
    setDomainStatus('pending_dns');
    addToast({ type: 'info', message: 'Domain saved. Please add the CNAME record to your DNS.' });
  };

  const generateTrackingScript = () => {
    if (!currentAccount.trackingDomain) return '';
    
    return `<!-- Chronos First-Party Tracking -->
<script>
(function(w,d,s,l,i){
  w[l]=w[l]||[];
  var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s);
  j.async=true;
  j.src='https://${currentAccount.trackingDomain}/chronos.js?id='+i;
  j.setAttribute('data-domain','${currentAccount.trackingDomain}');
  f.parentNode.insertBefore(j,f);
  
  // First-party cookie management
  w.chronos=w.chronos||function(){(w.chronos.q=w.chronos.q||[]).push(arguments)};
  w.chronos('init', i, {
    domain: '${currentAccount.trackingDomain}',
    cookieDomain: '.${rootDomain}',
    firstParty: true
  });
})(window,document,'script','chronosLayer','${currentAccount.id}');
</script>`;
  };

  const StatusBadge = ({ status }: { status: DomainStatus }) => {
    const config = {
      not_configured: { color: 'text-gray-400 bg-gray-900', icon: Globe, label: 'Not Configured' },
      pending_dns: { color: 'text-amber-400 bg-amber-900/30', icon: AlertCircle, label: 'Pending DNS' },
      verifying: { color: 'text-blue-400 bg-blue-900/30', icon: RefreshCw, label: 'Verifying...' },
      verified: { color: 'text-emerald-400 bg-emerald-900/30', icon: CheckCircle2, label: 'Verified' },
      error: { color: 'text-red-400 bg-red-900/30', icon: AlertCircle, label: 'DNS Error' }
    };
    
    const { color, icon: Icon, label } = config[status];
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className={`w-3.5 h-3.5 ${status === 'verifying' ? 'animate-spin' : ''}`} />
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-chronos-900 via-chronos-950 to-black border border-chronos-700/50 rounded-2xl p-8"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-chronos-500 to-chronos-700 rounded-xl shadow-lg shadow-chronos-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">First-Party Domain Tracking</h2>
                <p className="text-chronos-300 text-sm">Bypass ad blockers & extend cookie lifetime</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { icon: Shield, label: 'Bypass Ad Blockers', desc: 'Track users who block 3rd-party scripts' },
                { icon: Lock, label: 'First-Party Cookies', desc: '2-year expiration vs 7-day ITP limit' },
                { icon: Zap, label: 'Higher Match Rates', desc: 'Up to 30% more conversions tracked' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                >
                  <item.icon className="w-5 h-5 text-chronos-400 mb-2" />
                  <p className="text-white font-medium text-sm">{item.label}</p>
                  <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <StatusBadge status={domainStatus} />
        </div>
      </motion.div>

      {/* Domain Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Domain Setup */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-chronos-950 border border-chronos-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-chronos-400" />
            Configure Tracking Domain
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Subdomain
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="t"
                  className="w-24 bg-chronos-900 border border-chronos-700 rounded-lg px-4 py-3 text-white font-mono focus:border-chronos-500 focus:outline-none focus:ring-2 focus:ring-chronos-500/20 transition-all"
                />
                <span className="text-gray-500 text-lg">.</span>
                <input
                  type="text"
                  value={rootDomain}
                  onChange={(e) => setRootDomain(e.target.value.toLowerCase())}
                  placeholder="yourdomain.com"
                  className="flex-1 bg-chronos-900 border border-chronos-700 rounded-lg px-4 py-3 text-white font-mono focus:border-chronos-500 focus:outline-none focus:ring-2 focus:ring-chronos-500/20 transition-all"
                />
              </div>
              <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Common choices: t, track, pixel, data
              </p>
            </div>

            <div className="bg-chronos-900/50 rounded-lg p-4 border border-chronos-800">
              <p className="text-sm text-gray-400 mb-1">Your tracking domain will be:</p>
              <p className="text-lg font-mono text-chronos-300 font-bold">
                {fullDomain || 't.yourdomain.com'}
              </p>
            </div>

            <div className="flex gap-3">
              {domainStatus === 'not_configured' && (
                <button
                  onClick={saveDomain}
                  disabled={!subdomain || !rootDomain}
                  className="flex-1 px-4 py-3 bg-chronos-500 hover:bg-chronos-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  Save & Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              
              {(domainStatus === 'pending_dns' || domainStatus === 'error') && (
                <button
                  onClick={verifyDomain}
                  disabled={isVerifying}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Verify Domain
                    </>
                  )}
                </button>
              )}
              
              {domainStatus === 'verified' && (
                <div className="flex-1 px-4 py-3 bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 rounded-lg font-medium flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Domain Verified
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right: DNS Setup Instructions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-chronos-950 border border-chronos-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-chronos-400" />
            DNS Configuration
          </h3>
          
          <div className="space-y-4">
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
              <p className="text-amber-300 text-sm font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Add this CNAME record to your DNS
              </p>
              <p className="text-amber-200/70 text-xs">
                Go to your domain registrar (Cloudflare, GoDaddy, Namecheap, etc.) and add the following record:
              </p>
            </div>

            {dnsRecords.map((record, i) => (
              <div key={i} className="bg-black rounded-lg border border-chronos-800 overflow-hidden">
                <div className="grid grid-cols-3 gap-px bg-chronos-800">
                  <div className="bg-chronos-900 px-4 py-2">
                    <span className="text-xs text-gray-500 block">Type</span>
                    <span className="text-white font-mono font-bold">{record.type}</span>
                  </div>
                  <div className="bg-chronos-900 px-4 py-2">
                    <span className="text-xs text-gray-500 block">Name / Host</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono">{record.name}</span>
                      <button
                        onClick={() => handleCopy(record.name, 'name')}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        {copied === 'name' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="bg-chronos-900 px-4 py-2">
                    <span className="text-xs text-gray-500 block">Target / Value</span>
                    <div className="flex items-center gap-2">
                      <span className="text-chronos-300 font-mono text-sm truncate">{record.value}</span>
                      <button
                        onClick={() => handleCopy(record.value, 'value')}
                        className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
                      >
                        {copied === 'value' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>
                  <strong>Cloudflare users:</strong> Make sure to disable the proxy (orange cloud → gray cloud)
                </span>
              </p>
            </div>

            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-chronos-400 hover:text-chronos-300 transition-colors flex items-center gap-1"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
              Provider-specific instructions
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-2">
                    {[
                      { name: 'Cloudflare', url: 'https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/' },
                      { name: 'GoDaddy', url: 'https://www.godaddy.com/help/add-a-cname-record-19236' },
                      { name: 'Namecheap', url: 'https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain/' },
                      { name: 'Google Domains', url: 'https://support.google.com/a/answer/47283' }
                    ].map((provider) => (
                      <a
                        key={provider.name}
                        href={provider.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: provider.url } }, "*");
                        }}
                        className="flex items-center justify-between p-3 bg-chronos-900 rounded-lg border border-chronos-800 hover:border-chronos-600 transition-colors group"
                      >
                        <span className="text-gray-300 text-sm">{provider.name}</span>
                        <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-chronos-400 transition-colors" />
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Tracking Script */}
      <AnimatePresence>
        {domainStatus === 'verified' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-chronos-950 border border-chronos-800 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 bg-chronos-900 border-b border-chronos-800">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-chronos-400" />
                <div>
                  <h3 className="text-white font-bold">First-Party Tracking Script</h3>
                  <p className="text-gray-500 text-xs">Add to your website's &lt;head&gt; tag</p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(generateTrackingScript(), 'script')}
                className="px-4 py-2 bg-chronos-800 hover:bg-chronos-700 rounded-lg text-sm text-white font-medium transition-colors flex items-center gap-2"
              >
                {copied === 'script' ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Script
                  </>
                )}
              </button>
            </div>
            
            <div className="p-6 bg-black/50">
              <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap overflow-x-auto">
                {generateTrackingScript()}
              </pre>
            </div>

            <div className="px-6 py-4 bg-emerald-900/20 border-t border-emerald-700/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-300 font-medium text-sm">First-party tracking enabled</p>
                  <p className="text-emerald-200/60 text-xs mt-1">
                    This script loads from your domain ({currentAccount.trackingDomain}), bypassing ad blockers and setting first-party cookies with 2-year expiration.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-chronos-950/50 border border-chronos-800 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-6">How First-Party Tracking Works</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: 1, title: 'User Visits', desc: 'User lands on your site with tracking script' },
            { step: 2, title: 'First-Party Load', desc: 'Script loads from t.yourdomain.com (your domain)' },
            { step: 3, title: 'Cookie Set', desc: 'First-party cookie set with 2-year expiration' },
            { step: 4, title: 'Data Proxied', desc: 'Events sent through your domain to ad platforms' }
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="bg-chronos-900 rounded-xl p-4 border border-chronos-800 h-full">
                <div className="w-8 h-8 bg-chronos-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3">
                  {item.step}
                </div>
                <p className="text-white font-medium text-sm">{item.title}</p>
                <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
              </div>
              {i < 3 && (
                <ChevronRight className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 text-chronos-700" />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
