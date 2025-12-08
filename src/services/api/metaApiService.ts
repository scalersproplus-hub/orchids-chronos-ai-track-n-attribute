/**
 * Meta Conversions API Service
 * Real implementation with proper hashing and event sending
 */

interface MetaConfig {
    pixelId: string;
    accessToken: string;
    testEventCode?: string;
}

interface UserData {
    em?: string;  // Hashed email
    ph?: string;  // Hashed phone
    fn?: string;  // Hashed first name
    ln?: string;  // Hashed last name
    ct?: string;  // Hashed city
    st?: string;  // Hashed state
    zp?: string;  // Hashed zip
    country?: string;  // Hashed country
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;  // Facebook Click ID
    fbp?: string;  // Facebook Browser ID
    external_id?: string;  // Your internal user ID
}

interface MetaEvent {
    event_name: string;
    event_time: number;
    event_id: string;
    action_source: 'website' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
    event_source_url?: string;
    user_data: UserData;
    custom_data?: {
        value?: number;
        currency?: string;
        content_name?: string;
        content_category?: string;
        content_ids?: string[];
        num_items?: number;
    };
}

export class MetaCapiService {
    private config: MetaConfig;

    constructor(config: MetaConfig) {
        this.config = config;
    }

    /**
     * SHA-256 hash a string (for PII)
     */
    private async sha256(message: string): Promise<string> {
        if (!message) return '';
        
        // Normalize: trim and lowercase
        const normalized = message.trim().toLowerCase();
        
        // Convert to UTF-8 bytes
        const msgBuffer = new TextEncoder().encode(normalized);
        
        // Hash using Web Crypto API
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        
        // Convert to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    }

    /**
     * Prepare user data with proper hashing
     */
    async prepareUserData(userData: {
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
        ipAddress?: string;
        userAgent?: string;
        fbc?: string;
        fbp?: string;
        externalId?: string;
    }): Promise<UserData> {
        const prepared: UserData = {};

        // Hash PII fields
        if (userData.email) prepared.em = await this.sha256(userData.email);
        if (userData.phone) {
            // Remove non-numeric characters from phone
            const cleanPhone = userData.phone.replace(/\D/g, '');
            prepared.ph = await this.sha256(cleanPhone);
        }
        if (userData.firstName) prepared.fn = await this.sha256(userData.firstName);
        if (userData.lastName) prepared.ln = await this.sha256(userData.lastName);
        if (userData.city) prepared.ct = await this.sha256(userData.city);
        if (userData.state) prepared.st = await this.sha256(userData.state);
        if (userData.zip) prepared.zp = await this.sha256(userData.zip);
        if (userData.country) prepared.country = await this.sha256(userData.country);

        // Non-hashed fields
        if (userData.ipAddress) prepared.client_ip_address = userData.ipAddress;
        if (userData.userAgent) prepared.client_user_agent = userData.userAgent;
        if (userData.fbc) prepared.fbc = userData.fbc;
        if (userData.fbp) prepared.fbp = userData.fbp;
        if (userData.externalId) prepared.external_id = userData.externalId;

        return prepared;
    }

    /**
     * Send event to Meta Conversions API
     */
    async sendEvent(event: {
        eventName: string;
        eventTime?: number;
        eventId?: string;
        actionSource?: 'website' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
        eventSourceUrl?: string;
        userData: {
            email?: string;
            phone?: string;
            firstName?: string;
            lastName?: string;
            city?: string;
            state?: string;
            zip?: string;
            country?: string;
            ipAddress?: string;
            userAgent?: string;
            fbc?: string;
            fbp?: string;
            externalId?: string;
        };
        customData?: {
            value?: number;
            currency?: string;
            contentName?: string;
            contentCategory?: string;
            contentIds?: string[];
            numItems?: number;
        };
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            // Prepare user data with hashing
            const preparedUserData = await this.prepareUserData(event.userData);

            // Build the event payload
            const metaEvent: MetaEvent = {
                event_name: event.eventName,
                event_time: event.eventTime || Math.floor(Date.now() / 1000),
                event_id: event.eventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                action_source: event.actionSource || 'website',
                user_data: preparedUserData
            };

            if (event.eventSourceUrl) {
                metaEvent.event_source_url = event.eventSourceUrl;
            }

            if (event.customData) {
                metaEvent.custom_data = {
                    value: event.customData.value,
                    currency: event.customData.currency || 'USD',
                    content_name: event.customData.contentName,
                    content_category: event.customData.contentCategory,
                    content_ids: event.customData.contentIds,
                    num_items: event.customData.numItems
                };
            }

            // Build final payload
            const payload: any = {
                data: [metaEvent]
            };

            // Add test event code if provided
            if (this.config.testEventCode) {
                payload.test_event_code = this.config.testEventCode;
            }

            // Send to Meta
            const url = `https://graph.facebook.com/v19.0/${this.config.pixelId}/events?access_token=${this.config.accessToken}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error?.message || `HTTP ${response.status}: ${response.statusText}`
                };
            }

            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Test the connection by sending a test PageView event
     */
    async testConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
        return this.sendEvent({
            eventName: 'PageView',
            userData: {
                email: 'test@chronos.ai',
                ipAddress: '127.0.0.1',
                userAgent: 'ChronosTestAgent/1.0'
            }
        });
    }
}

/**
 * Create a Meta CAPI service instance
 */
export const createMetaCapiService = (config: MetaConfig): MetaCapiService => {
    return new MetaCapiService(config);
};