# ADR 0003: Use Prisma Transaction for Settlement Engine

## Status

Accepted

## Context

The Settlement Engine needs to persist multiple related changes when settling a receivable.

The settlement flow includes:

- Validating the receivable
- Running the Pricing Engine
- Updating the receivable status
- Creating a Settlement
- Creating a SettlementItem
- Creating an AuditLog

These operations must be consistent. If one operation fails, the database must not keep partial settlement data.

For example, the system must not create a Settlement without also updating the Receivable status to `SETTLED`.

## Decision

The Settlement Engine will use `prisma.$transaction` to execute settlement persistence as an atomic operation.

The transaction includes:

```txt
1. Fetch receivable
2. Validate receivable status
3. Fetch payment currency
4. Run pricing simulation
5. Update receivable status to SETTLED
6. Create settlement
7. Create settlement item
8. Create audit log
```

If any step fails, the transaction is rolled back.

## Optimistic concurrency control

The receivable update uses `id`, `version` and allowed statuses to avoid settling stale data.

Example:

```ts
await tx.receivable.updateMany({
  where: {
    id: receivable.id,
    version: receivable.version,
    status: {
      in: [ReceivableStatus.REGISTERED, ReceivableStatus.PRICED],
    },
  },
  data: {
    status: ReceivableStatus.SETTLED,
    version: {
      increment: 1,
    },
  },
});
```

If the update count is not `1`, the service throws a conflict error.

## Consequences

### Positive

- Guarantees atomic settlement creation
- Prevents partial writes
- Improves data consistency
- Supports auditability
- Protects against duplicate or concurrent settlement attempts

### Negative

- Settlement logic needs to be carefully organized inside the transaction
- Long-running operations should be avoided inside the transaction
- Requires attention when integrating external services in the future

## Alternatives considered

### Execute operations without transaction

Rejected because partial data could be persisted in failure scenarios.

### Use manual compensation logic

Rejected because it is more complex and unnecessary for the current relational database model.

### Use event-driven settlement flow

Not adopted for the current scope. It may be considered in the future if the system evolves into distributed services.

## Final notes

Prisma transaction handling was selected to provide ACID consistency for the Settlement Engine while keeping the implementation simple and aligned with the current PostgreSQL architecture.
