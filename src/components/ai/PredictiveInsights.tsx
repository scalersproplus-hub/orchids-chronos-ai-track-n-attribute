import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, TrendingDown, Target, Zap, AlertTriangle,
  DollarSign, Users, ArrowUpRight, ArrowDownRight, Sparkles,
  RefreshCw, ChevronRight, BarChart3, PieChart, Activity
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';

interface PredictionData {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  impact: string;
}

interface CampaignRecommendation {
  id: string;
  campaign: string;
  platform: string;
  action: 'SCALE' | 'OPTIMIZE' | 'PAUSE' | 'TEST';
  reason: string;
  expectedImpact: string;
  confidence: number;
}

export const PredictiveInsights: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'predictions' | 'recommendations' | 'forecast'>('predictions');
  
  // Simulated AI predictions
  const [predictions] = useState<PredictionData[]>([
    { metric: 'Revenue (7 days)', current: 45200, predicted: 52800, confidence: 87, trend: 'up', impact: '+$7,600' },
    { metric: 'Conversions (7 days)', current: 142, predicted: 168, confidence: 82, trend: 'up', impact: '+26 conv' },
    { metric: 'ROAS', current: 2.4, predicted: 2.8, confidence: 79, trend: 'up', impact: '+0.4x' },
    { metric: 'CPA', current: 45, predicted: 38, confidence: 74, trend: 'down', impact: '-$7' },
  ]);

  const [recommendations] = useState<CampaignRecommendation[]>([
    { 
      id: '1', 
      campaign: 'Top of Funnel - Cold Traffic - US', 
      platform: 'Facebook',
      action: 'SCALE', 
      reason: 'ROAS 2.28x exceeds target. Audience showing consistent performance with room for expansion.', 
      expectedImpact: '+$12,000 revenue potential',
      confidence: 91
    },
    { 
      id: '2', 
      campaign: 'Brand Search - Retargeting', 
      platform: 'Google',
      action: 'OPTIMIZE', 
      reason: 'High platform-reported revenue but low Chronos-tracked. Attribution mismatch detected - likely double counting.', 
      expectedImpact: 'Save $2,100 in misattributed spend',
      confidence: 85
    },
    { 
      id: '3', 
      campaign: 'UGC Creative Test #4', 
      platform: 'TikTok',
      action: 'TEST', 
      reason: 'Strong ROAS 2.8x despite pause. Hidden attribution from cross-device conversion detected.', 
      expectedImpact: 'Validate $4,200 hidden revenue',
      confidence: 72
    },
  ]);

  // Forecast data
  const forecastData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const baseValue = 1500 + Math.random() * 500;
    const predicted = baseValue * (1 + (i * 0.02) + Math.random() * 0.1);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: i < 3 ? Math.round(baseValue) : null,
      predicted: Math.round(predicted),
      lower: Math.round(predicted * 0.85),
      upper: Math.round(predicted * 1.15),
    };
  });

  // Attribution model comparison
  const attributionComparison = [
    { model: 'Last Click', value: 28500, color: '#14b8a6' },
    { model: 'First Click', value: 22100, color: '#8b5cf6' },
    { model: 'Linear', value: 25300, color: '#f59e0b' },
    { model: 'Time Decay', value: 26800, color: '#ef4444' },
    { model: 'Chronos AI', value: 31200, color: '#3b82f6' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'SCALE': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'OPTIMIZE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'PAUSE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'TEST': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook': return '📘';
      case 'Google': return '🔍';
      case 'TikTok': return '🎵';
      default: return '📊';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-chronos-700 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full border-4 border-t-chronos-500 animate-spin"></div>
            <Brain className="absolute inset-0 m-auto w-6 h-6 text-chronos-400" />
          </div>
          <p className="text-gray-400">AI analyzing your data...</p>
          <p className="text-xs text-gray-600 mt-1">Processing attribution patterns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-chronos-500 to-purple-600 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Predictive Insights</h1>
            <p className="text-gray-400 text-sm">AI-powered attribution analysis and recommendations</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-chronos-800 hover:bg-chronos-700 text-gray-300 rounded-lg flex items-center gap-2 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh Analysis
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {predictions.map((pred, i) => (
          <div key={i} className="bg-chronos-900 border border-chronos-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{pred.metric}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                pred.confidence >= 80 ? 'bg-green-500/20 text-green-400' : 
                pred.confidence >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-red-500/20 text-red-400'
              }`}>
                {pred.confidence}% confidence
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {typeof pred.predicted === 'number' && pred.predicted > 100 
                    ? `$${pred.predicted.toLocaleString()}` 
                    : pred.predicted}
                </div>
                <div className={`text-sm flex items-center gap-1 ${
                  pred.trend === 'up' ? 'text-green-400' : pred.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {pred.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : 
                   pred.trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
                  {pred.impact}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${
                pred.trend === 'up' ? 'bg-green-500/10' : pred.trend === 'down' ? 'bg-red-500/10' : 'bg-gray-500/10'
              }`}>
                {pred.trend === 'up' ? <TrendingUp className="w-5 h-5 text-green-400" /> : 
                 pred.trend === 'down' ? <TrendingDown className="w-5 h-5 text-red-400" /> : 
                 <Activity className="w-5 h-5 text-gray-400" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-chronos-800">
        {[
          { id: 'predictions', label: 'Revenue Forecast', icon: TrendingUp },
          { id: 'recommendations', label: 'AI Recommendations', icon: Sparkles },
          { id: 'forecast', label: 'Attribution Models', icon: PieChart },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-chronos-500 text-white' 
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'predictions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-chronos-900 border border-chronos-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">14-Day Revenue Forecast</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={v => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Area type="monotone" dataKey="upper" stroke="transparent" fill="#6366f1" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="lower" stroke="transparent" fill="#1a1a2e" />
                  <Line type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="actual" stroke="#14b8a6" strokeWidth={3} dot={{ fill: '#14b8a6', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                <span className="text-gray-400">Actual Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-indigo-500" style={{ borderStyle: 'dashed' }}></div>
                <span className="text-gray-400">Predicted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-indigo-500/20"></div>
                <span className="text-gray-400">Confidence Range</span>
              </div>
            </div>
          </div>

          <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Forecast Summary</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="text-sm text-green-400 mb-1">Expected Revenue (14 days)</div>
                <div className="text-2xl font-bold text-white">$52,800</div>
                <div className="text-xs text-green-400/70 mt-1">+17% vs previous period</div>
              </div>
              
              <div className="p-4 bg-chronos-800/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Best Performing Day</div>
                <div className="text-lg font-semibold text-white">Saturday</div>
                <div className="text-xs text-gray-500 mt-1">Peak conversion window: 2-6 PM</div>
              </div>

              <div className="p-4 bg-chronos-800/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Predicted AOV</div>
                <div className="text-lg font-semibold text-white">$127.50</div>
                <div className="text-xs text-gray-500 mt-1">↑ $8.20 from current</div>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-400 font-medium">AI Insight</span>
                </div>
                <p className="text-sm text-gray-300">
                  Weekend traffic shows 23% higher purchase intent. Consider increasing bids on Fri-Sun.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="bg-chronos-900 border border-chronos-800 rounded-xl p-6 hover:border-chronos-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getPlatformIcon(rec.platform)}</div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white">{rec.campaign}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getActionColor(rec.action)}`}>
                        {rec.action}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{rec.reason}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-chronos-400" />
                        <span className="text-gray-300">{rec.expectedImpact}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400">{rec.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-chronos-700 hover:bg-chronos-600 text-white rounded-lg flex items-center gap-2 transition-colors">
                  Apply
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-r from-purple-900/30 to-chronos-900 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Why Trust These Recommendations?</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Our AI analyzes your full customer journey across all touchpoints, not just last-click data. 
                  This reveals hidden attribution that platforms miss, like cross-device conversions and 
                  view-through purchases that happen days after ad exposure.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-chronos-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">89%</div>
                    <div className="text-xs text-gray-500">Recommendation Accuracy</div>
                  </div>
                  <div className="text-center p-3 bg-chronos-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">$47K</div>
                    <div className="text-xs text-gray-500">Saved This Month</div>
                  </div>
                  <div className="text-center p-3 bg-chronos-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">2.4x</div>
                    <div className="text-xs text-gray-500">Avg ROAS Improvement</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Attribution Model Comparison</h3>
            <p className="text-sm text-gray-400 mb-4">
              How different models attribute the same $31,200 in revenue
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={attributionComparison}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {attributionComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {attributionComparison.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-400">{item.model}</span>
                  <span className="text-white ml-auto">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Model Accuracy Over Time</h3>
            <p className="text-sm text-gray-400 mb-4">
              Chronos AI learns from your actual conversion data
            </p>
            <div className="space-y-4">
              {[
                { model: 'Chronos AI', accuracy: 94, trend: '+3%' },
                { model: 'Time Decay', accuracy: 78, trend: '+1%' },
                { model: 'Linear', accuracy: 72, trend: '0%' },
                { model: 'Last Click', accuracy: 61, trend: '-2%' },
                { model: 'First Click', accuracy: 54, trend: '-1%' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{item.model}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${item.trend.startsWith('+') ? 'text-green-400' : item.trend.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>
                        {item.trend}
                      </span>
                      <span className="text-sm text-white font-medium">{item.accuracy}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-chronos-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        i === 0 ? 'bg-gradient-to-r from-chronos-500 to-purple-500' : 'bg-chronos-600'
                      }`}
                      style={{ width: `${item.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-200 font-medium">Why Chronos AI Wins</p>
                  <p className="text-xs text-blue-300/70 mt-1">
                    Unlike static models, Chronos AI continuously learns from your actual conversion data, 
                    accounting for cross-device journeys, time delays, and platform attribution gaps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveInsights;
