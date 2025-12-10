import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MorphingBlobProps {
  className?: string;
  colors?: string[];
  size?: number;
  blur?: number;
  speed?: number;
}

export const MorphingBlob: React.FC<MorphingBlobProps> = ({
  className = '',
  colors = ['hsl(270 91% 65%)', 'hsl(170 80% 50%)', 'hsl(320 80% 60%)'],
  size = 400,
  blur = 60,
  speed = 8,
}) => {
  const paths = [
    'M45.5,-76.5C58.7,-69.3,69,-55.5,76.2,-40.3C83.4,-25.1,87.5,-8.5,85.7,7.3C83.9,23.1,76.2,38.1,65.1,49.7C54,61.3,39.5,69.5,24,74.2C8.5,78.9,-8,80.1,-23.5,76.7C-39,73.3,-53.5,65.3,-64.2,53.5C-74.9,41.7,-81.8,26.1,-83.9,9.7C-86,-6.7,-83.3,-23.9,-75.4,-38.3C-67.5,-52.7,-54.4,-64.3,-39.9,-70.7C-25.4,-77.1,-9.5,-78.3,4.6,-85.1C18.7,-91.9,32.3,-83.7,45.5,-76.5Z',
    'M47.7,-79.2C60.5,-71.6,68.8,-55.6,74.8,-39.3C80.8,-23,84.5,-6.4,82.3,9.1C80.1,24.6,72,39,61.2,51.1C50.4,63.2,36.9,73,21.8,78.3C6.7,83.6,-10,84.4,-25.4,79.7C-40.8,75,-54.9,64.8,-65.1,51.8C-75.3,38.8,-81.6,23,-82.8,6.7C-84,-9.6,-80.1,-26.4,-71.5,-40.2C-62.9,-54,-49.6,-64.8,-35.4,-71.7C-21.2,-78.6,-6.1,-81.6,7.1,-91.8C20.3,-102,34.9,-86.8,47.7,-79.2Z',
    'M42.8,-73C54.6,-65.3,63,-51.4,70.5,-36.7C78,-22,84.6,-6.5,83.7,8.5C82.8,23.5,74.4,38,63.4,50.2C52.4,62.4,38.8,72.3,23.7,77.5C8.6,82.7,-8,83.2,-23.1,78.7C-38.2,74.2,-51.8,64.7,-62.5,52.3C-73.2,39.9,-81,24.6,-83.2,8.3C-85.4,-8,-82,-25.3,-73.4,-39.3C-64.8,-53.3,-51,-64,-36.6,-70.5C-22.2,-77,-11.1,-79.3,2.5,-83.4C16.1,-87.5,31,-80.7,42.8,-73Z',
  ];

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        filter: `blur(${blur}px)`,
      }}
    >
      <svg viewBox="-100 -100 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            {colors.map((color, i) => (
              <stop
                key={i}
                offset={`${(i / (colors.length - 1)) * 100}%`}
                stopColor={color}
                stopOpacity="0.6"
              />
            ))}
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#blobGradient)"
          animate={{
            d: paths,
          }}
          transition={{
            duration: speed,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      </svg>
    </motion.div>
  );
};

interface AuroraBackgroundProps {
  className?: string;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ className = '' }) => (
  <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
    <motion.div
      className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%]"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 20% 40%, hsl(270 91% 65% / 0.15), transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 60%, hsl(170 80% 50% / 0.12), transparent 50%),
          radial-gradient(ellipse 70% 60% at 50% 80%, hsl(320 80% 60% / 0.1), transparent 50%)
        `,
      }}
      animate={{
        x: [0, 50, -30, 0],
        y: [0, -30, 50, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="absolute -bottom-1/2 -right-1/4 w-[150%] h-[150%]"
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 70% 30%, hsl(200 80% 50% / 0.1), transparent 50%),
          radial-gradient(ellipse 80% 60% at 30% 70%, hsl(270 91% 65% / 0.08), transparent 50%)
        `,
      }}
      animate={{
        x: [0, -40, 60, 0],
        y: [0, 40, -20, 0],
        rotate: [0, -8, 8, 0],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </div>
);

interface MeshGradientProps {
  className?: string;
}

export const MeshGradient: React.FC<MeshGradientProps> = ({ className = '' }) => (
  <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
    <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <linearGradient id="meshGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(270 91% 65%)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <linearGradient id="meshGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(170 80% 50%)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" filter="url(#noise)" opacity="0.05" />
      <motion.ellipse
        cx="20%"
        cy="30%"
        rx="30%"
        ry="40%"
        fill="url(#meshGrad1)"
        animate={{
          cx: ['20%', '30%', '20%'],
          cy: ['30%', '40%', '30%'],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.ellipse
        cx="80%"
        cy="70%"
        rx="35%"
        ry="30%"
        fill="url(#meshGrad2)"
        animate={{
          cx: ['80%', '70%', '80%'],
          cy: ['70%', '60%', '70%'],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  </div>
);

interface WavePatternProps {
  className?: string;
}

export const WavePattern: React.FC<WavePatternProps> = ({ className = '' }) => (
  <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
    <svg
      className="absolute bottom-0 w-full h-64"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(270 91% 65% / 0.1)" />
          <stop offset="50%" stopColor="hsl(170 80% 50% / 0.15)" />
          <stop offset="100%" stopColor="hsl(320 80% 60% / 0.1)" />
        </linearGradient>
        <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(170 80% 50% / 0.08)" />
          <stop offset="50%" stopColor="hsl(270 91% 65% / 0.12)" />
          <stop offset="100%" stopColor="hsl(170 80% 50% / 0.08)" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
        fill="url(#waveGrad1)"
        animate={{
          d: [
            'M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z',
            'M0,80 C300,20 600,100 900,40 C1050,60 1150,80 1200,50 L1200,120 L0,120 Z',
            'M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.path
        d="M0,90 C400,40 800,100 1200,70 L1200,120 L0,120 Z"
        fill="url(#waveGrad2)"
        animate={{
          d: [
            'M0,90 C400,40 800,100 1200,70 L1200,120 L0,120 Z',
            'M0,70 C400,100 800,40 1200,90 L1200,120 L0,120 Z',
            'M0,90 C400,40 800,100 1200,70 L1200,120 L0,120 Z',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  </div>
);

interface OrbFieldProps {
  count?: number;
  className?: string;
}

export const OrbField: React.FC<OrbFieldProps> = ({ count = 6, className = '' }) => {
  const orbs = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: `${Math.random() * 80 + 10}%`,
    y: `${Math.random() * 80 + 10}%`,
    size: Math.random() * 200 + 100,
    color: [
      'hsl(270 91% 65% / 0.15)',
      'hsl(170 80% 50% / 0.12)',
      'hsl(320 80% 60% / 0.1)',
      'hsl(40 95% 55% / 0.08)',
    ][i % 4],
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-3xl"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
          }}
          animate={{
            x: [0, 50, -30, 20, 0],
            y: [0, -40, 30, -20, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
