from sqlalchemy.orm import Session
from app.models.models import Category

SYSTEM_CATEGORIES = [
    {"name": "Salary", "category_type": "income", "color": "#078A5A", "icon": "briefcase"},
    {"name": "Freelance & Consulting", "category_type": "income", "color": "#006B45", "icon": "laptop"},
    {"name": "Groceries", "category_type": "expense", "color": "#E53935", "icon": "shopping-cart"},
    {"name": "Food & Dining", "category_type": "expense", "color": "#F59E0B", "icon": "coffee"},
    {"name": "Rent & Housing", "category_type": "bill", "color": "#16A6B6", "icon": "home"},
    {"name": "Bills & Utilities", "category_type": "bill", "color": "#16A6B6", "icon": "zap"},
    {"name": "Transportation", "category_type": "expense", "color": "#64748B", "icon": "car"},
    {"name": "Shopping", "category_type": "expense", "color": "#E53935", "icon": "shopping-bag"},
    {"name": "Healthcare", "category_type": "expense", "color": "#E53935", "icon": "heart"},
    {"name": "Entertainment", "category_type": "expense", "color": "#7C3AED", "icon": "film"},
    {"name": "Education", "category_type": "expense", "color": "#2563EB", "icon": "book-open"},
    {"name": "Savings & Investments", "category_type": "savings", "color": "#2563EB", "icon": "trending-up"},
    {"name": "Debt Payments", "category_type": "debt", "color": "#7C3AED", "icon": "credit-card"}
]

def init_system_categories(db: Session):
    for cat_data in SYSTEM_CATEGORIES:
        exists = db.query(Category).filter(
            Category.is_system == True,
            Category.name == cat_data["name"]
        ).first()
        if not exists:
            cat = Category(
                name=cat_data["name"],
                category_type=cat_data["category_type"],
                color=cat_data["color"],
                icon=cat_data["icon"],
                is_system=True
            )
            db.add(cat)
    db.commit()
