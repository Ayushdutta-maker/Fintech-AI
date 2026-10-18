import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { api, User as UserType } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';

interface GoogleSignInButtonProps {
  isRegister?: boolean;
  onSuccess: (user: UserType) => void;
  onError: (errorMessage: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  style?: React.CSSProperties;
}

// Fallback to configured Client ID if environment variable is not passed in build
const GOOGLE_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  '502546664245-gk68fcb8aitp0he39i1dnfpc53mgb5re.apps.googleusercontent.com';

/**
 * Authentic 4-color Google "G" vector icon
 */
export const GoogleLogoIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', flexShrink: 0 }}
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  isRegister = false,
  onSuccess,
  onError,
  onLoadingChange,
  style
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);

  const gsiContainerRef = useRef<HTMLDivElement | null>(null);

  const updateLoading = (val: boolean) => {
    setIsAuthenticating(val);
    if (onLoadingChange) onLoadingChange(val);
  };

  const credentialHandlerRef = useRef<(response: { credential: string }) => void>(() => {});

  // Handle Google Credential Token response
  const handleCredentialResponse = async (response: { credential: string }) => {
    if (!response?.credential) {
      onError('No credential received from Google. Please try again.');
      return;
    }
    updateLoading(true);
    try {
      const res = await api.googleLogin(response.credential);
      onSuccess(res.user);
    } catch (err: any) {
      onError(err.message || 'Google authentication failed. Please verify credentials.');
    } finally {
      updateLoading(false);
    }
  };

  credentialHandlerRef.current = handleCredentialResponse;

  // Initialize GIS and render official Google Button
  useEffect(() => {
    let checkInterval: any = null;
    let attempts = 0;

    const setupGsi = () => {
      if (!window.google?.accounts?.id || !gsiContainerRef.current) {
        return false;
      }
      if (!GOOGLE_CLIENT_ID) {
        return false;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (res: { credential: string }) => credentialHandlerRef.current(res),
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Clear previous button render
        gsiContainerRef.current.innerHTML = '';

        // Calculate responsive width (max 400px enforced by Google API)
        const containerWidth = gsiContainerRef.current.parentElement?.offsetWidth || 380;
        const targetWidth = Math.min(Math.max(containerWidth, 240), 400);

        window.google.accounts.id.renderButton(gsiContainerRef.current, {
          type: 'standard',
          theme: isDark ? 'filled_black' : 'outline',
          size: 'large',
          text: isRegister ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          width: targetWidth,
          logo_alignment: 'left',
        });

        // Check if Google successfully added its iframe button
        setTimeout(() => {
          if (gsiContainerRef.current && (gsiContainerRef.current.querySelector('iframe') || gsiContainerRef.current.children.length > 0)) {
            setIsGsiLoaded(true);
          }
        }, 150);

        return true;
      } catch (err) {
        console.warn('Google Identity Services render warning:', err);
        return false;
      }
    };

    if (!setupGsi()) {
      checkInterval = setInterval(() => {
        attempts++;
        if (setupGsi() || attempts > 20) {
          clearInterval(checkInterval);
        }
      }, 250);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [theme, isRegister, isDark]);

  // Click handler when official GSI button couldn't render or is pending
  const handleFallbackClick = () => {
    if (isAuthenticating) return;

    if (window.google?.accounts?.id && GOOGLE_CLIENT_ID) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.()) {
            const currentOrigin = window.location.origin;
            onError(
              `Google Sign-In is not authorized for "${currentOrigin}". Please add "${currentOrigin}" to Authorized JavaScript Origins in your Google Cloud Console, or use email / Demo Login.`
            );
          }
        });
      } catch (err: any) {
        onError(
          `Google Sign-In notice: ${err?.message || 'Check browser security settings or sign in with email.'}`
        );
      }
    } else {
      onError(
        'Google Identity Services is loading or blocked by your browser extensions. Please sign in with email or click Demo Login.'
      );
    }
  };

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '46px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {/* 1. Official Google Rendered Button (Visible once loaded) */}
      <div
        ref={gsiContainerRef}
        style={{
          width: '100%',
          display: isGsiLoaded ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '44px'
        }}
      />

      {/* 2. Custom Fallback Button (Visible when official GSI button has not loaded or origin is unauthorized) */}
      {!isGsiLoaded && (
        <button
          type="button"
          onClick={handleFallbackClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isAuthenticating}
          className="google-btn-custom"
          style={{
            width: '100%',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderRadius: '10px',
            border: isDark
              ? isHovered
                ? '1px solid rgba(16, 185, 129, 0.55)'
                : '1px solid rgba(255, 255, 255, 0.14)'
              : isHovered
                ? '1px solid var(--green-600)'
                : '1px solid #E2E8F0',
            background: isDark
              ? isHovered
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.04) 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
              : isHovered
                ? 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)'
                : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            boxShadow: isDark
              ? isHovered
                ? '0 6px 20px -2px rgba(16, 185, 129, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                : '0 2px 6px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.07)'
              : isHovered
                ? '0 6px 18px -2px rgba(5, 150, 105, 0.16), 0 2px 4px rgba(0, 0, 0, 0.04)'
                : '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03)',
            transform: isHovered && !isAuthenticating ? 'translateY(-1px)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: isAuthenticating ? 'not-allowed' : 'pointer',
            outline: 'none',
            position: 'relative',
            userSelect: 'none'
          }}
        >
          {/* Left Side: Brand Icon & Text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticating ? (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'var(--green-100)'
              }}>
                <Loader2 
                  size={16} 
                  color="var(--green-600)" 
                  style={{ animation: 'spin 0.8s linear infinite' }} 
                />
              </div>
            ) : (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                flexShrink: 0
              }}>
                <GoogleLogoIcon size={17} />
              </div>
            )}

            <div style={{ textAlign: 'left' }}>
              <span style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.2px',
                lineHeight: 1.2
              }}>
                {isAuthenticating 
                  ? 'Authenticating with Google...' 
                  : isRegister 
                    ? 'Sign up with Google' 
                    : 'Continue with Google'}
              </span>
            </div>
          </div>

          {/* Right Side: Trust & Security Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 7px',
              borderRadius: '6px',
              background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isGsiLoaded ? '#10B981' : '#F59E0B',
                boxShadow: isGsiLoaded ? '0 0 6px #10B981' : 'none',
                display: 'inline-block'
              }} />
              <span style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: 'var(--muted)',
                letterSpacing: '0.4px',
                textTransform: 'uppercase'
              }}>
                OAuth 2.0
              </span>
            </div>

            <div style={{
              color: isHovered ? 'var(--green-600)' : 'var(--muted)',
              transition: 'color 0.2s ease, transform 0.2s ease',
              transform: isHovered ? 'translateX(2px)' : 'none',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ArrowRight size={14} />
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default GoogleSignInButton;
