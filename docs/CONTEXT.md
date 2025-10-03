# Context and guidelines

## 🧪 TDD Experiment Lab

This repository is an **LLM + Test-Driven Development Experiment Lab**.

**Core Principle: Write Tests FIRST!**
- Tests are written before any implementation
- Backend tests + Frontend tests written together
- Verify all tests FAIL before implementing
- Implementation goal: make tests pass
- Follow execution strategy in docs/EXECUTION_STRATEGY.md (Tests First → Backend → Frontend)

## General Guidelines
- Ignore docs/HUMAN_INSTRUCTION.md
- Always read and pretend you are docs/agents/agent-fullstack.md
- Always use radix-ui components in atomic design components
- Always favor atomic design components instead of writing new ones
- Follow TDD execution strategy defined in docs/EXECUTION_STRATEGY.md

## Tech Stack

### Frontend
- **Next.js 14+** - React framework with SSR/SSG
- **TypeScript 5.8** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible component primitives
- **React Query** - Server state management
- **Zod** - Runtime validation and type inference

### Backend
- **Kotlin 1.9+** - Modern JVM language
- **Quarkus 3.x** - Supersonic Subatomic Java framework
- **PostgreSQL 14+** - Relational database
- **Hibernate ORM with Panache** - Database ORM
- **JWT (SmallRye JWT)** - JWT authentication
- **BCrypt** - Password hashing
- **RESTEasy Reactive** - Reactive REST endpoints
- **Jackson** - JSON serialization

## File listing

```
├── docs/
│   ├── agents/
│   │   ├── agent-fullstack.md
│   │   ├── agent-product-designer.md
│   │   ├── agent-visual-designer.md
│   │   └── cleanup-prompt.md
│   ├── specs/
│   │   ├── features/
│   │   │   └── authentication.md      # Feature overview with Gherkin scenarios
│   │   ├── frontend-auth.md           # React components & state management
│   │   ├── backend-api-auth.md        # Backend API endpoints
│   │   ├── backend-architecture.md    # Backend structure & patterns
│   │   ├── database-schema-auth.md    # PostgreSQL schema
│   │   └── types-auth.md              # TypeScript types & validation
│   ├── CONTEXT.md                     # This file
│   ├── EXECUTION_STRATEGY.md          # How to implement features (Backend → Tests → Frontend)
│   └── HUMAN_INSTRUCTION.md
├── backend/                # Backend (Kotlin + Quarkus)
│   ├── src/main/
│   │   ├── kotlin/
│   │   │   └── com/todo/
│   │   │       ├── config/      # Configuration classes
│   │   │       ├── domain/      # Domain models (entities)
│   │   │       ├── repository/  # Database repositories
│   │   │       ├── service/     # Business logic
│   │   │       ├── resource/    # REST resources (controllers)
│   │   │       ├── dto/         # Data Transfer Objects
│   │   │       ├── security/    # Auth & security
│   │   │       └── util/        # Utilities
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/    # Flyway migrations
│   ├── src/test/kotlin/         # Tests
│   ├── build.gradle.kts         # Gradle build config
│   └── README.md
├── frontend/               # Frontend (Next.js)
│   ├── src/
│   │   ├── app/            # Next.js 14 app directory
│   │   │   ├── (auth)/     # Auth routes
│   │   │   ├── (dashboard)/ # Dashboard routes
│   │   │   ├── api/        # API routes (optional)
│   │   │   ├── layout.tsx  # Root layout
│   │   │   └── page.tsx    # Home page
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Reusable UI components
│   │   │   └── features/   # Feature-specific components
│   │   ├── lib/            # Utilities & helpers
│   │   │   ├── api.ts      # API client
│   │   │   └── utils.ts    # Utility functions
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── package.json
│   └── README.md
├── shared/                 # Shared types/utilities (optional)
│   └── types/              # Shared TypeScript types
└── docs/                   # Documentation (unchanged)
├── .gitignore
├── CLAUDE.md
├── README.md
└── TODO_PRD.md
```