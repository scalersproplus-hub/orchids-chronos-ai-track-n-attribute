import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      setDisplayValue(latest);
    });
  }, [springValue]);

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

interface FlipDigitProps {
  digit: string;
  className?: string;
}

const FlipDigit: React.FC<FlipDigitProps> = ({ digit, className = '' }) => (
  <div className={`relative overflow-hidden ${className}`} style={{ width: '1em', height: '1.5em' }}>
    <AnimatePresence mode="popLayout">
      <motion.span
        key={digit}
        className="absolute inset-0 flex items-center justify-center"
        initial={{ y: '100%', rotateX: -90 }}
        animate={{ y: 0, rotateX: 0 }}
        exit={{ y: '-100%', rotateX: 90 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ backfaceVisibility: 'hidden' }}
      >
        {digit}
      </motion.span>
    </AnimatePresence>
  </div>
);

interface FlipCounterProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const FlipCounter: React.FC<FlipCounterProps> = ({
  value,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const formattedValue = Math.abs(value).toString().padStart(1, '0');
  const digits = formattedValue.split('');

  return (
    <div className={`flex items-center ${className}`}>
      {prefix && <span className="mr-1">{prefix}</span>}
      {value < 0 && <span>-</span>}
      <div className="flex">
        {digits.map((digit, index) => (
          <FlipDigit key={index} digit={digit} />
        ))}
      </div>
      {suffix && <span className="ml-1">{suffix}</span>}
    </div>
  );
};

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  onComplete?: () => void;
}

export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  duration = 2,
  className = '',
  prefix = '',
  suffix = '',
  onComplete,
}) => {
  const [count, setCount] = useState(from);
  const countRef = useRef(from);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = (timestamp - startTimeRef.current) / (duration * 1000);

      if (progress < 1) {
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        countRef.current = from + (to - from) * easeOutQuart;
        setCount(Math.round(countRef.current));
        requestAnimationFrame(animate);
      } else {
        setCount(to);
        onComplete?.();
      }
    };

    startTimeRef.current = null;
    requestAnimationFrame(animate);
  }, [from, to, duration, onComplete]);

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

interface TickerProps {
  value: string;
  className?: string;
}

export const Ticker: React.FC<TickerProps> = ({ value, className = '' }) => {
  const chars = value.split('');

  return (
    <div className={`flex overflow-hidden ${className}`}>
      {chars.map((char, index) => (
        <motion.div
          key={`${index}-${char}`}
          className="relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: index * 0.05,
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.div>
      ))}
    </div>
  );
};

interface RollingDigitsProps {
  value: number;
  className?: string;
  digitClassName?: string;
}

export const RollingDigits: React.FC<RollingDigitsProps> = ({
  value,
  className = '',
  digitClassName = '',
}) => {
  const digits = Math.abs(value).toString().split('');
  const allDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className={`flex overflow-hidden ${className}`}>
      {digits.map((digit, index) => {
        const digitIndex = parseInt(digit);
        return (
          <div
            key={index}
            className={`relative overflow-hidden ${digitClassName}`}
            style={{ height: '1.2em', width: '0.7em' }}
          >
            <motion.div
              className="flex flex-col items-center"
              animate={{ y: `-${digitIndex * 1.2}em` }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 15,
                delay: (digits.length - index - 1) * 0.1,
              }}
            >
              {allDigits.map((d) => (
                <span key={d} style={{ height: '1.2em', lineHeight: '1.2em' }}>
                  {d}
                </span>
              ))}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

interface ProgressCounterProps {
  value: number;
  max: number;
  className?: string;
  showPercentage?: boolean;
  color?: string;
}

export const ProgressCounter: React.FC<ProgressCounterProps> = ({
  value,
  max,
  className = '',
  showPercentage = true,
  color = 'hsl(270 91% 65%)',
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(230 20% 15%)"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform="rotate(-90 50 50)"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        {showPercentage ? (
          <AnimatedCounter
            value={percentage}
            decimals={0}
            suffix="%"
            className="text-2xl font-bold text-white"
          />
        ) : (
          <AnimatedCounter
            value={value}
            className="text-2xl font-bold text-white"
          />
        )}
        <span className="text-xs text-gray-500 mt-1">
          {value.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

interface ScoreboardProps {
  scores: { label: string; value: number; color?: string }[];
  className?: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ scores, className = '' }) => (
  <div className={`grid gap-4 ${className}`}>
    {scores.map((score, index) => (
      <motion.div
        key={score.label}
        className="flex items-center justify-between p-4 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, hsl(230 25% 10%), hsl(230 25% 8%))',
          border: `1px solid ${score.color || 'hsl(270 91% 65%)'} / 0.2)`,
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <span className="text-gray-400 font-medium">{score.label}</span>
        <RollingDigits
          value={score.value}
          className="text-2xl font-bold font-mono"
          digitClassName="text-white"
        />
      </motion.div>
    ))}
  </div>
);
