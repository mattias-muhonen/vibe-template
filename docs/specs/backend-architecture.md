# Backend Architecture: Authentication System

## 1. Overview

This document defines the backend architecture for the authentication system using Quarkus with Kotlin. The architecture follows a layered design pattern emphasizing separation of concerns, testability, and maintainability. Supports both email/password and Google OAuth authentication.

**Framework:** Quarkus 3.x  
**Language:** Kotlin 1.9+  
**Database:** PostgreSQL 14+ with Hibernate ORM (Panache)  
**OAuth Provider:** Google OAuth 2.0  
**Architecture Pattern:** Layered (Resources → Services → Repositories → Entities)

## 2. Technology Stack

### 2.1 Core Dependencies (build.gradle.kts)

```kotlin
dependencies {
    // Quarkus Core
    implementation("io.quarkus:quarkus-kotlin")
    implementation("io.quarkus:quarkus-resteasy-reactive-jackson")
    implementation("io.quarkus:quarkus-arc") // CDI
    
    // Database
    implementation("io.quarkus:quarkus-hibernate-orm-panache-kotlin")
    implementation("io.quarkus:quarkus-jdbc-postgresql")
    implementation("io.quarkus:quarkus-flyway")
    
    // Security & Authentication
    implementation("io.quarkus:quarkus-security")
    implementation("io.quarkus:quarkus-smallrye-jwt")
    implementation("io.quarkus:quarkus-smallrye-jwt-build")
    implementation("at.favre.lib:bcrypt:0.10.2")
    implementation("com.google.api-client:google-api-client:2.2.0")
    
    // Validation
    implementation("io.quarkus:quarkus-hibernate-validator")
    
    // Testing
    testImplementation("io.quarkus:quarkus-junit5")
    testImplementation("io.rest-assured:rest-assured")
}
```

### 2.2 Quarkus Extensions

```bash
# Core extensions
quarkus-kotlin
quarkus-resteasy-reactive-jackson
quarkus-hibernate-orm-panache-kotlin
quarkus-jdbc-postgresql
quarkus-flyway
quarkus-security
quarkus-smallrye-jwt
quarkus-hibernate-validator
```

