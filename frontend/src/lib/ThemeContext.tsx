import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyInfo {
  symbol: string;
  code: CurrencyCode;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  INR: { symbol: '₹', code: 'INR', locale: 'en-IN' },
  USD: { symbol: '$', code: 'USD', locale: 'en-US' },
  EUR: { symbol: '€', code: 'EUR', locale: 'de-DE' },
  GBP: { symbol: '£', code: 'GBP', locale: 'en-GB' },
};

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatCurrency: (amount: number | string) => string;
  currencySymbol: string;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('app-theme') as Theme) || 'light';
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('app-currency') as CurrencyCode) || 'INR';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('app-currency', c);
  };

  const formatCurrency = (amount: number | string): string => {
    const num = Number(amount || 0);
    const curr = CURRENCIES[currency] || CURRENCIES.INR;
    return `${curr.symbol}${num.toLocaleString(curr.locale, { maximumFractionDigits: 0 })}`;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        currency,
        setCurrency,
        formatCurrency,
        currencySymbol: CURRENCIES[currency]?.symbol || '₹',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
