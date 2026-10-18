import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  PiggyBank, 
  TrendingDown, 
  ShieldAlert,
  X,
  AlertCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { api, Budget, Category } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';
import { useToast } from '../lib/ToastContext';

interface BudgetsPageProps {
  selectedMonth: string;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({ selectedMonth }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [categoryId, setCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [thresholdPct, setThresholdPct] = useState(80);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { formatCurrency, currencySymbol } = useTheme();
  const { success, error: toastError } = useToast();

  const fetchBudgets = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getBudgets(selectedMonth);
      setBudgets(data);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Unable to load budgets for selected month.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    api.getCategories('expense').then(setCategories).catch(() => {});
  }, [selectedMonth]);

  const handleOpenCreate = (prefillCategoryId?: string) => {
    setEditingBudget(null);
    setCategoryId(prefillCategoryId || '');
    setLimitAmount('');
    setThresholdPct(80);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setCategoryId(b.category_id || '');
    setLimitAmount(String(b.limit_amount));
    setThresholdPct(b.alert_threshold_pct || 80);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete budget limit for "${name}"?`)) {
      try {
        await api.deleteBudget(id);
        success(`Budget limit for "${name}" removed.`, 'Budget Deleted');
        fetchBudgets();
      } catch (e: any) {
        toastError(e.message || 'Failed to delete budget limit.', 'Action Failed');
      }
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitAmount || Number(limitAmount) <= 0) {
      setFormError('Please specify a positive budget limit amount.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const y = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10);
      const periodStart = `${y}-${String(m).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const periodEnd = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      if (editingBudget) {
        await api.updateBudget(editingBudget.id, {
          limit_amount: Number(limitAmount),
          alert_threshold_pct: thresholdPct,
        });
        success('Budget limit updated successfully!', 'Changes Saved');
      } else {
        await api.createBudget({
          category_id: categoryId || undefined,
          limit_amount: Number(limitAmount),
          alert_threshold_pct: thresholdPct,
          period_start: periodStart,
          period_end: periodEnd,
        });
        success('New category budget limit created!', 'Budget Added');
      }

      setIsModalOpen(false);
      fetchBudgets();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Summary figures
  const totalBudgeted = budgets.reduce((acc, b) => acc + Number(b.limit_amount || 0), 0);
  const totalActual = budgets.reduce((acc, b) => acc + Number(b.actual_spent || 0), 0);
  const remainingAllowance = Math.max(0, totalBudgeted - totalActual);
  const overallUsedPct = totalBudgeted > 0 ? Math.round((totalActual / totalBudgeted) * 100) : 0;

  return (
    <div className="page-container">
      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
            Budgets & Spending Thresholds
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            Plan category limits, monitor real-time utilization, and prevent discretionary overruns
          </p>
        </div>

        <button onClick={() => handleOpenCreate()} className="btn btn-primary">
          <Plus size={16} />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Error Banner with Retry */}
      {errorMsg && (
        <div className="error-banner" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={fetchBudgets} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Total Budgeted
          </span>
          <div className="font-tabular" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>
            {formatCurrency(totalBudgeted)}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Total Outflow
          </span>
          <div className="font-tabular" style={{ fontSize: '24px', fontWeight: 800, color: overallUsedPct >= 100 ? 'var(--expense)' : 'var(--text)', marginTop: '4px' }}>
            {formatCurrency(totalActual)}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Remaining Headroom
          </span>
          <div className="font-tabular" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--green-600)', marginTop: '4px' }}>
            {formatCurrency(remainingAllowance)}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Utilization Rate
          </span>
          <div className="font-tabular" style={{ fontSize: '24px', fontWeight: 800, color: overallUsedPct >= 100 ? 'var(--expense)' : overallUsedPct >= 80 ? 'var(--warning)' : 'var(--green-600)', marginTop: '4px' }}>
            {overallUsedPct}%
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="budgets-card-grid">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`skel-${i}`} className="skeleton-shimmer skeleton-card" style={{ height: '180px' }} />
          ))
        ) : budgets.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '48px 20px', textAlign: 'center' }}>
            <div className="empty-state-icon-box" style={{ margin: '0 auto 12px' }}>
              <PiggyBank size={28} />
            </div>
            <h2 className="empty-state-title">No Budgets Active for {selectedMonth}</h2>
            <p className="empty-state-desc" style={{ margin: '4px auto 16px' }}>
              Set intentional spending ceilings for key expense categories to protect your liquid savings and curb overspending.
            </p>

            {/* Quick Starters */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {categories.slice(0, 4).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleOpenCreate(cat.id)}
                  className="quick-chip"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={13} />
                  <span>Budget for {cat.name}</span>
                </button>
              ))}
            </div>

            <button onClick={() => handleOpenCreate()} className="btn btn-primary" style={{ margin: '0 auto' }}>
              <Plus size={16} />
              <span>Create First Budget</span>
            </button>
          </div>
        ) : (
          budgets.map((b) => {
            const pct = b.percentage_used || 0;
            const isWarning = pct >= b.alert_threshold_pct && pct < 100;
            const isExceeded = pct >= 100;
            const barColor = isExceeded ? 'var(--expense)' : isWarning ? 'var(--warning)' : 'var(--green-600)';
            const categoryName = b.category?.name || 'Overall Budget';

            return (
              <div 
                key={b.id} 
                className="card card-hover" 
                style={{ 
                  position: 'relative',
                  border: isExceeded ? '1px solid var(--expense-border)' : '1px solid var(--border)' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <span 
                      className="badge"
                      style={{
                        backgroundColor: b.category?.color ? `${b.category.color}18` : 'var(--green-100)',
                        color: b.category?.color || 'var(--green-900)',
                        border: `1px solid ${b.category?.color ? `${b.category.color}40` : 'rgba(16,185,129,0.25)'}`,
                        marginBottom: '8px'
                      }}
                    >
                      {categoryName}
                    </span>
                    <div className="font-tabular" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
                      {formatCurrency(b.limit_amount)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEdit(b)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '5px', borderRadius: '4px' }}
                      title="Edit budget"
                      aria-label={`Edit ${categoryName} budget`}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, categoryName)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--expense)', padding: '5px', borderRadius: '4px' }}
                      title="Delete budget"
                      aria-label={`Delete ${categoryName} budget`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 500 }}>
                      Spent: <strong className="font-tabular" style={{ color: 'var(--text)' }}>{formatCurrency(b.actual_spent)}</strong>
                    </span>
                    <span className="font-tabular" style={{ fontWeight: 800, color: barColor }}>{pct}%</span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '10px' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} 
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: 'var(--muted)',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '12px'
                }}>
                  <span>Remaining: <strong className="font-tabular" style={{ color: isExceeded ? 'var(--expense)' : 'var(--text)' }}>{formatCurrency(b.remaining_amount)}</strong></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px' }}>
                    <ShieldAlert size={13} color="var(--muted)" />
                    Alerts at {b.alert_threshold_pct}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '17px', fontWeight: 800 }}>
                {editingBudget ? 'Update Budget Threshold' : `Configure Budget for ${selectedMonth}`}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="btn-icon"
                style={{ width: '32px', height: '32px' }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: '10px 14px', background: 'var(--expense-light)', color: 'var(--expense)', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={!!editingBudget}
                  >
                    <option value="">Overall Budget (All Discretionary)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Monthly Limit ({currencySymbol})</label>
                  <input
                    type="number"
                    step="100"
                    placeholder="e.g. 10000"
                    value={limitAmount}
                    onChange={(e) => setLimitAmount(e.target.value)}
                    className="form-input font-tabular"
                    required
                    style={{ fontSize: '16px', fontWeight: 800 }}
                  />
                  {/* Quick Preset Buttons */}
                  <div className="quick-chips-row">
                    {[1000, 3000, 5000, 10000, 20000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setLimitAmount(String(val))}
                        className="quick-chip font-tabular"
                      >
                        +{currencySymbol}{val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Warning Alert Threshold</label>
                    <span className="badge badge-warning">{thresholdPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={thresholdPct}
                    onChange={(e) => setThresholdPct(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--green-700)', marginTop: '8px' }}
                    aria-label="Threshold percentage"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                    <span>50% Early Notice</span>
                    <span>80% (Standard)</span>
                    <span>100% Hard Limit</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
