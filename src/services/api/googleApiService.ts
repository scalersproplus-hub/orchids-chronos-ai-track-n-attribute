/**
 * Google Ads Offline Conversion Import (OCI) Service
 * Upload offline conversions to Google Ads using the API
 */

import { hashEmail, hashPhone } from '../fingerprintService';

export interface GoogleAdsConfig {
  customerId: string; // Format: 123-456-7890 or 1234567890
  developerToken: string;
  conversionActionId: string;
  conversionActionLabel?: string;
}

export interface GoogleConversion {
  // One of these identifiers is required
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  
  // User identifiers for Enhanced Conversions
  userIdentifiers?: {
    hashedEmail?: string;
    hashedPhoneNumber?: string;
    addressInfo?: {
      hashedFirstName?: string;
      hashedLastName?: string;
      hashedStreetAddress?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      countryCode?: string;
    };
  }[];
  
  // Conversion details
  conversionDateTime: string; // Format: "2023-10-28 10:15:00-07:00"
  conversionValue?: number;
  currencyCode?: string;
  orderId?: string;
  externalAttributionData?: {
    externalAttributionCredit: number;
    externalAttributionModel: string;
  };
}

// Format customer ID to remove dashes
const formatCustomerId = (customerId: string): string => {
  return customerId.replace(/-/g, '');
};

// Format date for Google Ads API
export const formatGoogleDateTime = (date: Date, timezone = 'America/Los_Angeles'): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timezone,
  };
  
  const formatted = new Intl.DateTimeFormat('en-CA', options).format(date);
  // Get timezone offset
  const offset = new Date().toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'shortOffset' });
  const tzMatch = offset.match(/GMT([+-]\d+)/);
  const tzOffset = tzMatch ? tzMatch[1].padStart(3, '0') + ':00' : '-07:00';
  
  return formatted.replace(',', '').replace(/\//g, '-') + tzOffset;
};

/**
 * Prepare user identifiers with proper hashing
 */
export const prepareUserIdentifiers = async (userData: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}): Promise<GoogleConversion['userIdentifiers']> => {
  const identifiers: GoogleConversion['userIdentifiers'] = [];
  
  if (userData.email) {
    identifiers.push({
      hashedEmail: await hashEmail(userData.email),
    });
  }
  
  if (userData.phone) {
    identifiers.push({
      hashedPhoneNumber: await hashPhone(userData.phone),
    });
  }
  
  if (userData.firstName || userData.lastName) {
    const addressInfo: any = {};
    if (userData.firstName) {
      addressInfo.hashedFirstName = await hashString(userData.firstName.toLowerCase().trim());
    }
    if (userData.lastName) {
      addressInfo.hashedLastName = await hashString(userData.lastName.toLowerCase().trim());
    }
    identifiers.push({ addressInfo });
  }
  
  return identifiers.length > 0 ? identifiers : undefined;
};

// Helper to hash any string
const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Upload offline conversions to Google Ads
 * 
 * NOTE: This is a simulation. In production, you need a backend proxy because:
 * 1. The Google Ads API requires OAuth2 authentication
 * 2. Developer tokens should not be exposed client-side
 * 3. The API uses gRPC/REST which needs proper authentication
 * 
 * Recommended: Create a backend endpoint that handles authentication
 */
