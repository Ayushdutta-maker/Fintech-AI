import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, AlertCircle } from 'lucide-react';
import { api, Category, Account, Transaction } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';
import { useToast } from '../lib/ToastContext';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit,
}) => {
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'bill' | 'savings' | 'debt'>('expense');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [note, setNote] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [suggestedCategory, setSuggestedCategory] = useState<{ id: string; name: string; conf: number; rule?: string } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currency, currencySymbol } = useTheme();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (isOpen) {
      api.getCategories().then(setCategories).catch(() => {});
      api.getAccounts().then(accs => {
        setAccounts(accs);
        if (accs.length > 0 && !accountId) {
          setAccountId(accs[0].id);
        }
      }).catch(() => {});

      if (transactionToEdit) {
        setTransactionType(transactionToEdit.transaction_type as any);
        setAmount(String(transactionToEdit.amount));
        setMerchant(transactionToEdit.merchant || '');
        setNote(transactionToEdit.note || '');
        setTransactionDate(transactionToEdit.transaction_date);
        setCategoryId(transactionToEdit.category_id || '');
        setAccountId(transactionToEdit.account_id || '');
      } else {
        // Reset form
        setAmount('');
        setMerchant('');
        setNote('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
        setCategoryId('');
        setSuggestedCategory(null);
      }
      setError(null);
    }
  }, [isOpen, transactionToEdit]);

  // Live Smart Categorization trigger
  useEffect(() => {
    if (transactionToEdit || categoryId) return;
    const term = `${merchant} ${note}`.trim();
    if (term.length < 3) {
      setSuggestedCategory(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.suggestCategory(merchant, note);
        if (res.suggested_category_id && res.confidence >= 0.70) {
          setSuggestedCategory({
            id: res.suggested_category_id,
            name: res.suggested_category_name || 'Category',
            conf: res.confidence,
            rule: res.matched_rule || undefined
          });
        } else {
          setSuggestedCategory(null);
        }
      } catch {
        // ignore
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [merchant, note, categoryId, transactionToEdit]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        transaction_type: transactionType,
        amount: Number(amount),
        merchant: merchant.trim() || undefined,
        note: note.trim() || undefined,
        transaction_date: transactionDate,
        category_id: categoryId || undefined,
        account_id: accountId || undefined,
        currency: currency,
      };

      if (transactionToEdit) {
        await api.updateTransaction(transactionToEdit.id, payload);
        success('Transaction updated successfully!', 'Changes Saved');
      } else {
        await api.createTransaction(payload);
        success(
          `Recorded ${transactionType} of ${currencySymbol}${Number(amount).toLocaleString()}`,
          'Transaction Saved'
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const types: { id: 'income' | 'expense' | 'bill' | 'savings' | 'debt'; label: string; color: string }[] = [
    { id: 'expense', label: 'Expense', color: 'var(--expense)' },
    { id: 'income', label: 'Income', color: 'var(--green-600)' },
    { id: 'bill', label: 'Bill', color: 'var(--bill)' },
    { id: 'savings', label: 'Savings', color: 'var(--savings)' },
    { id: 'debt', label: 'Debt Payment', color: 'var(--debt)' },
  ];

  const handleAddPresetAmount = (presetVal: number) => {
    const current = Number(amount) || 0;
    setAmount(String(current + presetVal));
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)' }}>
            {transactionToEdit ? 'Edit Transaction Record' : 'Record New Transaction'}
          </h2>
          <button 
            onClick={onClose} 
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                padding: '11px 14px',
                background: 'var(--expense-light)',
                color: 'var(--expense)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                border: '1px solid var(--expense-border)'
              }} role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Type selector pills */}
            <div style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Transaction Type</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {types.map((t) => {
                  const isSelected = transactionType === t.id;
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTransactionType(t.id)}
                      style={{
                        flex: '1 1 80px',
                        padding: '9px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: isSelected ? `2px solid ${t.color}` : '1px solid var(--border)',
                        background: isSelected ? 'var(--surface)' : 'var(--surface-subtle)',
                        color: isSelected ? t.color : 'var(--muted)',
                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount input & Quick Chips */}
            <div className="form-group">
              <label className="form-label">Amount ({currencySymbol})</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="form-input font-tabular"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{ fontSize: '18px', fontWeight: 800 }}
              />
              {/* Quick Amount Chips (Form CRO) */}
              <div className="quick-chips-row">
                {[100, 500, 1000, 2000, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAddPresetAmount(val)}
                    className="quick-chip font-tabular"
                  >
                    +{currencySymbol}{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Merchant / Payee */}
            <div className="form-group">
              <label className="form-label">Merchant / Payee</label>
              <input
                type="text"
                placeholder="e.g. Nature's Basket, Uber, Starbucks, Rent..."
                className="form-input"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>

            {/* Note / Description */}
            <div className="form-group">
              <label className="form-label">Notes & Purpose (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Weekly grocery staples, Client lunch..."
                className="form-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* AI Smart Suggestion Banner */}
            {suggestedCategory && !categoryId && (
              <div style={{
                background: 'var(--green-50)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '11px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--green-600)" />
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text)' }}>
                      AI Suggested: {suggestedCategory.name}
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'var(--muted)', marginLeft: '6px' }}>
                      ({Math.round(suggestedCategory.conf * 100)}% confidence)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCategoryId(suggestedCategory.id)}
                  className="btn btn-primary"
                  style={{ padding: '4px 10px', fontSize: '11px', minHeight: '26px' }}
                >
                  <Check size={12} />
                  Apply
                </button>
              </div>
            )}

            {/* Category Select */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select a Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category_type})
                  </option>
                ))}
              </select>
            </div>

            {/* Account & Date in row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Account</label>
                <select
                  className="form-select"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : transactionToEdit ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
