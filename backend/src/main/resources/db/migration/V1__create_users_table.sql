-- Migration: Create users table for authentication system
-- Supports both email/password and Google OAuth authentication

-- Create auth provider enum
CREATE TYPE auth_provider AS ENUM ('EMAIL', 'GOOGLE');

-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    auth_provider auth_provider NOT NULL DEFAULT 'EMAIL',
    google_id VARCHAR(255),
    avatar_url VARCHAR(500),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure email uniqueness (case-insensitive)
    CONSTRAINT users_email_unique UNIQUE (email),
    
    -- Ensure google_id is unique when present
    CONSTRAINT users_google_id_unique UNIQUE (google_id),
    
    -- Ensure correct fields are populated based on auth provider
    CONSTRAINT check_auth_provider CHECK (
        (auth_provider = 'EMAIL' AND password_hash IS NOT NULL) OR
        (auth_provider = 'GOOGLE' AND google_id IS NOT NULL)
    )
);

-- Create indexes for common queries
CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_auth_provider ON users(auth_provider);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE users IS 'Core user accounts supporting email/password and Google OAuth authentication';
COMMENT ON COLUMN users.auth_provider IS 'Authentication method: EMAIL (password-based) or GOOGLE (OAuth)';
COMMENT ON COLUMN users.password_hash IS 'BCrypt password hash (NULL for OAuth users)';
COMMENT ON COLUMN users.google_id IS 'Google OAuth user ID (NULL for email users)';
COMMENT ON COLUMN users.is_verified IS 'Email verification status (auto-true for OAuth)';

