
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS, SETTINGS_NAV_ITEM, ARCHIVE_NAV_ITEM, ACTIVITY_LOG_NAV_ITEM } from '../../constants';
import { NavItem } from '../../types';
import { BriefcaseIcon } from '../ui/Icon'; 

interface SidebarProps {
  appName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ appName }) => {
  const renderNavItem = (item: NavItem, index: number) => (
    <li key={index}>
      <NavLink
        to={item.path}
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
    <aside className="w-64 bg-neutral-800 text-light-text h-screen fixed top-0 left-0 flex flex-col shadow-lg">
      <div className="p-6 border-b border-neutral-700">
        <NavLink to="/dashboard" className="flex items-center space-x-2">
          <BriefcaseIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-white">{appName}</h1>
        </NavLink>
      </div>
      <nav className="flex-grow p-4 space-y-2">
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
  );
};

export default Sidebar;
