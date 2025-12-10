import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog, Play, Pause, AlertTriangle, TrendingUp, TrendingDown, Bell, Power, Trash2, Plus, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { getRulesEngine, CampaignRule, RuleEvaluationResult, DEFAULT_RULES, RuleAction } from '../../services/rulesEngine';
import { MOCK_CAMPAIGNS } from '../../services/mockData';

const ActionBadge: React.FC<{ action: RuleAction }> = ({ action }) => {
    const config: Record<RuleAction, { icon: React.ElementType; color: string; label: string }> = {
        pause: { icon: Pause, color: 'hsl(0 80% 55%)', label: 'Pause' },
        increase_budget: { icon: TrendingUp, color: 'hsl(150 80% 45%)', label: 'Scale' },
        decrease_budget: { icon: TrendingDown, color: 'hsl(40 95% 55%)', label: 'Reduce' },
        alert: { icon: Bell, color: 'hsl(270 91% 65%)', label: 'Alert' },
        enable: { icon: Power, color: 'hsl(170 80% 50%)', label: 'Enable' }
    };

    const { icon: Icon, color, label } = config[action];

    return (
        <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
            style={{ background: `${color}20`, color }}
        >
            <Icon className="w-3 h-3" />
            {label}
        </div>
    );
};

export const RulesAutomation: React.FC = () => {
    const [rules, setRules] = useState<CampaignRule[]>([]);
    const [results, setResults] = useState<RuleEvaluationResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [lastRun, setLastRun] = useState<Date | null>(null);

    useEffect(() => {
        const engine = getRulesEngine();
        setRules(engine.getRules());
    }, []);

    const runRules = async () => {
        setIsRunning(true);
        const engine = getRulesEngine();
        const evaluationResults = await engine.evaluate(MOCK_CAMPAIGNS);
        setResults(evaluationResults);
        setLastRun(new Date());
        setIsRunning(false);
    };

    const toggleRule = (ruleId: string) => {
        const engine = getRulesEngine();
        const rule = rules.find(r => r.id === ruleId);
        if (rule) {
            engine.toggleRule(ruleId, !rule.enabled);
            setRules(engine.getRules());
        }
    };

    const getActiveRulesCount = () => rules.filter(r => r.enabled).length;

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
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(40_95%_55%)] to-[hsl(25_95%_55%)] flex items-center justify-center"
                        animate={{ rotate: isRunning ? 360 : 0 }}
                        transition={{ duration: 2, repeat: isRunning ? Infinity : 0, ease: 'linear' }}
                    >
                        <Cog className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Campaign Rules Engine</h3>
                        <p className="text-xs text-gray-400">Automated campaign management</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {lastRun && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last run: {lastRun.toLocaleTimeString()}
                        </span>
                    )}
                    <motion.button
                        onClick={runRules}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[hsl(270_91%_65%)] to-[hsl(320_80%_60%)] text-white text-sm font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isRunning ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Run Rules
                            </>
                        )}
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Active Rules ({getActiveRulesCount()}/{rules.length})
                        </h4>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {rules.map((rule, i) => (
                            <motion.div
                                key={rule.id}
                                className={`p-4 rounded-xl transition-all ${
                                    rule.enabled ? 'glass' : 'bg-[hsl(230_20%_8%)]'
                                }`}
                                style={{
                                    border: rule.enabled
                                        ? '1px solid hsl(270 91% 65% / 0.2)'
                                        : '1px solid hsl(230 20% 12%)'
                                }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className={`text-sm font-medium ${rule.enabled ? 'text-white' : 'text-gray-500'}`}>
                                                {rule.name}
                                            </h5>
                                            <ActionBadge action={rule.action} />
                                        </div>
                                        <p className={`text-xs ${rule.enabled ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {rule.description}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Trigger: {rule.reason}
                                        </p>
                                    </div>
                                    <motion.button
                                        onClick={() => toggleRule(rule.id)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            rule.enabled ? 'bg-[hsl(270_91%_65%)]' : 'bg-[hsl(230_20%_20%)]'
                                        }`}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <motion.div
                                            className="absolute top-1 w-4 h-4 rounded-full bg-white"
                                            animate={{ left: rule.enabled ? '28px' : '4px' }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Triggered Actions ({results.length})
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        <AnimatePresence>
                            {results.length === 0 ? (
                                <motion.div
                                    className="flex flex-col items-center justify-center h-48 glass rounded-xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ border: '1px solid hsl(230 20% 15%)' }}
                                >
                                    <CheckCircle className="w-12 h-12 text-[hsl(150_80%_45%)] mb-3" />
                                    <p className="text-sm text-gray-400">No actions triggered</p>
                                    <p className="text-xs text-gray-500 mt-1">Run rules to check campaigns</p>
                                </motion.div>
                            ) : (
                                results.map((result, i) => (
                                    <motion.div
                                        key={`${result.campaign.id}-${result.ruleName}-${i}`}
                                        className="p-4 glass rounded-xl"
                                        style={{ border: '1px solid hsl(270 91% 65% / 0.2)' }}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-white">
                                                        {result.campaign.name}
                                                    </span>
                                                    <ActionBadge action={result.action} />
                                                </div>
                                                <p className="text-xs text-gray-400 mb-2">
                                                    Rule: {result.ruleName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {result.reason}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span>Spend: ${result.campaign.spend.toLocaleString()}</span>
                                                    <span>ROAS: {result.campaign.roas.toFixed(2)}x</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <motion.button
                                                    className="p-2 glass rounded-lg text-[hsl(150_80%_45%)] hover:bg-[hsl(150_80%_45%_/_0.1)]"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Apply action"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button
                                                    className="p-2 glass rounded-lg text-[hsl(0_80%_55%)] hover:bg-[hsl(0_80%_55%_/_0.1)]"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Dismiss"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
