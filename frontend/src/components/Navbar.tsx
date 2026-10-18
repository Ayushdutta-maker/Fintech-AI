import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Download, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { api, Alert, User } from '../lib/api';
import { useTheme, CurrencyCode } from '../lib/ThemeContext';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  user: User | null;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onOpenAddTransaction: () => void;
  onLogout: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  selectedMonth,
  onMonthChange,
  onOpenAddTransaction,
  onLogout,
  onToggleMobileMenu,
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, currency, setCurrency, currencySymbol } = useTheme();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (alertsRef.current && !alertsRef.current.contains(target)) {
        setShowAlertsDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAlertsRead();
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCsv = () => {
    const url = api.getExportCsvUrl();
    window.open(url, '_blank');
  };

  // Dynamic Month Options:
  // Dynamically expands as time passes since user joined / recorded first transaction
  const [earliestMonth, setEarliestMonth] = useState<string | null>(null);

  useEffect(() => {
    const fetchEarliestDate = async () => {
      try {
        const { data } = await supabase
          .from('transactions')
          .select('transaction_date')
          .order('transaction_date', { ascending: true })
          .limit(1);

        if (data && data.length > 0 && data[0].transaction_date) {
          setEarliestMonth(data[0].transaction_date.slice(0, 7));
        }
      } catch {
        // ignore
      }
    };
    fetchEarliestDate();
  }, [user]);

  const monthOptions = React.useMemo(() => {
    const now = new Date();
    // Latest date is current active month
    const latestDate = new Date(now.getFullYear(), now.getMonth(), 1);

    // Earliest date starts from the month the user created their account
    let earliestDate = new Date(now.getFullYear(), now.getMonth(), 1);

    if (user?.created_at) {
      const userCreatedDate = new Date(user.created_at);
      if (!isNaN(userCreatedDate.getTime())) {
        earliestDate = new Date(userCreatedDate.getFullYear(), userCreatedDate.getMonth(), 1);
        // Safety clamp: cannot be in the future relative to current month
        if (earliestDate > latestDate) {
          earliestDate = new Date(latestDate);
        }
      }
    }

    // If transactions exist from an earlier date (e.g. user imported past statements), include them
    if (earliestMonth) {
      const [eYear, eMonth] = earliestMonth.split('-').map(Number);
      if (!isNaN(eYear) && !isNaN(eMonth)) {
        const txEarliestDate = new Date(eYear, eMonth - 1, 1);
        if (txEarliestDate < earliestDate) {
          earliestDate = txEarliestDate;
        }
      }
    }

    const totalMonths =
      (latestDate.getFullYear() - earliestDate.getFullYear()) * 12 +
      (latestDate.getMonth() - earliestDate.getMonth()) + 1;

    const options: { val: string; label: string }[] = [];
    for (let i = 0; i < totalMonths; i++) {
      const d = new Date(latestDate.getFullYear(), latestDate.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const isCurrentMonth = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      let label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (isCurrentMonth && totalMonths > 1) {
        label += ' (Current)';
      }
      options.push({ val, label });
    }

    // Ensure currently selected month is always present in list
    if (selectedMonth && !options.some(o => o.val === selectedMonth)) {
      const [sYear, sMonth] = selectedMonth.split('-').map(Number);
      if (!isNaN(sYear) && !isNaN(sMonth)) {
        const sDate = new Date(sYear, sMonth - 1, 1);
        options.unshift({
          val: selectedMonth,
          label: sDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        });
      }
    }

    return options;
  }, [user, earliestMonth, selectedMonth]);

  const currencies: CurrencyCode[] = ['INR', 'USD', 'EUR', 'GBP'];

  return (
    <header className="topbar">
      <div className="navbar-left">
        {/* Mobile menu hamburger toggle */}
        {onToggleMobileMenu && (
          <button 
            type="button"
            onClick={onToggleMobileMenu}
            className="btn-icon mobile-menu-btn"
            aria-label="Open navigation menu"
            id="mobile-nav-toggle"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Month selector pill */}
        <div className="navbar-month-pill">
          <Calendar size={15} color="var(--green-600)" />
          <select 
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            aria-label="Select report month"
            className="navbar-select"
          >
            {monthOptions.map(m => (
              <option key={m.val} value={m.val} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Currency Switcher */}
        <div className="navbar-currency-pill">
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green-600)' }}>
            {currencySymbol}
          </span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            aria-label="Select display currency"
            className="navbar-select"
          >
            {currencies.map(c => (
              <option key={c} value={c} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="navbar-right">
        {/* Dark / Light Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn-icon"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <Moon size={18} color="var(--text)" />
          ) : (
            <Sun size={18} color="var(--warning)" />
          )}
        </button>

        {/* Export CSV button (hidden on mobile) */}
        <button 
          onClick={handleExportCsv}
          className="btn btn-secondary hide-on-mobile" 
          title="Export transactions as CSV"
        >
          <Download size={15} />
          <span>Export CSV</span>
        </button>

        {/* Add Transaction Primary CTA (hidden on mobile because mobile bottom nav has elevated + button) */}
        <button 
          onClick={onOpenAddTransaction}
          className="btn btn-primary hide-on-mobile"
        >
          <Plus size={16} />
          <span>Add Transaction</span>
        </button>

        {/* Notifications / Alerts drop-down */}
        <div ref={alertsRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setShowAlertsDropdown(!showAlertsDropdown);
              setShowProfileDropdown(false);
            }}
            className="btn-icon"
            aria-label="View notifications and alerts"
            style={{ position: 'relative' }}
          >
            <Bell size={18} color="var(--text)" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: 'var(--expense)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--surface)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '340px',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border)',
              zIndex: 50,
              overflow: 'hidden',
              animation: 'scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{ 
                padding: '14px 18px', 
                borderBottom: '1px solid var(--border)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'var(--surface-subtle)'
              }}>
                <span style={{ fontWeight: 800, fontSize: '13.5px' }}>Financial Alerts</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    style={{ background: 'none', border: 'none', color: 'var(--green-600)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {alerts.length === 0 ? (
                  <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                    <CheckCircle2 size={24} color="var(--green-600)" style={{ margin: '0 auto 8px' }} />
                    No spending or bill alerts right now.
                  </div>
                ) : (
                  alerts.slice(0, 8).map(alert => (
                    <div 
                      key={alert.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-light)',
                        background: alert.is_read ? 'transparent' : 'var(--green-50)',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {alert.severity === 'critical' ? (
                          <AlertCircle size={16} color="var(--expense)" />
                        ) : alert.severity === 'warning' ? (
                          <AlertTriangle size={16} color="var(--warning)" />
                        ) : (
                          <Info size={16} color="var(--bill)" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text)' }}>
                          {alert.title}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
                          {alert.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile menu */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowAlertsDropdown(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px 4px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              cursor: 'pointer',
              minHeight: '40px'
            }}
            aria-label="User profile menu"
          >
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--green-800), var(--green-600))',
              color: 'white',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }} className="hide-on-mobile">
              {user?.display_name || 'My Account'}
            </span>
            <ChevronDown size={14} color="var(--muted)" className="hide-on-mobile" />
          </button>

          {showProfileDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '210px',
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border)',
              zIndex: 50,
              padding: '8px',
              animation: 'scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{user?.display_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{user?.email}</div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowProfileDropdown(false);
                  onLogout();
                }}
                id="dropdown-logout-btn"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--expense)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-xs)',
                  marginTop: '4px',
                  transition: 'background 0.15s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--expense-light)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
              >
                <LogOut size={15} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>

        {/* Dedicated Direct Logout Button (Desktop only; on mobile, logout is in profile dropdown & sidebar) */}
        <button
          type="button"
          onClick={onLogout}
          className="btn btn-secondary hide-on-mobile"
          title="Sign out of FinTrack"
          aria-label="Logout"
          id="navbar-logout-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--expense)',
            borderColor: 'var(--border)',
            minHeight: '40px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
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
          <LogOut size={16} strokeWidth={2.2} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
