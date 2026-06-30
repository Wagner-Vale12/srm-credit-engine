# AI_USAGE.md — Use of AI in the SRM Credit Engine Project

## 0. Challenge Context

The SRM Credit Engine challenge consisted of building a financial receivables platform capable of registering receivables, simulating pricing, applying exchange rates, settling receivables, generating reports, and preserving consistency through transactional operations.

The main technical challenge was not only to expose CRUD endpoints, but to model a financial workflow with precision, traceability, validation, automated tests, documentation, Docker support, Git workflow discipline, and clear engineering decisions.

Because the project deals with financial calculations, I had to pay special attention to decimal precision, transactional consistency, optimistic locking, error handling, auditability, and API documentation.

## 1. Purpose of AI Usage

During the development of the SRM Credit Engine, I used AI as a technical support tool to accelerate architectural decisions, review challenge requirements, validate best practices, and improve the delivery documentation.

AI was not used as a substitute for technical understanding. Final decisions, local execution, testing, Swagger validation, Git adjustments, financial modeling, and code corrections were performed manually.

---

## 2. Areas Where AI Was Used

AI was used primarily to:

- review the backend architecture in NestJS;
- validate the separation between controllers, services, DTOs, database, and domain layers;
- support decisions regarding financial precision with Decimal.js;
- structure ADRs;
- review the README and final documentation;
- generate ideas for unit and E2E tests;
- review commit messages;
- identify maturity gaps for mid-level/senior expectations;
- improve the clarity of the technical delivery.

---

## 3. Strategic Prompts Used

### Prompt 1 — Backend Architecture

"I am building a NestJS API for a financial receivables challenge. I need to separate responsibilities across the presentation, application, domain, and infrastructure layers. Help me validate a simple, clean, and defensible architecture for a mid-level/senior engineer."

### Prompt 2 — Financial Precision

"I have financial calculations involving face value, monthly rate, term, and present value. What are the risks of using `number` in JavaScript, and how can I avoid precision errors in a financial API?"

### Prompt 3 — Settlement Transaction

"I need to create a settlement for multiple receivables in a single operation. How can I model this using a Prisma transaction, status updates, an audit log, and safeguards against inconsistencies?"

### Prompt 4 — Technical Documentation

"Review my README for a financial project using NestJS, PostgreSQL, Prisma, Docker, tests, and GitHub Actions. Point out what is strong and what could prevent it from being evaluated at a senior level."

### Prompt 5 — Git Workflow

"How should I organize commits, branches, pull requests, and documentation so that the repository history tells a clear story in a technical challenge?"

---

## 4. Example of an Incorrect or Incomplete AI Suggestion

During development, AI initially suggested simplifying the financial calculations by using `number` and rounding with `toFixed`.

This approach was rejected because financial values should not rely on JavaScript's native floating-point arithmetic. Small precision differences can cause errors in discount, present value, and settlement calculations.

The applied correction was to use `Decimal.js`, store monetary values with controlled precision, and document the decision in an ADR.

---

## 5. Another Point That Required Human Review

At times, AI suggested duplicating validations between DTOs and services.

The applied correction was to separate responsibilities more clearly:

- DTO: validates the input format, type, and required fields.
- Service: validates business rules and operation consistency.

This prevented the same rule from being scattered across multiple parts of the codebase.

---

## 6. Where AI Helped the Most

AI was most helpful in:

- accelerating architectural reviews;
- identifying risks that could otherwise go unnoticed;
- improving documentation clarity;
- suggesting test scenarios;
- organizing ideas for ADRs;
- reviewing explicit requirements from the challenge description;
- comparing the delivery against mid-level/senior expectations.

---

## 7. Where AI Was Unhelpful or Needed to Be Limited

AI was unhelpful when it offered overly generic solutions or suggested improvements that would unnecessarily increase the project scope.

Examples:

- suggestions to implement full authentication when the priority was completing the core financial features;
- suggestions for advanced observability before ensuring Docker, tests, and documentation were complete;
- initial responses that did not fully consider the context of the challenge description.

In these cases, I filtered the suggestions and prioritized what added direct value to the delivery.

---

## 8. Final Decisions Made Manually

Final decisions were based on the challenge description, local execution, and practical validation:

- use of NestJS and TypeScript;
- use of Prisma with PostgreSQL;
- use of Decimal.js for financial calculations;
- use of ACID transactions for settlement;
- implementation of optimistic locking;
- error standardization with a Global Exception Filter;
- use of correlation IDs;
- creation of ADRs;
- CI/CD configuration;
- creation of a Dockerfile;
- configuration of pre-commit hooks;
- creation of a semantic release tag.

---

## 9. Conclusion

AI was used as an engineering accelerator and critical review tool, not as a substitute for implementation.

The project was validated through local execution, automated tests, builds, Swagger/OpenAPI, manual code review, and Git version control.