## 3. Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/todo/
│   │   │       ├── config/
│   │   │       │   ├── JwtConfig.kt             # JWT configuration
│   │   │       │   ├── SecurityConfig.kt        # Security settings
│   │   │       │   └── GoogleOAuthConfig.kt     # Google OAuth setup
│   │   │       ├── domain/
│   │   │       │   ├── User.kt                  # User entity
│   │   │       │   ├── EmailVerificationToken.kt
│   │   │       │   └── TokenBlacklist.kt
│   │   │       ├── repository/
│   │   │       │   ├── UserRepository.kt        # User data access (Panache)
│   │   │       │   ├── EmailVerificationTokenRepository.kt
│   │   │       │   └── TokenBlacklistRepository.kt
│   │   │       ├── service/
│   │   │       │   ├── AuthService.kt           # Authentication business logic
│   │   │       │   ├── UserService.kt           # User management
│   │   │       │   ├── TokenService.kt          # JWT token generation
│   │   │       │   ├── EmailService.kt          # Email verification
│   │   │       │   └── GoogleAuthService.kt     # Google OAuth verification
│   │   │       ├── resource/
│   │   │       │   ├── AuthResource.kt          # Auth REST endpoints
│   │   │       │   └── HealthResource.kt        # Health check
│   │   │       ├── dto/
│   │   │       │   ├── RegisterRequest.kt       # Request DTOs
│   │   │       │   ├── LoginRequest.kt
│   │   │       │   ├── GoogleLoginRequest.kt
│   │   │       │   ├── AuthResponse.kt          # Response DTOs
│   │   │       │   └── UserResponse.kt
│   │   │       ├── security/
│   │   │       │   ├── JwtTokenProvider.kt      # JWT generation/validation
│   │   │       │   ├── PasswordEncoder.kt       # BCrypt wrapper
│   │   │       │   └── AuthenticationFilter.kt  # JWT filter (if custom)
│   │   │       ├── exception/
│   │   │       │   ├── AppException.kt          # Base exception
│   │   │       │   ├── AuthenticationException.kt
│   │   │       │   └── ExceptionMapper.kt       # Global error handling
│   │   │       └── util/
│   │   │           ├── Extensions.kt            # Kotlin extensions
│   │   │           └── Constants.kt             # App constants
│   │   └── resources/
│   │       ├── application.properties           # Quarkus configuration
│   │       ├── application-dev.properties       # Dev profile
│   │       ├── application-prod.properties      # Prod profile
│   │       └── db/migration/
│   │           ├── V1__create_users_table.sql
│   │           ├── V2__create_email_verification_tokens_table.sql
│   │           └── V3__create_token_blacklist_table.sql
│   └── test/
│       └── kotlin/
│           └── com/todo/
│               ├── resource/
│               │   └── AuthResourceTest.kt      # Integration tests
│               └── service/
│                   └── AuthServiceTest.kt       # Unit tests
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
└── README.md
```

## 4. Architecture Layers

### 4.1 Resource Layer (REST Controllers)

**Responsibility:** Handle HTTP requests/responses, validation, and routing.

**Example: AuthResource.kt**

```kotlin
@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
class AuthResource(
    private val authService: AuthService
) {
    
    @POST
    @Path("/register")
    fun register(@Valid request: RegisterRequest): Response {
        val response = authService.register(request)
        return Response.status(Response.Status.CREATED).entity(response).build()
    }
    
    @POST
    @Path("/login")
    fun login(@Valid request: LoginRequest): Response {
        val response = authService.login(request)
        return Response.ok(response).build()
    }
    
    @POST
    @Path("/google")
    fun googleLogin(@Valid request: GoogleLoginRequest): Response {
        val response = authService.googleLogin(request)
        return Response.ok(response).build()
    }
    
    @GET
    @Path("/me")
    @Authenticated // Requires valid JWT
    fun getCurrentUser(@Context securityContext: SecurityContext): Response {
        val email = securityContext.userPrincipal.name
        val user = authService.getUserByEmail(email)
        return Response.ok(user).build()
    }
    
    @POST
    @Path("/logout")
    @Authenticated
    fun logout(@HeaderParam("Authorization") authHeader: String): Response {
        authService.logout(authHeader)
        return Response.noContent().build()
    }
}
```

**Key Features:**
- JAX-RS annotations for routing
- Dependency injection via constructor
- Built-in validation with `@Valid`
- Security context for authenticated endpoints

### 4.2 Service Layer

**Responsibility:** Business logic, orchestration, and data transformation.

**Example: AuthService.kt**

```kotlin
@ApplicationScoped
class AuthService(
    private val userRepository: UserRepository,
    private val tokenService: TokenService,
    private val passwordEncoder: PasswordEncoder,
    private val googleAuthService: GoogleAuthService,
    private val emailService: EmailService
) {
    
    @Transactional
    fun register(request: RegisterRequest): AuthResponse {
        // Check if user exists
        if (userRepository.findByEmail(request.email) != null) {
            throw AppException.Conflict("User already exists")
        }
        
        // Create user
        val user = User(
            email = request.email,
            fullName = request.fullName,
            passwordHash = passwordEncoder.encode(request.password),
            authProvider = AuthProvider.EMAIL,
            isVerified = false
        )
        userRepository.persist(user)
        
        // Send verification email
        emailService.sendVerificationEmail(user)
        
        // Return response (without JWT until verified)
        return AuthResponse(
            message = "Registration successful. Please verify your email.",
            user = user.toDto()
        )
    }
    
    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            ?: throw AppException.Unauthorized("Invalid credentials")
        
        if (!passwordEncoder.matches(request.password, user.passwordHash!!)) {
            throw AppException.Unauthorized("Invalid credentials")
        }
        
        if (!user.isVerified) {
            throw AppException.Unauthorized("Email not verified")
        }
        
        val token = tokenService.generateToken(user)
        return AuthResponse(
            token = token,
            user = user.toDto()
        )
    }
    
    fun googleLogin(request: GoogleLoginRequest): AuthResponse {
        // Verify Google ID token
        val googleUser = googleAuthService.verifyIdToken(request.idToken)
        
        // Find or create user
        var user = userRepository.findByGoogleId(googleUser.id)
        if (user == null) {
            user = User(
                email = googleUser.email,
                fullName = googleUser.name,
                googleId = googleUser.id,
                avatarUrl = googleUser.pictureUrl,
                authProvider = AuthProvider.GOOGLE,
                isVerified = true // Google users are pre-verified
            )
            userRepository.persist(user)
        }
        
        val token = tokenService.generateToken(user)
        return AuthResponse(
            token = token,
            user = user.toDto()
        )
    }
    
    @Transactional
    fun logout(authHeader: String) {
        val token = authHeader.removePrefix("Bearer ")
        tokenService.blacklistToken(token)
    }
}
```

**Key Features:**
- `@ApplicationScoped` for singleton CDI bean
- `@Transactional` for database transactions
- Exception handling with custom exceptions
- Clear separation of concerns

### 4.3 Repository Layer (Data Access)

**Responsibility:** Database queries using Hibernate Panache.

**Example: UserRepository.kt**

```kotlin
@ApplicationScoped
class UserRepository : PanacheRepository<User> {
    
