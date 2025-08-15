
import React from 'react';
import { NotificationItem, NotificationType } from '../../types';
import { formatRelativeTime } from '../../utils/dateUtils'; // We'll create this util
import { 
    InformationCircleIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon as WarningIcon, // Renamed to avoid conflict
    XCircleIcon as ErrorIcon, // Using XCircle for Error
    ClipboardDocumentListIcon, // For Task
    UserPlusIcon, // For Lead
    FunnelIcon, // For Deal
    BellAlertIcon // Generic for Mention/Reminder or default
} from '../ui/Icon';

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onNotificationClick: (notification: NotificationItem) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void; // To close the dropdown
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
    notifications, 
    onNotificationClick, 
    onMarkAllAsRead,
    onClose
}) => {

  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = "h-5 w-5 mr-2 flex-shrink-0";
    switch (type) {
      case NotificationType.INFO: return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
      case NotificationType.SUCCESS: return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case NotificationType.WARNING: return <WarningIcon className={`${iconClass} text-yellow-500`} />;
      case NotificationType.ERROR: return <ErrorIcon className={`${iconClass} text-red-500`} />;
      case NotificationType.TASK_ASSIGNED:
      case NotificationType.TASK_UPDATED:
      case NotificationType.TASK_COMPLETED:
        return <ClipboardDocumentListIcon className={`${iconClass} text-purple-500`} />;
      case NotificationType.LEAD_ASSIGNED:
      case NotificationType.LEAD_UPDATED:
        return <UserPlusIcon className={`${iconClass} text-sky-500`} />;
      case NotificationType.DEAL_ASSIGNED:
      case NotificationType.DEAL_UPDATED:
        return <FunnelIcon className={`${iconClass} text-indigo-500`} />;
      default: return <BellAlertIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md shadow-xl z-50 ring-1 ring-black ring-opacity-5">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
        {unreadCount > 0 && (
            <button 
                onClick={onMarkAllAsRead}
                className="text-xs text-primary hover:text-primary-dark font-medium"
            >
                Mark all as read
            </button>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6 px-3">You have no new notifications.</p>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => onNotificationClick(notification)}
              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                    {notification.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${!notification.isRead ? 'text-gray-600' : 'text-gray-500'}`}>
                    {notification.message}
                  </p>
                  <p className={`text-xs mt-1 ${!notification.isRead ? 'text-blue-600' : 'text-gray-400'}`}>
                    {formatRelativeTime(notification.timestamp)}
                    {notification.actor && notification.actor.id !== notification.userId && (
                        <span className="italic"> by {notification.actor.name}</span>
                    )}
                  </p>
                </div>
                {!notification.isRead && (
                    <div className="ml-2 mt-1 flex-shrink-0 h-2 w-2 bg-primary rounded-full" aria-label="Unread"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-2 text-center border-t border-gray-200">
        <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700">
          Close Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
