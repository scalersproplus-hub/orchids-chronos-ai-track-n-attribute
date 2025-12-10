import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, height = 48 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} 100,${height}`;
  const uniqueId = `spark-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg className="w-full" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${uniqueId}-area`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uniqueId}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="30%" stopColor={color} stopOpacity="0.8" />
          <stop offset="70%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
        <filter id={`${uniqueId}-glow`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.polygon
        points={areaPoints}
        fill={`url(#${uniqueId}-area)`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
      <motion.polyline
        points={points}
        fill="none"
        stroke={`url(#${uniqueId}-line)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${uniqueId}-glow)`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        cx={100}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3.5"
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
};

interface AnimatedMetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparkData?: number[];
  color?: 'primary' | 'accent' | 'success' | 'warning';
  delay?: number;
}

const colorMap = {
  primary: {
    gradient: 'from-[hsl(258_89%_66%)] to-[hsl(328_85%_60%)]',
    text: 'hsl(258 95% 80%)',
    glow: 'hsl(258 89% 66%)',
    spark: 'hsl(258 89% 70%)',
    bg: 'hsl(258 89% 66% / 0.08)',
    border: 'hsl(258 89% 66% / 0.15)',
  },
  accent: {
    gradient: 'from-[hsl(168_84%_52%)] to-[hsl(190_80%_50%)]',
    text: 'hsl(168 90% 65%)',
    glow: 'hsl(168 84% 52%)',
    spark: 'hsl(168 84% 55%)',
    bg: 'hsl(168 84% 52% / 0.08)',
    border: 'hsl(168 84% 52% / 0.15)',
  },
  success: {
    gradient: 'from-[hsl(152_76%_48%)] to-[hsl(168_84%_52%)]',
    text: 'hsl(152 80% 60%)',
    glow: 'hsl(152 76% 48%)',
    spark: 'hsl(152 76% 55%)',
    bg: 'hsl(152 76% 48% / 0.08)',
    border: 'hsl(152 76% 48% / 0.15)',
  },
  warning: {
    gradient: 'from-[hsl(38_92%_55%)] to-[hsl(24_95%_60%)]',
    text: 'hsl(38 95% 65%)',
    glow: 'hsl(38 92% 55%)',
    spark: 'hsl(38 92% 60%)',
    bg: 'hsl(38 92% 55% / 0.08)',
    border: 'hsl(38 92% 55% / 0.15)',
  },
};

const AnimatedNumber: React.FC<{ value: string }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="metric-value text-white"
    >
      {displayValue}
    </motion.span>
  );
};

export const AnimatedMetricCard: React.FC<AnimatedMetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  sparkData = [40, 55, 45, 60, 50, 70, 65, 80, 75, 85],
  color = 'primary',
  delay = 0,
}) => {
  const colors = colorMap[color];
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 35 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 35 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
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
      className="relative group"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: '1200px',
      }}
    >
      <motion.div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{
          background: `linear-gradient(135deg, ${colors.glow} / 0.3, transparent 50%, ${colors.glow} / 0.15)`,
          filter: 'blur(1px)',
        }}
      />
      
      <motion.div
        className="relative p-6 rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(145deg, 
            hsl(222 47% 8% / 0.95) 0%, 
            hsl(222 47% 6% / 0.98) 50%,
            hsl(222 47% 5% / 1) 100%
          )`,
          border: `1px solid ${isHovered ? colors.border : 'hsl(222 30% 10%)'}`,
          boxShadow: isHovered 
            ? `0 24px 48px -12px hsl(222 47% 0% / 0.5), 0 0 48px ${colors.glow} / 0.12`
            : '0 4px 24px hsl(222 47% 0% / 0.4)',
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 5%, ${colors.glow} / 0.5 30%, ${colors.glow} / 0.6 50%, ${colors.glow} / 0.5 70%, transparent 95%)`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.div 
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none"
          style={{ 
            background: `radial-gradient(circle, ${colors.glow} / ${isHovered ? 0.12 : 0.04}, transparent 70%)`,
            filter: 'blur(40px)',
            transform: 'translateZ(5px)',
          }}
          animate={{ scale: isHovered ? 1.15 : 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.div 
          className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full pointer-events-none"
          style={{ 
            background: `radial-gradient(circle, hsl(168 84% 52% / ${isHovered ? 0.08 : 0.02}), transparent 70%)`,
            filter: 'blur(32px)',
            transform: 'translateZ(3px)',
          }}
          animate={{ scale: isHovered ? 1.2 : 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="relative z-10" style={{ transform: 'translateZ(16px)' }}>
          <div className="flex justify-between items-start mb-5">
            <div className="space-y-1.5">
              <motion.h4 
                className="text-sm font-medium text-gray-500 tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.15 }}
              >
                {title}
              </motion.h4>
              <motion.div 
                className="flex items-baseline gap-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.25 }}
              >
                <AnimatedNumber value={value} />
                {trend && (
                  <motion.div 
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      trend.isPositive 
                        ? 'text-[hsl(152_80%_55%)] bg-[hsl(152_76%_48%_/_0.1)] border border-[hsl(152_76%_48%_/_0.15)]' 
                        : 'text-[hsl(0_85%_65%)] bg-[hsl(0_84%_60%_/_0.1)] border border-[hsl(0_84%_60%_/_0.15)]'
                    }`}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: delay + 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {trend.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                  </motion.div>
                )}
              </motion.div>
            </div>

            <motion.div
              className={`p-3.5 rounded-xl bg-gradient-to-br ${colors.gradient}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 250,
                damping: 18,
                delay: delay + 0.15
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: [0, -8, 8, 0],
                transition: { duration: 0.35 }
              }}
              style={{
                boxShadow: `0 8px 24px ${colors.glow} / 0.35, inset 0 1px 0 hsl(255 100% 100% / 0.15)`,
                transform: 'translateZ(24px)',
              }}
            >
              <Icon className="w-5 h-5 text-white" />
            </motion.div>
          </div>

          <motion.div 
            className="mt-2"
            style={{ 
              opacity: isHovered ? 1 : 0.75,
              transition: 'opacity 0.4s ease',
              transform: 'translateZ(12px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            transition={{ delay: delay + 0.5 }}
          >
            <Sparkline data={sparkData} color={colors.spark} />
          </motion.div>
        </div>

        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `linear-gradient(135deg, transparent 30%, ${colors.glow} / 0.02 50%, transparent 70%)`,
            backgroundSize: '250% 250%',
          }}
          animate={isHovered ? {
            backgroundPosition: ['0% 0%', '100% 100%'],
          } : {}}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  );
};