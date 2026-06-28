# ADR 0001: Layered Backend Architecture

## Status

Accepted

## Context

The SRM Credit Engine backend needs to support multiple business capabilities such as currency management, receivable pricing and settlement processing.

The project also needs to be easy to maintain, test and extend as new engines and business rules are added.

A simple flat NestJS structure would work for a small API, but it would make the code harder to scale as the challenge grows.

## Decision

The backend will use a layered architecture organized into the following folders:

```txt
src
├── application
├── domain
├── infrastructure
├── presentation
└── shared
```

### Application

Contains business use cases and application services.

Examples:

```txt
src/application/currencies
src/application/pricing
src/application/settlements
```

### Domain

Reserved for domain entities, domain rules and core business concepts.

### Infrastructure

Contains technical implementation details such as database access and Prisma configuration.

Examples:

```txt
src/infrastructure/database/prisma.service.ts
src/infrastructure/database/prisma.module.ts
```

### Presentation

Contains HTTP controllers, DTOs and NestJS modules exposed through the API.

Examples:

```txt
src/presentation/http/currencies
src/presentation/http/pricing
src/presentation/http/settlements
```

### Shared

Contains cross-cutting concerns such as filters, interceptors and configuration.

## Consequences

### Positive

- Better separation of responsibilities
- Controllers stay thin
- Business logic is isolated in application services
- Infrastructure concerns are not mixed with HTTP logic
- Easier to add new engines such as Pricing and Settlement
- Easier to explain architecture during technical review

### Negative

- More folders and files than a simple NestJS starter project
- Requires discipline to avoid circular dependencies
- Requires clear import organization

## Alternatives considered

### Flat NestJS structure

Rejected because it is less suitable for a senior-level technical challenge with multiple business engines.

### Full Clean Architecture with strict domain boundaries

Not fully adopted at this stage because the challenge needs pragmatic delivery speed. The current structure keeps the project organized while avoiding unnecessary complexity.

## Final notes

The selected layered architecture provides a balance between maintainability, clarity and implementation speed.
