# Execution Strategy

## Overview

This document defines the standard execution strategy for implementing features in this project. Every feature follows the same pattern: **Backend → Tests → Frontend**, ensuring a solid foundation before building the user interface.

**Philosophy:** Build from the data layer up. A working, tested API is the foundation for a reliable frontend.

---

## Feature-Based Development

### Feature Organization

Each feature is documented in `docs/specs/features/[feature-name].md` with:
- **Feature Overview** - What and why
- **Functional Requirements** - User behaviors (Gherkin scenarios)
- **Technical Requirements** - Backend, frontend, database needs
- **Manual Verification Protocol** - Test cases
- **Implementation Plan** - Detailed checklist

**Supporting Specs:**
- `database-schema-[feature].md` - Database design
- `types-[feature].md` - TypeScript types
- `backend-api-[feature].md` - API endpoints
- `backend-architecture-[feature].md` - Backend patterns (if needed)
- `frontend-[feature].md` - React components

---

## Standard Execution Order

### Phase 1: Backend Implementation

**Why Backend First:**
- Data model drives everything
- API contract defines frontend requirements
- Backend can be tested independently
- Frontend development is faster with working API

**Steps:**

#### 1. Database Schema
**Reference:** `docs/specs/database-schema-[feature].md`

```bash
# Create Flyway migration files in backend/src/main/resources/db/migration/
# V1__create_users_table.sql, V2__create_tokens_table.sql, etc.

cd backend
./gradlew quarkusDev  # Flyway auto-migrates on startup
```

**Checklist:**
- [ ] Create all tables with proper types
- [ ] Add indexes for query performance
- [ ] Set up foreign key constraints
- [ ] Add CHECK constraints for data integrity
- [ ] Create sample seed data
- [ ] Test rollback migration

#### 2. Domain Entities & DTOs
**Reference:** `docs/specs/types-[feature].md` and `docs/specs/backend-architecture.md`

**Locations:** 
- `backend/src/main/kotlin/com/todo/domain/[Feature].kt` (JPA entities)
- `backend/src/main/kotlin/com/todo/dto/[Feature]Request.kt` (DTOs)
- `frontend/src/types/[feature].ts` (TypeScript types for frontend)

**Checklist:**
- [ ] Define JPA entity classes with proper annotations
- [ ] Create request/response DTOs (Kotlin data classes)
- [ ] Add validation annotations (@NotBlank, @Email, etc.)
- [ ] Define error codes enum
- [ ] Create TypeScript types for frontend (shared contract)

#### 3. Repository Layer (Data Access)
**Reference:** `docs/specs/backend-architecture.md`

**Location:** `backend/src/main/kotlin/com/todo/repository/[Feature]Repository.kt`

**Checklist:**
- [ ] Extend PanacheRepository<Entity>
- [ ] Implement custom query methods
- [ ] Use parameterized queries
- [ ] Add proper error handling

**Example:**
```kotlin
@ApplicationScoped
class UserRepository : PanacheRepository<User> {
    fun findByEmail(email: String): User? {
        return find("LOWER(email) = LOWER(?1)", email).firstResult()
    }
    
    fun findByGoogleId(googleId: String): User? {
        return find("googleId", googleId).firstResult()
    }
}
```

#### 4. Service Layer (Business Logic)
**Reference:** `docs/specs/backend-api-[feature].md`

**Location:** `backend/src/main/kotlin/com/todo/service/[Feature]Service.kt`

**Checklist:**
- [ ] Annotate with @ApplicationScoped
- [ ] Implement business logic
- [ ] Orchestrate multiple repositories
- [ ] Use @Transactional for database operations
- [ ] Throw appropriate exceptions

**Example:**
```kotlin
@ApplicationScoped
class AuthService(
    private val userRepository: UserRepository,
    private val tokenService: TokenService,
    private val passwordEncoder: PasswordEncoder
) {
    @Transactional
    fun register(request: RegisterRequest): AuthResponse {
        // 1. Validate email uniqueness
        // 2. Hash password
        // 3. Create user
        // 4. Generate verification token
        // 5. Send email (async)
    // 6. Return response
  },
};
```

