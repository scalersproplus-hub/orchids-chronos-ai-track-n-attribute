import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  content: string;
  learnMoreUrl?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ title, content, learnMoreUrl }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-500 hover:text-[hsl(270_91%_70%)] transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              className="absolute left-full top-0 ml-2 w-64 glass rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{ border: '1px solid hsl(270 91% 65% / 0.2)' }}
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(270_91%_65%_/_0.1)]">
                <h4 className="font-semibold text-white text-sm">{title}</h4>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-[hsl(270_91%_65%_/_0.1)] rounded-lg transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-300 leading-relaxed">{content}</p>
                {learnMoreUrl && (
                  <a 
                    href={learnMoreUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs text-[hsl(270_91%_70%)] hover:underline"
                  >
                    Learn more →
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export const InlineHelp: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
    <HelpCircle className="w-3 h-3" />
    {text}
  </span>
);

export default HelpTooltip;
