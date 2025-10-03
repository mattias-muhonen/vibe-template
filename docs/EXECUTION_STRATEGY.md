# Execution Strategy

## Overview

This document defines the standard execution strategy for implementing features in this project using **Test-Driven Development (TDD)**. Every feature follows the same pattern: **Tests First → Implementation → Validation**, ensuring reliability through comprehensive test coverage before any code is written.

**Philosophy:** Write tests first. Tests define the contract and expected behavior, making implementation straightforward and reliable. This repository serves as an **LLM + TDD Experiment Lab**.

## TDD Experiment Lab

This repository is specifically designed to experiment with LLM-powered Test-Driven Development:

- **Tests are written FIRST** based on feature specifications
- **Backend and frontend tests** are created before any implementation
- **Implementation follows** to make the tests pass
- **LLMs generate** comprehensive test suites from Gherkin scenarios

### Current Status: Tests Generated ✅

**305+ tests have been generated** from the feature specifications:
- ✅ Backend: 135 tests (Auth, Tasks, Workspaces)
- ✅ Frontend: 170 tests (Components, Hooks, API clients)
- ✅ Vitest fully configured
- ⏳ Implementation: Ready to begin

See `docs/TDD_TESTS_GENERATED.md` for complete details.

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

## Standard Execution Order (TDD Approach)

### Phase 1: Write Tests FIRST

**Why Tests First:**
- Tests define the contract before implementation
- Gherkin scenarios translate directly to test cases
- Clear acceptance criteria from the start
- Forces thinking about edge cases early
- LLMs can generate comprehensive tests from specs
- Implementation becomes straightforward (make tests pass)

**Steps:**

#### 1. Backend Tests (Write BEFORE Backend Implementation)
**Location:** `backend/src/test/kotlin/com/todo/`

**Test Structure:**
```
backend/src/test/kotlin/com/todo/
├── resource/          # API endpoint tests (integration)
│   ├── AuthResourceTest.kt
│   ├── TaskResourceTest.kt
│   └── WorkspaceResourceTest.kt
├── service/           # Business logic tests (unit)
│   ├── AuthServiceTest.kt
│   ├── TaskServiceTest.kt
│   └── WorkspaceServiceTest.kt
└── repository/        # Data access tests
    ├── UserRepositoryTest.kt
    └── TaskRepositoryTest.kt
```

**Test Checklist:**
- [ ] Write API endpoint tests (RestAssured + JUnit)
- [ ] Write service layer tests (JUnit + Mockito)
- [ ] Write repository tests if needed
- [ ] Cover all Gherkin scenarios from feature spec
- [ ] Test happy paths
- [ ] Test error cases
- [ ] Test edge cases
- [ ] Test validation rules
- [ ] Test authorization rules
- [ ] **ALL TESTS SHOULD FAIL** (no implementation yet)

**Example Backend Test:**
```kotlin
@QuarkusTest
class AuthResourceTest {
    @Test
    fun `should register new user with valid email and password`() {
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
            .body("user.email", equalTo("test@example.com"))
            .body("user.isVerified", equalTo(false))
            .body("token", notNullValue())
    }
    
    @Test
    fun `should reject registration with duplicate email`() {
        // Test implementation
    }
    
    @Test
    fun `should reject registration with weak password`() {
        // Test implementation
    }
}
```

#### 2. Frontend Tests (Write BEFORE Frontend Implementation)
**Location:** `frontend/src/__tests__/`

**Test Structure:**
```
frontend/src/__tests__/
├── components/        # Component tests (React Testing Library)
│   ├── auth/
│   │   ├── RegisterForm.test.tsx
│   │   └── LoginForm.test.tsx
│   ├── tasks/
│   │   ├── TaskList.test.tsx
│   │   ├── TaskForm.test.tsx
│   │   └── TaskCard.test.tsx
│   └── workspaces/
│       └── WorkspaceSelector.test.tsx
├── pages/            # Page tests
│   ├── auth/
│   │   ├── signup.test.tsx
│   │   └── login.test.tsx
│   └── dashboard.test.tsx
├── hooks/            # Custom hook tests
│   ├── useAuth.test.ts
│   └── useTasks.test.ts
└── api/              # API client tests
    ├── authApi.test.ts
    └── taskApi.test.ts
```

**Test Checklist:**
- [ ] Write component tests (React Testing Library + Vitest)
- [ ] Write page tests
- [ ] Write hook tests
- [ ] Write API client tests
- [ ] Cover all Gherkin scenarios from feature spec
- [ ] Test user interactions
- [ ] Test form validation
- [ ] Test error states
- [ ] Test loading states
- [ ] Test accessibility
- [ ] **ALL TESTS SHOULD FAIL** (no implementation yet)

**Example Frontend Test:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RegisterForm } from '@/components/auth/RegisterForm';

