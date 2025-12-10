import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, Target, DollarSign, BrainCircuit, AlertTriangle, Lightbulb, ChevronDown, CheckCircle, BarChart2, Download, FileSpreadsheet, FileJson, GitCompare, Sparkles, Zap, ArrowUpRight, Rocket, PlayCircle } from 'lucide-react';
import { Campaign, AnalysisStatus, AIInsight, TimeSeriesData, Anomaly, AdSet, SavedView } from '../types';
import { analyzeCampaignPerformance, detectAnomalies, getBudgetSuggestions } from '../services/geminiService';
import { DEMO_TIME_SERIES, DEMO_CAMPAIGNS, isDemoMode } from '../services/mockData';
import { SkeletonLoader } from './common/SkeletonLoader';
import { DateRangePicker } from './common/DateRangePicker';
import { SavedViews } from './common/SavedViews';
import { ComparisonMode } from './common/ComparisonMode';
import { InlineEditText, InlineEditNumber, InlineEditTags } from './common/InlineEdit';
import { AnimatedMetricCard } from './common/AnimatedMetricCard';
import { StaggerContainer, StaggerItem } from './common/AnimatedBackground';
import { WelcomeBanner } from './common/WelcomeBanner';
import { useApp } from '../contexts/AppContext';

interface DashboardProps {
  campaigns: Campaign[];
  isDemo?: boolean;
}

type PlatformFilter = 'All' | 'Facebook' | 'Google' | 'TikTok';
type StatusFilter = 'Active' | 'Paused' | 'All';

type DateRange = {
  start: Date | null;
  end: Date | null;
};

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
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 glass glass-hover rounded-xl text-sm text-gray-300 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              className="absolute top-full right-0 mt-2 w-52 glass rounded-xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              style={{ border: '1px solid hsl(270 91% 65% / 0.2)' }}
            >
              <motion.button
                onClick={exportToCSV}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm text-gray-300 hover:bg-[hsl(270_91%_65%_/_0.1)] hover:text-white transition-colors"
                whileHover={{ x: 4 }}
              >
                <FileSpreadsheet className="w-4 h-4 text-[hsl(150_80%_50%)]" />
                Export as CSV
              </motion.button>
              <motion.button
                onClick={exportToJSON}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm text-gray-300 hover:bg-[hsl(270_91%_65%_/_0.1)] hover:text-white transition-colors"
                whileHover={{ x: 4 }}
              >
                <FileJson className="w-4 h-4 text-[hsl(40_95%_55%)]" />
                Export as JSON
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        className="glass p-4 rounded-xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ border: '1px solid hsl(270 91% 65% / 0.2)' }}
      >
        <p className="text-sm font-semibold text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-400">{entry.name}:</span>
            <span className="font-mono font-semibold text-white">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

