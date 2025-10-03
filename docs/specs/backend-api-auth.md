# Backend API Specification: Authentication System

## 1. Overview

This document defines all REST API endpoints for the authentication system. Each endpoint includes route definition, request/response formats, validation rules, error handling, and implementation requirements. Supports both email/password and Google OAuth authentication.

**Base URL:** `/api/auth`  
**Content Type:** `application/json`  
**Authentication:** JWT Bearer token (where specified)  
**API Style:** RESTful

## 2. API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | No | Create new user account (email/password) |
| POST | `/login` | No | Authenticate user and get JWT (email/password) |
| POST | `/google` | No | Authenticate with Google OAuth |
| POST | `/logout` | Yes | Invalidate JWT token |
| GET | `/verify-email` | No | Verify email with token |
| POST | `/resend-verification` | No | Resend verification email |
| GET | `/me` | Yes | Get current user profile |

## 3. Endpoint Specifications

### 3.1 POST `/api/auth/register`

**Purpose:** Create a new user account with email verification workflow.

**Authentication:** None required

**Request Body:**

```typescript
{
  email: string;        // Valid email, max 255 chars
  fullName: string;     // User's full name, 1-255 chars
  password: string;     // Min 8 chars, must include uppercase, lowercase, number
}
```

**Request Example:**

```json
{
  "email": "newuser@example.com",
  "fullName": "Jane Doe",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- Email: Valid format, lowercase conversion, max 255 characters
- Full Name: Required, trimmed, 1-255 characters
- Password: Minimum 8 characters, at least one uppercase, one lowercase, one number

**Success Response (201 Created):**

```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "newuser@example.com",
    "fullName": "Jane Doe",
    "isVerified": false,
    "createdAt": "2025-10-03T12:00:00.000Z",
    "updatedAt": "2025-10-03T12:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

**409 Conflict - Email Already Exists:**
```json
{
  "error": {
    "message": "An account with this email already exists",
    "code": "EMAIL_ALREADY_EXISTS",
    "statusCode": 409
  }
}
```

**500 Internal Server Error:**
```json
{
  "error": {
    "message": "Registration failed. Please try again later.",
    "code": "INTERNAL_SERVER_ERROR",
    "statusCode": 500
  }
}
```

**Implementation Requirements:**
1. Validate request body using `RegisterRequestSchema`
2. Check if email already exists (case-insensitive)
3. Hash password with bcrypt (cost factor 12)
4. Create user record with `isVerified: false`
5. Generate random verification token (32 bytes hex)
6. Store token with 24-hour expiration
7. Send verification email (async, don't block response)
8. Return user data (exclude password hash)
9. Log registration attempt (success/failure)

**Database Queries:**
```sql
-- Check email uniqueness
SELECT id FROM users WHERE LOWER(email) = LOWER($1);

-- Create user
INSERT INTO users (email, full_name, password_hash, is_verified)
VALUES ($1, $2, $3, false)
RETURNING id, email, full_name, is_verified, created_at, updated_at;

-- Create verification token
INSERT INTO email_verification_tokens (user_id, token, expires_at)
VALUES ($1, $2, NOW() + INTERVAL '24 hours')
RETURNING id;
```

---

### 3.2 POST `/api/auth/login`

**Purpose:** Authenticate user and receive JWT access token.

**Authentication:** None required

**Request Body:**

```typescript
{
  email: string;        // User's email address
  password: string;     // User's password
}
```

**Request Example:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- Email: Valid format, lowercase conversion
- Password: Required, non-empty

**Success Response (200 OK):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Jane Doe",
    "isVerified": true,
    "createdAt": "2025-10-03T12:00:00.000Z",
    "updatedAt": "2025-10-03T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJqdGkiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJpYXQiOjE3MjgwMDAwMDAsImV4cCI6MTcyODAwMzYwMH0.signature",
  "expiresIn": 3600
}
```

**Error Responses:**

**401 Unauthorized - Invalid Credentials:**
```json
{
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS",
    "statusCode": 401
  }
}
```

**403 Forbidden - Unverified Email:**
```json
{
  "error": {
    "message": "Please verify your email before logging in. A new verification email has been sent.",
    "code": "EMAIL_NOT_VERIFIED",
    "statusCode": 403
  }
}
```

**400 Bad Request - Validation Error:**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Implementation Requirements:**
1. Validate request body using `LoginRequestSchema`
2. Find user by email (case-insensitive)
3. If user not found, return `INVALID_CREDENTIALS` (don't reveal which field is wrong)
4. Compare password using bcrypt (constant-time comparison)
5. If password wrong, return `INVALID_CREDENTIALS`
6. Check if email is verified (`isVerified: true`)
7. If not verified, send new verification email and return `EMAIL_NOT_VERIFIED`
8. Generate JWT with payload: `{ sub, email, jti, iat, exp }`
9. Return user data and token
10. Log login attempt (success/failure, include IP)

**JWT Generation:**
```typescript
const payload: JwtPayload = {
  sub: user.id,                      // User ID
  email: user.email,                 // User email
  jti: crypto.randomUUID(),          // Token ID for blacklisting
  iat: Math.floor(Date.now() / 1000), // Issued at
  exp: Math.floor(Date.now() / 1000) + 3600 // Expires in 1 hour
};

