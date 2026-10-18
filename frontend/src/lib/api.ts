const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface User {
  id: string;
  email: string;
  display_name: string;
  default_currency: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  account_type: string;
  currency: string;
  opening_balance: string;
  current_balance: string;
  is_archived: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  category_type: 'income' | 'expense' | 'bill' | 'savings' | 'debt';
  color: string;
  icon?: string;
  is_system: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  category_id?: string;
  transaction_type: 'income' | 'expense' | 'bill' | 'savings' | 'debt' | 'transfer';
  amount: string | number;
  currency: string;
  transaction_date: string;
  merchant?: string;
  note?: string;
  source: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  account_name?: string;
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id?: string;
  period_start: string;
  period_end: string;
  limit_amount: string | number;
  alert_threshold_pct: number;
  actual_spent: string | number;
  remaining_amount: string | number;
  percentage_used: number;
  category?: Category;
  created_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  category_id?: string;
  account_id?: string;
  name: string;
  expected_amount: string | number;
  due_date: string;
  recurrence: string;
  status: 'upcoming' | 'paid' | 'overdue' | 'cancelled';
  created_at: string;
  category?: Category;
}

export interface Alert {
  id: string;
  user_id: string;
  budget_id?: string;
  alert_type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  is_read: boolean;
  created_at: string;
}

export interface DashboardSummary {
  period: string;
  currency: string;
  total_income: string | number;
  total_expenses: string | number;
  total_bills: string | number;
  total_debt_payments: string | number;
  total_savings: string | number;
  total_outflows: string | number;
  balance_left: string | number;
  budget_limit: string | number;
  budget_used_pct: number;
  recent_transactions: Transaction[];
  upcoming_bills: Bill[];
}

export interface CategorySpendingItem {
  category_id?: string;
  category_name: string;
  category_type: string;
  color: string;
  amount: string | number;
  percentage: number;
  transaction_count: number;
}

export interface BudgetVsActualItem {
  category_id?: string;
  category_name: string;
  budget_limit: string | number;
  actual_spent: string | number;
  percentage_used: number;
  remaining: string | number;
  status: 'normal' | 'warning' | 'exceeded';
}

export interface CashFlowTrendItem {
  month: string;
  income: string | number;
  expenses: string | number;
  bills: string | number;
  savings: string | number;
  net_savings: string | number;
}

export interface ForecastData {
  target_period: string;
  predicted_expense: string | number;
  currency: string;
  method: string;
  history_months: number;
  confidence_label: 'high' | 'medium' | 'low';
  lower_bound?: string | number;
  upper_bound?: string | number;
  explanation: string;
  historical_points: { month: string; amount: number }[];
  limitations: string;
}

export interface BudgetRecommendation {
  category_id: string;
  category_name: string;
  current_budget?: string | number;
  recent_avg_spend: string | number;
  recommended_budget_min: string | number;
  recommended_budget_max: string | number;
  explanation: string;
  urgency: 'adjust_up' | 'adjust_down' | 'stable';
}

// Token storage helpers
export const getToken = (): string | null => localStorage.getItem('token');
export const setToken = (token: string) => localStorage.setItem('token', token);
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = (): User | null => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};
export const setStoredUser = (user: User) => localStorage.setItem('user', JSON.stringify(user));

