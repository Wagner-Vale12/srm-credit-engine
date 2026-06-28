# Settlement Flow

## Purpose

The Settlement Engine confirms the settlement of a receivable and persists the financial result in a consistent way.

The flow is designed to guarantee that settlement creation, receivable status update, payment item creation and audit logging happen atomically.

## Endpoint

```txt
POST /api/v1/settlements
```
