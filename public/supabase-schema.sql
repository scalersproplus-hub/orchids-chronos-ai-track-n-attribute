-- ============================================
-- CHRONOS AI - SUPABASE DATABASE SCHEMA
-- ============================================
-- 
-- This SQL script creates all the tables needed for the Chronos AI
-- attribution tracking system. Run this in your Supabase SQL Editor.
--
-- Features:
-- - Visitor fingerprinting and identity resolution
-- - Event tracking with full attribution data
-- - Conversion tracking with offline upload status
-- - Cross-device identity graph
-- - RLS DISABLED for maximum compatibility
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DISABLE ROW LEVEL SECURITY (RLS)
-- This ensures the tracking tag can read/write freely
-- ============================================

-- Drop any existing policies first (run these if upgrading)
-- DROP POLICY IF EXISTS "anon_select_visitors" ON visitors;
-- DROP POLICY IF EXISTS "anon_insert_visitors" ON visitors;
-- etc.

-- ============================================
-- 1. VISITORS TABLE
-- Stores unique visitor profiles identified by fingerprint
-- ============================================
DROP TABLE IF EXISTS visitors CASCADE;
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fingerprint_id VARCHAR(64) UNIQUE NOT NULL,
    
    -- Identity data (filled when user identifies themselves)
    email VARCHAR(255),
    email_hash VARCHAR(64), -- SHA-256 hash for CAPI matching
    phone VARCHAR(50),
    phone_hash VARCHAR(64), -- SHA-256 hash for CAPI matching
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    
    -- Tracking metadata
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_visits INTEGER DEFAULT 1,
    total_pageviews INTEGER DEFAULT 1,
    total_events INTEGER DEFAULT 0,
    
    -- Device tracking (arrays to track multiple devices)
    device_ids TEXT[] DEFAULT '{}',
    ip_addresses TEXT[] DEFAULT '{}',
    user_agents TEXT[] DEFAULT '{}',
    
    -- First touch attribution
    first_utm_source VARCHAR(255),
    first_utm_medium VARCHAR(255),
    first_utm_campaign VARCHAR(255),
    first_gclid VARCHAR(255),
    first_fbclid VARCHAR(255),
    first_referrer TEXT,
    
    -- Custom properties
    custom_properties JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS on visitors
ALTER TABLE visitors DISABLE ROW LEVEL SECURITY;

-- Grant full access to anon and authenticated roles
GRANT ALL ON visitors TO anon;
GRANT ALL ON visitors TO authenticated;
GRANT ALL ON visitors TO service_role;

-- Indexes for visitor lookups
CREATE INDEX IF NOT EXISTS idx_visitors_fingerprint ON visitors(fingerprint_id);
CREATE INDEX IF NOT EXISTS idx_visitors_email ON visitors(email);
CREATE INDEX IF NOT EXISTS idx_visitors_email_hash ON visitors(email_hash);
CREATE INDEX IF NOT EXISTS idx_visitors_phone_hash ON visitors(phone_hash);
CREATE INDEX IF NOT EXISTS idx_visitors_first_seen ON visitors(first_seen);
CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON visitors(last_seen);

-- ============================================
-- 2. EVENTS TABLE
-- Stores all tracking events (pageviews, clicks, etc.)
-- ============================================
DROP TABLE IF EXISTS events CASCADE;
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
    fingerprint_id VARCHAR(64) NOT NULL,
    
    -- Event details
    event_name VARCHAR(100) NOT NULL,
    event_id VARCHAR(100) UNIQUE, -- For deduplication
    event_type VARCHAR(50) DEFAULT 'custom', -- pageview, click, form_submit, purchase, custom
    
    -- Page data
    page_url TEXT,
    page_title VARCHAR(500),
    referrer TEXT,
    
    -- UTM parameters
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_term VARCHAR(255),
    
    -- Ad platform click IDs
    gclid VARCHAR(255),
    gbraid VARCHAR(255),
    wbraid VARCHAR(255),
    fbclid VARCHAR(255),
    fbc VARCHAR(255), -- Facebook cookie
    fbp VARCHAR(255), -- Facebook browser ID
    ttclid VARCHAR(255), -- TikTok click ID
    msclkid VARCHAR(255), -- Microsoft click ID
    
    -- Device info
    device_type VARCHAR(20), -- mobile, desktop, tablet
    browser VARCHAR(50),
    os VARCHAR(50),
    user_agent TEXT,
    ip_address VARCHAR(45),
    
    -- Location (from IP)
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    
    -- Event value (for purchase events)
    event_value DECIMAL(12, 2),
    event_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Custom event data
    custom_data JSONB DEFAULT '{}',
    
    -- Timestamps
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS on events
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Grant full access
GRANT ALL ON events TO anon;
GRANT ALL ON events TO authenticated;
GRANT ALL ON events TO service_role;

