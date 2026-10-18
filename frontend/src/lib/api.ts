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

import {
  MOCK_ACCOUNTS,
  MOCK_CATEGORIES,
  MOCK_TRANSACTIONS,
  MOCK_BILLS,
  MOCK_BUDGETS,
  MOCK_ALERTS,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_CATEGORY_SPENDING,
  MOCK_BUDGET_VS_ACTUAL,
  MOCK_CASHFLOW_TREND,
  MOCK_FORECAST,
  MOCK_RECOMMENDATIONS
} from './mockData';

function getLocalMockTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem('mock_transactions');
    return raw ? JSON.parse(raw) : MOCK_TRANSACTIONS;
  } catch {
    return MOCK_TRANSACTIONS;
  }
}

function saveLocalMockTransactions(txs: Transaction[]) {
  try {
    localStorage.setItem('mock_transactions', JSON.stringify(txs));
  } catch {
    // ignore
  }
}

function getLocalMockBills(): Bill[] {
  try {
    const raw = localStorage.getItem('mock_bills');
    return raw ? JSON.parse(raw) : MOCK_BILLS;
  } catch {
    return MOCK_BILLS;
  }
}

function saveLocalMockBills(bills: Bill[]) {
  try {
    localStorage.setItem('mock_bills', JSON.stringify(bills));
  } catch {
    // ignore
  }
}

