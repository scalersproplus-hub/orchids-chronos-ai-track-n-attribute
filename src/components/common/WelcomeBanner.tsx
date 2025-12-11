import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, ArrowRight, Code, Facebook, Database, CheckCircle, 
  Circle, BookOpen, Zap, ExternalLink, AlertCircle, BrainCircuit,
  Play, Settings
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { isDemoMode } from '../../services/mockData';

interface SetupTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action: () => void;
  actionLabel: string;
  icon: React.FC<any>;
}

export const WelcomeBanner: React.FC = () => {
  const { state, setCurrentView, addToast } = useApp();
  const { currentAccount } = state;
  const [dismissed, setDismissed] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);

  const dismissKey = `welcome_banner_dismissed_${currentAccount.id}`;
  const isDemo = isDemoMode(currentAccount);

  useEffect(() => {
    const isDismissedStored = localStorage.getItem(dismissKey) === 'true';
    setDismissed(isDismissedStored);
    setAiAvailable(!!import.meta.env.VITE_GEMINI_API_KEY);
  }, [dismissKey]);

  const handleDismiss = () => {
    localStorage.setItem(dismissKey, 'true');
    setDismissed(true);
    addToast({ type: 'info', message: 'Setup checklist hidden. Find it in Setup Guide anytime.' });
  };

  const tasks: SetupTask[] = [
    {
      id: 'tracking',
      title: 'Add tracking to your website',
      description: 'Copy and paste a simple code snippet',
      completed: false,
      action: () => setCurrentView('setup'),
      actionLabel: 'Show me how',
      icon: Code,
    },
    {
      id: 'meta',
      title: 'Connect Facebook Ads',
      description: 'Track sales Facebook misses',
      completed: !!(currentAccount.metaPixelId && currentAccount.metaCapiToken),
      action: () => setCurrentView('settings'),
      actionLabel: 'Connect',
      icon: Facebook,
    },
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const allComplete = completedCount === tasks.length;

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 space-y-4"
    >
      <motion.div
        className="glass-premium rounded-xl p-4 flex items-center gap-4"
        style={{ 
          border: aiAvailable 
            ? '1px solid hsl(158 72% 46% / 0.15)' 
            : '1px solid hsl(42 92% 56% / 0.15)',
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          aiAvailable ? 'bg-[hsl(158_72%_46%_/_0.12)]' : 'bg-[hsl(42_92%_56%_/_0.12)]'
        }`}>
          {aiAvailable ? (
            <BrainCircuit className="w-5 h-5 text-[hsl(158_78%_55%)]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[hsl(42_95%_60%)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-[13px] ${aiAvailable ? 'text-[hsl(158_78%_58%)]' : 'text-[hsl(42_95%_62%)]'}`}>
            {aiAvailable ? 'AI Features Active' : 'AI Features: Demo Mode'}
          </h3>
          <p className="text-[12px] text-[hsl(225_12%_50%)]">
            {aiAvailable 
              ? 'Ask Chronos, predictions, and smart insights are fully enabled.'
              : 'Working with sample predictions. Add Gemini API key in Settings for full AI.'}
          </p>
        </div>
        {!aiAvailable && (
          <motion.button
            onClick={() => setCurrentView('settings')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap"
            style={{
              background: 'hsl(42 92% 56% / 0.1)',
              border: '1px solid hsl(42 92% 56% / 0.2)',
              color: 'hsl(42 95% 62%)',
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 24px hsl(42 92% 56% / 0.15)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="w-3 h-3" />
            Enable AI
          </motion.button>
        )}
      </motion.div>

      {!allComplete && (
        <div 
          className="glass-premium rounded-2xl overflow-hidden relative"
          style={{ 
            border: '1px solid hsl(252 87% 64% / 0.12)',
          }}
        >
          <motion.div 
            className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 blur-[80px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, hsl(252 87% 64%) 0%, transparent 65%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          
          <div className="p-6 relative z-10">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(252 87% 60%), hsl(330 80% 55%))',
                    boxShadow: '0 8px 32px hsl(252 87% 50% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.2)'
                  }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold text-white heading tracking-tight">
                    Quick Setup Checklist
                  </h2>
                  <p className="text-[hsl(225_12%_50%)] text-[13px]">
                    {completedCount === 0 
                      ? "Let's get you tracking in minutes!" 
                      : `${tasks.length - completedCount} step${tasks.length - completedCount === 1 ? '' : 's'} left`}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="p-2 rounded-xl hover:bg-[hsl(252_87%_64%_/_0.08)] transition-colors text-[hsl(225_12%_45%)] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task, index) => (
                <TaskItem key={task.id} task={task} index={index} />
              ))}
            </div>

            <div className="flex items-center justify-between mt-5 pt-5 border-t border-[hsl(225_15%_14%_/_0.6)]">
              <button
                onClick={() => setCurrentView('setup')}
                className="flex items-center gap-2 text-[13px] text-[hsl(252_92%_72%)] hover:text-[hsl(252_92%_82%)] transition-colors font-medium"
              >
                <BookOpen className="w-4 h-4" />
                Full Setup Guide
              </button>
              
              <motion.button
                onClick={handleDismiss}
                className="text-[12px] text-[hsl(225_12%_45%)] hover:text-white transition-colors"
                whileHover={{ x: 4 }}
              >
                Hide checklist
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const TaskItem: React.FC<{ task: SetupTask; index: number }> = ({ task, index }) => {
  return (
    <motion.div
      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
        task.completed 
          ? 'bg-[hsl(158_72%_46%_/_0.06)]' 
          : 'glass glass-hover'
      }`}
      style={{ 
        border: task.completed 
          ? '1px solid hsl(158 72% 46% / 0.12)' 
          : '1px solid hsl(225 15% 14% / 0.6)'
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.1 }}
      whileHover={{ x: task.completed ? 0 : 4 }}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        task.completed
          ? 'bg-[hsl(158_72%_46%_/_0.15)]'
          : 'bg-[hsl(252_87%_64%_/_0.1)]'
      }`}>
        {task.completed ? (
          <CheckCircle className="w-4 h-4 text-[hsl(158_78%_55%)]" />
        ) : (
          <task.icon className="w-4 h-4 text-[hsl(252_92%_72%)]" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-[13px] ${task.completed ? 'text-[hsl(158_78%_58%)]' : 'text-white'}`}>
          {task.title}
        </h3>
        <p className="text-[12px] text-[hsl(225_12%_50%)]">
          {task.description}
        </p>
      </div>
      
      {!task.completed && (
        <motion.button
          onClick={task.action}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, hsl(252 87% 64% / 0.12), hsl(330 80% 60% / 0.08))',
            border: '1px solid hsl(252 87% 64% / 0.2)',
            color: 'hsl(252 92% 78%)',
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 0 24px hsl(252 87% 64% / 0.15)' }}
          whileTap={{ scale: 0.98 }}
        >
          {task.actionLabel}
          <ArrowRight className="w-3 h-3" />
        </motion.button>
      )}
      
      {task.completed && (
        <span className="text-[10px] text-[hsl(158_78%_55%)] font-semibold px-2.5 py-1 rounded-md bg-[hsl(158_72%_46%_/_0.1)] border border-[hsl(158_72%_46%_/_0.12)]">
          Done
        </span>
      )}
    </motion.div>
  );
};

export default WelcomeBanner;