import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Target, DollarSign, BrainCircuit, AlertTriangle, Lightbulb, ChevronDown, CheckCircle, BarChart2, Download, FileSpreadsheet, FileJson, GitCompare } from 'lucide-react';
import { Campaign, AnalysisStatus, AIInsight, TimeSeriesData, Anomaly, AdSet, SavedView } from '../types';
import { analyzeCampaignPerformance, detectAnomalies, getBudgetSuggestions } from '../services/geminiService';
import { MOCK_TIME_SERIES, MOCK_CAMPAIGNS } from '../services/mockData';
import { SkeletonLoader } from './common/SkeletonLoader';
import { DateRangePicker } from './common/DateRangePicker';
import { SavedViews } from './common/SavedViews';
import { ComparisonMode } from './common/ComparisonMode';
import { InlineEditText, InlineEditNumber, InlineEditTags } from './common/InlineEdit';
import { useApp } from '../contexts/AppContext';

interface DashboardProps {
  campaigns: Campaign[];
}

type PlatformFilter = 'All' | 'Facebook' | 'Google' | 'TikTok';
type StatusFilter = 'Active' | 'Paused' | 'All';

type DateRange = {
  start: Date | null;
  end: Date | null;
};

// Export dropdown component
const ExportDropdown: React.FC<{ campaigns: Campaign[]; timeSeriesData: TimeSeriesData[] }> = ({ campaigns, timeSeriesData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { addToast } = useApp();

  const exportToCSV = () => {
    const headers = ['Campaign Name', 'Platform', 'Status', 'Spend', 'Platform Reported Sales', 'Tracked Sales', 'ROAS'];
    const rows = campaigns.map(c => [
      c.name,
      c.platform,
      c.status,
      c.spend,
      c.platformReportedSales,
      c.chronosTrackedSales,
      c.roas.toFixed(2)
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, 'chronos-campaigns.csv', 'text/csv');
    addToast({ type: 'success', message: 'Campaign data exported to CSV' });
    setIsOpen(false);
  };

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      campaigns: campaigns.map(c => ({
        name: c.name,
        platform: c.platform,
        status: c.status,
        spend: c.spend,
        platformReportedSales: c.platformReportedSales,
        trackedSales: c.chronosTrackedSales,
        roas: c.roas
      })),
      timeSeries: timeSeriesData
    };
    
    downloadFile(JSON.stringify(data, null, 2), 'chronos-data.json', 'application/json');
    addToast({ type: 'success', message: 'Data exported to JSON' });
    setIsOpen(false);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-chronos-900 border border-chronos-800 rounded-lg text-sm text-gray-300 hover:border-chronos-600 hover:text-white transition-all"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-48 bg-chronos-900 border border-chronos-800 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={exportToCSV}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-300 hover:bg-chronos-800 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-400" />
              Export as CSV
            </button>
            <button
              onClick={exportToJSON}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-300 hover:bg-chronos-800 hover:text-white transition-colors"
            >
              <FileJson className="w-4 h-4 text-yellow-400" />
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ campaigns: initialCampaigns }) => {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [budgetSuggestion, setBudgetSuggestion] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [campaignTags, setCampaignTags] = useState<Record<string, string[]>>({});
  const { addToast } = useApp();

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

  const filteredCampaigns = campaigns.filter(c => 
    (platformFilter === 'All' || c.platform === platformFilter) &&
    (statusFilter === 'All' || c.status === statusFilter)
  );

  const totalSpend = filteredCampaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalTrueRev = filteredCampaigns.reduce((acc, c) => acc + c.chronosTrackedSales, 0);
  const trueRoas = totalSpend > 0 ? totalTrueRev / totalSpend : 0;

  const toggleExpandCampaign = (campaignId: string) => {
    setExpandedCampaign(prev => (prev === campaignId ? null : campaignId));
  };

  // Apply saved view filters
  const handleApplySavedView = (filters: SavedView['filters']) => {
    setPlatformFilter(filters.platform);
    if (filters.status) {
      setStatusFilter(filters.status);
    }
    if (filters.dateRange.start && filters.dateRange.end) {
      setDateRange({
        start: new Date(filters.dateRange.start),
        end: new Date(filters.dateRange.end)
      });
    }
  };

  // Inline edit handlers
  const handleUpdateCampaignName = (campaignId: string, newName: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId ? { ...c, name: newName } : c
    ));
    addToast({ type: 'success', message: 'Campaign name updated' });
  };

  const handleUpdateCampaignSpend = (campaignId: string, newSpend: number) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId ? { ...c, spend: newSpend, roas: c.chronosTrackedSales / newSpend } : c
    ));
    addToast({ type: 'success', message: 'Budget updated' });
  };

  const handleUpdateCampaignTags = (campaignId: string, newTags: string[]) => {
    setCampaignTags(prev => ({ ...prev, [campaignId]: newTags }));
    addToast({ type: 'success', message: 'Tags updated' });
  };

  return (
    <div className="space-y-6">
      {/* Saved Views & Quick Filters */}
      <SavedViews 
        currentFilters={{ platform: platformFilter, dateRange, status: statusFilter }}
        onApplyView={handleApplySavedView}
      />

      {/* Dashboard Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Facebook', 'Google', 'TikTok'] as PlatformFilter[]).map(p => (
            <button 
              key={p} 
              onClick={() => setPlatformFilter(p)} 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                platformFilter === p 
                  ? 'bg-chronos-500 text-white' 
                  : 'bg-chronos-900 text-gray-400 hover:bg-chronos-800 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
          <div className="w-px h-6 bg-chronos-800 mx-1 hidden sm:block" />
          {(['All', 'Active', 'Paused'] as StatusFilter[]).map(s => (
            <button 
              key={s} 
              onClick={() => setStatusFilter(s)} 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === s 
                  ? 'bg-chronos-500 text-white' 
                  : 'bg-chronos-900 text-gray-400 hover:bg-chronos-800 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsComparisonOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-chronos-900 border border-chronos-800 rounded-lg text-sm text-gray-300 hover:border-chronos-600 hover:text-white transition-all"
          >
            <GitCompare className="w-4 h-4" />
            <span className="hidden sm:inline">Compare</span>
          </button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportDropdown campaigns={filteredCampaigns} timeSeriesData={MOCK_TIME_SERIES} />
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonLoader key={i} className="h-32 sm:h-40 rounded-xl" />) :
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
        <div className="lg:col-span-2 bg-chronos-900 border border-chronos-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-6">30-Day Performance Trend</h3>
          {loading ? <SkeletonLoader className="h-[250px] sm:h-[350px] w-full" /> : 
            <div className="h-[250px] sm:h-[350px] w-full">
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
          <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-4 sm:p-5">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-3"><AlertTriangle className="text-yellow-400 w-5 h-5" /> AI Anomaly Alerts</h3>
            {loading ? <SkeletonLoader className="h-20 w-full" /> :
              <div className="space-y-3">
                {anomalies.map(a => <div key={a.id} className="text-xs p-2 bg-chronos-950 rounded border border-chronos-800">{a.description}</div>)}
              </div>
            }
          </div>
          <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-4 sm:p-5">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-3"><Lightbulb className="text-chronos-accent w-5 h-5" /> AI Budget Suggestion</h3>
            {loading ? <SkeletonLoader className="h-16 w-full" /> : <p className="text-xs text-gray-300 leading-relaxed">{budgetSuggestion}</p>}
          </div>
        </div>
      </div>

      {/* Campaign Data Table with Inline Editing */}
      <div className="bg-chronos-900 border border-chronos-800 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-chronos-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Campaign Performance</h3>
            <p className="text-xs text-gray-500 hidden sm:block">Double-click to edit names, budgets, or tags</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-chronos-950 text-gray-400 font-medium">
              <tr>
                <th className="px-4 sm:px-6 py-3">Campaign Name</th>
                <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Tags</th>
                <th className="px-4 sm:px-6 py-3 text-right hidden sm:table-cell">Budget</th>
                <th className="px-4 sm:px-6 py-3 text-right">Tracked Rev.</th>
                <th className="px-4 sm:px-6 py-3 text-right">True ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chronos-800">
              {filteredCampaigns.map(campaign => (
                <React.Fragment key={campaign.id}>
                  <tr onClick={() => campaign.adSets && toggleExpandCampaign(campaign.id)} className={`hover:bg-chronos-800/30 transition-colors group ${campaign.adSets ? 'cursor-pointer' : ''}`}>
                    <td className="px-4 sm:px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        {campaign.adSets && <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${expandedCampaign === campaign.id ? 'rotate-180' : ''}`} />}
                        <InlineEditText
                          value={campaign.name}
                          onSave={(newName) => handleUpdateCampaignName(campaign.id, newName)}
                          className="min-w-[150px]"
                        />
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      <InlineEditTags
                        tags={campaignTags[campaign.id] || []}
                        onSave={(newTags) => handleUpdateCampaignTags(campaign.id, newTags)}
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right text-gray-300 hidden sm:table-cell">
                      <InlineEditNumber
                        value={campaign.spend}
                        onSave={(newSpend) => handleUpdateCampaignSpend(campaign.id, newSpend)}
                        prefix="$"
                        min={0}
                        step={100}
                        className="justify-end"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right font-bold text-chronos-400">${campaign.chronosTrackedSales.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-4 text-right"><span className={`font-mono ${campaign.roas > 2 ? 'text-green-400' : 'text-yellow-400'}`}>{campaign.roas.toFixed(2)}x</span></td>
                  </tr>
                  {expandedCampaign === campaign.id && campaign.adSets && (
                    <tr className="bg-chronos-950/50">
                        <td colSpan={5} className="p-0">
                            <div className="px-6 sm:px-10 py-4">
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

      {/* Comparison Mode Modal */}
      <ComparisonMode 
        campaigns={campaigns}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />
    </div>
  );
};

const AdSetTable: React.FC<{adSets: AdSet[]}> = ({ adSets }) => (
    <table className="w-full text-xs">
        <thead>
            <tr className="text-gray-500">
                <th className="py-2 text-left font-medium flex items-center gap-2"><BarChart2 className="w-3 h-3"/>Ad Set Name</th>
                <th className="py-2 text-right font-medium hidden sm:table-cell">Spend</th>
                <th className="py-2 text-right font-medium">Revenue</th>
                <th className="py-2 text-right font-medium">ROAS</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-chronos-800/50">
            {adSets.map(adSet => (
                <tr key={adSet.id}>
                    <td className="py-2 text-gray-300">{adSet.name}</td>
                    <td className="py-2 text-right text-gray-400 hidden sm:table-cell">${adSet.spend.toLocaleString()}</td>
                    <td className="py-2 text-right text-chronos-400">${adSet.chronosTrackedSales.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono">{adSet.roas.toFixed(2)}x</td>
                </tr>
            ))}
        </tbody>
    </table>
);


const MetricCard = ({ title, value, icon: Icon, highlight, color }: any) => (
  <div className={`p-4 sm:p-6 rounded-xl border flex flex-col justify-between ${highlight ? 'bg-chronos-900/80 border-chronos-500' : 'bg-chronos-900 border-chronos-800'}`}>
    <div className="flex justify-between items-start">
      <div className="space-y-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-medium text-gray-400 truncate">{title}</h4>
        <div className={`text-lg sm:text-2xl font-bold font-mono tracking-tight ${color ? color : 'text-white'}`}>{value}</div>
      </div>
      <div className={`p-2 rounded-lg flex-shrink-0 ${highlight ? 'bg-chronos-500/20' : 'bg-chronos-950'}`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color ? color : highlight ? 'text-chronos-400' : 'text-gray-400'}`} />
      </div>
    </div>
  </div>
);