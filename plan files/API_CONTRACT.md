# API Contract

Base URL: `/api/v1`

## Authentication
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Authenticate and issue token |
| GET | `/auth/me` | Current user profile |

## Transactions
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/transactions?from=&to=&type=&category_id=&page=&page_size=` | List filtered transactions |
| POST | `/transactions` | Create transaction |
| GET | `/transactions/{id}` | Get one transaction |
| PATCH | `/transactions/{id}` | Update transaction |
| DELETE | `/transactions/{id}` | Delete transaction |
| POST | `/transactions/import/csv` | Validate/import CSV |
| GET | `/transactions/export/csv?from=&to=` | Download CSV |

Example create request:
```json
{
  "account_id": "uuid",
  "category_id": "uuid",
  "transaction_type": "expense",
  "amount": "450.00",
  "currency": "INR",
  "transaction_date": "2026-10-17",
  "merchant": "Grocery Store",
  "note": "Weekly groceries"
}
```

## Dashboard and analytics
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/dashboard/summary?month=2026-10` | KPI totals |
| GET | `/analytics/category-spending?from=&to=` | Category breakdown |
| GET | `/analytics/budget-vs-actual?month=` | Planned vs actual |
| GET | `/analytics/cashflow?months=6` | Monthly trend |

## Budgets, bills, and alerts
| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/budgets` | List/create budgets |
| PATCH/DELETE | `/budgets/{id}` | Update/delete budget |
| GET/POST | `/bills` | List/create bills |
| PATCH/DELETE | `/bills/{id}` | Update/delete bill |
| GET | `/alerts` | List alerts |
| PATCH | `/alerts/{id}/read` | Mark alert read |

## Forecasts and recommendations
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/forecast/monthly-expense?horizon=1` | Predict future expenses |
| GET | `/recommendations/budget?month=2026-10` | Budget suggestions |
| POST | `/categorization/suggest` | Suggest transaction category |

## Standard errors
- `401`: missing/invalid authentication.
- `403` or `404`: resource not accessible to this user.
- `409`: duplicate import or conflicting resource.
- `422`: invalid request data.
- `500`: unexpected server error; return a generic message and log a request ID.

All endpoints that read or mutate user data must enforce user ownership on the server.
