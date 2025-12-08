/**
 * Meta (Facebook) Conversions API Service
 * Server-side event tracking that bypasses ad blockers and cookie restrictions
 */

import { hashEmail, hashPhone } from '../fingerprintService';

export interface MetaCapiConfig {
  pixelId: string;
  accessToken: string;
  testEventCode?: string; // For testing in Events Manager
}

export interface MetaUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  externalId?: string; // Your customer ID
  fbc?: string; // Facebook click ID cookie
  fbp?: string; // Facebook browser ID cookie
  clientIpAddress?: string;
  clientUserAgent?: string;
}

export interface MetaCustomData {
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  contentType?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  numItems?: number;
  orderId?: string;
  searchString?: string;
  status?: string;
}

export interface MetaEvent {
  eventName: string;
  eventTime: number; // Unix timestamp in seconds
  eventId: string; // For deduplication
  eventSourceUrl: string;
  actionSource: 'website' | 'app' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
  userData: MetaUserData;
  customData?: MetaCustomData;
  optOut?: boolean;
}

// Hash user data for privacy-safe transmission
const prepareUserData = async (userData: MetaUserData): Promise<Record<string, any>> => {
  const hashed: Record<string, any> = {};

  // Hash PII fields
  if (userData.email) {
    hashed.em = [await hashEmail(userData.email)];
  }
  if (userData.phone) {
    hashed.ph = [await hashPhone(userData.phone)];
  }
  if (userData.firstName) {
    hashed.fn = [await hashString(userData.firstName.toLowerCase().trim())];
  }
  if (userData.lastName) {
    hashed.ln = [await hashString(userData.lastName.toLowerCase().trim())];
  }
  if (userData.city) {
    hashed.ct = [await hashString(userData.city.toLowerCase().replace(/\s/g, ''))];
  }
  if (userData.state) {
    hashed.st = [await hashString(userData.state.toLowerCase().trim())];
  }
  if (userData.zip) {
    hashed.zp = [await hashString(userData.zip.trim())];
  }
  if (userData.country) {
    hashed.country = [await hashString(userData.country.toLowerCase().trim())];
  }

  // Non-hashed fields
  if (userData.externalId) {
    hashed.external_id = [userData.externalId];
  }
  if (userData.fbc) {
    hashed.fbc = userData.fbc;
  }
  if (userData.fbp) {
    hashed.fbp = userData.fbp;
  }
  if (userData.clientIpAddress) {
    hashed.client_ip_address = userData.clientIpAddress;
  }
  if (userData.clientUserAgent) {
    hashed.client_user_agent = userData.clientUserAgent;
  }

  return hashed;
};

// Helper to hash any string
const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Prepare custom data for API
const prepareCustomData = (customData?: MetaCustomData): Record<string, any> | undefined => {
  if (!customData) return undefined;

  const prepared: Record<string, any> = {};

  if (customData.value !== undefined) prepared.value = customData.value;
  if (customData.currency) prepared.currency = customData.currency.toUpperCase();
  if (customData.contentName) prepared.content_name = customData.contentName;
  if (customData.contentCategory) prepared.content_category = customData.contentCategory;
  if (customData.contentIds) prepared.content_ids = customData.contentIds;
  if (customData.contentType) prepared.content_type = customData.contentType;
  if (customData.contents) prepared.contents = customData.contents;
  if (customData.numItems !== undefined) prepared.num_items = customData.numItems;
  if (customData.orderId) prepared.order_id = customData.orderId;
  if (customData.searchString) prepared.search_string = customData.searchString;
  if (customData.status) prepared.status = customData.status;

  return Object.keys(prepared).length > 0 ? prepared : undefined;
};

/**
 * Send events to Meta Conversions API
 */
