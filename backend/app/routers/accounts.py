from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.models import User, Account, Transaction
from app.schemas.schemas import AccountCreate, AccountUpdate, AccountOut
from app.routers.deps import get_current_user

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.get("", response_model=List[AccountOut])
def get_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    accounts = db.query(Account).filter(
        Account.user_id == current_user.id,
        Account.is_archived == False
    ).order_by(Account.created_at.asc()).all()

    results = []
    for acc in accounts:
        # Calculate current balance from transactions
        income_sum = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.account_id == acc.id,
            Transaction.transaction_type == "income"
        ).scalar() or Decimal("0.00")

        outflow_sum = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.account_id == acc.id,
            Transaction.transaction_type.in_(["expense", "bill", "debt", "savings"])
        ).scalar() or Decimal("0.00")

        bal = acc.opening_balance + income_sum - outflow_sum
        acc_dict = {
            "id": acc.id,
            "user_id": acc.user_id,
            "name": acc.name,
            "account_type": acc.account_type,
            "currency": acc.currency,
            "opening_balance": acc.opening_balance,
            "is_archived": acc.is_archived,
            "created_at": acc.created_at,
            "current_balance": bal
        }
        results.append(acc_dict)

    return results

@router.post("", response_model=AccountOut, status_code=status.HTTP_201_CREATED)
def create_account(
    acc_in: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    account = Account(
        user_id=current_user.id,
        name=acc_in.name,
        account_type=acc_in.account_type,
        currency=acc_in.currency or current_user.default_currency,
        opening_balance=acc_in.opening_balance
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    account.current_balance = account.opening_balance
    return account

@router.patch("/{account_id}", response_model=AccountOut)
def update_account(
    account_id: str,
    acc_in: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    update_data = acc_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(account, key, value)

    db.commit()
    db.refresh(account)
    return account

@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    # Set is_archived instead of hard delete to preserve transaction links
    account.is_archived = True
    db.commit()
    return None
