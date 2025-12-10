import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[hsl(222_47%_4%)]" />
      
      <motion.div 
        className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full opacity-[0.12]"
        style={{ 
          background: 'radial-gradient(circle, hsl(258 89% 55%) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{ 
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute top-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-[0.08]"
        style={{ 
          background: 'radial-gradient(circle, hsl(168 84% 45%) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        animate={{ 
          x: [0, -80, -40, 0],
          y: [0, 80, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute -bottom-1/4 left-1/3 w-[600px] h-[600px] rounded-full opacity-[0.06]"
        style={{ 
          background: 'radial-gradient(circle, hsl(328 85% 55%) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
        animate={{ 
          x: [0, 60, -30, 0],
          y: [0, -60, 30, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />

      <div 
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, hsl(258 89% 66% / 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, hsl(168 84% 52% / 0.02) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, hsl(328 85% 60% / 0.02) 0%, transparent 60%)
          `,
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="hsl(258 89% 66%)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      <div className="noise-overlay" />
    </div>
  );
};

export const StaggerContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

export const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 20,
    delay: Math.random() * 5,
    color: i % 3 === 0 ? 'hsl(258 89% 66%)' : i % 3 === 1 ? 'hsl(168 84% 52%)' : 'hsl(328 85% 60%)',
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            opacity: 0.15,
            filter: 'blur(0.5px)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.25, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export const GlowOrb: React.FC<{ color?: string; size?: number; position?: { top?: string; left?: string; right?: string; bottom?: string } }> = ({ 
  color = 'hsl(258 89% 66%)', 
  size = 400,
  position = { top: '20%', left: '10%' }
}) => {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        ...position,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(80px)',
        opacity: 0.1,
      }}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.08, 0.15, 0.08],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};