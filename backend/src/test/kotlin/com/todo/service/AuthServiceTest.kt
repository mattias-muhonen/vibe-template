package com.todo.service

import io.quarkus.test.junit.QuarkusTest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.assertThrows
import javax.inject.Inject

/**
 * Unit tests for AuthService business logic
 * Based on: docs/specs/features/authentication.md
 * 
 * These tests are written FIRST (TDD approach) and should FAIL until implementation is complete.
 */
@QuarkusTest
class AuthServiceTest {

    @Inject
    lateinit var authService: AuthService
    
    // ========================================
    // Registration Tests
    // ========================================
    
    @Test
    @DisplayName("Should hash password before storing")
    fun testPasswordHashing() {
        val plainPassword = "SecurePass123!"
        val email = "hashtest@example.com"
        
        val result = authService.register(
            email = email,
            fullName = "Hash Test User",
            password = plainPassword
        )
        
        // Password should be hashed, not stored in plain text
        assertNotEquals(plainPassword, result.user.passwordHash)
        // Hashed password should not be empty
        assertTrue(result.user.passwordHash.isNotEmpty())
        // Hash should be bcrypt format (starts with $2a$ or $2b$)
        assertTrue(result.user.passwordHash.startsWith("\$2"))
    }
    
    @Test
    @DisplayName("Should create user with unverified status")
    fun testUserCreatedAsUnverified() {
        val result = authService.register(
            email = "unverifiedtest@example.com",
            fullName = "Test User",
            password = "SecurePass123!"
        )
        
        assertFalse(result.user.isVerified)
    }
    
    @Test
    @DisplayName("Should generate verification token on registration")
    fun testVerificationTokenGeneration() {
        val result = authService.register(
            email = "tokentest@example.com",
            fullName = "Token Test",
            password = "SecurePass123!"
        )
        
        // Verification token should be created
        assertNotNull(result.verificationToken)
        // Token should not be empty
        assertTrue(result.verificationToken!!.isNotEmpty())
        // Token should be URL-safe
        assertFalse(result.verificationToken!!.contains(" "))
    }
    
    @Test
    @DisplayName("Should send verification email on registration")
    fun testVerificationEmailSent() {
        // This test verifies that the email service is called
        // Implementation would use a mock or spy to verify the call
        
        val result = authService.register(
            email = "emailtest@example.com",
            fullName = "Email Test",
            password = "SecurePass123!"
        )
        
        // Verify email was sent (implementation specific)
        assertTrue(result.emailSent)
    }
    
    @Test
    @DisplayName("Should reject duplicate email registration")
    fun testDuplicateEmailRejection() {
        val email = "duplicate@example.com"
        
        // First registration
        authService.register(
            email = email,
            fullName = "First User",
            password = "SecurePass123!"
        )
        
        // Second registration with same email should throw exception
        assertThrows<DuplicateEmailException> {
            authService.register(
                email = email,
                fullName = "Second User",
                password = "DifferentPass123!"
            )
        }
    }
    
    @Test
    @DisplayName("Should normalize email to lowercase")
    fun testEmailNormalization() {
        val result1 = authService.register(
            email = "TEST@EXAMPLE.COM",
            fullName = "Test User",
            password = "SecurePass123!"
        )
        
        assertEquals("test@example.com", result1.user.email)
    }
    
    @Test
    @DisplayName("Should trim whitespace from email")
    fun testEmailTrimming() {
        val result = authService.register(
            email = "  spaced@example.com  ",
            fullName = "Test User",
            password = "SecurePass123!"
        )
        
        assertEquals("spaced@example.com", result.user.email)
    }
    
    // ========================================
    // Email Verification Tests
    // ========================================
    
    @Test
    @DisplayName("Should verify email with valid token")
    fun testSuccessfulEmailVerification() {
        // Register user
        val registrationResult = authService.register(
            email = "verify@example.com",
            fullName = "Verify User",
            password = "SecurePass123!"
        )
        
        val token = registrationResult.verificationToken!!
        
        // Verify email
        val verifyResult = authService.verifyEmail(token)
        
        assertTrue(verifyResult.success)
        assertTrue(verifyResult.user.isVerified)
    }
    
