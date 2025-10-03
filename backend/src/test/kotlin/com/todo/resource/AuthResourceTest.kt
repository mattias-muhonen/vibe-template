package com.todo.resource

import io.quarkus.test.junit.QuarkusTest
import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import org.hamcrest.Matchers.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.DisplayName

/**
 * Integration tests for Authentication API endpoints
 * Based on: docs/specs/features/authentication.md
 * 
 * These tests are written FIRST (TDD approach) and should FAIL until implementation is complete.
 */
@QuarkusTest
class AuthResourceTest {

    // ========================================
    // Scenario: User Registration
    // ========================================
    
    @Test
    @DisplayName("Should register new user with valid email, name, and password")
    fun testSuccessfulRegistration() {
        val requestBody = mapOf(
            "email" to "newuser@example.com",
            "fullName" to "John Doe",
            "password" to "SecurePass123!"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .`when`()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
            .body("user.email", equalTo("newuser@example.com"))
            .body("user.fullName", equalTo("John Doe"))
            .body("user.isVerified", equalTo(false))
            .body("token", notNullValue())
            .body("message", containsString("Please check your email"))
    }
    
    @Test
    @DisplayName("Should reject registration with duplicate email")
    fun testDuplicateEmailRegistration() {
        // First registration
        val requestBody = mapOf(
            "email" to "duplicate@example.com",
            "fullName" to "First User",
            "password" to "SecurePass123!"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .`when`()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
        
        // Second registration with same email (should fail)
        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .`when`()
            .post("/api/auth/register")
        .then()
            .statusCode(409)
            .body("error", containsString("Email already registered"))
    }
    
    @Test
    @DisplayName("Should reject registration with invalid email format")
    fun testInvalidEmailFormat() {
        val requestBody = mapOf(
            "email" to "invalid-email",
            "fullName" to "Test User",
            "password" to "SecurePass123!"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .`when`()
            .post("/api/auth/register")
        .then()
            .statusCode(400)
            .body("error", containsString("Invalid email format"))
    }
    
    @Test
    @DisplayName("Should reject registration with weak password")
    fun testWeakPassword() {
        val requestBody = mapOf(
            "email" to "test@example.com",
            "fullName" to "Test User",
            "password" to "weak"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .`when`()
            .post("/api/auth/register")
        .then()
            .statusCode(400)
            .body("error", containsString("Password must be at least"))
    }
    
    @Test
    @DisplayName("Should reject registration with missing required fields")
    fun testMissingRequiredFields() {
        val requestBody = mapOf(
            "email" to "test@example.com"
            // Missing fullName and password
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .`when`()
            .post("/api/auth/register")
        .then()
            .statusCode(400)
    }

    // ========================================
    // Scenario: Email Verification
    // ========================================
    
    @Test
    @DisplayName("Should verify email with valid token")
    fun testSuccessfulEmailVerification() {
        // Register user first
        val registerBody = mapOf(
            "email" to "verify@example.com",
            "fullName" to "Verify User",
            "password" to "SecurePass123!"
        )
        
        val registerResponse = given()
            .contentType(ContentType.JSON)
            .body(registerBody)
        .`when`()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
            .extract()
        
        // Simulate getting verification token (would come from email in real scenario)
        // For tests, we'd need to access token from database or mock email service
        val verificationToken = "valid-token-from-email"
        
        given()
            .queryParam("token", verificationToken)
        .`when`()
            .get("/api/auth/verify-email")
        .then()
            .statusCode(200)
            .body("message", containsString("Email verified successfully"))
            .body("user.isVerified", equalTo(true))
    }
    
    @Test
    @DisplayName("Should reject verification with invalid token")
    fun testInvalidVerificationToken() {
        given()
            .queryParam("token", "invalid-token")
        .`when`()
            .get("/api/auth/verify-email")
        .then()
            .statusCode(400)
            .body("error", containsString("Invalid or expired verification token"))
    }
    
    @Test
    @DisplayName("Should reject verification with expired token")
    fun testExpiredVerificationToken() {
        given()
            .queryParam("token", "expired-token")
        .`when`()
            .get("/api/auth/verify-email")
        .then()
            .statusCode(400)
            .body("error", containsString("expired"))
    }

    // ========================================
    // Scenario: Successful Login
    // ========================================
    
    @Test
    @DisplayName("Should login verified user with correct credentials")
    fun testSuccessfulLogin() {
        // Register and verify user first (test setup)
        // ... setup code ...
        
        val loginBody = mapOf(
            "email" to "verified@example.com",
            "password" to "SecurePass123!"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(loginBody)
        .`when`()
            .post("/api/auth/login")
        .then()
            .statusCode(200)
            .body("token", notNullValue())
            .body("user.email", equalTo("verified@example.com"))
            .body("user.isVerified", equalTo(true))
    }

    // ========================================
    // Scenario: Failed Login - Invalid Credentials
    // ========================================
    
    @Test
    @DisplayName("Should reject login with incorrect password")
    fun testLoginWithWrongPassword() {
        val loginBody = mapOf(
            "email" to "verified@example.com",
            "password" to "WrongPassword123!"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(loginBody)
        .`when`()
            .post("/api/auth/login")
        .then()
            .statusCode(401)
            .body("error", equalTo("Invalid email or password"))
    }
    
    @Test
    @DisplayName("Should reject login with non-existent email")
    fun testLoginWithNonExistentEmail() {
        val loginBody = mapOf(
            "email" to "nonexistent@example.com",
            "password" to "Password123!"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(loginBody)
        .`when`()
            .post("/api/auth/login")
        .then()
            .statusCode(401)
            .body("error", equalTo("Invalid email or password"))
    }

    // ========================================
    // Scenario: Failed Login - Unverified Account
    // ========================================
    
    @Test
    @DisplayName("Should reject login for unverified account")
    fun testLoginWithUnverifiedAccount() {
        // Register user but don't verify
        val registerBody = mapOf(
            "email" to "unverified@example.com",
            "fullName" to "Unverified User",
            "password" to "SecurePass123!"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(registerBody)
        .`when`()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
        
        // Try to login without verifying
        val loginBody = mapOf(
            "email" to "unverified@example.com",
            "password" to "SecurePass123!"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(loginBody)
        .`when`()
            .post("/api/auth/login")
        .then()
            .statusCode(403)
            .body("error", containsString("Please verify your email"))
    }
    
    @Test
    @DisplayName("Should resend verification email when unverified user attempts login")
    fun testResendVerificationOnLoginAttempt() {
        // This test verifies that a new verification email is sent
        // when an unverified user tries to login
        
        val loginBody = mapOf(
            "email" to "unverified@example.com",
            "password" to "SecurePass123!"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(loginBody)
        .`when`()
            .post("/api/auth/login")
        .then()
            .statusCode(403)
            .body("message", containsString("verification email has been sent"))
    }

    // ========================================
    // Scenario: Logout
    // ========================================
    
    @Test
    @DisplayName("Should logout authenticated user successfully")
    fun testSuccessfulLogout() {
        // Login first to get token
        val loginBody = mapOf(
            "email" to "verified@example.com",
            "password" to "SecurePass123!"
        )
        
        val token = given()
            .contentType(ContentType.JSON)
            .body(loginBody)
        .`when`()
            .post("/api/auth/login")
        .then()
            .statusCode(200)
            .extract()
            .path<String>("token")
        
        // Logout
        given()
            .header("Authorization", "Bearer $token")
        .`when`()
            .post("/api/auth/logout")
        .then()
            .statusCode(200)
            .body("message", containsString("Logged out successfully"))
    }
    
    @Test
    @DisplayName("Should reject logout without authentication token")
    fun testLogoutWithoutToken() {
        given()
        .`when`()
            .post("/api/auth/logout")
        .then()
            .statusCode(401)
    }
    
    @Test
    @DisplayName("Should not allow API access with blacklisted token after logout")
    fun testBlacklistedTokenAfterLogout() {
        // Login and logout
        val loginBody = mapOf(
            "email" to "verified@example.com",
            "password" to "SecurePass123!"
        )
        
        val token = given()
            .contentType(ContentType.JSON)
            .body(loginBody)
        .`when`()
            .post("/api/auth/login")
        .then()
            .extract()
            .path<String>("token")
        
        given()
            .header("Authorization", "Bearer $token")
        .`when`()
            .post("/api/auth/logout")
        .then()
            .statusCode(200)
        
        // Try to use the token after logout
        given()
            .header("Authorization", "Bearer $token")
        .`when`()
            .get("/api/auth/me")
        .then()
            .statusCode(401)
            .body("error", containsString("Token has been invalidated"))
    }

    // ========================================
    // Additional Security Tests
    // ========================================
    
    @Test
    @DisplayName("Should get current user info with valid token")
    fun testGetCurrentUser() {
        // Login first
        val loginBody = mapOf(
            "email" to "verified@example.com",
            "password" to "SecurePass123!"
        )
        
        val token = given()
            .contentType(ContentType.JSON)
            .body(loginBody)
        .`when`()
            .post("/api/auth/login")
        .then()
            .extract()
            .path<String>("token")
        
        // Get current user
        given()
            .header("Authorization", "Bearer $token")
        .`when`()
            .get("/api/auth/me")
        .then()
            .statusCode(200)
            .body("email", equalTo("verified@example.com"))
            .body("isVerified", equalTo(true))
            .body("password", nullValue()) // Password should never be returned
            .body("passwordHash", nullValue()) // Password hash should never be returned
    }
    
    @Test
    @DisplayName("Should reject access to protected endpoint without token")
    fun testProtectedEndpointWithoutToken() {
        given()
        .`when`()
            .get("/api/auth/me")
        .then()
            .statusCode(401)
    }
    
    @Test
    @DisplayName("Should reject access to protected endpoint with invalid token")
    fun testProtectedEndpointWithInvalidToken() {
        given()
            .header("Authorization", "Bearer invalid-token")
        .`when`()
            .get("/api/auth/me")
        .then()
            .statusCode(401)
    }
    
    @Test
    @DisplayName("Should enforce password strength requirements")
    fun testPasswordStrengthValidation() {
        val testCases = listOf(
            mapOf("password" to "short", "reason" to "too short"),
            mapOf("password" to "alllowercase123", "reason" to "no uppercase"),
            mapOf("password" to "ALLUPPERCASE123", "reason" to "no lowercase"),
            mapOf("password" to "NoNumbers", "reason" to "no numbers"),
            mapOf("password" to "12345678", "reason" to "no letters")
        )
        
        testCases.forEach { testCase ->
            val requestBody = mapOf(
                "email" to "test@example.com",
                "fullName" to "Test User",
                "password" to testCase["password"]
            )
            
            given()
                .contentType(ContentType.JSON)
                .body(requestBody)
            .`when`()
                .post("/api/auth/register")
            .then()
                .statusCode(400)
        }
    }
}

