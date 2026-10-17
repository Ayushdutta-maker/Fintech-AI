# UI/UX Design Specification

## 1. Visual direction
Use the supplied reference as inspiration: clean white canvas, strong forest-green typography and KPI band, rounded cards, compact charts, and clear category colors. The design should feel trustworthy and calm rather than like a trading terminal.

## 2. Color tokens
| Token | Hex | Usage |
|---|---|---|
| `--green-900` | `#00563A` | Dark green text / footer |
| `--green-800` | `#006B45` | Primary brand |
| `--green-600` | `#078A5A` | Main KPI band / active states |
| `--green-100` | `#E8F5EE` | Soft green surfaces |
| `--canvas` | `#F7F9F7` | Page background |
| `--surface` | `#FFFFFF` | Cards and dialogs |
| `--text` | `#111827` | Primary text |
| `--muted` | `#64748B` | Secondary text |
| `--border` | `#E5EAE7` | Dividers and card borders |
| `--expense` | `#E53935` | Expense indicators |
| `--bill` | `#16A6B6` | Bill indicators |
| `--savings` | `#2563EB` | Savings indicators |
| `--debt` | `#7C3AED` | Debt indicators |
| `--warning` | `#F59E0B` | Warning states |

## 3. Typography and spacing
- Use Inter, system-ui, or a similar sans-serif.
- Page title: 28–32 px desktop; 24 px mobile.
- KPI value: 24–30 px desktop; 20–24 px mobile.
- Body: 14–16 px; metadata 12–13 px.
- 8 px spacing base; cards use 16–20 px padding.
- Card radius: 12–16 px; buttons: 8–10 px radius.
- Keep shadows subtle; use borders for most separation.

## 4. Dashboard layout
### Header row
- Left: app icon and “Personal Finance Tracker”.
- Right: year selector, month selector, currency selector, Export CSV button, profile menu.
- Mobile: collapse selectors into a filter menu and keep Add Transaction visible.

### Cash-flow summary
A full-width green band with four values:
- Total income
- Total outflows
- Balance left
- Budget used (%)

Use white text and thin translucent separators.

### KPI cards
Six responsive cards:
1. Total income
2. Total expenses
3. Total bills
4. Debt payments
5. Total savings
6. Balance left

Each card has a small colored icon tile, label, value, and short contextual chip.

### Analytics row
- Balance overview: donut chart for outflow allocation and remaining balance.
- Budget vs actual: grouped bars by category or transaction type.
- Category spending: horizontal bar chart ranked by spend.

### Savings / budget progress
Compact progress rows for categories such as Rent, School Fee, Grocery, Electricity Bill, and Mobile Bill. Each row displays budget, actual, remaining amount, and percentage used.

### Quick actions
- Add income
- Add expense
- Add bill
- Create budget
- View insights
- Export data

## 5. Component inventory
- `AppShell`, `Sidebar`, `Topbar`
- `MonthYearFilter`, `CurrencySelect`
- `CashFlowSummary`
- `KpiCard`
- `TransactionTable`, `TransactionForm`, `TransactionFilters`
- `BudgetCard`, `BudgetProgress`
- `CategoryBreakdownChart`, `BudgetActualChart`, `CashFlowDonut`
- `ForecastPanel`, `RecommendationCard`, `AlertBanner`
- `EmptyState`, `LoadingSkeleton`, `ErrorNotice`
- `ConfirmDialog`, `Toast`

## 6. Responsive behavior
- Desktop ≥ 1200 px: sidebar + three analytics columns.
- Tablet 768–1199 px: collapsible sidebar + two-column cards.
- Mobile < 768 px: single-column cards, charts stacked, transaction list becomes compact rows.
- Charts must have text summaries or accessible labels; never rely on color alone.

## 7. Interaction principles
- Use one primary CTA per page.
- Confirm destructive actions.
- Inline validation should explain how to fix an issue.
- Show category confidence only when a model actually supplies it.
- Forecasts must show date range, method, and a caveat.
- Use tooltips for unfamiliar financial terms.
- Respect reduced-motion preferences.

## 8. Suggested CSS variables
```css
:root {
  --green-900: #00563A;
  --green-800: #006B45;
  --green-600: #078A5A;
  --green-100: #E8F5EE;
  --canvas: #F7F9F7;
  --surface: #FFFFFF;
  --text: #111827;
  --muted: #64748B;
  --border: #E5EAE7;
  --expense: #E53935;
  --bill: #16A6B6;
  --savings: #2563EB;
  --debt: #7C3AED;
  --warning: #F59E0B;
}
```
