-- Crops table
CREATE TABLE crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blockchain_id INTEGER,
    farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    quality_grade VARCHAR(1) CHECK (quality_grade IN ('A', 'B', 'C')),
    ai_confidence DECIMAL(5,2),
    price_per_kg INTEGER NOT NULL,
    image_url TEXT,
    image_hash TEXT,
    gps_lat DECIMAL(10, 8),
    gps_lng DECIMAL(11, 8),
    mandi_price INTEGER,
    status VARCHAR(20) DEFAULT 'listed' CHECK (status IN ('listed', 'sold', 'cancelled')),
    blockchain_tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_crops_farmer ON crops(farmer_id);
CREATE INDEX idx_crops_status ON crops(status);
CREATE INDEX idx_crops_blockchain_id ON crops(blockchain_id);
