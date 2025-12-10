import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { 
  Check, ArrowRight, ArrowLeft, BrainCircuit, Globe, Link, Sparkles,
  PartyPopper, Play, Eye, EyeOff, ExternalLink, HelpCircle, Copy,
  CheckCircle, AlertCircle, Loader2, Zap, Shield, Target, TrendingUp,
  MousePointer, BarChart, Users, X, Info, ChevronRight, Rocket, PlayCircle,
  Settings, Clock, Gift
} from 'lucide-react';

const ONBOARDING_STEPS = [
  { id: 1, title: "Welcome", subtitle: "Let's get started" },
  { id: 2, title: "Your Business", subtitle: "Quick setup" },
  { id: 3, title: "You're Ready!", subtitle: "Start tracking" },
];

export const OnboardingWizard: React.FC = () => {
  const { state, updateAccount, markSetupComplete, addToast } = useApp();
  const { currentAccount } = state;
  const [step, setStep] = useState(1);
  const [localAccount, setLocalAccount] = useState(currentAccount);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    updateAccount(localAccount);
    if (step < 3) {
      setStep(s => s + 1);
    } else {
      markSetupComplete(currentAccount.id);
      addToast({ type: 'success', message: 'Welcome to Chronos AI! Your workspace is ready.' });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleTryDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      const demoAccount = {
        ...currentAccount,
        name: 'Demo Workspace',
        websiteUrl: 'https://demo-store.com',
        setupComplete: true,
      };
      updateAccount(demoAccount);
      markSetupComplete(currentAccount.id);
      addToast({ 
        type: 'success', 
        message: 'Demo mode activated! Explore with sample data.' 
      });
    }, 800);
  };

  const handleSkipSetup = () => {
    markSetupComplete(currentAccount.id);
    addToast({ type: 'info', message: 'You can complete setup anytime from the Setup Guide.' });
  };

  const handleCopyTag = () => {
    const tag = `<script async src="https://cdn.chronos-ai.io/tag.js" data-chronos-id="${localAccount.id}"></script>`;
    navigator.clipboard.writeText(tag);
    setCopied(true);
    addToast({ type: 'success', message: 'Tracking code copied!' });
    setTimeout(() => setCopied(false), 3000);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return true;
      case 2: return localAccount.name.trim().length > 0;
      case 3: return true;
      default: return true;
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(270_91%_8%)] via-[hsl(230_25%_5%)] to-[hsl(270_91%_5%)]" />
      
      <motion.div 
        className="absolute top-20 left-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(270 91% 65%) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(170 80% 50%) 0%, transparent 70%)' }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div 
        className="w-full max-w-2xl relative z-10"
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
          {/* Header */}
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
                >
                  <BrainCircuit className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white heading">Chronos AI</h1>
                  <p className="text-sm text-gray-400">See which ads actually make you money</p>
                </div>
              </motion.div>
            </div>

            {/* Progress Steps */}
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
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-10 min-h-[380px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <WelcomeStep 
                  key="welcome" 
                  onTryDemo={handleTryDemo} 
                  isLoading={isLoading}
                />
              )}
              {step === 2 && (
                <BusinessStep 
                  key="business" 
                  localAccount={localAccount} 
                  setLocalAccount={setLocalAccount}
                />
              )}
              {step === 3 && (
                <CompleteStep 
                  key="complete" 
                  name={localAccount.name}
                  accountId={localAccount.id}
                  copied={copied}
                  onCopy={handleCopyTag}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 md:p-8 bg-[hsl(230_25%_4%)] border-t border-[hsl(270_91%_65%_/_0.1)] flex justify-between items-center">
            {step === 1 ? (
              <motion.button
                onClick={handleSkipSetup}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
                whileHover={{ scale: 1.02 }}
              >
                Skip setup for now
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button 
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 text-gray-300 hover:text-white glass glass-hover transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </motion.button>
            )}

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
              whileHover={canProceed() ? { scale: 1.02 } : {}}
              whileTap={canProceed() ? { scale: 0.98 } : {}}
            >
              {step === 3 ? (
                <>
                  <Rocket className="w-4 h-4" />
                  Go to Dashboard
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
          Need help? Check the <span className="text-[hsl(270_91%_70%)]">Setup Guide</span> after you're in
        </motion.p>
      </motion.div>
    </div>
  );
};

const WelcomeStep: React.FC<{ onTryDemo: () => void; isLoading: boolean }> = ({ onTryDemo, isLoading }) => (
  <motion.div 
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <motion.div 
      className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center"
      style={{ 
        background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.2), hsl(320 80% 60% / 0.1))',
        border: '1px solid hsl(270 91% 65% / 0.3)'
      }}
      animate={{ boxShadow: ['0 0 30px hsl(270 91% 65% / 0.2)', '0 0 60px hsl(270 91% 65% / 0.3)', '0 0 30px hsl(270 91% 65% / 0.2)'] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <Sparkles className="w-10 h-10 text-[hsl(270_91%_75%)]" />
    </motion.div>

    <h2 className="text-2xl font-bold text-white mb-3 heading">
      Welcome to Chronos AI
    </h2>
    <p className="text-gray-400 mb-6 max-w-md mx-auto">
      Track exactly which ads bring you real customers - even the ones Facebook and Google miss.
    </p>

    {/* Demo Mode CTA */}
    <motion.button
      onClick={onTryDemo}
      disabled={isLoading}
      className="w-full max-w-sm mx-auto mb-6 p-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
      style={{
        background: 'linear-gradient(135deg, hsl(170 80% 45% / 0.15), hsl(150 80% 50% / 0.1))',
        border: '1px solid hsl(170 80% 50% / 0.3)',
      }}
      whileHover={{ scale: 1.02, borderColor: 'hsl(170 80% 50% / 0.5)' }}
      whileTap={{ scale: 0.98 }}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 text-[hsl(170_80%_55%)] animate-spin" />
      ) : (
        <PlayCircle className="w-5 h-5 text-[hsl(170_80%_55%)]" />
      )}
      <div className="text-left">
        <span className="font-semibold text-[hsl(170_80%_55%)]">Try Demo Mode</span>
        <p className="text-xs text-gray-400">Explore with sample data - no setup needed</p>
      </div>
      <Gift className="w-5 h-5 text-[hsl(170_80%_55%)] ml-auto" />
    </motion.button>

    <div className="text-xs text-gray-500 mb-6">— or —</div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <FeatureCard 
        icon={Target}
        title="True Attribution"
        description="See revenue from each ad"
        delay={0.1}
      />
      <FeatureCard 
        icon={Shield}
        title="Ad Blocker Proof"
        description="Tracks iOS 14.5+ users"
        delay={0.2}
      />
      <FeatureCard 
        icon={TrendingUp}
        title="AI Insights"
        description="Know where to spend"
        delay={0.3}
      />
    </div>

    <motion.div
      className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Clock className="w-3 h-3" />
      Setup takes about 2 minutes
    </motion.div>
  </motion.div>
);

