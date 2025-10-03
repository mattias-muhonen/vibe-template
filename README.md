# Multi-User Todo Application

A collaborative, web-based Todo application built with modern technologies.

## 🧪 TDD Experiment Lab

This repository serves as an **LLM + Test-Driven Development (TDD) Experiment Lab**. The core principle: **Write tests FIRST, then implement**.

**Key Philosophy:**
- 📝 Tests are written before any implementation
- 🎯 Gherkin scenarios → Test suites → Implementation
- ✅ All tests must fail initially (no implementation)
- 🚀 Implementation goal: make tests pass
- 🤖 LLMs generate comprehensive test suites from specifications

## Tech Stack

### Backend
- **Kotlin 1.9+** + **Quarkus 3.x** - Modern JVM framework
- **PostgreSQL 14+** - Relational database
- **Hibernate ORM with Panache** - Database ORM
- **SmallRye JWT** - JWT authentication
- **Google OAuth 2.0** - Social authentication

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript 5.8** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS
- **Radix UI** - Accessible component primitives

## Project Structure

```
├── backend/              # Kotlin + Quarkus backend
│   ├── src/main/kotlin/  # Application code
│   ├── src/main/resources/ # Config & migrations
│   └── build.gradle.kts  # Build configuration
├── frontend/             # Next.js frontend
│   ├── src/app/          # Next.js App Router pages
│   ├── src/components/   # React components
│   └── package.json      # Dependencies
├── docs/                 # Documentation
│   ├── specs/            # Technical specifications
│   ├── CONTEXT.md        # Project context & guidelines
│   └── EXECUTION_STRATEGY.md # Development workflow
└── TODO_PRD.md           # Product Requirements Document
```

## Quick Start

### Backend (Quarkus)

```bash
cd backend
./gradlew quarkusDev
```

Backend runs at: `http://localhost:8080`  
Dev UI: `http://localhost:8080/q/dev`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

### Verify Setup

1. Start the backend first
2. Start the frontend
3. Open `http://localhost:3000` in your browser
4. You should see "Hello World from Quarkus + Kotlin!" message

## Documentation

- **[CONTEXT.md](docs/CONTEXT.md)** - Tech stack, guidelines, and file structure
- **[EXECUTION_STRATEGY.md](docs/EXECUTION_STRATEGY.md)** - Development workflow (Backend → Tests → Frontend)
- **[TODO_PRD.md](TODO_PRD.md)** - Product vision and roadmap
- **[Backend Architecture](docs/specs/backend-architecture.md)** - Quarkus backend patterns
- **[Frontend Architecture](docs/specs/frontend-auth.md)** - Next.js frontend patterns
- **[Database Schema](docs/specs/database-schema-auth.md)** - PostgreSQL schema design

## Development Workflow (TDD)

We follow a **Tests First → Backend → Frontend** approach using Test-Driven Development:

### Phase 1: Write Tests FIRST ⚠️
1. Write backend tests (API, services, repositories)
2. Write frontend tests (components, pages, hooks)
3. **Verify all tests FAIL** (no implementation yet)

### Phase 2: Backend Implementation
4. Database schema (Flyway migrations)
5. Domain entities + DTOs
6. Repositories + Services
7. REST Resources
8. **Make all backend tests PASS** ✅

### Phase 3: Frontend Implementation
9. API client + hooks
10. UI components
11. Pages and routing
12. **Make all frontend tests PASS** ✅

### Phase 4: Validation
13. Manual testing of all scenarios
14. Accessibility + performance audit

See `docs/EXECUTION_STRATEGY.md` for detailed TDD workflow.

## Features

### ✅ Planned (Specs Complete)
- **Authentication** - Email/password + Google OAuth (specs in `docs/specs/`)

### 📋 Upcoming (Specs Needed)
- Task Management - CRUD operations
- Workspace Management - Multi-user collaboration
- Real-Time Updates - WebSocket sync
- Notifications - In-app + email
- Filtering & Sorting - Advanced task views

## Prerequisites

- **Backend:**
  - JDK 17 or later
  - Gradle 8.x
  - PostgreSQL 14+ (when implementing database features)

- **Frontend:**
  - Node.js 20+
  - npm or yarn

## Environment Variables

### Backend (`backend/src/main/resources/application.properties`)
```properties
quarkus.http.port=8080
# Add database config when implementing features
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## Current Status

**Phase:** TDD Experiment Lab - Tests Generated ✅  
**Status:** 305+ tests created, ready for implementation

### Working
- ✅ Backend stub (Quarkus + Kotlin)
- ✅ Frontend stub (Next.js + TypeScript)
- ✅ Backend → Frontend communication
- ✅ Complete technical specifications
- ✅ Complete feature specifications (Gherkin scenarios)
- ✅ TDD workflow documented
- ✅ **305+ tests generated** (135 backend, 170 frontend)
- ✅ **Vitest configured** and ready

### Tests Generated
- ✅ Backend: AuthResourceTest, AuthServiceTest, TaskResourceTest, WorkspaceResourceTest
- ✅ Frontend: Auth components, Task components, Workspace components, Filters, Notifications
- ✅ All tests currently FAIL (no implementation) - Perfect for TDD!

See `README_TESTS.md` and `docs/TDD_TESTS_GENERATED.md` for details.

### Next Steps (TDD Approach)
1. **Run tests to verify they fail** ✅
   ```bash
   cd backend && ./gradlew test
   cd frontend && npm test
   ```
2. **Start implementing features:**
   - Implement authentication backend/frontend
   - Watch tests turn green ✅
3. **Continue with other features:**
   - Task Management
   - Workspace Management
   - Real-Time Collaboration
   - Notifications
   - Filtering & Sorting

## Contributing

See `docs/agents/` for AI agent guidelines and development patterns.

## License

Private project.

---

**Last Updated:** Oct 2025  
**Version:** 1.0.0 (Initial Setup)
