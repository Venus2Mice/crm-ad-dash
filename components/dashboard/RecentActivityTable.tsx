
import React from 'react';
import { EntityActivityLog } from '../../types';
import { ActivityLogTypeIcon } from '../ui/Icon';
import { formatRelativeTime } from '../../utils/dateUtils'; // Assuming this utility exists and works

interface RecentActivityTableProps {
  activities: EntityActivityLog[];
}

const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return <p className="text-medium-text">No recent activities to display.</p>;
  }

  // Display a limited number of recent activities, e.g., the latest 10
  const displayedActivities = activities.slice(0, 10);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity Type</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayedActivities.map((activity) => (
            <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    {/* Construct avatar URL dynamically */}
                    <img 
                        className="h-8 w-8 rounded-full" 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activity.userName)}&background=random&color=fff&size=40`} 
                        alt={activity.userName} 
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-dark-text">{activity.userName}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-normal text-sm text-gray-900 max-w-xs">
                <div className="flex items-start">
                    <ActivityLogTypeIcon activityType={activity.activityType} className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="break-words">{activity.description}</span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{activity.entityType}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatRelativeTime(activity.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
       {activities.length > 10 && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Showing latest 10 activities. More details in entity-specific logs.
        </p>
      )}
    </div>
  );
};

export default RecentActivityTable;