const FeatureCard: React.FC<{ 
  icon: React.FC<any>; 
  title: string; 
  description: string;
  delay: number;
}> = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    className="glass rounded-xl p-4 text-left"
    style={{ border: '1px solid hsl(270 91% 65% / 0.1)' }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <div 
      className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
      style={{ background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.2), transparent)' }}
    >
      <Icon className="w-4 h-4 text-[hsl(270_91%_75%)]" />
    </div>
    <h3 className="font-semibold text-white text-sm">{title}</h3>
    <p className="text-xs text-gray-500">{description}</p>
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
  >
    <div className="text-center mb-8">
      <motion.div 
        className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, hsl(170 80% 50% / 0.2), transparent)' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        <Users className="w-7 h-7 text-[hsl(170_80%_55%)]" />
      </motion.div>
      <h2 className="text-xl font-bold text-white mb-2">What's your business called?</h2>
      <p className="text-gray-400 text-sm">This is just for your reference</p>
    </div>

    <div className="space-y-5 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Workspace Name
        </label>
        <input 
          value={localAccount.name} 
          onChange={e => setLocalAccount({...localAccount, name: e.target.value})} 
          placeholder="e.g., My Online Store"
          className="w-full bg-[hsl(230_20%_10%)] border border-[hsl(270_91%_65%_/_0.2)] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[hsl(270_91%_65%_/_0.5)] focus:ring-1 focus:ring-[hsl(270_91%_65%_/_0.3)] transition-all text-lg"
          autoFocus
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Website URL <span className="text-gray-500">(optional)</span>
        </label>
        <input 
          value={localAccount.websiteUrl} 
          onChange={e => setLocalAccount({...localAccount, websiteUrl: e.target.value})} 
          placeholder="https://yoursite.com"
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
        <Info className="w-4 h-4 text-[hsl(170_80%_55%)] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-300">
          You can add tracking code and connect ad platforms later from the Setup Guide.
        </p>
      </motion.div>
    </div>
  </motion.div>
);

