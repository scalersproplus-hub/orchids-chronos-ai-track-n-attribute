import { Campaign, CustomerJourney, AccountProfile, TimeSeriesData, AdSet, Anomaly } from '../types';

// ============================================
// PRODUCTION DEFAULTS
// Empty workspace for new users
// ============================================
export const DEFAULT_ACCOUNT: AccountProfile = {
  id: 'act_default_001',
  name: 'My Workspace',
  websiteUrl: '',
  currency: 'USD',
  timezone: 'UTC',
  setupComplete: false,
  
  metaPixelId: '',
  metaCapiToken: '',
  metaTestCode: '',
  
  googleConversionId: '',
  googleConversionLabel: '',
  googleDeveloperToken: '',
  googleCustomerId: '',
  
  trackingDomain: '',
  
  supabaseConfig: {
    url: '',
    key: '',
  }
};

// This is used for localStorage initialization
export const MOCK_ACCOUNTS: AccountProfile[] = [DEFAULT_ACCOUNT];

// ============================================
// DEMO MODE DETECTION
// ============================================
export const isDemoMode = (account: AccountProfile): boolean => {
  return account.name === 'Demo Workspace' || 
         account.websiteUrl === 'https://demo-store.com';
};

export const hasRealIntegrations = (account: AccountProfile): boolean => {
  return !!(
    account.metaPixelId || 
    account.googleCustomerId || 
    (account.supabaseConfig?.url && account.supabaseConfig?.key)
  );
};

// ============================================
// EXAMPLE VALUES FOR UI HINTS
// These are shown in the UI as placeholders/hints
// ============================================
export const EXAMPLE_VALUES = {
  meta: {
    pixelId: '1234567890123456',
    pixelIdHint: 'Find this in Events Manager → Data Sources → Your Pixel',
    capiToken: 'EAAGm0PX4ZCpsBAO...',
    capiTokenHint: 'Generate in Events Manager → Settings → Conversions API → Generate Token',
    testCode: 'TEST12345',
    testCodeHint: 'Optional - used to verify events in Test Events tab',
  },
  google: {
    customerId: '123-456-7890',
    customerIdHint: 'Your Google Ads account ID (found in top-right of Google Ads)',
    conversionId: 'AW-123456789',
    conversionIdHint: 'From your conversion action setup (starts with AW-)',
    conversionLabel: 'AbCdEfGhIjKlMnOp',
    conversionLabelHint: 'The label part of your conversion tag',
    developerToken: 'aBcDeFgHiJkLmNoP',
    developerTokenHint: 'Apply at Google Ads API Center (requires basic access)',
  },
  supabase: {
    url: 'https://abcdefgh.supabase.co',
    urlHint: 'Found in Supabase Dashboard → Settings → API → Project URL',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    keyHint: 'Found in Supabase Dashboard → Settings → API → anon public key',
  },
  trackingDomain: 'track.yourdomain.com',
  trackingDomainHint: 'A subdomain that points to our tracking servers via CNAME',
  
  webhook: {
    shopify: 'https://yourstore.myshopify.com/admin/api/webhooks',
    stripe: 'https://api.stripe.com/v1/webhook_endpoints',
    klaviyo: 'https://a.klaviyo.com/api/webhooks',
  }
};

// ============================================
// VALIDATION HELPERS
// ============================================
export const VALIDATION_PATTERNS = {
  metaPixelId: /^\d{15,16}$/,
  googleCustomerId: /^\d{3}-\d{3}-\d{4}$/,
  googleConversionId: /^AW-\d+$/,
  supabaseUrl: /^https:\/\/[a-z0-9]+\.supabase\.co$/,
  domain: /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i,
};

export const validateField = (field: string, value: string): { valid: boolean; message: string } => {
  if (!value) return { valid: false, message: 'This field is required' };
  
  switch (field) {
    case 'metaPixelId':
      return VALIDATION_PATTERNS.metaPixelId.test(value)
        ? { valid: true, message: '' }
        : { valid: false, message: 'Pixel ID should be 15-16 digits' };
    case 'googleCustomerId':
      return VALIDATION_PATTERNS.googleCustomerId.test(value)
        ? { valid: true, message: '' }
        : { valid: false, message: 'Format: 123-456-7890' };
    case 'googleConversionId':
      return VALIDATION_PATTERNS.googleConversionId.test(value)
        ? { valid: true, message: '' }
        : { valid: false, message: 'Format: AW-123456789' };
    case 'supabaseUrl':
      return VALIDATION_PATTERNS.supabaseUrl.test(value)
        ? { valid: true, message: '' }
        : { valid: false, message: 'Should be https://yourproject.supabase.co' };
    case 'trackingDomain':
      return VALIDATION_PATTERNS.domain.test(value)
        ? { valid: true, message: '' }
        : { valid: false, message: 'Enter a valid domain like track.example.com' };
    default:
      return { valid: true, message: '' };
  }
};

