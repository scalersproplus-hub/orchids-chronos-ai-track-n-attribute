
import { Campaign, CustomerJourney, AccountProfile, TimeSeriesData, AdSet, Anomaly } from '../types';

export const MOCK_ACCOUNTS: AccountProfile[] = [
  {
    id: 'act_001',
    name: 'Chronos Demo Store',
    websiteUrl: 'https://chronos-demo.io',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    setupComplete: true,
    metaPixelId: '1541448980200545',
    metaCapiToken: 'EAAUYyxZAFhq0BQOYbbKdO5Ji2hMZCZCWaH7E0ZCDdObYf3KNbG4gKk36ZB8FUznPNhbPik1OOtMSzWi8sa0TY5xF6L2Pffk8UzjwAEBPZAbEDvY8pZAAO3wyZA0TcHcmHa4Sv6BEWWxMAojPBicOZA7CzZCngbtZCHT4cVXfhswbULzx1NqZBrnEZCQWjhBf9R38MhztIGwZDZD',
    metaTestCode: 'TEST48545',
    googleConversionId: 'AW-882910293',
    googleConversionLabel: 'AbCdEfGhIjKlM',
    googleDeveloperToken: 'DEV_TOKEN_PLACEHOLDER',
    googleCustomerId: '123-456-7890',
    supabaseConfig: {
      url: 'https://vapkerzbbdokniudetpq.supabase.co',
      key: 'REPLACE_WITH_YOUR_REAL_SUPABASE_ANON_KEY',
    }
  },
  {
    id: 'act_002',
    name: 'Client: Apex Fitness',
    websiteUrl: 'https://apex-fitness.com',
    currency: 'USD',
    timezone: 'America/New_York',
    setupComplete: true,
    metaPixelId: '', metaCapiToken: '', metaTestCode: '',
    supabaseConfig: { url: '', key: '' }
  },
];

const MOCK_ADSETS_FB1: AdSet[] = [
    { id: 'adset_fb1_1', name: 'Interests - Fitness Gurus', spend: 7000, chronosTrackedSales: 15000, roas: 2.14 },
    { id: 'adset_fb1_2', name: 'Lookalikes - 1% Purchasers', spend: 5500, chronosTrackedSales: 13500, roas: 2.45 },
];
const MOCK_ADSETS_GGL2: AdSet[] = [
    { id: 'adset_ggl2_1', name: 'Brand Keywords - Exact Match', spend: 2800, chronosTrackedSales: 4000, roas: 1.43 },
    { id: 'adset_ggl2_2', name: 'Competitor Keywords - Broad', spend: 1400, chronosTrackedSales: 1500, roas: 1.07 },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp_fb_001',
    name: 'Top of Funnel - Cold Traffic - US',
    platform: 'Facebook',
    status: 'Active',
    spend: 12500,
    platformReportedSales: 8000,
    chronosTrackedSales: 28500,
    clicks: 5200,
    leads: 850,
    roas: 2.28,
    adSets: MOCK_ADSETS_FB1,
  },
  {
    id: 'cmp_ggl_002',
    name: 'Brand Search - Retargeting',
    platform: 'Google',
    status: 'Active',
    spend: 4200,
    platformReportedSales: 15000,
    chronosTrackedSales: 5500,
    clicks: 1200,
    leads: 150,
    roas: 1.31,
    adSets: MOCK_ADSETS_GGL2,
  },
  {
    id: 'cmp_tik_003',
    name: 'UGC Creative Test #4',
    platform: 'TikTok',
    status: 'Paused',
    spend: 1500,
    platformReportedSales: 0,
    chronosTrackedSales: 4200,
    clicks: 3000,
    leads: 45,
    roas: 2.8
  },
  // ... more campaigns
];

