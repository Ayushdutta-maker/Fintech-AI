import {
  DashboardSummary,
  CategorySpendingItem,
  BudgetVsActualItem,
  CashFlowTrendItem,
  Account,
  Category,
  Transaction,
  TransactionListResponse,
  Budget,
  Bill,
  Alert,
  ForecastData,
  BudgetRecommendation
} from './api';

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    user_id: 'user-demo',
    name: 'HDFC Salary Account',
    account_type: 'bank',
    currency: 'INR',
    opening_balance: '120000',
    current_balance: '168500',
    is_archived: false,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'acc-2',
    user_id: 'user-demo',
    name: 'ICICI Savings',
    account_type: 'savings',
    currency: 'INR',
    opening_balance: '85000',
    current_balance: '142000',
    is_archived: false,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'acc-3',
    user_id: 'user-demo',
    name: 'Cash Wallet',
    account_type: 'cash',
    currency: 'INR',
    opening_balance: '5000',
    current_balance: '7800',
    is_archived: false,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-income', name: 'Primary Salary', category_type: 'income', color: '#10B981', is_system: true, created_at: '2026-01-01' },
  { id: 'cat-freelance', name: 'Consulting & Freelance', category_type: 'income', color: '#059669', is_system: true, created_at: '2026-01-01' },
  { id: 'cat-groceries', name: 'Groceries & Mart', category_type: 'expense', color: '#EF4444', is_system: true, created_at: '2026-01-01' },
  { id: 'cat-dining', name: 'Food & Dining Out', category_type: 'expense', color: '#F59E0B', is_system: true, created_at: '2026-01-01' },
  { id: 'cat-rent', name: 'Housing & Rent', category_type: 'bill', color: '#06B6D4', is_system: true, created_at: '2026-01-01' },
  { id: 'cat-utilities', name: 'Electricity & Internet', category_type: 'bill', color: '#0284C7', is_system: true, created_at: '2026-01-01' },
  { id: 'cat-transport', name: 'Fuel & Metro', category_type: 'expense', color: '#64748B', is_system: true, created_at: '2026-01-01' },
  { id: 'cat-shopping', name: 'Shopping & Gear', category_type: 'expense', color: '#E11D48', is_system: true, created_at: '2026-01-01' },
  { id: 'cat-savings', name: 'Mutual Funds & SIP', category_type: 'savings', color: '#2563EB', is_system: true, created_at: '2026-01-01' },
  { id: 'cat-debt', name: 'Credit Card Payoff', category_type: 'debt', color: '#7C3AED', is_system: true, created_at: '2026-01-01' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    user_id: 'user-demo',
    account_id: 'acc-1',
    category_id: 'cat-income',
    transaction_type: 'income',
    amount: '125000',
    currency: 'INR',
    transaction_date: '2026-10-01',
    merchant: 'Tech Corp Global',
    note: 'October Tech Salary',
    source: 'direct_deposit',
    created_at: '2026-10-01T09:00:00Z',
    updated_at: '2026-10-01T09:00:00Z',
    account_name: 'HDFC Salary Account',
    category: MOCK_CATEGORIES[0]
  },
  {
    id: 'tx-2',
    user_id: 'user-demo',
    account_id: 'acc-1',
    category_id: 'cat-rent',
    transaction_type: 'bill',
    amount: '22000',
    currency: 'INR',
    transaction_date: '2026-10-02',
    merchant: 'Prestige Apartments',
    note: 'Monthly Flat Rent',
    source: 'bank_transfer',
    created_at: '2026-10-02T10:00:00Z',
    updated_at: '2026-10-02T10:00:00Z',
    account_name: 'HDFC Salary Account',
    category: MOCK_CATEGORIES[4]
  },
  {
    id: 'tx-3',
    user_id: 'user-demo',
    account_id: 'acc-1',
    category_id: 'cat-groceries',
    transaction_type: 'expense',
    amount: '6850',
    currency: 'INR',
    transaction_date: '2026-10-06',
    merchant: 'Nature Basket Supermarket',
    note: 'Weekly Organic Groceries',
    source: 'card',
    created_at: '2026-10-06T14:30:00Z',
    updated_at: '2026-10-06T14:30:00Z',
    account_name: 'HDFC Salary Account',
    category: MOCK_CATEGORIES[2]
  },
  {
    id: 'tx-4',
    user_id: 'user-demo',
    account_id: 'acc-1',
    category_id: 'cat-dining',
    transaction_type: 'expense',
    amount: '2450',
    currency: 'INR',
    transaction_date: '2026-10-10',
    merchant: 'Blue Tokai Coffee Roasters',
    note: 'Team Weekend Brunch',
    source: 'card',
    created_at: '2026-10-10T11:15:00Z',
    updated_at: '2026-10-10T11:15:00Z',
    account_name: 'HDFC Salary Account',
    category: MOCK_CATEGORIES[3]
  },
  {
    id: 'tx-5',
    user_id: 'user-demo',
    account_id: 'acc-1',
    category_id: 'cat-savings',
    transaction_type: 'savings',
    amount: '25000',
    currency: 'INR',
    transaction_date: '2026-10-05',
    merchant: 'Zerodha Coin SIP',
    note: 'Nifty 50 Index Fund SIP',
    source: 'auto_debit',
    created_at: '2026-10-05T08:00:00Z',
    updated_at: '2026-10-05T08:00:00Z',
    account_name: 'HDFC Salary Account',
    category: MOCK_CATEGORIES[8]
  },
  {
    id: 'tx-6',
    user_id: 'user-demo',
    account_id: 'acc-1',
    category_id: 'cat-utilities',
    transaction_type: 'bill',
    amount: '1499',
    currency: 'INR',
    transaction_date: '2026-10-12',
    merchant: 'Airtel Xstream Fiber',
    note: 'Gigabit Fiber Internet',
    source: 'upi',
    created_at: '2026-10-12T16:00:00Z',
    updated_at: '2026-10-12T16:00:00Z',
    account_name: 'HDFC Salary Account',
    category: MOCK_CATEGORIES[5]
  },
  {
    id: 'tx-7',
    user_id: 'user-demo',
    account_id: 'acc-3',
    category_id: 'cat-transport',
    transaction_type: 'expense',
    amount: '1800',
    currency: 'INR',
    transaction_date: '2026-10-14',
    merchant: 'Indian Oil Fuel Station',
    note: 'Sedan Tank Refill',
    source: 'cash',
    created_at: '2026-10-14T17:45:00Z',
    updated_at: '2026-10-14T17:45:00Z',
    account_name: 'Cash Wallet',
    category: MOCK_CATEGORIES[6]
  },
];

