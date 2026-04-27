-- SafeFlow Global — Database Schema
-- PostgreSQL 15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- WORKERS TABLE
-- ============================================
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    language_preference VARCHAR(10) DEFAULT 'en',
    region VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    emergency_contact VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    profile_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTRACTORS TABLE
-- ============================================
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    region VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    risk_score DECIMAL(3,1) DEFAULT 5.0,
    total_jobs INTEGER DEFAULT 0,
    total_incidents INTEGER DEFAULT 0,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOB CHECK-INS TABLE (Core workflow)
-- ============================================
CREATE TABLE job_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,

    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_description TEXT,
    manhole_id VARCHAR(100),

    -- Job details
    sewer_depth DECIMAL(5,2),
    estimated_duration INTEGER,          -- minutes
    equipment_available JSONB DEFAULT '[]',
    smell_reported BOOLEAN DEFAULT FALSE,

    -- Risk assessment
    risk_level VARCHAR(10),              -- GREEN / YELLOW / RED
    risk_score INTEGER,
    risk_factors JSONB DEFAULT '[]',
    ai_recommendation TEXT,

    -- Timeline
    started_at TIMESTAMPTZ DEFAULT NOW(),
    deadline TIMESTAMPTZ,                -- Expected check-out time
    checked_out_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active / safe / emergency / missed
    alert_level INTEGER DEFAULT 0,

    -- Evidence
    voice_note_url VARCHAR(500),
    photo_urls JSONB DEFAULT '[]',
    blockchain_tx_hash VARCHAR(100),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INCIDENTS TABLE
-- ============================================
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkin_id UUID REFERENCES job_checkins(id) ON DELETE SET NULL,
    worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,

    incident_type VARCHAR(50),           -- death / injury / near_miss / illness
    severity VARCHAR(20),                -- critical / high / medium / low
    description TEXT,

    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    country VARCHAR(100),
    region VARCHAR(100),

    -- Status tracking
    status VARCHAR(50) DEFAULT 'reported',
    authority_notified BOOLEAN DEFAULT FALSE,
    authority_responded BOOLEAN DEFAULT FALSE,
    compensation_claimed BOOLEAN DEFAULT FALSE,
    compensation_received BOOLEAN DEFAULT FALSE,

    -- Evidence
    evidence_urls JSONB DEFAULT '[]',
    blockchain_tx_hash VARCHAR(100),

    -- Timestamps
    incident_date TIMESTAMPTZ,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ============================================
-- LEGAL DOCUMENTS TABLE
-- ============================================
CREATE TABLE legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,

    document_type VARCHAR(50),
    content TEXT,
    language VARCHAR(10),

    -- Submission tracking
    submitted_to VARCHAR(255),
    submitted_at TIMESTAMPTZ,
    response_received_at TIMESTAMPTZ,
    response_content TEXT,
    escalated_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTRACTOR RATINGS TABLE
-- ============================================
CREATE TABLE contractor_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
    checkin_id UUID REFERENCES job_checkins(id) ON DELETE SET NULL,

    safety_score INTEGER CHECK (safety_score BETWEEN 1 AND 5),
    equipment_provided BOOLEAN,
    payment_on_time BOOLEAN,
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS TABLE (for dashboard auth)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'worker',  -- worker / contractor / ngo / municipality / admin
    region VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================
CREATE INDEX idx_checkins_worker_status ON job_checkins(worker_id, status);
CREATE INDEX idx_checkins_deadline ON job_checkins(deadline) WHERE status = 'active';
CREATE INDEX idx_checkins_status ON job_checkins(status);
CREATE INDEX idx_incidents_location ON incidents(country, region);
CREATE INDEX idx_incidents_date ON incidents(incident_date DESC);
CREATE INDEX idx_contractors_region ON contractors(region, risk_score);
CREATE INDEX idx_workers_phone ON workers(phone_number);

-- ============================================
-- SEED DATA (Development)
-- ============================================
INSERT INTO users (email, password_hash, name, role, region) VALUES
('admin@safeflow.global', '$2b$12$u9bSejQul7BORMrXkwaV7OJXdOr1QKBxeUZ5tJPzjiv.A4YPD2c5.', 'Admin User', 'admin', 'IN-MH');
-- password: admin123 (bcrypt hash)

INSERT INTO contractors (name, registration_number, region, contact_phone, risk_score) VALUES
('Metro Sanitation Corp', 'MSC-2024-001', 'IN-MH', '+919876543210', 6.5),
('City Clean Services', 'CCS-2024-002', 'IN-DL', '+919876543211', 4.2),
('Safe Sewer Works', 'SSW-2024-003', 'IN-TN', '+919876543212', 8.1);

INSERT INTO workers (phone_number, name, region, district, emergency_contact, emergency_contact_name) VALUES
('+919000000001', 'Rajesh Kumar', 'IN-MH', 'Mumbai', '+919000000010', 'Priya Kumar'),
('+919000000002', 'Suresh Babu', 'IN-TN', 'Chennai', '+919000000020', 'Lakshmi Babu'),
('+919000000003', 'Ahmed Khan', 'IN-DL', 'New Delhi', '+919000000030', 'Fatima Khan');
