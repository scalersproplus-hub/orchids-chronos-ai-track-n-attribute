import React from 'react';
import { motion } from 'framer-motion';

const GlowOrb: React.FC<{ 
  color: string; 
  size: number; 
  x: string; 
  y: string; 
  delay: number;
  duration: number;
}> = ({ color, size, x, y, delay, duration }) => (
  <motion.div
    className="absolute rounded-full blur-3xl pointer-events-none"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: color,
    }}
    animate={{
      x: [0, 50, -30, 20, 0],
      y: [0, -30, 50, -20, 0],
      scale: [1, 1.2, 0.9, 1.1, 1],
      opacity: [0.4, 0.6, 0.35, 0.5, 0.4],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const GridPattern: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <svg className="absolute w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(270 91% 65%)" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="gridFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="gridMask">
          <rect width="100%" height="100%" fill="url(#gridFade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)" />
    </svg>
  </div>
);

const FloatingParticle: React.FC<{ delay: number; x: number }> = ({ delay, x }) => (
  <motion.div
    className="absolute w-1.5 h-1.5 rounded-full"
    style={{
      left: `${x}%`,
      bottom: '-5%',
      background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(170 80% 50%))',
      boxShadow: '0 0 10px hsl(270 91% 65% / 0.5)',
    }}
    animate={{
      y: [0, -1200],
      opacity: [0, 1, 1, 0],
      scale: [0, 1.2, 1, 0],
    }}
    transition={{
      duration: 10 + Math.random() * 5,
      delay,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

const GradientMesh: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <motion.div 
      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
      style={{
        background: `
          conic-gradient(from 0deg at 30% 30%, 
            hsl(270 91% 65% / 0.12) 0deg, 
            transparent 60deg, 
            hsl(170 80% 50% / 0.1) 120deg, 
            transparent 180deg, 
            hsl(320 80% 60% / 0.08) 240deg, 
            transparent 300deg, 
            hsl(270 91% 65% / 0.12) 360deg
          )
        `,
      }}
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        duration: 120,
        repeat: Infinity,
        ease: "linear",
      }}
    />
    <motion.div 
      className="absolute -bottom-1/2 -right-1/2 w-[200%] h-[200%]"
      style={{
        background: `
          conic-gradient(from 180deg at 70% 70%, 
            hsl(170 80% 50% / 0.1) 0deg, 
            transparent 60deg, 
            hsl(270 91% 65% / 0.08) 120deg, 
            transparent 180deg, 
            hsl(40 95% 55% / 0.06) 240deg, 
            transparent 300deg, 
            hsl(170 80% 50% / 0.1) 360deg
          )
        `,
      }}
      animate={{
        rotate: [360, 0],
      }}
      transition={{
        duration: 150,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  </div>
);

const NoiseTexture: React.FC = () => (
  <div 
    className="absolute inset-0 pointer-events-none opacity-[0.02]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />
);

const AuroraStreak: React.FC<{ delay: number; top: string }> = ({ delay, top }) => (
  <motion.div
    className="absolute left-0 right-0 h-px pointer-events-none"
    style={{
      top,
      background: 'linear-gradient(90deg, transparent, hsl(270 91% 65% / 0.3), hsl(170 80% 50% / 0.2), transparent)',
    }}
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{
      scaleX: [0, 1, 1, 0],
      opacity: [0, 1, 1, 0],
      x: ['-100%', '0%', '0%', '100%'],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      repeatDelay: 8,
      ease: "easeInOut",
    }}
  />
);

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[hsl(230_25%_5%)]">
      <GradientMesh />
      
      <GlowOrb 
        color="radial-gradient(circle, hsl(270 91% 65% / 0.2) 0%, transparent 70%)" 
        size={700} 
        x="5%" 
        y="5%" 
        delay={0}
        duration={25}
      />
      <GlowOrb 
        color="radial-gradient(circle, hsl(170 80% 50% / 0.15) 0%, transparent 70%)" 
        size={600} 
        x="65%" 
        y="55%" 
        delay={5}
        duration={30}
      />
      <GlowOrb 
        color="radial-gradient(circle, hsl(320 80% 60% / 0.12) 0%, transparent 70%)" 
        size={500} 
        x="45%" 
        y="25%" 
        delay={10}
        duration={35}
      />
      <GlowOrb 
        color="radial-gradient(circle, hsl(40 95% 55% / 0.08) 0%, transparent 70%)" 
        size={450} 
        x="80%" 
        y="10%" 
        delay={3}
        duration={28}
      />
      <GlowOrb 
        color="radial-gradient(circle, hsl(200 80% 50% / 0.1) 0%, transparent 70%)" 
        size={550} 
        x="15%" 
        y="65%" 
        delay={8}
        duration={32}
      />
      
      <GridPattern />
      
      {Array.from({ length: 20 }).map((_, i) => (
        <FloatingParticle key={i} delay={i * 0.6} x={2 + (i * 5)} />
      ))}
      
      <AuroraStreak delay={0} top="20%" />
      <AuroraStreak delay={3} top="50%" />
      <AuroraStreak delay={6} top="80%" />
      
      <NoiseTexture />
      
      <div 
        className="absolute bottom-0 left-0 right-0 h-60"
        style={{
          background: 'linear-gradient(to top, hsl(230 25% 5%), transparent)',
        }}
      />
      
      <div 
        className="absolute top-0 left-0 right-0 h-40"
        style={{
          background: 'linear-gradient(to bottom, hsl(230 25% 5% / 0.8), transparent)',
        }}
      />
    </div>
  );
};

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.98 }}
    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {children}
  </motion.div>
);

export const StaggerContainer: React.FC<{ 
  children: React.ReactNode; 
  delay?: number;
  stagger?: number;
}> = ({ children, delay = 0, stagger = 0.1 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          delayChildren: delay,
          staggerChildren: stagger,
        },
      },
    }}
  >
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
      },
    }}
  >
    {children}
  </motion.div>
);