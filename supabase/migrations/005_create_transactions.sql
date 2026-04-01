-- Transactions table (comprehensive audit log)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    related_crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
    related_offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
    related_payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    amount INTEGER,
    blockchain_tx_hash VARCHAR(66),
    fraud_detected BOOLEAN DEFAULT FALSE,
    fraud_details JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_blockchain_tx ON transactions(blockchain_tx_hash);

-- Fraud alerts table
CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    alert_type VARCHAR(50),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high')),
    details JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fraud_alerts_resolved ON fraud_alerts(resolved);
CREATE INDEX idx_fraud_alerts_severity ON fraud_alerts(severity);
