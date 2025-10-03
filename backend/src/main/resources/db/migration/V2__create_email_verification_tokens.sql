-- Migration: Create email verification tokens table
-- Stores time-limited tokens for email verification

CREATE TABLE email_verification_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure token uniqueness
    CONSTRAINT email_verification_tokens_token_unique UNIQUE (token)
);

-- Create indexes for common queries
CREATE UNIQUE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Add comments for documentation
COMMENT ON TABLE email_verification_tokens IS 'Time-limited tokens for email verification (24-hour expiry)';
COMMENT ON COLUMN email_verification_tokens.token IS 'Cryptographically secure random token (32 bytes, hex-encoded)';
COMMENT ON COLUMN email_verification_tokens.expires_at IS 'Token expiration timestamp (24 hours from creation)';

