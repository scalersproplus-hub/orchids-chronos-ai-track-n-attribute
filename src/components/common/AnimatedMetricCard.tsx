import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, height = 40 }) => {
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
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uniqueId}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
        <filter id={`${uniqueId}-glow`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
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
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.polyline
        points={points}
        fill="none"
        stroke={`url(#${uniqueId}-line)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${uniqueId}-glow)`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.circle
        cx={100}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
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
    gradient: 'from-[hsl(270_91%_65%)] to-[hsl(320_80%_60%)]',
    text: 'hsl(270 91% 75%)',
    glow: 'hsl(270 91% 65%)',
    spark: 'hsl(270 91% 65%)',
    bg: 'hsl(270 91% 65% / 0.1)',
  },
  accent: {
    gradient: 'from-[hsl(170_80%_50%)] to-[hsl(200_80%_50%)]',
    text: 'hsl(170 80% 55%)',
    glow: 'hsl(170 80% 50%)',
    spark: 'hsl(170 80% 50%)',
    bg: 'hsl(170 80% 50% / 0.1)',
  },
  success: {
    gradient: 'from-[hsl(150_80%_45%)] to-[hsl(170_80%_50%)]',
    text: 'hsl(150 80% 55%)',
    glow: 'hsl(150 80% 45%)',
    spark: 'hsl(150 80% 50%)',
    bg: 'hsl(150 80% 45% / 0.1)',
  },
  warning: {
    gradient: 'from-[hsl(40_95%_55%)] to-[hsl(25_95%_55%)]',
    text: 'hsl(40 95% 60%)',
    glow: 'hsl(40 95% 55%)',
    spark: 'hsl(40 95% 55%)',
    bg: 'hsl(40 95% 55% / 0.1)',
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-8deg', '8deg']);

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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <motion.div
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${colors.glow} / 0.4, transparent, ${colors.glow} / 0.4)`,
        }}
      />
      
      <motion.div
        className="relative p-6 rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, 
            hsl(230 25% 10% / 0.95) 0%, 
            hsl(230 25% 7% / 0.98) 50%,
            hsl(230 25% 5% / 1) 100%
          )`,
          border: `1px solid hsl(${isHovered ? '270 91% 65%' : '230 20% 15%'} / ${isHovered ? 0.4 : 1})`,
          boxShadow: isHovered 
            ? `0 25px 50px -12px ${colors.glow} / 0.25, 0 0 40px ${colors.glow} / 0.1, inset 0 1px 0 hsl(270 91% 75% / 0.1)`
            : '0 4px 20px hsl(0 0% 0% / 0.3)',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colors.glow} / 0.5 50%, transparent 100%)`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: delay + 0.3 }}
        />

        <motion.div 
          className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
          style={{ 
            background: `radial-gradient(circle, ${colors.glow} / ${isHovered ? 0.15 : 0.05}, transparent 70%)`,
            filter: 'blur(30px)',
            transform: 'translateZ(10px)',
          }}
          animate={{ scale: isHovered ? 1.2 : 1 }}
          transition={{ duration: 0.3 }}
        />

        <motion.div 
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
          style={{ 
            background: `radial-gradient(circle, hsl(170 80% 50% / ${isHovered ? 0.1 : 0.03}), transparent 70%)`,
            filter: 'blur(25px)',
            transform: 'translateZ(5px)',
          }}
          animate={{ scale: isHovered ? 1.3 : 1 }}
          transition={{ duration: 0.4 }}
        />

        <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <motion.h4 
                className="text-sm font-medium text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.2 }}
              >
                {title}
              </motion.h4>
              <motion.div 
                className="flex items-baseline gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.3 }}
              >
                <AnimatedNumber value={value} />
                {trend && (
                  <motion.div 
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      trend.isPositive 
                        ? 'text-[hsl(150_80%_50%)] bg-[hsl(150_80%_50%_/_0.1)]' 
                        : 'text-[hsl(0_80%_60%)] bg-[hsl(0_80%_60%_/_0.1)]'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: delay + 0.5 }}
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
              className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: delay + 0.2
              }}
              whileHover={{ 
                scale: 1.15,
                rotate: [0, -10, 10, 0],
                transition: { duration: 0.4 }
              }}
              style={{
                boxShadow: `0 8px 25px ${colors.glow} / 0.4`,
                transform: 'translateZ(30px)',
              }}
            >
              <Icon className="w-5 h-5 text-white" />
            </motion.div>
          </div>

          <motion.div 
            className="mt-4"
            style={{ 
              opacity: isHovered ? 1 : 0.7,
              transition: 'opacity 0.3s ease',
              transform: 'translateZ(15px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: delay + 0.6 }}
          >
            <Sparkline data={sparkData} color={colors.spark} />
          </motion.div>
        </div>

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, transparent 40%, ${colors.glow} / 0.03 50%, transparent 60%)`,
            backgroundSize: '200% 200%',
          }}
          animate={isHovered ? {
            backgroundPosition: ['0% 0%', '100% 100%'],
          } : {}}
          transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
        />
      </motion.div>
    </motion.div>
  );
};