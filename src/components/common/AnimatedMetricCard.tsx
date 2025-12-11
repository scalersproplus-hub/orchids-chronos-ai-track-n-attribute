import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface SparklineProps {
  data: number[];
  color: string;
  accentColor?: string;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, accentColor, height = 56 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((value - min) / range) * (height * 0.85);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} 100,${height}`;
  const uniqueId = `spark-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg className="w-full" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${uniqueId}-area`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="50%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uniqueId}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="20%" stopColor={color} stopOpacity="0.6" />
          <stop offset="50%" stopColor={accentColor || color} stopOpacity="1" />
          <stop offset="80%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
        <filter id={`${uniqueId}-glow`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="blur" in2="SourceGraphic" operator="over" />
        </filter>
        <filter id={`${uniqueId}-dotGlow`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
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
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        cx={100}
        cy={height - ((data[data.length - 1] - min) / range) * (height * 0.85)}
        r="4"
        fill={accentColor || color}
        filter={`url(#${uniqueId}-dotGlow)`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
      />
      <motion.circle
        cx={100}
        cy={height - ((data[data.length - 1] - min) / range) * (height * 0.85)}
        r="8"
        fill={accentColor || color}
        opacity="0.2"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 1.5 }}
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
    gradient: 'from-[hsl(252_87%_62%)] via-[hsl(270_85%_60%)] to-[hsl(330_80%_58%)]',
    text: 'hsl(252 92% 82%)',
    glow: 'hsl(252 87% 64%)',
    spark: 'hsl(252 87% 68%)',
    sparkAccent: 'hsl(270 85% 72%)',
    bg: 'hsl(252 87% 64% / 0.06)',
    border: 'hsl(252 87% 64% / 0.12)',
    iconBg: 'linear-gradient(135deg, hsl(252 87% 58%) 0%, hsl(270 85% 52%) 50%, hsl(330 78% 50%) 100%)',
  },
  accent: {
    gradient: 'from-[hsl(165_82%_48%)] via-[hsl(180_78%_50%)] to-[hsl(200_80%_52%)]',
    text: 'hsl(165 88% 65%)',
    glow: 'hsl(165 82% 51%)',
    spark: 'hsl(165 82% 55%)',
    sparkAccent: 'hsl(180 80% 58%)',
    bg: 'hsl(165 82% 51% / 0.06)',
    border: 'hsl(165 82% 51% / 0.12)',
    iconBg: 'linear-gradient(135deg, hsl(165 82% 46%) 0%, hsl(180 78% 48%) 50%, hsl(200 78% 50%) 100%)',
  },
  success: {
    gradient: 'from-[hsl(158_72%_44%)] via-[hsl(165_82%_48%)] to-[hsl(175_80%_50%)]',
    text: 'hsl(158 78% 58%)',
    glow: 'hsl(158 72% 46%)',
    spark: 'hsl(158 72% 52%)',
    sparkAccent: 'hsl(165 82% 56%)',
    bg: 'hsl(158 72% 46% / 0.06)',
    border: 'hsl(158 72% 46% / 0.12)',
    iconBg: 'linear-gradient(135deg, hsl(158 72% 42%) 0%, hsl(165 80% 46%) 50%, hsl(175 78% 48%) 100%)',
  },
  warning: {
    gradient: 'from-[hsl(42_92%_52%)] via-[hsl(32_90%_54%)] to-[hsl(20_88%_56%)]',
    text: 'hsl(42 95% 65%)',
    glow: 'hsl(42 92% 56%)',
    spark: 'hsl(42 92% 60%)',
    sparkAccent: 'hsl(32 90% 62%)',
    bg: 'hsl(42 92% 56% / 0.06)',
    border: 'hsl(42 92% 56% / 0.12)',
    iconBg: 'linear-gradient(135deg, hsl(42 92% 50%) 0%, hsl(32 88% 52%) 50%, hsl(20 86% 54%) 100%)',
  },
};

