/**
 * Supabase Service - Real Database Integration
 * No external SDK needed - uses REST API directly
 */

interface SupabaseConfig {
    url: string;
    key: string;
}

export class SupabaseService {
    private config: SupabaseConfig;

    constructor(config: SupabaseConfig) {
        this.config = config;
    }

    private getHeaders() {
        return {
            'apikey': this.config.key,
            'Authorization': `Bearer ${this.config.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    /**
     * Test database connection
     */
    async testConnection(): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.config.url}/rest/v1/`, {
                method: 'HEAD',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
            }
            
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Insert a lead into the database
     */
    async insertLead(leadData: {
        email: string;
        phone?: string;
        first_name?: string;
        last_name?: string;
        city?: string;
        state?: string;
        country?: string;
        zip?: string;
        external_id?: string;
        meta_lead_id?: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const response = await fetch(`${this.config.url}/rest/v1/leads`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(leadData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: `HTTP ${response.status}: ${errorText}` };
            }

            const data = await response.json();
            return { success: true, data: data[0] };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Insert a web visit (tracking event)
     */
    async insertWebVisit(visitData: {
        lead_id?: string;
        ip_address?: string;
        user_agent?: string;
        fbp?: string;
        fbc?: string;
        gclid?: string;
        wbraid?: string;
        gbraid?: string;
        url?: string;
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const response = await fetch(`${this.config.url}/rest/v1/web_visits`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(visitData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: `HTTP ${response.status}: ${errorText}` };
            }

            const data = await response.json();
            return { success: true, data: data[0] };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Insert an offline conversion event
     */
    async insertOfflineConversion(conversionData: {
        lead_id?: string;
        event_time: string;
        event_name: string;
        value?: number;
        currency?: string;
        platform: string;
        event_id: string;
        upload_status: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const response = await fetch(`${this.config.url}/rest/v1/offline_conversions`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(conversionData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: `HTTP ${response.status}: ${errorText}` };
            }

            const data = await response.json();
            return { success: true, data: data[0] };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Find lead by email
     */
    async findLeadByEmail(email: string): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const response = await fetch(
                `${this.config.url}/rest/v1/leads?email=eq.${encodeURIComponent(email)}&select=*`,
                {
                    method: 'GET',
                    headers: this.getHeaders()
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: `HTTP ${response.status}: ${errorText}` };
            }

            const data = await response.json();
            return { success: true, data: data[0] || null };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all web visits for a lead
     */
    async getWebVisitsByLeadId(leadId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
        try {
            const response = await fetch(
                `${this.config.url}/rest/v1/web_visits?lead_id=eq.${leadId}&select=*&order=timestamp.desc`,
                {
                    method: 'GET',
                    headers: this.getHeaders()
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: `HTTP ${response.status}: ${errorText}` };
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get recent web visits (for live debugging)
     */
    async getRecentWebVisits(limit: number = 100): Promise<{ success: boolean; data?: any[]; error?: string }> {
        try {
            const response = await fetch(
                `${this.config.url}/rest/v1/web_visits?select=*&order=timestamp.desc&limit=${limit}`,
                {
                    method: 'GET',
                    headers: this.getHeaders()
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: `HTTP ${response.status}: ${errorText}` };
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}

/**
 * Create a Supabase service instance
 */
export const createSupabaseService = (config: SupabaseConfig): SupabaseService => {
    return new SupabaseService(config);
};