import re
from typing import Optional, Tuple, List, Dict
from sqlalchemy.orm import Session
from app.models.models import Category, Transaction

RULE_PATTERNS = {
    # Groceries
    "Groceries": [
        r"grocer", r"supermarket", r"walmart", r"target", r"whole foods", r"trader joe",
        r"bigbasket", r"blinkit", r"zepto", r"instamart", r"dmart", r"spencer", r"market",
        r"provisions", r"vegetables", r"fruits", r"milk", r"dairy"
    ],
    # Dining / Food
    "Food & Dining": [
        r"restaurant", r"cafe", r"coffee", r"starbucks", r"mcdonald", r"burger", r"pizza",
        r"domino", r"subway", r"swiggy", r"zomato", r"doordash", r"uber eats", r"diner",
        r"bakery", r"bistro", r"bar", r"pub", r"lunch", r"dinner", r"breakfast"
    ],
    # Utilities & Bills
    "Bills & Utilities": [
        r"electric", r"power", r"water", r"gas", r"broadband", r"wifi", r"internet",
        r"airtel", r"jio", r"vodafone", r"verizon", r"at&t", r"utility", r"phone bill",
        r"recharge", r"mobile bill", r"dth"
    ],
    # Housing & Rent
    "Rent & Housing": [
        r"rent", r"landlord", r"apartment", r"maintenance", r"housing", r"lease", r"mortgage"
    ],
    # Transportation
    "Transportation": [
        r"uber", r"ola", r"lyft", r"taxi", r"cab", r"metro", r"subway", r"train", r"bus",
        r"fuel", r"petrol", r"diesel", r"gas station", r"shell", r"parking", r"toll", r"auto"
    ],
    # Shopping
    "Shopping": [
        r"amazon", r"flipkart", r"myntra", r"ebay", r"clothing", r"apparel", r"shoes",
        r"electronics", r"mall", r"zara", r"h&m", r"nike", r"store"
    ],
    # Entertainment & Subscriptions
    "Entertainment": [
        r"netflix", r"spotify", r"prime", r"hotstar", r"disney", r"cinema", r"movie",
        r"theater", r"game", r"steam", r"playstation", r"concert", r"youtube"
    ],
    # Healthcare
    "Healthcare": [
        r"pharmacy", r"chemist", r"apollo", r"medplus", r"hospital", r"clinic", r"doctor",
        r"dentist", r"medicine", r"lab", r"diagnostics", r"health"
    ],
    # Education
    "Education": [
        r"school", r"college", r"university", r"course", r"udemy", r"coursera", r"tuition",
        r"books", r"fees", r"exam"
    ],
    # Salary / Income
    "Salary": [
        r"payroll", r"salary", r"employer", r"stipend", r"bonus", r"wages", r"direct dep"
    ],
    # Investments / Savings
    "Savings & Investments": [
        r"mutual fund", r"sip", r"zerodha", r"groww", r"fixed deposit", r"savings",
        r"investment", r"shares", r"stock", r"crypto", r"etf"
    ],
    # Debt / Loans
    "Debt Payments": [
        r"emi", r"loan", r"credit card payment", r"mortgage payment", r"debt", r"interest"
    ]
}

def normalize_text(text: Optional[str]) -> str:
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return " ".join(text.split())

def suggest_category_from_rules(
    merchant: Optional[str],
    note: Optional[str],
    db_categories: List[Category]
) -> Optional[Tuple[Category, float, str]]:
    combined = f"{normalize_text(merchant)} {normalize_text(note)}"
    if not combined.strip():
        return None

    cat_map = {c.name.lower(): c for c in db_categories}

    for category_key, patterns in RULE_PATTERNS.items():
        for pattern in patterns:
            if re.search(r"\b" + pattern, combined):
                # Try to find matching category in DB
                # Exact or substring match
                for cat in db_categories:
                    if (
                        category_key.lower() in cat.name.lower()
                        or cat.name.lower() in category_key.lower()
                    ):
                        confidence = 0.92 if merchant and re.search(r"\b" + pattern, normalize_text(merchant)) else 0.85
                        return cat, confidence, f"Rule match: '{pattern}'"

    return None

def suggest_category(
    merchant: Optional[str],
    note: Optional[str],
    user_id: str,
    db: Session
) -> Dict[str, any]:
    # Fetch available categories for user + system
    categories = db.query(Category).filter(
        (Category.user_id == user_id) | (Category.is_system == True)
    ).all()

    # 1. First, check rule patterns
    rule_match = suggest_category_from_rules(merchant, note, categories)
    if rule_match:
        cat, conf, rule_name = rule_match
        return {
            "suggested_category_id": cat.id,
            "suggested_category_name": cat.name,
            "confidence": conf,
            "model_version": "rules_v1.2",
            "matched_rule": rule_name
        }

    # 2. Check user's own past identical merchant entries
    if merchant:
        norm_merch = merchant.strip().lower()
        past_tx = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.merchant.ilike(f"%{norm_merch}%"),
            Transaction.category_id != None
        ).order_by(Transaction.created_at.desc()).first()

        if past_tx and past_tx.category:
            return {
                "suggested_category_id": past_tx.category.id,
                "suggested_category_name": past_tx.category.name,
                "confidence": 0.88,
                "model_version": "historical_frequency_v1",
                "matched_rule": f"Matched previous merchant history for '{past_tx.merchant}'"
            }

    # 3. Text classification ML (TF-IDF + Logistic Regression fallback) if sufficient labeled data
    user_txs = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.category_id != None
    ).limit(300).all()

    labeled_data = []
    labels = []
    for tx in user_txs:
        text = f"{tx.merchant or ''} {tx.note or ''}".strip()
        if text and tx.category_id:
            labeled_data.append(text)
            labels.append(tx.category_id)

    unique_labels = set(labels)
    if len(labeled_data) >= 8 and len(unique_labels) >= 2:
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.linear_model import LogisticRegression

            vec = TfidfVectorizer(ngram_range=(1, 2), max_features=500)
            X = vec.fit_transform(labeled_data)
            clf = LogisticRegression(max_iter=200)
            clf.fit(X, labels)

            query_text = f"{merchant or ''} {note or ''}".strip()
            if query_text:
                q_vec = vec.transform([query_text])
                probs = clf.predict_proba(q_vec)[0]
                max_prob_idx = probs.argmax()
                predicted_cat_id = clf.classes_[max_prob_idx]
                max_prob = float(probs[max_prob_idx])

                if max_prob >= 0.50:
                    matched_cat = next((c for c in categories if c.id == predicted_cat_id), None)
                    if matched_cat:
                        return {
                            "suggested_category_id": matched_cat.id,
                            "suggested_category_name": matched_cat.name,
                            "confidence": round(max_prob, 2),
                            "model_version": "tfidf_logreg_v1",
                            "matched_rule": f"ML model prediction (confidence: {round(max_prob*100)}%)"
                        }
        except Exception:
            pass

    return {
        "suggested_category_id": None,
        "suggested_category_name": None,
        "confidence": 0.0,
        "model_version": "none",
        "matched_rule": None
    }
