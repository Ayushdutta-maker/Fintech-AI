from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.services.seed_data import init_system_categories
from app.routers import (
    auth,
    accounts,
    categories,
    transactions,
    budgets,
    bills,
    dashboard,
    analytics,
    forecasts,
    alerts,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed default categories
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        init_system_categories(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Intelligent Personal Finance & Expense Prediction API",
    version="1.0.0",
    description="Backend API for personal finance tracking, forecasting, budget management, and overspending alerts",
    lifespan=lifespan
)

# CORS setup
cors_origins = [orig.strip() for orig in settings.CORS_ORIGINS.split(",") if orig.strip()]
if not cors_origins or settings.APP_ENV == "development":
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(accounts.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(budgets.router, prefix="/api/v1")
app.include_router(bills.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(forecasts.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": "Intelligent Personal Finance Tracker API",
        "version": "1.0.0"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to Intelligent Personal Finance & Expense Prediction API",
        "docs_url": "/docs",
        "health_check": "/health"
    }
