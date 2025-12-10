import React from 'react';
import { motion } from 'framer-motion';
import { CustomerJourney } from '../types';
import { User, Smartphone, Monitor, GitMerge, CheckCircle, ArrowRight, UserPlus, Sparkles, Zap, PlayCircle, Fingerprint } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface IdentityGraphProps {
  journeys: CustomerJourney[];
  isDemo?: boolean;
}

const EmptyIdentityState: React.FC<{ onEnableDemo: () => void }> = ({ onEnableDemo }) => {
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
        <Fingerprint className="w-10 h-10 text-[hsl(270_91%_75%)]" />
      </motion.div>
      
      <h2 className="text-xl font-bold text-white mb-2 text-center">No Identity Graphs Yet</h2>
      <p className="text-gray-400 text-center max-w-md mb-6">
        Identity graphs are built automatically as users interact across devices. Set up tracking to start building unified profiles.
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

export const IdentityGraph: React.FC<IdentityGraphProps> = ({ journeys, isDemo = false }) => {
  const { state, updateAccount, addToast, setCurrentView } = useApp();
  const { currentAccount } = state;
  const relevantJourneys = journeys.filter(j => j.identityGraph && j.identityGraph.length > 0);

  const handleEnableDemo = () => {
    const demoAccount = {
      ...currentAccount,
      name: 'Demo Workspace',
      websiteUrl: 'https://demo-store.com',
    };
    updateAccount(demoAccount);
    addToast({ type: 'success', message: 'Demo mode enabled!' });
  };

  if (journeys.length === 0 && !isDemo) {
    return <EmptyIdentityState onEnableDemo={handleEnableDemo} />;
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
            <strong className="text-[hsl(40_95%_60%)]">Demo Mode:</strong> Sample identity graphs showing cross-device tracking.
          </span>
        </motion.div>
      )}

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
                        id={`IP: 192.168.xxx.xx`}
                        type="probabilistic"
                        confidence={journey.identityGraph?.[0].confidenceScore}
                    />
                     <div className="transform rotate-90 md:rotate-0 text-chronos-700"><ArrowRight className="w-6 h-6" /></div>
                    <GraphNode 
                        icon={Monitor} 
                        title="Desktop Session"
                        id={`IP: 24.114.xxx.xx`}
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
        
        {relevantJourneys.length === 0 && isDemo && (
          <div className="text-center py-12 text-gray-500">
            <p>No identity graphs found in demo data. Users with cross-device activity will appear here.</p>
          </div>
        )}
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