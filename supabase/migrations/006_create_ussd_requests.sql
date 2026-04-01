-- USSD Requests table for dual-phone simulation
CREATE TABLE ussd_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_phone VARCHAR(20) NOT NULL,
    to_phone VARCHAR(20) NOT NULL,
    amount INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- pending, accepted, rejected
    request_type VARCHAR(50) NOT NULL DEFAULT 'send_money',  -- send_money, view_offers, list_crop
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blockchain_tx_hash VARCHAR(66),
    description TEXT
);

-- USSD Session table to track ongoing USSD sessions
CREATE TABLE ussd_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    current_menu VARCHAR(100),
    input_buffer TEXT,
    session_state JSONB,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- USSD Audit Log for tracking all USSD interactions
CREATE TABLE ussd_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    action VARCHAR(100),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_ussd_requests_from_phone ON ussd_requests(from_phone);
CREATE INDEX idx_ussd_requests_to_phone ON ussd_requests(to_phone);
CREATE INDEX idx_ussd_requests_status ON ussd_requests(status);
CREATE INDEX idx_ussd_sessions_phone ON ussd_sessions(phone_number);
CREATE INDEX idx_ussd_audit_log_phone ON ussd_audit_log(phone_number);
