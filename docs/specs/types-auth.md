# TypeScript Types: Authentication System

## 1. Overview

This document defines all TypeScript types, interfaces, and schemas for the authentication system. Types are organized by domain and shared between frontend and backend where applicable. Supports both email/password and Google OAuth authentication.

**Location:** `src/types/auth.ts`  
**Validation Library:** Zod (runtime validation + type inference)  
**Naming Convention:** PascalCase for types/interfaces, camelCase for properties

## 2. Database Entity Types

### 2.1 User Entity

Matches the `users` database table schema.

```typescript
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google'
}

export interface User {
  id: string;              // UUID
  email: string;           // Lowercase, validated format
  fullName: string;        // Display name
  authProvider: AuthProvider; // Authentication method
  passwordHash: string | null; // bcrypt hash for email auth, null for OAuth
  googleId: string | null;   // Google user ID for OAuth, null for email auth
  avatarUrl: string | null;  // Profile picture URL, primarily for OAuth
  isVerified: boolean;     // Email verification status
  createdAt: Date;         // ISO timestamp
  updatedAt: Date;         // ISO timestamp
}
```

**Usage:**
- Backend: Full user object with password hash
- Frontend: Use `UserPublic` (excludes password hash and googleId)

### 2.2 Email Verification Token Entity

Matches the `email_verification_tokens` database table schema.

```typescript
export interface EmailVerificationToken {
  id: string;              // UUID
  userId: string;          // Foreign key to User.id
  token: string;           // 64-character hex string
  expiresAt: Date;         // Expiration timestamp
  createdAt: Date;         // Creation timestamp
}
```

**Usage:** Backend only, never exposed to frontend.

### 2.3 Token Blacklist Entity

Matches the `token_blacklist` database table schema.

```typescript
export interface TokenBlacklist {
  id: string;              // UUID
  tokenJti: string;        // JWT Token ID (unique)
  userId: string;          // Foreign key to User.id
  expiresAt: Date;         // JWT expiration timestamp
  createdAt: Date;         // Blacklist entry creation
}
```

**Usage:** Backend only, never exposed to frontend.

## 3. Public Types (Frontend-Safe)

### 3.1 User Public

User data safe to send to frontend (excludes password hash and googleId).

```typescript
export interface UserPublic {
  id: string;
  email: string;
  fullName: string;
  authProvider: AuthProvider;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Helper Function:**

```typescript
export const toUserPublic = (user: User): UserPublic => {
  const { passwordHash, googleId, ...publicUser } = user;
  return publicUser;
};
```

### 3.2 JWT Payload

Structure of decoded JWT token payload.

```typescript
export interface JwtPayload {
  sub: string;             // Subject: User ID (UUID)
  email: string;           // User email
  jti: string;             // JWT Token ID (UUID)
  iat: number;             // Issued at (Unix timestamp)
  exp: number;             // Expiration (Unix timestamp)
}
```

**Usage:**
- Backend: Token generation and validation
- Frontend: Decode JWT client-side for user info (optional)

## 4. Request DTOs (Data Transfer Objects)

### 4.1 Register Request

```typescript
export interface RegisterRequest {
  email: string;           // Valid email format, lowercase
  fullName: string;        // 1-255 characters
  password: string;        // Min 8 chars, complexity rules
}

export const RegisterRequestSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .max(255, 'Email too long'),
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(255, 'Full name too long')
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

export type RegisterRequestValidated = z.infer<typeof RegisterRequestSchema>;
```

### 4.2 Login Request

```typescript
export interface LoginRequest {
  email: string;           // Email address
  password: string;        // Plain text password
}

export const LoginRequestSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
});

export type LoginRequestValidated = z.infer<typeof LoginRequestSchema>;
```

### 4.3 Verify Email Request

```typescript
export interface VerifyEmailRequest {
  token: string;           // Verification token from email link
}

