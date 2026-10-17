from typing import List, Optional
from datetime import date, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.db.session import get_db
from app.models.models import User, Budget, Transaction, Category
from app.schemas.schemas import BudgetCreate, BudgetUpdate, BudgetOut
from app.routers.deps import get_current_user

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("", response_model=List[BudgetOut])
def get_budgets(
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Budget).options(
        joinedload(Budget.category)
    ).filter(Budget.user_id == current_user.id)

    if month:
        try:
            y, m = map(int, month.split("-"))
            m_start = date(y, m, 1)
            if m == 12:
                m_end = date(y + 1, 1, 1) - timedelta(days=1)
            else:
                m_end = date(y, m + 1, 1) - timedelta(days=1)
            query = query.filter(
                Budget.period_start <= m_end,
                Budget.period_end >= m_start
            )
        except Exception:
            pass

    budgets = query.order_by(Budget.created_at.desc()).all()

    results = []
    for b in budgets:
        # Calculate actual spent in this budget period
        tx_query = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= b.period_start,
            Transaction.transaction_date <= b.period_end,
            Transaction.transaction_type.in_(["expense", "bill"])
        )
        if b.category_id:
            tx_query = tx_query.filter(Transaction.category_id == b.category_id)

        spent = tx_query.scalar() or Decimal("0.00")
        limit = b.limit_amount
        pct = float((spent / limit) * Decimal("100")) if limit > 0 else 0.0
        remaining = max(Decimal("0.00"), limit - spent)

        b_out = BudgetOut.model_validate(b)
        b_out.actual_spent = spent
        b_out.remaining_amount = remaining
        b_out.percentage_used = round(pct, 1)
        results.append(b_out)

    return results

@router.post("", response_model=BudgetOut, status_code=status.HTTP_201_CREATED)
def create_budget(
    b_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if b_in.category_id:
        category = db.query(Category).filter(
            Category.id == b_in.category_id,
            (Category.user_id == current_user.id) | (Category.is_system == True)
        ).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

    budget = Budget(
        user_id=current_user.id,
        category_id=b_in.category_id,
        period_start=b_in.period_start,
        period_end=b_in.period_end,
        limit_amount=b_in.limit_amount,
        alert_threshold_pct=b_in.alert_threshold_pct
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)

    # Calculate actual spent
    tx_query = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= budget.period_start,
        Transaction.transaction_date <= budget.period_end,
        Transaction.transaction_type.in_(["expense", "bill"])
    )
    if budget.category_id:
        tx_query = tx_query.filter(Transaction.category_id == budget.category_id)

    spent = tx_query.scalar() or Decimal("0.00")
    b_out = BudgetOut.model_validate(budget)
    b_out.actual_spent = spent
    b_out.remaining_amount = max(Decimal("0.00"), budget.limit_amount - spent)
    b_out.percentage_used = round(float((spent / budget.limit_amount) * Decimal("100")), 1) if budget.limit_amount > 0 else 0.0
    return b_out

@router.patch("/{budget_id}", response_model=BudgetOut)
def update_budget(
    budget_id: str,
    b_in: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    update_data = b_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(budget, key, value)

    db.commit()
    db.refresh(budget)

    tx_query = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= budget.period_start,
        Transaction.transaction_date <= budget.period_end,
        Transaction.transaction_type.in_(["expense", "bill"])
    )
    if budget.category_id:
        tx_query = tx_query.filter(Transaction.category_id == budget.category_id)

    spent = tx_query.scalar() or Decimal("0.00")
    b_out = BudgetOut.model_validate(budget)
    b_out.actual_spent = spent
    b_out.remaining_amount = max(Decimal("0.00"), budget.limit_amount - spent)
    b_out.percentage_used = round(float((spent / budget.limit_amount) * Decimal("100")), 1) if budget.limit_amount > 0 else 0.0
    return b_out

@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()
    return None