export const uploadGoogleConversions = async (
  config: GoogleAdsConfig,
  conversions: GoogleConversion[]
): Promise<{
  success: boolean;
  results?: Array<{
    gclid?: string;
    conversionAction: string;
    conversionDateTime: string;
  }>;
  partialFailureError?: any;
  error?: string;
}> => {
  const { customerId, conversionActionId } = config;
  
  if (!customerId || !conversionActionId) {
    return {
      success: false,
      error: 'Missing Customer ID or Conversion Action ID',
    };
  }
  
  const formattedCustomerId = formatCustomerId(customerId);
  const conversionActionResourceName = `customers/${formattedCustomerId}/conversionActions/${conversionActionId}`;
  
  try {
    // Prepare conversion payload
    const payload = {
      customerId: formattedCustomerId,
      conversions: conversions.map(conv => ({
        conversionAction: conversionActionResourceName,
        gclid: conv.gclid,
        gbraid: conv.gbraid,
        wbraid: conv.wbraid,
        conversionDateTime: conv.conversionDateTime,
        conversionValue: conv.conversionValue,
        currencyCode: conv.currencyCode || 'USD',
        orderId: conv.orderId,
        userIdentifiers: conv.userIdentifiers,
        externalAttributionData: conv.externalAttributionData,
      })),
      partialFailure: true,
    };
    
    console.log('--- GOOGLE ADS OCI REQUEST ---');
    console.log('Customer ID:', formattedCustomerId);
    console.log('Conversion Action:', conversionActionResourceName);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // In production, this would call your backend API endpoint
    // which would then make the authenticated call to Google Ads API
    // Example:
    // const response = await fetch('/api/google-ads/conversions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Validate conversions have required identifiers
    const validConversions = conversions.filter(conv => 
      conv.gclid || conv.gbraid || conv.wbraid || 
      (conv.userIdentifiers && conv.userIdentifiers.length > 0)
    );
    
    if (validConversions.length === 0) {
      return {
        success: false,
        error: 'No valid conversions. Each conversion must have gclid, gbraid, wbraid, or user identifiers.',
      };
    }
    
    // Simulate successful response
    const mockResponse = {
      success: true,
      results: validConversions.map(conv => ({
        gclid: conv.gclid,
        gbraid: conv.gbraid,
        wbraid: conv.wbraid,
        conversionAction: conversionActionResourceName,
        conversionDateTime: conv.conversionDateTime,
      })),
      partialFailureError: conversions.length !== validConversions.length 
        ? { message: `${conversions.length - validConversions.length} conversions skipped due to missing identifiers` }
        : null,
    };
    
    console.log('--- GOOGLE ADS OCI RESPONSE ---');
    console.log('Response:', JSON.stringify(mockResponse, null, 2));
    
    return mockResponse;
    
  } catch (error) {
    console.error('Google OCI Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Helper to upload a single purchase conversion
 */
export const uploadPurchaseConversion = async (
  config: GoogleAdsConfig,
  data: {
    gclid?: string;
    gbraid?: string;
    wbraid?: string;
    email?: string;
    phone?: string;
    value: number;
    currency?: string;
    orderId?: string;
    conversionTime?: Date;
    timezone?: string;
  }
): Promise<ReturnType<typeof uploadGoogleConversions>> => {
  const conversionDateTime = formatGoogleDateTime(
    data.conversionTime || new Date(),
    data.timezone
  );
  
  const userIdentifiers = data.email || data.phone
    ? await prepareUserIdentifiers({ email: data.email, phone: data.phone })
    : undefined;
  
  const conversion: GoogleConversion = {
    gclid: data.gclid,
    gbraid: data.gbraid,
    wbraid: data.wbraid,
    userIdentifiers,
    conversionDateTime,
    conversionValue: data.value,
    currencyCode: data.currency || 'USD',
    orderId: data.orderId,
  };
  
  return uploadGoogleConversions(config, [conversion]);
};

/**
 * Helper to upload a lead conversion
 */
export const uploadLeadConversion = async (
  config: GoogleAdsConfig,
  data: {
    gclid?: string;
    gbraid?: string;
    wbraid?: string;
    email?: string;
    phone?: string;
    value?: number;
    currency?: string;
    conversionTime?: Date;
    timezone?: string;
  }
): Promise<ReturnType<typeof uploadGoogleConversions>> => {
  const conversionDateTime = formatGoogleDateTime(
    data.conversionTime || new Date(),
    data.timezone
  );
  
  const userIdentifiers = data.email || data.phone
    ? await prepareUserIdentifiers({ email: data.email, phone: data.phone })
    : undefined;
  
  const conversion: GoogleConversion = {
    gclid: data.gclid,
    gbraid: data.gbraid,
    wbraid: data.wbraid,
    userIdentifiers,
    conversionDateTime,
    conversionValue: data.value,
    currencyCode: data.currency || 'USD',
  };
  
  return uploadGoogleConversions(config, [conversion]);
};

// Re-export config type for use in components
export type { GoogleAdsConfig, GoogleConversion };