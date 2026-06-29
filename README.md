# SRM Credit Engine

A senior-level technical challenge for a multi-currency credit assignment platform.

The SRM Credit Engine is responsible for registering receivables, simulating present value and discount amount, managing currencies and exchange rates, and confirming settlements using ACID transactions.

## Monorepo Overview

This repository is organized as a monorepo.

```txt
srm-credit-engine
├── apps
│   ├── backend
│   └── frontend
├── packages
│   └── shared
├── docs
│   ├── adr
│   ├── api
│   ├── architecture
│   ├── c4
│   ├── database
│   └── DELIVERY.md
├── .github
│   └── workflows
├── docker-compose.yml
├── AI_USAGE.md
└── README.md
```

![Monorepo Overview](docs/c4/monorepo-overview.png)

## Backend Stack

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Decimal.js
- Swagger/OpenAPI
- Docker Compose
- GitHub Actions

## Main Capabilities

### Currency Engine

Responsible for supported currencies and exchange rates.

Endpoints:

```txt
GET  /api/v1/currencies
GET  /api/v1/currencies/rates/latest
POST /api/v1/currencies/rates
```

### Receivables Engine

Responsible for registering, retrieving and listing receivables.

Endpoints:

```txt
POST /api/v1/receivables
GET  /api/v1/receivables
GET  /api/v1/receivables/:id
```

The list endpoint supports pagination and filters:

```txt
page
limit
status
currencyCode
receivableTypeCode
cedentId
dueDateFrom
dueDateTo
```

Example:

```txt
GET /api/v1/receivables?page=1&limit=10&status=REGISTERED&currencyCode=BRL
```

Paginated response format:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

### Pricing Engine

Responsible for simulating receivable pricing.

Endpoint:

```txt
POST /api/v1/pricing/simulate
```

The Pricing Engine uses the Strategy Pattern.

Current strategies:

```txt
DUPLICATA_MERCANTIL -> 1.5% monthly spread
CHEQUE_PRE_DATADO   -> 2.5% monthly spread
```

Formula:

```txt
Present Value = Face Value / (1 + Base Rate + Spread) ^ Term
```

Financial calculations are performed with Decimal.js.

### Settlement Engine

Responsible for confirming settlement of a receivable.

Endpoints:

```txt
POST /api/v1/settlements
GET  /api/v1/settlements/:id/report
```

The Settlement Engine uses a Prisma transaction to guarantee ACID consistency.

The transaction includes:

```txt
1. Fetch receivable
2. Validate receivable status
3. Fetch payment currency
4. Run pricing simulation
5. Update receivable status to SETTLED
6. Create Settlement
7. Create SettlementItem
8. Create AuditLog
```

## Architecture

The backend follows a layered architecture.

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
src/application/receivables
src/application/pricing
src/application/settlements
```

### Infrastructure

Contains technical integrations such as Prisma database access.

Examples:

```txt
src/infrastructure/database/prisma.module.ts
src/infrastructure/database/prisma.service.ts
```

### Presentation

Contains HTTP controllers, DTOs and modules.

Examples:

```txt
src/presentation/http/currencies
src/presentation/http/receivables
src/presentation/http/pricing
src/presentation/http/settlements
```

### Shared

Contains cross-cutting concerns such as filters, interceptors, configuration and observability.

Examples:

```txt
src/shared/observability
src/shared/config
src/shared/filters
src/shared/interceptors
```

## Observability

The backend includes observability support using NestJS native Logger and request correlation.

Implemented features:

- Correlation ID middleware
- `x-correlation-id` request/response header
- Structured JSON logs for successful requests
- Structured JSON logs for failed requests
- Request duration logging
- HTTP method, path and status code logging
- Global Exception Filter
- Standardized error responses

Example successful request log:

```json
{
  "event": "http_request_completed",
  "correlationId": "srm-test-123",
  "method": "GET",
  "path": "/api/v1/health",
  "statusCode": 200,
  "durationMs": 5
}
```

Example standardized error response:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["validation message"],
  "path": "/api/v1/receivables",
  "method": "POST",
  "correlationId": "srm-test-123",
  "timestamp": "2026-06-29T00:00:00.000Z"
}
```

## CI/CD

GitHub Actions validates the backend automatically.

The backend workflow runs:

```txt
npm ci
npx prisma generate
npm run test
npm run build
```

Workflow file:

```txt
.github/workflows/backend-ci.yml
```

## Local Environment

### Requirements

- Node.js 20+
- npm
- Docker
- Docker Compose

### Start local infrastructure

From the repository root:

```bash
docker compose up -d
```

Services:

```txt
PostgreSQL -> localhost:5433
pgAdmin    -> localhost:5050
```

### Install backend dependencies

```bash
cd apps/backend
npm install
```

### Configure environment

Create or update:

```txt
apps/backend/.env
```

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/srm_credit_engine?schema=public"
```

### Run Prisma migrations

For local development:

```bash
npx prisma migrate dev
```

For delivery or CI-like validation:

```bash
npx prisma migrate deploy
```

### Run seed

```bash
npx prisma db seed
```

The seed creates:

```txt
BRL
USD
USD/BRL exchange rate
Duplicata Mercantil
Cheque Pré-datado
Demo cedent
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Start backend

