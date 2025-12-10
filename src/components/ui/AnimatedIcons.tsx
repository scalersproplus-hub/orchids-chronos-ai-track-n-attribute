import React from 'react';
import { motion } from 'framer-motion';

interface IconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

export const PulsingOrb: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <radialGradient id="orbGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="hsl(270 91% 75%)" />
        <stop offset="100%" stopColor="hsl(270 91% 50%)" />
      </radialGradient>
      <filter id="orbGlow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <motion.circle
      cx="12"
      cy="12"
      r="8"
      fill="url(#orbGradient)"
      filter="url(#orbGlow)"
      animate={animate ? {
        scale: [1, 1.15, 1],
        opacity: [0.8, 1, 0.8],
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <motion.circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="hsl(270 91% 65% / 0.3)"
      strokeWidth="1"
      animate={animate ? {
        scale: [1, 1.3, 1],
        opacity: [0.5, 0, 0.5],
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </svg>
);

export const AnimatedBrain: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(270 91% 65%)" />
        <stop offset="50%" stopColor="hsl(320 80% 60%)" />
        <stop offset="100%" stopColor="hsl(170 80% 50%)" />
      </linearGradient>
    </defs>
    <motion.path
      d="M12 2C8 2 4 5 4 9c0 2 1 4 3 5v4c0 2 2 4 5 4s5-2 5-4v-4c2-1 3-3 3-5 0-4-4-7-8-7z"
      stroke="url(#brainGradient)"
      strokeWidth="1.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={animate ? { pathLength: 1 } : { pathLength: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    />
    <motion.g
      animate={animate ? { opacity: [0.3, 1, 0.3] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <circle cx="8" cy="8" r="1" fill="hsl(270 91% 75%)" />
      <circle cx="16" cy="8" r="1" fill="hsl(170 80% 55%)" />
      <circle cx="12" cy="12" r="1" fill="hsl(320 80% 65%)" />
    </motion.g>
    <motion.path
      d="M8 8L12 12M16 8L12 12M12 12V16"
      stroke="hsl(270 91% 65% / 0.5)"
      strokeWidth="0.5"
      animate={animate ? { opacity: [0.3, 0.7, 0.3] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </svg>
);

export const AnimatedChart: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="bar1" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="hsl(270 91% 65%)" />
        <stop offset="100%" stopColor="hsl(270 91% 75%)" />
      </linearGradient>
      <linearGradient id="bar2" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="hsl(170 80% 45%)" />
        <stop offset="100%" stopColor="hsl(170 80% 55%)" />
      </linearGradient>
      <linearGradient id="bar3" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="hsl(320 80% 55%)" />
        <stop offset="100%" stopColor="hsl(320 80% 65%)" />
      </linearGradient>
    </defs>
    <motion.rect
      x="4" y="14" width="4" height="6" rx="1"
      fill="url(#bar1)"
      initial={{ scaleY: 0 }}
      animate={animate ? { scaleY: 1 } : { scaleY: 1 }}
      transition={{ duration: 0.5, delay: 0 }}
      style={{ originY: 1 }}
    />
    <motion.rect
      x="10" y="8" width="4" height="12" rx="1"
      fill="url(#bar2)"
      initial={{ scaleY: 0 }}
      animate={animate ? { scaleY: 1 } : { scaleY: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      style={{ originY: 1 }}
    />
    <motion.rect
      x="16" y="4" width="4" height="16" rx="1"
      fill="url(#bar3)"
      initial={{ scaleY: 0 }}
      animate={animate ? { scaleY: 1 } : { scaleY: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{ originY: 1 }}
    />
  </svg>
);

export const AnimatedTarget: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="targetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(270 91% 65%)" />
        <stop offset="100%" stopColor="hsl(170 80% 50%)" />
      </linearGradient>
    </defs>
    <motion.circle
      cx="12" cy="12" r="10"
      stroke="url(#targetGrad)"
      strokeWidth="1.5"
      initial={{ scale: 0, opacity: 0 }}
      animate={animate ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
    />
    <motion.circle
      cx="12" cy="12" r="6"
      stroke="url(#targetGrad)"
      strokeWidth="1.5"
      strokeOpacity="0.7"
      initial={{ scale: 0 }}
      animate={animate ? { scale: 1 } : { scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    />
    <motion.circle
      cx="12" cy="12" r="2"
      fill="url(#targetGrad)"
      initial={{ scale: 0 }}
      animate={animate ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  </svg>
);

export const AnimatedRocket: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="rocketGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(270 91% 65%)" />
        <stop offset="100%" stopColor="hsl(320 80% 60%)" />
      </linearGradient>
      <linearGradient id="flameGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="hsl(40 95% 55%)" />
        <stop offset="100%" stopColor="hsl(0 80% 55%)" />
      </linearGradient>
    </defs>
    <motion.g
      animate={animate ? { y: [-1, 1, -1] } : {}}
      transition={{ duration: 0.3, repeat: Infinity }}
    >
      <path
        d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
        stroke="url(#rocketGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
        stroke="url(#rocketGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.g>
    <motion.ellipse
      cx="19" cy="5"
      rx="2" ry="3"
      fill="url(#flameGrad)"
      transform="rotate(45 19 5)"
      animate={animate ? { scale: [1, 1.2, 0.8, 1], opacity: [0.8, 1, 0.6, 0.8] } : {}}
      transition={{ duration: 0.15, repeat: Infinity }}
    />
  </svg>
);

export const AnimatedWave: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(270 91% 65%)" />
        <stop offset="50%" stopColor="hsl(170 80% 50%)" />
        <stop offset="100%" stopColor="hsl(320 80% 60%)" />
      </linearGradient>
    </defs>
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.rect
        key={i}
        x={4 + i * 4}
        y={12 - 4}
        width="2"
        height="8"
        rx="1"
        fill="url(#waveGrad)"
        animate={animate ? {
          scaleY: [0.5, 1, 0.5],
          opacity: [0.5, 1, 0.5],
        } : {}}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.1,
          ease: "easeInOut",
        }}
        style={{ originY: 0.5 }}
      />
    ))}
  </svg>
);

export const AnimatedShield: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(150 80% 50%)" />
        <stop offset="100%" stopColor="hsl(170 80% 45%)" />
      </linearGradient>
    </defs>
    <motion.path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke="url(#shieldGrad)"
      strokeWidth="1.5"
      fill="hsl(150 80% 50% / 0.1)"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={animate ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    />
    <motion.path
      d="M9 12l2 2 4-4"
      stroke="url(#shieldGrad)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={animate ? { pathLength: 1 } : { pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    />
  </svg>
);

export const AnimatedLightning: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(40 95% 60%)" />
        <stop offset="100%" stopColor="hsl(25 95% 55%)" />
      </linearGradient>
      <filter id="lightningGlow">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <motion.path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      fill="url(#lightningGrad)"
      filter="url(#lightningGlow)"
      animate={animate ? {
        opacity: [1, 0.7, 1],
        scale: [1, 1.05, 1],
      } : {}}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 1.5,
      }}
    />
  </svg>
);

export const AnimatedDiamond: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(270 91% 75%)" />
        <stop offset="50%" stopColor="hsl(270 91% 65%)" />
        <stop offset="100%" stopColor="hsl(320 80% 60%)" />
      </linearGradient>
    </defs>
    <motion.path
      d="M6 3h12l4 6-10 12L2 9z"
      stroke="url(#diamondGrad)"
      strokeWidth="1.5"
      fill="hsl(270 91% 65% / 0.1)"
      animate={animate ? { rotate: [0, 5, -5, 0] } : {}}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: 'center' }}
    />
    <motion.path
      d="M2 9h20M9 3l3 6 3-6M9.5 9L12 21l2.5-12"
      stroke="url(#diamondGrad)"
      strokeWidth="1"
      strokeOpacity="0.5"
    />
    <motion.circle
      cx="12" cy="10"
      r="1"
      fill="white"
      animate={animate ? { opacity: [0, 1, 0] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </svg>
);

export const AnimatedGlobe: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="globeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(200 80% 55%)" />
        <stop offset="100%" stopColor="hsl(170 80% 50%)" />
      </linearGradient>
    </defs>
    <motion.circle
      cx="12" cy="12" r="10"
      stroke="url(#globeGrad)"
      strokeWidth="1.5"
    />
    <motion.ellipse
      cx="12" cy="12"
      rx="10" ry="4"
      stroke="url(#globeGrad)"
      strokeWidth="1"
      strokeOpacity="0.5"
    />
    <motion.ellipse
      cx="12" cy="12"
      rx="4" ry="10"
      stroke="url(#globeGrad)"
      strokeWidth="1"
      strokeOpacity="0.5"
      animate={animate ? { rotate: 360 } : {}}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: 'center' }}
    />
    <motion.line
      x1="2" y1="12" x2="22" y2="12"
      stroke="url(#globeGrad)"
      strokeWidth="1"
      strokeOpacity="0.3"
    />
  </svg>
);

