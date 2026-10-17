from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.models.models import User, Bill, Category, Transaction
from app.schemas.schemas import BillCreate, BillUpdate, BillOut
from app.routers.deps import get_current_user
from app.services.alert_service import check_upcoming_bill_alerts

router = APIRouter(prefix="/bills", tags=["Bills"])

@router.get("", response_model=List[BillOut])
def get_bills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check and trigger bill due alerts
    check_upcoming_bill_alerts(current_user.id, db)

    bills = db.query(Bill).options(
        joinedload(Bill.category)
    ).filter(
        Bill.user_id == current_user.id
    ).order_by(Bill.due_date.asc()).all()

    return bills

@router.post("", response_model=BillOut, status_code=status.HTTP_201_CREATED)
def create_bill(
    b_in: BillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = Bill(
        user_id=current_user.id,
        category_id=b_in.category_id,
        account_id=b_in.account_id,
        name=b_in.name,
        expected_amount=b_in.expected_amount,
        due_date=b_in.due_date,
        recurrence=b_in.recurrence,
        status=b_in.status
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)
    check_upcoming_bill_alerts(current_user.id, db)
    return bill

@router.patch("/{bill_id}", response_model=BillOut)
def update_bill(
    bill_id: str,
    b_in: BillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = db.query(Bill).filter(
        Bill.id == bill_id,
        Bill.user_id == current_user.id
    ).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    update_data = b_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(bill, key, value)

    db.commit()
    db.refresh(bill)
    return bill

@router.post("/{bill_id}/pay", response_model=BillOut)
def pay_bill(
    bill_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = db.query(Bill).filter(
        Bill.id == bill_id,
        Bill.user_id == current_user.id
    ).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    bill.status = "paid"

    # Create transaction for this bill payment
    tx = Transaction(
        user_id=current_user.id,
        account_id=bill.account_id,
        category_id=bill.category_id,
        transaction_type="bill",
        amount=bill.expected_amount,
        currency=current_user.default_currency,
        transaction_date=date.today(),
        merchant=bill.name,
        note=f"Payment for {bill.name}",
        source="recurring"
    )
    db.add(tx)
    db.commit()
    db.refresh(bill)
    return bill

@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bill(
    bill_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = db.query(Bill).filter(
        Bill.id == bill_id,
        Bill.user_id == current_user.id
    ).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    db.delete(bill)
    db.commit()
    return None
