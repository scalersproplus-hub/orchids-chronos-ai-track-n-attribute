import React, { useState, useMemo } from 'react';
import { GitCompare, Calendar, BarChart3, Sliders, X, ArrowRight, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import { Campaign, AttributionModel } from '../../types';
import { MOCK_TIME_SERIES } from '../../services/mockData';

interface ComparisonModeProps {
  campaigns: Campaign[];
  isOpen: boolean;
  onClose: () => void;
}

type ComparisonType = 'period' | 'campaign' | 'model';

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

const PRESET_PERIODS: { label: string; getRanges: () => { a: DateRange; b: DateRange } }[] = [
  {
    label: 'This Week vs Last Week',
    getRanges: () => {
      const now = new Date();
      const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
      return {
        a: { start: thisWeekStart, end: new Date(), label: 'This Week' },
        b: { start: lastWeekStart, end: lastWeekEnd, label: 'Last Week' }
      };
    }
  },
  {
    label: 'This Month vs Last Month',
    getRanges: () => {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        a: { start: thisMonthStart, end: new Date(), label: 'This Month' },
        b: { start: lastMonthStart, end: lastMonthEnd, label: 'Last Month' }
      };
    }
  },
  {
    label: 'This Quarter vs Last Quarter',
    getRanges: () => {
      const now = new Date();
      const currentQ = Math.floor(now.getMonth() / 3);
      const thisQStart = new Date(now.getFullYear(), currentQ * 3, 1);
      const lastQStart = new Date(now.getFullYear(), (currentQ - 1) * 3, 1);
      const lastQEnd = new Date(now.getFullYear(), currentQ * 3, 0);
      return {
        a: { start: thisQStart, end: new Date(), label: `Q${currentQ + 1} ${now.getFullYear()}` },
        b: { start: lastQStart, end: lastQEnd, label: `Q${currentQ} ${now.getFullYear()}` }
      };
    }
  }
];

const ATTRIBUTION_MODELS: AttributionModel[] = ['Last-Click', 'First-Click', 'Linear', 'Time-Decay', 'U-Shaped'];

