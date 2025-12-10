import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Brain, Calendar, Target, Sparkles, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { predictNextWeekConversions, ConversionForecast as ForecastType } from '../../services/geminiService';
import { MOCK_CAMPAIGNS } from '../../services/mockData';

const MetricCard: React.FC<{
    title: string;
    value: string;
    trend?: string;
    isPositive?: boolean;
    icon: React.ElementType;
    color: string;
}> = ({ title, value, trend, isPositive, icon: Icon, color }) => (
    <motion.div
        className="glass rounded-xl p-4"
        style={{ border: `1px solid ${color}20` }}
        whileHover={{ scale: 1.02, borderColor: `${color}40` }}
    >
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">{title}</span>
            <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-white">{value}</span>
            {trend && (
                <div className={`flex items-center text-xs ${isPositive ? 'text-[hsl(150_80%_50%)]' : 'text-[hsl(0_80%_55%)]'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            )}
        </div>
    </motion.div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 rounded-xl shadow-xl" style={{ border: '1px solid hsl(270 91% 65% / 0.2)' }}>
                <p className="text-sm font-semibold text-white mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                        <span className="text-gray-400">{entry.name}:</span>
                        <span className="font-mono text-white">
                            {entry.name === 'Revenue' ? `$${entry.value.toLocaleString()}` : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export const ConversionForecast: React.FC = () => {
    const [forecast, setForecast] = useState<ForecastType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadForecast = async () => {
        setLoading(true);
        setError(null);
        try {
            const prediction = await predictNextWeekConversions(MOCK_CAMPAIGNS);
            setForecast(prediction);
        } catch (e) {
            setError('Failed to generate forecast');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadForecast();
    }, []);

    if (loading) {
        return (
            <motion.div
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ border: '1px solid hsl(270 91% 65% / 0.1)' }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(270_91%_65%)] to-[hsl(320_80%_60%)] flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">7-Day Forecast</h3>
                        <p className="text-xs text-gray-400">AI-powered prediction</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 glass rounded-xl animate-pulse" />
                        ))}
                    </div>
                    <div className="h-64 glass rounded-xl animate-pulse" />
                </div>
            </motion.div>
        );
    }

    if (error || !forecast) {
        return (
            <motion.div
                className="glass rounded-2xl p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ border: '1px solid hsl(0 80% 55% / 0.2)' }}
            >
                <p className="text-gray-400 mb-4">{error || 'Unable to generate forecast'}</p>
                <motion.button
                    onClick={loadForecast}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[hsl(270_91%_65%)] to-[hsl(320_80%_60%)] text-white text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Retry
                </motion.button>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ border: '1px solid hsl(270 91% 65% / 0.1)' }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <motion.div
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(270_91%_65%)] to-[hsl(320_80%_60%)] flex items-center justify-center"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <Brain className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            7-Day Forecast
                            <Sparkles className="w-4 h-4 text-[hsl(40_95%_55%)]" />
                        </h3>
                        <p className="text-xs text-gray-400">AI-powered prediction</p>
                    </div>
                </div>
                <motion.button
                    onClick={loadForecast}
                    className="p-2 glass rounded-lg text-gray-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <RefreshCw className="w-4 h-4" />
                </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <MetricCard
                    title="Predicted Revenue"
                    value={`$${forecast.revenue.toLocaleString()}`}
                    trend="+12%"
                    isPositive={true}
                    icon={TrendingUp}
                    color="hsl(170 80% 50%)"
                />
                <MetricCard
                    title="Expected ROAS"
                    value={`${forecast.roas.toFixed(2)}x`}
                    trend="+0.3x"
                    isPositive={true}
                    icon={Target}
                    color="hsl(270 91% 65%)"
                />
                <MetricCard
                    title="Confidence"
                    value={`${forecast.confidence}%`}
                    icon={Brain}
                    color="hsl(40 95% 55%)"
                />
            </div>

            <div className="glass rounded-xl p-4 mb-4" style={{ border: '1px solid hsl(230 20% 15%)' }}>
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-[hsl(270_91%_75%)]" />
                    <span className="text-sm font-medium text-white">Daily Breakdown</span>
                </div>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecast.dailyBreakdown} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(270 91% 65%)" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="hsl(270 91% 65%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 15%)" vertical={false} />
                            <XAxis dataKey="date" stroke="hsl(230 12% 40%)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(230 12% 40%)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="hsl(270 91% 65%)"
                                strokeWidth={2}
                                fill="url(#forecastGradient)"
                                name="Revenue"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass rounded-xl p-4" style={{ border: '1px solid hsl(230 20% 15%)' }}>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-[hsl(170_80%_50%)]" />
                    <span className="text-sm font-medium text-white">Conversions per Day</span>
                </div>
                <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={forecast.dailyBreakdown} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 15%)" vertical={false} />
                            <XAxis dataKey="date" stroke="hsl(230 12% 40%)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(230 12% 40%)" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="conversions"
                                fill="hsl(170 80% 50%)"
                                radius={[4, 4, 0, 0]}
                                name="Conversions"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
};
