from datetime import date, datetime, timedelta
from typing import Dict, Any, List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.models import Transaction, Category, Budget

def calculate_monthly_expense_forecast(user_id: str, db: Session, target_date: Optional[date] = None) -> Dict[str, Any]:
    if not target_date:
        today = date.today()
        # default target next month
        if today.month == 12:
            target_date = date(today.year + 1, 1, 1)
        else:
            target_date = date(today.year, today.month + 1, 1)

    target_period_str = target_date.strftime("%Y-%m")

    # Fetch all expense transactions for the user
    # Expense types: expense, bill
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type.in_(["expense", "bill"])
    ).order_by(Transaction.transaction_date.asc()).all()

    if not transactions:
        return {
            "target_period": target_period_str,
            "predicted_expense": Decimal("0.00"),
            "currency": "INR",
            "method": "zero_data_fallback",
            "history_months": 0,
            "confidence_label": "low",
            "lower_bound": Decimal("0.00"),
            "upper_bound": Decimal("0.00"),
            "explanation": "No prior expense transactions recorded. Add transactions to generate personalized expense predictions.",
            "historical_points": [],
            "limitations": "Estimates require at least 1-3 months of transaction history."
        }

    # Group by year-month
    monthly_totals: Dict[str, float] = {}
    currency = transactions[0].currency or "INR"

    for tx in transactions:
        m_str = tx.transaction_date.strftime("%Y-%m")
        amt = float(tx.amount)
        monthly_totals[m_str] = monthly_totals.get(m_str, 0.0) + amt

    sorted_months = sorted(monthly_totals.keys())
    historical_points = [{"month": m, "amount": round(monthly_totals[m], 2)} for m in sorted_months]
    history_count = len(sorted_months)

    if history_count == 1:
        single_amt = monthly_totals[sorted_months[0]]
        predicted = round(single_amt, 2)
        return {
            "target_period": target_period_str,
            "predicted_expense": Decimal(f"{predicted:.2f}"),
            "currency": currency,
            "method": "single_month_baseline",
            "history_months": 1,
            "confidence_label": "low",
            "lower_bound": Decimal(f"{round(predicted * 0.8, 2):.2f}"),
            "upper_bound": Decimal(f"{round(predicted * 1.25, 2):.2f}"),
            "explanation": f"Based on 1 month of recorded spending ({sorted_months[0]}). More data will improve forecasting precision.",
            "historical_points": historical_points,
            "limitations": "Preliminary estimate; does not account for seasonality or periodic expenses."
        }

    elif history_count < 4:
        # 2 or 3 months: rolling average
        recent_values = [monthly_totals[m] for m in sorted_months[-3:]]
        avg_val = sum(recent_values) / len(recent_values)
        predicted = round(avg_val, 2)
        lower = round(predicted * 0.85, 2)
        upper = round(predicted * 1.18, 2)

        return {
            "target_period": target_period_str,
            "predicted_expense": Decimal(f"{predicted:.2f}"),
            "currency": currency,
            "method": f"{len(recent_values)}_month_rolling_average",
            "history_months": history_count,
            "confidence_label": "medium",
            "lower_bound": Decimal(f"{lower:.2f}"),
            "upper_bound": Decimal(f"{upper:.2f}"),
            "explanation": f"Estimated using a {len(recent_values)}-month rolling average (mean spend: {currency} {predicted:,.2f}).",
            "historical_points": historical_points,
            "limitations": "Estimates based on rolling average without full year seasonal adjustment."
        }

    else:
        # >= 4 months: try linear trend regression with scikit-learn
        try:
            import numpy as np
            from sklearn.linear_model import LinearRegression

            recent_m = sorted_months[-6:] # last 6 months
            y = np.array([monthly_totals[m] for m in recent_m])
            X = np.arange(len(y)).reshape(-1, 1)

            model = LinearRegression()
            model.fit(X, y)

            next_x = np.array([[len(y)]])
            pred_reg = float(model.predict(next_x)[0])

            # Blend with 3-month rolling average to prevent wild extrapolation
            roll_3 = sum(y[-3:]) / 3.0
            blended = 0.6 * roll_3 + 0.4 * pred_reg
            predicted = max(0.0, round(blended, 2))

            # Standard deviation for bounds
            residuals = y - model.predict(X)
            std_dev = float(np.std(residuals)) if len(residuals) > 1 else predicted * 0.1
            lower = max(0.0, round(predicted - 1.28 * std_dev, 2)) # ~80% prediction interval
            upper = round(predicted + 1.28 * std_dev, 2)

            return {
                "target_period": target_period_str,
                "predicted_expense": Decimal(f"{predicted:.2f}"),
                "currency": currency,
                "method": "weighted_trend_and_rolling_average",
                "history_months": history_count,
                "confidence_label": "high",
                "lower_bound": Decimal(f"{lower:.2f}"),
                "upper_bound": Decimal(f"{upper:.2f}"),
                "explanation": f"Forecasted combining recent 6-month momentum and 3-month rolling average across {history_count} months.",
                "historical_points": historical_points,
                "limitations": "Unplanned one-off emergencies or major seasonal expenditures can alter actual totals."
            }
        except Exception:
            # Fallback to rolling average
            recent_values = [monthly_totals[m] for m in sorted_months[-3:]]
            avg_val = sum(recent_values) / len(recent_values)
            predicted = round(avg_val, 2)
            return {
                "target_period": target_period_str,
                "predicted_expense": Decimal(f"{predicted:.2f}"),
                "currency": currency,
                "method": "3_month_rolling_average",
                "history_months": history_count,
                "confidence_label": "medium",
                "lower_bound": Decimal(f"{round(predicted*0.88, 2):.2f}"),
                "upper_bound": Decimal(f"{round(predicted*1.15, 2):.2f}"),
                "explanation": f"3-month historical rolling average baseline.",
                "historical_points": historical_points,
                "limitations": "Based on historical average."
            }