describe('RegisterForm', () => {
  it('should register user with valid email, name, and password', async () => {
    const mockRegister = vi.fn();
    
    render(<RegisterForm onRegister={mockRegister} />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'SecurePass123!' }
    });
    
    fireEvent.click(screen.getByText('Sign Up'));
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'SecurePass123!'
      });
    });
  });
  
  it('should show error for invalid email format', async () => {
    // Test implementation
  });
  
  it('should show error for weak password', async () => {
    // Test implementation
  });
});
```

#### 3. Verify All Tests Fail
**Before any implementation:**
```bash
# Backend tests should fail
cd backend
./gradlew test  # Should fail - no implementation yet

# Frontend tests should fail
cd frontend
npm test        # Should fail - no implementation yet
```

This confirms tests are valid and will catch missing implementation.

---

### Phase 2: Backend Implementation

**Why Backend First:**
- Data model drives everything
- API contract defines frontend requirements
- Backend can be tested independently
- Frontend development is faster with working API

**Before Starting Implementation:**
1. **Review the test files** for the feature you're implementing
2. Read through all test cases to understand requirements
3. Use tests as your specification - they define exact behavior
4. Note edge cases and error scenarios covered in tests
5. Reference the Gherkin scenarios in the feature spec

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

### Phase 3: Frontend Implementation

**Now that backend is working and tests pass:**
- Frontend implementation becomes straightforward
- API contract is stable and tested
- Frontend tests provide clear acceptance criteria
- Focus on UX and making frontend tests pass

**Before Starting Implementation:**
1. **Review the frontend test files** for the feature you're implementing
2. Read through component, hook, and API client tests
3. Understand expected user interactions from tests
4. Note form validation rules, error states, loading states
5. Check accessibility requirements in tests
6. Reference the Gherkin scenarios and UI specs

**Implementation Goals:**
- Make all frontend tests pass
- Follow the test specifications exactly
- Implement UI/UX based on test requirements

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

#### 8. Verify All Frontend Tests Pass
**Run tests to confirm:**
```bash
cd frontend
npm test        # All tests should pass now
npm run test:coverage  # Check coverage >80%
```

---

### Phase 4: Final Validation & Polish

**Manual Testing:**
- [ ] Test all Gherkin scenarios manually
- [ ] Accessibility audit (keyboard, screen reader)
- [ ] Responsive design check
- [ ] Error state handling
- [ ] Loading state handling
- [ ] Performance check

**Quality Gates:**
- [ ] All backend tests passing
- [ ] All frontend tests passing
- [ ] Backend coverage >80%
- [ ] Frontend coverage >80%
- [ ] No linter errors
- [ ] All Gherkin scenarios work

---

## Implementation Checklist Template (TDD)

Copy this for each feature:

```markdown
## Feature: [Feature Name]

### Phase 1: Write Tests FIRST (TDD)

#### Backend Tests
- [ ] API endpoint tests written (RestAssured)
- [ ] Service layer tests written (JUnit)
- [ ] Repository tests written (if needed)
- [ ] All Gherkin scenarios covered
- [ ] Happy paths tested
- [ ] Error cases tested
- [ ] Edge cases tested
- [ ] Validation rules tested
- [ ] Authorization rules tested
- [ ] **Verified all tests FAIL** (no implementation)

#### Frontend Tests
- [ ] Component tests written (React Testing Library)
- [ ] Page tests written
- [ ] Hook tests written
- [ ] API client tests written
- [ ] All Gherkin scenarios covered
- [ ] User interactions tested
- [ ] Form validation tested
- [ ] Error states tested
- [ ] Loading states tested
- [ ] Accessibility tested
- [ ] **Verified all tests FAIL** (no implementation)

### Phase 2: Backend Implementation
- [ ] **Reviewed backend test files** (AuthServiceTest.kt, etc.)
- [ ] Read through all test cases to understand requirements
- [ ] Database migration created and applied
- [ ] Domain entities defined
- [ ] DTOs defined
- [ ] Repository layer implemented
- [ ] Service layer implemented
- [ ] REST resources implemented
- [ ] Exception handling implemented
- [ ] **All backend tests PASS**
- [ ] Backend linted and formatted

### Phase 3: Frontend Implementation
- [ ] **Reviewed frontend test files** (components, hooks, API tests)
- [ ] Read through test cases to understand user interactions
- [ ] API client implemented
- [ ] Context/state management setup
- [ ] Atoms created/reused
- [ ] Molecules created
- [ ] Organisms implemented
- [ ] Pages created
- [ ] Routes configured
- [ ] **All frontend tests PASS**
- [ ] Frontend linted and formatted

### Phase 4: Final Validation
- [ ] All Gherkin scenarios tested manually
- [ ] Accessibility verified
- [ ] Responsive design verified
- [ ] Error handling verified
- [ ] Performance acceptable
- [ ] Code coverage >80% (backend + frontend)

### Phase 5: Documentation
- [ ] API documentation updated
- [ ] Component documentation added
- [ ] Test documentation added
- [ ] README updated (if needed)
```

---

## Git Workflow

### Branch Strategy (TDD)

```bash
# Feature branch from main
git checkout -b feature/[feature-name]