export const AnimatedSparkle: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(40 95% 65%)" />
        <stop offset="100%" stopColor="hsl(320 80% 60%)" />
      </linearGradient>
    </defs>
    <motion.path
      d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
      fill="url(#sparkleGrad)"
      animate={animate ? {
        scale: [1, 1.2, 1],
        rotate: [0, 15, 0],
      } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: 'center' }}
    />
    <motion.circle
      cx="19" cy="5" r="1.5"
      fill="hsl(270 91% 75%)"
      animate={animate ? { scale: [0, 1, 0] } : {}}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
    />
    <motion.circle
      cx="5" cy="19" r="1"
      fill="hsl(170 80% 55%)"
      animate={animate ? { scale: [0, 1, 0] } : {}}
      transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
    />
  </svg>
);

export const AnimatedCog: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="cogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(230 20% 50%)" />
        <stop offset="100%" stopColor="hsl(230 20% 40%)" />
      </linearGradient>
    </defs>
    <motion.g
      animate={animate ? { rotate: 360 } : {}}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: 'center' }}
    >
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="url(#cogGrad)"
        strokeWidth="1.5"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="url(#cogGrad)"
        strokeWidth="1.5"
      />
    </motion.g>
  </svg>
);

export const AnimatedPieChart: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <motion.circle
      cx="12" cy="12" r="10"
      stroke="hsl(230 20% 25%)"
      strokeWidth="1.5"
    />
    <motion.path
      d="M12 2a10 10 0 0 1 10 10h-10z"
      fill="hsl(270 91% 65%)"
      initial={{ scale: 0 }}
      animate={animate ? { scale: 1 } : { scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      style={{ transformOrigin: '12px 12px' }}
    />
    <motion.path
      d="M12 12l7.07 7.07A10 10 0 0 1 12 22z"
      fill="hsl(170 80% 50%)"
      initial={{ scale: 0 }}
      animate={animate ? { scale: 1 } : { scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
      style={{ transformOrigin: '12px 12px' }}
    />
    <motion.path
      d="M12 12L4.93 4.93A10 10 0 0 1 12 2z"
      fill="hsl(320 80% 60%)"
      initial={{ scale: 0 }}
      animate={animate ? { scale: 1 } : { scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
      style={{ transformOrigin: '12px 12px' }}
    />
  </svg>
);

export const AnimatedNetwork: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="networkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(270 91% 65%)" />
        <stop offset="100%" stopColor="hsl(170 80% 50%)" />
      </linearGradient>
    </defs>
    <motion.line x1="12" y1="12" x2="12" y2="4" stroke="url(#networkGrad)" strokeWidth="1.5" />
    <motion.line x1="12" y1="12" x2="19" y2="18" stroke="url(#networkGrad)" strokeWidth="1.5" />
    <motion.line x1="12" y1="12" x2="5" y2="18" stroke="url(#networkGrad)" strokeWidth="1.5" />
    
    <motion.circle
      cx="12" cy="12" r="3"
      fill="hsl(270 91% 65%)"
      animate={animate ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.circle
      cx="12" cy="4" r="2"
      fill="hsl(170 80% 50%)"
      animate={animate ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
    />
    <motion.circle
      cx="19" cy="18" r="2"
      fill="hsl(320 80% 60%)"
      animate={animate ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
    />
    <motion.circle
      cx="5" cy="18" r="2"
      fill="hsl(40 95% 55%)"
      animate={animate ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
    />
  </svg>
);

export const LoadingSpinner: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(270 91% 65%)" />
        <stop offset="100%" stopColor="hsl(170 80% 50%)" />
      </linearGradient>
    </defs>
    <motion.circle
      cx="12" cy="12" r="10"
      stroke="hsl(230 20% 20%)"
      strokeWidth="2"
    />
    <motion.circle
      cx="12" cy="12" r="10"
      stroke="url(#spinnerGrad)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="31.4 31.4"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: 'center' }}
    />
  </svg>
);

export const AnimatedDollar: React.FC<IconProps> = ({ className = '', size = 24, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="dollarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(150 80% 50%)" />
        <stop offset="100%" stopColor="hsl(170 80% 45%)" />
      </linearGradient>
    </defs>
    <motion.circle
      cx="12" cy="12" r="10"
      stroke="url(#dollarGrad)"
      strokeWidth="1.5"
      fill="hsl(150 80% 50% / 0.1)"
    />
    <motion.path
      d="M12 6v12M9 9a3 3 0 1 1 6 0c0 2-3 3-3 3M9 15a3 3 0 1 0 6 0"
      stroke="url(#dollarGrad)"
      strokeWidth="1.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={animate ? { pathLength: 1 } : { pathLength: 1 }}
      transition={{ duration: 1, delay: 0.2 }}
    />
    <motion.g
      animate={animate ? { y: [-2, 2, -2] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <circle cx="6" cy="4" r="1" fill="hsl(150 80% 55%)" opacity="0.5" />
      <circle cx="18" cy="20" r="1" fill="hsl(170 80% 55%)" opacity="0.5" />
    </motion.g>
  </svg>
);
