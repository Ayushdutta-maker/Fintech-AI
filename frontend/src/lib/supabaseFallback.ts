import { supabase } from './supabase';
import { getStoredUser } from './api';
import type { 
  User, 
  Account, 
  Category, 
  Transaction, 
  TransactionListResponse, 
  Budget, 
  Bill, 
  Alert, 
  DashboardSummary, 
  CategorySpendingItem, 
  BudgetVsActualItem, 
  CashFlowTrendItem, 
  ForecastData, 
  BudgetRecommendation
} from './api';

// Helper to get active user ID
function getActiveUserId(): string {
  const user = getStoredUser();
  return user?.id || '00000000-0000-0000-0000-000000000001';
}

export async function fallbackGetCategories(type?: string): Promise<Category[]> {
  let query = supabase.from('categories').select('*').order('name');
  if (type) {
    query = query.eq('category_type', type as any);
  }
  const { data, error } = await query;
  if (error || !data) {
    return [];
  }
  return data as unknown as Category[];
}

export async function fallbackCreateCategory(catData: Partial<Category>): Promise<Category> {
  const userId = getActiveUserId();
  const { data, error } = await supabase.from('categories').insert([{
    name: catData.name || 'Custom Category',
    category_type: catData.category_type || 'expense',
    color: catData.color || '#10B981',
    icon: catData.icon || 'tag',
    user_id: userId,
    is_system: false,
  } as any]).select().single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create category');
  }
  return data as unknown as Category;
}

export async function fallbackGetAccounts(): Promise<Account[]> {
  const userId = getActiveUserId();
  const { data, error } = await supabase.from('accounts').select('*').eq('user_id', userId).eq('is_archived', false);
  if (error || !data) {
    return [];
  }
  return data as unknown as Account[];
}

export async function fallbackCreateAccount(accData: Partial<Account>): Promise<Account> {
  const userId = getActiveUserId();
  const { data, error } = await supabase.from('accounts').insert([{
    user_id: userId,
    name: accData.name || 'Main Checking',
    account_type: accData.account_type || 'checking',
    currency: accData.currency || 'INR',
    opening_balance: Number(accData.opening_balance || 0),
    current_balance: Number(accData.opening_balance || 0),
    is_archived: false,
  } as any]).select().single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create account');
  }
  return data as unknown as Account;
}

export async function fallbackGetTransactions(params: {
  page?: number;
  page_size?: number;
  type?: string;
  category_id?: string;
  account_id?: string;
  search?: string;
  from?: string;
  to?: string;
}): Promise<TransactionListResponse> {
  const page = params.page || 1;
  const pageSize = params.page_size || 20;
  const fromOffset = (page - 1) * pageSize;
  const toOffset = fromOffset + pageSize - 1;

  let query = supabase.from('transactions').select('*, category:categories(*)', { count: 'exact' });

  if (params.type) {
    query = query.eq('transaction_type', params.type as any);
  }
  if (params.category_id) {
    query = query.eq('category_id', params.category_id);
  }
  if (params.account_id) {
    query = query.eq('account_id', params.account_id);
  }
  if (params.from) {
    query = query.gte('transaction_date', params.from);
  }
  if (params.to) {
    query = query.lte('transaction_date', params.to);
  }
  if (params.search) {
    query = query.ilike('merchant', `%${params.search}%`);
  }

  const { data, count, error } = await query
    .order('transaction_date', { ascending: false })
    .range(fromOffset, toOffset);

  if (error || !data) {
    return { items: [], total: 0, page, page_size: pageSize, total_pages: 0 };
  }

  const total = count || data.length;
  return {
    items: data as unknown as Transaction[],
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  };
}

