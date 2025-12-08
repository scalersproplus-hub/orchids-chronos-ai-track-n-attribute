-- ============================================
-- CHRONOS AI - SUPABASE DATABASE SCHEMA v2.0
-- ============================================
-- 
-- IMPORTANT: This schema is designed for SINGLE WORKSPACE use
-- without authentication. RLS is COMPLETELY DISABLED.
--
-- INSTALLATION:
-- 1. Go to https://supabase.com/dashboard
-- 2. Create a new project (or use existing)
-- 3. Go to SQL Editor
-- 4. Paste this ENTIRE script and click "Run"
-- 5. Copy your Project URL and anon key from Settings → API
-- 
-- SECURITY NOTE:
-- Since RLS is disabled, anyone with your anon key can read/write.
-- For production, consider:
-- - Using a backend proxy to hide your Supabase credentials
-- - Implementing proper RLS policies with authentication
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: DROP ALL EXISTING TABLES & POLICIES
-- (Safe to run multiple times)
-- ============================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS trigger_update_visitor_on_event ON events;
DROP TRIGGER IF EXISTS trigger_visitors_updated ON visitors;
DROP TRIGGER IF EXISTS trigger_conversions_updated ON conversions;
DROP TRIGGER IF EXISTS trigger_settings_updated ON settings;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_visitor_last_seen() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS webhook_logs CASCADE;
DROP TABLE IF EXISTS upload_batches CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS identity_graph CASCADE;
DROP TABLE IF EXISTS conversions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS fraud_signals CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;

-- ============================================
-- STEP 2: CREATE TABLES (RLS DISABLED)
-- ============================================

-- ----------------------------------------
-- VISITORS TABLE
-- Stores unique visitor profiles
-- ----------------------------------------
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
    external_id VARCHAR(255), -- Your system's user ID
    
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
    
    -- First touch attribution (never changes)
    first_utm_source VARCHAR(255),
    first_utm_medium VARCHAR(255),
    first_utm_campaign VARCHAR(255),
    first_utm_content VARCHAR(255),
    first_utm_term VARCHAR(255),
    first_gclid VARCHAR(255),
    first_fbclid VARCHAR(255),
    first_referrer TEXT,
    first_landing_page TEXT,
    
    -- Last touch attribution (updates with each visit)
    last_utm_source VARCHAR(255),
    last_utm_medium VARCHAR(255),
    last_utm_campaign VARCHAR(255),
    last_gclid VARCHAR(255),
    last_fbclid VARCHAR(255),
    
    -- Calculated scores
    engagement_score INTEGER DEFAULT 0, -- 0-100
    conversion_probability DECIMAL(5, 4) DEFAULT 0, -- 0.0000 to 1.0000
    predicted_ltv DECIMAL(12, 2) DEFAULT 0,
    
    -- Custom properties
    custom_properties JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Fraud detection
    fraud_score INTEGER DEFAULT 0, -- 0-100, higher = more suspicious
    is_bot BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS - Critical for no-auth setup
ALTER TABLE visitors DISABLE ROW LEVEL SECURITY;

-- Grant permissions to all roles
GRANT ALL ON visitors TO anon;
GRANT ALL ON visitors TO authenticated;
GRANT ALL ON visitors TO service_role;

-- Indexes for fast lookups
CREATE INDEX idx_visitors_fingerprint ON visitors(fingerprint_id);
CREATE INDEX idx_visitors_email ON visitors(email);
CREATE INDEX idx_visitors_email_hash ON visitors(email_hash);
CREATE INDEX idx_visitors_external_id ON visitors(external_id);
CREATE INDEX idx_visitors_first_seen ON visitors(first_seen);
CREATE INDEX idx_visitors_last_seen ON visitors(last_seen);
CREATE INDEX idx_visitors_fraud_score ON visitors(fraud_score);

