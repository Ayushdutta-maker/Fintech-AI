from typing import Optional
from datetime import date, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.db.session import get_db
from app.models.models import User, Transaction, Account, Budget, Bill
from app.schemas.schemas import DashboardSummaryOut, TransactionOut, BillOut
from app.routers.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    if not month:
        month = today.strftime("%Y-%m")

    try:
        y, m = map(int, month.split("-"))
        m_start = date(y, m, 1)
        if m == 12:
            m_end = date(y + 1, 1, 1) - timedelta(days=1)
        else:
            m_end = date(y, m + 1, 1) - timedelta(days=1)
    except Exception:
        m_start = date(today.year, today.month, 1)
        m_end = today
        month = today.strftime("%Y-%m")

    # Helper function for summing transactions in month
    def get_sum(types: list) -> Decimal:
        val = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= m_start,
            Transaction.transaction_date <= m_end,
            Transaction.transaction_type.in_(types)
        ).scalar()
        return val or Decimal("0.00")

    total_income = get_sum(["income"])
    total_expenses = get_sum(["expense"])
    total_bills = get_sum(["bill"])
    total_debt = get_sum(["debt"])
    total_savings = get_sum(["savings"])

    # Outflows = expense + bill + debt
    total_outflows = total_expenses + total_bills + total_debt

    # Sum opening balance across user's active accounts
    total_opening_bal = db.query(func.sum(Account.opening_balance)).filter(
        Account.user_id == current_user.id,
        Account.is_archived == False
    ).scalar() or Decimal("0.00")

    # Overall lifetime balance left = opening balance + all lifetime income - all lifetime outflows & savings
    life_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == "income"
    ).scalar() or Decimal("0.00")

    life_outflows = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type.in_(["expense", "bill", "debt", "savings"])
    ).scalar() or Decimal("0.00")

    balance_left = total_opening_bal + life_income - life_outflows

    # Budget calculations for this month
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.period_start <= m_end,
        Budget.period_end >= m_start
    ).all()

    total_budget_limit = sum((b.limit_amount for b in budgets), Decimal("0.00"))

    # Actual spending eligible for budgets (expense + bill)
    if total_budget_limit > 0:
        actual_budget_spent = total_expenses + total_bills
        budget_used_pct = float((actual_budget_spent / total_budget_limit) * Decimal("100"))
        budget_used_pct = min(round(budget_used_pct, 1), 999.0)
    else:
        budget_used_pct = 0.0

    # Recent transactions
    recent_txs_raw = db.query(Transaction).options(
        joinedload(Transaction.category),
        joinedload(Transaction.account)
    ).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc()).limit(6).all()

    recent_txs = []
    for t in recent_txs_raw:
        out = TransactionOut.model_validate(t)
        if t.account:
            out.account_name = t.account.name
        recent_txs.append(out)

    # Upcoming bills
    upcoming_bills_raw = db.query(Bill).options(
        joinedload(Bill.category)
    ).filter(
        Bill.user_id == current_user.id,
        Bill.status == "upcoming"
    ).order_by(Bill.due_date.asc()).limit(4).all()

    upcoming_bills = [BillOut.model_validate(b) for b in upcoming_bills_raw]

    return {
        "period": month,
        "currency": current_user.default_currency,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_bills": total_bills,
        "total_debt_payments": total_debt,
        "total_savings": total_savings,
        "total_outflows": total_outflows,
        "balance_left": balance_left,
        "budget_limit": total_budget_limit,
        "budget_used_pct": budget_used_pct,
        "recent_transactions": recent_txs,
        "upcoming_bills": upcoming_bills
    }
