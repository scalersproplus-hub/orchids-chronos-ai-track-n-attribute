import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, ArrowRight, Code, Facebook, Database, CheckCircle, 
  Circle, BookOpen, Zap, ExternalLink
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
  const [showTasks, setShowTasks] = useState(false);

  const dismissKey = `welcome_banner_dismissed_${currentAccount.id}`;

  useEffect(() => {
    const isDismissed = localStorage.getItem(dismissKey) === 'true';
    setDismissed(isDismissed);
  }, [dismissKey]);

  const handleDismiss = () => {
    localStorage.setItem(dismissKey, 'true');
    setDismissed(true);
    addToast({ type: 'info', message: 'You can always access the Setup Guide from the sidebar.' });
  };

  const tasks: SetupTask[] = [
    {
      id: 'tracking',
      title: 'Install tracking code',
      description: 'Add the Chronos pixel to your website',
      completed: false,
      action: () => setCurrentView('setup'),
      actionLabel: 'View Instructions',
      icon: Code,
    },
    {
      id: 'meta',
      title: 'Connect Meta (Facebook)',
      description: 'Enable server-side conversion tracking',
      completed: !!(currentAccount.metaPixelId && currentAccount.metaCapiToken),
      action: () => setCurrentView('settings'),
      actionLabel: 'Connect',
      icon: Facebook,
    },
    {
      id: 'database',
      title: 'Setup database (optional)',
      description: 'Connect Supabase for data persistence',
      completed: !!(currentAccount.supabaseConfig?.url && currentAccount.supabaseConfig?.key),
      action: () => setCurrentView('settings'),
      actionLabel: 'Configure',
      icon: Database,
    },
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const allComplete = completedCount === tasks.length;

  if (dismissed || allComplete) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
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
        
        <div className="p-6 relative z-10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))',
                  boxShadow: '0 8px 32px hsl(270 91% 65% / 0.3)'
                }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white heading">
                  Welcome to Chronos AI!
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Complete these steps to start tracking your ad performance accurately.
                </p>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl hover:bg-[hsl(270_91%_65%_/_0.1)] transition-colors text-gray-500 hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-2 rounded-full bg-[hsl(230_20%_15%)] overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{ 
                  background: 'linear-gradient(90deg, hsl(270 91% 65%), hsl(170 80% 50%))',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / tasks.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-medium text-gray-400">
              {completedCount}/{tasks.length} complete
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => (
              <TaskItem key={task.id} task={task} index={index} />
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-[hsl(270_91%_65%_/_0.1)]">
            <button
              onClick={() => setCurrentView('setup')}
              className="flex items-center gap-2 text-sm text-[hsl(270_91%_70%)] hover:text-[hsl(270_91%_80%)] transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              View Full Setup Guide
            </button>
            
            <motion.button
              onClick={handleDismiss}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              whileHover={{ x: 4 }}
            >
              I'll do this later
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TaskItem: React.FC<{ task: SetupTask; index: number }> = ({ task, index }) => {
  return (
    <motion.div
      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
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
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        task.completed
          ? 'bg-[hsl(150_80%_45%_/_0.2)]'
          : 'bg-[hsl(270_91%_65%_/_0.1)]'
      }`}>
        {task.completed ? (
          <CheckCircle className="w-5 h-5 text-[hsl(150_80%_50%)]" />
        ) : (
          <task.icon className="w-5 h-5 text-[hsl(270_91%_70%)]" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-sm ${task.completed ? 'text-[hsl(150_80%_55%)]' : 'text-white'}`}>
          {task.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {task.description}
        </p>
      </div>
      
      {!task.completed && (
        <motion.button
          onClick={task.action}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.2), hsl(320 80% 60% / 0.1))',
            border: '1px solid hsl(270 91% 65% / 0.3)',
            color: 'hsl(270 91% 75%)',
          }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 4px 20px hsl(270 91% 65% / 0.2)'
          }}
          whileTap={{ scale: 0.98 }}
        >
          {task.actionLabel}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
      
      {task.completed && (
        <span className="text-xs text-[hsl(150_80%_50%)] font-medium px-3 py-1.5 rounded-full bg-[hsl(150_80%_45%_/_0.1)]">
          Completed
        </span>
      )}
    </motion.div>
  );
};

export default WelcomeBanner;