export const VerifyEmailRequestSchema = z.object({
  token: z.string()
    .length(64, 'Invalid token format')
    .regex(/^[a-f0-9]{64}$/, 'Invalid token format')
});

export type VerifyEmailRequestValidated = z.infer<typeof VerifyEmailRequestSchema>;
```

### 4.4 Resend Verification Request

```typescript
export interface ResendVerificationRequest {
  email: string;           // User email address
}

export const ResendVerificationRequestSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
});

export type ResendVerificationRequestValidated = z.infer<typeof ResendVerificationRequestSchema>;
```

### 4.5 Google Login Request

```typescript
export interface GoogleLoginRequest {
  credential: string;      // Google ID token from OAuth flow
}

export const GoogleLoginRequestSchema = z.object({
  credential: z.string()
    .min(1, 'Google credential is required')
});

export type GoogleLoginRequestValidated = z.infer<typeof GoogleLoginRequestSchema>;
```

### 4.6 Google User Profile

Data received from Google OAuth after token verification.

```typescript
export interface GoogleUserProfile {
  sub: string;             // Google user ID
  email: string;           // Email address
  email_verified: boolean; // Email verification status from Google
  name: string;            // Full name
  picture?: string;        // Profile picture URL
  given_name?: string;     // First name
  family_name?: string;    // Last name
}
```

## 5. Response DTOs

### 5.1 Auth Response

Returned after successful registration or login.

```typescript
export interface AuthResponse {
  user: UserPublic;        // Public user data
  token: string;           // JWT access token
  expiresIn: number;       // Token expiration in seconds
}
```

**Example:**

```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "isVerified": true,
    "createdAt": "2025-10-03T12:00:00.000Z",
    "updatedAt": "2025-10-03T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### 5.2 Message Response

Generic success message response.

```typescript
export interface MessageResponse {
  message: string;         // Human-readable success message
}
```

**Example:**

```json
{
  "message": "Verification email sent. Please check your inbox."
}
```

### 5.3 Error Response

Standard error response format.

```typescript
export interface ErrorResponse {
  error: {
    message: string;       // Human-readable error message
    code: string;          // Machine-readable error code
    statusCode: number;    // HTTP status code
    details?: unknown;     // Optional validation errors or additional info
  };
}
```

**Example:**

```json
{
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS",
    "statusCode": 401
  }
}
```

**With Validation Details:**

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

## 6. Error Code Enum

Machine-readable error codes for client-side handling.

```typescript
export enum AuthErrorCode {
  // Authentication errors (401)
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  GOOGLE_TOKEN_INVALID = 'GOOGLE_TOKEN_INVALID',
  
  // Authorization errors (403)
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Client errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Conflict errors (409)
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  ACCOUNT_EXISTS_WITH_DIFFERENT_PROVIDER = 'ACCOUNT_EXISTS_WITH_DIFFERENT_PROVIDER',
  
  // Not found errors (404)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  
  // Server errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  GOOGLE_OAUTH_ERROR = 'GOOGLE_OAUTH_ERROR'
}
```

**Usage:**

```typescript
// Backend
throw new UnauthorizedError('Invalid token', AuthErrorCode.TOKEN_INVALID);

// Frontend
if (error.code === AuthErrorCode.EMAIL_NOT_VERIFIED) {
  // Show resend verification button
}
```

## 7. Service Layer Types

### 7.1 Create User Parameters

Internal type for user creation in repository layer.

```typescript
export interface CreateEmailUserParams {
  email: string;           // Lowercase, validated
  fullName: string;        // Trimmed
  passwordHash: string;    // bcrypt hash
  authProvider: 'email';   // Always 'email' for this type
}

export interface CreateGoogleUserParams {
  email: string;           // From Google profile
  fullName: string;        // From Google profile
  googleId: string;        // Google user ID
  avatarUrl: string | null; // Profile picture from Google
  authProvider: 'google';  // Always 'google' for this type
}

export type CreateUserParams = CreateEmailUserParams | CreateGoogleUserParams;
```

