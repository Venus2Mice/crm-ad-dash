import React, { useState, useMemo, useEffect } from 'react';
import { EntityActivityLog, User, ReportPeriod, EntityActivityType } from '../types';
import { REPORT_PERIOD_OPTIONS, ENTITY_TYPE_FILTER_OPTIONS, ACTIVITY_TYPE_FILTER_OPTIONS } from '../constants';
import { MagnifyingGlassIcon, ActivityLogTypeIcon } from '../components/ui/Icon';
import { getDateRangeForPeriod } from '../services/reportUtils';
import { formatRelativeTime } from '../utils/dateUtils';
import { exportToCsv } from '../services/csvExporter';
import Pagination, { ITEMS_PER_PAGE_OPTIONS } from '../components/ui/Pagination'; // Import Pagination

interface ActivityLogPageProps {
  activityLogs: EntityActivityLog[];
  users: User[];
}

const ActivityLogPage: React.FC<ActivityLogPageProps> = ({ activityLogs, users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedEntityType, setSelectedEntityType] = useState<EntityActivityLog['entityType'] | ''>('');
  const [selectedActivityType, setSelectedActivityType] = useState<EntityActivityType | ''>('');
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('all_time');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[1]); // Default to 25 for logs

  const userOptions = useMemo(() => {
    return [{ value: '', label: 'All Users' }, ...users.map(user => ({ value: user.id, label: user.name }))];
  }, [users]);

  useEffect(() => {
    setCurrentPage(1); // Reset page when any filter changes
  }, [searchTerm, selectedUser, selectedEntityType, selectedActivityType, selectedPeriod]);

  const filteredLogs = useMemo(() => {
    const { startDate, endDate } = getDateRangeForPeriod(selectedPeriod);
    
    return activityLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      const matchesSearch = !searchTerm || 
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details?.fileName && log.details.fileName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.details?.targetUserName && log.details.targetUserName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesUser = !selectedUser || log.userId === selectedUser;
      const matchesEntityType = !selectedEntityType || log.entityType === selectedEntityType;
      const matchesActivityType = !selectedActivityType || log.activityType === selectedActivityType;
      const isAfterStartDate = startDate ? logDate >= startDate : true;
      const isBeforeEndDate = endDate ? logDate <= endDate : true;

      return matchesSearch && matchesUser && matchesEntityType && matchesActivityType && isAfterStartDate && isBeforeEndDate;
    }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Ensure sorted for consistent pagination
  }, [activityLogs, searchTerm, selectedUser, selectedEntityType, selectedActivityType, selectedPeriod]);

  // Paginated logs
  const totalLogs = filteredLogs.length;
  const totalPages = Math.ceil(totalLogs / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);


  const resetFilters = () => {
    setSearchTerm('');
    setSelectedUser('');
    setSelectedEntityType('');
    setSelectedActivityType('');
    setSelectedPeriod('all_time');
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) {
        alert("No data available to export with the current filters.");
        return;
    }
    const dataToExport = filteredLogs.map(log => ({
        Timestamp: new Date(log.timestamp).toLocaleString(),
        User: log.userName,
        'Activity Type': log.activityType,
        Description: log.description,
        'Entity Type': log.entityType,
        'Entity ID': log.entityId,
        'Details': log.details ? JSON.stringify(log.details) : ''
    }));
    exportToCsv(`activity_log_export_${new Date().toISOString().split('T')[0]}`, dataToExport);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const commonSelectStyle = "block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm h-10";
  const commonLabelStyle = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-dark-text">System Activity Log</h2>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="searchTermLogs" className={commonLabelStyle}>Search Logs</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="searchTermLogs"
                placeholder="Search description, user, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm h-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="userFilterLogs" className={commonLabelStyle}>User</label>
            <select id="userFilterLogs" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className={commonSelectStyle}>
              {userOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="entityTypeFilterLogs" className={commonLabelStyle}>Entity Type</label>
            <select id="entityTypeFilterLogs" value={selectedEntityType} onChange={(e) => setSelectedEntityType(e.target.value as EntityActivityLog['entityType'] | '')} className={commonSelectStyle}>
              {ENTITY_TYPE_FILTER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="activityTypeFilterLogs" className={commonLabelStyle}>Activity Type</label>
            <select id="activityTypeFilterLogs" value={selectedActivityType} onChange={(e) => setSelectedActivityType(e.target.value as EntityActivityType | '')} className={commonSelectStyle}>
              {ACTIVITY_TYPE_FILTER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="periodFilterLogs" className={commonLabelStyle}>Date Period</label>
            <select id="periodFilterLogs" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as ReportPeriod)} className={commonSelectStyle}>
              {REPORT_PERIOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          
          <div className="flex space-x-2 items-end h-10">
            <button
              onClick={resetFilters}
              className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-150 h-full"
            >
              Reset
            </button>
            <button
              onClick={handleExport}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-150 h-full"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-0 sm:p-6 rounded-lg shadow">
        <div className="overflow-x-auto">
          {paginatedLogs.length === 0 ? (
            <p className="text-medium-text text-center py-8 px-4">
              No activity logs match your current filters.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Entity Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Entity Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500" title={new Date(log.timestamp).toLocaleString()}>
                      {formatRelativeTime(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-8 w-8 rounded-full mr-2" 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(log.userName)}&background=random&color=fff&size=40`} 
                          alt={log.userName} 
                        />
                        <span className="text-sm font-medium text-dark-text">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-normal text-sm text-gray-900 max-w-md">
                      <div className="flex items-start">
                        <ActivityLogTypeIcon activityType={log.activityType} className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="break-words">{log.description}</span>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                          <div className="mt-1 text-xs text-gray-500 italic pl-6">
                              {log.details.field && `Field: ${log.details.field}; `}
                              {log.details.oldValue !== undefined && `Old: ${String(log.details.oldValue)}; `}
                              {log.details.newValue !== undefined && `New: ${String(log.details.newValue)}; `}
                              {log.details.taskTitle && `Task: ${log.details.taskTitle}; `}
                              {log.details.fileName && `File: ${log.details.fileName}; `}
                              {log.details.targetUserName && `Target: ${log.details.targetUserName}; `}
                          </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{log.entityType}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {log.entityId}
                      {log.details?.parentEntityName && ` (${log.details.parentEntityName})`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
         {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={totalLogs}
            entityName="log entries"
          />
        )}
      </div>
    </div>
  );
};

export default ActivityLogPage;
