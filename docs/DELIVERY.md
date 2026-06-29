# SRM Credit Engine — Delivery Guide

## 1. Overview

**SRM Credit Engine** is a multicurrency credit assignment platform designed to simulate, register, price and settle receivables.

The project was built as a senior-level technical challenge focused on:

- Clean backend architecture
- Financial calculation precision
- Multicurrency support
- Receivable pricing
- Settlement flow with ACID transaction
- Auditability
- Observability
- API documentation
- Automated tests
- CI/CD validation

The backend is implemented with **NestJS**, **TypeScript**, **PostgreSQL**, **Prisma** and **Decimal.js**.

---

## 2. Tech Stack

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Decimal.js
- Swagger/OpenAPI
- Jest
- Supertest

### Infrastructure

- Docker Compose
- PostgreSQL
- pgAdmin

### DevOps

- GitHub Actions
- Automated test/build workflow

### Observability

- Correlation ID middleware
- Structured request logs
- Global exception filter
- Standardized error response format

---

## 3. Monorepo Structure

```txt
srm-credit-engine/
├── apps/
│   ├── backend/
│   └── frontend/
├── packages/
│   └── shared/
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── c4/
│   ├── database/
│   └── DELIVERY.md
├── .github/
│   └── workflows/
└── README.md
```

---

## 4. Backend Architecture

The backend is organized in layers:

```txt
src/
├── application/
├── domain/
├── infrastructure/
├── presentation/
└── shared/
```

### Layer responsibilities

- **presentation**: HTTP controllers, DTOs and API contract.
- **application**: business use cases and orchestration.
- **domain**: domain-oriented concepts and business modeling.
- **infrastructure**: database access, Prisma integration and external infrastructure concerns.
- **shared**: cross-cutting concerns such as observability, filters and middlewares.

---

## 5. Main Business Flow

The core financial flow is:

```txt
Create receivable
→ Simulate pricing
→ Create settlement
→ Generate settlement report
```

### Flow description

1. A receivable is registered with `REGISTERED` status.
2. The Pricing Engine calculates present value, discount amount and effective monthly rate.
3. The Settlement Engine settles the receivable inside a Prisma ACID transaction.
4. The receivable status is updated to `SETTLED`.
5. A settlement item is created.
6. An audit log is created.
7. A settlement report can be retrieved.

---

## 6. Implemented Engines

### Currency Engine

Responsible for supported currencies and exchange rates.

Endpoints:

```txt
GET  /api/v1/currencies
GET  /api/v1/currencies/rates/latest
POST /api/v1/currencies/rates
```

---

### Pricing Engine

Responsible for financial pricing simulation.

Endpoint:

```txt
POST /api/v1/pricing/simulate
```

Implemented with Strategy Pattern:

- `DuplicataMercantilStrategy`
- `ChequePreDatadoStrategy`

Financial calculations use `Decimal.js` to avoid floating-point precision problems.

---

### Receivables Engine

Responsible for registering and listing receivables.

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

---

### Settlement Engine

Responsible for settling receivables.

Endpoints:

```txt
POST /api/v1/settlements
GET  /api/v1/settlements/:id/report
```

Settlement includes:

- Receivable status validation
- Pricing Engine integration
- Prisma ACID transaction
- Settlement creation
- Settlement item creation
- Receivable status update
- Audit log creation
- Settlement report generation

---

## 7. Database Model

Main entities:

```txt
Cedent
Currency
ExchangeRate
ReceivableType
Receivable
Settlement
SettlementItem
AuditLog
```

Main statuses:

```txt
ReceivableStatus:
- REGISTERED
- PRICED
- SETTLED
- CANCELLED

SettlementStatus:
- CONFIRMED
- REVERSED
- FAILED
```

The schema includes indexes for key query fields such as:

```txt
cedentId
currencyId
dueDate
status
settlementDate
paymentCurrencyId
entityId
createdAt
```

---

## 8. Local Setup

### 8.1 Start infrastructure

From the project root:

```bash
docker compose up -d
```

This starts:

```txt
PostgreSQL: localhost:5433
pgAdmin:    localhost:5050
```

---

### 8.2 Install backend dependencies

```bash
cd apps/backend
npm install
```

---

### 8.3 Run Prisma migrations

```bash
npx prisma migrate deploy
```

For development usage:

```bash
npx prisma migrate dev
```

---

### 8.4 Run seed

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

---

### 8.5 Start backend

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
GET http://localhost:3000/api/v1/health
```

---

## 9. API Documentation

Swagger/OpenAPI is available at:

```txt
http://localhost:3000/docs
```

The documentation includes:

- Endpoint descriptions
- Request DTOs
- Query parameters
- Success response examples
- Error response examples
- Main financial flow endpoints

---

## 10. Observability

The backend includes request-level observability.

### Correlation ID

Every request can include:

```txt
x-correlation-id
```

If provided, the correlation ID is propagated through logs and error responses.

Example:

```bash
curl -H "x-correlation-id: demo-123" http://localhost:3000/api/v1/health
```

### Structured logs

Request logs include:

```txt
method
path
statusCode
durationMs
correlationId
```

### Standardized error response

Errors follow this structure:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["validation message"],
  "path": "/api/v1/receivables",
  "method": "POST",
  "correlationId": "demo-123",
  "timestamp": "2026-06-29T00:00:00.000Z"
}
```