    @Test
    @DisplayName("Should reject invalid verification token")
    fun testInvalidVerificationToken() {
        assertThrows<InvalidTokenException> {
            authService.verifyEmail("invalid-token-that-does-not-exist")
        }
    }
    
    @Test
    @DisplayName("Should reject expired verification token")
    fun testExpiredVerificationToken() {
        // This would require manipulating time or database
        // to create an expired token
        
        assertThrows<ExpiredTokenException> {
            authService.verifyEmail("expired-token")
        }
    }
    
    @Test
    @DisplayName("Should delete verification token after successful verification")
    fun testTokenDeletionAfterVerification() {
        val registrationResult = authService.register(
            email = "deleteverify@example.com",
            fullName = "Delete Test",
            "password" to "SecurePass123!"
        )
        
        val token = registrationResult.verificationToken!!
        authService.verifyEmail(token)
        
        // Trying to verify again with same token should fail
        assertThrows<InvalidTokenException> {
            authService.verifyEmail(token)
        }
    }
    
    // ========================================
    // Login Tests
    // ========================================
    
    @Test
    @DisplayName("Should login verified user with correct password")
    fun testSuccessfulLogin() {
        // Setup: Register and verify user
        val email = "login@example.com"
        val password = "SecurePass123!"
        
        val regResult = authService.register(email, "Login User", password)
        authService.verifyEmail(regResult.verificationToken!!)
        
        // Test: Login
        val loginResult = authService.login(email, password)
        
        assertTrue(loginResult.success)
        assertNotNull(loginResult.token)
        assertEquals(email, loginResult.user.email)
    }
    
    @Test
    @DisplayName("Should reject login with incorrect password")
    fun testLoginWithWrongPassword() {
        // Setup
        val email = "wrongpass@example.com"
        val correctPassword = "SecurePass123!"
        val wrongPassword = "WrongPassword123!"
        
        val regResult = authService.register(email, "Test User", correctPassword)
        authService.verifyEmail(regResult.verificationToken!!)
        
        // Test
        assertThrows<InvalidCredentialsException> {
            authService.login(email, wrongPassword)
        }
    }
    
    @Test
    @DisplayName("Should reject login for non-existent user")
    fun testLoginWithNonExistentEmail() {
        assertThrows<InvalidCredentialsException> {
            authService.login("nonexistent@example.com", "Password123!")
        }
    }
    
    @Test
    @DisplayName("Should reject login for unverified user")
    fun testLoginWithUnverifiedAccount() {
        val email = "unverifiedlogin@example.com"
        val password = "SecurePass123!"
        
        // Register but don't verify
        authService.register(email, "Unverified User", password)
        
        // Try to login
        assertThrows<UnverifiedAccountException> {
            authService.login(email, password)
        }
    }
    
    @Test
    @DisplayName("Should resend verification email when unverified user tries to login")
    fun testResendVerificationOnUnverifiedLogin() {
        val email = "resendverify@example.com"
        val password = "SecurePass123!"
        
        authService.register(email, "Test User", password)
        
        try {
            authService.login(email, password)
            fail("Should have thrown UnverifiedAccountException")
        } catch (e: UnverifiedAccountException) {
            // Verify that a new email was sent
            assertTrue(e.newVerificationEmailSent)
        }
    }
    
    @Test
    @DisplayName("Should generate JWT token on successful login")
    fun testJwtTokenGeneration() {
        // Setup
        val email = "jwttest@example.com"
        val password = "SecurePass123!"
        
        val regResult = authService.register(email, "JWT Test", password)
        authService.verifyEmail(regResult.verificationToken!!)
        
        // Test
        val loginResult = authService.login(email, password)
        
        assertNotNull(loginResult.token)
        // JWT should have 3 parts separated by dots
        assertEquals(3, loginResult.token.split(".").size)
    }
    
    @Test
    @DisplayName("Should accept email in any case for login")
    fun testCaseInsensitiveLoginEmail() {
        // Setup
        val email = "casetest@example.com"
        val password = "SecurePass123!"
        
        val regResult = authService.register(email, "Case Test", password)
        authService.verifyEmail(regResult.verificationToken!!)
        
        // Test: Login with different case
        val loginResult = authService.login("CASETEST@EXAMPLE.COM", password)
        
        assertTrue(loginResult.success)
    }
    
