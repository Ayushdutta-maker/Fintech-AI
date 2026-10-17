from typing import List, Optional
from datetime import date, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.db.session import get_db
from app.models.models import User, Transaction, Category, Budget
from app.schemas.schemas import (
    CategorySpendingItem,
    BudgetVsActualItem,
    CashFlowTrendItem
)
from app.routers.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/category-spending", response_model=List[CategorySpendingItem])
def get_category_spending(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    month: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if month and not from_date:
        try:
            y, m = map(int, month.split("-"))
            from_date = date(y, m, 1)
            if m == 12:
                to_date = date(y + 1, 1, 1) - timedelta(days=1)
            else:
                to_date = date(y, m + 1, 1) - timedelta(days=1)
        except Exception:
            pass

    if not from_date:
        today = date.today()
        from_date = date(today.year, today.month, 1)
    if not to_date:
        to_date = date.today()

    # Query expense and bill transactions grouped by category
    query = db.query(
        Transaction.category_id,
        func.sum(Transaction.amount).label("total_amount"),
        func.count(Transaction.id).label("count")
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= from_date,
        Transaction.transaction_date <= to_date,
        Transaction.transaction_type.in_(["expense", "bill", "debt"])
    ).group_by(Transaction.category_id)

    raw_data = query.all()
    overall_sum = sum((r.total_amount for r in raw_data), Decimal("0.00"))

    categories = {c.id: c for c in db.query(Category).all()}

    results = []
    for cat_id, amt, count in raw_data:
        cat = categories.get(cat_id)
        name = cat.name if cat else "Uncategorized"
        cat_type = cat.category_type if cat else "expense"
        color = cat.color if cat else "#64748B"
        pct = float((amt / overall_sum) * Decimal("100")) if overall_sum > 0 else 0.0

        results.append(CategorySpendingItem(
            category_id=cat_id,
            category_name=name,
            category_type=cat_type,
            color=color,
            amount=amt,
            percentage=round(pct, 1),
            transaction_count=count
        ))

    results.sort(key=lambda x: x.amount, reverse=True)
    return results

@router.get("/budget-vs-actual", response_model=List[BudgetVsActualItem])
def get_budget_vs_actual(
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

    budgets = db.query(Budget).options(
        joinedload(Budget.category)
    ).filter(
        Budget.user_id == current_user.id,
        Budget.period_start <= m_end,
        Budget.period_end >= m_start
    ).all()

    items = []
    for b in budgets:
        # Sum actual spent
        query = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= b.period_start,
            Transaction.transaction_date <= b.period_end,
            Transaction.transaction_type.in_(["expense", "bill"])
        )
        if b.category_id:
            query = query.filter(Transaction.category_id == b.category_id)

        spent = query.scalar() or Decimal("0.00")
        limit = b.limit_amount
        pct = float((spent / limit) * Decimal("100")) if limit > 0 else 0.0

        if pct >= 100:
            status_str = "exceeded"
        elif pct >= (b.alert_threshold_pct or 80):
            status_str = "warning"
        else:
            status_str = "normal"

        items.append(BudgetVsActualItem(
            category_id=b.category_id,
            category_name=b.category.name if b.category else "Overall",
            budget_limit=limit,
            actual_spent=spent,
            percentage_used=round(pct, 1),
            remaining=max(Decimal("0.00"), limit - spent),
            status=status_str
        ))

    items.sort(key=lambda x: x.actual_spent, reverse=True)
    return items

@router.get("/cashflow", response_model=List[CashFlowTrendItem])
def get_cashflow_trend(
    months: int = Query(6, ge=1, le=24),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    results = []

    for i in range(months - 1, -1, -1):
        # Calculate month date
        total_m = (today.year * 12 + today.month - 1) - i
        y = total_m // 12
        m = (total_m % 12) + 1

        m_start = date(y, m, 1)
        if m == 12:
            m_end = date(y + 1, 1, 1) - timedelta(days=1)
        else:
            m_end = date(y, m + 1, 1) - timedelta(days=1)

        m_label = f"{y:04d}-{m:02d}"

        def get_m_sum(types: list) -> Decimal:
            val = db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == current_user.id,
                Transaction.transaction_date >= m_start,
                Transaction.transaction_date <= m_end,
                Transaction.transaction_type.in_(types)
            ).scalar()
            return val or Decimal("0.00")

        inc = get_m_sum(["income"])
        exp = get_m_sum(["expense"])
        bll = get_m_sum(["bill"])
        sav = get_m_sum(["savings"])
        outflows = exp + bll
        net = inc - outflows - sav

        results.append(CashFlowTrendItem(
            month=m_label,
            income=inc,
            expenses=exp,
            bills=bll,
            savings=sav,
            net_savings=net
        ))

    return results
