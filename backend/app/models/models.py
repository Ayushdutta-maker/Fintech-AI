import uuid
from datetime import datetime, date, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
    Text,
    Integer,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=False)
    default_currency = Column(String(3), default="INR", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    bills = relationship("Bill", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    forecasts = relationship("Forecast", back_populates="user", cascade="all, delete-orphan")

class Account(Base):
    __tablename__ = "accounts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    account_type = Column(String(30), nullable=False, default="bank") # cash, bank, wallet, credit_card
    currency = Column(String(3), nullable=False, default="INR")
    opening_balance = Column(Numeric(12, 2), nullable=False, default=0.00)
    is_archived = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True) # null = system
    name = Column(String(80), nullable=False)
    category_type = Column(String(20), nullable=False) # income, expense, bill, savings, debt
    color = Column(String(7), nullable=False, default="#006B45")
    icon = Column(String(50), nullable=True, default="tag")
    is_system = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id = Column(String(36), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    transaction_type = Column(String(20), nullable=False) # income, expense, bill, savings, debt, transfer
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="INR")
    transaction_date = Column(Date, nullable=False, index=True)
    merchant = Column(String(160), nullable=True)
    note = Column(Text, nullable=True)
    source = Column(String(20), nullable=False, default="manual") # manual, csv, recurring
    external_hash = Column(String(64), nullable=True, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    prediction = relationship("CategoryPrediction", back_populates="transaction", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_transactions_user_date", "user_id", "transaction_date"),
        Index("idx_transactions_user_cat_date", "user_id", "category_id", "transaction_date"),
    )

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="CASCADE"), nullable=True)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    limit_amount = Column(Numeric(12, 2), nullable=False)
    alert_threshold_pct = Column(Integer, default=80, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")
    alerts = relationship("Alert", back_populates="budget", cascade="all, delete-orphan")

class Bill(Base):
    __tablename__ = "bills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(120), nullable=False)
    expected_amount = Column(Numeric(12, 2), nullable=False)
    due_date = Column(Date, nullable=False, index=True)
    recurrence = Column(String(20), default="monthly", nullable=False) # once, weekly, monthly, yearly
    status = Column(String(20), default="upcoming", nullable=False) # upcoming, paid, overdue, cancelled
    account_id = Column(String(36), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="bills")
    category = relationship("Category")
    account = relationship("Account")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    budget_id = Column(String(36), ForeignKey("budgets.id", ondelete="SET NULL"), nullable=True)
    alert_type = Column(String(30), nullable=False) # budget_threshold, budget_exceeded, unusual_spend, bill_due
    title = Column(String(160), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="warning", nullable=False) # info, warning, critical
    dedupe_key = Column(String(180), nullable=True, index=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="alerts")
    budget = relationship("Budget", back_populates="alerts")

class CategoryPrediction(Base):
    __tablename__ = "category_predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, unique=True)
    suggested_category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    model_version = Column(String(50), nullable=False, default="rules_v1")
    confidence = Column(Numeric(5, 4), nullable=False, default=0.0000)
    accepted = Column(Boolean, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    transaction = relationship("Transaction", back_populates="prediction")
    suggested_category = relationship("Category")

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    forecast_type = Column(String(30), nullable=False, default="monthly_expense")
    target_period = Column(Date, nullable=False)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    predicted_amount = Column(Numeric(12, 2), nullable=False)
    lower_bound = Column(Numeric(12, 2), nullable=True)
    upper_bound = Column(Numeric(12, 2), nullable=True)
    method = Column(String(60), nullable=False)
    training_window_start = Column(Date, nullable=True)
    training_window_end = Column(Date, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="forecasts")
    category = relationship("Category")