-- Indexes for event queries
CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_fingerprint ON events(fingerprint_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_time ON events(event_time);
CREATE INDEX IF NOT EXISTS idx_events_gclid ON events(gclid);
CREATE INDEX IF NOT EXISTS idx_events_fbclid ON events(fbclid);
CREATE INDEX IF NOT EXISTS idx_events_utm_source ON events(utm_source);

-- ============================================
-- 3. CONVERSIONS TABLE
-- Stores purchase/conversion events for offline upload
-- ============================================
DROP TABLE IF EXISTS conversions CASCADE;
CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
    fingerprint_id VARCHAR(64),
    
    -- Customer identity
    email VARCHAR(255),
    email_hash VARCHAR(64),
    phone VARCHAR(50),
    phone_hash VARCHAR(64),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    
    -- Conversion details
    order_id VARCHAR(100),
    conversion_value DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    conversion_type VARCHAR(50) DEFAULT 'purchase', -- purchase, lead, signup, etc.
    
    -- Products (for e-commerce)
    products JSONB DEFAULT '[]', -- [{id, name, price, quantity}]
    
    -- Attribution click IDs
    gclid VARCHAR(255),
    gbraid VARCHAR(255),
    wbraid VARCHAR(255),
    fbc VARCHAR(255),
    fbp VARCHAR(255),
    
    -- Attribution data (full journey)
    attribution_data JSONB DEFAULT '{}', -- {first_touch, last_touch, touchpoints}
    
    -- Meta CAPI upload status
    meta_uploaded BOOLEAN DEFAULT FALSE,
    meta_upload_time TIMESTAMP WITH TIME ZONE,
    meta_upload_response JSONB,
    meta_event_id VARCHAR(100),
    
    -- Google Ads OCI upload status
    google_uploaded BOOLEAN DEFAULT FALSE,
    google_upload_time TIMESTAMP WITH TIME ZONE,
    google_upload_response JSONB,
    
    -- Timestamps
    conversion_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS on conversions
ALTER TABLE conversions DISABLE ROW LEVEL SECURITY;

-- Grant full access
GRANT ALL ON conversions TO anon;
GRANT ALL ON conversions TO authenticated;
GRANT ALL ON conversions TO service_role;

-- Indexes for conversion queries
CREATE INDEX IF NOT EXISTS idx_conversions_visitor ON conversions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_conversions_email ON conversions(email);
CREATE INDEX IF NOT EXISTS idx_conversions_order_id ON conversions(order_id);
CREATE INDEX IF NOT EXISTS idx_conversions_meta_uploaded ON conversions(meta_uploaded);
CREATE INDEX IF NOT EXISTS idx_conversions_google_uploaded ON conversions(google_uploaded);
CREATE INDEX IF NOT EXISTS idx_conversions_time ON conversions(conversion_time);
CREATE INDEX IF NOT EXISTS idx_conversions_gclid ON conversions(gclid);

-- ============================================
-- 4. IDENTITY_GRAPH TABLE
-- Links multiple devices/sessions to the same user
-- ============================================
DROP TABLE IF EXISTS identity_graph CASCADE;
CREATE TABLE identity_graph (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
    
    -- Identity signals
    fingerprint_id VARCHAR(64) NOT NULL,
    device_id VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Match metadata
    match_type VARCHAR(20) NOT NULL, -- deterministic, probabilistic
    confidence_score INTEGER DEFAULT 50, -- 0-100
    
    -- Device info at time of match
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    ip_address VARCHAR(45),
    
    -- Timestamps
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS on identity_graph
ALTER TABLE identity_graph DISABLE ROW LEVEL SECURITY;

-- Grant full access
GRANT ALL ON identity_graph TO anon;
GRANT ALL ON identity_graph TO authenticated;
GRANT ALL ON identity_graph TO service_role;

-- Indexes for identity resolution
CREATE INDEX IF NOT EXISTS idx_identity_visitor ON identity_graph(visitor_id);
CREATE INDEX IF NOT EXISTS idx_identity_fingerprint ON identity_graph(fingerprint_id);
CREATE INDEX IF NOT EXISTS idx_identity_email ON identity_graph(email);
CREATE INDEX IF NOT EXISTS idx_identity_match_type ON identity_graph(match_type);

-- ============================================
-- 5. CAMPAIGNS TABLE
-- Stores campaign performance data
-- ============================================
DROP TABLE IF EXISTS campaigns CASCADE;
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Campaign identity
    platform VARCHAR(50) NOT NULL, -- facebook, google, tiktok, etc.
    platform_campaign_id VARCHAR(100),
    campaign_name VARCHAR(500),
    
    -- Campaign metadata
    status VARCHAR(20) DEFAULT 'active', -- active, paused, deleted
    objective VARCHAR(100),
    
    -- Performance metrics (synced from ad platforms)
    spend DECIMAL(12, 2) DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    platform_conversions INTEGER DEFAULT 0,
    platform_revenue DECIMAL(12, 2) DEFAULT 0,
    
    -- Chronos tracked metrics
    chronos_conversions INTEGER DEFAULT 0,
    chronos_revenue DECIMAL(12, 2) DEFAULT 0,
    
    -- Date range
    date_start DATE,
    date_end DATE,
    
    -- Timestamps
    last_synced TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS on campaigns
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- Grant full access
GRANT ALL ON campaigns TO anon;
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaigns TO service_role;

-- Indexes for campaign queries
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_name ON campaigns(campaign_name);

-- ============================================
-- 6. UPLOAD_BATCHES TABLE
-- Tracks offline conversion upload history
-- ============================================
DROP TABLE IF EXISTS upload_batches CASCADE;
CREATE TABLE upload_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Batch info
    platform VARCHAR(20) NOT NULL, -- meta, google
    batch_type VARCHAR(20) DEFAULT 'manual', -- manual, csv, auto
    
    -- Results
    total_conversions INTEGER DEFAULT 0,
    successful_uploads INTEGER DEFAULT 0,
    failed_uploads INTEGER DEFAULT 0,
    match_rate DECIMAL(5, 2), -- percentage
    
    -- Response data
    response_data JSONB DEFAULT '{}',
    error_log TEXT,
    
    -- Timestamps
    upload_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS on upload_batches
ALTER TABLE upload_batches DISABLE ROW LEVEL SECURITY;

-- Grant full access
GRANT ALL ON upload_batches TO anon;
GRANT ALL ON upload_batches TO authenticated;
GRANT ALL ON upload_batches TO service_role;

-- Index for upload history
CREATE INDEX IF NOT EXISTS idx_upload_batches_platform ON upload_batches(platform);
CREATE INDEX IF NOT EXISTS idx_upload_batches_time ON upload_batches(upload_time);

-- ============================================
-- 7. WEBHOOK_LOGS TABLE (NEW - For real-time integrations)
-- Logs incoming/outgoing webhooks
-- ============================================
DROP TABLE IF EXISTS webhook_logs CASCADE;
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Webhook details
    direction VARCHAR(10) NOT NULL, -- inbound, outbound
    endpoint VARCHAR(500),
    method VARCHAR(10) DEFAULT 'POST',
    
    -- Request/Response
    headers JSONB DEFAULT '{}',
    payload JSONB DEFAULT '{}',
    response_status INTEGER,
    response_body TEXT,
    
    -- Metadata
    source VARCHAR(100), -- shopify, klaviyo, zapier, etc.
    event_type VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS on webhook_logs
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;

-- Grant full access
GRANT ALL ON webhook_logs TO anon;
GRANT ALL ON webhook_logs TO authenticated;
GRANT ALL ON webhook_logs TO service_role;

CREATE INDEX IF NOT EXISTS idx_webhook_logs_source ON webhook_logs(source);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at);

-- ============================================
-- 8. SETTINGS TABLE (NEW - Store account settings)
-- ============================================
DROP TABLE IF EXISTS settings CASCADE;
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Meta/Facebook settings
    meta_pixel_id VARCHAR(100),
    meta_capi_token TEXT,
    meta_test_code VARCHAR(50),
    
    -- Google Ads settings
    google_customer_id VARCHAR(50),
    google_conversion_id VARCHAR(100),
    google_conversion_label VARCHAR(100),
    google_developer_token TEXT,
    
    -- CNAME/First-party domain settings
    tracking_domain VARCHAR(255), -- e.g., track.yourdomain.com
    tracking_domain_verified BOOLEAN DEFAULT FALSE,
    
    -- Webhook settings
    webhook_secret VARCHAR(100),
    webhook_endpoints JSONB DEFAULT '[]',
    
    -- Data retention
    data_retention_days INTEGER DEFAULT 365,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS on settings
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Grant full access
GRANT ALL ON settings TO anon;
GRANT ALL ON settings TO authenticated;
GRANT ALL ON settings TO service_role;

CREATE INDEX IF NOT EXISTS idx_settings_account ON settings(account_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update visitor's last_seen timestamp
CREATE OR REPLACE FUNCTION update_visitor_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE visitors 
    SET last_seen = NOW(), 
        total_events = total_events + 1,
        updated_at = NOW()
    WHERE fingerprint_id = NEW.fingerprint_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update visitor on new event
DROP TRIGGER IF EXISTS trigger_update_visitor_on_event ON events;
CREATE TRIGGER trigger_update_visitor_on_event
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_visitor_last_seen();

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_visitors_updated ON visitors;
CREATE TRIGGER trigger_visitors_updated
    BEFORE UPDATE ON visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_conversions_updated ON conversions;
CREATE TRIGGER trigger_conversions_updated
    BEFORE UPDATE ON conversions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_settings_updated ON settings;
CREATE TRIGGER trigger_settings_updated
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- REALTIME SUBSCRIPTIONS (Enable for live updates)
-- ============================================

-- Enable realtime for events table (for live dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE conversions;

-- ============================================
-- DONE! Your database is ready.
-- RLS is DISABLED - suitable for server-side use.
-- For client-side access, use your anon key.
-- ============================================