const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
```

**Database Queries:**
```sql
-- Find user
SELECT id, email, full_name, password_hash, is_verified, created_at, updated_at
FROM users
WHERE LOWER(email) = LOWER($1);
```

**Security Considerations:**
- Always return same error message for invalid email or password
- Use bcrypt.compare() for constant-time password verification
- Rate limit login attempts (10 per 15 minutes per IP)
- Log failed login attempts for security monitoring

---

### 3.3 POST `/api/auth/google`

**Purpose:** Authenticate user with Google OAuth by verifying Google ID token and returning JWT.

**Authentication:** None required

**Request Body:**

```typescript
{
  credential: string;   // Google ID token from Google Sign-In
}
```

**Request Example:**

```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYjU..."
}
```

**Validation Rules:**
- Credential: Required, non-empty string (Google ID token)

**Success Response (200 OK) - Existing User:**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@gmail.com",
    "fullName": "John Doe",
    "authProvider": "google",
    "avatarUrl": "https://lh3.googleusercontent.com/a/default-user",
    "isVerified": true,
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-03T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Success Response (201 Created) - New User:**

Same as above, but HTTP status 201 when a new account is created.

**Error Responses:**

**401 Unauthorized - Invalid Google Token:**
```json
{
  "error": {
    "message": "Invalid Google credentials",
    "code": "GOOGLE_TOKEN_INVALID",
    "statusCode": 401
  }
}
```

**409 Conflict - Email Exists with Different Provider:**
```json
{
  "error": {
    "message": "An account with this email already exists using email/password authentication. Please log in with your password.",
    "code": "ACCOUNT_EXISTS_WITH_DIFFERENT_PROVIDER",
    "statusCode": 409
  }
}
```

**400 Bad Request - Validation Error:**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      {
        "field": "credential",
        "message": "Google credential is required"
      }
    ]
  }
}
```

**500 Internal Server Error - Google OAuth Error:**
```json
{
  "error": {
    "message": "Google authentication failed. Please try again.",
    "code": "GOOGLE_OAUTH_ERROR",
    "statusCode": 500
  }
}
```

**Implementation Requirements:**
1. Validate request body using `GoogleLoginRequestSchema`
2. Verify Google ID token using Google OAuth2 Client library
3. Extract user profile from verified token (sub, email, name, picture)
4. Check if user exists by email
5. If user exists with different auth_provider, return 409 error
6. If user exists with google provider:
   - Update user data if changed (name, avatar)
   - Generate JWT
   - Return 200 with user and token
7. If user doesn't exist:
   - Create new user with auth_provider='google', is_verified=true
   - Store google_id, avatar_url
   - Generate JWT
   - Return 201 with user and token
8. Log Google OAuth event (success/failure)

**Google Token Verification:**

```typescript
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token: string): Promise<GoogleUserProfile> {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID
  });
  
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid Google token');
  }
  
  return {
    sub: payload.sub,
    email: payload.email!,
    email_verified: payload.email_verified!,
    name: payload.name!,
    picture: payload.picture,
    given_name: payload.given_name,
    family_name: payload.family_name
  };
}
```

