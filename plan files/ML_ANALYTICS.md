# ML & Analytics Design

## 1. Design philosophy
Start with interpretable baselines. Personal financial data is often sparse, seasonal, and irregular; complex ML can look impressive while producing unreliable estimates. Show method, historical window, and uncertainty where it can be justified.

## 2. Automatic expense categorization
### Inputs
- Merchant name
- User-entered description/note
- Amount bucket (optional and carefully handled)
- Transaction source

### MVP approach
1. Normalize merchant and note text.
2. Apply transparent merchant/category rules first.
3. If rules do not match, use a text classifier such as TF-IDF + Logistic Regression when enough labeled examples exist.
4. Return top category, confidence, and model version.
5. If confidence is below a threshold, ask the user instead of silently assigning a category.
6. Store user corrections as feedback only with appropriate privacy controls.

### Evaluation
- Train/test split by time or transaction group to avoid leakage.
- Track macro-F1 and per-category precision/recall.
- Do not train on another user's private records without explicit consent and suitable safeguards.

## 3. Expense forecasting
### Baseline
Aggregate expenses by month, optionally by category. Compare:
- Last-month value
- Three-month rolling average
- Seasonal-naive forecast where sufficient history exists
- A simple regression/time-series model only if it beats the baseline on held-out months

### Metrics
- MAE: mean absolute error.
- WAPE: sum absolute errors / sum actual values, where denominator is nonzero.
- Compare against the simple baseline over rolling-origin validation.

### Cold-start behavior
- Fewer than 3 months: show a rough average and low-data warning.
- 3–5 months: rolling average with a caveat.
- 6+ months: evaluate trend/seasonality; still prefer the simplest model that performs well.
- Never fabricate confidence intervals if the model does not provide a defensible interval.

## 4. Budget recommendations
1. Calculate recent average category spending.
2. Compare it with current budget and available monthly income.
3. Suggest a budget range, not a command.
4. Flag recurring essentials separately from discretionary spending.
5. Explain recommendation: e.g., “Your grocery spend averaged ₹4,200 over the last 3 months.”
6. Allow the user to accept, edit, or dismiss.

## 5. Overspending alerts
- Trigger at a configurable threshold such as 80%, then at 100%.
- Trigger only on threshold crossing to avoid duplicate alerts.
- Optional anomaly detection compares current category spend with a robust recent baseline.
- Anomaly alerts must be phrased as “unusual compared with your recent pattern,” not as proof of fraud.

## 6. Dashboard analytics
- Cash-flow trend by month.
- Expense allocation by category.
- Budget vs actual.
- Bills due soon.
- Savings progress.
- Forecast vs actual comparison after the month closes.

## 7. Privacy and responsible presentation
- Use only the minimum fields needed.
- Provide delete/export controls.
- Avoid financial-health judgments or shaming language.
- Forecasts are estimates, not guarantees or professional financial advice.
