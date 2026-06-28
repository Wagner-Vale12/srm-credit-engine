# AI Usage

This document describes how AI assistance was used during the development of the SRM Credit Engine technical challenge.

## Purpose

AI was used as a development support tool to accelerate implementation, improve organization, and review architectural decisions. All generated suggestions were manually reviewed, tested, and adapted before being committed.

## Areas where AI was used

### Project structure

AI assisted in planning the initial monorepo organization:

- `apps/backend`
- `apps/frontend`
- `packages/shared`
- `docs/c4`
- `docs/architecture`
- `docs/database`
- `docs/adr`
- `.github/workflows`

The final structure was manually created and validated by the developer.

### Backend layer organization

AI assisted in reorganizing the NestJS backend into layered folders:

- `application`
- `domain`
- `infrastructure`
- `presentation`
- `shared`

After the reorganization, broken relative imports were corrected with AI support and manually validated through local execution and Swagger testing.

### Currency Engine

AI was used as support during the implementation of the Currency Engine endpoints:

- `GET /api/v1/currencies`
- `GET /api/v1/currencies/rates/latest`
- `POST /api/v1/currencies/rates`

The implementation was validated manually through Swagger and PostgreSQL data inspection.

### Pricing Engine

AI assisted in designing the Strategy Pattern used by the Pricing Engine.

The implemented strategies were:

- Duplicata Mercantil: 1.5% monthly spread
- Cheque Pré-datado: 2.5% monthly spread

AI also supported the use of Decimal.js for financial precision and helped draft unit test scenarios.

The final implementation was validated through:

- Local build
- Unit tests
- Swagger manual testing

### Settlement Engine

AI assisted in structuring the Settlement Engine with Prisma transaction handling.

The implementation includes:

- Receivable status validation
- Pricing Engine integration
- Settlement creation
- Settlement item creation
- Receivable status update
- Audit log creation
- Settlement report endpoint

The transaction flow was manually validated through Swagger and Prisma Studio.

## Human validation

All code was manually reviewed before commit.

Validation included:

- Running local builds
- Running unit tests
- Testing endpoints through Swagger
- Inspecting persisted data in Prisma Studio
- Reviewing Git diffs before commits
- Using feature branches and simulated pull requests

## Responsible AI usage

AI was not used to bypass understanding of the business rules. It was used as an assistant for implementation, review, documentation, and debugging support.

Final decisions about architecture, implementation, testing, commits, and pull requests were made by the developer.