export const MOCK_BILLS: Bill[] = [
  {
    id: 'bill-1',
    user_id: 'user-demo',
    category_id: 'cat-rent',
    account_id: 'acc-1',
    name: 'Prestige Apartment Rent',
    expected_amount: '22000',
    due_date: '2026-11-01',
    recurrence: 'monthly',
    status: 'upcoming',
    created_at: '2026-01-01',
    category: MOCK_CATEGORIES[4]
  },
  {
    id: 'bill-2',
    user_id: 'user-demo',
    category_id: 'cat-utilities',
    account_id: 'acc-1',
    name: 'Airtel Fiber 1Gbps',
    expected_amount: '1499',
    due_date: '2026-10-25',
    recurrence: 'monthly',
    status: 'upcoming',
    created_at: '2026-01-01',
    category: MOCK_CATEGORIES[5]
  },
  {
    id: 'bill-3',
    user_id: 'user-demo',
    category_id: 'cat-utilities',
    account_id: 'acc-1',
    name: 'Bescom Electricity Board',
    expected_amount: '3200',
    due_date: '2026-10-28',
    recurrence: 'monthly',
    status: 'upcoming',
    created_at: '2026-01-01',
    category: MOCK_CATEGORIES[5]
  },
  {
    id: 'bill-4',
    user_id: 'user-demo',
    category_id: 'cat-shopping',
    account_id: 'acc-1',
    name: 'Apple iCloud+ 2TB',
    expected_amount: '749',
    due_date: '2026-10-22',
    recurrence: 'monthly',
    status: 'paid',
    created_at: '2026-01-01',
    category: MOCK_CATEGORIES[7]
  }
];

