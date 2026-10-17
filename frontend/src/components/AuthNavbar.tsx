import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sun, 
  Moon, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  HelpCircle,
  X,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

interface AuthNavbarProps {
  isRegister: boolean;
  onToggleMode: (register: boolean) => void;
}

export const AuthNavbar: React.FC<AuthNavbarProps> = ({
  isRegister,
  onToggleMode,
}) => {
  const { theme, toggleTheme, currencySymbol, currency } = useTheme();
  const [showFeatureModal, setShowFeatureModal] = useState<string | null>(null);

  return (
    <>
      <header 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          padding: '14px 28px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.2s ease, border-color 0.2s ease'
        }}
      >
        {/* Left: Brand Identity */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                FinTrack <span style={{ color: 'var(--green-600)' }}>AI</span>
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                background: 'var(--green-100)',
                color: 'var(--green-900)',
                padding: '2px 6px',
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                v2.4 3D
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }} className="hide-on-mobile">
              Financial Intelligence & Projections
            </p>
          </div>
        </div>

        {/* Center: System Status & Highlights */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }} className="hide-on-mobile">
          <button
            onClick={() => setShowFeatureModal('features')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            <Sparkles size={14} color="var(--green-600)" />
            <span>Platform Features</span>
          </button>

          <button
            onClick={() => setShowFeatureModal('security')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            <ShieldCheck size={14} color="var(--green-600)" />
            <span>Google OAuth & Security</span>
          </button>

          {/* Engine status indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border)',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11.5px',
            fontWeight: 700,
            color: 'var(--text)'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span>ML Engine Live</span>
          </div>
        </div>

        {/* Right: Actions & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme switch button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-icon"
            style={{ width: '36px', height: '36px' }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon size={17} color="var(--text)" />
            ) : (
              <Sun size={17} color="var(--warning)" />
            )}
          </button>

          {/* Switch Tab Button */}
          <button
            type="button"
            onClick={() => onToggleMode(!isRegister)}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '12.5px', minHeight: '34px' }}
          >
            <span>{isRegister ? 'Sign In' : 'Get Started'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Feature / Security Info Modal */}
      {showFeatureModal && (
        <div className="modal-overlay" onClick={() => setShowFeatureModal(null)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '17px', fontWeight: 800 }}>
                {showFeatureModal === 'features' ? 'FinTrack AI Architecture' : 'Security & Google OAuth 2.0'}
              </h2>
              <button onClick={() => setShowFeatureModal(null)} className="btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {showFeatureModal === 'features' ? (
                <>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div className="empty-state-icon-box" style={{ width: '40px', height: '40px', margin: 0 }}>
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700 }}>3D Cash-Flow Command Center</h3>
                      <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                        Live inflow/outflow balance, liquid reserve monitoring, and multi-currency formatting.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div className="empty-state-icon-box" style={{ width: '40px', height: '40px', margin: 0 }}>
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Predictive Machine Learning</h3>
                      <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                        Time-series linear regression with confidence intervals and automatic budget recommendation thresholds.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div className="empty-state-icon-box" style={{ width: '40px', height: '40px', margin: 0 }}>
                      <Lock size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Google Identity Services (GIS) & OAuth 2.0</h3>
                      <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                        One-click Single Sign-On authenticated via Google OAuth 2.0 with cryptographic ID token validation and Bcrypt encryption.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div className="empty-state-icon-box" style={{ width: '40px', height: '40px', margin: 0 }}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Isolated Tenant Encryption</h3>
                      <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                        All ledger transactions, accounts, and bill schedules remain strictly isolated to your authenticated account.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowFeatureModal(null)} className="btn btn-primary" style={{ minHeight: '34px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
