-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  bank_account VARCHAR(50),
  user_type VARCHAR(20) NOT NULL, -- 'farmer', 'buyer', 'consumer', 'admin'
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP verification table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(10) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  attempts INT DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(10) NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_agent VARCHAR(500),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