# PHASE 1: Write tests first
git commit -m "test(backend): add [feature] tests (TDD)"
git commit -m "test(frontend): add [feature] tests (TDD)"

# PHASE 2: Backend implementation (make tests pass)
git commit -m "feat(backend): implement [feature] database schema"
git commit -m "feat(backend): implement [feature] API endpoints"
git commit -m "feat(backend): make all backend tests pass"

# PHASE 3: Frontend implementation (make tests pass)
git commit -m "feat(frontend): implement [feature] UI components"
git commit -m "feat(frontend): connect [feature] to API"
git commit -m "feat(frontend): make all frontend tests pass"

# Push and create PR
git push origin feature/[feature-name]
```

### Commit Message Convention (TDD)

- `test(backend):` - Backend tests (write first!)
- `test(frontend):` - Frontend tests (write first!)
- `feat(backend):` - Backend implementation
- `feat(frontend):` - Frontend implementation
- `fix:` - Bug fixes
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `style:` - Code formatting
- `chore:` - Build/tooling changes

---

## Quality Gates

### Before Moving to Next Phase (TDD)

**Phase 1 (Tests) → Phase 2 (Backend):**
- [ ] All backend tests written
- [ ] All frontend tests written
- [ ] Tests cover all Gherkin scenarios
- [ ] Tests verified to FAIL (no implementation)
- [ ] Tests reviewed for completeness

**Phase 2 (Backend) → Phase 3 (Frontend):**
- [ ] All backend tests passing
- [ ] Backend linted and formatted
- [ ] Code coverage >80%
- [ ] No critical bugs
- [ ] API contract stable

**Phase 3 (Frontend) → Phase 4 (Validation):**
- [ ] All frontend tests passing
- [ ] Frontend linted and formatted
- [ ] Code coverage >80%
- [ ] No critical bugs
- [ ] All components working

**Phase 4 (Validation) → Deployment:**
- [ ] All manual tests passed
- [ ] Accessibility audit passed
- [ ] Responsive design verified
- [ ] Performance acceptable
- [ ] All Gherkin scenarios work

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

## Feature Development Workflow Example (TDD)

### Example: Authentication Feature

1. **Read Feature Spec:** `docs/specs/features/authentication.md`
2. **Review Technical Specs:**
   - `database-schema-auth.md`
   - `types-auth.md`
   - `backend-api-auth.md`
   - `backend-architecture.md`
   - `frontend-auth.md`

3. **Phase 1: Write All Tests FIRST (Days 1-2):**
   - Day 1: Write backend tests
     - AuthResourceTest.kt (API endpoints)
     - AuthServiceTest.kt (business logic)
     - UserRepositoryTest.kt (data access)
     - Cover all Gherkin scenarios
     - **Verify all tests FAIL**
   - Day 2: Write frontend tests
     - RegisterForm.test.tsx
     - LoginForm.test.tsx
     - useAuth.test.ts (hook)
     - authApi.test.ts (API client)
     - Cover all Gherkin scenarios
     - **Verify all tests FAIL**

4. **Phase 2: Backend Implementation (Days 3-5):**
   - Day 3: Database + entities + DTOs
   - Day 4: Repositories + services
   - Day 5: REST resources + make all tests pass

5. **Phase 3: Frontend Implementation (Days 6-8):**
   - Day 6: API client + context
   - Day 7: Components (RegisterForm, LoginForm)
   - Day 8: Pages + routing + make all tests pass

6. **Phase 4: Validation (Day 9):**
   - Manual testing of all Gherkin scenarios
   - Accessibility audit
   - Performance check
   - Polish & bug fixes

7. **Review & Deploy (Day 10):**
   - Code review
   - QA testing
   - Deploy to staging
   - Final verification
   - Deploy to production

---

## Benefits of TDD Approach

1. **Clear Requirements:** Tests define exact behavior before coding
2. **Better Design:** Writing tests first forces good API design
3. **Fewer Bugs:** Tests catch issues before implementation
4. **Confidence:** Green tests = working feature
5. **Documentation:** Tests serve as executable documentation
6. **Refactoring Safety:** Tests ensure behavior doesn't break
7. **LLM-Friendly:** Gherkin → Tests is perfect for LLM generation
8. **Faster Development:** Clear goals, less debugging

---

## Anti-Patterns to Avoid (TDD)

❌ **Don't:**
- Write implementation before tests
- Skip tests ("we'll add them later")
- Write tests after implementation
- Write tests that pass immediately (no value)
- Skip the "verify tests fail" step
- Mix test writing and implementation in same commits

✅ **Do:**
- Write tests FIRST, always
- Verify tests fail before implementing
- Make tests pass with minimal implementation
- Keep test commits separate from implementation commits
- Review Gherkin scenarios before writing tests
- Use tests as your specification

---

## References

- **Feature Specs:** `docs/specs/features/`
- **Technical Specs:** `docs/specs/`
- **Architecture:** `docs/CONTEXT.md`
- **Agent Persona:** `docs/agents/agent-fullstack.md`