#### 5. REST Resources (Controllers)
**Reference:** `docs/specs/backend-api-[feature].md`

**Location:** `backend/src/main/kotlin/com/todo/resource/[Feature]Resource.kt`

**Checklist:**
- [ ] Define JAX-RS resource class with @Path
- [ ] Implement HTTP methods (@GET, @POST, @PUT, @DELETE)
- [ ] Add validation with @Valid
- [ ] Add authentication with @Authenticated
- [ ] Handle responses properly
- [ ] Add proper HTTP status codes

**Example:**
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
        val result = authService.register(request)
        return Response.status(Response.Status.CREATED).entity(result).build()
    }
    
    @POST
    @Path("/login")
    fun login(@Valid request: LoginRequest): Response {
        val result = authService.login(request)
        return Response.ok(result).build()
    }
    
    @GET
    @Path("/me")
    @Authenticated
    fun getCurrentUser(@Context securityContext: SecurityContext): Response {
        val email = securityContext.userPrincipal.name
        val user = authService.getUserByEmail(email)
        return Response.ok(user).build()
    }
}
```

#### 6. Exception Handling
**Reference:** `docs/specs/backend-architecture.md`

**Location:** `backend/src/main/kotlin/com/todo/exception/`

**Checklist:**
- [ ] Create custom exception classes
- [ ] Implement ExceptionMapper with @Provider
- [ ] Return consistent error responses
- [ ] Log errors appropriately

---

### Phase 2: Backend Testing

**Why Test Before Frontend:**
- Catch bugs early
- Document expected behavior
- Ensure API reliability
- Faster iteration (no UI needed)

**Testing Approach:**

#### 1. Unit Tests (Services, Utilities)
**Tool:** JUnit 5 + Mockito

**Location:** `backend/src/test/kotlin/com/todo/service/`

**Test:**
- [ ] Service methods with valid input
- [ ] Service methods with invalid input
- [ ] Error handling
- [ ] Edge cases

**Example:**
```kotlin
@QuarkusTest
class AuthServiceTest {
    @Inject
    lateinit var authService: AuthService
    
    @Test
    fun `should create user with hashed password`() {
        val result = authService.register(
            RegisterRequest(
                email = "test@example.com",
                fullName = "Test User",
                password = "Password123"
            )
        )
        
        assertEquals("test@example.com", result.user.email)
        assertNotEquals("Password123", result.user.passwordHash)
    }
    
