# Database Schema: Authentication System

## 1. Overview

This document defines the complete database schema for the authentication system. The schema supports both email/password authentication and Google OAuth, with email verification for email-based accounts and JWT-based session management with token blacklisting for logout functionality.

**Database:** PostgreSQL 14+  
**Migration Tool:** TBD (node-pg-migrate, Knex, or raw SQL)  
**Naming Convention:** snake_case for all database identifiers

## 2. Schema Design

### 2.1 Table: `users`

Stores core user account information for both email/password and OAuth authentication.

```sql
CREATE TYPE auth_provider AS ENUM ('email', 'google');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  auth_provider auth_provider NOT NULL DEFAULT 'email',
  password_hash VARCHAR(255),
  google_id VARCHAR(255),
  avatar_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT password_required_for_email CHECK (
    (auth_provider = 'email' AND password_hash IS NOT NULL) OR
    (auth_provider = 'google' AND google_id IS NOT NULL)
  )
);

CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE UNIQUE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_auth_provider ON users(auth_provider);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Field Specifications:**
- `id`: UUID primary key, auto-generated
- `email`: Lowercase storage enforced at application level, unique constraint
- `full_name`: User's display name, required
- `auth_provider`: Authentication method ('email' or 'google'), defaults to 'email'
- `password_hash`: bcrypt hash (cost factor 12) for email auth, NULL for OAuth users
- `google_id`: Google user ID for OAuth users, NULL for email auth users
- `avatar_url`: Profile picture URL (primarily for OAuth users), optional
- `is_verified`: Email verification status (auto-true for OAuth, requires verification for email)
- `created_at`: Account creation timestamp, immutable
- `updated_at`: Last modification timestamp, updated on any change

**Constraints:**
- Email must be unique (case-insensitive)
- Password hash required if auth_provider = 'email'
- Google ID required if auth_provider = 'google'
- Google ID must be unique when present
- Check constraint ensures correct fields are populated per auth provider

### 2.2 Table: `email_verification_tokens`

Stores time-limited tokens for email verification.

```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);
```

**Field Specifications:**
- `id`: UUID primary key
- `user_id`: Foreign key to users table, cascades on delete
- `token`: Cryptographically secure random token (32 bytes, hex-encoded)
- `expires_at`: Token expiration timestamp (24 hours from creation)
- `created_at`: Token generation timestamp

**Constraints:**
- Token must be unique
- Expires_at must be in the future at creation time
- One user can have multiple tokens (e.g., resend verification email)

**Cleanup Strategy:**
- Expired tokens deleted via scheduled job (daily cron)
- Tokens deleted on successful verification
- Tokens cascade-deleted when user is deleted

### 2.3 Table: `token_blacklist`

Stores invalidated JWT tokens to prevent replay attacks after logout.

```sql
CREATE TABLE token_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_jti VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_token_blacklist_token_jti ON token_blacklist(token_jti);
CREATE INDEX idx_token_blacklist_user_id ON token_blacklist(user_id);
CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);
```

**Field Specifications:**
- `id`: UUID primary key
- `token_jti`: JWT Token ID (JTI claim), unique identifier for each token
- `user_id`: Foreign key to users table, cascades on delete
- `expires_at`: Token expiration timestamp (matches JWT exp claim)
- `created_at`: Blacklist entry creation timestamp

**Constraints:**
- Token JTI must be unique
- Expires_at should match the JWT's original expiration time

**Cleanup Strategy:**
- Expired blacklist entries deleted via scheduled job (daily cron)
- Only need to store until original token would have expired

## 3. Relationships

```
users (1) ----< (many) email_verification_tokens
users (1) ----< (many) token_blacklist
```

- One user can have multiple verification tokens (resend scenarios)
- One user can have multiple blacklisted tokens (multiple devices/sessions)
- All child records cascade delete when user is deleted

## 4. Indexes Strategy

**Performance Optimization:**

1. **users.email (LOWER)**: Fast case-insensitive email lookups during login
2. **users.google_id (partial unique)**: Fast Google user lookups, unique when present
3. **users.auth_provider**: Filter queries by authentication method
4. **email_verification_tokens.token**: Fast token validation on email verification
5. **token_blacklist.token_jti**: Fast JWT blacklist checks on every authenticated request
6. **expires_at indexes**: Efficient cleanup queries for expired records

**Query Patterns:**
- Email login: `SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND auth_provider = 'email'`
- Google login: `SELECT * FROM users WHERE google_id = $1 AND auth_provider = 'google'`
- Email verify: `SELECT * FROM email_verification_tokens WHERE token = $1 AND expires_at > NOW()`
- JWT check: `SELECT 1 FROM token_blacklist WHERE token_jti = $1`
- Cleanup: `DELETE FROM email_verification_tokens WHERE expires_at < NOW()`

## 5. Data Integrity

**Application-Level Validations:**
- Email format validation (RFC 5322 compliant)
- Password strength (email auth only): minimum 8 characters, at least one uppercase, one lowercase, one number
- Email stored in lowercase
- Token generation: cryptographically secure random bytes
- Google ID token verification via Google OAuth library

**Database-Level Constraints:**
- UNIQUE constraints on email, google_id (when present), token, token_jti
- FOREIGN KEY constraints with CASCADE deletes
- NOT NULL constraints on required fields
- CHECK constraint: password_hash required for email auth, google_id required for OAuth
- ENUM constraint on auth_provider ('email' | 'google')

## 6. Security Considerations

1. **Password Storage:** Never store plain text passwords; always bcrypt with cost factor 12 for email auth
2. **OAuth Security:** Verify Google ID tokens server-side using Google's official library
3. **Token Generation:** Use `crypto.randomBytes(32)` for verification tokens
4. **JWT JTI:** UUID v4 for JWT Token IDs
5. **Email Privacy:** Consider hashing emails for GDPR compliance (future consideration)
6. **Timing Attacks:** Use constant-time comparison for token validation
7. **Rate Limiting:** Implement at application layer (not database)
8. **OAuth Account Linking:** Prevent email collision attacks by checking existing email before OAuth account creation

## 7. Migration Strategy

**Initial Setup:**
1. Create `auth_provider` ENUM type
2. Create `users` table (no dependencies)
3. Create `email_verification_tokens` table (depends on users)
4. Create `token_blacklist` table (depends on users)

**Rollback Strategy:**
- Drop tables in reverse order: `token_blacklist`, `email_verification_tokens`, `users`, `auth_provider` type
- Each migration must have corresponding down migration

**Versioning:**
- Migration files named: `YYYYMMDDHHMMSS_description.sql`
- Track applied migrations in `schema_migrations` table

## 8. Maintenance Tasks

**Scheduled Jobs:**

1. **Daily Cleanup (2:00 AM UTC):**
   ```sql
   DELETE FROM email_verification_tokens WHERE expires_at < NOW();
   DELETE FROM token_blacklist WHERE expires_at < NOW();
   ```

2. **Weekly VACUUM (Sunday 3:00 AM UTC):**
   ```sql
   VACUUM ANALYZE users;
   VACUUM ANALYZE email_verification_tokens;
   VACUUM ANALYZE token_blacklist;
   ```

## 9. Sample Data

**For Development/Testing Only:**

```sql
-- Sample verified email user (password: "Password123!")
INSERT INTO users (id, email, full_name, auth_provider, password_hash, is_verified, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  'Test User',
  'email',
  '$2b$12$LQ5JJJqJYgQYvEKTxPRjqO.xJQeQQhQxPEgQvLZGzZYvLZGzZYvLZ',
  true,
  NOW(),
  NOW()
);

-- Sample unverified email user
INSERT INTO users (id, email, full_name, auth_provider, password_hash, is_verified, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'unverified@example.com',
  'Unverified User',
  'email',
  '$2b$12$LQ5JJJqJYgQYvEKTxPRjqO.xJQeQQhQxPEgQvLZGzZYvLZGzZYvLZ',
  false,
  NOW(),
  NOW()
);

-- Sample Google OAuth user
INSERT INTO users (id, email, full_name, auth_provider, google_id, avatar_url, is_verified, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'google@example.com',
  'Google User',
  'google',
  '123456789012345678901',
  'https://lh3.googleusercontent.com/a/default-user',
  true,
  NOW(),
  NOW()
);
```

## 10. Future Enhancements

Potential schema additions for future iterations:

- `password_reset_tokens` table for password recovery
- `user_sessions` table for device/session tracking
- `login_attempts` table for brute force protection
- `user_preferences` table for settings
- Soft delete support (add `deleted_at` column)
- Email change verification workflow
- Multi-factor authentication tables