export const MOCK_BUDGETS: Budget[] = [
  {
    id: 'b-1',
    user_id: 'user-demo',
    category_id: 'cat-groceries',
    period_start: '2026-10-01',
    period_end: '2026-10-31',
    limit_amount: '15000',
    actual_spent: '12400',
    remaining_amount: '2600',
    percentage_used: 82.6,
    alert_threshold_pct: 80,
    created_at: '2026-10-01',
    category: MOCK_CATEGORIES[2]
  },
  {
    id: 'b-2',
    user_id: 'user-demo',
    category_id: 'cat-dining',
    period_start: '2026-10-01',
    period_end: '2026-10-31',
    limit_amount: '8000',
    actual_spent: '5400',
    remaining_amount: '2600',
    percentage_used: 67.5,
    alert_threshold_pct: 75,
    created_at: '2026-10-01',
    category: MOCK_CATEGORIES[3]
  },
  {
    id: 'b-3',
    user_id: 'user-demo',
    category_id: 'cat-transport',
    period_start: '2026-10-01',
    period_end: '2026-10-31',
    limit_amount: '6000',
    actual_spent: '3800',
    remaining_amount: '2200',
    percentage_used: 63.3,
    alert_threshold_pct: 80,
    created_at: '2026-10-01',
    category: MOCK_CATEGORIES[6]
  },
  {
    id: 'b-4',
    user_id: 'user-demo',
    category_id: 'cat-shopping',
    period_start: '2026-10-01',
    period_end: '2026-10-31',
    limit_amount: '12000',
    actual_spent: '4200',
    remaining_amount: '7800',
    percentage_used: 35.0,
    alert_threshold_pct: 80,
    created_at: '2026-10-01',
    category: MOCK_CATEGORIES[7]
  }
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alt-1',
    user_id: 'user-demo',
    budget_id: 'b-1',
    alert_type: 'budget_threshold',
    title: 'Groceries Approaching Limit',
    message: 'You have utilized 82.6% of your monthly Groceries budget (₹12,400 of ₹15,000).',
    severity: 'warning',
    is_read: false,
    created_at: '2026-10-16T10:00:00Z',
  },
  {
    id: 'alt-2',
    user_id: 'user-demo',
    alert_type: 'bill_due',
    title: 'Upcoming Utility Payment',
    message: 'Airtel Xstream Fiber bill of ₹1,499 is due in 7 days (Oct 25).',
    severity: 'info',
    is_read: false,
    created_at: '2026-10-18T08:30:00Z',
  }
];

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  period: '2026-10',
  currency: 'INR',
  total_income: '125000',
  total_expenses: '48200',
  total_bills: '23499',
  total_debt_payments: '12000',
  total_savings: '25000',
  total_outflows: '108699',
  balance_left: '16301',
  budget_limit: '65000',
  budget_used_pct: 74.1,
  recent_transactions: MOCK_TRANSACTIONS,
  upcoming_bills: MOCK_BILLS
};

export const MOCK_CATEGORY_SPENDING: CategorySpendingItem[] = [
  { category_id: 'cat-rent', category_name: 'Housing & Rent', category_type: 'bill', color: '#06B6D4', amount: '22000', percentage: 45.6, transaction_count: 1 },
  { category_id: 'cat-groceries', category_name: 'Groceries & Mart', category_type: 'expense', color: '#EF4444', amount: '12400', percentage: 25.7, transaction_count: 4 },
  { category_id: 'cat-dining', category_name: 'Food & Dining Out', category_type: 'expense', color: '#F59E0B', amount: '5400', percentage: 11.2, transaction_count: 6 },
  { category_id: 'cat-transport', category_name: 'Fuel & Metro', category_type: 'expense', color: '#64748B', amount: '3800', percentage: 7.9, transaction_count: 5 },
  { category_id: 'cat-utilities', category_name: 'Electricity & Internet', category_type: 'bill', color: '#0284C7', amount: '4600', percentage: 9.6, transaction_count: 2 },
];

