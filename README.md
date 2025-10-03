# Multi-User Todo Application

A collaborative, web-based Todo application built with modern technologies.

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

## Development Workflow

We follow a **Backend → Tests → Frontend** approach for feature development:

### Phase 1: Backend Implementation
1. Database schema (Flyway migrations)
2. Domain entities (JPA/Hibernate)
3. Repositories (Panache)
4. Services (Business logic)
5. REST Resources (Controllers)

### Phase 2: Backend Testing
6. Unit tests (services)
7. Integration tests (REST endpoints)

### Phase 3: Frontend Implementation
8. UI components
9. API client
10. Pages and routing

See `docs/EXECUTION_STRATEGY.md` for detailed workflow.

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

**Phase:** Initial Setup  
**Status:** Minimal working stub with "Hello World" API call

### Working
- ✅ Backend stub (Quarkus + Kotlin)
- ✅ Frontend stub (Next.js + TypeScript)
- ✅ Backend → Frontend communication
- ✅ Complete technical specifications

### Next Steps
1. Implement authentication backend (following `docs/specs/backend-architecture.md`)
2. Write backend tests
3. Implement authentication frontend (following `docs/specs/frontend-auth.md`)
4. Move on to next features (Task Management, Workspaces, etc.)

## Contributing

See `docs/agents/` for AI agent guidelines and development patterns.

## License

Private project.

---

**Last Updated:** Oct 2025  
**Version:** 1.0.0 (Initial Setup)
