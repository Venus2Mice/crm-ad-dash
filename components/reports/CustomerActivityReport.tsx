
import React, { useState, useMemo } from 'react';
import { Customer, Deal, Task, ReportFilterOption } from '../../types'; // Assuming Task type exists
import ReportSection from './ReportSection';
import { formatCurrency } from '../../services/reportUtils';
import { getAccountManagerOptions, ALL_ACCOUNT_MANAGERS_OPTION } from '../../constants';

interface CustomerActivityReportProps {
  customers: Customer[];
  deals: Deal[]; // Pass deals to potentially link activity
  tasks: Task[]; // Pass tasks for future enhancements
}

const CustomerActivityReport: React.FC<CustomerActivityReportProps> = ({ customers, deals, tasks }) => {
  const [selectedManager, setSelectedManager] = useState<string>(ALL_ACCOUNT_MANAGERS_OPTION.value);
  const accountManagerOptions = useMemo(() => getAccountManagerOptions(customers), [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesManager = selectedManager === ALL_ACCOUNT_MANAGERS_OPTION.value || customer.accountManager === selectedManager;
      return matchesManager;
    });
  }, [customers, selectedManager]);

  // Example enrichment: Count deals per customer (can be expanded)
  const customerDataWithStats = useMemo(() => {
    return filteredCustomers.map(customer => {
      const customerDeals = deals.filter(deal => deal.customerId === customer.id);
      const wonDealsCount = customerDeals.filter(deal => deal.stage === 'Closed Won').length;
      // const openTasksCount = tasks.filter(task => task.relatedTo?.type === 'Customer' && task.relatedTo?.id === customer.id && task.status !== 'Completed').length;
      return {
        ...customer,
        wonDealsCount,
        // openTasksCount,
      };
    });
  }, [filteredCustomers, deals, tasks]);


  return (
    <div className="space-y-6">
        <ReportSection title="Customer Activity Filters">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="managerFilter" className="block text-sm font-medium text-gray-700">Account Manager</label>
                    <select
                    id="managerFilter"
                    value={selectedManager}
                    onChange={(e) => setSelectedManager(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    >
                    {accountManagerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>
      </ReportSection>

      <ReportSection title="Customer Summary">
        {customerDataWithStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Manager</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Purchase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Won Deals</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerDataWithStats.map(customer => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{customer.company || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{customer.totalRevenue ? formatCurrency(customer.totalRevenue) : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{customer.accountManager || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{customer.lastPurchaseDate || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{customer.wonDealsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-medium-text text-center py-4">No customers match the selected criteria or no customer data available.</p>
        )}
      </ReportSection>
    </div>
  );
};

export default CustomerActivityReport;
