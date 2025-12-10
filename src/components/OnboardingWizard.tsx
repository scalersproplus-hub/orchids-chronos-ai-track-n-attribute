import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { 
  Check, ArrowRight, ArrowLeft, BrainCircuit, Globe, Link, Sparkles,
  PartyPopper, Play, Eye, EyeOff, ExternalLink, HelpCircle, Copy,
  CheckCircle, AlertCircle, Loader2, Zap, Shield, Target, TrendingUp,
  MousePointer, BarChart, Users, X, Info, ChevronRight
} from 'lucide-react';

const ONBOARDING_STEPS = [
  { id: 1, title: "Welcome", subtitle: "Get to know Chronos AI" },
  { id: 2, title: "Your Business", subtitle: "Tell us about you" },
  { id: 3, title: "Tracking Setup", subtitle: "Install your pixel" },
  { id: 4, title: "Connect Ads", subtitle: "Link your ad accounts (optional)" },
  { id: 5, title: "You're Ready!", subtitle: "Start tracking" },
];

export const OnboardingWizard: React.FC = () => {
  const { state, updateAccount, markSetupComplete, addToast } = useApp();
  const { currentAccount } = state;
  const [step, setStep] = useState(1);
  const [localAccount, setLocalAccount] = useState(currentAccount);
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    updateAccount(localAccount);
    if (step < 5) {
      setStep(s => s + 1);
    } else {
      markSetupComplete(currentAccount.id);
      addToast({ type: 'success', message: 'Welcome to Chronos AI! Your tracking is now active.' });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleSkipSetup = () => {
    setIsSkipping(true);
    setTimeout(() => {
      markSetupComplete(currentAccount.id);
      addToast({ type: 'info', message: 'You can complete setup anytime from Settings.' });
    }, 300);
  };

  const handleCopyTag = () => {
    const tag = `<script async src="https://cdn.chronos-ai.io/tag.js" data-chronos-id="${localAccount.id}"></script>`;
    navigator.clipboard.writeText(tag);
    setCopied(true);
    addToast({ type: 'success', message: 'Tracking code copied! Paste it in your website.' });
    setTimeout(() => setCopied(false), 3000);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return true;
      case 2: return localAccount.name.trim().length > 0;
      case 3: return true;
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(270_91%_8%)] via-[hsl(230_25%_5%)] to-[hsl(270_91%_5%)]" />
      
      <motion.div 
        className="absolute top-20 left-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(270 91% 65%) 0%, transparent 70%)' }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(170 80% 50%) 0%, transparent 70%)' }}
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div 
        className="w-full max-w-3xl relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className="glass rounded-3xl overflow-hidden"
          style={{ 
            border: '1px solid hsl(270 91% 65% / 0.2)',
            boxShadow: '0 25px 100px -20px hsl(270 91% 30% / 0.4)'
          }}
        >
          <div className="p-6 md:p-8 border-b border-[hsl(270_91%_65%_/_0.1)]">
            <div className="flex items-center justify-between mb-6">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="p-3 rounded-2xl"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))',
                    boxShadow: '0 8px 32px hsl(270 91% 65% / 0.3)'
                  }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <BrainCircuit className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white heading">Chronos AI</h1>
                  <p className="text-sm text-gray-400">Attribution Intelligence</p>
                </div>
              </motion.div>
              
              <motion.button
                onClick={handleSkipSetup}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Skip for now
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="flex justify-between items-center gap-2">
              {ONBOARDING_STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <motion.div 
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <motion.div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        step > s.id 
                          ? 'text-white' 
                          : step === s.id 
                            ? 'text-white' 
                            : 'text-gray-600 border border-[hsl(230_20%_20%)]'
                      }`}
                      style={{
                        background: step > s.id 
                          ? 'linear-gradient(135deg, hsl(150 80% 45%), hsl(170 80% 50%))'
                          : step === s.id
                            ? 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))'
                            : 'transparent',
                        boxShadow: step >= s.id ? '0 4px 20px hsl(270 91% 65% / 0.2)' : 'none'
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                    </motion.div>
                    <span className={`text-xs hidden md:block transition-colors ${
                      step >= s.id ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {s.title}
                    </span>
                  </motion.div>
                  {i < ONBOARDING_STEPS.length - 1 && (
                    <motion.div 
                      className="flex-grow h-1 rounded-full mx-1 transition-all duration-500"
                      style={{
                        background: step > s.id 
                          ? 'linear-gradient(90deg, hsl(150 80% 45%), hsl(170 80% 50%))'
                          : 'hsl(230 20% 15%)'
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <WelcomeStep key="welcome" onGetStarted={handleNext} />
              )}
              {step === 2 && (
                <BusinessStep 
                  key="business" 
                  localAccount={localAccount} 
                  setLocalAccount={setLocalAccount}
                />
              )}
              {step === 3 && (
                <TrackingStep 
                  key="tracking" 
                  accountId={localAccount.id}
                  websiteUrl={localAccount.websiteUrl}
                  copied={copied}
                  onCopy={handleCopyTag}
                />
              )}
              {step === 4 && (
                <ConnectStep 
                  key="connect" 
                  localAccount={localAccount}
                  setLocalAccount={setLocalAccount}
                  showToken={showToken}
                  setShowToken={setShowToken}
                />
              )}
              {step === 5 && (
                <CompleteStep key="complete" name={localAccount.name} />
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 md:p-8 bg-[hsl(230_25%_4%)] border-t border-[hsl(270_91%_65%_/_0.1)] flex justify-between items-center">
            <motion.button 
              onClick={handleBack}
              disabled={step === 1}
              className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                step === 1 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-300 hover:text-white glass glass-hover'
              }`}
              whileHover={step !== 1 ? { scale: 1.02 } : {}}
              whileTap={step !== 1 ? { scale: 0.98 } : {}}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>

            <motion.button 
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                canProceed()
                  ? 'text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
              style={canProceed() ? {
                background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))',
                boxShadow: '0 8px 32px hsl(270 91% 65% / 0.3)'
              } : {}}
              whileHover={canProceed() ? { scale: 1.02, boxShadow: '0 12px 40px hsl(270 91% 65% / 0.4)' } : {}}
              whileTap={canProceed() ? { scale: 0.98 } : {}}
            >
              {step === 5 ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Launch Dashboard
                </>
              ) : step === 1 ? (
                <>
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        <motion.p 
          className="text-center text-xs text-gray-600 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Having trouble? <a href="mailto:support@chronos.ai" className="text-[hsl(270_91%_70%)] hover:underline">Contact Support</a>
        </motion.p>
      </motion.div>
    </div>
  );
};

const WelcomeStep: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <motion.div 
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    <motion.div 
      className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center"
      style={{ 
        background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.2), hsl(320 80% 60% / 0.1))',
        border: '1px solid hsl(270 91% 65% / 0.3)'
      }}
      animate={{ 
        boxShadow: [
          '0 0 30px hsl(270 91% 65% / 0.2)',
          '0 0 60px hsl(270 91% 65% / 0.3)',
          '0 0 30px hsl(270 91% 65% / 0.2)'
        ]
      }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-12 h-12 text-[hsl(270_91%_75%)]" />
      </motion.div>
    </motion.div>

    <h2 className="text-3xl font-bold text-white mb-4 heading">
      Welcome to Chronos AI
    </h2>
    <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
      The most powerful attribution platform. See exactly which ads are making you money.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <FeatureCard 
        icon={Target}
        title="True Attribution"
        description="See real revenue from each ad, not what Facebook tells you"
        delay={0.1}
      />
      <FeatureCard 
        icon={Shield}
        title="Works Everywhere"
        description="Tracks users even with ad blockers and iOS 14.5+"
        delay={0.2}
      />
      <FeatureCard 
        icon={TrendingUp}
        title="AI Insights"
        description="Get recommendations on where to spend your budget"
        delay={0.3}
      />
    </div>

    <motion.p 
      className="text-sm text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      Setup takes about 3 minutes
    </motion.p>
  </motion.div>
);

const FeatureCard: React.FC<{ 
  icon: React.FC<any>; 
  title: string; 
  description: string;
  delay: number;
}> = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    className="glass rounded-2xl p-5 text-left"
    style={{ border: '1px solid hsl(270 91% 65% / 0.1)' }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ 
      y: -4,
      borderColor: 'hsl(270 91% 65% / 0.3)',
      boxShadow: '0 20px 40px hsl(270 91% 30% / 0.2)'
    }}
  >
    <div 
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
      style={{ background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.2), transparent)' }}
    >
      <Icon className="w-5 h-5 text-[hsl(270_91%_75%)]" />
    </div>
    <h3 className="font-semibold text-white mb-1">{title}</h3>
    <p className="text-xs text-gray-400">{description}</p>
  </motion.div>
);

const BusinessStep: React.FC<{
  localAccount: any;
  setLocalAccount: (acc: any) => void;
}> = ({ localAccount, setLocalAccount }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    <div className="text-center mb-8">
      <motion.div 
        className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, hsl(170 80% 50% / 0.2), transparent)' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        <Users className="w-8 h-8 text-[hsl(170_80%_55%)]" />
      </motion.div>
      <h2 className="text-2xl font-bold text-white mb-2">Tell us about your business</h2>
      <p className="text-gray-400">This helps us customize your tracking experience</p>
    </div>

    <div className="space-y-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-gray-300 mb-2">
          What should we call your workspace?
        </label>
        <input 
          value={localAccount.name} 
          onChange={e => setLocalAccount({...localAccount, name: e.target.value})} 
          placeholder="e.g., My Store, Agency Client #1"
          className="w-full bg-[hsl(230_20%_10%)] border border-[hsl(270_91%_65%_/_0.2)] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[hsl(270_91%_65%_/_0.5)] focus:ring-1 focus:ring-[hsl(270_91%_65%_/_0.3)] transition-all"
        />
        <p className="text-xs text-gray-500 mt-2">You can change this later in Settings</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Your website URL <span className="text-gray-500">(optional)</span>
        </label>
        <input 
          value={localAccount.websiteUrl} 
          onChange={e => setLocalAccount({...localAccount, websiteUrl: e.target.value})} 
          placeholder="https://yourstore.com"
          className="w-full bg-[hsl(230_20%_10%)] border border-[hsl(270_91%_65%_/_0.2)] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[hsl(270_91%_65%_/_0.5)] focus:ring-1 focus:ring-[hsl(270_91%_65%_/_0.3)] transition-all"
        />
      </motion.div>

      <motion.div 
        className="glass rounded-xl p-4 flex items-start gap-3"
        style={{ border: '1px solid hsl(170 80% 50% / 0.2)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Info className="w-5 h-5 text-[hsl(170_80%_55%)] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-300">
          <span className="font-medium text-[hsl(170_80%_55%)]">Tip:</span> If you're an agency, 
          create a separate workspace for each client to keep their data separate.
        </p>
      </motion.div>
    </div>
  </motion.div>
);

const TrackingStep: React.FC<{
  accountId: string;
  websiteUrl: string;
  copied: boolean;
  onCopy: () => void;
}> = ({ accountId, websiteUrl, copied, onCopy }) => {
  const tag = `<script async src="https://cdn.chronos-ai.io/tag.js" data-chronos-id="${accountId}"></script>`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <motion.div 
          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, hsl(40 95% 55% / 0.2), transparent)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        >
          <MousePointer className="w-8 h-8 text-[hsl(40_95%_60%)]" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Install your tracking code</h2>
        <p className="text-gray-400">One simple script to track everything</p>
      </div>

      <div className="space-y-6 max-w-lg mx-auto">
        <motion.div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid hsl(270 91% 65% / 0.2)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[hsl(230_20%_8%)]">
            <span className="text-xs font-mono text-gray-400">HTML</span>
            <motion.button 
              onClick={onCopy}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                copied 
                  ? 'bg-[hsl(150_80%_45%)] text-white' 
                  : 'bg-[hsl(270_91%_65%_/_0.2)] text-[hsl(270_91%_75%)] hover:bg-[hsl(270_91%_65%_/_0.3)]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </motion.button>
          </div>
          <pre className="p-4 bg-[hsl(230_20%_5%)] overflow-x-auto">
            <code className="text-sm font-mono text-[hsl(150_80%_60%)] whitespace-pre-wrap break-all">
              {tag}
            </code>
          </pre>
        </motion.div>

        <motion.div 
          className="glass rounded-xl p-5"
          style={{ border: '1px solid hsl(270 91% 65% / 0.1)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[hsl(40_95%_55%)]" />
            Where to paste this code:
          </h3>
          <div className="space-y-3 text-sm">
            <InstallOption 
              platform="Shopify"
              instruction="Online Store → Themes → Edit code → theme.liquid → Before </head>"
            />
            <InstallOption 
              platform="WordPress"
              instruction="Plugins → Add New → 'Insert Headers and Footers' → Header section"
            />
            <InstallOption 
              platform="Webflow"
              instruction="Project Settings → Custom Code → Head Code"
            />
            <InstallOption 
              platform="ClickFunnels"
              instruction="Funnel Settings → Head Tracking Code"
            />
            <InstallOption 
              platform="Custom Site"
              instruction="Paste before the </head> tag on every page"
            />
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ 
            background: 'linear-gradient(135deg, hsl(150 80% 45% / 0.1), hsl(170 80% 50% / 0.05))',
            border: '1px solid hsl(150 80% 45% / 0.2)'
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CheckCircle className="w-5 h-5 text-[hsl(150_80%_50%)] flex-shrink-0" />
          <p className="text-sm text-gray-300">
            <span className="font-medium text-[hsl(150_80%_55%)]">Good news:</span> You can skip 
            this for now and install later. We'll remind you.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const InstallOption: React.FC<{ platform: string; instruction: string }> = ({ platform, instruction }) => (
  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-[hsl(270_91%_65%_/_0.05)] transition-colors">
    <div className="w-2 h-2 rounded-full bg-[hsl(270_91%_65%)] mt-1.5 flex-shrink-0" />
    <div>
      <span className="font-medium text-white">{platform}:</span>
      <span className="text-gray-400 ml-1">{instruction}</span>
    </div>
  </div>
);

const ConnectStep: React.FC<{
  localAccount: any;
  setLocalAccount: (acc: any) => void;
  showToken: boolean;
  setShowToken: (show: boolean) => void;
}> = ({ localAccount, setLocalAccount, showToken, setShowToken }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    <div className="text-center mb-8">
      <motion.div 
        className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, hsl(220 80% 55% / 0.2), transparent)' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        <Link className="w-8 h-8 text-[hsl(220_80%_60%)]" />
      </motion.div>
      <h2 className="text-2xl font-bold text-white mb-2">Connect your ad platforms</h2>
      <p className="text-gray-400">Optional: Skip this and set up later in Settings</p>
    </div>

    <div className="space-y-4 max-w-md mx-auto">
      <motion.div 
        className="glass rounded-xl p-5"
        style={{ border: '1px solid hsl(220 80% 55% / 0.2)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[hsl(220_80%_55%_/_0.2)] flex items-center justify-center">
            <svg className="w-5 h-5 text-[hsl(220_80%_60%)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Meta (Facebook) Ads</h3>
            <p className="text-xs text-gray-400">Connect for server-side tracking</p>
          </div>
        </div>
        <div className="space-y-3">
          <input 
            value={localAccount.metaPixelId || ''} 
            onChange={e => setLocalAccount({...localAccount, metaPixelId: e.target.value})} 
            placeholder="Pixel ID (e.g., 1234567890)"
            className="w-full bg-[hsl(230_20%_10%)] border border-[hsl(270_91%_65%_/_0.2)] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[hsl(270_91%_65%_/_0.5)] focus:ring-1 focus:ring-[hsl(270_91%_65%_/_0.3)] transition-all text-sm"
          />
          <div className="relative">
            <input 
              type={showToken ? "text" : "password"}
              value={localAccount.metaCapiToken || ''} 
              onChange={e => setLocalAccount({...localAccount, metaCapiToken: e.target.value})} 
              placeholder="Conversions API Token"
              className="w-full bg-[hsl(230_20%_10%)] border border-[hsl(270_91%_65%_/_0.2)] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[hsl(270_91%_65%_/_0.5)] focus:ring-1 focus:ring-[hsl(270_91%_65%_/_0.3)] transition-all text-sm pr-10"
            />
            <button 
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <a 
            href="https://business.facebook.com/events_manager" 
            target="_blank"
            className="text-xs text-[hsl(270_91%_70%)] hover:underline flex items-center gap-1"
          >
            How to get your CAPI token
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </motion.div>

      <motion.div 
        className="glass rounded-xl p-5"
        style={{ border: '1px solid hsl(0 80% 55% / 0.2)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[hsl(0_80%_55%_/_0.2)] flex items-center justify-center">
            <svg className="w-5 h-5 text-[hsl(0_80%_60%)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Google Ads</h3>
            <p className="text-xs text-gray-400">For offline conversion uploads</p>
          </div>
        </div>
        <div className="space-y-3">
          <input 
            value={localAccount.googleConversionId || ''} 
            onChange={e => setLocalAccount({...localAccount, googleConversionId: e.target.value})} 
            placeholder="Conversion ID (e.g., AW-123456789)"
            className="w-full bg-[hsl(230_20%_10%)] border border-[hsl(270_91%_65%_/_0.2)] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[hsl(270_91%_65%_/_0.5)] focus:ring-1 focus:ring-[hsl(270_91%_65%_/_0.3)] transition-all text-sm"
          />
          <a 
            href="https://ads.google.com" 
            target="_blank"
            className="text-xs text-[hsl(270_91%_70%)] hover:underline flex items-center gap-1"
          >
            Find your Google Ads Conversion ID
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </motion.div>

      <motion.div 
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{ 
          background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.1), hsl(320 80% 60% / 0.05))',
          border: '1px solid hsl(270 91% 65% / 0.2)'
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Info className="w-5 h-5 text-[hsl(270_91%_70%)] flex-shrink-0" />
        <p className="text-sm text-gray-300">
          Don't have these yet? No problem! The basic tracking will still work. 
          You can add these anytime from <span className="font-medium text-white">Settings</span>.
        </p>
      </motion.div>
    </div>
  </motion.div>
);

const CompleteStep: React.FC<{ name: string }> = ({ name }) => (
  <motion.div 
    className="text-center"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div 
      className="w-28 h-28 mx-auto mb-8 rounded-full flex items-center justify-center relative"
      style={{ 
        background: 'linear-gradient(135deg, hsl(150 80% 45%), hsl(170 80% 50%))',
        boxShadow: '0 20px 60px hsl(150 80% 40% / 0.4)'
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
      >
        <PartyPopper className="w-14 h-14 text-white" />
      </motion.div>
      
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: '2px solid hsl(150 80% 50%)' }}
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
      />
    </motion.div>

    <motion.h2 
      className="text-3xl font-bold text-white mb-4 heading"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      You're all set, {name || 'friend'}!
    </motion.h2>
    <motion.p 
      className="text-gray-400 mb-8 text-lg max-w-md mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      Your Chronos AI workspace is ready. Click below to enter your dashboard and start tracking.
    </motion.p>

    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <NextStepCard 
        icon={Play}
        title="Install Pixel"
        description="Add the tracking code to your site"
        color="hsl(270 91% 65%)"
      />
      <NextStepCard 
        icon={BarChart}
        title="View Analytics"
        description="See real-time visitor data"
        color="hsl(170 80% 50%)"
      />
      <NextStepCard 
        icon={TrendingUp}
        title="Get AI Insights"
        description="Let AI optimize your ads"
        color="hsl(40 95% 55%)"
      />
    </motion.div>

    <motion.p 
      className="text-sm text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
    >
      Need help? Check out the <span className="text-[hsl(270_91%_70%)]">Setup Guide</span> anytime
    </motion.p>
  </motion.div>
);

const NextStepCard: React.FC<{
  icon: React.FC<any>;
  title: string;
  description: string;
  color: string;
}> = ({ icon: Icon, title, description, color }) => (
  <motion.div 
    className="glass rounded-xl p-4 text-center"
    style={{ border: `1px solid ${color}20` }}
    whileHover={{ 
      y: -4,
      boxShadow: `0 20px 40px ${color}15`
    }}
  >
    <div 
      className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
      style={{ background: `${color}20` }}
    >
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <h3 className="font-semibold text-white text-sm">{title}</h3>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </motion.div>
);

export default OnboardingWizard;