---

## 11. Tests

The project includes unit and E2E tests.

### Unit tests

Covered services:

```txt
PricingService
ReceivablesService
SettlementsService
```

Run:

```bash
npm run test
```

---

### E2E tests

Covered flows:

```txt
Health check
Complete financial flow
Standardized error handling
```

The complete financial flow test validates:

```txt
GET  /api/v1/health
GET  /api/v1/currencies
POST /api/v1/receivables
POST /api/v1/pricing/simulate
POST /api/v1/settlements
GET  /api/v1/settlements/:id/report
```

Run:

```bash
npm run test:e2e
```

---

### Build validation

```bash
npm run build
```

---

## 12. CI/CD

GitHub Actions validates the backend on pull requests.

The CI workflow runs:

```txt
npm ci
npx prisma generate
npm run test
npm run build
```

The workflow is located at:

```txt
.github/workflows/backend-ci.yml
```

---

## 13. Main Validation Checklist

Before delivery, run:

```bash
docker compose up -d
cd apps/backend
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run test
npm run test:e2e
npm run build
npm run start:dev
```

Then validate manually:

```txt
http://localhost:3000/docs
http://localhost:3000/api/v1/health
```

---

## 14. Example Business Flow

### 14.1 Create receivable

```txt
POST /api/v1/receivables
```

Example payload:

```json
{
  "cedentId": "58b6d169-a1af-443e-b293-993c33fb8e91",
  "receivableTypeCode": "DUPLICATA_MERCANTIL",
  "currencyCode": "BRL",
  "faceValue": "10000.00",
  "dueDate": "2026-07-30"
}
```

---

### 14.2 Simulate pricing

```txt
POST /api/v1/pricing/simulate
```

Example payload:

```json
{
  "faceValue": "10000.00",
  "currencyCode": "BRL",
  "receivableType": "DUPLICATA_MERCANTIL",
  "baseRateMonthly": "1.00",
  "dueDate": "2026-07-30",
  "simulationDate": "2026-06-29"
}
```

---

### 14.3 Create settlement

```txt
POST /api/v1/settlements
```

Example payload:

```json
{
  "receivableId": "5b2094da-53fe-43a6-99e7-ed67bbfadc4f",
  "paymentCurrencyCode": "BRL",
  "baseRateMonthly": "1.00",
  "settlementDate": "2026-06-29",
  "userId": "system"
}
```

---

### 14.4 Get settlement report

```txt
GET /api/v1/settlements/:id/report
```

---

## 15. Technical Decisions

### Decimal.js for financial calculations

JavaScript floating-point arithmetic is not safe for financial calculations.
Decimal.js was used to ensure deterministic decimal operations.

Related ADR:

```txt
docs/adr/0002-decimal-for-financial-calculations.md
```

---

### Prisma transaction for settlement

Settlement changes multiple records:

```txt
Settlement
SettlementItem
Receivable
AuditLog
```

These operations must be atomic, so Prisma transaction was used.

Related ADR:

```txt
docs/adr/0003-prisma-transaction-for-settlement.md
```

---

### Layered architecture

The backend separates HTTP, application logic, infrastructure and shared concerns.

Related ADR:

```txt
docs/adr/0001-layered-architecture.md
```

---

### Correlation ID and structured logs

Correlation ID improves request traceability and debugging.
Structured logs make the application easier to inspect in production-like environments.

---

### Global exception filter

The global exception filter standardizes API error responses and improves observability.

---

## 16. Known Limitations

The current implementation focuses on backend correctness and delivery scope.

Known limitations:

- Authentication and authorization are not implemented.
- Frontend is planned as a lightweight MVP.
- External FX provider integration is mocked/local.
- Production deployment is not included.
- Advanced settlement reversal flow is not implemented.
- Event-driven integration is not implemented.
- Multi-tenant support is not implemented.

---

## 17. Suggested Next Steps

Recommended future improvements:

```txt
Frontend MVP
Authentication and authorization
Backend Dockerfile
Production deployment
External exchange rate provider integration
Settlement reversal flow
Event-driven notifications
More E2E coverage for pagination and filters
Metrics/tracing integration
```

---

## 18. Delivery Status

Current status:

```txt
Backend core flow: completed
Database schema: completed
Currency Engine: completed
Pricing Engine: completed
Receivables Engine: completed
Settlement Engine: completed
AuditLog: completed
Observability: completed
Global error handling: completed
Unit tests: completed
E2E tests: completed
CI/CD: completed
Swagger documentation: completed
Delivery documentation: completed
Frontend MVP: planned
```
