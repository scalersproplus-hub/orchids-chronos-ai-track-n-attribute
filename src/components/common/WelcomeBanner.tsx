import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, ArrowRight, Code, Facebook, Database, CheckCircle, 
  Circle, BookOpen, Zap, ExternalLink, AlertCircle, BrainCircuit,
  Play, Settings
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

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

  useEffect(() => {
    const isDismissed = localStorage.getItem(dismissKey) === 'true';
    setDismissed(isDismissed);
    setAiAvailable(!!import.meta.env.VITE_GEMINI_API_KEY || !!process.env.API_KEY);
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
      {/* AI Status Notice */}
      <motion.div
        className="glass rounded-xl p-4 flex items-center gap-4"
        style={{ 
          border: aiAvailable 
            ? '1px solid hsl(150 80% 45% / 0.2)' 
            : '1px solid hsl(40 95% 55% / 0.2)',
          background: aiAvailable
            ? 'linear-gradient(135deg, hsl(150 80% 45% / 0.05), transparent)'
            : 'linear-gradient(135deg, hsl(40 95% 55% / 0.05), transparent)'
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          aiAvailable ? 'bg-[hsl(150_80%_45%_/_0.2)]' : 'bg-[hsl(40_95%_55%_/_0.2)]'
        }`}>
          {aiAvailable ? (
            <BrainCircuit className="w-5 h-5 text-[hsl(150_80%_50%)]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[hsl(40_95%_55%)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-sm ${aiAvailable ? 'text-[hsl(150_80%_55%)]' : 'text-[hsl(40_95%_60%)]'}`}>
            {aiAvailable ? 'AI Features Active' : 'AI Features: Demo Mode'}
          </h3>
          <p className="text-xs text-gray-500">
            {aiAvailable 
              ? 'Ask Chronos, predictions, and smart insights are fully enabled.'
              : 'Working with sample predictions. Add Gemini API key in Settings for full AI.'}
          </p>
        </div>
        {!aiAvailable && (
          <motion.button
            onClick={() => setCurrentView('settings')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{
              background: 'hsl(40 95% 55% / 0.15)',
              border: '1px solid hsl(40 95% 55% / 0.3)',
              color: 'hsl(40 95% 60%)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="w-3 h-3" />
            Enable AI
          </motion.button>
        )}
      </motion.div>

      {/* Main Welcome Banner */}
      {!allComplete && (
        <div 
          className="glass rounded-2xl overflow-hidden relative"
          style={{ 
            border: '1px solid hsl(270 91% 65% / 0.2)',
            background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.05) 0%, hsl(170 80% 50% / 0.03) 100%)'
          }}
        >
          <motion.div 
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, hsl(270 91% 65%) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          
          <div className="p-5 relative z-10">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))',
                    boxShadow: '0 8px 32px hsl(270 91% 65% / 0.3)'
                  }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold text-white heading">
                    Quick Setup Checklist
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {completedCount === 0 
                      ? "Let's get you tracking in minutes!" 
                      : `${tasks.length - completedCount} step${tasks.length - completedCount === 1 ? '' : 's'} left`}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="p-2 rounded-xl hover:bg-[hsl(270_91%_65%_/_0.1)] transition-colors text-gray-500 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {tasks.map((task, index) => (
                <TaskItem key={task.id} task={task} index={index} />
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[hsl(270_91%_65%_/_0.1)]">
              <button
                onClick={() => setCurrentView('setup')}
                className="flex items-center gap-2 text-sm text-[hsl(270_91%_70%)] hover:text-[hsl(270_91%_80%)] transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Full Setup Guide
              </button>
              
              <motion.button
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
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
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
        task.completed 
          ? 'bg-[hsl(150_80%_45%_/_0.1)]' 
          : 'glass glass-hover'
      }`}
      style={{ 
        border: task.completed 
          ? '1px solid hsl(150 80% 45% / 0.2)' 
          : '1px solid hsl(230 20% 15%)'
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.1 }}
      whileHover={{ x: task.completed ? 0 : 4 }}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        task.completed
          ? 'bg-[hsl(150_80%_45%_/_0.2)]'
          : 'bg-[hsl(270_91%_65%_/_0.1)]'
      }`}>
        {task.completed ? (
          <CheckCircle className="w-4 h-4 text-[hsl(150_80%_50%)]" />
        ) : (
          <task.icon className="w-4 h-4 text-[hsl(270_91%_70%)]" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-sm ${task.completed ? 'text-[hsl(150_80%_55%)]' : 'text-white'}`}>
          {task.title}
        </h3>
        <p className="text-xs text-gray-500">
          {task.description}
        </p>
      </div>
      
      {!task.completed && (
        <motion.button
          onClick={task.action}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.2), hsl(320 80% 60% / 0.1))',
            border: '1px solid hsl(270 91% 65% / 0.3)',
            color: 'hsl(270 91% 75%)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {task.actionLabel}
          <ArrowRight className="w-3 h-3" />
        </motion.button>
      )}
      
      {task.completed && (
        <span className="text-[10px] text-[hsl(150_80%_50%)] font-medium px-2 py-1 rounded-full bg-[hsl(150_80%_45%_/_0.1)]">
          Done
        </span>
      )}
    </motion.div>
  );
};

export default WelcomeBanner;