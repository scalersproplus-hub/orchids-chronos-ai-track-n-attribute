import React, { useState } from 'react';
import { 
  Shield, AlertTriangle, Bot, MousePointer, Globe, Wifi,
  Eye, CheckCircle, XCircle, Clock, TrendingUp, Filter,
  ChevronDown, BarChart3, Activity, Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface FraudSignal {
  id: string;
  type: 'bot' | 'click_fraud' | 'conversion_fraud' | 'datacenter' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  visitorId: string;
  description: string;
  evidence: string[];
  timestamp: string;
  status: 'pending' | 'confirmed' | 'dismissed';
  savingsImpact: number;
}

interface FraudMetrics {
  totalBlocked: number;
  savingsToday: number;
  botTrafficPercent: number;
  fraudConversions: number;
}

export const FraudDetection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  const metrics: FraudMetrics = {
    totalBlocked: 1247,
    savingsToday: 3420,
    botTrafficPercent: 8.3,
    fraudConversions: 23,
  };

  const signals: FraudSignal[] = [
    {
      id: 'fs_001',
      type: 'bot',
      severity: 'high',
      visitorId: 'fp_bot_detect_001',
      description: 'Automated bot detected with headless browser signature',
      evidence: [
        'Navigator.webdriver = true',
        'No mouse movement events',
        'Page load to click: 0.3s (abnormal)',
        'Known bot user agent pattern',
      ],
      timestamp: '2 minutes ago',
      status: 'confirmed',
      savingsImpact: 45,
    },
    {
      id: 'fs_002',
      type: 'click_fraud',
      severity: 'critical',
      visitorId: 'fp_click_farm_002',
      description: 'Click farm pattern: 47 clicks from same IP range in 5 minutes',
      evidence: [
        'IP range: 103.21.xxx.0/24 (known click farm)',
        '47 clicks in 5 minute window',
        'Zero scroll depth on landing pages',
        'Session duration < 2 seconds average',
      ],
      timestamp: '15 minutes ago',
      status: 'pending',
      savingsImpact: 234,
    },
    {
      id: 'fs_003',
      type: 'datacenter',
      severity: 'medium',
      visitorId: 'fp_dc_003',
      description: 'Traffic originating from known datacenter IP',
      evidence: [
        'IP: AWS us-east-1 datacenter',
        'No canvas fingerprint (headless)',
        'Timezone mismatch with IP location',
      ],
      timestamp: '1 hour ago',
      status: 'pending',
      savingsImpact: 12,
    },
    {
      id: 'fs_004',
      type: 'conversion_fraud',
      severity: 'critical',
      visitorId: 'fp_conv_fraud_004',
      description: 'Suspicious conversion pattern: Same device ID with multiple emails',
      evidence: [
        'Same fingerprint used 8 different email addresses',
        'All conversions within 24 hours',
        'Similar order values ($97-$103)',
        'Likely affiliate fraud or fake leads',
      ],
      timestamp: '3 hours ago',
      status: 'pending',
      savingsImpact: 776,
    },
    {
      id: 'fs_005',
      type: 'suspicious_pattern',
      severity: 'low',
      visitorId: 'fp_pattern_005',
      description: 'Unusual browsing pattern detected',
      evidence: [
        'Visited checkout page before product page',
        'Direct navigation to hidden URLs',
        'Possible scraper or competitor research',
      ],
      timestamp: '5 hours ago',
      status: 'dismissed',
      savingsImpact: 0,
    },
  ];

  // Fraud trend data
  const trendData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    blocked: Math.floor(20 + Math.random() * 80 + (i > 8 && i < 18 ? 50 : 0)),
    legitimate: Math.floor(200 + Math.random() * 300 + (i > 10 && i < 20 ? 200 : 0)),
  }));

  // Fraud by type
  const fraudByType = [
    { type: 'Bot Traffic', count: 542, color: '#ef4444' },
    { type: 'Click Fraud', count: 312, color: '#f59e0b' },
    { type: 'Datacenter IPs', count: 234, color: '#8b5cf6' },
    { type: 'Conversion Fraud', count: 89, color: '#ec4899' },
    { type: 'Suspicious Patterns', count: 70, color: '#6b7280' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bot': return <Bot className="w-5 h-5" />;
      case 'click_fraud': return <MousePointer className="w-5 h-5" />;
      case 'datacenter': return <Globe className="w-5 h-5" />;
      case 'conversion_fraud': return <AlertTriangle className="w-5 h-5" />;
      default: return <Eye className="w-5 h-5" />;
    }
  };

  const filteredSignals = signals.filter(s => 
    activeFilter === 'all' || s.status === activeFilter
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Fraud Detection</h1>
            <p className="text-gray-400 text-sm">Real-time protection against invalid traffic and click fraud</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Protection Active</span>
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Blocked Today</span>
            <Shield className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalBlocked.toLocaleString()}</div>
          <div className="text-xs text-red-400 mt-1">Invalid clicks/visits blocked</div>
        </div>

        <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Savings Today</span>
            <Zap className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">${metrics.savingsToday.toLocaleString()}</div>
          <div className="text-xs text-green-400 mt-1">Wasted ad spend prevented</div>
        </div>

        <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Bot Traffic</span>
            <Bot className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.botTrafficPercent}%</div>
          <div className="text-xs text-orange-400 mt-1">Of total traffic is bots</div>
        </div>

        <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Fraud Conversions</span>
            <AlertTriangle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.fraudConversions}</div>
          <div className="text-xs text-purple-400 mt-1">Fake conversions detected</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-chronos-900 border border-chronos-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Traffic Analysis (24h)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="legitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} interval={3} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Area type="monotone" dataKey="legitimate" stroke="#14b8a6" fill="url(#legitGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="blocked" stroke="#ef4444" fill="url(#blockedGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <span className="text-gray-400">Legitimate Traffic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-400">Blocked/Invalid</span>
            </div>
          </div>
        </div>

        <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Fraud by Type</h3>
          <div className="space-y-3">
            {fraudByType.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">{item.type}</span>
                  <span className="text-sm text-white font-medium">{item.count}</span>
                </div>
                <div className="h-2 bg-chronos-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${(item.count / fraudByType[0].count) * 100}%`,
                      backgroundColor: item.color 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm text-red-200 font-medium">High Risk Alert</p>
                <p className="text-xs text-red-300/70 mt-1">
                  Click fraud spike detected from Southeast Asia region. Consider geo-blocking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Signals */}
      <div className="bg-chronos-900 border border-chronos-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-chronos-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Fraud Signals</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                activeFilter === 'all' ? 'bg-chronos-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                activeFilter === 'pending' ? 'bg-chronos-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Pending Review
            </button>
            <button
              onClick={() => setActiveFilter('confirmed')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                activeFilter === 'confirmed' ? 'bg-chronos-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Confirmed
            </button>
          </div>
        </div>

        <div className="divide-y divide-chronos-800">
          {filteredSignals.map((signal) => (
            <div key={signal.id} className="p-4 hover:bg-chronos-800/30 transition-colors">
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedSignal(expandedSignal === signal.id ? null : signal.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getSeverityColor(signal.severity)}`}>
                    {getTypeIcon(signal.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{signal.description}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(signal.severity)}`}>
                        {signal.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {signal.timestamp}
                      </span>
                      <span>ID: {signal.visitorId.slice(0, 16)}...</span>
                      {signal.savingsImpact > 0 && (
                        <span className="text-green-400">Saved ${signal.savingsImpact}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {signal.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-green-500/20 rounded-lg transition-colors">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </button>
                      <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                        <XCircle className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  )}
                  {signal.status === 'confirmed' && (
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">Confirmed</span>
                  )}
                  {signal.status === 'dismissed' && (
                    <span className="text-xs text-gray-400 bg-gray-500/10 px-2 py-1 rounded">Dismissed</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedSignal === signal.id ? 'rotate-180' : ''
                  }`} />
                </div>
              </div>

              {expandedSignal === signal.id && (
                <div className="mt-4 ml-14 p-4 bg-chronos-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Evidence</h4>
                  <ul className="space-y-1">
                    {signal.evidence.map((ev, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                        <span className="text-chronos-400 mt-1">•</span>
                        {ev}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FraudDetection;