def generate_budget_recommendations(user_id: str, db: Session, target_month: Optional[str] = None) -> List[Dict[str, Any]]:
    today = date.today()
    if not target_month:
        target_month = today.strftime("%Y-%m")

    # Get last 3 months dates
    start_date = today - timedelta(days=90)

    # Categories that user spent on in past 90 days
    categories = db.query(Category).filter(
        (Category.user_id == user_id) | (Category.is_system == True),
        Category.category_type.in_(["expense", "bill"])
    ).all()

    recommendations = []

    # Get existing budgets for target month
    try:
        y, m = map(int, target_month.split("-"))
        m_start = date(y, m, 1)
        if m == 12:
            m_end = date(y + 1, 1, 1) - timedelta(days=1)
        else:
            m_end = date(y, m + 1, 1) - timedelta(days=1)
    except Exception:
        m_start = date(today.year, today.month, 1)
        m_end = today

    budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.period_start <= m_end,
        Budget.period_end >= m_start
    ).all()
    budget_map = {b.category_id: b.limit_amount for b in budgets if b.category_id}

    for cat in categories:
        # Sum transactions in last 90 days
        tx_sum = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.category_id == cat.id,
            Transaction.transaction_date >= start_date
        ).scalar() or 0

        if tx_sum > 0:
            avg_monthly = float(tx_sum) / 3.0
            current_b = budget_map.get(cat.id)
            current_b_val = float(current_b) if current_b else None

            rec_min = round(avg_monthly * 0.95, -1) # round to nearest 10
            rec_max = round(avg_monthly * 1.10, -1)

            if current_b_val is None:
                urgency = "stable"
                explanation = f"You spent an average of ₹{avg_monthly:,.0f}/mo over the last 3 months. Setting a budget of ₹{rec_max:,.0f} gives comfortable room."
            elif current_b_val < avg_monthly * 0.85:
                urgency = "adjust_up"
                explanation = f"Your current budget (₹{current_b_val:,.0f}) is below your recent monthly average (₹{avg_monthly:,.0f}). Consider adjusting to ₹{rec_max:,.0f}."
            elif current_b_val > avg_monthly * 1.4:
                urgency = "adjust_down"
                explanation = f"Your current budget (₹{current_b_val:,.0f}) is much higher than your actual average spend (₹{avg_monthly:,.0f}). You can safely reallocate ₹{current_b_val - rec_max:,.0f} to savings."
            else:
                urgency = "stable"
                explanation = f"Your current budget (₹{current_b_val:,.0f}) aligns well with your 3-month average spend (₹{avg_monthly:,.0f})."

            recommendations.append({
                "category_id": cat.id,
                "category_name": cat.name,
                "current_budget": current_b,
                "recent_avg_spend": Decimal(f"{avg_monthly:.2f}"),
                "recommended_budget_min": Decimal(f"{rec_min:.2f}"),
                "recommended_budget_max": Decimal(f"{rec_max:.2f}"),
                "explanation": explanation,
                "urgency": urgency
            })

    # Sort so categories needing attention appear first
    urgency_order = {"adjust_up": 0, "adjust_down": 1, "stable": 2}
    recommendations.sort(key=lambda x: (urgency_order.get(x["urgency"], 3), -float(x["recent_avg_spend"])))
    return recommendations