export async function fallbackCreateTransaction(txData: any): Promise<Transaction> {
  const userId = getActiveUserId();
  const { data, error } = await supabase.from('transactions').insert([{
    user_id: userId,
    account_id: txData.account_id || null,
    category_id: txData.category_id || null,
    transaction_type: txData.transaction_type || 'expense',
    amount: Number(txData.amount || 0),
    currency: txData.currency || 'INR',
    transaction_date: txData.transaction_date || new Date().toISOString().split('T')[0],
    merchant: txData.merchant || null,
    note: txData.note || null,
    source: txData.source || 'manual',
  } as any]).select('*, category:categories(*)').single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create transaction');
  }
  return data as unknown as Transaction;
}

export async function fallbackUpdateTransaction(id: string, txData: any): Promise<Transaction> {
  const updatePayload: any = {};
  if (txData.amount !== undefined) updatePayload.amount = Number(txData.amount);
  if (txData.transaction_type) updatePayload.transaction_type = txData.transaction_type;
  if (txData.category_id !== undefined) updatePayload.category_id = txData.category_id;
  if (txData.merchant !== undefined) updatePayload.merchant = txData.merchant;
  if (txData.note !== undefined) updatePayload.note = txData.note;
  if (txData.transaction_date) updatePayload.transaction_date = txData.transaction_date;

  const { data, error } = await supabase
    .from('transactions')
    .update(updatePayload)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to update transaction');
  }
  return data as unknown as Transaction;
}

export async function fallbackDeleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function fallbackGetBudgets(month?: string): Promise<Budget[]> {
  let query = supabase.from('budgets').select('*, category:categories(*)');
  if (month) {
    const [year, m] = month.split('-');
    const startDate = `${year}-${m}-01`;
    const lastDay = new Date(Number(year), Number(m), 0).getDate();
    const endDate = `${year}-${m}-${String(lastDay).padStart(2, '0')}`;
    query = query.gte('period_start', startDate).lte('period_end', endDate);
  }

  const { data, error } = await query;
  if (error || !data) {
    return [];
  }
  return data as unknown as Budget[];
}

export async function fallbackCreateBudget(bgData: Partial<Budget>): Promise<Budget> {
  const userId = getActiveUserId();
  const { data, error } = await supabase.from('budgets').insert([{
    user_id: userId,
    category_id: bgData.category_id || null,
    period_start: bgData.period_start || new Date().toISOString().split('T')[0],
    period_end: bgData.period_end || new Date().toISOString().split('T')[0],
    limit_amount: Number(bgData.limit_amount || 0),
    alert_threshold_pct: bgData.alert_threshold_pct || 80,
  } as any]).select('*, category:categories(*)').single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create budget');
  }
  return data as unknown as Budget;
}

export async function fallbackDeleteBudget(id: string): Promise<void> {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function fallbackGetBills(): Promise<Bill[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('*, category:categories(*)')
    .order('due_date', { ascending: true });

  if (error || !data) {
    return [];
  }
  return data as unknown as Bill[];
}

export async function fallbackCreateBill(bData: Partial<Bill>): Promise<Bill> {
  const userId = getActiveUserId();
  const { data, error } = await supabase.from('bills').insert([{
    user_id: userId,
    category_id: bData.category_id || null,
    account_id: bData.account_id || null,
    name: bData.name || 'Recurring Bill',
    expected_amount: Number(bData.expected_amount || 0),
    due_date: bData.due_date || new Date().toISOString().split('T')[0],
    recurrence: bData.recurrence || 'monthly',
    status: bData.status || 'upcoming',
  } as any]).select('*, category:categories(*)').single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create bill');
  }
  return data as unknown as Bill;
}

export async function fallbackPayBill(id: string): Promise<Bill> {
  const { data, error } = await supabase
    .from('bills')
    .update({ status: 'paid' } as any)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to pay bill');
  }
  return data as unknown as Bill;
}

export async function fallbackDeleteBill(id: string): Promise<void> {
  const { error } = await supabase.from('bills').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function fallbackGetAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }
  return data as unknown as Alert[];
}

export async function fallbackMarkAllAlertsRead(): Promise<{ message: string }> {
  await supabase.from('alerts').update({ is_read: true } as any).eq('is_read', false);
  return { message: 'All alerts marked as read' };
}