-- ----------------------------------------
-- EVENTS TABLE
-- Stores all tracking events
-- ----------------------------------------
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
    fingerprint_id VARCHAR(64) NOT NULL,
    
    -- Event details
    event_name VARCHAR(100) NOT NULL,
    event_id VARCHAR(100) UNIQUE, -- For deduplication
    event_type VARCHAR(50) DEFAULT 'custom', -- pageview, click, form, purchase, custom
    
    -- Page data
    page_url TEXT,
    page_path VARCHAR(500),
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
    fbc VARCHAR(255),
    fbp VARCHAR(255),
    ttclid VARCHAR(255),
    msclkid VARCHAR(255),
    li_fat_id VARCHAR(255), -- LinkedIn
    
    -- Device info
    device_type VARCHAR(20), -- mobile, desktop, tablet
    browser VARCHAR(50),
    browser_version VARCHAR(20),
    os VARCHAR(50),
    os_version VARCHAR(20),
    user_agent TEXT,
    ip_address VARCHAR(45),
    
    -- Location (from IP)
    country VARCHAR(2),
    country_name VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Session data
    session_id VARCHAR(64),
    session_pageviews INTEGER DEFAULT 1,
    time_on_page INTEGER, -- seconds
    scroll_depth INTEGER, -- percentage 0-100
    
    -- Event value (for purchase/conversion events)
    event_value DECIMAL(12, 2),
    event_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Custom event data
    custom_data JSONB DEFAULT '{}',
    
    -- Fraud signals
    fraud_signals JSONB DEFAULT '{}',
    
    -- Timestamps
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE events DISABLE ROW LEVEL SECURITY;
GRANT ALL ON events TO anon;
GRANT ALL ON events TO authenticated;
GRANT ALL ON events TO service_role;

CREATE INDEX idx_events_visitor ON events(visitor_id);
CREATE INDEX idx_events_fingerprint ON events(fingerprint_id);
CREATE INDEX idx_events_name ON events(event_name);
CREATE INDEX idx_events_time ON events(event_time);
CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_gclid ON events(gclid);
CREATE INDEX idx_events_fbclid ON events(fbclid);
CREATE INDEX idx_events_utm_source ON events(utm_source);
CREATE INDEX idx_events_page_path ON events(page_path);

-- ----------------------------------------
-- CONVERSIONS TABLE
-- Stores purchase/conversion events for offline upload
-- ----------------------------------------
CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
    fingerprint_id VARCHAR(64),
    
    -- Customer identity for CAPI matching
    email VARCHAR(255),
    email_hash VARCHAR(64),
    phone VARCHAR(50),
    phone_hash VARCHAR(64),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    external_id VARCHAR(255),
    
    -- Location for CAPI
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(2),
    
    -- Conversion details
    order_id VARCHAR(100) UNIQUE,
    conversion_value DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    conversion_type VARCHAR(50) DEFAULT 'purchase', -- purchase, lead, signup, subscription
    
    -- Products (for e-commerce)
    products JSONB DEFAULT '[]', -- [{id, name, sku, price, quantity, category}]
    
    -- Attribution click IDs (captured at conversion time)
    gclid VARCHAR(255),
    gbraid VARCHAR(255),
    wbraid VARCHAR(255),
    fbc VARCHAR(255),
    fbp VARCHAR(255),
    
    -- Full attribution data
    attribution_model VARCHAR(50) DEFAULT 'last_click', -- first_click, last_click, linear, time_decay, position_based
    attribution_data JSONB DEFAULT '{}', -- Full journey data
    touchpoints JSONB DEFAULT '[]', -- Array of all touchpoints
    
    -- Meta CAPI upload status
    meta_uploaded BOOLEAN DEFAULT FALSE,
    meta_upload_time TIMESTAMP WITH TIME ZONE,
    meta_upload_response JSONB,
    meta_event_id VARCHAR(100),
    meta_match_quality DECIMAL(3, 2), -- 0.00 to 1.00
    
    -- Google Ads OCI upload status
    google_uploaded BOOLEAN DEFAULT FALSE,
    google_upload_time TIMESTAMP WITH TIME ZONE,
    google_upload_response JSONB,
    google_conversion_action_id VARCHAR(100),
    
    -- TikTok Events API
    tiktok_uploaded BOOLEAN DEFAULT FALSE,
    tiktok_upload_time TIMESTAMP WITH TIME ZONE,
    tiktok_upload_response JSONB,
    
    -- Recurring revenue tracking
    is_recurring BOOLEAN DEFAULT FALSE,
    subscription_id VARCHAR(100),
    mrr_impact DECIMAL(12, 2), -- Monthly recurring revenue impact
    
    -- Timestamps
    conversion_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE conversions DISABLE ROW LEVEL SECURITY;
