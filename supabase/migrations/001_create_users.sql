-- Create uuid extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (includes bank details for payments)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('farmer', 'buyer', 'consumer', 'admin')),
    location VARCHAR(100),
    wallet_address VARCHAR(42),
    bank_account VARCHAR(50),
    ifsc_code VARCHAR(11),
    upi_id VARCHAR(50),
    trust_score INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
