# FinTrack AI — Intelligent Personal Finance & Expense Prediction System

A full-stack, ML-powered personal finance and expense forecasting web application built strictly according to the architecture, specifications, and green-and-white visual palette defined in [plan files](file:///d:/OneDrive/Desktop/TT_Project/plan%20files).

---

## 🌟 Key Highlights & Features

1. **Forest-Green Cash-Flow Summary Banner**
   - Full-width hero banner (`#006B45` & `#00563A`) calculating:
     - **Total Monthly Income**
     - **Total Outflows** (Expenses + Bills + Debt)
     - **Balance Left** (Liquid net balance reconciled across accounts)
     - **Budget Utilization %** (Planned vs eligible spent)

2. **6 Responsive KPI Financial Cards**
   - Total Income, Total Expenses, Total Bills, Debt Payments, Total Savings, Balance Left with colored icon chips and metrics.

3. **Analytics & Visualizations (Recharts)**
   - **Outflow Allocation Donut**: Visual breakdown of expenses, bills, debt, and savings.
   - **Budget vs Actual Comparison**: Grouped bar charts comparing planned allowances against actual category velocity.
   - **Ranked Category Spend**: Horizontal ranked bars showing highest spending categories.
   - **Cash-Flow Trend**: Historical multi-month cash-flow momentum.

4. **Machine Learning & Time-Series Forecasting (`scikit-learn` & `pandas`)**
   - **Predictive Expense Horizon**: Monthly spending forecast with lower and upper uncertainty bounds calculated via rolling-origin trends and rolling averages.
   - **Confidence Scoring**: High, Medium, or Low confidence rating based on data depth.
   - **Explainable Methodology**: Transparent descriptions explaining how the estimate was computed.
   - **Limitations Notice**: Clear disclaimer stating that estimates are indicative statistical projections.
   - **Smart Category Suggestions**: Heuristic rules + TF-IDF classifier suggesting categories with real-time confidence preview while typing merchants or notes.
   - **AI Budget Recommendations**: Analyzes recent 3-month spending velocity and suggests actionable adjustments (e.g., increase limit or reallocate to savings) with 1-click apply.

5. **Transactions Management & CSV Workflows**
   - Real-time search, multi-field filtering (Date range, Transaction Type, Category, Account).
   - Pagination controls.
   - **CSV Import**: Drag-and-drop file upload, automatic column mapping, duplicate detection, and validation reporting.
   - **CSV Export**: Filtered export with dates and transactions.

6. **Budgets & Overspending Alerts**
   - Category and overall budget limits with visual progress bars.
   - Configurable alert threshold percentages (e.g. 80%, 100%).
   - Deduplicated threshold crossing alerts and upcoming bill reminders with unread badge counter.

7. **Recurring Bills Tracker**
   - Scheduled bills (electricity, internet, rent, subscriptions) with due-date badges.
   - 1-Click "Mark as Paid" action that records the corresponding transaction.

8. **User Registration & Secure Isolation**
   - Clean registration and sign-in flow with private account scoping, customizable default currency, and password encryption.

---

## 🛠️ Technology Stack

- **Frontend:** React 19 + Vite, TypeScript, Lucide Icons, Recharts, Custom CSS Design System
- **Backend:** Python 3.11 + FastAPI, Pydantic, SQLAlchemy, SQLite (`finance.db`)
- **ML / Data:** scikit-learn, pandas, numpy
- **Security:** JWT Authentication (PyJWT) + direct bcrypt password hashing
- **Deployment:** Docker & Docker Compose (`docker-compose.yml`)

---

## 🚀 Quick Start Guide

### Option 1: Using Windows Helper Scripts (Easiest)

1. **Start Backend**: Double-click [run_backend.bat](file:///d:/OneDrive/Desktop/TT_Project/run_backend.bat) (runs on `http://127.0.0.1:8000`)
2. **Start Frontend**: Double-click [run_frontend.bat](file:///d:/OneDrive/Desktop/TT_Project/run_frontend.bat) (runs on `http://localhost:5173`)
3. Open your browser to `http://localhost:5173` and create your account!

### Option 2: Running via Terminal

#### 1. Backend Setup & Run:
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`

#### 2. Frontend Setup & Run:
```bash
cd frontend
npm install
npm run dev
```
- App UI: `http://localhost:5173`

#### 3. Docker Compose (Alternative):
```bash
docker-compose up --build
```

---

## 🧪 Testing

Run backend tests using Python's built-in unittest:
```bash
cd backend
python -m unittest tests/test_api.py
```
All tests verify health check, demo login, dashboard cash-flow reconciliation, ML forecasting, and smart auto-categorization.

---

## 🔒 Security & Ownership

- Every transaction, budget, bill, alert, and account query is strictly scoped by `user_id`.
- Monetary arithmetic uses standard decimal representation.
- User passwords are encrypted with bcrypt salt hashing.
