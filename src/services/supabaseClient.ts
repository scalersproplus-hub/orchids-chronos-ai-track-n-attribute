import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Dynamic Supabase client that uses workspace configuration
let supabaseInstance: SupabaseClient | null = null;
let currentConfig: { url: string; key: string } | null = null;

export const getSupabaseClient = (config: { url: string; key: string }): SupabaseClient | null => {
  if (!config.url || !config.key) {
    console.warn('Supabase not configured. Please add your Supabase URL and API key in Settings.');
    return null;
  }

  // Return cached instance if config hasn't changed
  if (
    supabaseInstance &&
    currentConfig?.url === config.url &&
    currentConfig?.key === config.key
  ) {
    return supabaseInstance;
  }

  // Create new client with updated config
  try {
    supabaseInstance = createClient(config.url, config.key, {
      auth: {
        persistSession: false,
      },
    });
    currentConfig = { ...config };
    console.log('Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

// Types for our database tables
export interface VisitorProfile {
  id: string;
  fingerprint_id: string;
  email?: string;
  phone?: string;
  first_seen: string;
  last_seen: string;
  total_visits: number;
  device_ids: string[];
  ip_addresses: string[];
  user_agents: string[];
  created_at: string;
  updated_at: string;
}

export interface TrackingEvent {
  id: string;
  visitor_id: string;
  fingerprint_id: string;
  event_type: 'pageview' | 'click' | 'form_submit' | 'purchase' | 'custom';
  event_name: string;
  page_url: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  fbc?: string;
  fbp?: string;
  wbraid?: string;
  gbraid?: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  ip_address: string;
  location?: string;
  event_value?: number;
  event_currency?: string;
  custom_data?: Record<string, any>;
  created_at: string;
}

export interface Conversion {
  id: string;
  visitor_id: string;
  fingerprint_id: string;
  email?: string;
  phone?: string;
  order_id?: string;
  value: number;
  currency: string;
  products?: Array<{ id: string; name: string; price: number; quantity: number }>;
  attribution_data: {
    first_touch?: TrackingEvent;
    last_touch?: TrackingEvent;
    touchpoints: TrackingEvent[];
  };
  // Ad platform identifiers for offline conversion upload
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbc?: string;
  fbp?: string;
  // Upload status
  meta_uploaded: boolean;
  meta_upload_time?: string;
  google_uploaded: boolean;
  google_upload_time?: string;
  created_at: string;
}

// Database operations
export const dbOperations = {
  // Visitor operations
  async upsertVisitor(
    supabase: SupabaseClient,
    visitor: Partial<VisitorProfile>
  ): Promise<VisitorProfile | null> {
    const { data, error } = await supabase
      .from('visitors')
      .upsert(visitor, { onConflict: 'fingerprint_id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting visitor:', error);
      return null;
    }
    return data;
  },

  async getVisitorByFingerprint(
    supabase: SupabaseClient,
    fingerprintId: string
  ): Promise<VisitorProfile | null> {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('fingerprint_id', fingerprintId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching visitor:', error);
    }
    return data;
  },

  async getVisitorByEmail(
    supabase: SupabaseClient,
    email: string
  ): Promise<VisitorProfile | null> {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching visitor by email:', error);
    }
    return data;
  },

  // Event operations
  async insertEvent(
    supabase: SupabaseClient,
    event: Partial<TrackingEvent>
  ): Promise<TrackingEvent | null> {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();

    if (error) {
      console.error('Error inserting event:', error);
      return null;
    }
    return data;
  },

  async getEventsByVisitor(
    supabase: SupabaseClient,
    visitorId: string,
    limit = 100
  ): Promise<TrackingEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('visitor_id', visitorId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    return data || [];
  },

  async getEventsByFingerprint(
    supabase: SupabaseClient,
    fingerprintId: string,
    limit = 100
  ): Promise<TrackingEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('fingerprint_id', fingerprintId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    return data || [];
  },

  // Conversion operations
  async insertConversion(
    supabase: SupabaseClient,
    conversion: Partial<Conversion>
  ): Promise<Conversion | null> {
    const { data, error } = await supabase
      .from('conversions')
      .insert(conversion)
      .select()
      .single();

    if (error) {
      console.error('Error inserting conversion:', error);
      return null;
    }
    return data;
  },

  async getConversionsForUpload(
    supabase: SupabaseClient,
    platform: 'meta' | 'google'
  ): Promise<Conversion[]> {
    const column = platform === 'meta' ? 'meta_uploaded' : 'google_uploaded';
    const { data, error } = await supabase
      .from('conversions')
      .select('*')
      .eq(column, false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching conversions:', error);
      return [];
    }
    return data || [];
  },

  async markConversionUploaded(
    supabase: SupabaseClient,
    conversionId: string,
    platform: 'meta' | 'google'
  ): Promise<boolean> {
    const updateData =
      platform === 'meta'
        ? { meta_uploaded: true, meta_upload_time: new Date().toISOString() }
        : { google_uploaded: true, google_upload_time: new Date().toISOString() };

    const { error } = await supabase
      .from('conversions')
      .update(updateData)
      .eq('id', conversionId);

    if (error) {
      console.error('Error marking conversion uploaded:', error);
      return false;
    }
    return true;
  },

  // Analytics queries
  async getConversionsByDateRange(
    supabase: SupabaseClient,
    startDate: string,
    endDate: string
  ): Promise<Conversion[]> {
    const { data, error } = await supabase
      .from('conversions')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversions:', error);
      return [];
    }
    return data || [];
  },

  async getVisitorJourney(
    supabase: SupabaseClient,
    email: string
  ): Promise<{ visitor: VisitorProfile | null; events: TrackingEvent[]; conversions: Conversion[] }> {
    const visitor = await this.getVisitorByEmail(supabase, email);
    if (!visitor) {
      return { visitor: null, events: [], conversions: [] };
    }

    const [events, conversions] = await Promise.all([
      this.getEventsByVisitor(supabase, visitor.id),
      supabase
        .from('conversions')
        .select('*')
        .eq('visitor_id', visitor.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => data || []),
    ]);

    return { visitor, events, conversions };
  },
};
