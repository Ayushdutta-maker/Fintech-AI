import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  CalendarClock, 
  Sparkles, 
  Wallet, 
  Building2, 
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  X,
  LogOut
} from 'lucide-react';
import { api, Account, User } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenAddTransaction?: () => void;
  user?: User | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  isOpen = false, 
  onClose,
  onOpenAddTransaction,
  user,
  onLogout
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { formatCurrency } = useTheme();

  useEffect(() => {
    api.getAccounts().then(setAccounts).catch(() => {});
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets & Limits', icon: PieChart },
    { id: 'bills', label: 'Recurring Bills', icon: CalendarClock },
    { id: 'insights', label: 'AI Forecast & Insights', icon: Sparkles, badge: 'ML' },
  ];

  const handleSelectTab = (id: string) => {
    onTabChange(id);
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`} aria-label="Main Navigation">
      {/* Brand Header */}
      <div style={{ 
        padding: '24px 20px', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-emerald)'
          }}>
            <TrendingUp size={20} strokeWidth={2.6} />
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              FinTrack <span style={{ color: 'var(--green-600)', fontSize: '13px', fontWeight: 700 }}>AI</span>
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>Personal Finance OS</p>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button 
            type="button"
            onClick={onClose}
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'var(--green-100)' : 'transparent',
                color: isActive ? 'var(--green-900)' : 'var(--text)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon 
                size={18} 
                color={isActive ? 'var(--green-800)' : 'var(--muted)'} 
                strokeWidth={isActive ? 2.4 : 1.8} 
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, var(--green-600), var(--green-800))',
                  color: 'white',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  letterSpacing: '0.5px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Add CTA in Sidebar */}
        {onOpenAddTransaction && (
          <div style={{ marginTop: '16px', padding: '0 6px' }}>
            <button
              onClick={() => {
                onOpenAddTransaction();
                if (onClose) onClose();
              }}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '10px', gap: '8px', fontSize: '13px' }}
            >
              <PlusCircle size={16} />
              <span>Record Expense</span>
            </button>
          </div>
        )}
      </nav>

      {/* Linked Accounts Widget */}
      <div style={{ 
        padding: '16px', 
        margin: '12px', 
        background: 'var(--surface-subtle)', 
        border: '1px solid var(--border)', 
        borderRadius: '14px' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accounts</span>
          <span style={{ fontSize: '10px', color: 'var(--green-600)', fontWeight: 700 }}>Live Sync</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {accounts.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>No accounts configured</div>
          ) : (
            accounts.map((acc) => (
              <div key={acc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {acc.account_type === 'bank' ? (
                    <Building2 size={14} color="var(--green-600)" />
                  ) : (
                    <Wallet size={14} color="var(--savings)" />
                  )}
                  <span style={{ fontWeight: 600, color: 'var(--text)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {acc.name}
                  </span>
                </div>
                <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--text)' }}>
                  {formatCurrency(acc.current_balance || acc.opening_balance)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Card & Logout Button */}
      {user && (
        <div style={{
          padding: '10px 12px',
          margin: '0 12px 10px',
          borderRadius: '12px',
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--green-800), var(--green-600))',
              color: 'white',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {user.display_name ? user.display_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user.display_name}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'var(--muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user.email}
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                onLogout();
              }}
              title="Log out"
              aria-label="Log out"
              id="sidebar-logout-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--expense)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--expense-light)';
                e.currentTarget.style.borderColor = 'var(--expense-border)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      )}

      {/* Footer Security Badge */}
      <div style={{ 
        padding: '14px 20px', 
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '11px',
        color: 'var(--muted)'
      }}>
        <ShieldCheck size={16} color="var(--green-600)" />
        <span>AES-256 & Privacy Secured</span>
      </div>
    </aside>
  );
};
