# Backend Overview

## Context

The SRM Credit Engine backend is responsible for pricing and settling receivables in a multi-currency credit assignment platform.

The backend was implemented using:

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Decimal.js
- Swagger/OpenAPI
- Docker Compose

## Main responsibilities

The backend currently provides the following engines:

### Currency Engine

Responsible for managing supported currencies and exchange rates.

Implemented endpoints:

- `GET /api/v1/currencies`
- `GET /api/v1/currencies/rates/latest`
- `POST /api/v1/currencies/rates`

### Pricing Engine

Responsible for simulating the present value and discount amount of receivables.

Implemented endpoint:

- `POST /api/v1/pricing/simulate`

The Pricing Engine uses the Strategy Pattern to apply different spreads according to the receivable type.

Current strategies:

- `DUPLICATA_MERCANTIL`: 1.5% monthly spread
- `CHEQUE_PRE_DATADO`: 2.5% monthly spread

### Settlement Engine

Responsible for confirming the settlement of a receivable.

Implemented endpoints:

- `POST /api/v1/settlements`
- `GET /api/v1/settlements/:id/report`

The Settlement Engine uses a Prisma transaction to ensure ACID consistency when creating settlements.

## Layered architecture

The backend is organized into layered folders:

```txt
src
├── application
├── domain
├── infrastructure
├── presentation
└── shared
```
