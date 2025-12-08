import React, { useState, useMemo } from 'react';
import { CustomerJourney } from '../types';
import { Smartphone, Monitor, Mail, Search, Globe, CreditCard, ArrowRight, User, Fingerprint, Hash, MapPin, Server, Sparkles, Clock, Tag, Filter } from 'lucide-react';

interface JourneyMapProps {
  journeys: CustomerJourney[];
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ journeys }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredJourneys = useMemo(() => {
    return journeys.filter(journey => {
      const matchesSearch = searchTerm === '' ||
        journey.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journey.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = !activeTag || (journey.tags && journey.tags.includes(activeTag));

      return matchesSearch && matchesTag;
    });
  }, [journeys, searchTerm, activeTag]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    journeys.forEach(j => j.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [journeys]);
  
  const getConversionLatency = (journey: CustomerJourney): string => {
    const firstDate = new Date(journey.firstSeen);
    const lastDate = new Date(journey.lastSeen);
    const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-chronos-900 border border-chronos-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Customer Journey Explorer</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-chronos-950 border border-chronos-800 rounded-lg py-2 pl-10 pr-4 text-white focus:border-chronos-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <button onClick={() => setActiveTag(null)} className={`px-3 py-1 text-xs rounded-full transition-colors ${!activeTag ? 'bg-chronos-500 text-white' : 'bg-chronos-800 text-gray-300 hover:bg-chronos-700'}`}>All</button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)} className={`px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap ${activeTag === tag ? 'bg-chronos-500 text-white' : 'bg-chronos-800 text-gray-300 hover:bg-chronos-700'}`}>{tag}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredJourneys.map((journey) => (
          <div key={journey.id} className="bg-chronos-900 border border-chronos-800 rounded-xl overflow-hidden">
            {/* Header / Profile Summary */}
            <div className="p-6 border-b border-chronos-800/50 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
               <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-chronos-800 flex items-center justify-center text-gray-300 flex-shrink-0">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">{journey.customerName}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                       <span>{journey.email}</span>
                       <span className="text-chronos-700">•</span>
                       <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {journey.location}</span>
                        <span className="text-chronos-700">•</span>
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {getConversionLatency(journey)}</span>
                    </div>
                    {journey.tags && <div className="flex gap-2 mt-2">{journey.tags.map(t => <span key={t} className="text-[10px] bg-chronos-800 text-gray-300 px-2 py-0.5 rounded-full">{t}</span>)}</div>}
                  </div>
               </div>
               <div className="text-right">
                 <p className="text-xs text-gray-500 uppercase tracking-wide">Lifetime Value</p>
                 <p className="text-2xl font-mono font-bold text-green-400">${journey.totalLTV.toFixed(2)}</p>
               </div>
            </div>

            {/* Timeline Visualization */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 md:gap-0 overflow-x-auto pb-4 items-center justify-start">
                {journey.touchpoints.map((point, index) => (
                  <React.Fragment key={point.id}>
                    <div className="relative flex-shrink-0 flex flex-col items-center group min-w-[140px]">
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-chronos-900 ${point.type === 'Checkout' ? 'border-green-500 text-green-500' : 'border-chronos-500 text-chronos-500'}`}>
                        <IconForType type={point.type} device={point.device} />
                      </div>
                      <div className="mt-3 text-center w-full px-2">
                        <p className="text-[10px] text-gray-500 font-mono mb-1">{point.timestamp}</p>
                        <p className="text-xs font-bold text-gray-200 leading-tight">{point.source}</p>
                      </div>
                    </div>
                    {index < journey.touchpoints.length - 1 && (
                      <div className="flex-grow h-0.5 md:w-12 bg-chronos-800 hidden md:block"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
          </div>
        ))}
         {filteredJourneys.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                <p>No journeys match your search criteria.</p>
            </div>
        )}
      </div>
    </div>
  );
};

const IconForType = ({ type, device }: { type: string, device: string }) => {
  const DeviceIcon = device === 'Mobile' ? Smartphone : Monitor;
  switch (type) {
    case 'Ad Click': return <DeviceIcon className="w-6 h-6" />;
    case 'Email Open': return <Mail className="w-6 h-6" />;
    case 'Organic Search': return <Search className="w-6 h-6" />;
    case 'Direct': return <Globe className="w-6 h-6" />;
    case 'Checkout': return <CreditCard className="w-6 h-6" />;
    default: return <DeviceIcon className="w-6 h-6" />;
  }
};