export const sendMetaCapiEvents = async (
  config: MetaCapiConfig,
  events: MetaEvent[]
): Promise<{
  success: boolean;
  eventsReceived?: number;
  fbtraceid?: string;
  messages?: string[];
  error?: string;
}> => {
  const { pixelId, accessToken, testEventCode } = config;

  if (!pixelId || !accessToken) {
    return {
      success: false,
      error: 'Missing Pixel ID or Access Token',
    };
  }

  try {
    // Prepare events for API
    const preparedEvents = await Promise.all(
      events.map(async (event) => {
        const prepared: Record<string, any> = {
          event_name: event.eventName,
          event_time: event.eventTime,
          event_id: event.eventId,
          event_source_url: event.eventSourceUrl,
          action_source: event.actionSource,
          user_data: await prepareUserData(event.userData),
        };

        const customData = prepareCustomData(event.customData);
        if (customData) {
          prepared.custom_data = customData;
        }

        if (event.optOut) {
          prepared.opt_out = true;
        }

        return prepared;
      })
    );

    // Build request payload
    const payload: Record<string, any> = {
      data: preparedEvents,
    };

    if (testEventCode) {
      payload.test_event_code = testEventCode;
    }

    // Make API request
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    console.log('--- META CAPI REQUEST ---');
    console.log('URL:', url);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    console.log('--- META CAPI RESPONSE ---');
    console.log('Response:', JSON.stringify(result, null, 2));

    if (response.ok) {
      return {
        success: true,
        eventsReceived: result.events_received,
        fbtraceid: result.fbtrace_id,
        messages: result.messages,
      };
    } else {
      return {
        success: false,
        error: result.error?.message || 'Unknown error',
      };
    }
  } catch (error) {
    console.error('Meta CAPI Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Standard event helpers
 */
export const MetaEvents = {
  // Page View
  pageView: (
    config: MetaCapiConfig,
    userData: MetaUserData,
    eventSourceUrl: string,
    eventId: string
  ) =>
    sendMetaCapiEvents(config, [
      {
        eventName: 'PageView',
        eventTime: Math.floor(Date.now() / 1000),
        eventId,
        eventSourceUrl,
        actionSource: 'website',
        userData,
      },
    ]),

  // View Content
  viewContent: (
    config: MetaCapiConfig,
    userData: MetaUserData,
    eventSourceUrl: string,
    eventId: string,
    customData: { contentName?: string; contentIds?: string[]; contentType?: string; value?: number; currency?: string }
  ) =>
    sendMetaCapiEvents(config, [
      {
        eventName: 'ViewContent',
        eventTime: Math.floor(Date.now() / 1000),
        eventId,
        eventSourceUrl,
        actionSource: 'website',
        userData,
        customData,
      },
    ]),

  // Add to Cart
  addToCart: (
    config: MetaCapiConfig,
    userData: MetaUserData,
    eventSourceUrl: string,
    eventId: string,
    customData: { contentIds: string[]; contentType?: string; contents?: Array<{ id: string; quantity: number }>; value: number; currency: string }
  ) =>
    sendMetaCapiEvents(config, [
      {
        eventName: 'AddToCart',
        eventTime: Math.floor(Date.now() / 1000),
        eventId,
        eventSourceUrl,
        actionSource: 'website',
        userData,
        customData,
      },
    ]),

  // Initiate Checkout
  initiateCheckout: (
    config: MetaCapiConfig,
    userData: MetaUserData,
    eventSourceUrl: string,
    eventId: string,
    customData: { contentIds?: string[]; numItems?: number; value: number; currency: string }
  ) =>
    sendMetaCapiEvents(config, [
      {
        eventName: 'InitiateCheckout',
        eventTime: Math.floor(Date.now() / 1000),
        eventId,
        eventSourceUrl,
        actionSource: 'website',
        userData,
        customData,
      },
    ]),

  // Purchase
  purchase: (
    config: MetaCapiConfig,
    userData: MetaUserData,
    eventSourceUrl: string,
    eventId: string,
    customData: { contentIds?: string[]; contents?: Array<{ id: string; quantity: number; item_price?: number }>; numItems?: number; value: number; currency: string; orderId?: string }
  ) =>
    sendMetaCapiEvents(config, [
      {
        eventName: 'Purchase',
        eventTime: Math.floor(Date.now() / 1000),
        eventId,
        eventSourceUrl,
        actionSource: 'website',
        userData,
        customData,
      },
    ]),

  // Lead
  lead: (
    config: MetaCapiConfig,
    userData: MetaUserData,
    eventSourceUrl: string,
    eventId: string,
    customData?: { contentName?: string; value?: number; currency?: string }
  ) =>
    sendMetaCapiEvents(config, [
      {
        eventName: 'Lead',
        eventTime: Math.floor(Date.now() / 1000),
        eventId,
        eventSourceUrl,
        actionSource: 'website',
        userData,
        customData,
      },
    ]),

  // Complete Registration
  completeRegistration: (
    config: MetaCapiConfig,
    userData: MetaUserData,
    eventSourceUrl: string,
    eventId: string,
    customData?: { contentName?: string; status?: string; value?: number; currency?: string }
  ) =>
    sendMetaCapiEvents(config, [
      {
        eventName: 'CompleteRegistration',
        eventTime: Math.floor(Date.now() / 1000),
        eventId,
        eventSourceUrl,
        actionSource: 'website',
        userData,
        customData,
      },
    ]),

  // Custom Event
  custom: (
    config: MetaCapiConfig,
    eventName: string,
    userData: MetaUserData,
    eventSourceUrl: string,
    eventId: string,
    customData?: MetaCustomData
  ) =>
    sendMetaCapiEvents(config, [
      {
        eventName,
        eventTime: Math.floor(Date.now() / 1000),
        eventId,
        eventSourceUrl,
        actionSource: 'website',
        userData,
        customData,
      },
    ]),
};

// Export hashEmail and hashPhone for use in other services
export { hashEmail, hashPhone };
