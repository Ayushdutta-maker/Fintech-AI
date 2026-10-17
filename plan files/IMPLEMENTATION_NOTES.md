# Implementation Notes and Starter Rules

## Monetary arithmetic
Use Python `Decimal` and SQL `NUMERIC`, never binary floating-point arithmetic for persisted currency totals.

## Dashboard response example
```json
{
  "period": "2026-10",
  "currency": "INR",
  "total_income": "40000.00",
  "total_expenses": "8500.00",
  "total_bills": "1500.00",
  "total_debt_payments": "2500.00",
  "total_savings": "2000.00",
  "balance_left": "25500.00",
  "budget_used_pct": 31.0
}
```
This is illustrative sample data, not a real user's financial information.

## Forecast response example
```json
{
  "target_period": "2026-11",
  "predicted_expense": "12500.00",
  "currency": "INR",
  "method": "three_month_rolling_average",
  "history_months": 3,
  "confidence_label": "low",
  "explanation": "Estimate based on the last three completed months. Actual spending may differ."
}
```

## Environment file example
```dotenv
APP_ENV=development
DATABASE_URL=sqlite:///./finance.db
JWT_SECRET_KEY=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173
```

## Definition of done
- Code is formatted and linted.
- Critical calculations have unit tests.
- Every user-owned endpoint checks ownership.
- No secrets are committed.
- Loading, empty, and error states exist.
- UI works on mobile and desktop.
- Forecast limitations are visible.
