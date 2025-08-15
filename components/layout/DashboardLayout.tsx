
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { GlobalSearchResult, User, NotificationItem } from '../../types';

interface DashboardLayoutProps {
  performGlobalSearch: (term: string) => GlobalSearchResult[];
  currentUser: User | null; 
  onLogout: () => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  appName: string; // Added
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
    performGlobalSearch, 
    currentUser, 
    onLogout,
    notifications,
    onMarkNotificationAsRead,
    onMarkAllNotificationsAsRead,
    appName // Destructure
}) => {
  return (
    <div className="flex h-screen bg-light-bg">
      <Sidebar appName={appName} /> {/* Pass appName to Sidebar */}
      <div className="flex-1 flex flex-col ml-64"> {/* ml-64 to offset sidebar width */}
        <Header 
            performGlobalSearch={performGlobalSearch} 
            currentUser={currentUser} 
            onLogout={onLogout}
            notifications={notifications}
            onMarkNotificationAsRead={onMarkNotificationAsRead}
            onMarkAllNotificationsAsRead={onMarkAllNotificationsAsRead}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* This is where routed components will be rendered */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