const AnimatedNumber: React.FC<{ value: string }> = ({ value }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="metric-value text-white"
    >
      {value}
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
  const translateZ = useTransform(mouseXSpring, [-0.5, 0.5], ['0px', '16px']);

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
      initial={{ opacity: 0, y: 32, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
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
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${colors.glow} / 0.25, transparent 40%, ${colors.glow} / 0.1, transparent 60%, ${colors.glow} / 0.2)`,
          filter: 'blur(1px)',
          transition: 'opacity 0.5s ease',
        }}
      />
      
      <motion.div
        className="relative p-7 rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(165deg, 
            hsl(225 15% 10% / 0.97) 0%, 
            hsl(225 15% 8% / 0.99) 40%,
            hsl(225 15% 6% / 1) 100%
          )`,
          border: `1px solid ${isHovered ? colors.border : 'hsl(225 15% 14% / 0.7)'}`,
          boxShadow: isHovered 
            ? `0 32px 64px -16px hsl(225 15% 0% / 0.5), 0 0 64px ${colors.glow} / 0.1, inset 0 1px 0 hsl(0 0% 100% / 0.04)`
            : '0 8px 32px -8px hsl(225 15% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.03)',
          transition: 'border-color 0.5s ease, box-shadow 0.5s ease',
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colors.glow} / 0.4 20%, ${colors.glow} / 0.6 50%, ${colors.glow} / 0.4 80%, transparent 100%)`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.div 
          className="absolute -top-24 -right-24 w-56 h-56 rounded-full pointer-events-none"
          style={{ 
            background: `radial-gradient(circle, ${colors.glow} / ${isHovered ? 0.1 : 0.03}, transparent 65%)`,
            filter: 'blur(50px)',
            transform: 'translateZ(8px)',
          }}
          animate={{ scale: isHovered ? 1.2 : 1, opacity: isHovered ? 1 : 0.6 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.div 
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full pointer-events-none"
          style={{ 
            background: `radial-gradient(circle, hsl(165 82% 51% / ${isHovered ? 0.06 : 0.01}), transparent 65%)`,
            filter: 'blur(40px)',
            transform: 'translateZ(4px)',
          }}
          animate={{ scale: isHovered ? 1.3 : 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <motion.h4 
                className="text-[13px] font-medium tracking-wide"
                style={{ color: 'hsl(225 12% 50%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.15 }}
              >
                {title}
              </motion.h4>
              <motion.div 
                className="flex items-baseline gap-4"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.25 }}
              >
                <AnimatedNumber value={value} />
                {trend && (
                  <motion.div 
                    className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg ${
                      trend.isPositive 
                        ? 'text-[hsl(158_78%_55%)] bg-[hsl(158_72%_46%_/_0.08)] border border-[hsl(158_72%_46%_/_0.12)]' 
                        : 'text-[hsl(0_80%_62%)] bg-[hsl(0_72%_51%_/_0.08)] border border-[hsl(0_72%_51%_/_0.12)]'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: delay + 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {trend.isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                  </motion.div>
                )}
              </motion.div>
            </div>

            <motion.div
              className="p-3.5 rounded-xl"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
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
                background: colors.iconBg,
                boxShadow: `0 8px 24px ${colors.glow} / 0.3, 0 2px 8px ${colors.glow} / 0.2, inset 0 1px 0 hsl(0 0% 100% / 0.2)`,
                transform: 'translateZ(28px)',
              }}
            >
              <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </motion.div>
          </div>

          <motion.div 
            className="mt-3"
            style={{ 
              opacity: isHovered ? 1 : 0.7,
              transition: 'opacity 0.5s ease',
              transform: 'translateZ(16px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: delay + 0.55 }}
          >
            <Sparkline 
              data={sparkData} 
              color={colors.spark} 
              accentColor={colors.sparkAccent}
              height={56}
            />
          </motion.div>
        </div>

        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `linear-gradient(135deg, transparent 25%, ${colors.glow} / 0.015 50%, transparent 75%)`,
            backgroundSize: '300% 300%',
          }}
          animate={isHovered ? {
            backgroundPosition: ['0% 0%', '100% 100%'],
          } : {}}
          transition={{ duration: 2.5, repeat: isHovered ? Infinity : 0, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  );
};