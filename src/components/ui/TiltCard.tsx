import React, { useRef, useState } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glareEnabled?: boolean;
  borderGlow?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  intensity = 15,
  glareEnabled = true,
  borderGlow = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${intensity}deg`, `-${intensity}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${intensity}deg`, `${intensity}deg`]);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className={`relative ${className}`}
    >
      {borderGlow && (
        <motion.div
          className="absolute -inset-[1px] rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, 
              hsl(270 91% 65% / ${isHovered ? 0.4 : 0.1}), 
              hsl(170 80% 50% / ${isHovered ? 0.3 : 0.05}), 
              hsl(320 80% 60% / ${isHovered ? 0.4 : 0.1})
            )`,
            opacity: isHovered ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      <div 
        className="relative overflow-hidden rounded-2xl"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}

        {glareEnabled && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(
                600px circle at var(--glare-x) var(--glare-y),
                hsl(270 91% 75% / 0.15),
                transparent 40%
              )`,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
              // @ts-ignore
              '--glare-x': glareX,
              '--glare-y': glareY,
            }}
          />
        )}

        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            boxShadow: isHovered
              ? `
                0 25px 50px -12px hsl(270 91% 65% / 0.25),
                0 0 40px hsl(270 91% 65% / 0.1),
                inset 0 1px 0 hsl(270 91% 75% / 0.2)
              `
              : '0 0 0 transparent',
            transition: 'box-shadow 0.3s ease',
          }}
        />
      </div>
    </motion.div>
  );
};

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 3,
  distance = 10,
}) => (
  <motion.div
    className={className}
    animate={{
      y: [-distance, distance, -distance],
      rotate: [-2, 2, -2],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    {children}
  </motion.div>
);

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  strength = 0.3,
  onClick,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      className={className}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export const GlowingBorder: React.FC<GlowingBorderProps> = ({
  children,
  className = '',
  animated = true,
}) => (
  <div className={`relative ${className}`}>
    <motion.div
      className="absolute -inset-[2px] rounded-2xl"
      style={{
        background: 'linear-gradient(90deg, hsl(270 91% 65%), hsl(170 80% 50%), hsl(320 80% 60%), hsl(270 91% 65%))',
        backgroundSize: '300% 100%',
      }}
      animate={animated ? {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      } : {}}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
    <div className="relative bg-[hsl(230_25%_8%)] rounded-2xl">
      {children}
    </div>
  </div>
);

interface ShimmerProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  className = '',
  width = '100%',
  height = '20px',
}) => (
  <div
    className={`relative overflow-hidden rounded-lg ${className}`}
    style={{ width, height, background: 'hsl(230 20% 12%)' }}
  >
    <motion.div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(90deg, transparent, hsl(270 91% 65% / 0.1), transparent)',
        transform: 'skewX(-20deg)',
      }}
      animate={{
        x: ['-100%', '200%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </div>
);

interface ParallaxLayerProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}

export const ParallaxContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
      className={className}
      style={{ perspective: '1000px' }}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            mousePosition,
          });
        }
        return child;
      })}
    </div>
  );
};

export const ParallaxLayer: React.FC<ParallaxLayerProps & { mousePosition?: { x: number; y: number } }> = ({
  children,
  className = '',
  depth = 1,
  mousePosition = { x: 0, y: 0 },
}) => {
  const x = useSpring(mousePosition.x * depth * 20, { stiffness: 100, damping: 20 });
  const y = useSpring(mousePosition.y * depth * 20, { stiffness: 100, damping: 20 });

  return (
    <motion.div
      className={className}
      style={{
        x,
        y,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );
};
