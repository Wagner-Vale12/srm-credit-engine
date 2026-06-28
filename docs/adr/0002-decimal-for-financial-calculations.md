# ADR 0002: Use Decimal.js for Financial Calculations

## Status

Accepted

## Context

The SRM Credit Engine performs financial calculations such as:

- Present value
- Discount amount
- Monthly base rate
- Monthly spread
- Effective monthly rate
- Currency conversion

JavaScript `number` uses floating-point arithmetic, which can introduce precision errors in financial calculations.

Example:

```ts
0.1 + 0.2;
```

The result is not exactly `0.3`.

For a credit assignment platform, precision is critical because small calculation errors can affect settlement values.

## Decision

The backend will use `Decimal.js` for financial calculations.

Examples of values handled with Decimal.js:

- Face value
- Present value
- Discount amount
- Base rate
- Spread
- Exchange rate
- Payment amount

Example:

```ts
const effectiveMonthlyRate = baseRateMonthly.plus(spreadMonthly);

const discountFactor = new Decimal(1)
  .plus(effectiveMonthlyRate)
  .pow(termInMonths);

const presentValue = faceValue.div(discountFactor);
```

## Consequences

### Positive

- Avoids floating-point precision issues
- Improves reliability of financial calculations
- Makes rounding explicit
- Better aligns with financial domain requirements
- Keeps monetary calculations deterministic

### Negative

- Requires converting values from Prisma Decimal to Decimal.js
- Requires formatting values before returning API responses
- Adds one external dependency

## Alternatives considered

### JavaScript number

Rejected because it is unsafe for monetary calculations.

### Native BigInt

Rejected because it does not handle decimal fractions naturally.

### Database-only calculations

Rejected for now because the Pricing Engine business rules are implemented in the application layer and need to be tested independently.

## Final notes

Decimal.js was selected because it provides reliable decimal arithmetic while keeping the implementation simple and readable.
