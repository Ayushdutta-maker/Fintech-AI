from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Category
from app.schemas.schemas import CategoryCreate, CategoryOut
from app.routers.deps import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryOut])
def get_categories(
    category_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Category).filter(
        (Category.user_id == current_user.id) | (Category.is_system == True)
    )
    if category_type:
        query = query.filter(Category.category_type == category_type)
    return query.order_by(Category.name.asc()).all()

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if duplicate name in user's scope
    existing = db.query(Category).filter(
        ((Category.user_id == current_user.id) | (Category.is_system == True)),
        Category.name.ilike(cat_in.name.strip()),
        Category.category_type == cat_in.category_type
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A category named '{cat_in.name}' already exists for {cat_in.category_type}"
        )

    category = Category(
        user_id=current_user.id,
        name=cat_in.name.strip(),
        category_type=cat_in.category_type,
        color=cat_in.color or "#006B45",
        icon=cat_in.icon or "tag",
        is_system=False
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.is_system:
        raise HTTPException(status_code=403, detail="System default categories cannot be deleted")
    if category.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this category")

    db.delete(category)
    db.commit()
    return None