GRANT ALL ON conversions TO anon;
GRANT ALL ON conversions TO authenticated;
GRANT ALL ON conversions TO service_role;

CREATE INDEX idx_conversions_visitor ON conversions(visitor_id);
CREATE INDEX idx_conversions_fingerprint ON conversions(fingerprint_id);
CREATE INDEX idx_conversions_email ON conversions(email);
CREATE INDEX idx_conversions_email_hash ON conversions(email_hash);
CREATE INDEX idx_conversions_order_id ON conversions(order_id);
CREATE INDEX idx_conversions_meta_uploaded ON conversions(meta_uploaded) WHERE NOT meta_uploaded;
CREATE INDEX idx_conversions_google_uploaded ON conversions(google_uploaded) WHERE NOT google_uploaded;
CREATE INDEX idx_conversions_time ON conversions(conversion_time);
CREATE INDEX idx_conversions_gclid ON conversions(gclid);

-- ----------------------------------------
-- IDENTITY_GRAPH TABLE
-- Links multiple devices/sessions to same user
-- ----------------------------------------
CREATE TABLE identity_graph (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE, -- Main identity
    linked_visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE, -- Merged identity
    
    -- Identity signals used for match
    fingerprint_id VARCHAR(64) NOT NULL,
    device_id VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    external_id VARCHAR(255),
    ip_address VARCHAR(45),
    
    -- Match metadata
    match_type VARCHAR(30) NOT NULL, -- deterministic, probabilistic, declared
    match_method VARCHAR(50), -- email_match, phone_match, fingerprint_similar, login
    confidence_score INTEGER DEFAULT 50, -- 0-100
    
    -- Device info at time of match
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    
    -- Timestamps
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE identity_graph DISABLE ROW LEVEL SECURITY;
GRANT ALL ON identity_graph TO anon;
GRANT ALL ON identity_graph TO authenticated;
GRANT ALL ON identity_graph TO service_role;

CREATE INDEX idx_identity_master ON identity_graph(master_visitor_id);
CREATE INDEX idx_identity_linked ON identity_graph(linked_visitor_id);
CREATE INDEX idx_identity_fingerprint ON identity_graph(fingerprint_id);
CREATE INDEX idx_identity_email ON identity_graph(email);
CREATE INDEX idx_identity_external_id ON identity_graph(external_id);

-- ----------------------------------------
-- CAMPAIGNS TABLE
-- Stores campaign performance data
-- ----------------------------------------
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Campaign identity
    platform VARCHAR(50) NOT NULL, -- meta, google, tiktok, linkedin, etc.
    platform_campaign_id VARCHAR(100),
    platform_adset_id VARCHAR(100),
    platform_ad_id VARCHAR(100),
    campaign_name VARCHAR(500),
    adset_name VARCHAR(500),
    ad_name VARCHAR(500),
    
    -- Campaign metadata
    status VARCHAR(20) DEFAULT 'active', -- active, paused, deleted
    objective VARCHAR(100),
    
    -- Platform-reported metrics
    spend DECIMAL(12, 2) DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    platform_conversions INTEGER DEFAULT 0,
    platform_revenue DECIMAL(12, 2) DEFAULT 0,
    
    -- Chronos-tracked metrics (more accurate)
    chronos_clicks INTEGER DEFAULT 0,
    chronos_conversions INTEGER DEFAULT 0,
    chronos_revenue DECIMAL(12, 2) DEFAULT 0,
    chronos_leads INTEGER DEFAULT 0,
    
    -- Calculated metrics
    cpa DECIMAL(12, 2), -- Cost per acquisition
    roas DECIMAL(8, 4), -- Return on ad spend
    cpc DECIMAL(8, 4), -- Cost per click
    ctr DECIMAL(8, 6), -- Click through rate
    cvr DECIMAL(8, 6), -- Conversion rate
    
    -- AI predictions
    predicted_roas DECIMAL(8, 4),
    recommended_budget DECIMAL(12, 2),
    optimization_score INTEGER, -- 0-100
    
    -- Date range
    date DATE,
    
    -- Timestamps
    last_synced TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
GRANT ALL ON campaigns TO anon;
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaigns TO service_role;

CREATE INDEX idx_campaigns_platform ON campaigns(platform);
CREATE INDEX idx_campaigns_platform_id ON campaigns(platform_campaign_id);
CREATE INDEX idx_campaigns_date ON campaigns(date);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- ----------------------------------------
-- UPLOAD_BATCHES TABLE
-- Tracks offline conversion upload history
-- ----------------------------------------
CREATE TABLE upload_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Batch info
    platform VARCHAR(20) NOT NULL, -- meta, google, tiktok
    batch_type VARCHAR(20) DEFAULT 'auto', -- manual, csv, auto, webhook
    
    -- Results
    total_conversions INTEGER DEFAULT 0,
    successful_uploads INTEGER DEFAULT 0,
    failed_uploads INTEGER DEFAULT 0,
    match_rate DECIMAL(5, 2), -- percentage
    average_match_quality DECIMAL(3, 2),
    
    -- Response data
    response_data JSONB DEFAULT '{}',
    error_details JSONB DEFAULT '[]',
    conversion_ids UUID[] DEFAULT '{}',
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE upload_batches DISABLE ROW LEVEL SECURITY;
GRANT ALL ON upload_batches TO anon;
GRANT ALL ON upload_batches TO authenticated;
GRANT ALL ON upload_batches TO service_role;

CREATE INDEX idx_upload_batches_platform ON upload_batches(platform);
CREATE INDEX idx_upload_batches_time ON upload_batches(started_at);

-- ----------------------------------------
-- FRAUD_SIGNALS TABLE (NEW)
-- Tracks suspicious activity patterns
-- ----------------------------------------
CREATE TABLE fraud_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
    fingerprint_id VARCHAR(64),
    
    -- Signal details
    signal_type VARCHAR(50) NOT NULL, -- bot, click_fraud, conversion_fraud, suspicious_ip, datacenter
    severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    confidence INTEGER DEFAULT 50, -- 0-100
    
    -- Evidence
    evidence JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Resolution
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, dismissed
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Timestamps
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE fraud_signals DISABLE ROW LEVEL SECURITY;
GRANT ALL ON fraud_signals TO anon;
GRANT ALL ON fraud_signals TO authenticated;
GRANT ALL ON fraud_signals TO service_role;

CREATE INDEX idx_fraud_visitor ON fraud_signals(visitor_id);
CREATE INDEX idx_fraud_type ON fraud_signals(signal_type);
CREATE INDEX idx_fraud_severity ON fraud_signals(severity);
CREATE INDEX idx_fraud_status ON fraud_signals(status);

-- ----------------------------------------
-- PREDICTIONS TABLE (NEW)
-- Stores AI-generated predictions
-- ----------------------------------------
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Prediction target
    prediction_type VARCHAR(50) NOT NULL, -- conversion_probability, ltv, churn, next_purchase
    target_type VARCHAR(20) NOT NULL, -- visitor, campaign, cohort
    target_id UUID,
    
    -- Prediction data
    predicted_value DECIMAL(12, 4),
    confidence_interval_low DECIMAL(12, 4),
    confidence_interval_high DECIMAL(12, 4),
    confidence_score INTEGER, -- 0-100
    
    -- Model info
    model_version VARCHAR(20),
    features_used JSONB DEFAULT '[]',
    
    -- Outcome tracking
    actual_value DECIMAL(12, 4),
    prediction_accurate BOOLEAN,
    
    -- Timestamps
    prediction_date DATE DEFAULT CURRENT_DATE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;
GRANT ALL ON predictions TO anon;
GRANT ALL ON predictions TO authenticated;
GRANT ALL ON predictions TO service_role;

CREATE INDEX idx_predictions_type ON predictions(prediction_type);
CREATE INDEX idx_predictions_target ON predictions(target_type, target_id);
CREATE INDEX idx_predictions_date ON predictions(prediction_date);

-- ----------------------------------------
-- WEBHOOK_LOGS TABLE
-- Logs incoming/outgoing webhooks
-- ----------------------------------------
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
    response_time_ms INTEGER,
    
    -- Metadata
    source VARCHAR(100), -- shopify, stripe, klaviyo, zapier, etc.
    event_type VARCHAR(100),
    
    -- Retry tracking
    attempt_number INTEGER DEFAULT 1,
    max_attempts INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;
GRANT ALL ON webhook_logs TO anon;
GRANT ALL ON webhook_logs TO authenticated;
GRANT ALL ON webhook_logs TO service_role;

CREATE INDEX idx_webhook_source ON webhook_logs(source);
CREATE INDEX idx_webhook_event ON webhook_logs(event_type);
CREATE INDEX idx_webhook_created ON webhook_logs(created_at);

-- ----------------------------------------
-- SETTINGS TABLE
-- Store account/workspace settings
-- ----------------------------------------
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
GRANT ALL ON settings TO anon;
GRANT ALL ON settings TO authenticated;
GRANT ALL ON settings TO service_role;

CREATE INDEX idx_settings_key ON settings(key);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('workspace', '{"name": "My Workspace", "timezone": "UTC", "currency": "USD"}', 'Workspace configuration'),
('tracking_domain', '{"domain": null, "verified": false}', 'Custom tracking domain (CNAME)'),
('data_retention', '{"days": 365}', 'How long to keep visitor data'),
('privacy', '{"hash_pii": true, "anonymize_ip": false}', 'Privacy settings');

-- ============================================
-- STEP 3: CREATE HELPER FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update visitor's last_seen timestamp
CREATE OR REPLACE FUNCTION update_visitor_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE visitors 
    SET 
        last_seen = NOW(), 
        total_events = total_events + 1,
        updated_at = NOW()
    WHERE fingerprint_id = NEW.fingerprint_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for visitor update on new event
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
CREATE TRIGGER trigger_visitors_updated
    BEFORE UPDATE ON visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_conversions_updated
    BEFORE UPDATE ON conversions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STEP 4: ENABLE REALTIME SUBSCRIPTIONS
-- (For live dashboard updates)
-- ============================================

-- Add tables to realtime publication
DO $$
BEGIN
    -- Check if publication exists before adding
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE events;
        ALTER PUBLICATION supabase_realtime ADD TABLE conversions;
        ALTER PUBLICATION supabase_realtime ADD TABLE visitors;
        ALTER PUBLICATION supabase_realtime ADD TABLE fraud_signals;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if tables already in publication
    NULL;
END $$;

-- ============================================
-- DONE! DATABASE READY FOR USE
-- ============================================
-- 
-- Next steps:
-- 1. Copy your Project URL from Settings → API
--    Example: https://abcdefgh.supabase.co
-- 
-- 2. Copy your anon/public key from Settings → API
--    Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
-- 
-- 3. Enter these in Chronos AI Settings page
-- 
-- 4. (Optional) Set up CNAME tracking domain for
--    first-party tracking
--
-- IMPORTANT: RLS is disabled. For production, secure
-- your anon key or use a backend proxy.
-- ============================================