    fun findByEmail(email: String): User? {
        return find("LOWER(email) = LOWER(?1)", email).firstResult()
    }
    
    fun findByGoogleId(googleId: String): User? {
        return find("googleId", googleId).firstResult()
    }
    
    fun existsByEmail(email: String): Boolean {
        return count("LOWER(email) = LOWER(?1)", email) > 0
    }
}
```

**Key Features:**
- Extends `PanacheRepository<T>` for basic CRUD
- Type-safe queries with Kotlin
- Automatic transaction management
- Built-in pagination support

### 4.4 Domain Layer (Entities)

**Responsibility:** Database entities and business domain models.

**Example: User.kt**

```kotlin
@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    
    @Column(unique = true, nullable = false)
    var email: String,
    
    @Column(name = "full_name", nullable = false)
    var fullName: String,
    
    @Column(name = "password_hash")
    var passwordHash: String? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false)
    var authProvider: AuthProvider = AuthProvider.EMAIL,
    
    @Column(name = "google_id", unique = true)
    var googleId: String? = null,
    
    @Column(name = "avatar_url")
    var avatarUrl: String? = null,
    
    @Column(name = "is_verified", nullable = false)
    var isVerified: Boolean = false,
    
    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    fun toDto(): UserResponse = UserResponse(
        id = id!!,
        email = email,
        fullName = fullName,
        authProvider = authProvider,
        avatarUrl = avatarUrl,
        isVerified = isVerified,
        createdAt = createdAt
    )
}

enum class AuthProvider {
    EMAIL, GOOGLE
}
```

**Key Features:**
- JPA annotations for ORM mapping
- Kotlin data classes for immutability
- Conversion methods to DTOs
- Timestamps for auditing

## 5. Configuration

### 5.1 application.properties

```properties
# Database
quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=postgres
quarkus.datasource.password=postgres
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/todo_db

# Hibernate
quarkus.hibernate-orm.database.generation=none
quarkus.hibernate-orm.log.sql=true

# Flyway
quarkus.flyway.migrate-at-start=true
quarkus.flyway.locations=db/migration

# JWT
mp.jwt.verify.publickey.location=META-INF/resources/publicKey.pem
mp.jwt.verify.issuer=https://todo-app.com
smallrye.jwt.sign.key.location=privateKey.pem
smallrye.jwt.expiry.seconds=86400

# Google OAuth
google.client.id=${GOOGLE_CLIENT_ID}

