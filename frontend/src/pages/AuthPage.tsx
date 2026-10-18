import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight,
  Loader2,
  LogIn,
  UserPlus,
  HelpCircle,
  X,
  Shield,
  Zap,
  BarChart3
} from 'lucide-react';
import { api, User as UserType, setToken, setStoredUser } from '../lib/api';
import { Canvas3DBackground } from '../components/Canvas3DBackground';
import { NeumorphicFinanceCube } from '../components/NeumorphicFinanceCube';
import { AuthNavbar } from '../components/AuthNavbar';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

interface AuthPageProps {
  onAuthSuccess: (user: UserType) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (res: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement | null,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
              locale?: string;
            }
          ) => void;
          prompt: (notification?: (notification: any) => void) => void;
        };
      };
    };
  }
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Password strength assessment for registration
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#EF4444' };
    if (score === 2) return { score: 2, label: 'Fair', color: '#F59E0B' };
    if (score === 3) return { score: 3, label: 'Good', color: '#10B981' };
    return { score: 4, label: 'Strong', color: '#059669' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegister) {
        if (!displayName.trim()) {
          setError('Please provide your name.');
          setIsLoading(false);
          return;
        }
        const res = await api.register(email, password, displayName.trim(), currency);
        onAuthSuccess(res.user);
      } else {
        const res = await api.login(email, password);
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('Unable to connect to backend server. You can sign in with Google or click "⚡ Quick Demo Login" below to explore.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      try {
        const res = await api.login('demo@fintrack.ai', 'DemoFinTrack123!');
        onAuthSuccess(res.user);
        return;
      } catch {
        const res = await api.register('demo@fintrack.ai', 'DemoFinTrack123!', 'Alex Morgan', 'INR');
        onAuthSuccess(res.user);
        return;
      }
    } catch {
      const mockUser: UserType = {
        id: 'demo-user-001',
        email: 'demo@fintrack.ai',
        display_name: 'Alex Morgan',
        default_currency: 'INR',
        created_at: new Date().toISOString()
      };
      setToken('demo-jwt-token-' + Date.now());
      setStoredUser(mockUser);
      onAuthSuccess(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--canvas)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* 1. Interactive 3D Canvas Background */}
      <Canvas3DBackground />

      {/* 2. Floating Navbar on Login Page */}
      <AuthNavbar
        isRegister={isRegister}
        onToggleMode={setIsRegister}
      />

      {/* 3. Main Hero & 3D Interactive Centerpiece */}
      <main className="auth-main">
        <div style={{
          maxWidth: '1060px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '48px',
          flexWrap: 'wrap'
        }}>
          {/* Desktop Left Showcase: Neumorphic Finance Cube & Live Trust Stats */}
          <div className="hide-on-mobile" style={{ flex: '1 1 380px', maxWidth: '440px' }}>
            <div style={{ marginBottom: '20px' }}>
              <span className="badge badge-income" style={{ marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} />
                <span>Algorithmic Personal Finance OS</span>
              </span>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 800,
                color: 'var(--text)',
                lineHeight: 1.15,
                letterSpacing: '-0.8px',
                marginBottom: '12px'
              }}>
                Next-Gen 3D Wealth Intelligence
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
                Track cashflows in multi-currency, forecast future expenditure with transparent scikit-learn models, and enforce smart budget discipline.
              </p>
            </div>

            {/* 3D Rotating Finance Cube */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <NeumorphicFinanceCube />
            </div>

            {/* Key Platform Highlights */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '20px',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={15} color="var(--green-800)" />
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text)', fontWeight: 600 }}>
                  AES-256 Multi-Tenant Zero-Trust Isolation
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={15} color="var(--green-800)" />
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text)', fontWeight: 600 }}>
                  Instant Google OAuth 2.0 & Email Authentication
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BarChart3 size={15} color="var(--green-800)" />
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text)', fontWeight: 600 }}>
                  Automated Proactive Overspending Alerts & ML Forecasting
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Glassmorphic & Neumorphic Authentication Card */}
          <div className="auth-card">
            {/* Luminous Top Accent Line */}
            <div style={{
              height: '4px',
              width: '100%',
              background: 'linear-gradient(90deg, var(--green-800) 0%, var(--green-600) 50%, #34D399 100%)'
            }} />

            <div className="auth-card-body">
              {/* Header Title inside card */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    background: 'var(--green-100)',
                    color: 'var(--green-900)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {isRegister ? 'New Account' : 'Welcome Back'}
                  </span>
                </div>
                <h2 className="auth-header-title">
                  {isRegister ? 'Create your workspace' : 'Sign in to FinTrack AI'}
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--muted)',
                  marginTop: '4px'
                }}>
                  {isRegister
                    ? 'Start forecasting and managing your personal finances in seconds.'
                    : 'Enter your credentials to access your financial OS.'}
                </p>
              </div>

              {/* Mode Selector Segmented Tabs */}
              <div style={{
                display: 'flex',
                background: 'var(--surface-subtle)',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                border: '1px solid var(--border)'
              }}>
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(null); }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: !isRegister ? 700 : 500,
                    background: !isRegister ? 'var(--surface)' : 'transparent',
                    color: !isRegister ? 'var(--text)' : 'var(--muted)',
                    cursor: 'pointer',
                    boxShadow: !isRegister ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <LogIn size={14} color={!isRegister ? 'var(--green-600)' : 'var(--muted)'} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(null); }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: isRegister ? 700 : 500,
                    background: isRegister ? 'var(--surface)' : 'transparent',
                    color: isRegister ? 'var(--text)' : 'var(--muted)',
                    cursor: 'pointer',
                    boxShadow: isRegister ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <UserPlus size={14} color={isRegister ? 'var(--green-600)' : 'var(--muted)'} />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Error Banner */}
              {error && (
                <div style={{
                  padding: '11px 14px',
                  background: 'var(--expense-light)',
                  color: 'var(--expense)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: '16px',
                  border: '1px solid var(--expense-border)',
                  animation: 'fadeIn 0.2s ease'
                }} role="alert">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--expense)', padding: '2px', display: 'flex' }}
                    aria-label="Dismiss error"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* --- GOOGLE AUTHENTICATION SECTION --- */}
              <div style={{ marginBottom: '18px' }}>
                <GoogleSignInButton
                  isRegister={isRegister}
                  onSuccess={onAuthSuccess}
                  onError={(msg) => setError(msg)}
                  onLoadingChange={(loading) => setIsGoogleLoading(loading)}
                />

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '18px 0 16px'
                }}>
                  <span style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    or continue with email
                  </span>
                  <span style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleSubmit}>
                {isRegister && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                        <input
                          type="text"
                          placeholder="e.g. Maya Sharma"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="form-input"
                          style={{ paddingLeft: '36px' }}
                          required
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Primary Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="form-select"
                      >
                        <option value="INR">₹ INR — Indian Rupee</option>
                        <option value="USD">$ USD — US Dollar</option>
                        <option value="EUR">€ EUR — Euro</option>
                        <option value="GBP">£ GBP — British Pound</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: isRegister && password ? '10px' : '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                    {!isRegister && (
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: 'var(--green-600)',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '36px', paddingRight: '40px' }}
                      required
                      minLength={6}
                      autoComplete={isRegister ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--muted)',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator (Register mode) */}
                {isRegister && password && (
                  <div style={{ marginBottom: '16px', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          style={{
                            flex: 1,
                            height: '4px',
                            borderRadius: '2px',
                            background: step <= passwordStrength.score ? passwordStrength.color : 'var(--border)',
                            transition: 'all 0.2s ease'
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)' }}>
                      <span>Password strength: <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong></span>
                      <span>Min 6 characters</span>
                    </div>
                  </div>
                )}

                {/* Remember Device Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <input
                    type="checkbox"
                    id="remember-device"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '15px',
                      height: '15px',
                      accentColor: 'var(--green-600)',
                      cursor: 'pointer'
                    }}
                  />
                  <label htmlFor="remember-device" style={{ fontSize: '12.5px', color: 'var(--muted)', cursor: 'pointer', userSelect: 'none' }}>
                    Remember this browser session
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>{isRegister ? 'Create Encrypted Account' : 'Sign In to Workspace'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Instant Demo Access Button */}
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading || isGoogleLoading}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '11px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '12px',
                    background: 'var(--surface-subtle)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer'
                  }}
                >
                  <Zap size={15} color="var(--green-600)" />
                  <span>⚡ Quick Demo Login (Instant Access)</span>
                </button>
              </form>

              {/* Bottom Toggle Line */}
              <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--muted)' }}>
                <span>{isRegister ? 'Already have an account? ' : "Don't have an account yet? "}</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--green-600)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {isRegister ? 'Sign in' : 'Create an account'}
                </button>
              </div>

              {/* Security Guarantee Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '20px',
                fontSize: '11px',
                color: 'var(--muted)',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '14px'
              }}>
                <ShieldCheck size={15} color="var(--green-600)" />
                <span>Google OAuth 2.0 & Multi-Tenant Encrypted Isolation</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '16px', fontWeight: 800 }}>Account Access Recovery</h2>
              <button onClick={() => setShowForgotModal(false)} className="btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div className="empty-state-icon-box" style={{ width: '36px', height: '36px', margin: 0 }}>
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '13.5px', fontWeight: 700 }}>Self-Hosted & Local Instance Recovery</h3>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', lineHeight: 1.5 }}>
                    FinTrack AI stores credentials hashed with BCrypt. To reset credentials on a self-hosted installation, use your backend environment or sign in with your verified Google account.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForgotModal(false)} className="btn btn-primary" style={{ minHeight: '34px', width: '100%' }}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
