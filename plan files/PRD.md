# Product Requirements Document (PRD)

## 1. Product overview
**Product name:** Intelligent Personal Finance and Expense Prediction System  
**Product type:** Responsive web application  
**Purpose:** Help individuals understand cash flow, control expenses, plan budgets, and anticipate future spending.

## 2. Problem statement
People often record spending inconsistently and discover overspending only after a month ends. Transaction histories can be difficult to interpret, while static budgets do not adapt to changing patterns. The product combines transaction management, analytics, forecasting, and proactive alerts in one dashboard.

## 3. Goals and success metrics
- Users can record an income or expense in under 30 seconds.
- Dashboard totals reconcile with the underlying transaction records.
- At least 90% of manually entered transactions can be categorized using rules or user-selected categories; ML suggestions are measured separately.
- Forecasts report a baseline and uncertainty rather than presenting estimates as facts.
- Users can set a monthly budget and receive alerts at configurable thresholds.
- CSV export includes the selected date range and transaction fields.

## 4. Target users
- Students and early-career professionals managing monthly cash flow.
- Individuals who want a lightweight offline-friendly budgeting workflow.
- Users who want to understand recurring expenses and reduce avoidable overspending.

## 5. Core user stories
- As a user, I can create an account and securely sign in.
- As a user, I can record income, expenses, bills, transfers, and savings contributions.
- As a user, I can assign categories and correct an automatic category suggestion.
- As a user, I can view monthly income, outflows, remaining balance, budget utilization, and category spending.
- As a user, I can compare planned budgets with actual spending.
- As a user, I can see estimated future spending and understand which historical data informed it.
- As a user, I can receive an alert when spending reaches a budget threshold.
- As a user, I can export transactions as CSV.
- As a user, I can delete or export my data.

## 6. Functional requirements
### P0 — MVP
1. Authentication: registration, login, logout, password hashing.
2. Transactions: create, list, update, delete; amount, type, date, category, account, note, merchant.
3. Categories: default categories and user-editable custom categories.
4. Dashboard: total income, expenses, bills, savings, balance, budget used.
5. Budgets: monthly category budgets, threshold settings, actual-vs-budget view.
6. Analytics: category breakdown, income/outflow trend, monthly comparisons.
7. CSV import/export with validation and duplicate review.
8. Alerts: in-app alert at 80%, 100%, and configurable threshold.
9. Forecast: baseline monthly expense prediction from historical monthly data.
10. Responsive layout matching the reference's green-and-white palette.

### P1 — Later
- Recurring transaction automation.
- Multiple accounts and currencies.
- Receipt OCR.
- Local-first mode with encrypted browser storage and sync.
- Email/push notifications.
- Anomaly detection and explainable categorization confidence.

## 7. Non-functional requirements
- Security: password hashing, input validation, least-privilege access, secure secrets.
- Privacy: user data is private by default; no financial data is used to train shared models without explicit consent.
- Performance: dashboard API target under 500 ms for typical personal datasets (excluding cold-start model fitting).
- Reliability: database constraints and transactional writes for money operations.
- Accessibility: keyboard support, visible focus, sufficient contrast, labels for charts and form controls.
- Maintainability: layered API, service, repository, and ML modules.
- Portability: Docker-based local setup.

## 8. Out of scope for MVP
- Direct bank integrations or payment initiation.
- Investment recommendations, credit scoring, lending decisions, or tax filing.
- Guaranteed predictions of future costs.
- Multi-user shared household accounts.

## 9. Acceptance criteria
- Dashboard totals match filtered transactions for the selected month.
- A transaction cannot be saved with a non-positive amount, invalid type, or another user's account/category.
- Budget alerts are not duplicated repeatedly for the same threshold crossing.
- Prediction endpoint returns a baseline, method, horizon, and limitations.
- CSV export uses stable column names and handles commas/quotes safely.
- Empty states explain how to start when there is insufficient data.
