from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import (
    ForecastOut,
    BudgetRecommendationOut,
    CategorySuggestionRequest,
    CategorySuggestionResponse
)
from app.routers.deps import get_current_user
from app.ml.forecaster import calculate_monthly_expense_forecast, generate_budget_recommendations
from app.ml.categorizer import suggest_category

router = APIRouter(tags=["Forecasts & ML"])

@router.get("/forecast/monthly-expense", response_model=ForecastOut)
def get_monthly_expense_forecast(
    horizon: int = Query(1, ge=1, le=12),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    total_m = (today.year * 12 + today.month - 1) + horizon
    target_y = total_m // 12
    target_m = (total_m % 12) + 1
    target_date = date(target_y, target_m, 1)

    return calculate_monthly_expense_forecast(current_user.id, db, target_date)

@router.get("/recommendations/budget", response_model=List[BudgetRecommendationOut])
def get_budget_recommendations(
    month: Optional[str] = Query(None, description="Target month in YYYY-MM"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return generate_budget_recommendations(current_user.id, db, month)

@router.post("/categorization/suggest", response_model=CategorySuggestionResponse)
def get_category_suggestion(
    req: CategorySuggestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return suggest_category(req.merchant, req.note, current_user.id, db)
