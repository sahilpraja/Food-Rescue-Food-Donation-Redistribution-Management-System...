-- V1__initial_schema.sql
-- Food Rescue Core Schema Migration (TRD Section 4)

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_status VARCHAR(50),
    reject_reason TEXT,
    darpan_reg_no VARCHAR(100),
    fssai_license VARCHAR(100),
    address_line VARCHAR(500),
    city VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    rating DOUBLE PRECISION DEFAULT 5.0,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
    id BIGSERIAL PRIMARY KEY,
    donor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    diet_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    weight_kg DOUBLE PRECISION,
    packaging VARCHAR(255),
    prepared_at TIMESTAMP WITH TIME ZONE NOT NULL,
    best_before TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_from TIMESTAMP WITH TIME ZONE,
    pickup_to TIMESTAMP WITH TIME ZONE,
    address_line VARCHAR(500),
    city VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    allergens VARCHAR(500),
    notes TEXT,
    safety_ack BOOLEAN NOT NULL DEFAULT TRUE,
    photo_url TEXT,
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_listings_status_expiry ON listings(status, best_before);

CREATE TABLE IF NOT EXISTS claims (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    ngo_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pickup_mode VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    decide_deadline TIMESTAMP WITH TIME ZONE,
    decided_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Unique partial index to enforce BR-02: at most one active claim per listing
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_claim_per_listing 
ON claims(listing_id) 
WHERE status IN ('PENDING', 'ACCEPTED');

CREATE TABLE IF NOT EXISTS delivery_tasks (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    volunteer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    pickup_otp VARCHAR(10) NOT NULL,
    delivery_otp VARCHAR(10) NOT NULL,
    pickup_otp_attempts INT NOT NULL DEFAULT 0,
    delivery_otp_attempts INT NOT NULL DEFAULT 0,
    assigned_at TIMESTAMP WITH TIME ZONE,
    picked_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100),
    reference_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratings (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    from_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL,
    target_id BIGINT NOT NULL,
    target_title VARCHAR(255),
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    action_taken VARCHAR(100),
    admin_note TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
