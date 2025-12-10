import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleSystemProps {
  className?: string;
  particleCount?: number;
  colors?: string[];
  maxSize?: number;
  minSize?: number;
  speed?: number;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  className = '',
  particleCount = 50,
  colors = ['hsl(270 91% 65%)', 'hsl(170 80% 50%)', 'hsl(320 80% 60%)', 'hsl(40 95% 55%)'],
  maxSize = 4,
  minSize = 1,
  speed = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createParticle = (): Particle => ({
      id: Math.random(),
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * (maxSize - minSize) + minSize,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      maxLife: 1,
    });

    particlesRef.current = Array.from({ length: particleCount }, createParticle);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particlesRef.current.forEach((particle, i) => {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const force = (150 - dist) / 150;
          particle.vx -= (dx / dist) * force * 0.02;
          particle.vy -= (dy / dist) * force * 0.02;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.vx *= 0.99;
        particle.vy *= 0.99;

        if (particle.x < 0 || particle.x > canvas.offsetWidth) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.offsetHeight) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();

        particlesRef.current.forEach((other, j) => {
          if (i === j) return;
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (100 - distance) / 100 * 0.2;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [particleCount, colors, maxSize, minSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  velocity: number;
  size: number;
}

export const ClickParticles: React.FC<{
  trigger?: { x: number; y: number } | null;
  onComplete?: () => void;
}> = ({ trigger, onComplete }) => {
  const [particles, setParticles] = useState<ClickParticle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = [
      'hsl(270 91% 65%)',
      'hsl(170 80% 50%)',
      'hsl(320 80% 60%)',
      'hsl(40 95% 55%)',
    ];

    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: trigger.x,
      y: trigger.y,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: (i / 12) * Math.PI * 2,
      velocity: 80 + Math.random() * 40,
      size: 4 + Math.random() * 4,
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 600);

    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

  return (
    <AnimatePresence>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            backgroundColor: particle.color,
          }}
          initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
          animate={{
            x: Math.cos(particle.angle) * particle.velocity,
            y: Math.sin(particle.angle) * particle.velocity,
            scale: 0,
            opacity: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </AnimatePresence>
  );
};

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  delay: number;
}

export const Confetti: React.FC<{
  trigger?: boolean;
  count?: number;
  onComplete?: () => void;
}> = ({ trigger, count = 50, onComplete }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = [
      'hsl(270 91% 65%)',
      'hsl(170 80% 50%)',
      'hsl(320 80% 60%)',
      'hsl(40 95% 55%)',
      'hsl(0 80% 60%)',
      'hsl(200 80% 55%)',
    ];

    const newPieces = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
    }));

    setPieces(newPieces);

    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [trigger, count, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute"
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              width: 10,
              height: 10,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
            initial={{ y: '-10vh', rotate: 0, opacity: 1 }}
            animate={{
              y: '110vh',
              rotate: piece.rotation + 720,
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2.5,
              delay: piece.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface RippleProps {
  className?: string;
  color?: string;
  duration?: number;
}

export const Ripple: React.FC<RippleProps> = ({
  className = '',
  color = 'hsl(270 91% 65% / 0.3)',
  duration = 0.6,
}) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const addRipple = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples((prev) => [...prev, { id: Date.now(), x, y }]);

    setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, duration * 1000);
  }, [duration]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseDown={addRipple}
    >
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          transition={{ duration, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

interface SparkleTrailProps {
  className?: string;
}

export const SparkleTrail: React.FC<SparkleTrailProps> = ({ className = '' }) => {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastTime = 0;
    const throttle = 50;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime < throttle) return;
      lastTime = now;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newSparkle = { id: now, x, y };
      setSparkles((prev) => [...prev.slice(-10), newSparkle]);

      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
      }, 500);
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute pointer-events-none"
            style={{
              left: sparkle.x,
              top: sparkle.y,
            }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 0, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                fill="hsl(40 95% 60%)"
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

interface FireworksProps {
  trigger?: boolean;
  onComplete?: () => void;
}

export const Fireworks: React.FC<FireworksProps> = ({ trigger, onComplete }) => {
  const [explosions, setExplosions] = useState<{
    id: number;
    x: number;
    y: number;
    particles: { angle: number; distance: number; color: string }[];
  }[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = [
      'hsl(270 91% 65%)',
      'hsl(170 80% 50%)',
      'hsl(320 80% 60%)',
      'hsl(40 95% 55%)',
    ];

    const newExplosions = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 40,
      particles: Array.from({ length: 20 }, (_, j) => ({
        angle: (j / 20) * Math.PI * 2,
        distance: 50 + Math.random() * 50,
        color: colors[Math.floor(Math.random() * colors.length)],
      })),
    }));

    newExplosions.forEach((explosion, i) => {
      setTimeout(() => {
        setExplosions((prev) => [...prev, explosion]);
      }, i * 300);
    });

    const timer = setTimeout(() => {
      setExplosions([]);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {explosions.map((explosion) => (
          <div
            key={explosion.id}
            className="absolute"
            style={{ left: `${explosion.x}%`, top: `${explosion.y}%` }}
          >
            {explosion.particles.map((particle, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: particle.color,
                  boxShadow: `0 0 6px ${particle.color}`,
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: Math.cos(particle.angle) * particle.distance,
                  y: Math.sin(particle.angle) * particle.distance + 30,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
