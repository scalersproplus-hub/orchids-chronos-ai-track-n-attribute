import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Campaign, CustomerJourney, AttributionModel } from '../types';
import { BrainCircuit, ArrowDown, ArrowUp, Sparkles, Zap, PlayCircle, PieChart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const calculateAttribution = (campaigns: Campaign[], journeys: CustomerJourney[], model: AttributionModel): Campaign[] => {
  const campaignRevenue: { [key: string]: number } = {};
  campaigns.forEach(c => campaignRevenue[c.id] = 0);

  journeys.forEach(journey => {
    const conversionValue = journey.totalLTV;
    const adTouchpoints = journey.touchpoints.filter(tp => tp.type === 'Ad Click');
    if (adTouchpoints.length === 0) return;

    const getCampaignBySource = (source: string) => campaigns.find(c => c.name === source);

    switch (model) {
      case 'First-Click': { 
        const campaign = getCampaignBySource(adTouchpoints[0].source);
        if (campaign) campaignRevenue[campaign.id] += conversionValue;
        break; 
      }
      case 'Last-Click': { 
        const campaign = getCampaignBySource(adTouchpoints[adTouchpoints.length - 1].source);
        if (campaign) campaignRevenue[campaign.id] += conversionValue;
        break; 
      }
      case 'Linear': { 
        const value = conversionValue / adTouchpoints.length;
        adTouchpoints.forEach(tp => {
          const campaign = getCampaignBySource(tp.source);
          if (campaign) campaignRevenue[campaign.id] += value;
        });
        break; 
      }
      case 'Time-Decay': { 
        const weights = adTouchpoints.map((_, i) => Math.pow(2, i));
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        adTouchpoints.forEach((tp, i) => {
          const campaign = getCampaignBySource(tp.source);
          if (campaign) campaignRevenue[campaign.id] += (weights[i] / totalWeight) * conversionValue;
        });
        break; 
      }
      case 'U-Shaped': {
        if (adTouchpoints.length === 1) {
            const campaign = getCampaignBySource(adTouchpoints[0].source);
            if (campaign) campaignRevenue[campaign.id] += conversionValue;
        } else {
            const firstCampaign = getCampaignBySource(adTouchpoints[0].source);
            const lastCampaign = getCampaignBySource(adTouchpoints[adTouchpoints.length - 1].source);
            if(firstCampaign) campaignRevenue[firstCampaign.id] += conversionValue * 0.4;
            if(lastCampaign) campaignRevenue[lastCampaign.id] += conversionValue * 0.4;
            
            const middleTouchpoints = adTouchpoints.slice(1, -1);
            if(middleTouchpoints.length > 0) {
                const middleValue = (conversionValue * 0.2) / middleTouchpoints.length;
                middleTouchpoints.forEach(tp => {
                    const campaign = getCampaignBySource(tp.source);
                    if (campaign) campaignRevenue[campaign.id] += middleValue;
                });
            }
        }
        break;
      }
    }
  });

  return campaigns.map(c => ({
    ...c,
    chronosTrackedSales: Math.round(campaignRevenue[c.id] || 0)
  }));
};

interface AttributionModelerProps {
  campaigns: Campaign[];
  journeys: CustomerJourney[];
  isDemo?: boolean;
}

const EmptyAttributionState: React.FC<{ onEnableDemo: () => void }> = ({ onEnableDemo }) => {
  const { setCurrentView } = useApp();
  
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ 
          background: 'linear-gradient(135deg, hsl(270 91% 65% / 0.2), hsl(320 80% 60% / 0.1))',
          border: '1px solid hsl(270 91% 65% / 0.3)'
        }}
      >
        <PieChart className="w-10 h-10 text-[hsl(270_91%_75%)]" />
      </motion.div>
      
      <h2 className="text-xl font-bold text-white mb-2 text-center">No Attribution Data Yet</h2>
      <p className="text-gray-400 text-center max-w-md mb-6">
        Compare different attribution models once you have campaign data flowing. See which model best represents your customer journeys.
      </p>
      
      <div className="flex gap-3">
        <motion.button
          onClick={() => setCurrentView('setup')}
          className="px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-white"
          style={{
            background: 'linear-gradient(135deg, hsl(270 91% 65%), hsl(320 80% 60%))',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="w-4 h-4" />
          Setup Tracking
        </motion.button>
        <motion.button
          onClick={onEnableDemo}
          className="px-5 py-2.5 rounded-xl font-medium flex items-center gap-2"
          style={{
            background: 'hsl(230 20% 12%)',
            border: '1px solid hsl(170 80% 50% / 0.3)',
            color: 'hsl(170 80% 55%)'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlayCircle className="w-4 h-4" />
          Try Demo
        </motion.button>
      </div>
    </motion.div>
  );
};

export const AttributionModeler: React.FC<AttributionModelerProps> = ({ campaigns, journeys, isDemo = false }) => {
  const { state, updateAccount, addToast, setCurrentView } = useApp();
  const { currentAccount } = state;
  const [model, setModel] = useState<AttributionModel>('Last-Click');
  
  const handleEnableDemo = () => {
    const demoAccount = {
      ...currentAccount,
      name: 'Demo Workspace',
      websiteUrl: 'https://demo-store.com',
    };
    updateAccount(demoAccount);
    addToast({ type: 'success', message: 'Demo mode enabled!' });
  };

  const lastClickAttribution = useMemo(() => calculateAttribution(campaigns, journeys, 'Last-Click'), [campaigns, journeys]);
  const attributedCampaigns = useMemo(() => calculateAttribution(campaigns, journeys, model), [campaigns, journeys, model]);

  const chartData = attributedCampaigns.map(c => {
    const lastClickRevenue = lastClickAttribution.find(lc => lc.id === c.id)?.chronosTrackedSales || 0;
    const change = lastClickRevenue > 0 ? ((c.chronosTrackedSales - lastClickRevenue) / lastClickRevenue) * 100 : 0;
    return {
      name: c.name.split(' - ')[0],
      Revenue: c.chronosTrackedSales,
      change: change.toFixed(1),
    };
  });

  const modelDescriptions: Record<AttributionModel, string> = {
    'Last-Click': '100% credit to the final touchpoint. Favors bottom-of-funnel campaigns.',
    'First-Click': '100% credit to the first touchpoint. Highlights top-of-funnel discovery.',
    'Linear': 'Distributes credit equally among all touchpoints. Balanced view.',
    'Time-Decay': 'Gives more credit to touchpoints closer to conversion. Values recency.',
    'U-Shaped': 'Gives 40% to First, 40% to Last, and 20% to middle touchpoints. Values discovery and closing.',
    'Custom': 'Build your own weighted model. (Not implemented)',
  };

  if (campaigns.length === 0 && !isDemo) {
    return <EmptyAttributionState onEnableDemo={handleEnableDemo} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {isDemo && (
        <motion.div 
          className="glass rounded-xl p-3 flex items-center gap-3"
          style={{ border: '1px solid hsl(40 95% 55% / 0.2)', background: 'hsl(40 95% 55% / 0.05)' }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Sparkles className="w-4 h-4 text-[hsl(40_95%_55%)]" />
          <span className="text-sm text-gray-300">
            <strong className="text-[hsl(40_95%_60%)]">Demo Mode:</strong> Sample attribution data. Compare how different models value your campaigns.
          </span>
        </motion.div>
      )}

      <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Attribution Model Comparison</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-3">Select Model</h3>
            <div className="flex flex-col gap-2">
              {(['Last-Click', 'First-Click', 'Linear', 'Time-Decay', 'U-Shaped'] as AttributionModel[]).map(m => (
                <button key={m} onClick={() => setModel(m)} className={`px-4 py-2 text-sm text-left rounded-lg ${model === m ? 'bg-chronos-500 text-white' : 'bg-chronos-800 hover:bg-chronos-700'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
           <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-5">
             <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-chronos-accent" /> AI Insight</h3>
            <p className="text-xs text-gray-400"><strong>U-Shaped</strong> models often provide the most balanced view for businesses with a consideration phase, valuing both the initial discovery and the final decision-making touchpoints.</p>
          </div>
        </div>

        <div className="lg:col-span-3 bg-chronos-900 border border-chronos-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue Attribution ({model})</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={120} tick={{ fill: '#e2e8f0' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.change >= 0;
    return (
      <div className="bg-chronos-950 p-3 border border-chronos-800 rounded-lg shadow-xl">
        <p className="font-bold text-white">{label}</p>
        <p className="text-chronos-400">Revenue: ${payload[0].value.toLocaleString()}</p>
        <p className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>}
          {data.change}% vs. Last-Click
        </p>
      </div>
    );
  }
  return null;
};