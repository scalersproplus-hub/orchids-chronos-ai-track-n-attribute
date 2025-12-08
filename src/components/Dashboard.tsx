import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Target, DollarSign, BrainCircuit, AlertTriangle, Lightbulb, ChevronDown, CheckCircle, BarChart2 } from 'lucide-react';
import { Campaign, AnalysisStatus, AIInsight, TimeSeriesData, Anomaly, AdSet } from '../types';
import { analyzeCampaignPerformance, detectAnomalies, getBudgetSuggestions } from '../services/geminiService';
import { MOCK_TIME_SERIES, MOCK_CAMPAIGNS } from '../services/mockData';
import { SkeletonLoader } from './common/SkeletonLoader';

interface DashboardProps {
  campaigns: Campaign[];
}

type PlatformFilter = 'All' | 'Facebook' | 'Google' | 'TikTok';

export const Dashboard: React.FC<DashboardProps> = ({ campaigns: initialCampaigns }) => {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [budgetSuggestion, setBudgetSuggestion] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('All');
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const detectedAnomalies = await detectAnomalies(MOCK_CAMPAIGNS);
      const suggestion = await getBudgetSuggestions(MOCK_CAMPAIGNS);
      setAnomalies(detectedAnomalies);
      setBudgetSuggestion(suggestion);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredCampaigns = initialCampaigns.filter(c => 
    platformFilter === 'All' || c.platform === platformFilter
  );

  const totalSpend = filteredCampaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalTrueRev = filteredCampaigns.reduce((acc, c) => acc + c.chronosTrackedSales, 0);
  const trueRoas = totalSpend > 0 ? totalTrueRev / totalSpend : 0;

  const toggleExpandCampaign = (campaignId: string) => {
    setExpandedCampaign(prev => (prev === campaignId ? null : campaignId));
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonLoader key={i} className="h-40 rounded-xl" />) :
        <>
          <MetricCard title="Total Ad Spend" value={`$${totalSpend.toLocaleString()}`} icon={DollarSign} />
          <MetricCard title="True Revenue" value={`$${totalTrueRev.toLocaleString()}`} icon={TrendingUp} highlight />
          <MetricCard title="True ROAS" value={`${trueRoas.toFixed(2)}x`} icon={Target} />
          <MetricCard title="Lost Revenue Found" value={`$${(totalTrueRev - filteredCampaigns.reduce((a,c) => a + c.platformReportedSales, 0)).toLocaleString()}`} icon={BrainCircuit} color="text-chronos-accent" />
        </>
        }
      </div>

      {/* Main Content Area: Chart & AI Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-chronos-900 border border-chronos-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">30-Day Performance Trend</h3>
          {loading ? <SkeletonLoader className="h-[350px] w-full" /> : 
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_TIME_SERIES} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2} dot={false} name="Spend"/>
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          }
        </div>

        <div className="space-y-4">
          <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-3"><AlertTriangle className="text-yellow-400 w-5 h-5" /> AI Anomaly Alerts</h3>
            {loading ? <SkeletonLoader className="h-20 w-full" /> :
              <div className="space-y-3">
                {anomalies.map(a => <div key={a.id} className="text-xs p-2 bg-chronos-950 rounded border border-chronos-800">{a.description}</div>)}
              </div>
            }
          </div>
          <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-3"><Lightbulb className="text-chronos-accent w-5 h-5" /> AI Budget Suggestion</h3>
            {loading ? <SkeletonLoader className="h-16 w-full" /> : <p className="text-xs text-gray-300 leading-relaxed">{budgetSuggestion}</p>}
          </div>
        </div>
      </div>

      {/* Campaign Data Table */}
      <div className="bg-chronos-900 border border-chronos-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-chronos-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {(['All', 'Facebook', 'Google', 'TikTok'] as PlatformFilter[]).map(p => (
                <button key={p} onClick={() => setPlatformFilter(p)} className={`px-3 py-1 text-sm rounded-md ${platformFilter === p ? 'bg-chronos-800 text-white' : 'text-gray-400 hover:bg-chronos-800/50'}`}>{p}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-chronos-950 text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-3 w-1/3">Campaign Name</th>
                <th className="px-6 py-3 text-right">Spend</th>
                <th className="px-6 py-3 text-right">Tracked Rev.</th>
                <th className="px-6 py-3 text-right">True ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chronos-800">
              {filteredCampaigns.map(campaign => (
                <React.Fragment key={campaign.id}>
                  <tr onClick={() => campaign.adSets && toggleExpandCampaign(campaign.id)} className={`hover:bg-chronos-800/30 transition-colors group ${campaign.adSets ? 'cursor-pointer' : ''}`}>
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">{campaign.adSets && <ChevronDown className={`w-4 h-4 transition-transform ${expandedCampaign === campaign.id ? 'rotate-180' : ''}`} />} {campaign.name}</td>
                    <td className="px-6 py-4 text-right text-gray-300">${campaign.spend.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-chronos-400">${campaign.chronosTrackedSales.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right"><span className={`font-mono ${campaign.roas > 2 ? 'text-green-400' : 'text-yellow-400'}`}>{campaign.roas.toFixed(2)}x</span></td>
                  </tr>
                  {expandedCampaign === campaign.id && campaign.adSets && (
                    <tr className="bg-chronos-950/50">
                        <td colSpan={4} className="p-0">
                            <div className="px-10 py-4">
                                <AdSetTable adSets={campaign.adSets} />
                            </div>
                        </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdSetTable: React.FC<{adSets: AdSet[]}> = ({ adSets }) => (
    <table className="w-full text-xs">
        <thead>
            <tr className="text-gray-500">
                <th className="py-2 text-left font-medium flex items-center gap-2"><BarChart2 className="w-3 h-3"/>Ad Set Name</th>
                <th className="py-2 text-right font-medium">Spend</th>
                <th className="py-2 text-right font-medium">Revenue</th>
                <th className="py-2 text-right font-medium">ROAS</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-chronos-800/50">
            {adSets.map(adSet => (
                <tr key={adSet.id}>
                    <td className="py-2 text-gray-300">{adSet.name}</td>
                    <td className="py-2 text-right text-gray-400">${adSet.spend.toLocaleString()}</td>
                    <td className="py-2 text-right text-chronos-400">${adSet.chronosTrackedSales.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono">{adSet.roas.toFixed(2)}x</td>
                </tr>
            ))}
        </tbody>
    </table>
);


const MetricCard = ({ title, value, icon: Icon, highlight, color }: any) => (
  <div className={`p-6 rounded-xl border flex flex-col justify-between ${highlight ? 'bg-chronos-900/80 border-chronos-500' : 'bg-chronos-900 border-chronos-800'}`}>
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-400">{title}</h4>
        <div className={`text-2xl font-bold font-mono tracking-tight ${color ? color : 'text-white'}`}>{value}</div>
      </div>
      <div className={`p-2 rounded-lg ${highlight ? 'bg-chronos-500/20' : 'bg-chronos-950'}`}>
        <Icon className={`w-5 h-5 ${color ? color : highlight ? 'text-chronos-400' : 'text-gray-400'}`} />
      </div>
    </div>
  </div>
);