# CORS
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:3000
quarkus.http.cors.methods=GET,POST,PUT,DELETE,OPTIONS
quarkus.http.cors.headers=accept,authorization,content-type

# Server
quarkus.http.port=8080
```

### 5.2 JWT Configuration

**JwtConfig.kt**

```kotlin
@ConfigMapping(prefix = "jwt")
interface JwtConfig {
    fun issuer(): String
    fun expirySeconds(): Long
}
```

### 5.3 Google OAuth Configuration

**GoogleOAuthConfig.kt**

```kotlin
@ApplicationScoped
class GoogleOAuthConfig {
    
    @ConfigProperty(name = "google.client.id")
    lateinit var clientId: String
    
    fun createVerifier(): GoogleIdTokenVerifier {
        val transport = GoogleNetHttpTransport.newTrustedTransport()
        val jsonFactory = GsonFactory.getDefaultInstance()
        
        return GoogleIdTokenVerifier.Builder(transport, jsonFactory)
            .setAudience(listOf(clientId))
            .build()
    }
}
```

## 6. Security Implementation

### 6.1 Password Hashing

```kotlin
@ApplicationScoped
class PasswordEncoder {
    private val bcrypt = BCrypt.withDefaults()
    
    fun encode(password: String): String {
        return bcrypt.hashToString(12, password.toCharArray())
    }
    
    fun matches(password: String, hash: String): Boolean {
        return bcrypt.verify(password.toCharArray(), hash).verified
    }
}
```

### 6.2 JWT Token Generation

```kotlin
@ApplicationScoped
class TokenService(
    private val jwtConfig: JwtConfig,
    private val tokenBlacklistRepository: TokenBlacklistRepository
) {
    
    fun generateToken(user: User): String {
        return Jwt.issuer(jwtConfig.issuer())
            .subject(user.email)
            .claim("userId", user.id)
            .claim("fullName", user.fullName)
            .expiresIn(Duration.ofSeconds(jwtConfig.expirySeconds()))
            .sign()
    }
    
    fun blacklistToken(token: String) {
        val decodedJwt = JWT.decode(token)
        val jti = decodedJwt.id
        val expiresAt = decodedJwt.expiresAt.toInstant()
        
        val blacklistEntry = TokenBlacklist(
            tokenJti = jti,
            userId = decodedJwt.getClaim("userId").asLong(),
            expiresAt = expiresAt
        )
        tokenBlacklistRepository.persist(blacklistEntry)
    }
    
    fun isBlacklisted(jti: String): Boolean {
        return tokenBlacklistRepository.findByJti(jti) != null
    }
}
```

### 6.3 Google OAuth Verification

```kotlin
@ApplicationScoped
class GoogleAuthService(
    private val googleConfig: GoogleOAuthConfig
) {
    
    fun verifyIdToken(idToken: String): GoogleUserProfile {
        val verifier = googleConfig.createVerifier()
        val googleIdToken = verifier.verify(idToken)
            ?: throw AppException.Unauthorized("Invalid Google token")
        
        val payload = googleIdToken.payload
        return GoogleUserProfile(
            id = payload.subject,
            email = payload.email,
            name = payload["name"] as String,
            pictureUrl = payload["picture"] as? String
        )
    }
}

data class GoogleUserProfile(
    val id: String,
    val email: String,
    val name: String,
    val pictureUrl: String?
)
```

## 7. Exception Handling

### 7.1 Custom Exceptions

```kotlin
sealed class AppException(
    message: String,
    val statusCode: Int
) : RuntimeException(message) {
    
    class Unauthorized(message: String) : AppException(message, 401)
    class Forbidden(message: String) : AppException(message, 403)
    class NotFound(message: String) : AppException(message, 404)
    class Conflict(message: String) : AppException(message, 409)
    class BadRequest(message: String) : AppException(message, 400)
    class InternalError(message: String) : AppException(message, 500)
}
```

### 7.2 Global Exception Mapper

```kotlin
@Provider
class AppExceptionMapper : ExceptionMapper<AppException> {
    
