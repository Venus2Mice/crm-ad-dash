
import React, { useState, useMemo, useEffect } from 'react';
import { Deal, ReportPeriod, ReportFilterOption } from '../../types';
import { REPORT_PERIOD_OPTIONS, getSalesRepresentativeOptions, ALL_SALES_REPS_OPTION } from '../../constants';
import { getDateRangeForPeriod, formatCurrency, groupDealsByMonth, groupDealsByOwner } from '../../services/reportUtils';
import { exportToCsv } from '../../services/csvExporter';
import ChartComponent from '../dashboard/ChartComponent';
import ReportSection from './ReportSection';
import { ChartType } from '../../types';

interface SalesPerformanceReportProps {
  deals: Deal[];
}

const SalesPerformanceReport: React.FC<SalesPerformanceReportProps> = ({ deals }) => {
  const [period, setPeriod] = useState<ReportPeriod>('all_time');
  const [selectedRep, setSelectedRep] = useState<string>(ALL_SALES_REPS_OPTION.value);

  const salesRepOptions = useMemo(() => getSalesRepresentativeOptions(deals), [deals]);

  const filteredDeals = useMemo(() => {
    const { startDate, endDate } = getDateRangeForPeriod(period);
    return deals.filter(deal => {
      const dealDate = new Date(deal.closeDate);
      const isAfterStartDate = startDate ? dealDate >= startDate : true;
      const isBeforeEndDate = endDate ? dealDate <= endDate : true;
      const matchesRep = selectedRep === ALL_SALES_REPS_OPTION.value || deal.owner === selectedRep;
      return deal.stage === 'Closed Won' && isAfterStartDate && isBeforeEndDate && matchesRep;
    });
  }, [deals, period, selectedRep]);

  const totalRevenue = useMemo(() => {
    return filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  }, [filteredDeals]);

  const [chartData, setChartData] = useState<{ name: string, value: number }[]>([]);
  const [chartTitle, setChartTitle] = useState<string>('Sales Over Time');

  useEffect(() => {
    if (selectedRep !== ALL_SALES_REPS_OPTION.value) {
        setChartData(groupDealsByMonth(filteredDeals));
        setChartTitle(`Monthly Sales for ${selectedRep}`);
    } else {
        setChartData(groupDealsByMonth(filteredDeals));
        setChartTitle('Monthly Sales (All Reps)');
    }
    // Alternative: group by owner if 'All Time' and 'All Reps'
    // if (period === 'all_time' && selectedRep === ALL_SALES_REPS_OPTION.value) {
    //   setChartData(groupDealsByOwner(filteredDeals));
    //   setChartTitle('Total Sales by Representative');
    // }
  }, [filteredDeals, selectedRep, period]);


  const handleExport = () => {
    if (filteredDeals.length === 0) {
      alert("No data to export.");
      return;
    }
    const dataToExport = filteredDeals.map(d => ({
        'Deal Name': d.dealName,
        'Owner': d.owner,
        'Value': d.value,
        'Currency': d.currency,
        'Close Date': d.closeDate,
        'Stage': d.stage,
    }));
    exportToCsv('sales_performance_report', dataToExport);
  };

  return (
    <div className="space-y-6">
      <ReportSection title="Sales Performance Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="periodFilter" className="block text-sm font-medium text-gray-700">Period</label>
            <select
              id="periodFilter"
              value={period}
              onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              {REPORT_PERIOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="repFilter" className="block text-sm font-medium text-gray-700">Sales Representative</label>
            <select
              id="repFilter"
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              {salesRepOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
           <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-150 h-10"
              aria-label="Export Sales Performance Data to CSV"
            >
              Export to CSV
            </button>
        </div>
      </ReportSection>

      <ReportSection title="Sales Summary">
        <p className="text-2xl font-semibold text-primary">{formatCurrency(totalRevenue)}</p>
        <p className="text-medium-text">Total revenue from {filteredDeals.length} won deal(s) for the selected criteria.</p>
      </ReportSection>
      
      {chartData.length > 0 && (
         <ReportSection title={chartTitle}>
            <ChartComponent
                data={chartData}
                type={ChartType.BAR}
                xAxisKey="name"
                dataKeys={[{ key: 'value', color: '#3B82F6' }]}
                height={350}
            />
        </ReportSection>
      )}


      <ReportSection title="Deals List">
        {filteredDeals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeals.map(deal => (
                  <tr key={deal.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{deal.dealName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{deal.owner}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{formatCurrency(deal.value, deal.currency)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{deal.closeDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-medium-text text-center py-4">No deals match the selected criteria.</p>
        )}
      </ReportSection>
    </div>
  );
};

export default SalesPerformanceReport;
