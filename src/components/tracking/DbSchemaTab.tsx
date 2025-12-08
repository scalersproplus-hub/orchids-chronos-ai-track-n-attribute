import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

const SUPABASE_SQL = `-- ============================================
-- CHRONOS AI ATTRIBUTION - COMPLETE DATABASE SCHEMA
-- ============================================
-- Run this in your Supabase SQL Editor
-- This creates all tables, triggers, and functions needed

-- ============================================
-- STEP 1: Enable Required Extensions
-- ============================================

-- Enable pgcrypto for SHA-256 hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 2: Create Hashing Function
-- ============================================

-- This function automatically hashes PII fields when data is inserted/updated
CREATE OR REPLACE FUNCTION hash_pii()
RETURNS TRIGGER AS $$
BEGIN
    -- Hash email (lowercase, trimmed)
    IF NEW.email IS NOT NULL THEN
        NEW.hashed_email := encode(digest(lower(trim(NEW.email)), 'sha256'), 'hex');
    END IF;
    
    -- Hash phone (remove non-digits, then hash)
    IF NEW.phone IS NOT NULL THEN
        NEW.hashed_phone := encode(digest(regexp_replace(NEW.phone, '[^0-9]', '', 'g'), 'sha256'), 'hex');
    END IF;
    
    -- Hash first name (lowercase, trimmed)
    IF NEW.first_name IS NOT NULL THEN
        NEW.hashed_fn := encode(digest(lower(trim(NEW.first_name)), 'sha256'), 'hex');
    END IF;
    
    -- Hash last name (lowercase, trimmed)
    IF NEW.last_name IS NOT NULL THEN
        NEW.hashed_ln := encode(digest(lower(trim(NEW.last_name)), 'sha256'), 'hex');
    END IF;
    
    -- Hash city (lowercase, trimmed)
    IF NEW.city IS NOT NULL THEN
        NEW.hashed_ct := encode(digest(lower(trim(NEW.city)), 'sha256'), 'hex');
    END IF;
    
    -- Hash state (lowercase, trimmed)
    IF NEW.state IS NOT NULL THEN
        NEW.hashed_st := encode(digest(lower(trim(NEW.state)), 'sha256'), 'hex');
    END IF;
    
    -- Hash zip (as-is)
    IF NEW.zip IS NOT NULL THEN
        NEW.hashed_zp := encode(digest(NEW.zip, 'sha256'), 'hex');
    END IF;
    
    -- Hash country (lowercase, trimmed)
    IF NEW.country IS NOT NULL THEN
        NEW.hashed_country := encode(digest(lower(trim(NEW.country)), 'sha256'), 'hex');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 3: Create Main Tables
-- ============================================

-- LEADS TABLE
-- Stores all customer/lead information
CREATE TABLE IF NOT EXISTS leads (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Raw PII (be careful with access controls)
    email text,
    phone text,
    first_name text,
    last_name text,
    city text,
    state text,
    country text,
    zip text,
    
    -- Identifiers
    external_id text, -- Your internal CRM ID
    meta_lead_id text, -- Meta Lead Ad ID
    chronos_fingerprint_id text, -- Our device fingerprint
    
    -- Hashed PII (for sending to ad platforms)
    hashed_email text,
    hashed_phone text,
    hashed_fn text,
    hashed_ln text,
    hashed_ct text,
    hashed_st text,
    hashed_zp text,
    hashed_country text,
    
    -- Metadata
    source text, -- Where did they come from? e.g., "Facebook Lead Ad", "Website Form"
    status text DEFAULT 'new', -- e.g., "new", "contacted", "qualified", "customer"
    
    CONSTRAINT unique_email UNIQUE (email)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_external_id ON leads(external_id);
CREATE INDEX IF NOT EXISTS idx_leads_fingerprint ON leads(chronos_fingerprint_id);

-- Add trigger to auto-hash PII
CREATE OR REPLACE TRIGGER before_lead_insert_update_hash_pii
BEFORE INSERT OR UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION hash_pii();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- WEB VISITS TABLE
-- Stores every tracking event (pageview, click, etc.)
CREATE TABLE IF NOT EXISTS web_visits (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
    timestamp timestamptz DEFAULT now(),
    
    -- Session Data
    session_id text, -- Browser session identifier
    fingerprint_id text, -- Device fingerprint
    
    -- Network Data
    ip_address inet,
    user_agent text,
    
    -- Ad Platform Identifiers
    fbp text, -- Facebook Browser ID (_fbp cookie)
    fbc text, -- Facebook Click ID (_fbc cookie)
    gclid text, -- Google Click ID
    wbraid text, -- Google Web Fallback
    gbraid text, -- Google App Fallback
    
    -- Page Context
    url text,
    referrer text,
    page_title text,
    
    -- UTM Parameters
    utm_source text,
    utm_medium text,
    utm_campaign text,
    utm_term text,
    utm_content text,
    
    -- Event Type
    event_type text DEFAULT 'pageview', -- e.g., "pageview", "click", "form_submit"
    event_value numeric,
    
    -- Device Info
    device_type text, -- "mobile", "desktop", "tablet"
    os text,
    browser text
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_visits_lead_id ON web_visits(lead_id);
CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON web_visits(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_visits_fingerprint ON web_visits(fingerprint_id);
CREATE INDEX IF NOT EXISTS idx_visits_gclid ON web_visits(gclid);
CREATE INDEX IF NOT EXISTS idx_visits_fbp ON web_visits(fbp);


-- OFFLINE CONVERSIONS TABLE
-- Stores events uploaded to ad platforms
CREATE TABLE IF NOT EXISTS offline_conversions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    
    -- Event Details
    event_time timestamptz NOT NULL,
    event_name text NOT NULL, -- e.g., "Purchase", "Lead", "Schedule"
    event_id text UNIQUE NOT NULL, -- For deduplication
    
    -- Value
    value numeric,
    currency text DEFAULT 'USD',
    
    -- Platform
    platform text NOT NULL, -- "Meta", "Google", "TikTok"
    upload_status text DEFAULT 'pending', -- "pending", "success", "failed"
    upload_response jsonb, -- Store API response
    
    -- Retry Logic
    retry_count int DEFAULT 0,
    last_retry_at timestamptz,
    
    CONSTRAINT valid_platform CHECK (platform IN ('Meta', 'Google', 'TikTok'))
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_conversions_lead_id ON offline_conversions(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversions_platform ON offline_conversions(platform);
CREATE INDEX IF NOT EXISTS idx_conversions_status ON offline_conversions(upload_status);


-- ATTRIBUTION TOUCHPOINTS TABLE
-- Stores the attribution journey for each conversion
CREATE TABLE IF NOT EXISTS attribution_touchpoints (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
    conversion_id uuid REFERENCES offline_conversions(id) ON DELETE CASCADE,
    
    -- Touchpoint Details
    touchpoint_timestamp timestamptz NOT NULL,
    touchpoint_type text NOT NULL, -- "ad_click", "email_open", "organic_search", "direct"
    source text, -- e.g., "Facebook - Campaign X"
    medium text, -- e.g., "cpc", "email", "organic"
    campaign text,
    
    -- Attribution Model Weights
    first_touch_weight numeric DEFAULT 0,
    last_touch_weight numeric DEFAULT 0,
    linear_weight numeric DEFAULT 0,
    time_decay_weight numeric DEFAULT 0,
    u_shaped_weight numeric DEFAULT 0,
    
    -- Position in Journey
    position_index int, -- 0, 1, 2, etc.
    total_touchpoints int
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_touchpoints_lead_id ON attribution_touchpoints(lead_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_conversion_id ON attribution_touchpoints(conversion_id);


-- CAMPAIGNS TABLE (Optional - for tracking campaign metadata)
CREATE TABLE IF NOT EXISTS campaigns (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    
    -- Campaign Details
    name text NOT NULL,
    platform text NOT NULL, -- "Facebook", "Google", "TikTok"
    status text DEFAULT 'active', -- "active", "paused", "archived"
    
    -- Budget & Spend
    daily_budget numeric,
    total_spend numeric DEFAULT 0,
    
    -- Performance (calculated)
    tracked_revenue numeric DEFAULT 0,
    platform_reported_revenue numeric DEFAULT 0,
    
    -- External IDs
    platform_campaign_id text,
    
    CONSTRAINT valid_campaign_platform CHECK (platform IN ('Facebook', 'Google', 'TikTok', 'Email'))
);

CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(platform);


-- ============================================
-- STEP 4: Create Views for Easy Querying
-- ============================================

-- View: Recent Web Visits with Lead Info
CREATE OR REPLACE VIEW v_recent_visits AS
SELECT 
    wv.id,
    wv.timestamp,
    wv.url,
    wv.event_type,
    wv.utm_source,
    wv.utm_campaign,
    wv.device_type,
    l.email,
    l.first_name,
    l.last_name,
    l.chronos_fingerprint_id
FROM web_visits wv
LEFT JOIN leads l ON wv.lead_id = l.id
ORDER BY wv.timestamp DESC
LIMIT 500;

-- View: Conversion Summary
CREATE OR REPLACE VIEW v_conversion_summary AS
SELECT 
    oc.id,
    oc.event_time,
    oc.event_name,
    oc.value,
    oc.currency,
    oc.platform,
    oc.upload_status,
    l.email,
    l.first_name,
    l.last_name
FROM offline_conversions oc
LEFT JOIN leads l ON oc.lead_id = l.id
ORDER BY oc.event_time DESC;

-- Example Data (Optional)
INSERT INTO leads (email, phone, first_name, last_name, city, state, country, zip, source, chronos_fingerprint_id)
VALUES (
    'test@chronos.ai',
    '+15551234567',
    'Test',
    'User',
    'San Francisco',
    'CA',
    'US',
    '94102',
    'Website Form',
    'fp_test_' || substr(md5(random()::text), 1, 32)
)
ON CONFLICT (email) DO NOTHING;
`;

