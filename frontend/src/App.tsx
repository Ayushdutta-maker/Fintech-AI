import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { BillsPage } from './pages/BillsPage';
import { InsightsPage } from './pages/InsightsPage';
import { AuthPage } from './pages/AuthPage';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ImportCsvModal } from './components/ImportCsvModal';
import { 
  getToken, 
  getStoredUser, 
  removeToken, 
  User, 
  Transaction 
} from './lib/api';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Selected month format "YYYY-MM"
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  // Modals
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);

  // Refresh trigger counter to signal children to refetch
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();
    if (token && stored) {
      setUser(stored);
    }

    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const handleLogout = () => {
    removeToken();
    setUser(null);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTxToEdit(tx);
    setIsAddTxOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddTxOpen(false);
    setTxToEdit(null);
  };

  const handleSuccessChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  // If not authenticated, show modern AuthPage
  if (!user) {
    return <AuthPage onAuthSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="app-layout">
      {/* Mobile Drawer Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenAddTransaction={() => {
          setTxToEdit(null);
          setIsAddTxOpen(true);
        }}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="main-content">
        <Navbar
          user={user}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onOpenAddTransaction={() => {
            setTxToEdit(null);
            setIsAddTxOpen(true);
          }}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />

        {/* Tab Pages */}
        {activeTab === 'dashboard' && (
          <DashboardPage
            key={`dashboard-${refreshKey}`}
            selectedMonth={selectedMonth}
            onNavigate={setActiveTab}
            onOpenAddTransaction={() => {
              setTxToEdit(null);
              setIsAddTxOpen(true);
            }}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsPage
            key={`transactions-${refreshKey}`}
            onOpenAddModal={() => {
              setTxToEdit(null);
              setIsAddTxOpen(true);
            }}
            onOpenImportModal={() => setIsImportCsvOpen(true)}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsPage
            key={`budgets-${refreshKey}`}
            selectedMonth={selectedMonth}
          />
        )}

        {activeTab === 'bills' && (
          <BillsPage
            key={`bills-${refreshKey}`}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsPage
            key={`insights-${refreshKey}`}
          />
        )}
      </main>

      {/* Global Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleSuccessChange}
        transactionToEdit={txToEdit}
      />

      <ImportCsvModal
        isOpen={isImportCsvOpen}
        onClose={() => setIsImportCsvOpen(false)}
        onSuccess={handleSuccessChange}
      />
    </div>
  );
}

export default App;
