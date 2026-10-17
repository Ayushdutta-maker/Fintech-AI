import csv
import io
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.db.session import get_db
from app.models.models import User, Transaction, Category, Account
from app.schemas.schemas import (
    TransactionCreate,
    TransactionUpdate,
    TransactionOut,
    TransactionListResponse,
    CSVImportResult,
)
from app.routers.deps import get_current_user
from app.services.alert_service import evaluate_budget_alerts
from app.ml.categorizer import suggest_category

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=TransactionListResponse)
def list_transactions(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    transaction_type: Optional[str] = Query(None, alias="type"),
    category_id: Optional[str] = None,
    account_id: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).options(
        joinedload(Transaction.category),
        joinedload(Transaction.account)
    ).filter(Transaction.user_id == current_user.id)

    if from_date:
        query = query.filter(Transaction.transaction_date >= from_date)
    if to_date:
        query = query.filter(Transaction.transaction_date <= to_date)
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (Transaction.merchant.ilike(search_filter)) |
            (Transaction.note.ilike(search_filter))
        )

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    items = query.order_by(
        Transaction.transaction_date.desc(),
        Transaction.created_at.desc()
    ).offset((page - 1) * page_size).limit(page_size).all()

    # Format account name
    out_items = []
    for t in items:
        out = TransactionOut.model_validate(t)
        if t.account:
            out.account_name = t.account.name
        out_items.append(out)

    return {
        "items": out_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    tx_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate account ownership if provided
    if tx_in.account_id:
        account = db.query(Account).filter(
            Account.id == tx_in.account_id,
            Account.user_id == current_user.id
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found or access denied")

    # If category_id is missing, try auto-categorization
    cat_id = tx_in.category_id
    if not cat_id and (tx_in.merchant or tx_in.note):
        sugg = suggest_category(tx_in.merchant, tx_in.note, current_user.id, db)
        if sugg.get("confidence", 0) >= 0.75:
            cat_id = sugg.get("suggested_category_id")

    # Validate category ownership or system category
    if cat_id:
        category = db.query(Category).filter(
            Category.id == cat_id,
            (Category.user_id == current_user.id) | (Category.is_system == True)
        ).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found or invalid")

    tx = Transaction(
        user_id=current_user.id,
        account_id=tx_in.account_id,
        category_id=cat_id,
        transaction_type=tx_in.transaction_type,
        amount=tx_in.amount,
        currency=tx_in.currency or current_user.default_currency,
        transaction_date=tx_in.transaction_date,
        merchant=tx_in.merchant,
        note=tx_in.note,
        source=tx_in.source or "manual"
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    # Evaluate budget thresholds for overspending alerts
    if tx.transaction_type in ["expense", "bill"]:
        evaluate_budget_alerts(current_user.id, db, tx.transaction_date)

    out = TransactionOut.model_validate(tx)
    if tx.account:
        out.account_name = tx.account.name
    return out

@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).options(
        joinedload(Transaction.category),
        joinedload(Transaction.account)
    ).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    out = TransactionOut.model_validate(tx)
    if tx.account:
        out.account_name = tx.account.name
    return out

@router.patch("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: str,
    tx_in: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_data = tx_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tx, key, value)

    tx.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tx)

    if tx.transaction_type in ["expense", "bill"]:
        evaluate_budget_alerts(current_user.id, db, tx.transaction_date)

    out = TransactionOut.model_validate(tx)
    if tx.account:
        out.account_name = tx.account.name
    return out

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(tx)
    db.commit()
    return None

@router.get("/export/csv")
def export_csv(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    transaction_type: Optional[str] = Query(None, alias="type"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).options(
        joinedload(Transaction.category),
        joinedload(Transaction.account)
    ).filter(Transaction.user_id == current_user.id)

    if from_date:
        query = query.filter(Transaction.transaction_date >= from_date)
    if to_date:
        query = query.filter(Transaction.transaction_date <= to_date)
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)

    transactions = query.order_by(Transaction.transaction_date.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    writer.writerow([
        "Transaction Date",
        "Type",
        "Category",
        "Amount",
        "Currency",
        "Merchant",
        "Note",
        "Account",
        "Source"
    ])

    for t in transactions:
        writer.writerow([
            t.transaction_date.isoformat(),
            t.transaction_type,
            t.category.name if t.category else "Uncategorized",
            f"{t.amount:.2f}",
            t.currency,
            t.merchant or "",
            t.note or "",
            t.account.name if t.account else "",
            t.source
        ])

    csv_data = output.getvalue()
    filename = f"transactions_{current_user.display_name.lower().replace(' ', '_')}_{date.today().isoformat()}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.post("/import/csv", response_model=CSVImportResult)
async def import_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    # Normalize header names
    fieldnames = reader.fieldnames or []
    norm_map = {}
    for f in fieldnames:
        clean = f.strip().lower().replace(" ", "_")
        norm_map[clean] = f

    # Fetch available categories and accounts
    categories = db.query(Category).filter(
        (Category.user_id == current_user.id) | (Category.is_system == True)
    ).all()
    cat_lookup = {c.name.strip().lower(): c for c in categories}

    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    acc_lookup = {a.name.strip().lower(): a for a in accounts}
    default_acc = accounts[0] if accounts else None

    imported = 0
    duplicates = 0
    errors = []
    total_rows = 0

    valid_types = {"income", "expense", "bill", "savings", "debt", "transfer"}

    for idx, row in enumerate(reader, start=1):
        total_rows += 1
        try:
            # Extract row fields flexibly
            raw_date = row.get(norm_map.get("transaction_date", "")) or row.get(norm_map.get("date", ""))
            raw_amt = row.get(norm_map.get("amount", ""))
            raw_type = row.get(norm_map.get("type", "")) or row.get(norm_map.get("transaction_type", "")) or "expense"
            raw_cat = row.get(norm_map.get("category", "")) or row.get(norm_map.get("category_name", ""))
            raw_merchant = row.get(norm_map.get("merchant", "")) or row.get(norm_map.get("payee", ""))
            raw_note = row.get(norm_map.get("note", "")) or row.get(norm_map.get("description", ""))

            if not raw_date or not raw_amt:
                errors.append(f"Row {idx}: missing required date or amount")
                continue

            # Parse date
            tx_date = None
            for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
                try:
                    tx_date = datetime.strptime(raw_date.strip(), fmt).date()
                    break
                except ValueError:
                    pass

            if not tx_date:
                errors.append(f"Row {idx}: invalid date format '{raw_date}'")
                continue

            # Parse amount
            cleaned_amt = raw_amt.replace(",", "").replace("$", "").replace("₹", "").strip()
            amount = Decimal(cleaned_amt)
            if amount <= 0:
                errors.append(f"Row {idx}: amount must be positive")
                continue

            tx_type = raw_type.strip().lower()
            if tx_type not in valid_types:
                tx_type = "expense"

            # Match category or auto-suggest
            matched_cat_id = None
            if raw_cat and raw_cat.strip().lower() in cat_lookup:
                matched_cat_id = cat_lookup[raw_cat.strip().lower()].id
            else:
                sugg = suggest_category(raw_merchant, raw_note, current_user.id, db)
                matched_cat_id = sugg.get("suggested_category_id")

            # Check duplicate (same user, date, amount, merchant)
            dup = db.query(Transaction).filter(
                Transaction.user_id == current_user.id,
                Transaction.transaction_date == tx_date,
                Transaction.amount == amount,
                Transaction.merchant == (raw_merchant.strip() if raw_merchant else None)
            ).first()

            if dup:
                duplicates += 1
                continue

            tx = Transaction(
                user_id=current_user.id,
                account_id=default_acc.id if default_acc else None,
                category_id=matched_cat_id,
                transaction_type=tx_type,
                amount=amount,
                currency=current_user.default_currency,
                transaction_date=tx_date,
                merchant=raw_merchant.strip() if raw_merchant else None,
                note=raw_note.strip() if raw_note else None,
                source="csv"
            )
            db.add(tx)
            imported += 1

        except Exception as e:
            errors.append(f"Row {idx}: {str(e)}")

    db.commit()

    return {
        "total_rows": total_rows,
        "imported_count": imported,
        "duplicate_count": duplicates,
        "errors": errors[:10] # cap error list at 10 items
    }
