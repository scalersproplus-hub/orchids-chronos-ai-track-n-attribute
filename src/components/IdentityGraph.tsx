import React from 'react';
import { CustomerJourney } from '../types';
import { User, Smartphone, Monitor, GitMerge, CheckCircle, ArrowRight, UserPlus } from 'lucide-react';

interface IdentityGraphProps {
  journeys: CustomerJourney[];
}

export const IdentityGraph: React.FC<IdentityGraphProps> = ({ journeys }) => {
  const relevantJourneys = journeys.filter(j => j.identityGraph && j.identityGraph.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-6 flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-white mb-2">AI Identity Graph</h2>
            <p className="text-gray-400 text-sm">Visualize how Chronos connects anonymous sessions into a single customer profile.</p>
        </div>
        <button className="px-4 py-2 bg-chronos-800 hover:bg-chronos-700 text-sm text-white font-medium rounded-lg flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Manually Merge Profile
        </button>
      </div>
      
      <div className="space-y-8">
        {relevantJourneys.map(journey => (
          <div key={journey.id} className="bg-chronos-900 border border-chronos-800 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-chronos-800 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">{journey.customerName}</h3>
                    <p className="text-sm text-chronos-400">{journey.email}</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 p-4 bg-chronos-950/50 rounded-lg">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <GraphNode 
                        icon={Smartphone} 
                        title="iPhone Session"
                        id={`IP: 192.168.1.10`}
                        type="probabilistic"
                        confidence={journey.identityGraph?.[0].confidenceScore}
                    />
                     <div className="transform rotate-90 md:rotate-0 text-chronos-700"><ArrowRight className="w-6 h-6" /></div>
                    <GraphNode 
                        icon={Monitor} 
                        title="Desktop Session"
                        id={`IP: 24.114.88.21`}
                        type="probabilistic"
                        confidence={journey.identityGraph?.[1].confidenceScore}
                    />
                </div>
                
                <div className="flex flex-col items-center gap-2 my-4 lg:my-0">
                   <div className="w-px h-6 lg:w-12 lg:h-px bg-chronos-700"></div>
                   <div className="p-3 bg-chronos-accent/10 rounded-full border border-chronos-accent/30"><GitMerge className="w-6 h-6 text-chronos-accent" /></div>
                   <p className="text-[10px] font-mono text-chronos-accent text-center mt-1">Fingerprint Match</p>
                   <div className="w-px h-6 lg:w-12 lg:h-px bg-chronos-700"></div>
                </div>

                <GraphNode 
                    icon={CheckCircle} 
                    title="Unified Profile"
                    id={journey.email}
                    type="deterministic"
                    confidence={journey.identityGraph?.[2].confidenceScore}
                />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GraphNode = ({ icon: Icon, title, id, type, confidence }: any) => {
    const isProbabilistic = type === 'probabilistic';
    const confidenceColor = confidence > 90 ? 'text-green-400' : confidence > 75 ? 'text-yellow-400' : 'text-red-400';
    return (
        <div className={`w-full md:w-64 p-4 rounded-lg border flex flex-col items-center text-center ${isProbabilistic ? 'bg-chronos-900 border-chronos-800' : 'bg-green-900/10 border-green-500/20'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 border ${isProbabilistic ? 'bg-chronos-800 border-chronos-700' : 'bg-green-500/10 border-green-500/30'}`}>
                <Icon className={`w-6 h-6 ${isProbabilistic ? 'text-chronos-400' : 'text-green-400'}`} />
            </div>
            <h4 className="font-bold text-white text-sm">{title}</h4>
            <p className="text-xs text-gray-400 mb-2">{id}</p>
            {confidence && <div className={`text-[10px] font-mono font-bold bg-chronos-950 px-2 py-0.5 rounded ${confidenceColor}`}>{confidence}% Confidence</div>}
        </div>
    )
}
