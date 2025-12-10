import { supabase } from '../supabaseClient';

interface PixelEvent {
  pixel_id: string;
  event_name: string;
  event_id: string;
  timestamp: string;
  fingerprint_id: string;
  session_id: string;
  page_url: string;
  page_path: string;
  page_title: string;
  referrer?: string;
  fraud_score?: number;
  fraud_signals?: string[];
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  ttclid?: string;
  msclkid?: string;
  fbc?: string;
  fbp?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  userAgent?: string;
  screen?: string;
  viewport?: string;
  language?: string;
  timezone?: string;
  user_data?: Record<string, unknown>;
  replay_events?: Array<{
    type: string;
    x?: number;
    y?: number;
    target?: string;
    scrollY?: number;
    scrollPercent?: number;
    ts: number;
  }>;
  [key: string]: unknown;
}

interface ProcessedEvent {
  id: string;
  pixel_id: string;
  event_name: string;
  event_id: string;
  timestamp: string;
  fingerprint_id: string;
  session_id: string;
  page_url: string;
  page_path: string;
  page_title: string;
  referrer: string | null;
  fraud_score: number;
  fraud_signals: string[];
  click_ids: Record<string, string>;
  utm_params: Record<string, string>;
  device_info: Record<string, string>;
  user_data: Record<string, unknown> | null;
  extra_data: Record<string, unknown>;
  processed_at: string;
}

export class PixelEventsService {
  async processEvents(events: PixelEvent[]): Promise<{ success: boolean; processed: number; errors: string[] }> {
    const errors: string[] = [];
    let processed = 0;

    for (const event of events) {
      try {
        const processedEvent = this.transformEvent(event);
        
        const { error } = await supabase
          .from('pixel_events')
          .insert(processedEvent);

        if (error) {
          errors.push(`Event ${event.event_id}: ${error.message}`);
        } else {
          processed++;
          
          if (event.event_name !== 'PageView' && event.event_name !== 'SessionReplay') {
            await this.forwardToConversionAPIs(event);
          }
        }
      } catch (e) {
        errors.push(`Event ${event.event_id}: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }

    return { success: errors.length === 0, processed, errors };
  }

  private transformEvent(event: PixelEvent): Omit<ProcessedEvent, 'id'> {
    const clickIds: Record<string, string> = {};
    const utmParams: Record<string, string> = {};
    const deviceInfo: Record<string, string> = {};
    const extraData: Record<string, unknown> = {};

    const clickIdKeys = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'ttclid', 'msclkid', 'fbc', 'fbp'];
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const deviceKeys = ['deviceType', 'browser', 'os', 'userAgent', 'screen', 'viewport', 'language', 'timezone'];
    const coreKeys = ['pixel_id', 'event_name', 'event_id', 'timestamp', 'fingerprint_id', 'session_id', 
                      'page_url', 'page_path', 'page_title', 'referrer', 'fraud_score', 'fraud_signals', 'user_data'];

    for (const key of clickIdKeys) {
      if (event[key]) clickIds[key] = event[key] as string;
    }

    for (const key of utmKeys) {
      if (event[key]) utmParams[key] = event[key] as string;
    }

    for (const key of deviceKeys) {
      if (event[key]) deviceInfo[key] = event[key] as string;
    }

    const allKnownKeys = [...clickIdKeys, ...utmKeys, ...deviceKeys, ...coreKeys];
    for (const key of Object.keys(event)) {
      if (!allKnownKeys.includes(key)) {
        extraData[key] = event[key];
      }
    }

    return {
      pixel_id: event.pixel_id,
      event_name: event.event_name,
      event_id: event.event_id,
      timestamp: event.timestamp,
      fingerprint_id: event.fingerprint_id,
      session_id: event.session_id,
      page_url: event.page_url,
      page_path: event.page_path,
      page_title: event.page_title,
      referrer: event.referrer || null,
      fraud_score: event.fraud_score || 0,
      fraud_signals: event.fraud_signals || [],
      click_ids: clickIds,
      utm_params: utmParams,
      device_info: deviceInfo,
      user_data: event.user_data || null,
      extra_data: extraData,
      processed_at: new Date().toISOString()
    };
  }

  private async forwardToConversionAPIs(event: PixelEvent): Promise<void> {
    const eventMapping: Record<string, string> = {
      'Purchase': 'Purchase',
      'Lead': 'Lead',
      'CompleteRegistration': 'CompleteRegistration',
      'AddToCart': 'AddToCart',
      'InitiateCheckout': 'InitiateCheckout',
      'ViewContent': 'ViewContent',
      'Subscribe': 'Subscribe',
      'Search': 'Search'
    };

    const mappedEvent = eventMapping[event.event_name];
    if (!mappedEvent) return;

    console.log(`[PixelEventsService] Would forward ${event.event_name} to Meta CAPI and Google Ads`);
  }

  async getEventsByPixelId(pixelId: string, limit = 100): Promise<ProcessedEvent[]> {
    const { data, error } = await supabase
      .from('pixel_events')
      .select('*')
      .eq('pixel_id', pixelId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getEventsByFingerprint(fingerprintId: string, limit = 100): Promise<ProcessedEvent[]> {
    const { data, error } = await supabase
      .from('pixel_events')
      .select('*')
      .eq('fingerprint_id', fingerprintId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getSessionEvents(sessionId: string): Promise<ProcessedEvent[]> {
    const { data, error } = await supabase
      .from('pixel_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getFraudulentEvents(minScore = 50, limit = 100): Promise<ProcessedEvent[]> {
    const { data, error } = await supabase
      .from('pixel_events')
      .select('*')
      .gte('fraud_score', minScore)
      .order('fraud_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

export const pixelEventsService = new PixelEventsService();