export const MOCK_BUDGET_VS_ACTUAL: BudgetVsActualItem[] = [
  { category_id: 'cat-groceries', category_name: 'Groceries & Mart', budget_limit: '15000', actual_spent: '12400', percentage_used: 82.6, remaining: '2600', status: 'warning' },
  { category_id: 'cat-dining', category_name: 'Food & Dining Out', budget_limit: '8000', actual_spent: '5400', percentage_used: 67.5, remaining: '2600', status: 'normal' },
  { category_id: 'cat-transport', category_name: 'Fuel & Metro', budget_limit: '6000', actual_spent: '3800', percentage_used: 63.3, remaining: '2200', status: 'normal' },
  { category_id: 'cat-shopping', category_name: 'Shopping & Gear', budget_limit: '12000', actual_spent: '4200', percentage_used: 35.0, remaining: '7800', status: 'normal' },
];

export const MOCK_CASHFLOW_TREND: CashFlowTrendItem[] = [
  { month: '2026-05', income: 115000, expenses: 42000, bills: 28000, savings: 20000, net_savings: 45000 },
  { month: '2026-06', income: 115000, expenses: 44500, bills: 28000, savings: 20000, net_savings: 42500 },
  { month: '2026-07', income: 120000, expenses: 41000, bills: 28000, savings: 25000, net_savings: 51000 },
  { month: '2026-08', income: 120000, expenses: 46800, bills: 28000, savings: 25000, net_savings: 45200 },
  { month: '2026-09', income: 125000, expenses: 45200, bills: 28000, savings: 25000, net_savings: 51800 },
  { month: '2026-10', income: 125000, expenses: 48200, bills: 28000, savings: 25000, net_savings: 48800 },
];

export const MOCK_FORECAST: ForecastData = {
  target_period: 'November 2026',
  predicted_expense: '51200',
  currency: 'INR',
  method: 'Ridge Regression with Temporal-Category Regularization',
  history_months: 6,
  confidence_label: 'high',
  lower_bound: '47600',
  upper_bound: '54800',
  explanation: 'Recurrent rent and utilities remain constant. Consistent weekend dining trends indicate stable expense velocity into next month with low variance.',
  historical_points: [
    { month: 'May', amount: 42000 },
    { month: 'Jun', amount: 44500 },
    { month: 'Jul', amount: 41000 },
    { month: 'Aug', amount: 46800 },
    { month: 'Sep', amount: 45200 },
    { month: 'Oct', amount: 48200 }
  ],
  limitations: 'Trained on historical recurring outflows. Extraordinary one-time equipment purchases and medical emergencies are excluded.'
};

export const MOCK_RECOMMENDATIONS: BudgetRecommendation[] = [
  {
    category_id: 'cat-groceries',
    category_name: 'Groceries & Mart',
    current_budget: '15000',
    recent_avg_spend: '14200',
    recommended_budget_min: '15500',
    recommended_budget_max: '16500',
    explanation: 'You consistently reach >80% threshold before month end. Increasing by ₹1,500 reflects organic seasonal inflation.',
    urgency: 'adjust_up'
  },
  {
    category_id: 'cat-shopping',
    category_name: 'Shopping & Gear',
    current_budget: '12000',
    recent_avg_spend: '5100',
    recommended_budget_min: '7000',
    recommended_budget_max: '8500',
    explanation: 'Average utilization has dropped to 42% over the last quarter. Reallocating ₹4,000 toward Emergency SIP is recommended.',
    urgency: 'adjust_down'
  },
  {
    category_id: 'cat-dining',
    category_name: 'Food & Dining Out',
    current_budget: '8000',
    recent_avg_spend: '5800',
    recommended_budget_min: '7500',
    recommended_budget_max: '8500',
    explanation: 'Spending velocity is balanced within targeted limits across both weekdays and weekends.',
    urgency: 'stable'
  }
];