**Usage:** Repository layer only, not exposed via API.

### 7.2 Find User Parameters

```typescript
export interface FindUserByEmailParams {
  email: string;           // Case-insensitive lookup
}

export interface FindUserByIdParams {
  id: string;              // UUID
}
```

### 7.3 Create Token Parameters

```typescript
export interface CreateVerificationTokenParams {
  userId: string;          // User UUID
  token: string;           // Random 64-char hex string
  expiresAt: Date;         // 24 hours from creation
}

export interface CreateBlacklistEntryParams {
  tokenJti: string;        // JWT Token ID
  userId: string;          // User UUID
  expiresAt: Date;         // Match JWT expiration
}
```

## 8. Express Request Extensions

Extend Express Request to include authenticated user.

**File:** `src/types/express.d.ts`

```typescript
import { UserPublic } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: UserPublic;   // Attached by auth middleware
    }
  }
}
```

**Usage:**

```typescript
// In controller after auth middleware
export const getProfile = (req: Request, res: Response) => {
  const user = req.user; // TypeScript knows this exists
  res.json({ user });
};
```

## 9. Validation Schemas (Complete)

All Zod schemas for runtime validation.

```typescript
// Registration
export const RegisterRequestSchema = z.object({
  email: z.string().email().toLowerCase().max(255),
  fullName: z.string().min(1).max(255).trim(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
});

// Login
export const LoginRequestSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
});

// Email verification
export const VerifyEmailRequestSchema = z.object({
  token: z.string().length(64).regex(/^[a-f0-9]{64}$/)
});

// Resend verification
export const ResendVerificationRequestSchema = z.object({
  email: z.string().email().toLowerCase()
});

// Query parameter for token (GET request)
export const TokenQuerySchema = z.object({
  token: z.string().length(64).regex(/^[a-f0-9]{64}$/)
});
```

## 10. Utility Types

### 10.1 Omit Password Hash

Helper type for excluding password hash.

```typescript
export type UserWithoutPassword = Omit<User, 'passwordHash'>;
```

### 10.2 Partial Update

For future update operations.

```typescript
export type UpdateUserParams = Partial<Pick<User, 'fullName' | 'email'>>;
```

### 10.3 Timestamps

Reusable timestamp interface.

```typescript
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}
```

## 11. Type Guards

Runtime type checking functions.

```typescript
export const isUser = (obj: unknown): obj is User => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    'passwordHash' in obj
  );
};

export const isJwtPayload = (obj: unknown): obj is JwtPayload => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'sub' in obj &&
    'email' in obj &&
    'jti' in obj &&
    'exp' in obj
  );
};
```

## 12. Enum Types

### 12.1 Token Type

For future password reset and other token types.

```typescript
export enum TokenType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',      // Future
  MAGIC_LINK = 'MAGIC_LINK'                // Future
}
```

### 12.2 User Status

For future soft delete and account states.

```typescript
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  UNVERIFIED = 'UNVERIFIED',
  SUSPENDED = 'SUSPENDED',                 // Future
  DELETED = 'DELETED'                      // Future
}
```

## 13. Constants

Type-safe constants for validation and configuration.

```typescript
export const AUTH_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 255,
  FULL_NAME_MAX_LENGTH: 255,
  TOKEN_LENGTH: 64,
  VERIFICATION_TOKEN_EXPIRY_HOURS: 24,
  JWT_EXPIRY_SECONDS: 3600,
  BCRYPT_ROUNDS: 12
} as const;

export type AuthConstants = typeof AUTH_CONSTANTS;
```

## 14. API Response Wrappers

Utility types for consistent API responses.

```typescript
export type ApiSuccess<T> = {
  data: T;
  success: true;
};

export type ApiError = {
  error: ErrorResponse['error'];
  success: false;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

**Usage:**

```typescript
// Backend
const response: ApiSuccess<AuthResponse> = {
  success: true,
  data: { user, token, expiresIn }
};

