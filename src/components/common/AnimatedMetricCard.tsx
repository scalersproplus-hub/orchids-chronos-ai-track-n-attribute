import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <svg className="w-full" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sparkGradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`lineGradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <motion.polygon
        points={areaPoints}
        fill={`url(#sparkGradient-${color})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.polyline
        points={points}
        fill="none"
        stroke={`url(#lineGradient-${color})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
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
    glow: 'hsl(270 91% 65% / 0.3)',
    spark: 'hsl(270 91% 65%)',
    bg: 'hsl(270 91% 65% / 0.1)',
  },
  accent: {
    gradient: 'from-[hsl(170_80%_50%)] to-[hsl(200_80%_50%)]',
    text: 'hsl(170 80% 55%)',
    glow: 'hsl(170 80% 50% / 0.3)',
    spark: 'hsl(170 80% 50%)',
    bg: 'hsl(170 80% 50% / 0.1)',
  },
  success: {
    gradient: 'from-[hsl(150_80%_45%)] to-[hsl(170_80%_50%)]',
    text: 'hsl(150 80% 55%)',
    glow: 'hsl(150 80% 45% / 0.3)',
    spark: 'hsl(150 80% 50%)',
    bg: 'hsl(150 80% 45% / 0.1)',
  },
  warning: {
    gradient: 'from-[hsl(40_95%_55%)] to-[hsl(25_95%_55%)]',
    text: 'hsl(40 95% 60%)',
    glow: 'hsl(40 95% 55% / 0.3)',
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

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${colors.glow}, transparent, ${colors.glow})`,
        }}
      />
      
      <motion.div
        className="relative p-6 rounded-2xl overflow-hidden glass"
        style={{
          background: 'linear-gradient(135deg, hsl(230 25% 8% / 0.9) 0%, hsl(230 25% 6% / 0.95) 100%)',
          border: '1px solid hsl(230 20% 15%)',
        }}
        whileHover={{ y: -4, transition: { duration: 0.3 } }}
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colors.glow} 50%, transparent 100%)`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: delay + 0.3 }}
        />

        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ background: `radial-gradient(circle, ${colors.glow}, transparent)` }}
        />

        <div className="relative z-10">
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
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      trend.isPositive ? 'text-[hsl(150_80%_50%)]' : 'text-[hsl(0_80%_60%)]'
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
                scale: 1.1,
                rotate: [0, -10, 10, 0],
                transition: { duration: 0.4 }
              }}
              style={{
                boxShadow: `0 8px 20px ${colors.glow}`,
              }}
            >
              <Icon className="w-5 h-5 text-white" />
            </motion.div>
          </div>

          <motion.div 
            className="mt-4 opacity-60 group-hover:opacity-100 transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: delay + 0.6 }}
          >
            <Sparkline data={sparkData} color={colors.spark} />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
