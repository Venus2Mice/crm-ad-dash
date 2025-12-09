
import React, { useState } from 'react';
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
  appName: string; 
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
    performGlobalSearch, 
    currentUser, 
    onLogout,
    notifications,
    onMarkNotificationAsRead,
    onMarkAllNotificationsAsRead,
    appName
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-light-bg overflow-hidden">
      <Sidebar 
        appName={appName} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col w-full lg:ml-64 transition-all duration-300">
        <Header 
            performGlobalSearch={performGlobalSearch} 
            currentUser={currentUser} 
            onLogout={onLogout}
            notifications={notifications}
            onMarkNotificationAsRead={onMarkNotificationAsRead}
            onMarkAllNotificationsAsRead={onMarkAllNotificationsAsRead}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
