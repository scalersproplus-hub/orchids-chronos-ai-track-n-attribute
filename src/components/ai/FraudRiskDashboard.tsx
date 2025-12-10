import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Shield, ShieldAlert, ShieldCheck, Bot, AlertTriangle, CheckCircle, XCircle, RefreshCw, Fingerprint, Eye, MousePointer, Clock, Globe } from 'lucide-react';
import { getFraudDetector, FraudRiskResult } from '../../services/fraudDetectionService';

interface TrafficAnalysis {
    totalVisits: number;
    humanVisits: number;
    botVisits: number;
    suspiciousVisits: number;
    riskBreakdown: { name: string; value: number; color: string }[];
    factorDistribution: { factor: string; count: number }[];
}

const MOCK_TRAFFIC_ANALYSIS: TrafficAnalysis = {
    totalVisits: 15847,
    humanVisits: 14231,
    botVisits: 892,
    suspiciousVisits: 724,
    riskBreakdown: [
        { name: 'Clean Traffic', value: 14231, color: 'hsl(150 80% 45%)' },
        { name: 'Bot Traffic', value: 892, color: 'hsl(0 80% 55%)' },
        { name: 'Suspicious', value: 724, color: 'hsl(40 95% 55%)' }
    ],
    factorDistribution: [
        { factor: 'WebDriver detected', count: 234 },
        { factor: 'Bot user-agent', count: 456 },
        { factor: 'No human behavior', count: 312 },
        { factor: 'Headless browser', count: 178 },
        { factor: 'Suspicious timezone', count: 89 },
        { factor: 'Platform mismatch', count: 67 }
    ]
};

const RiskIndicator: React.FC<{ score: number }> = ({ score }) => {
    const getColor = () => {
        if (score < 30) return 'hsl(150 80% 50%)';
        if (score < 60) return 'hsl(40 95% 55%)';
        return 'hsl(0 80% 55%)';
    };

    const getLabel = () => {
        if (score < 30) return 'Low Risk';
        if (score < 60) return 'Medium Risk';
        return 'High Risk';
    };

    return (
        <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="hsl(230 20% 15%)"
                        strokeWidth="6"
                        fill="none"
                    />
                    <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={getColor()}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: '0 176' }}
                        animate={{ strokeDasharray: `${(score / 100) * 176} 176` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{score}</span>
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-white">{getLabel()}</p>
                <p className="text-xs text-gray-400">Current session</p>
            </div>
        </div>
    );
};

const StatCard: React.FC<{
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    subtext?: string;
}> = ({ label, value, icon: Icon, color, subtext }) => (
    <motion.div
        className="glass rounded-xl p-4"
        style={{ border: `1px solid ${color}20` }}
        whileHover={{ scale: 1.02, borderColor: `${color}40` }}
    >
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">{label}</span>
            <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </motion.div>
);

export const FraudRiskDashboard: React.FC = () => {
    const [currentRisk, setCurrentRisk] = useState<FraudRiskResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [trafficData] = useState<TrafficAnalysis>(MOCK_TRAFFIC_ANALYSIS);

    const analyzeCurrentSession = async () => {
        setIsAnalyzing(true);
        const detector = getFraudDetector();
        const result = await detector.analyze();
        setCurrentRisk(result);
        setIsAnalyzing(false);
    };

    useEffect(() => {
        analyzeCurrentSession();
    }, []);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass p-3 rounded-xl shadow-xl" style={{ border: '1px solid hsl(270 91% 65% / 0.2)' }}>
                    <p className="text-sm font-semibold text-white">{payload[0].payload.factor || payload[0].name}</p>
                    <p className="text-xs text-gray-400">{payload[0].value.toLocaleString()} detections</p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ border: '1px solid hsl(270 91% 65% / 0.1)' }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(150_80%_45%)] to-[hsl(170_80%_50%)] flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Fraud Detection</h3>
                        <p className="text-xs text-gray-400">Bot filtering & traffic analysis</p>
                    </div>
                </div>
                <motion.button
                    onClick={analyzeCurrentSession}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-3 py-2 glass rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.div animate={isAnalyzing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: isAnalyzing ? Infinity : 0 }}>
                        <RefreshCw className="w-4 h-4" />
                    </motion.div>
                    {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
                </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="glass rounded-xl p-4" style={{ border: '1px solid hsl(230 20% 15%)' }}>
                    <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                        <Fingerprint className="w-4 h-4" />
                        Current Session Risk
                    </h4>
                    {currentRisk ? (
                        <div className="space-y-4">
                            <RiskIndicator score={currentRisk.riskScore} />
                            <div className="flex items-center gap-2">
                                {currentRisk.isBot ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(0_80%_55%_/_0.1)] text-[hsl(0_80%_60%)]">
                                        <Bot className="w-4 h-4" />
                                        <span className="text-sm font-medium">Bot Detected</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(150_80%_45%_/_0.1)] text-[hsl(150_80%_50%)]">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span className="text-sm font-medium">Human Verified</span>
                                    </div>
                                )}
                            </div>
                            {currentRisk.factors.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-400">Risk factors:</p>
                                    <div className="space-y-1">
                                        {currentRisk.factors.map((factor, i) => (
                                            <motion.div
                                                key={i}
                                                className="flex items-center gap-2 text-xs"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <AlertTriangle className="w-3 h-3 text-[hsl(40_95%_55%)]" />
                                                <span className="text-gray-300">{factor}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-32 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-[hsl(270_91%_65%)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 glass rounded-xl p-4" style={{ border: '1px solid hsl(230 20% 15%)' }}>
                    <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Traffic Distribution
                    </h4>
                    <div className="flex items-center">
                        <div className="w-40 h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={trafficData.riskBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {trafficData.riskBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-3">
                            {trafficData.riskBreakdown.map((item, i) => (
                                <motion.div
                                    key={item.name}
                                    className="flex items-center justify-between"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                                        <span className="text-sm text-gray-300">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-mono text-white">{item.value.toLocaleString()}</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            ({((item.value / trafficData.totalVisits) * 100).toFixed(1)}%)
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Total Visits"
                    value={trafficData.totalVisits}
                    icon={Globe}
                    color="hsl(270 91% 65%)"
                    subtext="Last 24 hours"
                />
                <StatCard
                    label="Human Traffic"
                    value={trafficData.humanVisits}
                    icon={ShieldCheck}
                    color="hsl(150 80% 45%)"
                    subtext={`${((trafficData.humanVisits / trafficData.totalVisits) * 100).toFixed(1)}% verified`}
                />
                <StatCard
                    label="Bots Blocked"
                    value={trafficData.botVisits}
                    icon={Bot}
                    color="hsl(0 80% 55%)"
                    subtext="Auto-filtered"
                />
                <StatCard
                    label="Suspicious"
                    value={trafficData.suspiciousVisits}
                    icon={ShieldAlert}
                    color="hsl(40 95% 55%)"
                    subtext="Under review"
                />
            </div>

            <div className="glass rounded-xl p-4" style={{ border: '1px solid hsl(230 20% 15%)' }}>
                <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Detection Factor Distribution
                </h4>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trafficData.factorDistribution} layout="vertical" margin={{ left: 100, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 15%)" horizontal={true} vertical={false} />
                            <XAxis type="number" stroke="hsl(230 12% 40%)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="factor" stroke="hsl(230 12% 40%)" fontSize={11} tickLine={false} axisLine={false} width={100} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="hsl(0 80% 55%)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
};