**Database Queries:**

```sql
-- Check if user exists by email
SELECT id, email, full_name, auth_provider, google_id, avatar_url, is_verified, created_at, updated_at
FROM users
WHERE LOWER(email) = LOWER($1);

-- Create new Google user
INSERT INTO users (email, full_name, auth_provider, google_id, avatar_url, is_verified)
VALUES ($1, $2, 'google', $3, $4, true)
RETURNING id, email, full_name, auth_provider, avatar_url, is_verified, created_at, updated_at;

-- Update existing Google user
UPDATE users
SET full_name = $2, avatar_url = $3, updated_at = NOW()
WHERE id = $1
RETURNING id, email, full_name, auth_provider, avatar_url, is_verified, created_at, updated_at;
```

**Security Considerations:**
- Always verify Google ID token server-side (never trust client)
- Validate token audience matches your Google Client ID
- Check email_verified flag from Google
- Handle token expiration gracefully
- Rate limit Google OAuth endpoint (10 per minute per IP)

**Environment Variables Required:**
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

### 3.4 POST `/api/auth/logout`

**Purpose:** Invalidate current JWT token by adding to blacklist.

**Authentication:** Required (JWT Bearer token)

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:** None

**Success Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**

**401 Unauthorized - Missing Token:**
```json
{
  "error": {
    "message": "No authentication token provided",
    "code": "UNAUTHORIZED",
    "statusCode": 401
  }
}
```

**401 Unauthorized - Invalid Token:**
```json
{
  "error": {
    "message": "Invalid or expired token",
    "code": "TOKEN_INVALID",
    "statusCode": 401
  }
}
```

**Implementation Requirements:**
1. Extract JWT from Authorization header
2. Verify JWT signature and expiration
3. Decode JWT to get JTI (Token ID)
4. Insert JTI into `token_blacklist` table with expiration
5. Return success message
6. Log logout event

**Database Queries:**
```sql
-- Add token to blacklist
INSERT INTO token_blacklist (token_jti, user_id, expires_at)
VALUES ($1, $2, $3)
ON CONFLICT (token_jti) DO NOTHING;
```

**Notes:**
- Token expiration in blacklist should match JWT exp claim
- Blacklisted tokens are checked on every authenticated request
- Expired blacklist entries are cleaned up by scheduled job

---

### 3.5 GET `/api/auth/verify-email`

**Purpose:** Verify user's email address using token from verification email.

**Authentication:** None required

**Query Parameters:**
- `token` (required): 64-character hex verification token

**Request Example:**
```
GET /api/auth/verify-email?token=a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
```

**Success Response (200 OK):**

```json
{
  "message": "Email verified successfully. You can now log in.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Jane Doe",
    "isVerified": true,
    "createdAt": "2025-10-03T12:00:00.000Z",
    "updatedAt": "2025-10-03T12:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid Token Format:**
```json
{
  "error": {
    "message": "Invalid token format",
    "code": "VALIDATION_ERROR",
    "statusCode": 400
  }
}
```

**404 Not Found - Token Not Found or Expired:**
```json
{
  "error": {
    "message": "Verification token is invalid or has expired",
    "code": "TOKEN_NOT_FOUND",
    "statusCode": 404
  }
}
```

**Implementation Requirements:**
1. Validate token format (64 hex characters)
2. Find token in database where `expires_at > NOW()`
3. If not found or expired, return error
4. Get associated user
5. If user already verified, return success anyway (idempotent)
6. Update user: `isVerified = true`
7. Delete verification token (one-time use)
8. Return success with user data
9. Log verification event

**Database Queries:**
```sql
-- Find valid token
SELECT user_id
FROM email_verification_tokens
WHERE token = $1 AND expires_at > NOW();

-- Update user
UPDATE users
SET is_verified = true, updated_at = NOW()
WHERE id = $1
RETURNING id, email, full_name, is_verified, created_at, updated_at;

