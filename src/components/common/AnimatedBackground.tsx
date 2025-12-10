import React, { useEffect, useRef } from 'react';
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
      x: [0, 30, -20, 10, 0],
      y: [0, -20, 30, -10, 0],
      scale: [1, 1.1, 0.9, 1.05, 1],
      opacity: [0.3, 0.5, 0.3, 0.4, 0.3],
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
    <svg className="absolute w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
    <div 
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, transparent 0%, hsl(230 25% 5%) 70%)',
      }}
    />
  </div>
);

const FloatingParticle: React.FC<{ delay: number; x: number }> = ({ delay, x }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full"
    style={{
      left: `${x}%`,
      bottom: '-5%',
      background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(170 80% 50%))',
    }}
    animate={{
      y: [0, -1000],
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
    }}
    transition={{
      duration: 8 + Math.random() * 4,
      delay,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

const GradientMesh: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <motion.div 
      className="absolute -top-1/2 -left-1/2 w-full h-full"
      style={{
        background: 'conic-gradient(from 0deg at 50% 50%, hsl(270 91% 65% / 0.1) 0deg, transparent 60deg, hsl(170 80% 50% / 0.08) 120deg, transparent 180deg, hsl(320 80% 60% / 0.06) 240deg, transparent 300deg, hsl(270 91% 65% / 0.1) 360deg)',
      }}
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        duration: 60,
        repeat: Infinity,
        ease: "linear",
      }}
    />
    <motion.div 
      className="absolute -bottom-1/2 -right-1/2 w-full h-full"
      style={{
        background: 'conic-gradient(from 180deg at 50% 50%, hsl(170 80% 50% / 0.08) 0deg, transparent 60deg, hsl(270 91% 65% / 0.06) 120deg, transparent 180deg, hsl(320 80% 60% / 0.1) 240deg, transparent 300deg, hsl(170 80% 50% / 0.08) 360deg)',
      }}
      animate={{
        rotate: [360, 0],
      }}
      transition={{
        duration: 80,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  </div>
);

const NoiseTexture: React.FC = () => (
  <div 
    className="absolute inset-0 pointer-events-none opacity-[0.015]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />
);

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[hsl(230_25%_5%)]">
      <GradientMesh />
      
      <GlowOrb 
        color="radial-gradient(circle, hsl(270 91% 65% / 0.15) 0%, transparent 70%)" 
        size={600} 
        x="10%" 
        y="10%" 
        delay={0}
        duration={20}
      />
      <GlowOrb 
        color="radial-gradient(circle, hsl(170 80% 50% / 0.1) 0%, transparent 70%)" 
        size={500} 
        x="70%" 
        y="60%" 
        delay={5}
        duration={25}
      />
      <GlowOrb 
        color="radial-gradient(circle, hsl(320 80% 60% / 0.08) 0%, transparent 70%)" 
        size={400} 
        x="50%" 
        y="30%" 
        delay={10}
        duration={30}
      />
      <GlowOrb 
        color="radial-gradient(circle, hsl(270 91% 65% / 0.1) 0%, transparent 70%)" 
        size={350} 
        x="85%" 
        y="15%" 
        delay={3}
        duration={22}
      />
      <GlowOrb 
        color="radial-gradient(circle, hsl(170 80% 50% / 0.08) 0%, transparent 70%)" 
        size={450} 
        x="20%" 
        y="70%" 
        delay={8}
        duration={28}
      />
      
      <GridPattern />
      
      {Array.from({ length: 15 }).map((_, i) => (
        <FloatingParticle key={i} delay={i * 0.8} x={5 + (i * 6.5)} />
      ))}
      
      <NoiseTexture />
      
      <div 
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: 'linear-gradient(to top, hsl(230 25% 5%), transparent)',
        }}
      />
    </div>
  );
};

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
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
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
      },
    }}
  >
    {children}
  </motion.div>
);
