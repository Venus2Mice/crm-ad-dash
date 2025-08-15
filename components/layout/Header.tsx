
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, BellIcon, ChevronDownIcon, UserPlusIcon, BriefcaseIcon, FunnelIcon, ClipboardDocumentListIcon, ArrowRightOnRectangleIcon } from '../ui/Icon';
import { GlobalSearchResult, User, NotificationItem } from '../../types';
import { NAVIGATION_ITEMS } from '../../constants';
import NotificationDropdown from '../notifications/NotificationDropdown'; // Import NotificationDropdown

interface HeaderProps {
  performGlobalSearch: (term: string) => GlobalSearchResult[];
  currentUser: User | null;
  onLogout: () => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    performGlobalSearch, 
    currentUser, 
    onLogout,
    notifications,
    onMarkNotificationAsRead,
    onMarkAllNotificationsAsRead
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard Overview");
  const location = useLocation();
  const navigate = useNavigate();

  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<GlobalSearchResult[]>([]);
  const [isGlobalResultsOpen, setIsGlobalResultsOpen] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  const unreadNotificationCount = currentUser ? notifications.filter(n => n.userId === currentUser.id && !n.isRead).length : 0;

  useEffect(() => {
    const currentPath = location.pathname;
    const navItem = NAVIGATION_ITEMS.find(item => item.path === currentPath);
    if (navItem) {
        setPageTitle(navItem.name);
    } else if (currentPath.startsWith('/settings')) {
        setPageTitle('Settings');
    } else if (currentPath === '/' || currentPath === '/dashboard') {
        setPageTitle('Dashboard Overview');
    } else {
        const pathSegments = currentPath.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
            const title = pathSegments[pathSegments.length-1];
            setPageTitle(title.charAt(0).toUpperCase() + title.slice(1));
        } else {
            setPageTitle('CRM'); 
        }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!globalSearchTerm.trim()) {
      setGlobalSearchResults([]);
      setIsGlobalResultsOpen(false);
      return;
    }

    const handler = setTimeout(() => {
      const results = performGlobalSearch(globalSearchTerm);
      setGlobalSearchResults(results);
      setIsGlobalResultsOpen(results.length > 0);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [globalSearchTerm, performGlobalSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsGlobalResultsOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogoutClick = () => {
    onLogout();
    setIsProfileDropdownOpen(false);
    navigate('/login'); 
  };

  const handleResultClick = (link: string) => {
    navigate(link);
    setIsGlobalResultsOpen(false);
    setGlobalSearchTerm('');
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    onMarkNotificationAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
    // setIsNotificationDropdownOpen(false); // Optional: close dropdown on item click
  };
  
  const handleMarkAllReadAndClose = () => {
    onMarkAllNotificationsAsRead();
    // setIsNotificationDropdownOpen(false); // Keep open to see changes, or close
  }

  const getResultIcon = (type: GlobalSearchResult['type']) => {
    switch (type) {
      case 'Lead': return <UserPlusIcon className="h-5 w-5 text-blue-500 mr-2" />;
      case 'Customer': return <BriefcaseIcon className="h-5 w-5 text-green-500 mr-2" />;
      case 'Deal': return <FunnelIcon className="h-5 w-5 text-purple-500 mr-2" />;
      case 'Task': return <ClipboardDocumentListIcon className="h-5 w-5 text-yellow-500 mr-2" />;
      default: return <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />;
    }
  };


  return (
    <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between">
        <h2 className="text-xl font-semibold text-dark-text">{pageTitle}</h2>
        
        <div className="flex items-center space-x-4">
          {currentUser && (
            <div className="relative hidden md:block" ref={searchContainerRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Global Search..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                onFocus={() => globalSearchTerm && globalSearchResults.length > 0 && setIsGlobalResultsOpen(true)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              />
              {isGlobalResultsOpen && globalSearchResults.length > 0 && (
                <div className="absolute mt-1 w-full md:w-96 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-40">
                  <ul>
                    {globalSearchResults.map(result => (
                      <li key={result.id}>
                        <button
                          onClick={() => handleResultClick(result.link)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors duration-150 flex items-center"
                        >
                          {getResultIcon(result.type)}
                          <div>
                              <span className="block text-sm font-medium text-dark-text">{result.name}</span>
                              <span className="block text-xs text-medium-text">{result.type} - {result.details}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {isGlobalResultsOpen && globalSearchTerm && globalSearchResults.length === 0 && (
                   <div className="absolute mt-1 w-full md:w-96 bg-white border border-gray-200 rounded-md shadow-lg z-40 p-4 text-center">
                      <p className="text-sm text-gray-500">No results found for "{globalSearchTerm}"</p>
                   </div>
               )}
            </div>
          )}

          {currentUser && (
             <div className="relative" ref={notificationDropdownRef}>
                <button 
                    onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                    className="relative p-2 rounded-full text-gray-500 hover:text-dark-text hover:bg-gray-100 focus:outline-none focus:bg-gray-100"  
                    aria-label="Notifications"
                >
                    <BellIcon className="h-6 w-6" />
                    {unreadNotificationCount > 0 && (
                        <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full ring-2 ring-white bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                        </span>
                    )}
                </button>
                {isNotificationDropdownOpen && (
                    <NotificationDropdown
                        notifications={notifications.filter(n => n.userId === currentUser.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())}
                        onNotificationClick={handleNotificationClick}
                        onMarkAllAsRead={handleMarkAllReadAndClose}
                        onClose={() => setIsNotificationDropdownOpen(false)}
                    />
                )}
            </div>
          )}

          {currentUser ? (
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 p-1 pr-2 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                aria-expanded={isProfileDropdownOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <img 
                  src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&color=fff`}
                  alt="User Avatar" 
                  className="h-8 w-8 rounded-full"
                />
                <span className="hidden sm:inline text-sm font-medium text-dark-text">{currentUser.name}</span>
                <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                  <Link to="/settings" onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile (Settings)</Link>
                  <button 
                    onClick={handleLogoutClick} 
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-medium-text" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