    @Test
    fun `should reject duplicate email`() {
        assertThrows<AppException.Conflict> {
            authService.register(
                RegisterRequest(
                    email = "existing@example.com",
                    fullName = "Test",
                    password = "Password123"
                )
            )
        }
    }
}
```

#### 2. Integration Tests (API Endpoints)
**Tool:** RestAssured + JUnit 5

**Location:** `backend/src/test/kotlin/com/todo/resource/`

**Test:**
- [ ] Each endpoint with valid requests
- [ ] Each endpoint with invalid requests
- [ ] Authentication/authorization
- [ ] Error responses
- [ ] Status codes

**Example:**
```kotlin
@QuarkusTest
class AuthResourceTest {
    @Test
    fun `should register new user`() {
        val request = RegisterRequest(
            email = "new@example.com",
            fullName = "New User",
            password = "Password123"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(request)
        .`when`()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
            .body("user.email", equalTo("new@example.com"))
    }
    
    @Test
    fun `should reject invalid email`() {
        val request = RegisterRequest(
            email = "invalid",
            fullName = "Test",
            password = "Password123"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(request)
        .`when`()
            .post("/api/auth/register")
        .then()
            .statusCode(400)
  });
});
```

#### 3. Manual Testing (API Client)
**Tool:** Postman, Insomnia, or curl

**Test:**
- [ ] Happy paths for each endpoint
- [ ] Error scenarios
- [ ] Edge cases
- [ ] Performance (response times)

#### 4. Run Tests in CI/CD
**Before Merging:**
```bash
npm run test              # Run all tests
npm run test:coverage     # Check coverage (>80%)
npm run lint              # Check code quality
```

---

### Phase 3: Frontend Implementation

**Why Frontend Last:**
- API contract is stable
- Backend is tested and working
- Frontend can focus on UX
- No waiting for backend changes

**Steps:**

#### 1. API Client Setup
**Reference:** `docs/specs/frontend-[feature].md`

**Location:** `src/api/[feature].ts`

**Checklist:**
- [ ] Create API client with interceptors
- [ ] Add JWT token handling
- [ ] Implement all API methods
- [ ] Add error handling

**Example:**
```typescript
export const authApi = {
  register: (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post('/api/auth/register', data);
  },
  login: (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post('/api/auth/login', data);
  },
};
```

#### 2. State Management
**Reference:** `docs/specs/frontend-[feature].md`

**Location:** `src/contexts/[Feature]Context.tsx`

**Checklist:**
- [ ] Create context with state
- [ ] Implement actions
- [ ] Add loading states
- [ ] Handle errors
- [ ] Persist data (localStorage, etc.)

#### 3. Atomic Components
**Reference:** `docs/specs/frontend-[feature].md`

**Location:** `src/components/atoms/`

**Checklist:**
- [ ] Button, Input, Label (reusable)
- [ ] Use Radix UI primitives
- [ ] Add Tailwind styles
- [ ] Make accessible

#### 4. Molecule Components
**Location:** `src/components/molecules/`

**Checklist:**
- [ ] FormField (Label + Input + Error)
- [ ] Card containers
- [ ] Feature-specific molecules

#### 5. Organism Components (Forms, Complex UI)
**Location:** `src/components/organisms/`

**Checklist:**
- [ ] Forms with validation
- [ ] Complex interactive components
- [ ] Connect to API and context

**Example:**
```typescript
export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ ... });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await register(formData);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

#### 6. Pages
**Location:** `src/components/pages/`

**Checklist:**
- [ ] Create page components
- [ ] Add layouts
- [ ] Connect to organisms

#### 7. Routing
**Location:** `src/router/index.tsx`

**Checklist:**
- [ ] Configure routes
- [ ] Add protected routes
- [ ] Handle redirects

#### 8. Testing & Polish
**Checklist:**
- [ ] Manual testing of all flows
- [ ] Accessibility audit (keyboard, screen reader)
- [ ] Responsive design check
- [ ] Error state handling
- [ ] Loading state handling

---

## Implementation Checklist Template

Copy this for each feature:

```markdown
## Feature: [Feature Name]

### Phase 1: Backend
- [ ] Database migration created and applied
- [ ] TypeScript types defined
- [ ] Repository layer implemented
- [ ] Service layer implemented
- [ ] Middleware implemented (if needed)
- [ ] Controllers implemented
- [ ] Routes registered
- [ ] Backend linted and formatted

### Phase 2: Backend Tests
- [ ] Unit tests for services (>80% coverage)
- [ ] Integration tests for API endpoints
- [ ] Manual API testing completed
- [ ] All tests passing in CI

### Phase 3: Frontend
- [ ] API client implemented
- [ ] Context/state management setup
- [ ] Atoms created/reused
- [ ] Molecules created
- [ ] Organisms implemented
- [ ] Pages created
- [ ] Routes configured
- [ ] Frontend linted and formatted

### Phase 4: End-to-End Testing
- [ ] All user scenarios tested manually
- [ ] Accessibility verified
- [ ] Responsive design verified
- [ ] Error handling verified
- [ ] Performance acceptable

### Phase 5: Documentation
- [ ] API documentation updated
- [ ] Component documentation added
- [ ] README updated (if needed)
- [ ] Deployment notes added (if needed)
```