    override fun toResponse(exception: AppException): Response {
        return Response
            .status(exception.statusCode)
            .entity(ErrorResponse(
                error = exception.javaClass.simpleName,
                message = exception.message ?: "An error occurred",
                timestamp = Instant.now()
            ))
            .build()
    }
}

data class ErrorResponse(
    val error: String,
    val message: String,
    val timestamp: Instant
)
```

## 8. Testing

### 8.1 Integration Test Example

```kotlin
@QuarkusTest
class AuthResourceTest {
    
    @Test
    fun `should register new user successfully`() {
        val request = RegisterRequest(
            email = "test@example.com",
            fullName = "Test User",
            password = "SecurePass123!"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(request)
        .`when`()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
            .body("message", containsString("verify your email"))
    }
    
    @Test
    fun `should login with valid credentials`() {
        val request = LoginRequest(
            email = "verified@example.com",
            password = "password123"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(request)
        .`when`()
            .post("/api/auth/login")
        .then()
            .statusCode(200)
            .body("token", notNullValue())
            .body("user.email", equalTo("verified@example.com"))
    }
}
```

## 9. Database Migrations (Flyway)

### V1__create_users_table.sql

```sql
CREATE TYPE auth_provider AS ENUM ('EMAIL', 'GOOGLE');

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    auth_provider auth_provider NOT NULL DEFAULT 'EMAIL',
    google_id VARCHAR(255) UNIQUE,
    avatar_url VARCHAR(500),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_auth_provider CHECK (
        (auth_provider = 'EMAIL' AND password_hash IS NOT NULL) OR
        (auth_provider = 'GOOGLE' AND google_id IS NOT NULL)
    )
);

CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_google_id ON users(google_id);
```

## 10. Development Workflow

### 10.1 Running in Dev Mode

```bash
cd backend
./gradlew quarkusDev
```

**Features:**
- Hot reload on code changes
- Dev UI at http://localhost:8080/q/dev
- Automatic database setup with Flyway

### 10.2 Building for Production

```bash
./gradlew build
java -jar build/quarkus-app/quarkus-run.jar
```

### 10.3 Native Build (Optional)

```bash
./gradlew build -Dquarkus.package.type=native
./build/backend-1.0.0-runner
```

## 11. API Documentation

Quarkus can auto-generate OpenAPI docs with:

```kotlin
dependencies {
    implementation("io.quarkus:quarkus-smallrye-openapi")
}
```

Access at: `http://localhost:8080/q/openapi`

## 12. Key Differences from Express.js

| Aspect | Express.js (Node) | Quarkus (Kotlin) |
|--------|------------------|------------------|
| **Language** | TypeScript | Kotlin |
| **Runtime** | Node.js | JVM / GraalVM |
| **DI** | Manual/libraries | CDI (built-in) |
| **ORM** | Manual queries (pg) | Hibernate Panache |
| **Migrations** | Custom scripts | Flyway (built-in) |
| **Validation** | Zod | Hibernate Validator |
| **Testing** | Jest/Vitest | JUnit 5 + RestAssured |
| **Hot Reload** | nodemon | Quarkus Dev Mode |
| **Build** | tsc/bundler | Gradle |
| **Deploy** | Docker/Node | JAR / Native binary |

## 13. Next Steps

1. **Setup Project:** Initialize Quarkus project with required extensions
2. **Database:** Create PostgreSQL database and run migrations
3. **Entities:** Implement domain models
4. **Repositories:** Create data access layer
5. **Services:** Implement business logic
6. **Resources:** Build REST endpoints
7. **Security:** Configure JWT and Google OAuth
8. **Testing:** Write integration tests
9. **Frontend Integration:** Connect Next.js to backend API

---

**Document Version:** 2.0  
**Last Updated:** Oct 2025  
**Framework:** Quarkus 3.x + Kotlin
