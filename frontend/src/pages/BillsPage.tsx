import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Plus, 
  CheckCircle, 
  Trash2, 
  Clock, 
  AlertCircle, 
  RotateCcw,
  X,
  CreditCard,
  Check
} from 'lucide-react';
import { api, Bill, Category, Account } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';
import { useToast } from '../lib/ToastContext';

export const BillsPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurrence, setRecurrence] = useState('monthly');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { formatCurrency, currencySymbol } = useTheme();
  const { success, error: toastError } = useToast();

  const fetchBills = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getBills();
      setBills(data);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Unable to load scheduled bills.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    api.getCategories('bill').then(setCategories).catch(() => {});
    api.getAccounts().then(accs => {
      setAccounts(accs);
      if (accs.length > 0) setAccountId(accs[0].id);
    }).catch(() => {});
  }, []);

  const handleOpenAdd = () => {
    setName('');
    setAmount('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setRecurrence('monthly');
    setCategoryId('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handlePayBill = async (id: string, billName: string) => {
    try {
      await api.payBill(id);
      success(`Bill "${billName}" marked as paid!`, 'Payment Successful');
      fetchBills();
    } catch (e: any) {
      toastError(e.message || 'Failed to update bill payment.', 'Action Failed');
    }
  };

  const handleDelete = async (id: string, billName: string) => {
    if (window.confirm(`Delete scheduled bill "${billName}"?`)) {
      try {
        await api.deleteBill(id);
        success(`Scheduled bill "${billName}" deleted.`, 'Bill Removed');
        fetchBills();
      } catch (e: any) {
        toastError(e.message || 'Failed to delete bill.', 'Action Failed');
      }
    }
  };

  const handleSaveBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount || Number(amount) <= 0) {
      setFormError('Please provide bill name and a valid amount.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.createBill({
        name: name.trim(),
        expected_amount: Number(amount),
        due_date: dueDate,
        recurrence,
        category_id: categoryId || undefined,
        account_id: accountId || undefined,
        status: 'upcoming',
      });
      success(`Scheduled bill "${name.trim()}" added.`, 'Bill Saved');
      setIsModalOpen(false);
      fetchBills();
    } catch (err: any) {
      setFormError(err.message || 'Failed to schedule bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const upcomingCount = bills.filter(b => b.status === 'upcoming').length;
  const totalUpcomingDue = bills
    .filter(b => b.status === 'upcoming')
    .reduce((acc, b) => acc + Number(b.expected_amount || 0), 0);
  const paidCount = bills.filter(b => b.status === 'paid').length;

  return (
    <div className="page-container">
      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
            Recurring Bills & Subscriptions
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            Automate payment reminders for electricity, internet, SaaS, rent, and monthly commitments
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Scheduled Bill</span>
        </button>
      </div>

      {/* Error Banner with Retry */}
      {errorMsg && (
        <div className="error-banner" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={fetchBills} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Upcoming Obligations
          </span>
          <div className="font-tabular" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--bill)', marginTop: '4px' }}>
            {upcomingCount} Bills
          </div>
        </div>

        <div className="card" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Pending Amount Due
          </span>
          <div className="font-tabular" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>
            {formatCurrency(totalUpcomingDue)}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Settled This Cycle
          </span>
          <div className="font-tabular" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--green-600)', marginTop: '4px' }}>
            {paidCount} Bills
          </div>
        </div>
      </div>

      {/* Bills Table Card */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill Name</th>
                <th>Due Date</th>
                <th>Frequency</th>
                <th>Category</th>
                <th>Status</th>
                <th className="align-right">Amount</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skel-${i}`}>
                    <td><div className="skeleton-shimmer" style={{ height: '18px', width: '140px' }} /></td>
                    <td><div className="skeleton-shimmer" style={{ height: '18px', width: '90px' }} /></td>
                    <td><div className="skeleton-shimmer" style={{ height: '18px', width: '60px' }} /></td>
                    <td><div className="skeleton-shimmer" style={{ height: '18px', width: '80px', borderRadius: '12px' }} /></td>
                    <td><div className="skeleton-shimmer" style={{ height: '18px', width: '70px', borderRadius: '12px' }} /></td>
                    <td className="align-right"><div className="skeleton-shimmer" style={{ height: '18px', width: '70px', marginLeft: 'auto' }} /></td>
                    <td><div className="skeleton-shimmer" style={{ height: '18px', width: '80px', margin: '0 auto' }} /></td>
                  </tr>
                ))
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div className="empty-state-card" style={{ border: 'none', background: 'transparent' }}>
                      <div className="empty-state-icon-box">
                        <CalendarClock size={28} />
                      </div>
                      <h2 className="empty-state-title">No Recurring Bills Scheduled</h2>
                      <p className="empty-state-desc">
                        Add your monthly utility bills, software subscriptions, insurance, and rent payments for automated alerts.
                      </p>
                      <button onClick={handleOpenAdd} className="btn btn-primary" style={{ marginTop: '8px' }}>
                        <Plus size={16} />
                        <span>Schedule First Bill</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                bills.map((bill) => {
                  const isPaid = bill.status === 'paid';
                  const isOverdue = bill.status === 'overdue';
                  return (
                    <tr key={bill.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{bill.name}</div>
                      </td>
                      <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {new Date(bill.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontSize: '12px', color: 'var(--muted)' }}>
                          {bill.recurrence}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-bill">
                          {bill.category?.name || 'Bills & Utilities'}
                        </span>
                      </td>
                      <td>
                        {isPaid ? (
                          <span className="badge badge-income" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={12} />
                            Paid
                          </span>
                        ) : isOverdue ? (
                          <span className="badge badge-expense">Overdue</span>
                        ) : (
                          <span className="badge badge-warning">Upcoming</span>
                        )}
                      </td>
                      <td className="align-right font-tabular" style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text)' }}>
                        {formatCurrency(bill.expected_amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {!isPaid && (
                            <button
                              onClick={() => handlePayBill(bill.id, bill.name)}
                              className="btn btn-accent"
                              style={{ padding: '4px 10px', fontSize: '11.5px', borderRadius: '6px', minHeight: '28px' }}
                              title="Mark bill as paid & record transaction"
                            >
                              Pay Now
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(bill.id, bill.name)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--expense)',
                              padding: '5px',
                              borderRadius: '4px'
                            }}
                            title="Delete bill"
                            aria-label={`Delete ${bill.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bill Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '17px', fontWeight: 800 }}>Schedule Recurring Bill</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="btn-icon"
                style={{ width: '32px', height: '32px' }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBill}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: '10px 14px', background: 'var(--expense-light)', color: 'var(--expense)', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Bill Name / Service</label>
                  <input
                    type="text"
                    placeholder="e.g. Electric Power, High-Speed Fiber, Rent, AWS..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expected Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="form-input font-tabular"
                    required
                    style={{ fontSize: '16px', fontWeight: 800 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Recurrence Cycle</label>
                    <select
                      value={recurrence}
                      onChange={(e) => setRecurrence(e.target.value)}
                      className="form-select"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="yearly">Yearly</option>
                      <option value="once">Once</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Expense Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Scheduling...' : 'Save Scheduled Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
