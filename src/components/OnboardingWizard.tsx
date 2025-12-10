import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { 
  Check, ArrowRight, ArrowLeft, BrainCircuit, Sparkles,
  PartyPopper, Copy, Loader2, Zap, Shield, Target, TrendingUp,
  BarChart, Users, Info, ChevronRight, Rocket, PlayCircle,
  Clock, Gift, Crown, Layers
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
      <div className="absolute inset-0 bg-[hsl(222_47%_4%)]" />
      
      <motion.div 
        className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.08]"
        style={{ 
          background: 'radial-gradient(circle, hsl(258 89% 55%) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        animate={{ 
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute -bottom-32 right-0 w-[500px] h-[500px] rounded-full opacity-[0.06]"
        style={{ 
          background: 'radial-gradient(circle, hsl(168 84% 50%) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{ 
          x: [0, -40, 0],
          y: [0, -20, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04]"
        style={{ 
          background: 'radial-gradient(circle, hsl(328 85% 55%) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{ 
          x: [0, 30, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div 
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div 
          className="rounded-3xl overflow-hidden"
          style={{ 
            background: 'linear-gradient(145deg, hsl(222 47% 7% / 0.95) 0%, hsl(222 47% 5% / 0.98) 100%)',
            border: '1px solid hsl(258 89% 66% / 0.12)',
            boxShadow: '0 40px 120px -30px hsl(258 89% 40% / 0.35), 0 0 80px -40px hsl(258 89% 66% / 0.2)'
          }}
        >
          <div className="p-6 md:p-8 border-b border-[hsl(258_89%_66%_/_0.08)]">
            <div className="flex items-center justify-between mb-8">
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.div 
                  className="p-3.5 rounded-2xl relative"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(258 89% 66%), hsl(328 85% 60%))',
                    boxShadow: '0 12px 40px hsl(258 89% 50% / 0.4), inset 0 1px 0 hsl(255 100% 100% / 0.15)'
                  }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <BrainCircuit className="w-7 h-7 text-white" />
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-[hsl(258_89%_66%)] to-[hsl(168_84%_52%)] opacity-20 blur-xl pointer-events-none" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white heading gradient-text">Chronos AI</h1>
                  <p className="text-sm text-gray-500">See which ads actually make you money</p>
                </div>
              </motion.div>
            </div>

            <div className="flex justify-between items-center gap-3">
              {ONBOARDING_STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <motion.div 
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                  >
                    <motion.div 
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-400 ${
                        step > s.id 
                          ? 'text-white' 
                          : step === s.id 
                            ? 'text-white' 
                            : 'text-gray-600'
                      }`}
                      style={{
                        background: step > s.id 
                          ? 'linear-gradient(135deg, hsl(152 76% 48%), hsl(168 84% 52%))'
                          : step === s.id
                            ? 'linear-gradient(135deg, hsl(258 89% 66%), hsl(328 85% 60%))'
                            : 'hsl(222 30% 10%)',
                        border: step >= s.id ? 'none' : '1px solid hsl(222 30% 15%)',
                        boxShadow: step >= s.id ? `0 6px 20px ${step === s.id ? 'hsl(258 89% 50% / 0.35)' : 'hsl(152 76% 40% / 0.25)'}` : 'none'
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                    </motion.div>
                    <span className={`text-xs hidden md:block transition-colors font-medium ${
                      step >= s.id ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {s.title}
                    </span>
                  </motion.div>
                  {i < ONBOARDING_STEPS.length - 1 && (
                    <motion.div 
                      className="flex-grow h-0.5 rounded-full mx-1 transition-all duration-500"
                      style={{
                        background: step > s.id 
                          ? 'linear-gradient(90deg, hsl(152 76% 48%), hsl(168 84% 52%))'
                          : 'hsl(222 30% 12%)'
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-10 min-h-[400px]">
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

          <div className="p-6 md:p-8 border-t border-[hsl(258_89%_66%_/_0.08)] flex justify-between items-center"
            style={{ background: 'hsl(222 47% 4% / 0.5)' }}
          >
            {step === 1 ? (
              <motion.button
                onClick={handleSkipSetup}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 font-medium"
                whileHover={{ scale: 1.02, x: 2 }}
              >
                Skip setup for now
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button 
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 text-gray-300 hover:text-white transition-all"
                style={{
                  background: 'hsl(222 30% 10%)',
                  border: '1px solid hsl(222 30% 15%)',
                }}
                whileHover={{ scale: 1.02, borderColor: 'hsl(258 89% 66% / 0.2)' }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </motion.button>
            )}

            <motion.button 
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-7 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                canProceed()
                  ? 'text-white'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
              }`}
              style={canProceed() ? {
                background: 'linear-gradient(135deg, hsl(258 89% 66%), hsl(328 85% 60%))',
                boxShadow: '0 8px 32px hsl(258 89% 50% / 0.35), inset 0 1px 0 hsl(255 100% 100% / 0.1)'
              } : {}}
              whileHover={canProceed() ? { scale: 1.02, boxShadow: '0 12px 40px hsl(258 89% 50% / 0.45)' } : {}}
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
          Need help? Check the <span className="text-[hsl(258_95%_75%)] font-medium">Setup Guide</span> after you're in
        </motion.p>
      </motion.div>
    </div>
  );
};

const WelcomeStep: React.FC<{ onTryDemo: () => void; isLoading: boolean }> = ({ onTryDemo, isLoading }) => (
  <motion.div 
    className="text-center"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -24 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
  >
    <motion.div 
      className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
      style={{ 
        background: 'linear-gradient(135deg, hsl(258 89% 66% / 0.15), hsl(328 85% 60% / 0.08))',
        border: '1px solid hsl(258 89% 66% / 0.2)'
      }}
      animate={{ boxShadow: ['0 0 40px hsl(258 89% 66% / 0.15)', '0 0 60px hsl(258 89% 66% / 0.25)', '0 0 40px hsl(258 89% 66% / 0.15)'] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      <Sparkles className="w-10 h-10 text-[hsl(258_95%_80%)]" />
    </motion.div>

    <h2 className="text-2xl font-bold text-white mb-3 heading">
      Welcome to Chronos AI
    </h2>
    <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
      Track exactly which ads bring you real customers - even the ones Facebook and Google miss.
    </p>

    <motion.button
      onClick={onTryDemo}
      disabled={isLoading}
      className="w-full max-w-sm mx-auto mb-8 p-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
      style={{
        background: 'linear-gradient(135deg, hsl(168 84% 52% / 0.12), hsl(152 76% 48% / 0.08))',
        border: '1px solid hsl(168 84% 52% / 0.2)',
      }}
      whileHover={{ scale: 1.02, borderColor: 'hsl(168 84% 52% / 0.4)', boxShadow: '0 8px 32px hsl(168 84% 40% / 0.15)' }}
      whileTap={{ scale: 0.98 }}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 text-[hsl(168_84%_60%)] animate-spin" />
      ) : (
        <PlayCircle className="w-5 h-5 text-[hsl(168_84%_60%)]" />
      )}
      <div className="text-left">
        <span className="font-semibold text-[hsl(168_84%_60%)]">Try Demo Mode</span>
        <p className="text-xs text-gray-500">Explore with sample data - no setup needed</p>
      </div>
      <Gift className="w-5 h-5 text-[hsl(168_84%_60%)] ml-auto" />
    </motion.button>

    <div className="text-xs text-gray-600 mb-8 flex items-center justify-center gap-3">
      <div className="w-12 h-px bg-[hsl(222_30%_15%)]" />
      <span>or continue with setup</span>
      <div className="w-12 h-px bg-[hsl(222_30%_15%)]" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FeatureCard 
        icon={Target}
        title="True Attribution"
        description="See revenue from each ad"
        delay={0.1}
        color="hsl(258 89% 66%)"
      />
      <FeatureCard 
        icon={Shield}
        title="Ad Blocker Proof"
        description="Tracks iOS 14.5+ users"
        delay={0.2}
        color="hsl(168 84% 52%)"
      />
      <FeatureCard 
        icon={TrendingUp}
        title="AI Insights"
        description="Know where to spend"
        delay={0.3}
        color="hsl(328 85% 60%)"
      />
    </div>

    <motion.div
      className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Clock className="w-3.5 h-3.5 text-[hsl(168_84%_55%)]" />
      <span>Setup takes about <strong className="text-gray-400">2 minutes</strong></span>
    </motion.div>
  </motion.div>
);

const FeatureCard: React.FC<{ 
  icon: React.FC<any>; 
  title: string; 
  description: string;
  delay: number;
  color: string;
}> = ({ icon: Icon, title, description, delay, color }) => (
  <motion.div 
    className="rounded-xl p-4 text-left"
    style={{ 
      background: 'hsl(222 47% 6%)',
      border: '1px solid hsl(222 30% 12%)'
    }}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ borderColor: `${color}30`, y: -2 }}
  >
    <div 
      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
      style={{ background: `${color}15` }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
    <p className="text-xs text-gray-500">{description}</p>
  </motion.div>
);

const BusinessStep: React.FC<{
  localAccount: any;
  setLocalAccount: (acc: any) => void;
}> = ({ localAccount, setLocalAccount }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -24 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="text-center mb-10">
      <motion.div 
        className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(135deg, hsl(168 84% 52% / 0.15), hsl(152 76% 48% / 0.08))',
          border: '1px solid hsl(168 84% 52% / 0.2)'
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        <Users className="w-8 h-8 text-[hsl(168_84%_60%)]" />
      </motion.div>
      <h2 className="text-xl font-bold text-white mb-2 heading">What's your business called?</h2>
      <p className="text-gray-500 text-sm">This is just for your reference</p>
    </div>

    <div className="space-y-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <label className="block text-sm font-medium text-gray-300 mb-2.5">
          Workspace Name
        </label>
        <input 
          value={localAccount.name} 
          onChange={e => setLocalAccount({...localAccount, name: e.target.value})} 
          placeholder="e.g., My Online Store"
          className="w-full rounded-xl px-4 py-3.5 text-white placeholder-gray-600 transition-all text-lg font-medium"
          style={{
            background: 'hsl(222 47% 6%)',
            border: '1px solid hsl(258 89% 66% / 0.15)',
          }}
          autoFocus
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <label className="block text-sm font-medium text-gray-300 mb-2.5">
          Website URL <span className="text-gray-600">(optional)</span>
        </label>
        <input 
          value={localAccount.websiteUrl} 
          onChange={e => setLocalAccount({...localAccount, websiteUrl: e.target.value})} 
          placeholder="https://yoursite.com"
          className="w-full rounded-xl px-4 py-3.5 text-white placeholder-gray-600 transition-all"
          style={{
            background: 'hsl(222 47% 6%)',
            border: '1px solid hsl(258 89% 66% / 0.15)',
          }}
        />
      </motion.div>

      <motion.div 
        className="rounded-xl p-4 flex items-start gap-3"
        style={{ 
          background: 'hsl(168 84% 52% / 0.06)',
          border: '1px solid hsl(168 84% 52% / 0.15)'
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Info className="w-4 h-4 text-[hsl(168_84%_60%)] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-400 leading-relaxed">
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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center relative"
        style={{ 
          background: 'linear-gradient(135deg, hsl(152 76% 48%), hsl(168 84% 52%))',
          boxShadow: '0 20px 60px hsl(152 76% 40% / 0.35)'
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        <PartyPopper className="w-10 h-10 text-white" />
      </motion.div>

      <motion.h2 
        className="text-2xl font-bold text-white mb-3 heading"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        You're all set, {name || 'friend'}!
      </motion.h2>
      <motion.p 
        className="text-gray-400 mb-8 max-w-md mx-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Your workspace is ready. Here's your tracking code for when you need it:
      </motion.p>

      <motion.div
        className="max-w-lg mx-auto mb-8 rounded-xl overflow-hidden text-left"
        style={{ border: '1px solid hsl(258 89% 66% / 0.15)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ background: 'hsl(222 47% 6%)' }}>
          <span className="text-xs font-mono text-gray-500">Your Tracking Code</span>
          <motion.button 
            onClick={onCopy}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              copied 
                ? 'text-white' 
                : 'text-[hsl(258_95%_80%)] hover:text-white'
            }`}
            style={{
              background: copied ? 'hsl(152 76% 48%)' : 'hsl(258 89% 66% / 0.15)',
              border: copied ? 'none' : '1px solid hsl(258 89% 66% / 0.2)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
        <pre className="p-4 overflow-x-auto" style={{ background: 'hsl(222 47% 4%)' }}>
          <code className="text-xs font-mono text-[hsl(152_80%_60%)] whitespace-pre-wrap break-all">
            {tag}
          </code>
        </pre>
      </motion.div>

      <motion.div 
        className="grid grid-cols-3 gap-4 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <NextStepCard 
          icon={BarChart}
          title="Dashboard"
          description="View analytics"
          color="hsl(258 89% 66%)"
        />
        <NextStepCard 
          icon={Layers}
          title="Setup Guide"
          description="Add tracking"
          color="hsl(168 84% 52%)"
        />
        <NextStepCard 
          icon={Sparkles}
          title="Ask AI"
          description="Get insights"
          color="hsl(38 92% 55%)"
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
  <motion.div 
    className="rounded-xl p-4 text-center"
    style={{ 
      background: 'hsl(222 47% 6%)',
      border: `1px solid ${color}20`
    }}
    whileHover={{ borderColor: `${color}40`, y: -2 }}
  >
    <div 
      className="w-11 h-11 mx-auto mb-2.5 rounded-lg flex items-center justify-center"
      style={{ background: `${color}15` }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <h3 className="font-semibold text-white text-sm">{title}</h3>
    <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
  </motion.div>
);

export default OnboardingWizard;