
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS, SETTINGS_NAV_ITEM, ARCHIVE_NAV_ITEM, ACTIVITY_LOG_NAV_ITEM } from '../../constants';
import { NavItem } from '../../types';
import { BriefcaseIcon, XMarkIcon } from '../ui/Icon'; 

interface SidebarProps {
  appName: string;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ appName, isOpen, onClose }) => {
  const renderNavItem = (item: NavItem, index: number) => (
    <li key={index}>
      <NavLink
        to={item.path}
        onClick={onClose} // Close sidebar on mobile when link clicked
        className={({ isActive }) =>
          `flex items-center p-3 space-x-3 rounded-md hover:bg-neutral-700 transition-colors duration-200 ${
            isActive ? 'bg-primary text-white' : 'text-neutral-300 hover:text-white'
          }`
        }
      >
        {item.icon}
        <span className="font-medium">{item.name}</span>
      </NavLink>
    </li>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-neutral-800 text-light-text flex flex-col shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <NavLink to="/dashboard" className="flex items-center space-x-2" onClick={onClose}>
            <BriefcaseIcon className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-white truncate">{appName}</h1>
          </NavLink>
          {/* Close button for mobile */}
          <button 
            onClick={onClose} 
            className="lg:hidden text-gray-400 hover:text-white focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          <ul>{NAVIGATION_ITEMS.map(renderNavItem)}</ul>
          <ul>{renderNavItem(ACTIVITY_LOG_NAV_ITEM, NAVIGATION_ITEMS.length +1)}</ul> 
        </nav>
        <div className="p-4 border-t border-neutral-700">
          <ul className="space-y-2">
              {renderNavItem(ARCHIVE_NAV_ITEM, -2)}
              {renderNavItem(SETTINGS_NAV_ITEM, -1)}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
