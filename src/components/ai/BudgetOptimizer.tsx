import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, Target, Zap, ArrowRight, 
  AlertCircle, CheckCircle, Sliders, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, Sparkles, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPie, Pie } from 'recharts';

interface BudgetAllocation {
  campaign: string;
  platform: string;
  currentBudget: number;
  recommendedBudget: number;
  expectedRoas: number;
  currentRoas: number;
  confidence: number;
}

interface OptimizationScenario {
  id: string;
  name: string;
  totalBudget: number;
  expectedRevenue: number;
  expectedRoas: number;
  risk: 'low' | 'medium' | 'high';
}

export const BudgetOptimizer: React.FC = () => {
  const [totalBudget, setTotalBudget] = useState(25000);
  const [optimizationGoal, setOptimizationGoal] = useState<'roas' | 'revenue' | 'leads'>('roas');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const allocations: BudgetAllocation[] = [
    { 
      campaign: 'Top of Funnel - Cold Traffic', 
      platform: 'Facebook', 
      currentBudget: 12500, 
      recommendedBudget: 15000, 
      expectedRoas: 2.6, 
      currentRoas: 2.28,
      confidence: 89
    },
    { 
      campaign: 'Brand Search - Retargeting', 
      platform: 'Google', 
      currentBudget: 4200, 
      recommendedBudget: 3000, 
      expectedRoas: 1.8, 
      currentRoas: 1.31,
      confidence: 76
    },
    { 
      campaign: 'UGC Creative Test #4', 
      platform: 'TikTok', 
      currentBudget: 1500, 
      recommendedBudget: 4000, 
      expectedRoas: 3.2, 
      currentRoas: 2.8,
      confidence: 72
    },
    { 
      campaign: 'Lookalike Audiences', 
      platform: 'Facebook', 
      currentBudget: 6800, 
      recommendedBudget: 3000, 
      expectedRoas: 1.9, 
      currentRoas: 1.65,
      confidence: 81
    },
  ];

  const scenarios: OptimizationScenario[] = [
    { id: 'conservative', name: 'Conservative', totalBudget: 25000, expectedRevenue: 52500, expectedRoas: 2.1, risk: 'low' },
    { id: 'balanced', name: 'Balanced', totalBudget: 25000, expectedRevenue: 62500, expectedRoas: 2.5, risk: 'medium' },
    { id: 'aggressive', name: 'Aggressive', totalBudget: 25000, expectedRevenue: 75000, expectedRoas: 3.0, risk: 'high' },
  ];

  const [selectedScenario, setSelectedScenario] = useState('balanced');

  // Platform distribution data
  const platformData = [
    { name: 'Facebook', current: 19300, recommended: 18000, color: '#3b82f6' },
    { name: 'Google', current: 4200, recommended: 3000, color: '#ef4444' },
    { name: 'TikTok', current: 1500, recommended: 4000, color: '#000000' },
  ];

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => setIsOptimizing(false), 2000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const totalCurrentBudget = allocations.reduce((sum, a) => sum + a.currentBudget, 0);
  const totalRecommendedBudget = allocations.reduce((sum, a) => sum + a.recommendedBudget, 0);
  const avgCurrentRoas = allocations.reduce((sum, a) => sum + a.currentRoas, 0) / allocations.length;
  const avgExpectedRoas = allocations.reduce((sum, a) => sum + a.expectedRoas, 0) / allocations.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Budget Optimizer</h1>
            <p className="text-gray-400 text-sm">AI-powered budget allocation recommendations</p>
          </div>
        </div>
        <button 
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          {isOptimizing ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Optimizing...</>
          ) : (
            <><Zap className="w-4 h-4" /> Apply Recommendations</>
          )}
        </button>
      </div>

      {/* Budget Input & Goal Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Budget Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Total Monthly Budget</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full bg-chronos-800 border border-chronos-700 rounded-lg pl-10 pr-4 py-3 text-white text-lg font-semibold focus:border-chronos-500 focus:ring-1 focus:ring-chronos-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Optimization Goal</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'roas', label: 'Maximize ROAS', icon: TrendingUp },
                  { id: 'revenue', label: 'Maximize Revenue', icon: DollarSign },
                  { id: 'leads', label: 'Maximize Leads', icon: Target },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setOptimizationGoal(goal.id as any)}
                    className={`p-3 rounded-lg border transition-colors flex flex-col items-center gap-2 ${
                      optimizationGoal === goal.id
                        ? 'bg-chronos-700 border-chronos-500 text-white'
                        : 'bg-chronos-800 border-chronos-700 text-gray-400 hover:border-chronos-600'
                    }`}
                  >
                    <goal.icon className="w-5 h-5" />
                    <span className="text-xs">{goal.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Optimization Scenarios</h3>
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`w-full p-4 rounded-lg border transition-all text-left ${
                  selectedScenario === scenario.id
                    ? 'bg-chronos-700 border-chronos-500'
                    : 'bg-chronos-800 border-chronos-700 hover:border-chronos-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{scenario.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiskColor(scenario.risk)}`}>
                    {scenario.risk.charAt(0).toUpperCase() + scenario.risk.slice(1)} Risk
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Expected: ${scenario.expectedRevenue.toLocaleString()}</span>
                  <span className="text-green-400">{scenario.expectedRoas}x ROAS</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Current Budget</div>
          <div className="text-2xl font-bold text-white">${totalCurrentBudget.toLocaleString()}</div>
        </div>
        <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Recommended Budget</div>
          <div className="text-2xl font-bold text-white">${totalRecommendedBudget.toLocaleString()}</div>
        </div>
        <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Current Avg ROAS</div>
          <div className="text-2xl font-bold text-white">{avgCurrentRoas.toFixed(2)}x</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-xs text-green-400 mb-1">Expected Avg ROAS</div>
          <div className="text-2xl font-bold text-green-400">{avgExpectedRoas.toFixed(2)}x</div>
          <div className="text-xs text-green-400/70 mt-1">
            +{((avgExpectedRoas - avgCurrentRoas) / avgCurrentRoas * 100).toFixed(0)}% improvement
          </div>
        </div>
      </div>

      {/* Allocation Table */}
      <div className="bg-chronos-900 border border-chronos-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-chronos-800">
          <h3 className="text-lg font-semibold text-white">Campaign Budget Allocation</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-chronos-800/50">
              <tr>
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Campaign</th>
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Platform</th>
                <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Current Budget</th>
                <th className="text-center text-xs text-gray-400 font-medium px-4 py-3">Change</th>
                <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Recommended</th>
                <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Current ROAS</th>
                <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Expected ROAS</th>
                <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chronos-800">
              {allocations.map((alloc, i) => {
                const change = alloc.recommendedBudget - alloc.currentBudget;
                const changePercent = (change / alloc.currentBudget * 100).toFixed(0);
                return (
                  <tr key={i} className="hover:bg-chronos-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-medium text-white">{alloc.campaign}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        alloc.platform === 'Facebook' ? 'bg-blue-500/20 text-blue-400' :
                        alloc.platform === 'Google' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {alloc.platform}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-400">
                      ${alloc.currentBudget.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`flex items-center justify-center gap-1 text-sm ${
                        change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {change > 0 ? <ArrowUpRight className="w-4 h-4" /> : change < 0 ? <ArrowDownRight className="w-4 h-4" /> : null}
                        {change > 0 ? '+' : ''}{changePercent}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-white">
                      ${alloc.recommendedBudget.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-400">
                      {alloc.currentRoas}x
                    </td>
                    <td className="px-4 py-4 text-right text-green-400 font-medium">
                      {alloc.expectedRoas}x
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-chronos-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-chronos-500 rounded-full"
                            style={{ width: `${alloc.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{alloc.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Budget Distribution by Platform</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={v => `$${v/1000}k`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="current" name="Current" fill="#6b7280" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="recommended" name="Recommended" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-500"></div>
              <span className="text-gray-400">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-teal-500"></div>
              <span className="text-gray-400">Recommended</span>
            </div>
          </div>
        </div>

        <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">AI Optimization Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm text-green-200 font-medium">Scale TikTok Campaign</p>
                  <p className="text-xs text-green-300/70 mt-1">
                    UGC Creative Test #4 shows hidden attribution from cross-device conversions. 
                    Increase budget by 167% to capture untapped potential.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-200 font-medium">Reduce Google Brand Search</p>
                  <p className="text-xs text-yellow-300/70 mt-1">
                    Platform over-reports conversions by 172%. Real ROAS is 1.31x vs reported 3.57x. 
                    Redirect budget to higher-performing channels.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-200 font-medium">Reallocate Lookalike Budget</p>
                  <p className="text-xs text-blue-300/70 mt-1">
                    Lookalike audiences are fatiguing. Move $3,800 to Cold Traffic campaign 
                    which has 38% higher conversion rate this week.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-chronos-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Estimated Monthly Impact</span>
                <span className="text-lg font-bold text-green-400">+$8,750 revenue</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-400">ROAS Improvement</span>
                <span className="text-lg font-bold text-green-400">+0.34x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOptimizer;