```bash
npm run start:dev
```

Backend URL:

```txt
http://localhost:3000
```

Swagger URL:

```txt
http://localhost:3000/docs
```

Health check:

```txt
GET /api/v1/health
```

## Running Tests

From `apps/backend`:

### Unit tests

```bash
npm run test
```

Covered services:

```txt
PricingService
ReceivablesService
SettlementsService
```

### E2E tests

```bash
npm run test:e2e
```

Covered E2E flows:

```txt
Health check
Complete financial flow
Standardized error handling
```

The complete financial flow validates:

```txt
GET  /api/v1/health
GET  /api/v1/currencies
POST /api/v1/receivables
POST /api/v1/pricing/simulate
POST /api/v1/settlements
GET  /api/v1/settlements/:id/report
```

### Build

```bash
npm run build
```

## Example Business Flow

### 1. Create a receivable

```txt
POST /api/v1/receivables
```

Example payload:

```json
{
  "cedentId": "uuid",
  "receivableTypeCode": "DUPLICATA_MERCANTIL",
  "currencyCode": "BRL",
  "faceValue": "25000.00",
  "dueDate": "2026-08-30"
}
```

### 2. Simulate pricing

```txt
POST /api/v1/pricing/simulate
```

Example payload:

```json
{
  "faceValue": "25000.00",
  "currencyCode": "BRL",
  "receivableType": "DUPLICATA_MERCANTIL",
  "baseRateMonthly": "1.00",
  "simulationDate": "2026-06-28",
  "dueDate": "2026-08-30"
}
```

### 3. Create settlement

```txt
POST /api/v1/settlements
```

Example payload:

```json
{
  "receivableId": "uuid",
  "paymentCurrencyCode": "BRL",
  "baseRateMonthly": "1.00",
  "settlementDate": "2026-06-28",
  "userId": "system"
}
```

### 4. Get settlement report

```txt
GET /api/v1/settlements/:id/report
```

## API Documentation

Swagger/OpenAPI is available at:

```txt
http://localhost:3000/docs
```

The Swagger documentation includes:

- Endpoint descriptions
- Query parameters
- Request DTOs
- Success response examples
- Error response examples
- Main financial flow endpoints

## API Collection

A Postman collection is available at:

```txt
docs/api/srm-credit-engine.postman_collection.json
```

The collection includes requests for:

```txt
Health
Currencies
Exchange rates
Receivables
Pricing simulation
Settlements
Settlement report
Error scenarios
```

## Delivery Guide

The technical delivery guide is available at:

```txt
docs/DELIVERY.md
```

It contains:

```txt
Project overview
Local setup
Business flow
Architecture explanation
Testing instructions
CI/CD details
Technical decisions
Known limitations
Suggested next steps
```

## Additional Documentation

Additional documentation:

```txt
AI_USAGE.md
docs/DELIVERY.md
docs/api/srm-credit-engine.postman_collection.json
docs/architecture/backend-overview.md
docs/architecture/settlement-flow.md
docs/adr/0001-layered-architecture.md
docs/adr/0002-decimal-for-financial-calculations.md
docs/adr/0003-prisma-transaction-for-settlement.md
```

## Architecture Decisions

The project includes ADRs for important technical decisions:

```txt
ADR 0001 -> Layered Backend Architecture
ADR 0002 -> Decimal.js for Financial Calculations
ADR 0003 -> Prisma Transaction for Settlement Engine
```

## AI Usage

AI assistance was used as a development support tool for architecture planning, debugging, documentation and implementation guidance.

All generated suggestions were manually reviewed, tested and validated before being committed.

See:

```txt
AI_USAGE.md
```

## Git Workflow

This project uses feature branches, Pull Requests and Conventional Commits.

Examples:

```txt
chore: initial repository setup
docs: add initial monorepo architecture
feat: setup nestjs backend application
refactor: organize backend layers
feat: add postgres database schema and seed data
feat: implement currency engine
feat: implement pricing engine strategy
chore: add local docker compose infrastructure
feat: implement settlement engine
docs: add project architecture documentation
ci: add backend validation workflow
feat: add backend observability
feat: implement receivables engine
test: add receivables and settlements unit tests
test: add health check e2e test
test: add financial flow e2e tests
feat: add global exception filter
test: add error handling e2e tests
feat: add receivables pagination and filters
docs: finalize backend delivery documentation
```

## Current Status

Implemented:

- Backend API
- PostgreSQL schema
- Prisma migrations and seed
- Currency Engine
- Receivables Engine
- Pricing Engine
- Settlement Engine
- Settlement report
- AuditLog
- Swagger documentation with examples
- Docker Compose infrastructure
- Correlation ID middleware
- Structured request logging
- Global Exception Filter
- Standardized error responses
- Receivables pagination and filters
- Unit tests
- E2E tests
- GitHub Actions CI
- ADRs
- Delivery guide
- Postman collection
- AI usage documentation

```md
Pending:

- Frontend application
- Backend Dockerfile
- Production deployment
```
