-- Payments table (bank transfers, NOT crypto)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('UPI', 'NEFT', 'Cash')),
    transaction_id VARCHAR(100),
    from_account VARCHAR(50),
    to_account VARCHAR(50),
    status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN ('initiated', 'pending', 'completed', 'failed')),
    initiated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    blockchain_tx_hash VARCHAR(66),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_offer ON payments(offer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_blockchain_tx ON payments(blockchain_tx_hash);