---

## Git Workflow

### Branch Strategy

```bash
# Feature branch from main
git checkout -b feature/[feature-name]

# Backend implementation
git commit -m "feat(backend): implement [feature] database schema"
git commit -m "feat(backend): implement [feature] API endpoints"
git commit -m "test(backend): add [feature] tests"

# Frontend implementation
git commit -m "feat(frontend): implement [feature] UI components"
git commit -m "feat(frontend): connect [feature] to API"

# Push and create PR
git push origin feature/[feature-name]
```

### Commit Message Convention

- `feat(backend):` - Backend features
- `feat(frontend):` - Frontend features
- `test:` - Tests
- `fix:` - Bug fixes
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `style:` - Code formatting
- `chore:` - Build/tooling changes

---

## Quality Gates

### Before Moving to Next Phase

**Backend → Testing:**
- [ ] All files linted and formatted
- [ ] No TypeScript errors
- [ ] Manual API testing completed
- [ ] Code reviewed

**Testing → Frontend:**
- [ ] All backend tests passing
- [ ] Code coverage >80%
- [ ] No critical bugs
- [ ] API contract stable

**Frontend → Deployment:**
- [ ] All frontend tests passing
- [ ] Accessibility audit passed
- [ ] Responsive design verified
- [ ] Performance acceptable

---

## Development Tools

### Backend Development

```bash
# Start backend server
npm run dev:backend

# Run database migrations
npm run migrate:up

# Seed database
npm run seed

# Run backend tests
npm run test:backend

# Run tests in watch mode
npm run test:backend:watch
```

### Frontend Development

```bash
# Start frontend dev server
npm run dev:frontend

# Run frontend tests (if using Vitest)
npm run test:frontend

# Build frontend
npm run build:frontend
```

### Full Stack

```bash
# Start both backend and frontend
npm run dev

# Run all tests
npm run test

# Lint everything
npm run lint

# Format everything
npm run format
```

---

## Feature Development Workflow Example

### Example: Authentication Feature

1. **Read Feature Spec:** `docs/specs/features/authentication.md`
2. **Review Technical Specs:**
   - `database-schema-auth.md`
   - `types-auth.md`
   - `backend-api-auth.md`
   - `backend-architecture.md`
   - `frontend-auth.md`

3. **Backend Implementation (Week 1):**
   - Day 1: Database schema + types
   - Day 2: Repositories + services
   - Day 3: Controllers + routes
   - Day 4: Unit tests
   - Day 5: Integration tests + manual testing

4. **Frontend Implementation (Week 2):**
   - Day 1: API client + context
   - Day 2: Atoms + molecules
   - Day 3: Organisms (forms)
   - Day 4: Pages + routing
   - Day 5: Testing + polish

5. **Review & Deploy:**
   - Code review
   - QA testing
   - Deploy to staging
   - Final verification
   - Deploy to production

---

## Benefits of This Approach

1. **Reduced Rework:** Backend API is stable before frontend starts
2. **Parallel Development:** Backend and frontend can be different people (after Phase 1)
3. **Better Testing:** Backend thoroughly tested independently
4. **Faster Frontend:** No waiting for backend changes
5. **Clear Dependencies:** Each phase builds on previous
6. **Quality Assurance:** Multiple testing phases catch bugs early

---

## Anti-Patterns to Avoid

❌ **Don't:**
- Build frontend before backend API is working
- Skip tests ("we'll add them later")
- Mix backend and frontend in same commits
- Start new features before completing current
- Skip code review

✅ **Do:**
- Complete one phase before starting next
- Write tests as you go
- Keep commits focused and atomic
- Review specs before implementing
- Ask for clarification on unclear requirements

---

## References

- **Feature Specs:** `docs/specs/features/`
- **Technical Specs:** `docs/specs/`
- **Architecture:** `docs/CONTEXT.md`
- **Agent Persona:** `docs/agents/agent-fullstack.md`

