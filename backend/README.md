# Backend (Kotlin + Quarkus)

## Overview

This is the backend application built with Kotlin and Quarkus. It provides RESTful APIs for the Multi-User Todo Application.

## Tech Stack

- **Kotlin 1.9+** - Modern JVM language
- **Quarkus 3.x** - Supersonic Subatomic Java framework
- **PostgreSQL 14+** - Relational database
- **Hibernate ORM with Panache** - Database ORM
- **SmallRye JWT** - JWT authentication
- **Flyway** - Database migrations

## Project Structure

```
backend/
├── src/main/
│   ├── kotlin/com/todo/    # Application code
│   └── resources/          # Configuration & migrations
├── src/test/kotlin/        # Tests
├── build.gradle.kts        # Build configuration
└── README.md              # This file
```

## Getting Started

### Prerequisites

- JDK 17 or later
- Gradle 8.x
- PostgreSQL 14+

### Running in Dev Mode

```bash
./gradlew quarkusDev
```

The application will start at `http://localhost:8080`

Dev UI available at: `http://localhost:8080/q/dev`

### Building

```bash
./gradlew build
```

### Running Tests

```bash
./gradlew test
```

## API Documentation

OpenAPI documentation available at: `http://localhost:8080/q/openapi`

## Environment Variables

See `src/main/resources/application.properties` for configuration options.

## Next Steps

Follow the execution strategy in `docs/EXECUTION_STRATEGY.md` to implement features:

1. Database schema (Flyway migrations)
2. Domain entities
3. Repositories
4. Services
5. REST resources
6. Tests

