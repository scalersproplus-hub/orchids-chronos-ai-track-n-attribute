import React, { useState, useEffect } from 'react';
import { Activity, Eye, ShoppingCart, CreditCard, UserPlus, MousePointer, Clock, Globe, Smartphone, Monitor, Zap, Filter, Pause, Play, Trash2 } from 'lucide-react';

interface LiveEvent {
  id: string;
visitorId: string;
  eventType: string;
  timestamp: Date;
  url: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  country: string;
  value?: number;
  metadata?: Record<string, any>;
}

const EVENT_TYPES = [
  { type: 'PageView', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { type: 'AddToCart', icon: ShoppingCart, color: 'text-green-400', bg: 'bg-green-500/10' },
  { type: 'Purchase', icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { type: 'Lead', icon: UserPlus, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { type: 'Click', icon: MousePointer, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

const MOCK_URLS = [
  '/products/wireless-headphones',
  '/checkout',
  '/cart',
  '/products/laptop-stand',
  '/about',
  '/contact',
  '/products/usb-hub',
  '/pricing',
  '/blog/best-practices',
];

const MOCK_COUNTRIES = ['US', 'UK', 'DE', 'CA', 'AU', 'FR', 'JP', 'BR'];
const MOCK_BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Edge'];

const generateMockEvent = (): LiveEvent => {
  const eventConfig = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    visitorId: `vis_${Math.random().toString(36).substr(2, 8)}`,
    eventType: eventConfig.type,
    timestamp: new Date(),
    url: MOCK_URLS[Math.floor(Math.random() * MOCK_URLS.length)],
    device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as 'desktop' | 'mobile' | 'tablet',
    browser: MOCK_BROWSERS[Math.floor(Math.random() * MOCK_BROWSERS.length)],
    country: MOCK_COUNTRIES[Math.floor(Math.random() * MOCK_COUNTRIES.length)],
    value: eventConfig.type === 'Purchase' ? Math.floor(Math.random() * 500) + 50 : 
           eventConfig.type === 'AddToCart' ? Math.floor(Math.random() * 200) + 20 : undefined,
  };
};

export const LiveEventsPreview: React.FC = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [stats, setStats] = useState({ total: 0, pageViews: 0, conversions: 0 });

  useEffect(() => {
    if (isPaused) return;

    // Simulate incoming events
    const interval = setInterval(() => {
      const newEvent = generateMockEvent();
      setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events
      
      setStats(prev => ({
        total: prev.total + 1,
        pageViews: prev.pageViews + (newEvent.eventType === 'PageView' ? 1 : 0),
        conversions: prev.conversions + (newEvent.eventType === 'Purchase' ? 1 : 0),
      }));
    }, Math.random() * 2000 + 1000); // Random interval between 1-3 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.eventType === filter);

  const getEventConfig = (type: string) => 
    EVENT_TYPES.find(e => e.type === type) || EVENT_TYPES[0];

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-3 h-3" />;
      case 'tablet': return <Monitor className="w-3 h-3" />;
      default: return <Monitor className="w-3 h-3" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="bg-chronos-900 border border-chronos-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-chronos-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="w-5 h-5 text-green-400" />
              {!isPaused && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Live Events Stream</h3>
              <p className="text-xs text-gray-400">Real-time visitor activity from your tracking tag</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`p-2 rounded-lg transition-all ${isPaused ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setEvents([]); setStats({ total: 0, pageViews: 0, conversions: 0 }); }}
              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-chronos-950 rounded-lg border border-chronos-800">
            <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
            <div className="text-xs text-gray-400">Total Events</div>
          </div>
          <div className="p-3 bg-chronos-950 rounded-lg border border-chronos-800">
            <div className="text-2xl font-bold text-blue-400 font-mono">{stats.pageViews}</div>
            <div className="text-xs text-gray-400">Page Views</div>
          </div>
          <div className="p-3 bg-chronos-950 rounded-lg border border-chronos-800">
            <div className="text-2xl font-bold text-purple-400 font-mono">{stats.conversions}</div>
            <div className="text-xs text-gray-400">Conversions</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mt-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 text-xs rounded-md transition-all ${filter === 'all' ? 'bg-chronos-500 text-white' : 'bg-chronos-800 text-gray-400 hover:text-white'}`}
            >
              All
            </button>
            {EVENT_TYPES.map(et => (
              <button
                key={et.type}
                onClick={() => setFilter(et.type)}
                className={`px-2 py-1 text-xs rounded-md transition-all ${filter === et.type ? `${et.bg} ${et.color}` : 'bg-chronos-800 text-gray-400 hover:text-white'}`}
              >
                {et.type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Waiting for events...</p>
            <p className="text-xs mt-1">Events will appear here as they're tracked</p>
          </div>
        ) : (
          <div className="divide-y divide-chronos-800">
            {filteredEvents.map((event, index) => {
              const config = getEventConfig(event.eventType);
              const Icon = config.icon;
              return (
                <div 
                  key={event.id} 
                  className={`p-3 hover:bg-chronos-800/30 transition-all ${index === 0 ? 'animate-slide-up' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${config.color}`}>{event.eventType}</span>
                        {event.value && (
                          <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                            ${event.value}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate mt-0.5">{event.url}</div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(event.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          {getDeviceIcon(event.device)}
                          {event.browser}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {event.country}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 font-mono">
                      {event.visitorId.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-chronos-800 bg-chronos-950">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Showing {filteredEvents.length} of {events.length} events</span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'}`} />
            {isPaused ? 'Paused' : 'Live'}
          </span>
        </div>
      </div>
    </div>
  );
};