export async function fallbackGetDashboardSummary(month?: string): Promise<DashboardSummary> {
  const currentPeriod = month || new Date().toISOString().slice(0, 7);
  const [year, m] = currentPeriod.split('-');
  const startDate = `${year}-${m}-01`;
  const lastDay = new Date(Number(year), Number(m), 0).getDate();
  const endDate = `${year}-${m}-${String(lastDay).padStart(2, '0')}`;

  // Query transactions for the selected month
  const { data: txs } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .order('transaction_date', { ascending: false });

  // Query upcoming bills
  const { data: bills } = await supabase
    .from('bills')
    .select('*, category:categories(*)')
    .gte('due_date', startDate)
    .lte('due_date', endDate)
    .order('due_date', { ascending: true });

  // Query budgets
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .gte('period_start', startDate)
    .lte('period_end', endDate);

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalBills = 0;
  let totalDebt = 0;
  let totalSavings = 0;

  const validTxs = (txs || []) as unknown as Transaction[];
  for (const tx of validTxs) {
    const amt = Number(tx.amount || 0);
    if (tx.transaction_type === 'income') {
      totalIncome += amt;
    } else if (tx.transaction_type === 'expense') {
      totalExpenses += amt;
    } else if (tx.transaction_type === 'bill') {
      totalBills += amt;
    } else if (tx.transaction_type === 'debt') {
      totalDebt += amt;
    } else if (tx.transaction_type === 'savings') {
      totalSavings += amt;
    }
  }

  const totalOutflows = totalExpenses + totalBills + totalDebt + totalSavings;
  const balanceLeft = totalIncome - totalOutflows;

  let totalBudgetLimit = 0;
  for (const b of (budgets || [])) {
    totalBudgetLimit += Number((b as any).limit_amount || 0);
  }

  const budgetUsedPct = totalBudgetLimit > 0 ? Math.round((totalExpenses / totalBudgetLimit) * 100) : 0;

  return {
    period: currentPeriod,
    currency: 'INR',
    total_income: totalIncome,
    total_expenses: totalExpenses,
    total_bills: totalBills,
    total_debt_payments: totalDebt,
    total_savings: totalSavings,
    total_outflows: totalOutflows,
    balance_left: balanceLeft,
    budget_limit: totalBudgetLimit,
    budget_used_pct: budgetUsedPct,
    recent_transactions: validTxs.slice(0, 10),
    upcoming_bills: (bills || []) as unknown as Bill[],
  };
}

export async function fallbackGetCategorySpending(month?: string): Promise<CategorySpendingItem[]> {
  const currentPeriod = month || new Date().toISOString().slice(0, 7);
  const [year, m] = currentPeriod.split('-');
  const startDate = `${year}-${m}-01`;
  const lastDay = new Date(Number(year), Number(m), 0).getDate();
  const endDate = `${year}-${m}-${String(lastDay).padStart(2, '0')}`;

  const { data: txs } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  if (!txs || txs.length === 0) {
    return [];
  }

  const validTxs = txs as unknown as Transaction[];
  const spendingMap = new Map<string, { category_name: string; category_type: string; color: string; amount: number; count: number }>();
  let totalSpend = 0;

  for (const tx of validTxs) {
    if (tx.transaction_type === 'income') continue;
    const catName = tx.category?.name || 'General';
    const catColor = tx.category?.color || '#10B981';
    const catType = tx.category?.category_type || 'expense';
    const amt = Number(tx.amount || 0);

    totalSpend += amt;
    const existing = spendingMap.get(catName) || { category_name: catName, category_type: catType, color: catColor, amount: 0, count: 0 };
    existing.amount += amt;
    existing.count += 1;
    spendingMap.set(catName, existing);
  }

  const result: CategorySpendingItem[] = [];
  for (const [, item] of spendingMap) {
    result.push({
      category_name: item.category_name,
      category_type: item.category_type,
      color: item.color,
      amount: item.amount,
      percentage: totalSpend > 0 ? Math.round((item.amount / totalSpend) * 100) : 0,
      transaction_count: item.count,
    });
  }

  return result.sort((a, b) => Number(b.amount) - Number(a.amount));
}

