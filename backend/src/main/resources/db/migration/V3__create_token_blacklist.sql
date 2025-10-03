-- Migration: Create token blacklist table
-- Stores invalidated JWT tokens to prevent replay attacks after logout

CREATE TABLE token_blacklist (
    id BIGSERIAL PRIMARY KEY,
    token_jti VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure JTI uniqueness
    CONSTRAINT token_blacklist_token_jti_unique UNIQUE (token_jti)
);

-- Create indexes for common queries
CREATE UNIQUE INDEX idx_token_blacklist_token_jti ON token_blacklist(token_jti);
CREATE INDEX idx_token_blacklist_user_id ON token_blacklist(user_id);
CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- Add comments for documentation
COMMENT ON TABLE token_blacklist IS 'Invalidated JWT tokens for secure logout (prevents replay attacks)';
COMMENT ON COLUMN token_blacklist.token_jti IS 'JWT ID (jti claim) from the token';
COMMENT ON COLUMN token_blacklist.expires_at IS 'Token expiration timestamp (for automatic cleanup)';

