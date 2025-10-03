# Database Migrations

Flyway migrations for the Todo application database schema.

## Migrations

- **V1__create_users_table.sql** - Core users table with email/password + Google OAuth support
- **V2__create_email_verification_tokens.sql** - Email verification tokens (24-hour expiry)
- **V3__create_token_blacklist.sql** - JWT token blacklist for secure logout

## Naming Convention

Flyway migration files follow this pattern:
```
V{version}__{description}.sql
```

Example: `V1__create_users_table.sql`

## How Migrations Work

1. **Automatic Execution**: Flyway runs migrations automatically when Quarkus starts (configured in `application.properties`)
2. **Sequential**: Migrations run in order (V1, V2, V3, etc.)
3. **One-Time**: Each migration runs exactly once
4. **Tracked**: Flyway tracks which migrations have been applied in the `flyway_schema_history` table

## Local Development (Dev Services)

Quarkus Dev Services automatically:
- ✅ Starts a PostgreSQL container in Docker
- ✅ Creates the database
- ✅ Runs all migrations
- ✅ Cleans up when you stop the app

No manual database setup needed!

## Adding New Migrations

1. Create a new file: `V{next_version}__{description}.sql`
2. Write your SQL DDL statements
3. Restart Quarkus - migration runs automatically

Example:
```bash
# Create new migration
touch V4__add_workspaces_table.sql

# Restart Quarkus
./gradlew quarkusDev
```

## Manual PostgreSQL (Alternative)

If you prefer running your own PostgreSQL instead of Dev Services:

1. Install PostgreSQL 14+
2. Create database: `createdb todo_db`
3. Update `application.properties`:
   ```properties
   quarkus.devservices.enabled=false
   quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/todo_db
   ```

## Production

In production, disable Dev Services:
```properties
%prod.quarkus.devservices.enabled=false
%prod.quarkus.datasource.jdbc.url=jdbc:postgresql://prod-host:5432/todo_db
```

## Resources

- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Quarkus Flyway Guide](https://quarkus.io/guides/flyway)
- [Quarkus Dev Services](https://quarkus.io/guides/datasource#dev-services)