// Frontend type inference
if (response.success) {
  console.log(response.data.user); // TypeScript knows data exists
} else {
  console.error(response.error.message);
}
```

## 15. Database Query Result Types

Types for raw database query results.

```typescript
export interface UserRow {
  id: string;
  email: string;
  full_name: string;        // Database uses snake_case
  auth_provider: 'email' | 'google';
  password_hash: string | null;
  google_id: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;       // PostgreSQL returns ISO string
  updated_at: string;
}

export interface EmailVerificationTokenRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface TokenBlacklistRow {
  id: string;
  token_jti: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}
```

**Mapper Functions:**

```typescript
export const mapUserRowToUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  fullName: row.full_name,
  authProvider: row.auth_provider as AuthProvider,
  passwordHash: row.password_hash,
  googleId: row.google_id,
  avatarUrl: row.avatar_url,
  isVerified: row.is_verified,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});
```

## 16. Type Export Organization

**File:** `src/types/auth.ts`

```typescript
// Entities
export type { User, UserPublic, EmailVerificationToken, TokenBlacklist };

// DTOs
export type { RegisterRequest, LoginRequest, VerifyEmailRequest, ResendVerificationRequest };
export type { GoogleLoginRequest, GoogleUserProfile };
export type { AuthResponse, MessageResponse, ErrorResponse };

// Schemas
export { RegisterRequestSchema, LoginRequestSchema, VerifyEmailRequestSchema };
export { ResendVerificationRequestSchema, TokenQuerySchema, GoogleLoginRequestSchema };

// Enums
export { AuthErrorCode, TokenType, UserStatus };

// Constants
export { AUTH_CONSTANTS };

// Utilities
export { toUserPublic, mapUserRowToUser };
export type { ApiResponse, ApiSuccess, ApiError };

// JWT
export type { JwtPayload };
```

## 17. Frontend-Specific Types

Additional types for React frontend (optional).

```typescript
export interface AuthContextState {
  user: UserPublic | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export type AuthContextValue = AuthContextState & AuthContextActions;
```

## 18. Type-Safe Environment Variables

**File:** `src/types/env.ts`

```typescript
import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().default('1h'),
  FRONTEND_URL: z.string().url(),
  VERIFICATION_TOKEN_EXPIRY: z.string().default('24h')
});

export type Env = z.infer<typeof EnvSchema>;
```

## 19. Type Documentation Standards

**Best Practices:**
- Always add JSDoc comments for exported types
- Include examples in comments
- Document all validation rules
- Specify units (seconds, milliseconds, etc.)
- Mark deprecated types with `@deprecated`

**Example:**

```typescript
/**
 * User authentication response returned after successful login or registration.
 * 
 * @example
 * ```typescript
 * const response: AuthResponse = {
 *   user: { id: '123', email: 'user@example.com', ... },
 *   token: 'eyJhbGc...',
 *   expiresIn: 3600
 * };
 * ```
 */
export interface AuthResponse {
  /** Public user data (excludes password hash) */
  user: UserPublic;
  
  /** JWT access token for authentication */
  token: string;
  
  /** Token expiration time in seconds (e.g., 3600 = 1 hour) */
  expiresIn: number;
}
```

## 20. Type Testing Considerations

**Test Type Correctness:**
- Validate Zod schemas with valid/invalid inputs
- Ensure mapper functions preserve type safety
- Test type guards with edge cases
- Verify Express request extensions work correctly

**Example Test:**

```typescript
describe('RegisterRequestSchema', () => {
  it('should accept valid registration data', () => {
    const valid = {
      email: 'user@example.com',
      fullName: 'John Doe',
      password: 'Password123'
    };
    expect(() => RegisterRequestSchema.parse(valid)).not.toThrow();
  });

  it('should reject weak passwords', () => {
    const invalid = {
      email: 'user@example.com',
      fullName: 'John Doe',
      password: 'weak'
    };
    expect(() => RegisterRequestSchema.parse(invalid)).toThrow();
  });
});
```

