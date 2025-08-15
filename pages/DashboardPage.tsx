
import React from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../components/dashboard/StatsCard';
import ChartComponent from '../components/dashboard/ChartComponent';
import RecentActivityTable from '../components/dashboard/RecentActivityTable';
import SmartInsights from '../components/dashboard/SmartInsights';
import MyTasksWidget from '../components/dashboard/MyTasksWidget'; // Import MyTasksWidget
import { StatsCardData, ChartType, Lead, Customer, Deal, Task, ChartDataItem, EntityActivityLog, User } from '../types'; // Added User
import { CurrencyDollarIcon, UserPlusIcon, BriefcaseIcon, ChartBarIcon } from '../components/ui/Icon';

interface DashboardPageProps {
  leads: Lead[];
  customers: Customer[];
  deals: Deal[];
  tasks: Task[];
  activityLogs: EntityActivityLog[];
  currentUser: User | null; // Added currentUser prop
}

const DashboardPage: React.FC<DashboardPageProps> = ({ leads, customers, deals, tasks, activityLogs, currentUser }) => {
  // Calculate dynamic stats based on props
  const totalRevenue = deals
    .filter(d => d.stage === 'Closed Won')
    .reduce((sum, d) => sum + d.value, 0);
  
  const newLeadsCount = leads.filter(l => l.status === 'New' || new Date(l.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length; // Example: New leads in last 30 days
  
  const dealsClosedCount = deals.filter(d => d.stage === 'Closed Won').length;

  const conversionRate = leads.length > 0 
    ? (deals.filter(d => d.stage === 'Closed Won' && leads.find(l => l.id === d.leadId)).length / leads.length) * 100 
    : 0;

  const statsCardsData: StatsCardData[] = [
    { id: 'revenue', title: 'Total Revenue (Won Deals)', value: `$${totalRevenue.toLocaleString()}`, icon: <CurrencyDollarIcon className="h-8 w-8 text-green-500" />}, // Trend can be added later
    { id: 'leads', title: 'New Leads', value: newLeadsCount.toLocaleString(), icon: <UserPlusIcon className="h-8 w-8 text-blue-500" /> },
    { id: 'deals', title: 'Deals Closed', value: dealsClosedCount.toLocaleString(), icon: <BriefcaseIcon className="h-8 w-8 text-purple-500" /> },
    { id: 'conversion', title: 'Lead to Won Deal Rate', value: `${conversionRate.toFixed(1)}%`, icon: <ChartBarIcon className="h-8 w-8 text-yellow-500" /> },
  ];

  // Prepare data for charts using dynamic data
  const salesDataForChart: ChartDataItem[] = deals
    .filter(d => d.stage === 'Closed Won' && d.closeDate)
    .sort((a,b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime()) // Sort by date
    .reduce((acc, deal) => {
        const monthYear = new Date(deal.closeDate).toLocaleString('default', { month: 'short', year: 'numeric' });
        const existingEntry = acc.find(item => item.name === monthYear);
        if (existingEntry) {
            existingEntry.value += deal.value;
        } else {
            acc.push({ name: monthYear, value: deal.value });
        }
        return acc;
    }, [] as ChartDataItem[]);


  const leadSourcesDataForChart: ChartDataItem[] = leads
    .reduce((acc, lead) => {
        const source = lead.source || 'Unknown';
        const existingEntry = acc.find(item => item.name === source);
        if (existingEntry) {
            existingEntry.value += 1;
        } else {
            acc.push({ name: source, value: 1 });
        }
        return acc;
    }, [] as ChartDataItem[]);


  // Data for SmartInsights - pass a structured subset of the dynamic data
  const crmDataForInsights = {
    salesData: salesDataForChart.slice(-6), // Example: last 6 months of sales for insights
    leadSources: leadSourcesDataForChart,
    dealStats: {
        totalDeals: deals.length,
        openDeals: deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').length,
        averageDealValue: deals.length > 0 ? deals.reduce((sum,d) => sum + d.value, 0) / deals.length : 0,
    },
    // Add more summarized data as needed for effective insights
  };


  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCardsData.map(card => (
          <StatsCard key={card.id} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Sales Over Time (Won Deals)</h3>
          {salesDataForChart.length > 0 ? (
            <ChartComponent
                data={salesDataForChart}
                type={ChartType.LINE}
                xAxisKey="name"
                dataKeys={[{ key: 'value', color: '#3B82F6' }]}
                height={300}
            />
          ) : (<p className="text-medium-text text-center py-10">No sales data available.</p>)}
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Lead Sources</h3>
          {leadSourcesDataForChart.length > 0 ? (
            <ChartComponent
                data={leadSourcesDataForChart}
                type={ChartType.PIE}
                dataKeys={[{ key: 'value', color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#78716c', '#facc15'] }]}
                height={300}
            />
          ) : (<p className="text-medium-text text-center py-10">No lead source data available.</p>)}
        </div>
      </div>
      
      {/* Recent Activity, My Tasks, and Smart Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Recent Activity</h3>
          <RecentActivityTable activities={activityLogs} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          {/* MyTasksWidget will take up one column */}
          {currentUser && <MyTasksWidget tasks={tasks} currentUser={currentUser} />}
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <SmartInsights crmData={crmDataForInsights} />
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
