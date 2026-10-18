import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Receipt, 
  CalendarClock, 
  PiggyBank, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  PlusCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  api, 
  DashboardSummary, 
  CategorySpendingItem, 
  BudgetVsActualItem, 
  Budget,
  Transaction,
  Bill
} from '../lib/api';
import { useTheme } from '../lib/ThemeContext';
import { useToast } from '../lib/ToastContext';

interface DashboardPageProps {
  selectedMonth: string;
  onNavigate: (tab: string) => void;
  onOpenAddTransaction: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  selectedMonth,
  onNavigate,
  onOpenAddTransaction,
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categorySpending, setCategorySpending] = useState<CategorySpendingItem[]>([]);
  const [budgetVsActual, setBudgetVsActual] = useState<BudgetVsActualItem[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { formatCurrency, theme } = useTheme();
  const { success, error: toastError } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [sumData, catData, bvaData, bList] = await Promise.all([
        api.getDashboardSummary(selectedMonth),
        api.getCategorySpending(selectedMonth),
        api.getBudgetVsActual(selectedMonth),
        api.getBudgets(selectedMonth)
      ]);
      setSummary(sumData);
      setCategorySpending(catData);
      setBudgetVsActual(bvaData);
      setBudgets(bList);
    } catch (e: any) {
      console.error('Failed to load dashboard data', e);
      setErrorMsg(e.message || 'Unable to connect to financial analytics server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const handlePayBill = async (billId: string, billName: string) => {
    try {
      await api.payBill(billId);
      success(`Bill "${billName}" marked as paid!`, 'Payment Recorded');
      fetchData();
    } catch (e: any) {
      toastError(e.message || 'Could not update bill status.', 'Action Failed');
    }
  };

  // Skeleton Loader View
  if (isLoading && !summary) {
    return (
      <div className="page-container" aria-busy="true" aria-label="Loading financial dashboard">
        {/* Banner Skeleton */}
        <div className="skeleton-shimmer skeleton-banner" />

        {/* 6 KPI Card Skeletons */}
        <div className="kpi-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer skeleton-card" />
          ))}
        </div>

        {/* Analytics Grid Skeletons */}
        <div className="analytics-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer skeleton-chart" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate Net Flow & Savings Rate
  const totalIncome = Number(summary?.total_income || 0);
  const totalOutflows = Number(summary?.total_outflows || 0);
  const balanceLeft = Number(summary?.balance_left || 0);
  const totalSavings = Number(summary?.total_savings || 0);
  const savingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;
  const isNetPositive = balanceLeft >= 0;

  // Pie chart data for Cash-flow Outflow Allocation
  const pieData = [
    { name: 'Expenses', value: Number(summary?.total_expenses || 0), color: 'var(--expense)' },
    { name: 'Bills', value: Number(summary?.total_bills || 0), color: 'var(--bill)' },
    { name: 'Debt', value: Number(summary?.total_debt_payments || 0), color: 'var(--debt)' },
    { name: 'Savings', value: Number(summary?.total_savings || 0), color: 'var(--savings)' },
  ].filter(d => d.value > 0);

  const displayPieData = pieData.length > 0 ? pieData : [
    { name: 'No Outflows', value: 1, color: 'var(--border)' }
  ];

  // Budget vs Actual top items
  const bvaChartData = budgetVsActual.slice(0, 5).map(b => ({
    name: b.category_name,
    Budget: Number(b.budget_limit),
    Actual: Number(b.actual_spent),
  }));

  // Category spending top 5
  const catChartData = categorySpending.slice(0, 5).map(c => ({
    name: c.category_name,
    Amount: Number(c.amount),
  }));

  const chartTooltipStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--text)',
    fontSize: '12.5px'
  };

  return (
    <div className="page-container">
      {/* Error Banner with Retry if fetch had issues */}
      {errorMsg && (
        <div className="error-banner" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button 
            onClick={fetchData} 
            className="btn btn-secondary"
            style={{ padding: '4px 12px', fontSize: '12px' }}
          >
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 1. Command Hero: Cash-Flow Summary Banner */}
      <div className="cashflow-banner">
        <div className="cashflow-stat">
          <span className="cashflow-stat-label">
            <ArrowDownLeft size={14} color="#A7F3D0" />
            Total Monthly Income
          </span>
          <span className="cashflow-stat-value font-tabular">{formatCurrency(summary?.total_income || 0)}</span>
          <span className="cashflow-stat-sub">
            {totalIncome > 0 ? 'Active recorded inflows' : 'No income recorded yet'}
          </span>
        </div>

        <div className="cashflow-stat">
          <span className="cashflow-stat-label">
            <ArrowUpRight size={14} color="#FECDD3" />
            Total Outflows
          </span>
          <span className="cashflow-stat-value font-tabular">{formatCurrency(summary?.total_outflows || 0)}</span>
          <span className="cashflow-stat-sub">Expenses + Bills + Debt</span>
        </div>

        <div className="cashflow-stat">
          <span className="cashflow-stat-label">
            <Wallet size={14} color="#BAE6FD" />
            Net Liquid Margin
          </span>
          <span className="cashflow-stat-value font-tabular" style={{ color: isNetPositive ? '#FFFFFF' : '#FECDD3' }}>
            {formatCurrency(summary?.balance_left || 0)}
          </span>
          <span className="cashflow-stat-sub">
            {isNetPositive ? '✓ Positive Cash Surplus' : '⚠ Deficit Outflow Alert'}
          </span>
        </div>

        <div className="cashflow-stat">
          <span className="cashflow-stat-label">
            <PiggyBank size={14} color="#DDD6FE" />
            Budget & Savings
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="cashflow-stat-value font-tabular">{summary?.budget_used_pct || 0}%</span>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>
              • {savingsRate}% Saved
            </span>
          </div>
          <span className="cashflow-stat-sub">
            {summary?.budget_limit ? `of ${formatCurrency(summary.budget_limit)} budget cap` : 'No limits configured'}
          </span>
        </div>
      </div>

      {/* 2. Six KPI Quick Metrics */}
      <div className="kpi-grid">
        {/* Total Income */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-tile" style={{ background: 'var(--green-100)' }}>
              <ArrowDownLeft size={18} color="var(--green-800)" />
            </div>
            <span className="kpi-chip badge-income">Income</span>
          </div>
          <div>
            <div className="kpi-title">Total Inflow</div>
            <div className="kpi-amount font-tabular">{formatCurrency(summary?.total_income || 0)}</div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-tile" style={{ background: 'var(--expense-light)' }}>
              <ArrowUpRight size={18} color="var(--expense)" />
            </div>
            <span className="kpi-chip badge-expense">Expenses</span>
          </div>
          <div>
            <div className="kpi-title">Discretionary Spend</div>
            <div className="kpi-amount font-tabular">{formatCurrency(summary?.total_expenses || 0)}</div>
          </div>
        </div>

        {/* Total Bills */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-tile" style={{ background: 'var(--bill-light)' }}>
              <CalendarClock size={18} color="var(--bill)" />
            </div>
            <span className="kpi-chip badge-bill">Recurring</span>
          </div>
          <div>
            <div className="kpi-title">Scheduled Bills</div>
            <div className="kpi-amount font-tabular">{formatCurrency(summary?.total_bills || 0)}</div>
          </div>
        </div>

        {/* Debt Payments */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-tile" style={{ background: 'var(--debt-light)' }}>
              <CreditCard size={18} color="var(--debt)" />
            </div>
            <span className="kpi-chip badge-debt">Debt</span>
          </div>
          <div>
            <div className="kpi-title">Debt & Loans</div>
            <div className="kpi-amount font-tabular">{formatCurrency(summary?.total_debt_payments || 0)}</div>
          </div>
        </div>

        {/* Total Savings */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-tile" style={{ background: 'var(--savings-light)' }}>
              <PiggyBank size={18} color="var(--savings)" />
            </div>
            <span className="kpi-chip badge-savings">Invested</span>
          </div>
          <div>
            <div className="kpi-title">Savings & Growth</div>
            <div className="kpi-amount font-tabular">{formatCurrency(summary?.total_savings || 0)}</div>
          </div>
        </div>

        {/* Net Liquidity */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-tile" style={{ background: 'var(--green-100)' }}>
              <Wallet size={18} color="var(--green-600)" />
            </div>
            <span className="kpi-chip badge-income">Net Liquid</span>
          </div>
          <div>
            <div className="kpi-title">Surplus Balance</div>
            <div className="kpi-amount font-tabular" style={{ color: 'var(--green-600)' }}>
              {formatCurrency(summary?.balance_left || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Analytics Charts Row */}
      <div className="analytics-grid">
        {/* Outflow Allocation Donut */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Outflow Allocation</h2>
              <p className="card-subtitle">Spending distribution by category type</p>
            </div>
          </div>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [formatCurrency(val), 'Volume']} 
                  contentStyle={chartTooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '6px' }}>
            {pieData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--muted)', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget vs Actual Bars */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Budget vs. Actual</h2>
              <p className="card-subtitle">Limit adherence by category</p>
            </div>
            <button 
              onClick={() => onNavigate('budgets')}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11.5px', minHeight: '30px' }}
            >
              Manage
            </button>
          </div>
          <div style={{ height: '235px', width: '100%' }}>
            {bvaChartData.length === 0 ? (
              <div className="empty-state-card" style={{ padding: '24px', border: 'none', background: 'transparent' }}>
                <PiggyBank size={32} color="var(--muted)" />
                <p className="empty-state-desc" style={{ fontSize: '12.5px' }}>
                  No active budget thresholds for this month.
                </p>
                <button 
                  onClick={() => onNavigate('budgets')}
                  className="btn btn-primary"
                  style={{ padding: '5px 12px', fontSize: '12px', minHeight: '32px' }}
                >
                  Set Budget Limit
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bvaChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} tickFormatter={(v) => `${Math.round(v/1000)}k`} />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(val), '']}
                    contentStyle={chartTooltipStyle}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Budget" fill="var(--green-700)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" fill="var(--warning)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Spending Ranked Bars */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Top Expense Sectors</h2>
              <p className="card-subtitle">Highest volume spending</p>
            </div>
          </div>
          <div style={{ height: '235px', width: '100%' }}>
            {catChartData.length === 0 ? (
              <div className="empty-state-card" style={{ padding: '24px', border: 'none', background: 'transparent' }}>
                <Receipt size={32} color="var(--muted)" />
                <p className="empty-state-desc" style={{ fontSize: '12.5px' }}>
                  No categorized expenses recorded for this month.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-light)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickFormatter={(v) => `${Math.round(v/1000)}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text)' }} width={80} />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(val), 'Spent']}
                    contentStyle={chartTooltipStyle}
                  />
                  <Bar dataKey="Amount" fill="var(--green-600)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 4. Split Row: Recent Transactions + Budget Progress & Upcoming Bills */}
      <div className="dashboard-split-grid">
        {/* Left Column: Recent Transactions Table */}
        <div className="card">
          <div className="card-header">
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 className="card-title">Recent Transactions</h2>
              <p className="card-subtitle">Live activity stream</p>
            </div>
            <button 
              onClick={() => onNavigate('transactions')}
              className="btn btn-secondary"
              style={{ padding: '5px 12px', fontSize: '12px', minHeight: '32px', flexShrink: 0 }}
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {summary?.recent_transactions && summary.recent_transactions.length > 0 ? (
            <>
              {/* Desktop 4-column Table (hidden on mobile <= 640px) */}
              <div className="desktop-tx-table table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th className="align-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recent_transactions.map((tx: Transaction) => {
                      const isIncome = tx.transaction_type === 'income';
                      return (
                        <tr key={tx.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                              {tx.merchant || tx.note || 'Transaction'}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                              {tx.account_name || 'Account'}
                            </div>
                          </td>
                          <td>
                            <span 
                              className="badge"
                              style={{
                                backgroundColor: tx.category?.color ? `${tx.category.color}20` : 'var(--surface-subtle)',
                                color: tx.category?.color || 'var(--text)',
                                border: `1px solid ${tx.category?.color ? `${tx.category.color}40` : 'var(--border)'}`
                              }}
                            >
                              {tx.category?.name || 'General'}
                            </span>
                          </td>
                          <td style={{ color: 'var(--muted)', fontSize: '12px' }}>
                            {new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="align-right font-tabular" style={{ fontWeight: 700, color: isIncome ? 'var(--green-600)' : 'var(--text)' }}>
                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Transaction Feed (shown on mobile <= 640px) */}
              <div className="mobile-tx-list">
                {summary.recent_transactions.map((tx: Transaction) => {
                  const isIncome = tx.transaction_type === 'income';
                  return (
                    <div 
                      key={tx.id} 
                      className="mobile-tx-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        <div 
                          className="mobile-tx-icon"
                          style={{
                            background: tx.category?.color ? `${tx.category.color}18` : 'var(--surface-subtle)',
                            borderColor: tx.category?.color ? `${tx.category.color}35` : 'var(--border)'
                          }}
                        >
                          {isIncome ? (
                            <ArrowDownLeft size={17} color="var(--green-600)" />
                          ) : (
                            <ArrowUpRight size={17} color={tx.category?.color || 'var(--expense)'} />
                          )}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="mobile-tx-title">
                            {tx.merchant || tx.note || 'Transaction'}
                          </div>
                          <div className="mobile-tx-meta">
                            <span>{tx.category?.name || 'General'}</span>
                            <span>•</span>
                            <span>{new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mobile-tx-amount font-tabular" style={{ color: isIncome ? 'var(--green-600)' : 'var(--text)' }}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Clean Empty State without overflowing table headers */
            <div className="empty-state-card" style={{ border: 'none', background: 'transparent', padding: '28px 14px', textAlign: 'center' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'var(--surface-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                border: '1px solid var(--border)'
              }}>
                <Receipt size={22} color="var(--muted)" />
              </div>
              <div className="empty-state-title" style={{ fontSize: '14.5px', fontWeight: 700 }}>No transactions recorded yet</div>
              <p className="empty-state-desc" style={{ fontSize: '12px', maxWidth: '300px', margin: '4px auto 14px', color: 'var(--muted)' }}>
                Start tracking your cash flow by recording your first transaction.
              </p>
              <button 
                onClick={onOpenAddTransaction}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '12.5px', margin: '0 auto' }}
              >
                <PlusCircle size={15} />
                <span>Add Transaction</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Budget Progress + Upcoming Bills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          {/* Budget Utilization Progress Rows */}
          <div className="card">
            <div className="card-header">
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 className="card-title">Budget Allocation</h2>
                <p className="card-subtitle">Threshold monitoring</p>
              </div>
              <button 
                onClick={() => onNavigate('budgets')}
                style={{ background: 'none', border: 'none', color: 'var(--green-600)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
              >
                + Set Budget
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', minWidth: 0 }}>
              {budgets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '13px' }}>
                  No active budgets for {selectedMonth}.
                </div>
              ) : (
                budgets.slice(0, 4).map((b) => {
                  const pct = b.percentage_used || 0;
                  const isWarning = pct >= b.alert_threshold_pct && pct < 100;
                  const isExceeded = pct >= 100;
                  const barColor = isExceeded ? 'var(--expense)' : isWarning ? 'var(--warning)' : 'var(--green-600)';

                  return (
                    <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '13px', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.category?.name || 'Overall'}
                        </span>
                        <span className="font-tabular" style={{ fontWeight: 700, color: barColor, fontSize: '12px', flexShrink: 0 }}>
                          {formatCurrency(b.actual_spent)} / {formatCurrency(b.limit_amount)} ({pct}%)
                        </span>
                      </div>
                      <div className="progress-bar-bg" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} 
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Bills Card */}
          <div className="card">
            <div className="card-header">
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 className="card-title">Upcoming Bills</h2>
                <p className="card-subtitle">Scheduled obligations</p>
              </div>
              <button 
                onClick={() => onNavigate('bills')}
                style={{ background: 'none', border: 'none', color: 'var(--green-600)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
              >
                View all
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', minWidth: 0 }}>
              {summary?.upcoming_bills && summary.upcoming_bills.length > 0 ? (
                summary.upcoming_bills.map((bill: Bill) => (
                  <div 
                    key={bill.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '11px 14px',
                      background: 'var(--surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      gap: '10px',
                      minWidth: 0,
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bill.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
                        Due: {new Date(bill.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span className="font-tabular" style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text)' }}>
                        {formatCurrency(bill.expected_amount)}
                      </span>
                      <button
                        onClick={() => handlePayBill(bill.id, bill.name)}
                        className="btn btn-accent"
                        style={{ padding: '4px 10px', fontSize: '11.5px', borderRadius: '6px', minHeight: '28px' }}
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '13px' }}>
                  No pending bills due in the next 7 days.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
