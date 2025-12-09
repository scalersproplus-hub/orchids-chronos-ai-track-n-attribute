export interface AdSet {
  id: string;
  name: string;
  spend: number;
  chronosTrackedSales: number;
  roas: number;
}

export interface Campaign {
  id: string;
  name: string;
  platform: 'Facebook' | 'Google' | 'TikTok' | 'Email';
  status: 'Active' | 'Paused';
  spend: number;
  platformReportedSales: number; // What FB/Google says
  chronosTrackedSales: number; // What our pixel tracked
  clicks: number;
  leads: number;
  roas: number; // Return on Ad Spend
  adSets?: AdSet[]; // For drill-down
}

export interface Touchpoint {
  id: string;
  type: 'Ad Click' | 'Email Open' | 'Organic Search' | 'Direct' | 'Checkout';
  source: string; // e.g., "FB - Scaling Campaign 1"
  timestamp: string;
  device: 'Mobile' | 'Desktop';
  value: number; // value assigned at this touchpoint
}

export interface CustomerJourney {
  id: string;
  customerName: string;
  email: string;
  phone?: string;
  totalLTV: number;
  firstSeen: string;
  lastSeen: string;
  touchpoints: Touchpoint[];
  tags?: string[]; // For user-added tags
  
  // Deep Tracking Data
  ipAddress: string;
  userAgent: string;
  location: string;
  gender?: 'Male' | 'Female' | 'Unknown';
  fbp: string; // Facebook Browser ID cookie
  fbc: string; // Facebook Click ID cookie
  gclid?: string; // Google Click ID
  wbraid?: string; // Google Ads Web Fallback ID
  gbraid?: string; // Google Ads App Fallback ID
  deduplicationId: string; // Unique Event ID for CAPI deduplication
  deviceOS: string;
  browser: string;
  
  lead_id?: string;

  // AI Identity Graph
  chronosFingerprintId: string;
  identityGraph?: {
      deviceId: string;
      fingerprintId: string;
      timestamp: string;
      type: 'probabilistic' | 'deterministic';
      confidenceScore?: number;
  }[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AIInsight {
  summary: string;
  recommendations: {
    action: 'SCALE' | 'KILL' | 'OPTIMIZE';
    campaignId: string;
    reason: string;
  }[];
}

// Multi-Tenant Account Configuration
export interface AccountProfile {
  id: string;
  name: string;
  websiteUrl: string;
  currency: string;
  timezone: string;
  setupComplete: boolean; // For onboarding wizard
  
  // Integrations
  metaPixelId: string;
  metaCapiToken: string;
  metaTestCode: string;
  
  googleConversionId?: string;
  googleConversionLabel?: string;
  googleDeveloperToken?: string;
  googleCustomerId?: string;
  
  // First-party tracking domain (CNAME)
  trackingDomain?: string;
  
  supabaseConfig: {
    url: string;
    key: string;
  };
}

export interface TimeSeriesData {
    date: string;
    spend: number;
    revenue: number;
}

export type AttributionModel = 'Last-Click' | 'First-Click' | 'Linear' | 'Time-Decay' | 'U-Shaped' | 'Custom';

export type UploadPlatform = 'Meta' | 'Google';
export type MatchMethod = 'gclid' | 'wbraid' | 'gbraid' | 'Hashed Email' | 'Hashed Phone' | 'FBC' | 'Unknown';

export interface ConversionEvent {
    id: string;
    timestamp: string;
    email?: string;
    phone?: string;
    value: number;
    currency: string;
    platform: UploadPlatform;
    matchMethod: MatchMethod;
    status: 'Success' | 'Failed';
}

export interface ConversionUploadBatch {
    id: string;
    uploadTime: string;
    source: 'Manual' | 'CSV Upload';
    conversions: number;
    metaMatchRate: number;
    googleMatchRate: number;
}

// For AI Anomaly Detection
export interface Anomaly {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  metric: string;
  change: string;
  description: string;
  campaignId: string;
}

// For UI state
export type ToastNotification = {
  id: string;
  type: 'success' | 'error' | 'info' | 'loading';
  message: string;
  title?: string;
  duration?: number;
  onUndo?: () => void;
};

export type UserProfile = {
  name: string;
  email: string;
  avatarUrl: string;
};