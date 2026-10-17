from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Alert, Budget, Transaction, Bill, Category

def evaluate_budget_alerts(user_id: str, db: Session, target_date: date):
    # Find budgets covering this transaction date
    budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.period_start <= target_date,
        Budget.period_end >= target_date
    ).all()

    for budget in budgets:
        # Calculate actual spend for this budget period
        query = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_date >= budget.period_start,
            Transaction.transaction_date <= budget.period_end,
            Transaction.transaction_type.in_(["expense", "bill"])
        )
        if budget.category_id:
            query = query.filter(Transaction.category_id == budget.category_id)

        spent = query.scalar() or Decimal("0.00")
        limit = budget.limit_amount
        if limit <= 0:
            continue

        pct = (spent / limit) * Decimal("100")
        period_str = budget.period_start.strftime("%Y-%m")
        cat_name = budget.category.name if budget.category else "Overall Budget"

        # Check threshold (e.g. 80%)
        thresh = budget.alert_threshold_pct or 80
        if pct >= thresh and pct < 100:
            dedupe_key = f"{user_id}:budget:{budget.id}:{thresh}:{period_str}"
            existing = db.query(Alert).filter(Alert.dedupe_key == dedupe_key).first()
            if not existing:
                alert = Alert(
                    user_id=user_id,
                    budget_id=budget.id,
                    alert_type="budget_threshold",
                    title=f"Approaching Budget Limit: {cat_name}",
                    message=f"You have used {pct:.1f}% (₹{spent:,.2f} of ₹{limit:,.2f}) of your {cat_name} budget for {period_str}.",
                    severity="warning",
                    dedupe_key=dedupe_key,
                    is_read=False
                )
                db.add(alert)

        # Check exceeded (100%+)
        if pct >= 100:
            dedupe_key = f"{user_id}:budget:{budget.id}:100:{period_str}"
            existing = db.query(Alert).filter(Alert.dedupe_key == dedupe_key).first()
            if not existing:
                alert = Alert(
                    user_id=user_id,
                    budget_id=budget.id,
                    alert_type="budget_exceeded",
                    title=f"Budget Exceeded: {cat_name}",
                    message=f"Alert: You have reached {pct:.1f}% of your {cat_name} budget (₹{spent:,.2f} of ₹{limit:,.2f}).",
                    severity="critical",
                    dedupe_key=dedupe_key,
                    is_read=False
                )
                db.add(alert)

    db.commit()

def check_upcoming_bill_alerts(user_id: str, db: Session):
    today = date.today()
    in_three_days = today + timedelta(days=3)

    bills = db.query(Bill).filter(
        Bill.user_id == user_id,
        Bill.status == "upcoming",
        Bill.due_date >= today,
        Bill.due_date <= in_three_days
    ).all()

    for b in bills:
        dedupe_key = f"{user_id}:bill:{b.id}:{b.due_date.isoformat()}"
        existing = db.query(Alert).filter(Alert.dedupe_key == dedupe_key).first()
        if not existing:
            days_left = (b.due_date - today).days
            days_text = "today" if days_left == 0 else ("tomorrow" if days_left == 1 else f"in {days_left} days")
            alert = Alert(
                user_id=user_id,
                alert_type="bill_due",
                title=f"Bill Due Soon: {b.name}",
                message=f"Your bill '{b.name}' of ₹{b.expected_amount:,.2f} is due {days_text} ({b.due_date.strftime('%b %d, %Y')}).",
                severity="info" if days_left > 1 else "warning",
                dedupe_key=dedupe_key,
                is_read=False
            )
            db.add(alert)

    db.commit()
