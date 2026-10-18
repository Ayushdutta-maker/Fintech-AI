import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Sparkles, 
  Plus,
  CalendarClock
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAddTransaction: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddTransaction
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Activity', icon: Receipt },
    { id: 'add', label: 'Add', icon: Plus, isAction: true },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'insights', label: 'AI', icon: Sparkles },
  ];

  return (
    <nav 
      className="mobile-bottom-nav" 
      aria-label="Mobile Navigation Bar"
    >
      <div className="mobile-bottom-nav-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={onOpenAddTransaction}
                className="mobile-nav-action-btn"
                aria-label="Add New Transaction"
              >
                <div className="mobile-nav-action-circle">
                  <Icon size={20} strokeWidth={2.6} color="#FFFFFF" />
                </div>
                <span className="mobile-nav-label">Add</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              aria-label={`Navigate to ${tab.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="mobile-nav-icon-wrap">
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                {isActive && <span className="mobile-nav-active-dot" />}
              </div>
              <span className="mobile-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
