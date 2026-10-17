# Technical Requirements Document (TRD)

## 1. Architecture
Use a React single-page application communicating with a FastAPI REST API. FastAPI validates requests, applies business rules, calls services, and persists data through SQLAlchemy. A separate analytics layer calculates aggregates and calls forecasting/categorization models.

```text
React + Vite
  ├── Pages / Components
  ├── API client (fetch/axios)
  └── Charts (Recharts)
          │ HTTPS / JSON
          ▼
FastAPI
  ├── Auth & authorization
  ├── Routers / Pydantic schemas
  ├── Domain services
  ├── Analytics & ML services
  └── SQLAlchemy repositories
          │
          ▼
PostgreSQL (SQLite in local dev)
```

## 2. Recommended repository layout
```text
finance-tracker/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/transactions/
│   │   ├── features/budgets/
│   │   ├── lib/api.ts
│   │   └── styles/tokens.css
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/config.py
│   │   ├── core/security.py
│   │   ├── db/session.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   └── ml/
│   ├── tests/
│   └── requirements.txt
├── docs/
└── docker-compose.yml
```

## 3. Technology decisions
- React + Vite: fast development and component-based UI.
- TypeScript: catches UI data-shape errors earlier.
- Tailwind CSS: reusable design tokens and responsive layouts.
- Recharts: dashboard visualizations.
- FastAPI: typed Python API with generated OpenAPI docs.
- SQLAlchemy 2.x: database access and migrations.
- PostgreSQL: reliable relational storage; SQLite is acceptable for a local prototype.
- scikit-learn: baseline ML; avoid complex models until enough data exists.

## 4. Environments and configuration
Use environment variables; never commit secrets.
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `CORS_ORIGINS`
- `APP_ENV`
- `MODEL_PATH` (if a persisted model is used)

Provide `.env.example` with placeholders only.

## 5. API conventions
- Base path: `/api/v1`
- JSON request/response bodies.
- ISO 8601 dates and UTC timestamps for audit fields.
- Monetary values stored as `NUMERIC/Decimal`, not binary floats.
- Pagination for transaction history.
- Consistent error shape: `{"detail": "Human-readable explanation"}`.
- Use HTTP status codes: 200, 201, 204, 400, 401, 403, 404, 409, 422, 500.

## 6. Security
- Hash passwords using Argon2 or bcrypt.
- Short-lived JWT access tokens; consider refresh-token rotation for production.
- Enforce user ownership on every resource query.
- Validate CSV imports and limit file size.
- Use parameterized ORM queries.
- Add rate limits to authentication endpoints.
- Restrict CORS to known frontend origins in production.
- Do not log passwords, tokens, transaction notes, or full financial records.
- HTTPS required in production.

## 7. Observability and testing
- Structured logs with request IDs.
- Unit tests for calculations and business rules.
- API tests for authorization boundaries.
- Frontend component tests for forms and empty/error states.
- Integration tests against a disposable test database.
- Track prediction error offline (MAE/MAPE where suitable) before making model changes.

## 8. Deployment
Use Docker Compose for local API + database. Run migrations before startup. Configure production secrets in the host's secret manager. Back up the database and document restore procedures.