// ============================================
// DEMO DATA
// Only shown in Demo Mode for exploration
// ============================================
const DEMO_ADSETS_FB1: AdSet[] = [
  { id: 'adset_fb1_1', name: 'Interests - Fitness Gurus', spend: 7000, chronosTrackedSales: 15000, roas: 2.14 },
  { id: 'adset_fb1_2', name: 'Lookalikes - 1% Purchasers', spend: 5500, chronosTrackedSales: 13500, roas: 2.45 },
];
const DEMO_ADSETS_GGL2: AdSet[] = [
  { id: 'adset_ggl2_1', name: 'Brand Keywords - Exact Match', spend: 2800, chronosTrackedSales: 4000, roas: 1.43 },
  { id: 'adset_ggl2_2', name: 'Competitor Keywords - Broad', spend: 1400, chronosTrackedSales: 1500, roas: 1.07 },
];

export const DEMO_CAMPAIGNS: Campaign[] = [
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
    adSets: DEMO_ADSETS_FB1,
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
    adSets: DEMO_ADSETS_GGL2,
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
];

export const DEMO_JOURNEYS: CustomerJourney[] = [
  {
    id: 'cust_992',
    customerName: 'Sarah J.',
    email: 's***@example.com',
    phone: '+1555*****56',
    totalLTV: 297.00,
    firstSeen: '2024-10-15',
    lastSeen: '2024-10-28',
    tags: ['High Value', 'Returning'],
    ipAddress: '192.158.xxx.xxx',
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
    customerName: 'Alex R.',
    email: 'a***@webmail.com',
    phone: '+1555*****78',
    totalLTV: 75.50,
    firstSeen: '2024-10-10',
    lastSeen: '2024-10-25',
    ipAddress: '24.114.xxx.xxx',
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
      { deviceId: 'iPhone-Safari', fingerprintId: 'fp_c8d9e2f1a7b3c8d9e2f1a7b3', timestamp: '2024-10-10', type: 'probabilistic', confidenceScore: 92 },
      { deviceId: 'Win11-Edge', fingerprintId: 'fp_c8d9e2f1a7b3c8d9e2f1a7b3', timestamp: '2024-10-24', type: 'probabilistic', confidenceScore: 95 },
      { deviceId: 'a***@webmail.com', fingerprintId: 'fp_c8d9e2f1a7b3c8d9e2f1a7b3', timestamp: '2024-10-25', type: 'deterministic', confidenceScore: 100 }
    ],
    touchpoints: [
      { id: 'tp_8', type: 'Ad Click', source: 'Top of Funnel - Cold Traffic - US', timestamp: 'Oct 10, 08:00 PM', device: 'Mobile', value: 0 },
      { id: 'tp_9', type: 'Ad Click', source: 'Brand Search - Retargeting', timestamp: 'Oct 24, 11:00 AM', device: 'Desktop', value: 0 },
      { id: 'tp_10', type: 'Email Open', source: 'Welcome Sequence Flow', timestamp: 'Oct 25, 09:30 AM', device: 'Desktop', value: 0 },
      { id: 'tp_11', type: 'Checkout', source: 'Direct', timestamp: 'Oct 25, 09:45 AM', device: 'Desktop', value: 75.50 }
    ]
  },
];

export const DEMO_TIME_SERIES: TimeSeriesData[] = Array.from({ length: 30 }, (_, i) => {
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

export const DEMO_ANOMALIES: Anomaly[] = [
  { id: 'anom_1', severity: 'High', metric: 'ROAS', change: '-45%', description: 'ROAS dropped significantly despite a 20% increase in spend.', campaignId: 'cmp_ggl_002' },
  { id: 'anom_2', severity: 'Medium', metric: 'Spend', change: '+75%', description: 'Ad spend ramped up much faster than the daily budget.', campaignId: 'cmp_fb_001' },
];

// Legacy exports for backward compatibility
export const MOCK_CAMPAIGNS = DEMO_CAMPAIGNS;
export const MOCK_JOURNEYS = DEMO_JOURNEYS;
export const MOCK_TIME_SERIES = DEMO_TIME_SERIES;
export const MOCK_ANOMALIES = DEMO_ANOMALIES;

// ============================================
// EMPTY STATES
// For production when no data exists
// ============================================
export const EMPTY_CAMPAIGNS: Campaign[] = [];
export const EMPTY_JOURNEYS: CustomerJourney[] = [];
export const EMPTY_TIME_SERIES: TimeSeriesData[] = [];
export const EMPTY_ANOMALIES: Anomaly[] = [];

// Helper to get appropriate data based on mode
export const getDataForMode = (account: AccountProfile) => {
  const isDemo = isDemoMode(account);
  return {
    campaigns: isDemo ? DEMO_CAMPAIGNS : EMPTY_CAMPAIGNS,
    journeys: isDemo ? DEMO_JOURNEYS : EMPTY_JOURNEYS,
    timeSeries: isDemo ? DEMO_TIME_SERIES : EMPTY_TIME_SERIES,
    anomalies: isDemo ? DEMO_ANOMALIES : EMPTY_ANOMALIES,
    isDemo,
  };
};