export const MOCK_JOURNEYS: CustomerJourney[] = [
  {
    id: 'cust_992',
    customerName: 'Sarah Jenkins',
    email: 's.jenkins@example.com',
    phone: '+15550123456',
    totalLTV: 297.00,
    firstSeen: '2023-10-15',
    lastSeen: '2023-10-28',
    tags: ['High Value', 'Returning'],
    ipAddress: '192.158.1.38',
    location: 'Austin, TX, US',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)',
    fbp: 'fb.1.1697364000123',
    fbc: 'fb.1.1697450400456.IwAR2...',
    gclid: 'Cj0KCQjwhfipBhCqARIsAH9msbmw_...',
    wbraid: 'ClYKCQjwhfipBhCqARIsAH9msbmw...',
    deduplicationId: 'event_882910_checkout',
    gender: 'Female',
    deviceOS: 'iOS 16.6',
    browser: 'Mobile Safari',
    chronosFingerprintId: 'fp_a7b3c8d9e2f1a7b3c8d9e2f1',
    touchpoints: [
      { id: 'tp_1', type: 'Ad Click', source: 'TikTok - UGC Creative Test #4', timestamp: 'Oct 15, 08:30 AM', device: 'Mobile', value: 0 },
      { id: 'tp_2', type: 'Ad Click', source: 'Top of Funnel - Cold Traffic - US', timestamp: 'Oct 16, 09:15 PM', device: 'Mobile', value: 0 },
      { id: 'tp_3', type: 'Email Open', source: 'Welcome Sequence Flow', timestamp: 'Oct 17, 08:00 AM', device: 'Desktop', value: 0 },
      { id: 'tp_4', type: 'Ad Click', source: 'Brand Search - Retargeting', timestamp: 'Oct 28, 10:00 AM', device: 'Desktop', value: 0 },
      { id: 'tp_5', type: 'Checkout', source: 'Direct', timestamp: 'Oct 28, 10:15 AM', device: 'Desktop', value: 297.00 }
    ]
  },
  {
    id: 'cust_994',
    customerName: 'Alex Rivera',
    email: 'alex.r@webmail.com',
    phone: '+15552345678',
    totalLTV: 75.50,
    firstSeen: '2023-10-10',
    lastSeen: '2023-10-25',
    ipAddress: '24.114.88.21',
    location: 'Miami, FL, US',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    fbp: 'fb.1.1698228000111', fbc: '',
    gclid: 'Cj0KCAjwn..._gclid',
    gbraid: 'Gbraid_Cj0KCAjwn..._gbraid',
    deduplicationId: 'event_994_purchase_final',
    gender: 'Unknown',
    deviceOS: 'Windows 11',
    browser: 'Edge 118.0',
    chronosFingerprintId: 'fp_c8d9e2f1a7b3c8d9e2f1a7b3',
    identityGraph: [
        { deviceId: 'iPhone-Safari', fingerprintId: 'fp_c8d9e2f1a7b3c8d9e2f1a7b3', timestamp: '2023-10-10', type: 'probabilistic', confidenceScore: 92 },
        { deviceId: 'Win11-Edge', fingerprintId: 'fp_c8d9e2f1a7b3c8d9e2f1a7b3', timestamp: '2023-10-24', type: 'probabilistic', confidenceScore: 95 },
        { deviceId: 'alex.r@webmail.com', fingerprintId: 'fp_c8d9e2f1a7b3c8d9e2f1a7b3', timestamp: '2023-10-25', type: 'deterministic', confidenceScore: 100 }
    ],
    touchpoints: [
      { id: 'tp_8', type: 'Ad Click', source: 'Top of Funnel - Cold Traffic - US', timestamp: 'Oct 10, 08:00 PM', device: 'Mobile', value: 0 },
      { id: 'tp_9', type: 'Ad Click', source: 'Brand Search - Retargeting', timestamp: 'Oct 24, 11:00 AM', device: 'Desktop', value: 0 },
      { id: 'tp_10', type: 'Email Open', source: 'Welcome Sequence Flow', timestamp: 'Oct 25, 09:30 AM', device: 'Desktop', value: 0 },
      { id: 'tp_11', type: 'Checkout', source: 'Direct', timestamp: 'Oct 25, 09:45 AM', device: 'Desktop', value: 75.50 }
    ]
  },
];

export const MOCK_TIME_SERIES: TimeSeriesData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const spend = 500 + Math.random() * 300 + Math.sin(i / 5) * 150;
  const revenue = spend * (1.8 + Math.random() * 1.5 + Math.sin(i/3) * 0.5);
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    spend: Math.round(spend),
    revenue: Math.round(revenue)
  };
});

export const MOCK_ANOMALIES: Anomaly[] = [
    { id: 'anom_1', severity: 'High', metric: 'ROAS', change: '-45%', description: 'ROAS dropped significantly despite a 20% increase in spend.', campaignId: 'cmp_ggl_002' },
    { id: 'anom_2', severity: 'Medium', metric: 'Spend', change: '+75%', description: 'Ad spend ramped up much faster than the daily budget.', campaignId: 'cmp_fb_001' },
];