const CompleteStep: React.FC<{ 
  name: string; 
  accountId: string;
  copied: boolean;
  onCopy: () => void;
}> = ({ name, accountId, copied, onCopy }) => {
  const tag = `<script async src="https://cdn.chronos-ai.io/tag.js" data-chronos-id="${accountId}"></script>`;

  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <motion.div 
        className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center relative"
        style={{ 
          background: 'linear-gradient(135deg, hsl(150 80% 45%), hsl(170 80% 50%))',
          boxShadow: '0 20px 60px hsl(150 80% 40% / 0.4)'
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        <PartyPopper className="w-10 h-10 text-white" />
      </motion.div>

      <motion.h2 
        className="text-2xl font-bold text-white mb-3 heading"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        You're all set, {name || 'friend'}!
      </motion.h2>
      <motion.p 
        className="text-gray-400 mb-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Your workspace is ready. Here's your tracking code for when you need it:
      </motion.p>

      <motion.div
        className="max-w-lg mx-auto mb-6 rounded-xl overflow-hidden text-left"
        style={{ border: '1px solid hsl(270 91% 65% / 0.2)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-[hsl(230_20%_8%)]">
          <span className="text-xs font-mono text-gray-500">Your Tracking Code</span>
          <motion.button 
            onClick={onCopy}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              copied 
                ? 'bg-[hsl(150_80%_45%)] text-white' 
                : 'bg-[hsl(270_91%_65%_/_0.2)] text-[hsl(270_91%_75%)] hover:bg-[hsl(270_91%_65%_/_0.3)]'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
        <pre className="p-3 bg-[hsl(230_20%_5%)] overflow-x-auto">
          <code className="text-xs font-mono text-[hsl(150_80%_60%)] whitespace-pre-wrap break-all">
            {tag}
          </code>
        </pre>
      </motion.div>

      <motion.div 
        className="grid grid-cols-3 gap-3 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <NextStepCard 
          icon={BarChart}
          title="Dashboard"
          description="View analytics"
          color="hsl(270 91% 65%)"
        />
        <NextStepCard 
          icon={Settings}
          title="Setup Guide"
          description="Add tracking"
          color="hsl(170 80% 50%)"
        />
        <NextStepCard 
          icon={Sparkles}
          title="Ask AI"
          description="Get insights"
          color="hsl(40 95% 55%)"
        />
      </motion.div>
    </motion.div>
  );
};

const NextStepCard: React.FC<{
  icon: React.FC<any>;
  title: string;
  description: string;
  color: string;
}> = ({ icon: Icon, title, description, color }) => (
  <div 
    className="glass rounded-xl p-3 text-center"
    style={{ border: `1px solid ${color}20` }}
  >
    <div 
      className="w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center"
      style={{ background: `${color}20` }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <h3 className="font-medium text-white text-xs">{title}</h3>
    <p className="text-[10px] text-gray-500">{description}</p>
  </div>
);

export default OnboardingWizard;