    // ========================================
    // Logout Tests
    // ========================================
    
    @Test
    @DisplayName("Should blacklist token on logout")
    fun testTokenBlacklisting() {
        // Setup: Login to get token
        val email = "logout@example.com"
        val password = "SecurePass123!"
        
        val regResult = authService.register(email, "Logout Test", password)
        authService.verifyEmail(regResult.verificationToken!!)
        val loginResult = authService.login(email, password)
        
        // Test: Logout
        authService.logout(loginResult.token)
        
        // Verify token is blacklisted
        assertTrue(authService.isTokenBlacklisted(loginResult.token))
    }
    
    @Test
    @DisplayName("Should reject API calls with blacklisted token")
    fun testBlacklistedTokenRejection() {
        // Setup
        val email = "blacklisttest@example.com"
        val password = "SecurePass123!"
        
        val regResult = authService.register(email, "Blacklist Test", password)
        authService.verifyEmail(regResult.verificationToken!!)
        val loginResult = authService.login(email, password)
        
        // Logout (blacklist token)
        authService.logout(loginResult.token)
        
        // Try to use blacklisted token
        assertThrows<InvalidTokenException> {
            authService.validateToken(loginResult.token)
        }
    }
    
    // ========================================
    // Password Validation Tests
    // ========================================
    
    @Test
    @DisplayName("Should validate password minimum length")
    fun testPasswordMinimumLength() {
        assertThrows<WeakPasswordException> {
            authService.register(
                "test@example.com",
                "Test User",
                "Sh0rt!" // Too short
            )
        }
    }
    
    @Test
    @DisplayName("Should require uppercase letter in password")
    fun testPasswordRequiresUppercase() {
        assertThrows<WeakPasswordException> {
            authService.register(
                "test@example.com",
                "Test User",
                "nouppercase123!" // No uppercase
            )
        }
    }
    
    @Test
    @DisplayName("Should require lowercase letter in password")
    fun testPasswordRequiresLowercase() {
        assertThrows<WeakPasswordException> {
            authService.register(
                "test@example.com",
                "Test User",
                "NOLOWERCASE123!" // No lowercase
            )
        }
    }
    
    @Test
    @DisplayName("Should require number in password")
    fun testPasswordRequiresNumber() {
        assertThrows<WeakPasswordException> {
            authService.register(
                "test@example.com",
                "Test User",
                "NoNumbers!" // No numbers
            )
        }
    }
    
    @Test
    @DisplayName("Should accept strong password")
    fun testStrongPasswordAccepted() {
        val result = authService.register(
            "strongpass@example.com",
            "Test User",
            "StrongPass123!"
        )
        
        assertNotNull(result.user)
    }
    
    // ========================================
    // Token Validation Tests
    // ========================================
    
    @Test
    @DisplayName("Should validate JWT token and extract user info")
    fun testJwtTokenValidation() {
        // Setup
        val email = "tokenvalidation@example.com"
        val password = "SecurePass123!"
        
        val regResult = authService.register(email, "Token Test", password)
        authService.verifyEmail(regResult.verificationToken!!)
        val loginResult = authService.login(email, password)
        
        // Test
        val user = authService.validateToken(loginResult.token)
        
        assertEquals(email, user.email)
    }
    
    @Test
    @DisplayName("Should reject malformed JWT token")
    fun testMalformedTokenRejection() {
        assertThrows<InvalidTokenException> {
            authService.validateToken("not.a.valid.jwt.token")
        }
    }
    
    @Test
    @DisplayName("Should reject expired JWT token")
    fun testExpiredJwtRejection() {
        // This would require manipulating time or using a short-lived token
        assertThrows<ExpiredTokenException> {
            authService.validateToken("expired.jwt.token")
        }
    }
}

// ========================================
// Custom Exception Classes for Tests
// (These should match actual implementation)
// ========================================

class DuplicateEmailException(message: String) : Exception(message)
class InvalidCredentialsException(message: String) : Exception(message)
class UnverifiedAccountException(
    message: String,
    val newVerificationEmailSent: Boolean = false
) : Exception(message)
class InvalidTokenException(message: String) : Exception(message)
class ExpiredTokenException(message: String) : Exception(message)
class WeakPasswordException(message: String) : Exception(message)