const EmptyDashboard: React.FC<{ onEnableDemo: () => void }> = ({ onEnableDemo }) => {
  const { setCurrentView } = useApp();
  
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
        style={{ 
          background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.2), hsl(320 80% 60% / 0.1))',
          border: '1px solid hsl(270 91% 65% / 0.3)'
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Rocket className="w-12 h-12 text-[hsl(270_91%_75%)]" />
      </motion.div>
      
      <h2 className="text-2xl font-bold text-white mb-3 text-center heading">
        Ready to Track Your Ads
      </h2>
      <p className="text-gray-400 text-center max-w-md mb-8">
        Connect your ad platforms or try demo mode to see how Chronos AI reveals the true performance of your campaigns.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          onClick={() => setCurrentView('setup')}
          className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 text-white"
          style={{
            background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))',
            boxShadow: '0 8px 32px hsl(270 91% 65% / 0.3)'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="w-5 h-5" />
          Start Setup
        </motion.button>
        
        <motion.button
          onClick={onEnableDemo}
          className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
          style={{
            background: 'linear-gradient(135deg, hsl(170 80% 45% / 0.15), hsl(150 80% 50% / 0.1))',
            border: '1px solid hsl(170 80% 50% / 0.3)',
            color: 'hsl(170 80% 55%)'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlayCircle className="w-5 h-5" />
          Try Demo Mode
        </motion.button>
      </div>
      
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <div className="glass p-4 rounded-xl text-center" style={{ border: '1px solid hsl(270 91% 65% / 0.1)' }}>
          <div className="text-2xl font-bold text-[hsl(270_91%_75%)] mb-1">20-40%</div>
          <div className="text-xs text-gray-500">More conversions tracked</div>
        </div>
        <div className="glass p-4 rounded-xl text-center" style={{ border: '1px solid hsl(170 80% 50% / 0.1)' }}>
          <div className="text-2xl font-bold text-[hsl(170_80%_55%)] mb-1">iOS 14.5+</div>
          <div className="text-xs text-gray-500">Tracking compatible</div>
        </div>
        <div className="glass p-4 rounded-xl text-center" style={{ border: '1px solid hsl(40 95% 55% / 0.1)' }}>
          <div className="text-2xl font-bold text-[hsl(40_95%_60%)] mb-1">2 min</div>
          <div className="text-xs text-gray-500">Setup time</div>
        </div>
      </div>
    </motion.div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ campaigns: initialCampaigns, isDemo = false }) => {
  const { state, updateAccount, addToast } = useApp();
  const { currentAccount } = state;
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

  const timeSeriesData = isDemo ? DEMO_TIME_SERIES : [];

  const handleEnableDemo = () => {
    const demoAccount = {
      ...currentAccount,
      name: 'Demo Workspace',
      websiteUrl: 'https://demo-store.com',
    };
    updateAccount(demoAccount);
    addToast({ type: 'success', message: 'Demo mode enabled! Explore with sample data.' });
  };

  useEffect(() => {
    setCampaigns(initialCampaigns);
  }, [initialCampaigns]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (campaigns.length > 0) {
        const detectedAnomalies = await detectAnomalies(campaigns);
        const suggestion = await getBudgetSuggestions(campaigns);
        setAnomalies(detectedAnomalies);
        setBudgetSuggestion(suggestion);
      } else {
        setAnomalies([]);
        setBudgetSuggestion('Connect your ad platforms to receive AI-powered budget recommendations.');
      }
      setLoading(false);
    };
    fetchData();
  }, [campaigns]);

  const filteredCampaigns = campaigns.filter(c => 
    (platformFilter === 'All' || c.platform === platformFilter) &&
    (statusFilter === 'All' || c.status === statusFilter)
  );

  const totalSpend = filteredCampaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalTrueRev = filteredCampaigns.reduce((acc, c) => acc + c.chronosTrackedSales, 0);
  const trueRoas = totalSpend > 0 ? totalTrueRev / totalSpend : 0;
  const lostRevenue = totalTrueRev - filteredCampaigns.reduce((a,c) => a + c.platformReportedSales, 0);

  const toggleExpandCampaign = (campaignId: string) => {
    setExpandedCampaign(prev => (prev === campaignId ? null : campaignId));
  };

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

  if (initialCampaigns.length === 0 && !isDemo) {
    return (
      <div className="space-y-8">
        <WelcomeBanner />
        <EmptyDashboard onEnableDemo={handleEnableDemo} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WelcomeBanner />
      
      <SavedViews 
        currentFilters={{ platform: platformFilter, dateRange, status: statusFilter }}
        onApplyView={handleApplySavedView}
      />

      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Facebook', 'Google', 'TikTok'] as PlatformFilter[]).map((p, i) => (
            <motion.button 
              key={p} 
              onClick={() => setPlatformFilter(p)} 
              className={`px-4 py-2 text-sm rounded-xl transition-all ${
                platformFilter === p 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{
                background: platformFilter === p 
                  ? 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))' 
                  : 'hsl(230 20% 12%)',
                boxShadow: platformFilter === p 
                  ? '0 4px 20px hsl(270 91% 65% / 0.3)' 
                  : 'none',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {p}
            </motion.button>
          ))}
          <div className="w-px h-6 bg-[hsl(270_91%_65%_/_0.2)] mx-2 hidden sm:block" />
          {(['All', 'Active', 'Paused'] as StatusFilter[]).map((s, i) => (
            <motion.button 
              key={s} 
              onClick={() => setStatusFilter(s)} 
              className={`px-4 py-2 text-sm rounded-xl transition-all ${
                statusFilter === s 
                  ? 'bg-[hsl(170_80%_50%)] text-white' 
                  : 'bg-chronos-900 text-gray-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              {s}
            </motion.button>
          ))}
        </div>
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => setIsComparisonOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 glass glass-hover rounded-xl text-sm text-gray-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GitCompare className="w-4 h-4" />
            <span className="hidden sm:inline">Compare</span>
          </motion.button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportDropdown campaigns={filteredCampaigns} timeSeriesData={timeSeriesData} />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-40 rounded-2xl glass"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          ))
        ) : (
          <>
            <AnimatedMetricCard
              title="Total Ad Spend"
              value={`$${totalSpend.toLocaleString()}`}
              icon={DollarSign}
              trend={{ value: 12.5, isPositive: false }}
              sparkData={[65, 59, 80, 81, 56, 55, 40, 45, 50, 48]}
              color="warning"
              delay={0}
            />
            <AnimatedMetricCard
              title="True Revenue"
              value={`$${totalTrueRev.toLocaleString()}`}
              icon={TrendingUp}
              trend={{ value: 24.3, isPositive: true }}
              sparkData={[40, 55, 45, 60, 50, 70, 65, 80, 75, 95]}
              color="success"
              delay={0.1}
            />
            <AnimatedMetricCard
              title="True ROAS"
              value={`${trueRoas.toFixed(2)}x`}
              icon={Target}
              trend={{ value: 8.7, isPositive: true }}
              sparkData={[30, 40, 35, 50, 49, 60, 70, 91, 85, 88]}
              color="primary"
              delay={0.2}
            />
            <AnimatedMetricCard
              title="Lost Revenue Found"
              value={`$${lostRevenue.toLocaleString()}`}
              icon={BrainCircuit}
              trend={{ value: 32.1, isPositive: true }}
              sparkData={[20, 30, 40, 45, 55, 60, 75, 85, 90, 100]}
              color="accent"
              delay={0.3}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ border: '1px solid hsl(270 91% 65% / 0.1)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[hsl(270_91%_75%)]" />
              30-Day Performance
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[hsl(0_80%_55%)] to-[hsl(25_95%_55%)]" />
                <span className="text-gray-400">Spend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[hsl(270_91%_65%)] to-[hsl(170_80%_50%)]" />
                <span className="text-gray-400">Revenue</span>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="h-[300px] w-full glass rounded-xl animate-pulse" />
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0 80% 55%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(0 80% 55%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(270 91% 65%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(270 91% 65%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 15%)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(230 12% 40%)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(230 12% 40%)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="hsl(0 80% 55%)"
                    strokeWidth={2}
                    fill="url(#spendGradient)"
                    name="Spend"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(270 91% 65%)"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <div className="space-y-4">
          <motion.div 
            className="glass rounded-2xl p-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            style={{ border: '1px solid hsl(40 95% 55% / 0.2)' }}
          >
            <h3 className="text-base font-bold text-white heading flex items-center gap-2 mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertTriangle className="text-[hsl(40_95%_55%)] w-5 h-5" />
              </motion.div>
              AI Anomaly Alerts
            </h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 glass rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {anomalies.map((a, i) => (
                  <motion.div 
                    key={a.id} 
                    className="text-sm p-3 glass rounded-xl text-gray-300"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    whileHover={{ x: 4, borderColor: 'hsl(40 95% 55% / 0.3)' }}
                    style={{ border: '1px solid hsl(230 20% 15%)' }}
                  >
                    {a.description}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
          
          <motion.div 
            className="glass rounded-2xl p-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            style={{ border: '1px solid hsl(270 91% 65% / 0.2)' }}
          >
            <h3 className="text-base font-bold text-white heading flex items-center gap-2 mb-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lightbulb className="text-[hsl(270_91%_75%)] w-5 h-5" />
              </motion.div>
              AI Budget Suggestion
            </h3>
            {loading ? (
              <div className="h-20 glass rounded-xl animate-pulse" />
            ) : (
              <motion.p 
                className="text-sm text-gray-300 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {budgetSuggestion}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div 
        className="glass rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ border: '1px solid hsl(270 91% 65% / 0.1)' }}
      >
        <div className="px-6 py-5 border-b border-[hsl(270_91%_65%_/_0.1)]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white heading flex items-center gap-2">
              <Zap className="w-5 h-5 text-[hsl(170_80%_50%)]" />
              Campaign Performance
            </h3>
            <p className="text-xs text-gray-500 hidden sm:block">Double-click to edit • Hover for details</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[hsl(230_25%_6%)] text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4 hidden md:table-cell">Tags</th>
                <th className="px-6 py-4 text-right hidden sm:table-cell">Budget</th>
                <th className="px-6 py-4 text-right">Tracked Rev.</th>
                <th className="px-6 py-4 text-right">True ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(230_20%_12%)]">
              {filteredCampaigns.map((campaign, index) => (
                <React.Fragment key={campaign.id}>
                  <motion.tr 
                    onClick={() => campaign.adSets && toggleExpandCampaign(campaign.id)} 
                    className={`hover:bg-[hsl(270_91%_65%_/_0.05)] transition-colors group ${campaign.adSets ? 'cursor-pointer' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    whileHover={{ backgroundColor: 'hsl(270 91% 65% / 0.05)' }}
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-3">
                        {campaign.adSets && (
                          <motion.div
                            animate={{ rotate: expandedCampaign === campaign.id ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </motion.div>
                        )}
                        <InlineEditText
                          value={campaign.name}
                          onSave={(newName) => handleUpdateCampaignName(campaign.id, newName)}
                          className="min-w-[150px]"
                        />
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          campaign.platform === 'Facebook' 
                            ? 'bg-[hsl(220_80%_50%_/_0.2)] text-[hsl(220_80%_60%)] border border-[hsl(220_80%_50%_/_0.3)]' 
                            : campaign.platform === 'Google'
                            ? 'bg-[hsl(0_80%_55%_/_0.2)] text-[hsl(0_80%_65%)] border border-[hsl(0_80%_55%_/_0.3)]'
                            : 'bg-[hsl(170_80%_50%_/_0.2)] text-[hsl(170_80%_55%)] border border-[hsl(170_80%_50%_/_0.3)]'
                        }`}>
                          {campaign.platform}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <InlineEditTags
                        tags={campaignTags[campaign.id] || []}
                        onSave={(newTags) => handleUpdateCampaignTags(campaign.id, newTags)}
                      />
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 hidden sm:table-cell">
                      <InlineEditNumber
                        value={campaign.spend}
                        onSave={(newSpend) => handleUpdateCampaignSpend(campaign.id, newSpend)}
                        prefix="$"
                        min={0}
                        step={100}
                        className="justify-end"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-bold text-[hsl(170_80%_50%)]">
                        ${campaign.chronosTrackedSales.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-mono font-bold px-2 py-1 rounded-lg ${
                        campaign.roas > 2 
                          ? 'text-[hsl(150_80%_50%)] bg-[hsl(150_80%_45%_/_0.1)]' 
                          : 'text-[hsl(40_95%_55%)] bg-[hsl(40_95%_55%_/_0.1)]'
                      }`}>
                        {campaign.roas.toFixed(2)}x
                      </span>
                    </td>
                  </motion.tr>
                  <AnimatePresence>
                    {expandedCampaign === campaign.id && campaign.adSets && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[hsl(230_25%_5%)]"
                      >
                        <td colSpan={5} className="p-0">
                          <motion.div 
                            className="px-10 py-4"
                            initial={{ y: -10 }}
                            animate={{ y: 0 }}
                          >
                            <AdSetTable adSets={campaign.adSets} />
                          </motion.div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

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
        <th className="py-2 text-left font-medium flex items-center gap-2">
          <BarChart2 className="w-3 h-3" />Ad Set Name
        </th>
        <th className="py-2 text-right font-medium hidden sm:table-cell">Spend</th>
        <th className="py-2 text-right font-medium">Revenue</th>
        <th className="py-2 text-right font-medium">ROAS</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-[hsl(230_20%_12%_/_0.5)]">
      {adSets.map((adSet, i) => (
        <motion.tr 
          key={adSet.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="hover:bg-[hsl(270_91%_65%_/_0.03)]"
        >
          <td className="py-3 text-gray-300">{adSet.name}</td>
          <td className="py-3 text-right text-gray-400 hidden sm:table-cell font-mono">${adSet.spend.toLocaleString()}</td>
          <td className="py-3 text-right text-[hsl(170_80%_50%)] font-mono">${adSet.chronosTrackedSales.toLocaleString()}</td>
          <td className="py-3 text-right font-mono font-semibold">{adSet.roas.toFixed(2)}x</td>
        </motion.tr>
      ))}
    </tbody>
  </table>
);