export const ComparisonMode: React.FC<ComparisonModeProps> = ({ campaigns, isOpen, onClose }) => {
  const [comparisonType, setComparisonType] = useState<ComparisonType>('period');
  const [selectedPeriodPreset, setSelectedPeriodPreset] = useState(0);
  const [campaignA, setCampaignA] = useState<string>(campaigns[0]?.id || '');
  const [campaignB, setCampaignB] = useState<string>(campaigns[1]?.id || '');
  const [modelA, setModelA] = useState<AttributionModel>('Last-Click');
  const [modelB, setModelB] = useState<AttributionModel>('Linear');

  // Calculate comparison data based on type
  const comparisonData = useMemo(() => {
    if (comparisonType === 'period') {
      const ranges = PRESET_PERIODS[selectedPeriodPreset].getRanges();
      // Simulate period data - in real app, filter by date
      const periodAData = {
        spend: 45000,
        revenue: 125000,
        roas: 2.78,
        conversions: 342
      };
      const periodBData = {
        spend: 38000,
        revenue: 98000,
        roas: 2.58,
        conversions: 285
      };
      return {
        labelA: ranges.a.label,
        labelB: ranges.b.label,
        dataA: periodAData,
        dataB: periodBData
      };
    } else if (comparisonType === 'campaign') {
      const campA = campaigns.find(c => c.id === campaignA);
      const campB = campaigns.find(c => c.id === campaignB);
      return {
        labelA: campA?.name || 'Campaign A',
        labelB: campB?.name || 'Campaign B',
        dataA: {
          spend: campA?.spend || 0,
          revenue: campA?.chronosTrackedSales || 0,
          roas: campA?.roas || 0,
          conversions: campA?.leads || 0
        },
        dataB: {
          spend: campB?.spend || 0,
          revenue: campB?.chronosTrackedSales || 0,
          roas: campB?.roas || 0,
          conversions: campB?.leads || 0
        }
      };
    } else {
      // Attribution model comparison - simulated data
      const getModelMultiplier = (model: AttributionModel) => {
        const multipliers: Record<AttributionModel, number> = {
          'Last-Click': 1,
          'First-Click': 0.85,
          'Linear': 0.92,
          'Time-Decay': 0.95,
          'U-Shaped': 0.88,
          'Custom': 1
        };
        return multipliers[model];
      };
      const baseRevenue = 125000;
      return {
        labelA: modelA,
        labelB: modelB,
        dataA: {
          spend: 45000,
          revenue: Math.round(baseRevenue * getModelMultiplier(modelA)),
          roas: Number((baseRevenue * getModelMultiplier(modelA) / 45000).toFixed(2)),
          conversions: Math.round(342 * getModelMultiplier(modelA))
        },
        dataB: {
          spend: 45000,
          revenue: Math.round(baseRevenue * getModelMultiplier(modelB)),
          roas: Number((baseRevenue * getModelMultiplier(modelB) / 45000).toFixed(2)),
          conversions: Math.round(342 * getModelMultiplier(modelB))
        }
      };
    }
  }, [comparisonType, selectedPeriodPreset, campaignA, campaignB, modelA, modelB, campaigns]);

  const calculateChange = (a: number, b: number) => {
    if (b === 0) return { value: 0, direction: 'neutral' as const };
    const change = ((a - b) / b) * 100;
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-chronos-900 border border-chronos-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-chronos-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-chronos-500/20 rounded-lg">
              <GitCompare className="w-5 h-5 text-chronos-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">Comparison Mode</h2>
              <p className="text-sm text-gray-500">Compare periods, campaigns, or attribution models</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-chronos-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Comparison Type Tabs */}
        <div className="flex border-b border-chronos-800 px-5">
          {[
            { id: 'period' as ComparisonType, icon: Calendar, label: 'Time Periods' },
            { id: 'campaign' as ComparisonType, icon: BarChart3, label: 'Campaigns' },
            { id: 'model' as ComparisonType, icon: Sliders, label: 'Attribution Models' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setComparisonType(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                comparisonType === tab.id
                  ? 'text-chronos-400 border-chronos-400'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Selection Controls */}
        <div className="p-5 border-b border-chronos-800 bg-chronos-950/50">
          {comparisonType === 'period' && (
            <div className="flex flex-wrap gap-2">
              {PRESET_PERIODS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPeriodPreset(idx)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    selectedPeriodPreset === idx
                      ? 'bg-chronos-500 text-white'
                      : 'bg-chronos-900 text-gray-400 hover:bg-chronos-800 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {comparisonType === 'campaign' && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Campaign A</label>
                <div className="relative">
                  <select
                    value={campaignA}
                    onChange={(e) => setCampaignA(e.target.value)}
                    className="w-full px-3 py-2 bg-chronos-900 border border-chronos-700 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-chronos-500"
                  >
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center justify-center w-10 h-10 bg-chronos-800 rounded-full flex-shrink-0 mt-4">
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Campaign B</label>
                <div className="relative">
                  <select
                    value={campaignB}
                    onChange={(e) => setCampaignB(e.target.value)}
                    className="w-full px-3 py-2 bg-chronos-900 border border-chronos-700 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-chronos-500"
                  >
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {comparisonType === 'model' && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Model A</label>
                <div className="relative">
                  <select
                    value={modelA}
                    onChange={(e) => setModelA(e.target.value as AttributionModel)}
                    className="w-full px-3 py-2 bg-chronos-900 border border-chronos-700 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-chronos-500"
                  >
                    {ATTRIBUTION_MODELS.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center justify-center w-10 h-10 bg-chronos-800 rounded-full flex-shrink-0 mt-4">
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Model B</label>
                <div className="relative">
                  <select
                    value={modelB}
                    onChange={(e) => setModelB(e.target.value as AttributionModel)}
                    className="w-full px-3 py-2 bg-chronos-900 border border-chronos-700 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-chronos-500"
                  >
                    {ATTRIBUTION_MODELS.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Results */}
        <div className="p-5 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Side A */}
            <div className="bg-chronos-950 border border-chronos-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-chronos-500" />
                <h3 className="font-semibold text-white">{comparisonData.labelA}</h3>
              </div>
              <div className="space-y-4">
                <MetricRow label="Spend" value={`$${comparisonData.dataA.spend.toLocaleString()}`} />
                <MetricRow label="Revenue" value={`$${comparisonData.dataA.revenue.toLocaleString()}`} />
                <MetricRow label="ROAS" value={`${comparisonData.dataA.roas}x`} />
                <MetricRow label="Conversions" value={comparisonData.dataA.conversions.toLocaleString()} />
              </div>
            </div>

            {/* Side B */}
            <div className="bg-chronos-950 border border-chronos-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <h3 className="font-semibold text-white">{comparisonData.labelB}</h3>
              </div>
              <div className="space-y-4">
                <MetricRow label="Spend" value={`$${comparisonData.dataB.spend.toLocaleString()}`} />
                <MetricRow label="Revenue" value={`$${comparisonData.dataB.revenue.toLocaleString()}`} />
                <MetricRow label="ROAS" value={`${comparisonData.dataB.roas}x`} />
                <MetricRow label="Conversions" value={comparisonData.dataB.conversions.toLocaleString()} />
              </div>
            </div>
          </div>

          {/* Change Summary */}
          <div className="mt-6 bg-chronos-950 border border-chronos-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4">Change Summary ({comparisonData.labelA} vs {comparisonData.labelB})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ChangeCard 
                label="Spend" 
                change={calculateChange(comparisonData.dataA.spend, comparisonData.dataB.spend)} 
              />
              <ChangeCard 
                label="Revenue" 
                change={calculateChange(comparisonData.dataA.revenue, comparisonData.dataB.revenue)} 
              />
              <ChangeCard 
                label="ROAS" 
                change={calculateChange(comparisonData.dataA.roas, comparisonData.dataB.roas)} 
              />
              <ChangeCard 
                label="Conversions" 
                change={calculateChange(comparisonData.dataA.conversions, comparisonData.dataB.conversions)} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className="text-white font-mono font-medium">{value}</span>
  </div>
);

const ChangeCard: React.FC<{ label: string; change: { value: number; direction: 'up' | 'down' | 'neutral' } }> = ({ label, change }) => {
  const Icon = change.direction === 'up' ? TrendingUp : change.direction === 'down' ? TrendingDown : Minus;
  const colorClass = change.direction === 'up' ? 'text-green-400' : change.direction === 'down' ? 'text-red-400' : 'text-gray-400';
  const bgClass = change.direction === 'up' ? 'bg-green-500/10' : change.direction === 'down' ? 'bg-red-500/10' : 'bg-gray-500/10';

  return (
    <div className={`p-3 rounded-lg ${bgClass}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span className="font-semibold">{change.value.toFixed(1)}%</span>
      </div>
    </div>
  );
};
