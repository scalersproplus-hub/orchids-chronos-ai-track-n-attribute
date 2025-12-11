import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[hsl(225_15%_5%)]" />
      
      <motion.div 
        className="absolute -top-1/2 -left-1/4 w-[900px] h-[900px] rounded-full opacity-[0.08]"
        style={{ 
          background: 'radial-gradient(circle, hsl(252 87% 55%) 0%, transparent 65%)',
          filter: 'blur(100px)',
        }}
        animate={{ 
          x: [0, 80, 40, 0],
          y: [0, 40, 80, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full opacity-[0.05]"
        style={{ 
          background: 'radial-gradient(circle, hsl(165 82% 45%) 0%, transparent 65%)',
          filter: 'blur(120px)',
        }}
        animate={{ 
          x: [0, -60, -30, 0],
          y: [0, 60, -15, 0],
          scale: [1, 0.92, 1.08, 1],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute -bottom-1/4 left-1/3 w-[700px] h-[700px] rounded-full opacity-[0.04]"
        style={{ 
          background: 'radial-gradient(circle, hsl(330 80% 55%) 0%, transparent 65%)',
          filter: 'blur(110px)',
        }}
        animate={{ 
          x: [0, 50, -25, 0],
          y: [0, -50, 25, 0],
          scale: [1, 1.12, 0.92, 1],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />

      <div 
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 25%, hsl(252 87% 64% / 0.02) 0%, transparent 45%),
            radial-gradient(circle at 85% 75%, hsl(165 82% 51% / 0.015) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, hsl(330 80% 60% / 0.015) 0%, transparent 55%)
          `,
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-[0.018]">
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="hsl(252 87% 64%)" strokeWidth="0.4"/>
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
            staggerChildren: 0.05,
            delayChildren: 0.08,
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
        hidden: { opacity: 0, y: 20, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ 
        duration: 0.45, 
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

export const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 1,
    duration: Math.random() * 18 + 22,
    delay: Math.random() * 6,
    color: i % 3 === 0 ? 'hsl(252 87% 64%)' : i % 3 === 1 ? 'hsl(165 82% 51%)' : 'hsl(330 80% 60%)',
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
            opacity: 0.1,
            filter: 'blur(0.5px)',
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            opacity: [0.08, 0.2, 0.08],
            scale: [1, 1.15, 1],
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
  color = 'hsl(252 87% 64%)', 
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
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
        filter: 'blur(100px)',
        opacity: 0.06,
      }}
      animate={{
        scale: [1, 1.12, 1],
        opacity: [0.05, 0.1, 0.05],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};