-- Delete used token
DELETE FROM email_verification_tokens
WHERE token = $1;
```

**Transaction:** Wrap user update and token deletion in transaction for atomicity.

---

### 3.6 POST `/api/auth/resend-verification`

**Purpose:** Resend verification email to unverified user.

**Authentication:** None required

**Request Body:**

```typescript
{
  email: string;        // User's email address
}
```

**Request Example:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**

```json
{
  "message": "Verification email sent. Please check your inbox."
}
```

**Error Responses:**

**404 Not Found - User Not Found:**
```json
{
  "error": {
    "message": "No account found with this email address",
    "code": "USER_NOT_FOUND",
    "statusCode": 404
  }
}
```

**400 Bad Request - Already Verified:**
```json
{
  "error": {
    "message": "Email is already verified. You can log in now.",
    "code": "VALIDATION_ERROR",
    "statusCode": 400
  }
}
```

**Implementation Requirements:**
1. Validate email format
2. Find user by email
3. Check if already verified, return error if so
4. Delete existing verification tokens for this user
5. Generate new verification token
6. Store token with 24-hour expiration
7. Send verification email
8. Return success message
9. Rate limit (3 requests per hour per email)

**Database Queries:**
```sql
-- Find user
SELECT id, is_verified FROM users WHERE LOWER(email) = LOWER($1);

-- Delete old tokens
DELETE FROM email_verification_tokens WHERE user_id = $1;

-- Create new token
INSERT INTO email_verification_tokens (user_id, token, expires_at)
VALUES ($1, $2, NOW() + INTERVAL '24 hours');
```

---

### 3.7 GET `/api/auth/me`

**Purpose:** Get current authenticated user's profile.

**Authentication:** Required (JWT Bearer token)

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Jane Doe",
    "isVerified": true,
    "createdAt": "2025-10-03T12:00:00.000Z",
    "updatedAt": "2025-10-03T12:00:00.000Z"
  }
}
```

**Error Responses:**

**401 Unauthorized - Missing or Invalid Token:**
```json
{
  "error": {
    "message": "Invalid or expired token",
    "code": "UNAUTHORIZED",
    "statusCode": 401
  }
}
```

**404 Not Found - User Not Found:**
```json
{
  "error": {
    "message": "User not found",
    "code": "USER_NOT_FOUND",
    "statusCode": 404
  }
}
```

**Implementation Requirements:**
1. JWT validation handled by auth middleware
2. User ID extracted from JWT payload (`sub` claim)
3. Fetch user from database by ID
4. Return user data (exclude password hash)
5. If user not found (deleted account), return 404

**Database Queries:**
```sql
-- Get user by ID
SELECT id, email, full_name, is_verified, created_at, updated_at
FROM users
WHERE id = $1;
```

---

## 4. Authentication Middleware

### 4.1 JWT Authentication Middleware

**Purpose:** Validate JWT token and attach user to request object.

**Applied to:** Routes requiring authentication (`/logout`, `/me`)

**Process:**
1. Extract token from Authorization header (`Bearer <token>`)
2. If no token, return 401 Unauthorized
3. Verify JWT signature using `JWT_SECRET`
4. If invalid or expired, return 401 Unauthorized
5. Check if token JTI exists in blacklist
6. If blacklisted, return 401 Unauthorized (token was logged out)
7. Decode JWT payload to get user info
8. Optionally: fetch fresh user data from database
9. Attach user to `req.user`
10. Call `next()`

**Implementation:**

```typescript
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    
    const token = authHeader.substring(7);
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Check blacklist
    const isBlacklisted = await tokenRepository.isTokenBlacklisted(payload.jti);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }
    
    // Fetch current user data
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    req.user = toUserPublic(user);
    next();
  } catch (error) {
    next(error);
  }
};
```

**Database Query:**
```sql
-- Check if token is blacklisted
SELECT 1 FROM token_blacklist WHERE token_jti = $1;
```

---

## 5. Validation Middleware

### 5.1 Request Validation Middleware

**Purpose:** Validate request body/query/params against Zod schema.

**Implementation:**

```typescript
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        next(new ValidationError('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
};
```

**Usage:**

```typescript
router.post('/register', validateRequest(RegisterRequestSchema), authController.register);
```

---

## 6. Error Handler Middleware

### 6.1 Global Error Handler

**Purpose:** Catch all errors and format consistent error responses.

**Implementation:**