function getMockFallback<T>(endpoint: string, options: RequestInit = {}): T {
  const method = (options.method || 'GET').toUpperCase();
  const urlPath = endpoint.split('?')[0];

  if (urlPath === '/auth/login' || urlPath === '/auth/register' || urlPath === '/auth/google') {
    let email = 'demo@fintrack.ai';
    let name = 'FinTrack Explorer';
    try {
      if (options.body) {
        const body = JSON.parse(options.body as string);
        if (body.email) email = body.email;
        if (body.display_name) name = body.display_name;
      }
    } catch {
      // ignore
    }
    const mockUser: User = {
      id: 'demo-user-1',
      email: email,
      display_name: name,
      default_currency: 'INR',
      created_at: new Date().toISOString()
    };
    return {
      access_token: 'mock-offline-token-' + Date.now(),
      token_type: 'bearer',
      user: mockUser
    } as unknown as T;
  }

  if (urlPath === '/auth/me') {
    const user = getStoredUser();
    return (user || {
      id: 'demo-user-1',
      email: 'demo@fintrack.ai',
      display_name: 'FinTrack Explorer',
      default_currency: 'INR',
      created_at: new Date().toISOString()
    }) as unknown as T;
  }

  if (urlPath === '/dashboard/summary') {
    const txs = getLocalMockTransactions();
    const bills = getLocalMockBills();
    return {
      ...MOCK_DASHBOARD_SUMMARY,
      recent_transactions: txs.slice(0, 5),
      upcoming_bills: bills.filter(b => b.status === 'upcoming')
    } as unknown as T;
  }

  if (urlPath === '/analytics/category-spending') {
    return MOCK_CATEGORY_SPENDING as unknown as T;
  }

  if (urlPath === '/analytics/budget-vs-actual') {
    return MOCK_BUDGET_VS_ACTUAL as unknown as T;
  }

  if (urlPath === '/analytics/cashflow') {
    return MOCK_CASHFLOW_TREND as unknown as T;
  }

  if (urlPath === '/accounts') {
    return MOCK_ACCOUNTS as unknown as T;
  }

  if (urlPath === '/categories') {
    return MOCK_CATEGORIES as unknown as T;
  }

  if (urlPath.startsWith('/transactions')) {
    let txs = getLocalMockTransactions();
    if (method === 'POST') {
      try {
        const body = JSON.parse(options.body as string);
        const cat = MOCK_CATEGORIES.find(c => c.id === body.category_id) || MOCK_CATEGORIES[2];
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          user_id: 'user-demo',
          account_id: body.account_id || 'acc-1',
          category_id: body.category_id || cat.id,
          transaction_type: body.transaction_type || 'expense',
          amount: body.amount,
          currency: body.currency || 'INR',
          transaction_date: body.transaction_date || new Date().toISOString().split('T')[0],
          merchant: body.merchant,
          note: body.note,
          source: 'manual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          category: cat,
          account_name: 'HDFC Salary Account'
        };
        txs = [newTx, ...txs];
        saveLocalMockTransactions(txs);
        return newTx as unknown as T;
      } catch {
        return MOCK_TRANSACTIONS[0] as unknown as T;
      }
    }
    if (method === 'DELETE') {
      const id = urlPath.split('/').pop();
      if (id) {
        txs = txs.filter(t => t.id !== id);
        saveLocalMockTransactions(txs);
      }
      return {} as T;
    }
    return {
      items: txs,
      total: txs.length,
      page: 1,
      page_size: 20,
      total_pages: 1
    } as unknown as T;
  }

  if (urlPath.startsWith('/budgets')) {
    if (method === 'POST') {
      try {
        const body = JSON.parse(options.body as string);
        const cat = MOCK_CATEGORIES.find(c => c.id === body.category_id);
        const newBudget: Budget = {
          id: `b-${Date.now()}`,
          user_id: 'demo-user-1',
          category_id: body.category_id,
          period_start: '2026-10-01',
          period_end: '2026-10-31',
          limit_amount: body.limit_amount || 5000,
          alert_threshold_pct: body.alert_threshold_pct || 80,
          actual_spent: 0,
          remaining_amount: body.limit_amount || 5000,
          percentage_used: 0,
          category: cat,
          created_at: new Date().toISOString()
        };
        return newBudget as unknown as T;
      } catch {
        return MOCK_BUDGETS[0] as unknown as T;
      }
    }
    return MOCK_BUDGETS as unknown as T;
  }

  if (urlPath.startsWith('/bills')) {
    let bills = getLocalMockBills();
    if (urlPath.endsWith('/pay') && method === 'POST') {
      const parts = urlPath.split('/');
      const billId = parts[parts.length - 2];
      bills = bills.map(b => b.id === billId ? { ...b, status: 'paid' as const } : b);
      saveLocalMockBills(bills);
      const updated = bills.find(b => b.id === billId);
      return updated as unknown as T;
    }
    if (method === 'POST') {
      try {
        const body = JSON.parse(options.body as string);
        const cat = MOCK_CATEGORIES.find(c => c.id === body.category_id);
        const newBill: Bill = {
          id: `bill-${Date.now()}`,
          user_id: 'demo-user-1',
          name: body.name || 'New Utility Bill',
          expected_amount: body.expected_amount || 1500,
          due_date: body.due_date || '2026-10-25',
          recurrence: body.recurrence || 'monthly',
          status: 'upcoming',
          created_at: new Date().toISOString(),
          category: cat
        };
        bills = [newBill, ...bills];
        saveLocalMockBills(bills);
        return newBill as unknown as T;
      } catch {
        return MOCK_BILLS[0] as unknown as T;
      }
    }
    return bills as unknown as T;
  }

  if (urlPath.startsWith('/forecast')) {
    return MOCK_FORECAST as unknown as T;
  }

  if (urlPath.startsWith('/recommendations')) {
    return MOCK_RECOMMENDATIONS as unknown as T;
  }

  if (urlPath === '/alerts') {
    return MOCK_ALERTS as unknown as T;
  }

  if (urlPath.startsWith('/categorization/suggest')) {
    return {
      suggested_category_id: 'cat-groceries',
      suggested_category_name: 'Groceries & Mart',
      confidence: 0.94,
      model_version: 'v2.4-logistic',
      matched_rule: 'grocery_keyword'
    } as unknown as T;
  }

  return {} as T;
}

// Fetch wrapper with JWT headers and offline mock resilience
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      removeToken();
      window.dispatchEvent(new Event('auth-expired'));
    }

    if (!res.ok) {
      if (res.status >= 500 || res.status === 404) {
        console.warn(`[FinTrack AI] Backend returned ${res.status} for ${endpoint}. Falling back to offline mock data.`);
        return getMockFallback<T>(endpoint, options);
      }
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
  } catch (err: any) {
    // If backend is offline or network fails (e.g. Failed to fetch), provide seamless offline mock fallback!
    console.warn(`[FinTrack AI] Request to ${endpoint} failed (${err?.message}). Falling back to offline mock data.`);
    return getMockFallback<T>(endpoint, options);
  }
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