// Fetch wrapper with JWT headers
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    removeToken();
    window.dispatchEvent(new Event('auth-expired'));
  }

  if (!res.ok) {
    let errMessage = `Error ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.detail) errMessage = errData.detail;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// API Methods
export const api = {
  // Auth
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const data = await request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.access_token);
    setStoredUser(data.user);
    return data;
  },

  register: async (email: string, password: string, display_name: string, default_currency = 'INR'): Promise<TokenResponse> => {
    const data = await request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name, default_currency }),
    });
    setToken(data.access_token);
    setStoredUser(data.user);
    return data;
  },

  googleLogin: async (credential: string): Promise<TokenResponse> => {
    const data = await request<TokenResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    setToken(data.access_token);
    setStoredUser(data.user);
    return data;
  },

  getMe: () => request<User>('/auth/me'),

  // Dashboard
  getDashboardSummary: (month?: string) =>
    request<DashboardSummary>(`/dashboard/summary${month ? `?month=${month}` : ''}`),

  // Analytics
  getCategorySpending: (month?: string) =>
    request<CategorySpendingItem[]>(`/analytics/category-spending${month ? `?month=${month}` : ''}`),

  getBudgetVsActual: (month?: string) =>
    request<BudgetVsActualItem[]>(`/analytics/budget-vs-actual${month ? `?month=${month}` : ''}`),

  getCashFlowTrend: (months = 6) =>
    request<CashFlowTrendItem[]>(`/analytics/cashflow?months=${months}`),

  // Accounts
  getAccounts: () => request<Account[]>('/accounts'),
  createAccount: (data: Partial<Account>) => request<Account>('/accounts', { method: 'POST', body: JSON.stringify(data) }),

  // Categories
  getCategories: (type?: string) =>
    request<Category[]>(`/categories${type ? `?category_type=${type}` : ''}`),
  createCategory: (data: Partial<Category>) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),

  // Transactions
  getTransactions: (params: {
    page?: number;
    page_size?: number;
    type?: string;
    category_id?: string;
    account_id?: string;
    search?: string;
    from?: string;
    to?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params.page) sp.set('page', params.page.toString());
    if (params.page_size) sp.set('page_size', params.page_size.toString());
    if (params.type) sp.set('type', params.type);
    if (params.category_id) sp.set('category_id', params.category_id);
    if (params.account_id) sp.set('account_id', params.account_id);
    if (params.search) sp.set('search', params.search);
    if (params.from) sp.set('from', params.from);
    if (params.to) sp.set('to', params.to);
    return request<TransactionListResponse>(`/transactions?${sp.toString()}`);
  },

  createTransaction: (data: any) =>
    request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),

  updateTransaction: (id: string, data: any) =>
    request<Transaction>(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteTransaction: (id: string) =>
    request<void>(`/transactions/${id}`, { method: 'DELETE' }),

  importCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ total_rows: number; imported_count: number; duplicate_count: number; errors: string[] }>(
      '/transactions/import/csv',
      { method: 'POST', body: formData }
    );
  },

  getExportCsvUrl: (fromDate?: string, toDate?: string, type?: string) => {
    const sp = new URLSearchParams();
    if (fromDate) sp.set('from', fromDate);
    if (toDate) sp.set('to', toDate);
    if (type) sp.set('type', type);
    return `${API_BASE}/transactions/export/csv?${sp.toString()}`;
  },

  // Budgets
  getBudgets: (month?: string) =>
    request<Budget[]>(`/budgets${month ? `?month=${month}` : ''}`),

  createBudget: (data: Partial<Budget>) =>
    request<Budget>('/budgets', { method: 'POST', body: JSON.stringify(data) }),

  updateBudget: (id: string, data: Partial<Budget>) =>
    request<Budget>(`/budgets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteBudget: (id: string) =>
    request<void>(`/budgets/${id}`, { method: 'DELETE' }),

  // Bills
  getBills: () => request<Bill[]>('/bills'),
  createBill: (data: Partial<Bill>) => request<Bill>('/bills', { method: 'POST', body: JSON.stringify(data) }),
  payBill: (id: string) => request<Bill>(`/bills/${id}/pay`, { method: 'POST' }),
  deleteBill: (id: string) => request<void>(`/bills/${id}`, { method: 'DELETE' }),

  // Forecasts & ML
  getMonthlyExpenseForecast: (horizon = 1) =>
    request<ForecastData>(`/forecast/monthly-expense?horizon=${horizon}`),

  getBudgetRecommendations: (month?: string) =>
    request<BudgetRecommendation[]>(`/recommendations/budget${month ? `?month=${month}` : ''}`),

  suggestCategory: (merchant?: string, note?: string) =>
    request<{
      suggested_category_id: string | null;
      suggested_category_name: string | null;
      confidence: number;
      model_version: string;
      matched_rule: string | null;
    }>('/categorization/suggest', {
      method: 'POST',
      body: JSON.stringify({ merchant, note }),
    }),

  // Alerts
  getAlerts: () => request<Alert[]>('/alerts'),
  markAlertRead: (id: string) => request<Alert>(`/alerts/${id}/read`, { method: 'PATCH' }),
  markAllAlertsRead: () => request<{ message: string }>('/alerts/mark-all-read', { method: 'POST' }),
  deleteAlert: (id: string) => request<void>(`/alerts/${id}`, { method: 'DELETE' }),
};
