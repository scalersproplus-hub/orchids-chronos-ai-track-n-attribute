import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface CursorGlowProps {
  color?: string;
  size?: number;
  blur?: number;
}

export const CursorGlow: React.FC<CursorGlowProps> = ({
  color = 'hsl(270 91% 65% / 0.15)',
  size = 400,
  blur = 100,
}) => {
  const cursorX = useMotionValue(-1000);
  const cursorY = useMotionValue(-1000);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - size / 2);
      cursorY.set(e.clientY - size / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY, size]);

  return (
    <motion.div
      className="fixed pointer-events-none z-0"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        filter: `blur(${blur}px)`,
      }}
    />
  );
};

interface CursorTrailProps {
  color?: string;
  trailLength?: number;
}

export const CursorTrail: React.FC<CursorTrailProps> = ({
  color = 'hsl(270 91% 65%)',
  trailLength = 20,
}) => {
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTimeRef.current < 16) return;
      lastTimeRef.current = now;

      setTrail((prev) => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: now }];
        return newTrail.slice(-trailLength);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [trailLength]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trail.map((point, index) => {
        const size = (index / trail.length) * 8 + 2;
        const opacity = (index / trail.length) * 0.8;

        return (
          <motion.div
            key={point.id}
            className="absolute rounded-full"
            style={{
              left: point.x - size / 2,
              top: point.y - size / 2,
              width: size,
              height: size,
              backgroundColor: color,
              opacity,
              boxShadow: `0 0 ${size * 2}px ${color}`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          />
        );
      })}
    </div>
  );
};

interface SpotlightProps {
  className?: string;
  size?: number;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  className = '',
  size = 300,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: size,
          height: size,
          left: position.x - size / 2,
          top: position.y - size / 2,
          background: `radial-gradient(circle, hsl(270 91% 65% / 0.15), transparent 70%)`,
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
};

interface MagneticCursorProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export const MagneticCursor: React.FC<MagneticCursorProps> = ({
  children,
  className = '',
  strength = 0.5,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
    >
      {children}
    </motion.div>
  );
};

interface GlowHoverProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const GlowHover: React.FC<GlowHoverProps> = ({
  children,
  className = '',
  glowColor = 'hsl(270 91% 65%)',
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 200,
          height: 200,
          left: position.x - 100,
          top: position.y - 100,
          background: `radial-gradient(circle, ${glowColor} / 0.3, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

interface InteractiveBorderProps {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
}

export const InteractiveBorder: React.FC<InteractiveBorderProps> = ({
  children,
  className = '',
  borderWidth = 2,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          padding: borderWidth,
          background: `radial-gradient(circle at ${position.x}% ${position.y}%, hsl(270 91% 65%), hsl(170 80% 50%), transparent 70%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  className = '',
  delay = 0,
}) => {
  const words = text.split(' ');

  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em]">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              initial={{ opacity: 0, y: 20, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                delay: delay + wordIndex * 0.1 + charIndex * 0.03,
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
};

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = '',
  animate = true,
}) => (
  <motion.span
    className={className}
    style={{
      background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(170 80% 50%), hsl(320 80% 60%), hsl(270 91% 65%))',
      backgroundSize: '300% 100%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}
    animate={animate ? {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    } : {}}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    {children}
  </motion.span>
);
