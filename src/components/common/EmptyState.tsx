import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative"
        style={{ 
          background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.1), hsl(320 80% 60% / 0.05))',
          border: '1px solid hsl(270 91% 65% / 0.2)'
        }}
        animate={{ 
          boxShadow: [
            '0 0 0 0 hsl(270 91% 65% / 0)',
            '0 0 0 15px hsl(270 91% 65% / 0.1)',
            '0 0 0 0 hsl(270 91% 65% / 0)'
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Icon className="w-10 h-10 text-[hsl(270_91%_70%)]" />
      </motion.div>
      
      <h3 className="text-xl font-bold text-white mb-2 heading">{title}</h3>
      <p className="text-gray-400 max-w-md mb-6">{description}</p>
      
      <div className="flex items-center gap-4">
        {actionLabel && onAction && (
          <motion.button
            onClick={onAction}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))',
              boxShadow: '0 8px 32px hsl(270 91% 65% / 0.3)'
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 12px 40px hsl(270 91% 65% / 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            {actionLabel}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
        
        {secondaryLabel && onSecondary && (
          <motion.button
            onClick={onSecondary}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-400 glass glass-hover transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {secondaryLabel}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export const DataLoadingState: React.FC<{ message?: string }> = ({ message = 'Loading data...' }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="w-16 h-16 rounded-full mb-6"
        style={{
          border: '3px solid hsl(230 20% 20%)',
          borderTopColor: 'hsl(270 91% 65%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-gray-400">{message}</p>
    </motion.div>
  );
};

export const NoDataCard: React.FC<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = ({ title, description, icon: Icon }) => (
  <motion.div
    className="glass rounded-xl p-6 text-center"
    style={{ border: '1px solid hsl(230 20% 15%)' }}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ borderColor: 'hsl(270 91% 65% / 0.2)' }}
  >
    <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-[hsl(270_91%_65%_/_0.1)]">
      <Icon className="w-6 h-6 text-[hsl(270_91%_70%)]" />
    </div>
    <h4 className="font-semibold text-white mb-1">{title}</h4>
    <p className="text-sm text-gray-500">{description}</p>
  </motion.div>
);

export default EmptyState;