```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        details: err.details
      }
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        message: 'Invalid token',
        code: 'TOKEN_INVALID',
        statusCode: 401
      }
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        statusCode: 401
      }
    });
  }
  
  // Handle database errors
  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({
      error: {
        message: 'Resource already exists',
        code: 'CONFLICT',
        statusCode: 409
      }
    });
  }
  
  // Default 500 error
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500
    }
  });
};
```

---

## 7. Rate Limiting

### 7.1 Rate Limit Configuration

**Recommended Limits:**

```typescript
// Login rate limit: 10 requests per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later'
});

// Registration rate limit: 5 requests per hour
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many registration attempts, please try again later'
});

// Resend verification: 3 requests per hour
const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many requests, please try again later'
});
```

**Apply to Routes:**

```typescript
router.post('/login', loginLimiter, validateRequest(LoginRequestSchema), authController.login);
router.post('/register', registerLimiter, validateRequest(RegisterRequestSchema), authController.register);
router.post('/resend-verification', resendLimiter, validateRequest(ResendVerificationRequestSchema), authController.resendVerification);
```

---

## 8. Route Registration

### 8.1 Complete Route Setup

**File:** `src/server/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import { authController } from '../controllers';
import { authenticateJWT, validateRequest } from '../middleware';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  VerifyEmailRequestSchema,
  ResendVerificationRequestSchema
} from '../../types';

const router = Router();

// Public routes
router.post('/register', validateRequest(RegisterRequestSchema), authController.register);
router.post('/login', validateRequest(LoginRequestSchema), authController.login);
router.post('/google', validateRequest(GoogleLoginRequestSchema), authController.googleLogin);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', validateRequest(ResendVerificationRequestSchema), authController.resendVerification);

// Protected routes
router.post('/logout', authenticateJWT, authController.logout);
router.get('/me', authenticateJWT, authController.getMe);

export default router;
```

**File:** `src/server/routes/index.ts`

```typescript
import { Express } from 'express';
import authRoutes from './auth.routes';

export const registerRoutes = (app: Express) => {
  app.use('/api/auth', authRoutes);
};
```

---

## 9. CORS Configuration

### 9.1 CORS Setup

**Allow Frontend Origin:**

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 10. API Testing Checklist

**For Each Endpoint:**
- [ ] Happy path with valid data
- [ ] Invalid request body (validation errors)
- [ ] Missing required fields
- [ ] Invalid data types
- [ ] SQL injection attempts
- [ ] XSS attempts in string fields
- [ ] Extremely long input strings
- [ ] Concurrent requests
- [ ] Rate limit enforcement
- [ ] Authentication bypass attempts
- [ ] Token expiration handling
- [ ] Database connection failures
- [ ] Email service failures

**Security Tests:**
- [ ] Password hashing (never store plain text)
- [ ] JWT signature validation
- [ ] Token blacklist enforcement
- [ ] CORS policy enforcement
- [ ] Rate limiting effectiveness
- [ ] Error messages don't leak sensitive info
- [ ] Timing attack resistance (password comparison)

---

## 11. Logging Requirements

**Log All:**
- Registration attempts (success/failure)
- Login attempts (success/failure) with IP
- Logout events
- Email verification events
- Failed authentication attempts
- Token blacklist additions
- Database errors
- Unhandled errors

**Log Format:**

```json
{
  "timestamp": "2025-10-03T12:00:00.000Z",
  "level": "info",
  "event": "user_login",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "ip": "192.168.1.1",
  "success": true
}
```

**Never Log:**
- Passwords (plain or hashed)
- JWT tokens
- Verification tokens

---

## 12. Health Check Endpoint

**GET `/api/health`**

```typescript
router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});
```

---

## 13. Implementation Order

1. **Setup infrastructure:** Express app, database connection, environment config
2. **Implement repositories:** Database queries for users and tokens
3. **Implement services:** Business logic for auth operations
4. **Implement middleware:** Authentication, validation, error handling
5. **Implement controllers:** Request/response handling
6. **Register routes:** Connect everything together
7. **Test endpoints:** Manual testing with Postman/Insomnia
8. **Add rate limiting:** Protect against abuse
9. **Add logging:** Monitor system behavior
10. **Write automated tests:** Unit and integration tests