export const DbSchemaTab = () => {
    const [sqlCopied, setSqlCopied] = useState(false);

    const handleCopySQL = () => {
        navigator.clipboard.writeText(SUPABASE_SQL);
        setSqlCopied(true);
        setTimeout(() => setSqlCopied(false), 2000);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Supabase / PostgreSQL Schema</h3>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                        This SQL script creates a complete Tracking & CRM database for storing leads, visits, events, and pipelines.
                    </p>
                </div>
            </div>
            <div className="bg-chronos-900 border border-chronos-800 rounded-lg overflow-hidden flex flex-col h-[500px]">
                 <div className="flex justify-between items-center px-4 py-3 bg-chronos-900 border-b border-chronos-800">
                    <span className="text-xs text-gray-400 font-mono flex items-center gap-2"><Terminal className="w-3 h-3" /> schema.sql</span>
                    <button onClick={handleCopySQL} className="text-xs flex items-center gap-1.5 bg-chronos-800 hover:bg-chronos-700 px-3 py-1.5 rounded transition-all text-gray-200">
                        {sqlCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} {sqlCopied ? 'Copied SQL' : 'Copy SQL'}
                    </button>
                 </div>
                 <div className="flex-1 overflow-auto p-4 bg-[#0d1117]">
                     <pre className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre font-ligature">{SUPABASE_SQL}</pre>
                 </div>
            </div>
        </div>
    )
}