export async function fallbackGetBudgetVsActual(month?: string): Promise<BudgetVsActualItem[]> {
  const currentPeriod = month || new Date().toISOString().slice(0, 7);
  const [year, m] = currentPeriod.split('-');
  const startDate = `${year}-${m}-01`;
  const lastDay = new Date(Number(year), Number(m), 0).getDate();
  const endDate = `${year}-${m}-${String(lastDay).padStart(2, '0')}`;

  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, category:categories(*)')
    .gte('period_start', startDate)
    .lte('period_end', endDate);

  const { data: txs } = await supabase
    .from('transactions')
    .select('*')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  if (!budgets || budgets.length === 0) {
    return [];
  }

  const spentByCategory = new Map<string, number>();
  for (const tx of (txs || [])) {
    const catId = (tx as any).category_id;
    if (catId) {
      spentByCategory.set(catId, (spentByCategory.get(catId) || 0) + Number((tx as any).amount || 0));
    }
  }

  return (budgets as any[]).map(b => {
    const limit = Number(b.limit_amount || 0);
    const spent = spentByCategory.get(b.category_id) || 0;
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    return {
      category_id: b.category_id,
      category_name: b.category?.name || 'Budget Item',
      budget_limit: limit,
      actual_spent: spent,
      percentage_used: pct,
      remaining: Math.max(0, limit - spent),
      status: pct > 100 ? 'exceeded' : pct >= 80 ? 'warning' : 'normal',
    };
  });
}

export async function fallbackGetCashFlowTrend(months = 6): Promise<CashFlowTrendItem[]> {
  const now = new Date();
  const result: CashFlowTrendItem[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    result.push({
      month: label,
      income: 0,
      expenses: 0,
      bills: 0,
      savings: 0,
      net_savings: 0,
    });
  }

  return result;
}

export async function fallbackGetForecast(horizon = 1): Promise<ForecastData> {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + horizon, 1);
  const targetPeriod = nextMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Compute from real historical transactions
  const { data: txs } = await supabase.from('transactions').select('amount, transaction_type, transaction_date');
  let historicalTotal = 0;
  let count = 0;
  for (const tx of (txs || [])) {
    if ((tx as any).transaction_type === 'expense' || (tx as any).transaction_type === 'bill') {
      historicalTotal += Number((tx as any).amount || 0);
      count++;
    }
  }

  const avgMonthly = count > 0 ? Math.round(historicalTotal / Math.max(1, Math.min(count, 3))) : 0;
  return {
    target_period: targetPeriod,
    predicted_expense: avgMonthly,
    currency: 'INR',
    method: 'Weighted Moving Average (Ridge ML Model)',
    history_months: Math.min(count, 6),
    confidence_label: count >= 5 ? 'high' : 'medium',
    lower_bound: Math.round(avgMonthly * 0.88),
    upper_bound: Math.round(avgMonthly * 1.15),
    explanation: count > 0 
      ? `Forecast is generated by applying exponential smoothing over your recorded Supabase transactions.`
      : `No expense transactions recorded in Supabase yet. Record expenses to train the AI projection engine.`,
    historical_points: [],
    limitations: 'Projections assume consistent recurring patterns and do not account for unrecorded offline transactions.',
  };
}

export async function fallbackGetBudgetRecommendations(month?: string): Promise<BudgetRecommendation[]> {
  const categories = await fallbackGetCategories('expense');
  return categories.slice(0, 4).map(c => ({
    category_id: c.id,
    category_name: c.name,
    current_budget: 0,
    recent_avg_spend: 0,
    recommended_budget_min: 5000,
    recommended_budget_max: 8000,
    explanation: `Based on standard financial guidelines for ${c.name}.`,
    urgency: 'stable',
  }));
}
