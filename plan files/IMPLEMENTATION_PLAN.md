# Implementation Plan

## Recommended MVP sequence (10–14 working days)
A 5–7 day prototype is possible if you reduce scope to transactions, dashboard, budgets, and a simple rolling-average forecast.

### Phase 1 — Setup (Day 1)
- Create `frontend` with Vite + React + TypeScript.
- Create `backend` with FastAPI.
- Configure environment variables and database connection.
- Add health endpoint and verify frontend-to-backend communication.
- Add CSS variables matching `UI_UX_DESIGN.md`.

**Done when:** the frontend loads and `GET /health` succeeds.

### Phase 2 — Database and authentication (Days 2–3)
- Implement SQLAlchemy models and Alembic migrations.
- Seed default categories.
- Implement registration/login and password hashing.
- Add authenticated user dependency.
- Add tests for authentication and ownership.

**Done when:** a user can register, log in, and only access their own resources.

### Phase 3 — Transactions (Days 3–5)
- Build transaction create/list/edit/delete endpoints.
- Build transaction form and filterable list.
- Add input validation and pagination.
- Add sample seed data for development.

**Done when:** CRUD works and dashboard calculations can use saved records.

### Phase 4 — Dashboard and budgets (Days 5–7)
- Implement summary and analytics endpoints.
- Build KPI cards and three charts.
- Implement budgets and progress bars.
- Implement threshold-crossing alerts.

**Done when:** values reconcile with transaction data and alerts do not duplicate.

### Phase 5 — Forecast and recommendations (Days 8–10)
- Add monthly aggregation service.
- Implement rolling-average baseline and low-data state.
- Add category suggestion rules; add TF-IDF model only after sample labels exist.
- Show method, data window, and limitations in UI.

**Done when:** forecast endpoint returns meaningful output for both low-data and sufficient-data cases.

### Phase 6 — CSV and polish (Days 11–12)
- Validate and import CSV with preview.
- Export filtered transactions.
- Add loading, empty, error, and confirmation states.
- Test mobile responsiveness and accessibility.

### Phase 7 — QA and deployment (Days 13–14)
- Run backend and frontend tests.
- Check authorization on every endpoint.
- Add Docker Compose and deployment instructions.
- Document limitations and demo credentials only for local development.

## Suggested 5–7 day mini-project cut
1. Day 1: UI shell, palette, database models.
2. Day 2: transaction CRUD.
3. Day 3: dashboard KPI and charts.
4. Day 4: budgets and alerts.
5. Day 5: rolling-average expense prediction.
6. Day 6: CSV export, testing, responsive layout.
7. Day 7: bug fixes, README, demo preparation.

## Demo checklist
- Add income and expense.
- Change month filter and confirm totals update.
- Create a grocery budget and trigger a threshold alert.
- View category chart and budget-vs-actual chart.
- Open forecast and show its historical window.
- Export CSV.
- Demonstrate empty-state behavior with a new account.
