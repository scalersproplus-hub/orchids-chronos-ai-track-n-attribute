import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Campaign, CustomerJourney, AttributionModel } from '../types';
import { BrainCircuit, ArrowDown, ArrowUp } from 'lucide-react';

const calculateAttribution = (campaigns: Campaign[], journeys: CustomerJourney[], model: AttributionModel): Campaign[] => {
  const campaignRevenue: { [key: string]: number } = {};
  campaigns.forEach(c => campaignRevenue[c.id] = 0);

  journeys.forEach(journey => {
    const conversionValue = journey.totalLTV;
    const adTouchpoints = journey.touchpoints.filter(tp => tp.type === 'Ad Click');
    if (adTouchpoints.length === 0) return;

    const getCampaignBySource = (source: string) => campaigns.find(c => c.name === source);

    switch (model) {
      case 'First-Click': { /* ... */ break; }
      case 'Last-Click': { /* ... */ break; }
      case 'Linear': { /* ... */ break; }
      case 'Time-Decay': { /* ... */ break; }
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

// FIX: Define AttributionModelerProps interface to resolve TypeScript error.
interface AttributionModelerProps {
  campaigns: Campaign[];
  journeys: CustomerJourney[];
}

export const AttributionModeler: React.FC<AttributionModelerProps> = ({ campaigns, journeys }) => {
  const [model, setModel] = useState<AttributionModel>('Last-Click');
  
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

  return (
    <div className="space-y-6 animate-fade-in">
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
