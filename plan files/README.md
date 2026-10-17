# Intelligent Personal Finance and Expense Prediction System

A full-stack personal finance application that tracks income, expenses, bills, savings, and budgets; automatically categorizes transactions; analyzes spending patterns; predicts future expenses; recommends budgets; and alerts users when they approach or exceed spending limits.

## Product goals
- Make a user's financial position understandable at a glance.
- Reduce manual work through transaction categorization and import.
- Forecast likely upcoming spending using historical data.
- Offer explainable, actionable budget recommendations.
- Keep the interface aligned with the supplied green-and-white reference design.

## Suggested stack
- **Frontend:** React + Vite, TypeScript, Tailwind CSS, Recharts
- **Backend:** Python + FastAPI, Pydantic, SQLAlchemy
- **Database:** PostgreSQL (SQLite for local development)
- **ML/Data:** pandas, scikit-learn; optional statsmodels for time-series models
- **Auth:** JWT access tokens + hashed passwords
- **Testing:** Pytest, Vitest, React Testing Library
- **Deployment:** Docker Compose; frontend on a static host and API on a Python host

## Documentation
1. [Product Requirements Document](PRD.md)
2. [Technical Requirements Document](TRD.md)
3. [Application Flow](APP_FLOW.md)
4. [UI/UX Design Specification](UI_UX_DESIGN.md)
5. [Backend Schema](BACKEND_SCHEMA.md)
6. [Implementation Plan](IMPLEMENTATION_PLAN.md)
7. [API Contract](API_CONTRACT.md)
8. [ML & Analytics Design](ML_ANALYTICS.md)

## Design palette extracted from the reference image
- Primary forest green: `#006B45`
- Deep green: `#00563A`
- Emerald: `#078A5A`
- Light mint: `#E8F5EE`
- Off-white background: `#F7F9F7`
- White cards: `#FFFFFF`
- Main text: `#111827`
- Muted text: `#64748B`
- Border: `#E5EAE7`
- Expense red: `#E53935`
- Bills cyan: `#16A6B6`
- Savings blue: `#2563EB`
- Debt purple: `#7C3AED`
- Warning amber: `#F59E0B`

These are practical design-token approximations based on the supplied image, not sampled pixel measurements.

## MVP scope
Authentication, transaction CRUD, categories, recurring bills, monthly budgets, dashboard charts, CSV export, basic expense prediction, recommendations, and overspending alerts.

## Important note
This application is for budgeting and educational insights, not professional financial, tax, credit, or investment advice. Forecasts are estimates and should show uncertainty and data limitations.
