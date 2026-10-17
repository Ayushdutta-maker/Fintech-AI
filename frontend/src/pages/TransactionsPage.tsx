import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  X,
  Receipt,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { api, Transaction, Category, Account } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';
import { useToast } from '../lib/ToastContext';

interface TransactionsPageProps {
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddModal,
  onOpenImportModal,
  onEditTransaction,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  // Filter state
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Pagination & Loading state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { formatCurrency } = useTheme();
  const { success, error: toastError } = useToast();

  const fetchTransactions = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getTransactions({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        type: selectedType || undefined,
        category_id: selectedCategory || undefined,
        account_id: selectedAccount || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setTransactions(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Unable to retrieve transactions from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getAccounts().then(setAccounts).catch(() => {});
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, selectedType, selectedCategory, selectedAccount, fromDate, toDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedType('');
    setSelectedCategory('');
    setSelectedAccount('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search || selectedType || selectedCategory || selectedAccount || fromDate || toDate
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete transaction "${name}"?`)) {
      try {
        await api.deleteTransaction(id);
        success(`Transaction "${name}" removed successfully.`, 'Record Deleted');
        fetchTransactions();
      } catch (e: any) {
        toastError(e.message || 'Failed to delete transaction.', 'Action Failed');
      }
    }
  };

  const handleExport = () => {
    const url = api.getExportCsvUrl(fromDate, toDate, selectedType);
    window.open(url, '_blank');
  };

  return (
    <div className="page-container">
      {/* Page Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
            Transactions Ledger
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            Auditable records, instant category filtering, and high-precision financial tracking
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={onOpenImportModal} className="btn btn-secondary">
            <Upload size={15} />
            <span>Import CSV</span>
          </button>
          <button onClick={handleExport} className="btn btn-secondary">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button onClick={onOpenAddModal} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {errorMsg && (
        <div className="error-banner" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button 
            onClick={fetchTransactions} 
            className="btn btn-secondary"
            style={{ padding: '4px 12px', fontSize: '12px' }}
          >
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Filter Toolbar Card */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Search bar */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            <input
              type="text"
              placeholder="Search merchant or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px' }}
              aria-label="Search transactions"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
            className="form-select"
            style={{ width: 'auto', minWidth: '135px' }}
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="bill">Bills</option>
            <option value="savings">Savings</option>
            <option value="debt">Debt</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => { setSelectedAccount(e.target.value); setPage(1); }}
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
            aria-label="Filter by account"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          {/* Date range inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="form-input"
              style={{ width: '135px' }}
              title="From date"
              aria-label="Start date"
            />
            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="form-input"
              style={{ width: '135px' }}
              title="To date"
              aria-label="End date"
            />
          </div>

          {/* Action buttons */}
          <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px' }}>
            Search
          </button>
          
          {hasActiveFilters && (
            <button 
              type="button" 
              onClick={handleResetFilters} 
              className="btn btn-secondary" 
              style={{ padding: '8px 12px', color: 'var(--muted)', display: 'inline-flex', gap: '4px' }}
              title="Reset all filters"
            >
              <X size={15} />
              <span>Clear</span>
            </button>
          )}
        </form>
      </div>

      {/* Transactions Data Table Card */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant / Details</th>
                <th>Category</th>
                <th>Account</th>
                <th>Type</th>
                <th className="align-right">Amount</th>
                <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // 5 Skeleton rows
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td><div className="skeleton-shimmer" style={{ height: '18px', width: '80px' }} /></td>
                    <td><div className="skeleton-shimmer" style={{ height: '18px', width: '160px' }} /></td>
                    <td><div className="skeleton-shimmer" style={{ height: '18px', width: '90px', borderRadius: '12px' }} /></td>
                    <td><div className="skeleton-shimmer" style={{ height: '18px', width: '70px' }} /></td>
                    <td><div className="skeleton-shimmer" style={{ height: '18px', width: '60px', borderRadius: '12px' }} /></td>
                    <td className="align-right"><div className="skeleton-shimmer" style={{ height: '18px', width: '70px', marginLeft: 'auto' }} /></td>
                    <td><div className="skeleton-shimmer" style={{ height: '18px', width: '50px', margin: '0 auto' }} /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div className="empty-state-card" style={{ border: 'none', background: 'transparent' }}>
                      <div className="empty-state-icon-box">
                        <Receipt size={28} />
                      </div>
                      <div className="empty-state-title">
                        {hasActiveFilters ? 'No transactions match your search' : 'No transactions recorded yet'}
                      </div>
                      <p className="empty-state-desc">
                        {hasActiveFilters
                          ? 'Try broadening your dates, clearing filters, or checking for typo variations.'
                          : 'Your ledger is currently empty. Record your first payment or import statements.'}
                      </p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        {hasActiveFilters ? (
                          <button onClick={handleResetFilters} className="btn btn-secondary">
                            <X size={15} />
                            <span>Reset Filters</span>
                          </button>
                        ) : (
                          <>
                            <button onClick={onOpenAddModal} className="btn btn-primary">
                              <Plus size={16} />
                              <span>Add First Transaction</span>
                            </button>
                            <button onClick={onOpenImportModal} className="btn btn-secondary">
                              <Upload size={15} />
                              <span>Import CSV</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.transaction_type === 'income';
                  const titleDesc = tx.merchant || tx.note || 'Transaction';
                  return (
                    <tr key={tx.id}>
                      <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {new Date(tx.transaction_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                          {titleDesc}
                        </div>
                        {tx.note && tx.merchant && (
                          <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
                            {tx.note}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: tx.category?.color ? `${tx.category.color}18` : 'var(--surface-subtle)',
                            color: tx.category?.color || 'var(--text)',
                            border: `1px solid ${tx.category?.color ? `${tx.category.color}40` : 'var(--border)'}`,
                          }}
                        >
                          {tx.category?.name || 'General'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: '12.5px' }}>
                        {tx.account_name || 'Primary'}
                      </td>
                      <td>
                        <span className={`badge badge-${tx.transaction_type}`}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td
                        className="align-right font-tabular"
                        style={{
                          fontWeight: 700,
                          fontSize: '13.5px',
                          color: isIncome ? 'var(--green-600)' : 'var(--text)',
                        }}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            onClick={() => onEditTransaction(tx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--muted)',
                              padding: '5px',
                              borderRadius: '4px',
                            }}
                            title="Edit transaction"
                            aria-label={`Edit ${titleDesc}`}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id, titleDesc)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--expense)',
                              padding: '5px',
                              borderRadius: '4px',
                            }}
                            title="Delete transaction"
                            aria-label={`Delete ${titleDesc}`}
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

        {/* Pagination Bar */}
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-subtle)',
          borderBottomLeftRadius: 'var(--radius-lg)',
          borderBottomRightRadius: 'var(--radius-lg)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <span style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 500 }}>
            Showing {transactions.length} of {total} records (Page {page} of {Math.max(totalPages, 1)})
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '12px', minHeight: '34px' }}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '12px', minHeight: '34px' }}
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
